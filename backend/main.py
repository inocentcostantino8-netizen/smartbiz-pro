import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import initialize_database
from backend.customers.router import router as customers_router

# --- BADILISHA HAPA: Kuingiza kutoka kwenye faili la router moja kwa moja ---
from backend.auth.router import router as auth_router
from backend.products.router import router as products_router
from backend.sales.router import router as sales_router
from backend.expenses.router import router as expenses_router

app = FastAPI(
    title="SmartBiz - Business Management System API",
    version="1.0.0"
)

# --- FUNGUA CORS KWA ASILIMIA 100 ILI KIVINJARI KISIZUIE DATA ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    initialize_database()

# --- KUUNGANISHA ROUTERS MOJA KWA MOJA KWENYE FASTAPI ---
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(sales_router)

@app.get("/status")
def system_health_status():
    return {"status": "online", "message": "SmartBiz Engine works fine!"}

app.include_router(expenses_router)    

app.include_router(customers_router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
