from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from backend.database import get_db_connection
from backend.sales.email_service import send_end_of_day_report

router = APIRouter(prefix="/sales", tags=["Sales Management"])

class SaleItemSchema(BaseModel):
    product_name: str
    quantity: int
    price: float

class SaleCreateSchema(BaseModel):
    cashier_id: int
    discount: float
    items: List[SaleItemSchema]

# =========================================================================
# 1. VUTA STATS NA HISTORIA YOTE YA DASHBOARD (ANALYTICS ENGINE)
# =========================================================================
@router.get("/analytics")
def get_advanced_dashboard_analytics():
    """Inavuta takwimu zote za duka kutoka MySQL na kuzigeuza kuwa Dictionary sahihi."""
    conn = get_db_connection()
    # LAZIMA: Tunaiambia MySQL itengeneze Dictionary ili kuondoa kosa la tuple indices
    cursor = conn.cursor(dictionary=True)
    try:
        # A. Hesabu za Mauzo ya Leo
        cursor.execute("SELECT COALESCE(SUM(final_amount), 0.0) as sales_today FROM sales;")
        sales_data = cursor.fetchone()
        
        # B. Hesabu za Matumizi yote
        cursor.execute("SELECT COALESCE(SUM(amount), 0.0) as expenses_total FROM expenses;")
        expenses_data = cursor.fetchone()
        
        today_sales = sales_data["sales_today"]
        total_expenses = expenses_data["expenses_total"]
        net_profit = max(0.0, today_sales - total_expenses)
        
        # C. Jumla ya aina za bidhaa ghalani
        cursor.execute("SELECT COUNT(*) as total_prods FROM products;")
        prod_data = cursor.fetchone()
        
        # D. Idadi ya bidhaa zilizopo chini ya threshold
        cursor.execute("SELECT COUNT(*) as low_stock FROM products WHERE stock_quantity <= low_stock_threshold;")
        low_stock_data = cursor.fetchone()
        
        # E. Miamala 5 ya hivi karibuni
        cursor.execute("SELECT id, final_amount, discount, sale_date FROM sales ORDER BY id DESC LIMIT 5;")
        recent_sales = cursor.fetchall()
        
        return {
            "metrics": {
                "today_sales": today_sales,
                "today_profit": net_profit,
                "total_products": prod_data["total_prods"] if 'total_prods' in prod_data else prod_data.get("COUNT(*)", 0),
                "low_stock_alerts": low_stock_data["low_stock"] if 'low_stock' in low_stock_data else low_stock_data.get("COUNT(*)", 0)
            },
            "recent_transactions": [dict(row) for row in recent_sales],
            "top_products": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 2. RUN POS CHECKOUT (KATAKATA STOKI LIVE NA REKODI RISITI)
# =========================================================================
@router.post("/checkout")
def process_pos_checkout_transaction(payload: SaleCreateSchema):
    """Inapokea mauzo kutoka POS, inapunguza stoki MySQL, na kuhifadhi risiti."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # A. Piga hesabu ya jumla ya muamala kwanza
        subtotal = sum(item.quantity * item.price for item in payload.items)
        final_amount = max(0.0, subtotal - payload.discount)

        # B. Rekodi muamala mkuu kwenye jedwali la sales
        cursor.execute("""
            INSERT INTO sales (cashier_id, discount, final_amount)
            VALUES (%s, %s, %s);
        """, (payload.cashier_id, payload.discount, final_amount))
        sale_id = cursor.lastrowid

        # C. Rekodi kila bidhaa iliyonunuliwa na upunguze stoki yake live ghalani
        for item in payload.items:
            # Tafuta ID ya bidhaa kwa kutumia jina lake
            cursor.execute("SELECT id, stock_quantity FROM products WHERE name = %s;", (item.product_name,))
            product = cursor.fetchone()
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Bidhaa '{item.product_name}' haipo ghalani!")

            if product["stock_quantity"] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Mzigo wa '{item.product_name}' hautoshi! Umebaki: {product['stock_quantity']}")

            # Punguza idadi ya bidhaa ghalani
            new_stock = product["stock_quantity"] - item.quantity
            cursor.execute("UPDATE products SET stock_quantity = %s WHERE id = %s;", (new_stock, product["id"]))

            # Ingiza kwenye sale_items
            cursor.execute("""
                INSERT INTO sale_items (sale_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s);
            """, (sale_id, product["id"], item.quantity, item.price))

        conn.commit()
        return {"success": True, "sale_id": sale_id, "total_paid": final_amount}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 3. ENDPOINT YA FUNGA DUKA (TRIGGER EMAIL REPORT)
# =========================================================================
@router.post("/close-shop")
def close_shop_and_trigger_email_report(username: str, background_tasks: BackgroundTasks):
    """Inakagua email ya Admin aliyebofya kitufe kwenye MySQL, na kumtumia ripoti."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT email FROM users WHERE username = %s;", (username,))
        user_record = cursor.fetchone()
        receiver_email = user_record["email"] if user_record else "inocentcostantino8@gmail.com"

        cursor.execute("SELECT COALESCE(SUM(final_amount), 0.0) as sales_today FROM sales;")
        sales_total = cursor.fetchone()["sales_today"]
        
        cursor.execute("SELECT COALESCE(SUM(amount), 0.0) as expenses_total FROM expenses;")
        expenses_total = cursor.fetchone()["expenses_total"]
        
        profit_total = max(0.0, sales_total - expenses_total)
        
        cursor.execute("SELECT COUNT(*) as low_stock FROM products WHERE stock_quantity <= low_stock_threshold;")
        low_stock_data = cursor.fetchone()
        low_stock_count = low_stock_data["low_stock"] if 'low_stock' in low_stock_data else low_stock_data.get("COUNT(*)", 0)

        background_tasks.add_task(
            send_end_of_day_report, 
            sales_total, 
            profit_total, 
            expenses_total, 
            low_stock_count,
            receiver_email
        )

        return {"success": True, "message": f"Duka limefungwa rasmi! Angalia ripoti yako: {receiver_email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
