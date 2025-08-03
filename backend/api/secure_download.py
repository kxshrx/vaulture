from fastapi import APIRouter, Depends, HTTPException, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import time
import hashlib
import logging
from backend.db.session import get_db
from backend.core.security import verify_token
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase, PaymentStatus
from backend.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

def verify_file_token(file_path: str, token: str, expires: int) -> bool:
    """Verify that the file token is valid and hasn't expired"""
    current_time = int(time.time())
    
    # Check if token has expired
    if current_time > expires:
        return False
    
    # Recreate the expected token
    token_data = f"{file_path}:{expires}:{settings.JWT_SECRET}"
    expected_token = hashlib.md5(token_data.encode()).hexdigest()
    
    return token == expected_token

@router.post("/{file_path}")
async def secure_download(
    file_path: str,
    request: Request,
    auth_token: str = Form(...),
    filename: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Secure download endpoint that validates both signed URL parameters AND authentication
    This maintains the signed URL security while ensuring proper authentication
    """
    
    client_ip = request.client.host
    
    # Extract signed URL parameters from the original request
    token = request.query_params.get('token')
    expires = request.query_params.get('expires')
    
    if not token or not expires:
        logger.warning(f"Missing signed URL parameters: ip={client_ip}")
        raise HTTPException(status_code=400, detail="Invalid download request")
    
    try:
        expires_int = int(expires)
    except ValueError:
        logger.warning(f"Invalid expires parameter: ip={client_ip}")
        raise HTTPException(status_code=400, detail="Invalid download request")
    
    # Verify the signed URL token (time-based security)
    if not verify_file_token(file_path, token, expires_int):
        logger.warning(f"Invalid/expired signed URL: ip={client_ip}, file={file_path}")
        raise HTTPException(status_code=403, detail="Invalid or expired download token")
    
    # Verify the user authentication token
    try:
        user_id = verify_token(auth_token)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
    except HTTPException:
        logger.warning(f"Authentication failed: ip={client_ip}, file={file_path}")
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Find the product with this file
    product = db.query(Product).filter(Product.file_url == file_path).first()
    if not product:
        logger.warning(f"Product not found: ip={client_ip}, file={file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check user access rights (same logic as original endpoint)
    has_access = False
    
    # Check if user is the creator of the product
    if user.is_creator and product.creator_id == user.id:
        has_access = True
        access_type = "owner"
    else:
        # Check if user has purchased the product
        purchase = db.query(Purchase).filter(
            Purchase.user_id == user.id,
            Purchase.product_id == product.id,
            Purchase.payment_status == PaymentStatus.COMPLETED
        ).first()
        
        if purchase:
            has_access = True
            access_type = "purchased"
    
    if not has_access:
        logger.warning(f"Unauthorized access attempt: user_id={user.id}, ip={client_ip}, product_id={product.id}")
        raise HTTPException(
            status_code=403, 
            detail="You don't have permission to access this file"
        )
    
    # Log successful access
    logger.info(f"Secure download: user_id={user.id}, ip={client_ip}, product_id={product.id}, access_type={access_type}")
    
    # Serve the file
    file_location = Path(settings.UPLOAD_FOLDER) / file_path
    
    if not file_location.exists():
        logger.error(f"File not found on disk: {file_location}")
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_location,
        filename=filename,
        media_type='application/octet-stream',
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache", 
            "Expires": "0",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY"
        }
    )
