from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class PurchaseRequest(BaseModel):
    """Request schema for creating a purchase"""
    payment_method: str = Field(default="stripe", description="Payment method")
    
    @validator('payment_method')
    def validate_payment_method(cls, v):
        allowed_methods = ['stripe', 'test']
        if v not in allowed_methods:
            raise ValueError(f'Payment method must be one of: {allowed_methods}')
        return v

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
    product_description: Optional[str]
    product_price: float
    product_category: str
    product_file_type: Optional[str]
    product_image_url: Optional[str]
    
    class Config:
        from_attributes = True

class PurchaseStatsResponse(BaseModel):
    total_purchases: int
    total_spent: float
    categories: dict = Field(..., description="Purchase count by category")
    recent_purchases: int = Field(..., description="Purchases in last 30 days")
