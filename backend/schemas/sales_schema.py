from pydantic import BaseModel
from typing import List

class CartItemSchema(BaseModel):
    product_name: str  # Tutatumia jina kutafuta ID au unaweza kubadili baadae kuwa ID
    quantity: int
    price: float

class SaleCreateSchema(BaseModel):
    cashier_id: int = 1  # Kwa sasa tunaweka 1 kama chaguo msingi (Default Admin)
    discount: float = 0.0
    items: List[CartItemSchema]
