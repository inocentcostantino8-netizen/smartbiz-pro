import os
import mysql.connector
from fastapi import HTTPException

# =========================================================================
# CENTRAL MYSQL CONFIGURATIONS (UNIVERSAL DRIVER LAYER)
# =========================================================================
# Mfumo sasa hivi utasoma Environment Variables za Render, na usipozipata utatumia localhost kama fallback (kompyuta yako)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME", "smartbiz_db")

def get_db_connection():
    """Tengeneza daraja thabiti na PostgreSQL/MySQL linalokwenda moja kwa moja kwenye database yetu."""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME  # <-- Inasoma jina la database kiotomatiki
        )
        return connection
    except Exception as e:
        # Kama database bado haijatengenezwa kabisa (Kwenye startup ya kwanza), tunaruhusu fallback ya raw connection
        try:
            connection = mysql.connector.connect(
                host=DB_HOST, user=DB_USER, password=DB_PASSWORD, port=DB_PORT
            )
            return connection
        except Exception:
            print("❌ [DATABASE ERROR]: Imeshindikana kuunganisha na MySQL Server:", e)
            raise e

def initialize_database():
    """Inazalisha hifadhidata ya smartbiz_db na majedwali yote 8 ndani ya MySQL."""
    try:
        raw_conn = get_db_connection()
        raw_cursor = raw_conn.cursor()
        
        # Unda na utumie database kuu
        raw_cursor.execute("CREATE DATABASE IF NOT EXISTS smartbiz_db;")
        raw_cursor.execute("USE smartbiz_db;")
        
        print("🐬 [MYSQL ENGINE]: Hifadhidata ya 'smartbiz_db' imethibitishwa...")

        # 1. Roles Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT
        );
        """)

        # 2. Users Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
        );
        """)

        # 3. Products Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            sku VARCHAR(100) UNIQUE NOT NULL,
            buying_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            stock_quantity INT NOT NULL,
            low_stock_threshold INT DEFAULT 10,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 4. Sales Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cashier_id INT,
            discount REAL DEFAULT 0.0,
            final_amount REAL NOT NULL,
            sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 5. Sale Items Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS sale_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sale_id INT,
            product_id INT,
            quantity INT NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        );
        """)

        # 6. Expenses Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(100) NOT NULL,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            recorded_by VARCHAR(100) DEFAULT 'Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 7. Purchase Orders Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            supplier_name VARCHAR(150) DEFAULT 'Msambazaji Mkuu',
            quantity_to_order INT NOT NULL,
            estimated_cost REAL NOT NULL,
            status VARCHAR(50) DEFAULT 'Inasubiri Kuidhinishwa',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );
        """)

        # 8. Customers Table
        raw_cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            phone VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(150),
            debt_amount REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 9. INJECT ROLES AND ADMIN DEFAULT RECORD
        # Sasa tunatumia dictionary property ya kiasili kwenye cursor kuvuta idadi
        dict_cursor = raw_conn.cursor(dictionary=True)
        dict_cursor.execute("SELECT COUNT(*) as total FROM roles;")
        row_count = dict_cursor.fetchone()

        if row_count and row_count['total'] == 0:
            dict_cursor.execute("INSERT INTO roles (id, name, description) VALUES (1, 'Administrator', 'Mamlaka Kamili'), (2, 'Manager', 'Usimamizi wa Stoki'), (3, 'Cashier', 'Uuzaji Tu POS');")
            
            from backend.auth.security import get_password_hash
            hashed = get_password_hash("admin123")
            dict_cursor.execute("""
                INSERT INTO users (username, email, password_hash, role_id) 
                VALUES ('INOCENTCOSTANTINO8', 'inocentcostantino8@gmail.com', %s, 1);
            """, (hashed,))
            
        raw_conn.commit()
        print("🐬 [MYSQL LIVE]: Majedwali yote 8 na akaunti yako ya Inocent zimeundwa rasmi kwenye MySQL!")
        
        raw_cursor.close()
        dict_cursor.close()
        raw_conn.close()
        
    except Exception as e:
        print("❌ [INITIALIZATION ERROR]: Imeshindikana kuandaa majedwali ya MySQL:", e)
