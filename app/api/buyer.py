from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.product import ProductListResponse
from app.services.product_service import get_all_products

router = APIRouter()

@router.get("/products", response_model=List[ProductListResponse])
def get_products(db: Session = Depends(get_db)):
    """Public list of all products"""
    return get_all_products(db)
