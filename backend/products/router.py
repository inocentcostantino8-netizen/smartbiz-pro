from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from backend.database import get_db_connection

router = APIRouter(prefix="/products", tags=["Inventory Management"])

class ProductCreateSchema(BaseModel):
    name: str
    sku: str
    buying_price: float
    selling_price: float
    stock_quantity: int
    low_stock_threshold: Optional[int] = 10

class StockUpdateSchema(BaseModel):
    quantity_to_add: int

@router.post("", status_code=201)
def register_new_product(payload: ProductCreateSchema):
    """Inasajili bidhaa mpya kwenye MySQL na kukagua marudio ya SKU."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM products WHERE sku = %s;", (payload.sku,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Nambari hii ya SKU tayari imeshasajiliwa kwa bidhaa nyingine!")

        cursor.execute("""
            INSERT INTO products (name, sku, buying_price, selling_price, stock_quantity, low_stock_threshold)
            VALUES (%s, %s, %s, %s, %s, %s);
        """, (payload.name, payload.sku, payload.buying_price, payload.selling_price, payload.stock_quantity, payload.low_stock_threshold))
        
        conn.commit()
        return {"success": True, "message": f"Bidhaa [{payload.name}] imesajiliwa kikamilifu!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("")
def list_inventory_products(search: Optional[str] = None):
    """Inavuta bidhaa zote ghalani kulingana na muundo wa MySQL dictionary."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if search:
            query_param = f"%{search}%"
            cursor.execute("SELECT * FROM products WHERE name LIKE %s OR sku LIKE %s ORDER BY name ASC;", (query_param, query_param))
        else:
            cursor.execute("SELECT * FROM products ORDER BY name ASC;")
        
        # Baada ya kuvuta bidhaa, tunazalisha ripoti za kuagiza mzigo kwa zile zilizoisha
        rows = cursor.fetchall()
        for prod in rows:
            if prod["stock_quantity"] <= prod["low_stock_threshold"]:
                # Kagua kama mfumo ulishatengeneza oda ya bidhaa hii mwanzo
                cursor.execute("SELECT id FROM purchase_orders WHERE product_id = %s AND status = 'Inasubiri Kuidhinishwa';", (prod["id"],))
                if not cursor.fetchone():
                    qty_to_order = max(50, (prod["low_stock_threshold"] * 3) - prod["stock_quantity"])
                    cost = qty_to_order * prod["buying_price"]
                    cursor.execute("""
                        INSERT INTO purchase_orders (product_id, quantity_to_order, estimated_cost)
                        VALUES (%s, %s, %s);
                    """, (prod["id"], qty_to_order, cost))
        conn.commit()
        return rows
    finally:
        cursor.close()
        conn.close()

@router.patch("/{product_id}/add-stock")
def add_existing_product_stock(product_id: int, payload: StockUpdateSchema):
    """Inaongeza idadi ya stoki kwenye bidhaa iliyopo tayari kwa kutumia %s placeholders."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, name, stock_quantity FROM products WHERE id = %s;", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Bidhaa haipatikani!")
            
        new_stock = product["stock_quantity"] + payload.quantity_to_add
        cursor.execute("UPDATE products SET stock_quantity = %s WHERE id = %s;", (new_stock, product_id))
        
        # Badilisha oda ya kiotomatiki kuwa 'Imekamilika'
        cursor.execute("UPDATE purchase_orders SET status = 'Imekamilika' WHERE product_id = %s AND status = 'Inasubiri Kuidhinishwa';", (product_id,))
        
        conn.commit()
        return {"success": True, "message": f"Stoki ya {product['name']} imesasishwa!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/automated-orders")
def get_automated_purchase_orders():
    """Inavuta ripoti za oda ambazo bado hazijafanyiwa kazi tu kwenye MySQL."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT po.id, p.name as product_name, p.sku, po.quantity_to_order as quantity, po.estimated_cost as cost, po.status
            FROM purchase_orders po
            JOIN products p ON po.product_id = p.id
            WHERE po.status = 'Inasubiri Kuidhinishwa'
            ORDER BY po.id DESC;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
