from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.purchase import Purchase
from app.schemas.purchase import PurchaseResponse, PurchaseWithProduct, PurchaseRequest
from app.services.product_service import get_product_by_id
from app.core.stripe import create_checkout_session

router = APIRouter()

@router.post("/{product_id}", response_model=dict)
def purchase_product(
    product_id: int,
    purchase_data: PurchaseRequest = PurchaseRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create purchase (simulated for demo, can be extended with real Stripe integration)"""
    # Validate product ID
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    # Get product
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user is trying to buy their own product
    if product.creator_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own product")
    
    # Check if already purchased
    existing_purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.product_id == product_id
    ).first()
    
    if existing_purchase:
        raise HTTPException(status_code=400, detail="Product already purchased")
    
    # Validate price
    if product.price <= 0:
        raise HTTPException(status_code=400, detail="Product price is invalid")
    
    # For demo purposes, simulate successful payment and create purchase record
    purchase = Purchase(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    return {
        "message": "Purchase successful (simulated)",
        "purchase_id": purchase.id,
        "product_title": product.title,
        "amount_paid": product.price,
        "payment_method": purchase_data.payment_method
    }

@router.get("/mypurchases", response_model=List[PurchaseWithProduct])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Buyer-only: list purchased items with enhanced product details"""
    purchases = db.query(Purchase, Product).join(
        Product, Purchase.product_id == Product.id
    ).filter(
        Purchase.user_id == current_user.id,
        Product.is_active == True
    ).order_by(Purchase.created_at.desc()).all()
    
    return [
        PurchaseWithProduct(
            id=purchase.id,
            product_id=purchase.product_id,
            created_at=purchase.created_at,
            product_title=product.title,
            product_description=product.description,
            product_price=product.price,
            product_category=product.category.value,
            product_file_type=product.file_type,
            product_image_url=product.image_url
        )
        for purchase, product in purchases
    ]
