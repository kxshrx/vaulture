from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core.security import verify_token
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase, PaymentStatus
from backend.services.storage_service import storage_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/access-file")
def access_file(
    product_id: int = Query(..., description="Product ID to access"),
    token: str = Query(..., description="Auth token for same-tab access"),
    db: Session = Depends(get_db)
):
    """
    SIMPLE MASKED FILE ACCESS - Works in same tab with token
    
    URL: /api/access-file?product_id=123&token=xxx
    
    1. Decode token to get user ✅ 
    2. Check if user purchased the product ✅
    3. Generate short-lived Supabase signed URL (10 seconds) ✅  
    4. Redirect to file ✅
    
    Users get normal file access but never see direct Supabase URLs
    """
    
    # STEP 1: Verify token and get user
    try:
        user_id = verify_token(token)
        current_user = db.query(User).filter(User.id == user_id).first()
        if not current_user:
            raise HTTPException(status_code=401, detail="User not found")
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # STEP 2: Get product details
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        logger.warning(f"Product not found: product_id={product_id}, user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Product not found")
    
    # STEP 3: Check if user has access (owner or purchased)
    is_creator_owner = current_user.is_creator and product.creator_id == current_user.id
    
    if not is_creator_owner:
        # Check if user has completed purchase
        purchase = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.product_id == product_id,
            Purchase.payment_status == PaymentStatus.COMPLETED
        ).first()
        
        if not purchase:
            logger.warning(f"Unauthorized access attempt: user_id={current_user.id}, product_id={product_id}")
            raise HTTPException(
                status_code=403,
                detail="You must purchase this product to access the file"
            )
    
    # STEP 4: Generate very short-lived Supabase signed URL (10 seconds only)
    try:
        signed_url = storage_service.get_signed_url(product.file_url, expires_in=10)
        
        # Log successful access
        access_type = "owner" if is_creator_owner else "purchased"
        logger.info(f"File access granted: user_id={current_user.id}, product_id={product_id}, access_type={access_type}")
        
        # STEP 5: Redirect to the actual file
        return RedirectResponse(url=signed_url)
        
    except Exception as e:
        logger.error(f"File access error: user_id={current_user.id}, product_id={product_id}, error={str(e)}")
        raise HTTPException(status_code=500, detail="File access failed")
