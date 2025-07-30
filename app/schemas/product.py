from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProductBase(BaseModel):
    title: str
    description: str
    price: float

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

class ProductResponse(ProductBase):
    id: int
    creator_id: int
    file_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    creator_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
