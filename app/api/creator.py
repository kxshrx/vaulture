from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.security import require_creator
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import create_product, get_creator_products
from app.services.analytics import get_creator_stats

router = APIRouter()

@router.post("/upload", response_model=ProductResponse)
def upload_product(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_creator)
):
    """Auth: require_creator() - Upload file and metadata"""
    product_data = ProductCreate(title=title, description=description, price=price)
    product = create_product(db, product_data, file, current_user.id)
    return product

@router.get("/products", response_model=List[ProductResponse])
def get_my_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_creator)
):
    """List your own uploaded products"""
    return get_creator_products(db, current_user.id)

@router.get("/stats")
def get_creator_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_creator)
):
    """Total sales, earnings, per-product breakdown"""
    return get_creator_stats(db, current_user.id)
