from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.security import require_creator
from app.models.user import User
from app.models.product import ProductCategory
from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import create_product, get_creator_products
from app.services.analytics import get_creator_stats

router = APIRouter()

@router.post("/upload", response_model=ProductResponse)
def upload_product(
    title: str = Form(..., min_length=3, max_length=200),
    description: Optional[str] = Form(None),
    price: float = Form(..., gt=0, le=10000),
    category: ProductCategory = Form(default=ProductCategory.OTHER),
    tags: Optional[str] = Form(None),
    file: UploadFile = File(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_creator)
):
    """
    🎉 Upload ANY digital content with complete freedom!
    
    No file type restrictions - upload what you create:
    - Documents, images, audio, video, archives
    - Design files, code, fonts, e-books, games  
    - Literally any digital content you've made!
    """
    
    # Validate file upload (only size and basic security checks)
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Create product data
    product_data = ProductCreate(
        title=title,
        description=description,
        price=price,
        category=category,
        tags=tags,
        creator_name=current_user.display_name or current_user.email  # Use display name if available, fallback to email
    )
    
    # Create product with file uploads (no type restrictions!)
    product = create_product(db, product_data, file, current_user.id, image)
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
