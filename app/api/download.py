from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.purchase import Purchase
from app.services.storage_service import storage_service

router = APIRouter()

@router.get("/{product_id}")
def download_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Requires login + purchase check"""
    # Check if user has purchased this product
    purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.product_id == product_id
    ).first()
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must purchase this product before downloading"
        )
    
    # Get product details
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Generate signed URL (valid for 60 seconds)
    signed_url = storage_service.get_signed_url(product.file_url, expires_in=60)
    
    return {
        "download_url": signed_url,
        "expires_in": 60,
        "product_title": product.title
    }
