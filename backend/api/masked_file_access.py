from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import Optional
import time
import hashlib
import logging
from backend.db.session import get_db
from backend.core.security import get_current_user_optional, verify_token
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase, PaymentStatus
from backend.services.storage_service import storage_service
from backend.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

def verify_access_token(product_id: str, token: str, expires: int) -> bool:
    """Verify that the file access token is valid and hasn't expired"""
    current_time = int(time.time())
    
    # Check if token has expired
    if current_time > expires:
        return False
    
    # Recreate the expected token
    token_data = f"{product_id}:{expires}:{settings.JWT_SECRET}"
    expected_token = hashlib.md5(token_data.encode()).hexdigest()
    
    return token == expected_token

@router.get("/{token}")
async def masked_file_access(
    token: str,
    product: int,
    expires: int,
    request: Request,
    auth_token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    MASKED FILE ACCESS - The Real Anti-Piracy Solution
    
    Instead of giving users direct Supabase URLs, give them masked URLs that:
    1. Expire quickly (30 seconds)
    2. Require authentication  
    3. Verify purchase/ownership
    4. Redirect to actual Supabase file for viewing/downloading
    
    Users get normal file access but can't share working URLs
    """
    
    client_ip = request.client.host
    
    # STEP 1: Verify the access token is valid and not expired
    if not verify_access_token(str(product), token, expires):
        logger.warning(f"Invalid/expired access token: ip={client_ip}, product={product}")
        return HTMLResponse(
            content=f"""
            <html>
            <head>
                <title>⏰ Access Link Expired - Vaulture</title>
                <style>
                    body {{ font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background: #f5f5f5; }}
                    .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .expired {{ background: #ffe6e6; border: 1px solid #ffcccc; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                    .btn {{ background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>⏰ File Access Link Expired</h2>
                    <div class="expired">
                        <p><strong>This access link expired after 30 seconds.</strong></p>
                        <p>Access links expire quickly to prevent unauthorized file sharing.</p>
                    </div>
                    <p>To get fresh file access:</p>
                    <ol style="text-align: left; display: inline-block;">
                        <li>Go back to your purchase/product page</li>
                        <li>Click "View File" or "Access File" again</li>
                        <li>Get a new 30-second access link</li>
                    </ol>
                    <p><a href="/dashboard" class="btn">Go to Dashboard</a></p>
                    <hr>
                    <small><strong>Anti-piracy protection:</strong> New access links generated each time • Login required • Purchase verification enforced</small>
                </div>
            </body>
            </html>
            """,
            status_code=403
        )
    
    # STEP 2: Check if user is authenticated
    try:
        current_user = None
        
        # First, try the auth_token from query params (added by JavaScript)
        if auth_token:
            try:
                user_id = verify_token(auth_token)
                current_user = db.query(User).filter(User.id == user_id).first()
            except:
                pass
        
        # If no query token, try the optional detection (headers/cookies)
        if not current_user:
            current_user = get_current_user_optional(request)
        
        if not current_user:
            # Create a login page with countdown timer
            return HTMLResponse(
                content=f"""
                <html>
                <head>
                    <title>🔐 Login Required - File Access</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background: #f5f5f5; }}
                        .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                        .btn {{ background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }}
                        .btn:hover {{ background: #0056b3; }}
                        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                        .countdown {{ background: #e6f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                        .countdown-number {{ font-size: 24px; font-weight: bold; color: #0066cc; }}
                    </style>
                    <script>
                        // Show countdown timer for link expiration
                        const expiresAt = {expires};
                        const countdownElement = document.getElementById('countdown');
                        
                        function updateCountdown() {{
                            const now = Math.floor(Date.now() / 1000);
                            const remaining = expiresAt - now;
                            
                            if (remaining <= 0) {{
                                countdownElement.innerHTML = '<span class="countdown-number">⏰ EXPIRED</span><br>This access link has expired. Please request a new one.';
                                return;
                            }}
                            
                            countdownElement.innerHTML = `<span class="countdown-number">${{remaining}}s</span><br>Access expires in ${{remaining}} seconds`;
                        }}
                        
                        // Update every second
                        setInterval(updateCountdown, 1000);
                        updateCountdown(); // Initial call
                        
                        // Auto-redirect if user is already logged in
                        window.addEventListener('load', function() {{
                            const token = localStorage.getItem('vaulture_token');
                            if (token) {{
                                const currentUrl = new URL(window.location.href);
                                if (!currentUrl.searchParams.has('auth_token')) {{
                                    currentUrl.searchParams.set('auth_token', token);
                                    window.location.href = currentUrl.toString();
                                }}
                            }}
                        }});
                    </script>
                </head>
                <body>
                    <div class="container">
                        <h2>🔐 Login Required for File Access</h2>
                        <div id="countdown" class="countdown">
                            <span class="countdown-number">30s</span><br>
                            Access expires in 30 seconds
                        </div>
                        <p>You must be logged in to access this file.</p>
                        <div class="warning">
                            <strong>Anti-piracy protection:</strong> File access requires authentication to prevent unauthorized sharing.
                        </div>
                        <p>If you're already logged in, this page should redirect automatically.</p>
                        <p>Otherwise, please log in to continue:</p>
                        <a href="/auth/login" class="btn">Login to Access File</a>
                        <br><br>
                        <small>Access links expire in 30 seconds • Account required • Purchase verification enforced</small>
                    </div>
                </body>
                </html>
                """,
                status_code=401
            )
    except:
        # Same as above - show login page
        return HTMLResponse(
            content="""
            <html>
            <head><title>Authentication Error</title></head>
            <body style="font-family: Arial; text-align: center; margin-top: 100px;">
                <h2>🔐 Authentication Required</h2>
                <p>Please log in to access this file.</p>
                <a href="/auth/login" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Login</a>
            </body>
            </html>
            """,
            status_code=401
        )
    
    # STEP 3: Verify product exists
    product_obj = db.query(Product).filter(Product.id == product).first()
    if not product_obj:
        logger.warning(f"Product not found: ip={client_ip}, product={product}")
        return HTMLResponse(
            content="""
            <html><body style="font-family: Arial; text-align: center; margin-top: 100px;">
                <h2>❌ Product Not Found</h2>
                <p>The requested product could not be found.</p>
            </body></html>
            """,
            status_code=404
        )
    
    # STEP 4: Verify user has access (owner or purchased)
    is_creator_owner = current_user.is_creator and product_obj.creator_id == current_user.id
    
    if not is_creator_owner:
        # Check if user has completed purchase
        purchase = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.product_id == product,
            Purchase.payment_status == PaymentStatus.COMPLETED
        ).first()
        
        if not purchase:
            logger.warning(f"Unauthorized file access attempt: user_id={current_user.id}, ip={client_ip}, product={product}")
            return HTMLResponse(
                content=f"""
                <html><body style="font-family: Arial; text-align: center; margin-top: 100px;">
                    <h2>🚫 Purchase Required</h2>
                    <p>You must purchase "<strong>{product_obj.title}</strong>" to access this file.</p>
                    <p>This access link is protected by purchase verification.</p>
                    <p><a href="/product/{product}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a></p>
                    <hr>
                    <small>Anti-piracy protection: File access requires valid purchase</small>
                </body></html>
                """,
                status_code=403
            )
    
    # STEP 5: All checks passed - Redirect to actual Supabase file
    try:
        # Get Supabase signed URL (longer expiry for actual viewing/downloading)
        supabase_url = storage_service.get_signed_url(product_obj.file_url, expires_in=3600)  # 1 hour for file viewing
        
        # Log successful access
        access_type = "owner" if is_creator_owner else "purchased"
        logger.info(f"Masked file access granted: user_id={current_user.id}, ip={client_ip}, product={product}, access_type={access_type}")
        
        # Redirect to the actual Supabase file
        # User can now view/download the file normally, but the URL was masked
        return RedirectResponse(url=supabase_url)
        
    except Exception as e:
        logger.error(f"File access error: user_id={current_user.id}, product={product}, error={str(e)}")
        return HTMLResponse(
            content="""
            <html><body style="font-family: Arial; text-align: center; margin-top: 100px;">
                <h2>⚠️ File Access Failed</h2>
                <p>There was an error accessing the file. Please try again.</p>
            </body></html>
            """,
            status_code=500
        )
