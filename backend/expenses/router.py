from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from backend.database import get_db_connection

router = APIRouter(prefix="/expenses", tags=["Expense Tracker"])

class ExpenseCreateSchema(BaseModel):
    category: str
    amount: float
    description: str

@router.post("", status_code=201)
def record_new_business_expense(payload: ExpenseCreateSchema):
    """Inasajili muamala wa matumizi mapya moja kwa moja kwenye MySQL."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            INSERT INTO expenses (category, amount, description)
            VALUES (%s, %s, %s);
        """, (payload.category, payload.amount, payload.description))
        conn.commit()
        return {"success": True, "message": "Matumizi yamehifadhiwa kwa usahihi!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("")
def list_all_recorded_expenses():
    """Inapiga hesabu na kuvuta miamala yote ya gharama kwa mpangilio wa MySQL."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COALESCE(SUM(amount), 0.0) as total_amt, COUNT(*) as total_cnt FROM expenses;")
        meta = cursor.fetchone()

        cursor.execute("SELECT id, created_at as date, category, description, amount, recorded_by as user FROM expenses ORDER BY id DESC;")
        rows = cursor.fetchall()
        
        return {
            "total_amount": meta["total_amt"],
            "total_count": meta["total_cnt"],
            "expenses": [dict(row) for row in rows]
        }
    finally:
        cursor.close()
        conn.close()

@router.delete("/{expense_id}")
def delete_specific_expense(expense_id: int):
    """Inafuta rekodi maalum ya matumizi kwenye database yetu."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("DELETE FROM expenses WHERE id = %s;", (expense_id,))
        conn.commit()
        return {"success": True, "message": "Gharama imefutwa!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
