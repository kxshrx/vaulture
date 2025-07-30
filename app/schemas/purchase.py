from pydantic import BaseModel
from datetime import datetime

class PurchaseResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PurchaseWithProduct(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    product_title: str
    product_description: str
    product_price: float
    
    class Config:
        from_attributes = True
