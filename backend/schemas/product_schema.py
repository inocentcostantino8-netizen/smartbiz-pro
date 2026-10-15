from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProductBase(BaseModel):
    name: str
    sku: str
    buying_price: float
    selling_price: float
    stock_quantity: int
    low_stock_threshold: Optional[int] = 10

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
