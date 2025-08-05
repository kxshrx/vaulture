from fastapi import APIRouter, Depends, HTTPException, Request, Response, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import Optional
import time
import hashlib
import logging
from backend.db.session import get_db
from backend.core.security import get_current_user_optional
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase, PaymentStatus
from backend.services.storage_service import storage_service
from backend.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def verify_shareable_token(product_id: str, token: str, expires: int) -> bool:
    """Verify that the shareable download token is valid and hasn't expired"""
    current_time = int(time.time())

    # Check if token has expired
    if current_time > expires:
        return False

    # Recreate the expected token
    token_data = f"{product_id}:{expires}:{settings.JWT_SECRET}"
    expected_token = hashlib.md5(token_data.encode()).hexdigest()

    return token == expected_token


@router.get("/{token}")
async def shareable_download(
    token: str,
    product: int,
    expires: int,
    request: Request,
    auth_token: Optional[str] = Query(None),  # Allow token from query params
    db: Session = Depends(get_db),
):
    """
    SHAREABLE DOWNLOAD LINK - The Anti-Reddit Piracy Solution

    This endpoint can be shared on Reddit/forums, but:
    1. Requires user to be logged in
    2. Verifies user has purchased the product
    3. Link expires in 30 seconds
    4. Generates new download each time

    Flow:
    User shares: https://yoursite.com/d/abc123?product=1&expires=123456
    → Anyone can click it
    → But must login first
    → And must have purchased the product
    → Gets a fresh 30-second download
    """

    client_ip = request.client.host

    # STEP 1: Verify the shareable token is valid and not expired
    if not verify_shareable_token(str(product), token, expires):
        logger.warning(
            f"Invalid/expired shareable token: ip={client_ip}, product={product}"
        )
        return HTMLResponse(
            content=f"""
            <html>
            <head>
                <title>⏰ Link Expired - Vaulture</title>
                <style>
                    body {{ font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background: #f5f5f5; }}
                    .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .expired {{ background: #ffe6e6; border: 1px solid #ffcccc; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                    .btn {{ background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>⏰ Download Link Expired</h2>
                    <div class="expired">
                        <p><strong>This link expired after 30 seconds.</strong></p>
                        <p>Links expire quickly to prevent unauthorized sharing and Reddit piracy.</p>
                    </div>
                    <p>To get a fresh download link:</p>
                    <ol style="text-align: left; display: inline-block;">
                        <li>Go back to the original source</li>
                        <li>Click download again</li>
                        <li>Get a new 30-second link</li>
                    </ol>
                    <p><a href="/products" class="btn">Browse Products</a></p>
                    <hr>
                    <small><strong>Anti-piracy protection:</strong> New links generated each time • Login required • Purchase verification enforced</small>
                </div>
            </body>
            </html>
            """,
            status_code=403,
        )

    # STEP 2: Check if user is logged in via various methods
    try:
        current_user = None

        # First, try the auth_token from query params (added by JavaScript)
        if auth_token:
            try:
                from backend.core.security import verify_token

                user_id = verify_token(auth_token)
                current_user = db.query(User).filter(User.id == user_id).first()
            except:
                pass

        # If no query token, try the optional detection (headers/cookies)
        if not current_user:
            current_user = get_current_user_optional(request)

        if not current_user:
            # Create a more user-friendly login redirect that preserves the download intent
            return HTMLResponse(
                content=f"""
                <html>
                <head>
                    <title>Login Required - Vaulture</title>
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
                                countdownElement.innerHTML = '<span class="countdown-number">⏰ EXPIRED</span><br>This link has expired. Please request a new one.';
                                return;
                            }}
                            
                            countdownElement.innerHTML = `<span class="countdown-number">${{remaining}}s</span><br>This link expires in ${{remaining}} seconds`;
                        }}
                        
                        // Update every second
                        setInterval(updateCountdown, 1000);
                        updateCountdown(); // Initial call
                        
                        // If user is already logged in (has token in localStorage), try automatic login
                        window.addEventListener('load', function() {{
                            const token = localStorage.getItem('vaulture_token');
                            if (token) {{
                                // Add token to current URL and reload
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
                        <h2>🔐 Login Required</h2>
                        <div id="countdown" class="countdown">
                            <span class="countdown-number">30s</span><br>
                            This link expires in 30 seconds
                        </div>
                        <p>You must be logged in to download this file.</p>
                        <div class="warning">
                            <strong>Anti-piracy protection:</strong> This shared link requires authentication to prevent unauthorized downloads.
                        </div>
                        <p>If you're already logged in, this page should redirect automatically.</p>
                        <p>Otherwise, please log in to continue:</p>
                        <a href="/auth/login" class="btn">Login to Download</a>
                        <br><br>
                        <small>Links expire in 30 seconds • Account required • Purchase verification enforced</small>
                    </div>
                </body>
                </html>
                """,
                status_code=401,
            )
    except:
        # Same as above - create user-friendly login page
        return HTMLResponse(
            content=f"""
            <html>
            <head>
                <title>Authentication Error - Vaulture</title>
                <style>
                    body {{ font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background: #f5f5f5; }}
                    .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .btn {{ background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🔐 Authentication Required</h2>
                    <p>Please log in to access this download.</p>
                    <a href="/auth/login" class="btn">Login</a>
                </div>
            </body>
            </html>
            """,
            status_code=401,
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
            status_code=404,
        )

    # STEP 4: Verify user has access (owner or purchased)
    is_creator_owner = (
        current_user.is_creator and product_obj.creator_id == current_user.id
    )

    if not is_creator_owner:
        # Check if user has completed purchase
        purchase = (
            db.query(Purchase)
            .filter(
                Purchase.user_id == current_user.id,
                Purchase.product_id == product,
                Purchase.payment_status == PaymentStatus.COMPLETED,
            )
            .first()
        )

        if not purchase:
            logger.warning(
                f"Unauthorized access to shared link: user_id={current_user.id}, ip={client_ip}, product={product}"
            )
            return HTMLResponse(
                content=f"""
                <html><body style="font-family: Arial; text-align: center; margin-top: 100px;">
                    <h2>🚫 Purchase Required</h2>
                    <p>You must purchase "<strong>{product_obj.title}</strong>" to download it.</p>
                    <p>This shared link is protected by purchase verification.</p>
                    <p><a href="/product/{product}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a></p>
                    <hr>
                    <small>Anti-piracy protection: Downloads require valid purchase</small>
                </body></html>
                """,
                status_code=403,
            )

    # STEP 5: All checks passed - Serve file securely (don't expose Supabase URLs)
    try:
        # Get fresh Supabase signed URL for internal use only (not exposed to client)
        internal_signed_url = storage_service.get_signed_url(
            product_obj.file_url, expires_in=300
        )

        # Fetch file from Supabase internally
        import httpx

        async with httpx.AsyncClient() as client:
            response = await client.get(internal_signed_url)

            if response.status_code != 200:
                logger.error(
                    f"Failed to fetch file from Supabase: {response.status_code}"
                )
                raise HTTPException(status_code=500, detail="File download failed")

            # Stream the file content directly (never expose Supabase URLs)
            file_content = response.content

        # Log successful access
        access_type = "owner" if is_creator_owner else "purchased"
        logger.info(
            f"Shareable link download: user_id={current_user.id}, ip={client_ip}, product={product}, access_type={access_type}"
        )

        # Return file as direct download with security headers
        from fastapi import Response

        return Response(
            content=file_content,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{product_obj.title}.{product_obj.file_type}"',
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "X-Anti-Piracy": "Account-bound download",
            },
        )

    except Exception as e:
        logger.error(
            f"Download error: user_id={current_user.id}, product={product}, error={str(e)}"
        )
        return HTMLResponse(
            content="""
            <html><body style="font-family: Arial; text-align: center; margin-top: 100px;">
                <h2>⚠️ Download Failed</h2>
                <p>There was an error generating your download. Please try again.</p>
            </body></html>
            """,
            status_code=500,
        )
