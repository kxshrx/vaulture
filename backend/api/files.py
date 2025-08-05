from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import time
import hashlib
import logging
from backend.db.session import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase, PaymentStatus
from backend.core.config import settings

# Setup logging for security monitoring
logger = logging.getLogger(__name__)

# In-memory rate limiting (for production, use Redis)
download_attempts = {}

router = APIRouter()


def check_rate_limit(user_id: int, file_path: str) -> bool:
    """Simple rate limiting: max 10 downloads per minute per user"""
    current_time = int(time.time())
    minute_key = f"{user_id}:{current_time // 60}"

    if minute_key not in download_attempts:
        download_attempts[minute_key] = 0

    download_attempts[minute_key] += 1

    # Clean old entries (keep last 5 minutes)
    keys_to_remove = [
        k
        for k in download_attempts.keys()
        if int(k.split(":")[1]) < (current_time // 60) - 5
    ]
    for key in keys_to_remove:
        del download_attempts[key]

    return download_attempts[minute_key] <= 10


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


@router.get("/{file_path}")
async def serve_file(
    file_path: str,
    request: Request,
    token: str = Query(...),
    expires: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Serve files securely with token and user verification"""

    client_ip = request.client.host

    # Rate limiting check
    if not check_rate_limit(current_user.id, file_path):
        logger.warning(
            f"Rate limit exceeded: user_id={current_user.id}, ip={client_ip}, file={file_path}"
        )
        raise HTTPException(
            status_code=429,
            detail="Too many download attempts. Please try again later.",
        )

    # Verify the token first (time-based security)
    if not verify_file_token(file_path, token, expires):
        logger.warning(
            f"Invalid/expired token: user_id={current_user.id}, ip={client_ip}, file={file_path}, token={token[:8]}..."
        )
        raise HTTPException(status_code=403, detail="Invalid or expired download token")

    # Find the product with this file
    product = db.query(Product).filter(Product.file_url == file_path).first()
    if not product:
        raise HTTPException(status_code=404, detail="File not found")

    # Check user access rights
    has_access = False

    # Check if user is the creator of the product
    if current_user.is_creator and product.creator_id == current_user.id:
        has_access = True
    else:
        # Check if user has purchased the product
        purchase = (
            db.query(Purchase)
            .filter(
                Purchase.user_id == current_user.id,
                Purchase.product_id == product.id,
                Purchase.payment_status == PaymentStatus.COMPLETED,
            )
            .first()
        )

        if purchase:
            has_access = True

    if not has_access:
        # Log unauthorized access attempt
        logger.warning(
            f"Unauthorized file access attempt: user_id={current_user.id}, ip={client_ip}, product_id={product.id}, file={file_path}"
        )
        raise HTTPException(
            status_code=403, detail="You don't have permission to access this file"
        )

    # Log successful file access
    logger.info(
        f"File accessed: user_id={current_user.id}, ip={client_ip}, product_id={product.id}, file={file_path}"
    )

    # Serve the file
    file_location = Path(settings.UPLOAD_FOLDER) / file_path

    if not file_location.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=file_location,
        filename=product.title,
        media_type="application/octet-stream",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
        },
    )
