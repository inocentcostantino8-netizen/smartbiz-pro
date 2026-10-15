from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from backend.database import get_db_connection

router = APIRouter(prefix="/customers", tags=["Customers Management"])

class CustomerCreateSchema(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    debt_amount: Optional[float] = 0.0

class DebtUpdateSchema(BaseModel):
    amount_to_pay: float

# =========================================================================
# 1. SAJILI MTEJA MPYA (MYSQL PLACEHOLDERS %s)
# =========================================================================
@router.post("", status_code=status.HTTP_201_CREATED)
def register_new_customer(payload: CustomerCreateSchema):
    """Inasajili mteja mpya moja kwa moja kwenye MySQL Database."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            INSERT INTO customers (name, phone, email, debt_amount)
            VALUES (%s, %s, %s, %s);
        """, (payload.name, payload.phone, payload.email, payload.debt_amount))
        conn.commit()
        return {"success": True, "message": "Mteja amesajiliwa kikamilifu!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Nambari ya simu tayari imeshasajiliwa kwa mteja mwingine!")
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 2. VUTA ORODHA YA WATEJA NA HISTORIA YA MADENI (ANALYTICS FIX)
# =========================================================================
@router.get("")
def list_system_customers(search: Optional[str] = None):
    """Inavuta orodha ya wateja na jumla ya madeni kwa muundo wa MySQL dict."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # A. Piga hesabu ya jumla ya madeni ya duka na idadi ya wateja
        cursor.execute("SELECT COALESCE(SUM(debt_amount), 0.0) as total_debts, COUNT(*) as total_cust FROM customers;")
        meta = cursor.fetchone()
        
        # Kushughulikia kugawa data salama kulingana na muundo wa MySQL dictionary output
        total_debts = meta["total_debts"] if meta else 0.0
        total_customers = meta["total_cust"] if meta else 0

        # B. Vuta wateja wote (pamoja na filter ya search box ikitumiwa)
        if search:
            query_param = f"%{search}%"
            cursor.execute("""
                SELECT id, name, phone, email, debt_amount, created_at 
                FROM customers 
                WHERE name LIKE %s OR phone LIKE %s
                ORDER BY name ASC;
            """, (query_param, query_param))
        else:
            cursor.execute("SELECT id, name, phone, email, debt_amount, created_at FROM customers ORDER BY name ASC;")
            
        rows = cursor.fetchall()
        return {
            "total_debts": total_debts,
            "total_customers": total_customers,
            "customers": [dict(row) for row in rows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 3. LIPA DENI LA MTEJA (MYSQL COMPATIBLE)
# =========================================================================
@router.patch("/{customer_id}/pay-debt")
def pay_customer_debt(customer_id: int, payload: DebtUpdateSchema):
    """Inapunguza au kulipa deni la mteja anapokuja kurudisha fedha."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, name, debt_amount FROM customers WHERE id = %s;", (customer_id,))
        customer = cursor.fetchone()
        if not customer:
            raise HTTPException(status_code=404, detail="Mteja haujapatikana!")

        new_debt = max(0.0, customer["debt_amount"] - payload.amount_to_pay)
        cursor.execute("UPDATE customers SET debt_amount = %s WHERE id = %s;", (new_debt, customer_id))
        conn.commit()
        return {"success": True, "message": f"Deni la {customer['name']} limepunguzwa hadi TSH {new_debt}"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
