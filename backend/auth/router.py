from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel # <-- Futa EmailStr hapa
from typing import List, Optional
from backend.database import get_db_connection
from backend.auth.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & HR"])

# =========================================================================
# DATA SCHEMAS FOR VALIDATION (FALLBACK STR TYPE CORES)
# =========================================================================
class UserRegisterSchema(BaseModel):
    username: str
    email: str # <-- Ibadilishe hapa iwe str badala ya EmailStr
    password: str
    role_id: int 

class UserUpdateSchema(BaseModel):
    username: str
    email: str # <-- Ibadilishe hapa iwe str badala ya EmailStr
    role_id: int

class ResetPasswordSchema(BaseModel):
    email: str # <-- Ibadilishe hapa iwe str badala ya EmailStr
    new_password: str


# =========================================================================
# 1. LIVE USER LOGIN ACTION (OAUTH2 AUTHENTICATION)
# =========================================================================
@router.post("/login")
def login_user_endpoint(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticates users against MySQL database tables securely."""
    conn = get_db_connection()
    cursor = conn.cursor() # Returns raw dictionary rows automatically from database.py config
    try:
        # Fetch user details along with their explicit Role Name using SQL JOIN
        cursor.execute("""
            SELECT u.id, u.username, u.email, u.password_hash, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = %s;
        """, (form_data.username,)) # OAuth2 uses 'username' field for email strings
        
        # mysql-connector returns row as dictionary or tuple depending on current footprint
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Barua pepe hii haijasajiliwa ghalani!")

        # Unpack securely depending on driver cursor layout conversion
        user = row if isinstance(row, dict) else {"id": row[0], "username": row[1], "email": row[2], "password_hash": row[3], "role_name": row[4]}

        # Validate password hash using Bcrypt encryption algorithm layers
        if not verify_password(form_data.password, user["password_hash"]):
            raise HTTPException(status_code=400, detail="Nenosiri uliloingiza sio sahihi!")

        # Create localized secure JWT Access Bearer Token tracking parameters
        access_token = create_access_token(data={"sub": user["email"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user["role_name"],
            "username": user["username"]
        }
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 2. REGISTER NEW STAFF ACCOUNT (HR PORTAL CONTROL)
# =========================================================================
@router.post("/register", status_code=201)
def register_new_staff_member(payload: UserRegisterSchema):
    """Registers a new staff member (Cashier/Manager) directly into MySQL."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s;", (payload.username, payload.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Mfanyakazi huyu (Username/Email) tayari ameshasajiliwa!")
            
        hashed_password = get_password_hash(payload.password)
        
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role_id)
            VALUES (%s, %s, %s, %s);
        """, (payload.username, payload.email, hashed_password, payload.role_id))
        
        conn.commit()
        return {"success": True, "message": f"Mfanyakazi [{payload.username}] amesajiliwa kikamilifu!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 3. LIST ALL STAFF ROWS
# =========================================================================
@router.get("/staff")
def list_all_system_staff():
    """Fetches all system users to render inside the HR graphic grid table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT u.id, u.username, u.email, r.name as role_name, u.role_id 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.id ASC;
        """)
        rows = cursor.fetchall()
        
        staff_list = []
        for row in rows:
            user = row if isinstance(row, dict) else {"id": row[0], "username": row[1], "email": row[2], "role_name": row[3], "role_id": row[4]}
            staff_list.append(user)
        return staff_list
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 4. UPDATE SYSTEM STAFF RECORD (EDIT PROFILE)
# =========================================================================
@router.put("/staff/{user_id}")
def update_staff_member(user_id: int, payload: UserUpdateSchema):
    """Updates profile information and emails inside the MySQL table schema."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE id = %s;", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Mfanyakazi huyu hajapatikana!")
            
        cursor.execute("""
            UPDATE users 
            SET username = %s, email = %s, role_id = %s 
            WHERE id = %s;
        """, (payload.username, payload.email, payload.role_id, user_id))
        
        conn.commit()
        return {"success": True, "message": "Taarifa za mfanyakazi zimesasishwa kwa usahihi!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 5. FORGOT PASSWORD ACTION (DATABASE LOCK RESET)
# =========================================================================
@router.patch("/reset-password")
def reset_user_password_endpoint(payload: ResetPasswordSchema):
    """Allows secure user password updates directly onto the MySQL data core."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s;", (payload.email,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Barua pepe hii haijasajiliwa kwenye duka hili!")
            
        new_hash = get_password_hash(payload.new_password)
        
        cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s;", (new_hash, payload.email))
        conn.commit()
        return {"success": True, "message": "Nenosiri jipya limehifadhiwa kwa usalama!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# =========================================================================
# 6. DELETE SYSTEM STAFF MEMBER
# =========================================================================
@router.delete("/staff/{user_id}")
def delete_staff_member(user_id: int):
    """Deletes a system user account entirely from the database environment."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if user_id == 1:
            raise HTTPException(status_code=400, detail="Ulinzi: Huwezi kufuta akaunti kuu ya kwanza ya Administrator!")

        cursor.execute("DELETE FROM users WHERE id = %s;", (user_id,))
        conn.commit()
        return {"success": True, "message": "Akaunti ya mfanyakazi imefutwa kikamilifu!"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()
