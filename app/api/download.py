from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.purchase import Purchase, PaymentStatus
from app.services.storage_service import storage_service

router = APIRouter()

@router.get("/{product_id}")
def download_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download product - requires either purchase or ownership (creator)"""
    # Get product details first
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check user rights: either creator owns the product OR user has purchased it
    is_creator_owner = current_user.is_creator and product.creator_id == current_user.id
    
    if not is_creator_owner:
        # If not the creator, check if user has completed purchase of the product
        purchase = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.product_id == product_id,
            Purchase.payment_status == PaymentStatus.COMPLETED
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must complete the purchase of this product before downloading"
            )
    
    # Generate signed URL (valid for 45 seconds)
    signed_url = storage_service.get_signed_url(product.file_url, expires_in=45)
    
    return {
        "download_url": signed_url,
        "expires_in": 45,
        "product_title": product.title,
        "access_type": "owner" if is_creator_owner else "purchased"
    }
