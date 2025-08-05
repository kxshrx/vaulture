from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from backend.db.session import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase, PaymentStatus
from backend.schemas.purchase import (
    PurchaseResponse,
    PurchaseWithProduct,
    PurchaseRequest,
    CheckoutSessionResponse,
    WebhookEventResponse,
    PurchaseStatsResponse,
)
from backend.services.purchase_service import PurchaseService
from backend.services.webhook_service import StripeWebhookService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/{product_id}", response_model=CheckoutSessionResponse)
def create_purchase_checkout(
    product_id: int,
    purchase_data: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a Stripe checkout session for product purchase"""

    logger.info(
        f"Creating purchase checkout for product {product_id} by user {current_user.id}"
    )

    try:
        checkout_data = PurchaseService.create_checkout_session(
            db=db,
            product_id=product_id,
            user_id=current_user.id,
            success_url=purchase_data.success_url,
            cancel_url=purchase_data.cancel_url,
        )

        return CheckoutSessionResponse(
            checkout_url=checkout_data["checkout_url"],
            session_id=checkout_data["session_id"],
            expires_at=checkout_data["expires_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.post("/webhook", response_model=WebhookEventResponse)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # Debug logging
    logger.info(f"Webhook received - payload length: {len(payload)}")
    logger.info(f"Webhook signature header present: {bool(sig_header)}")

    if not sig_header:
        logger.error("Missing stripe-signature header in webhook request")
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        result = StripeWebhookService.handle_webhook_event(
            db=db, payload=payload, sig_header=sig_header
        )

        logger.info(f"Webhook processed successfully: {result}")

        return WebhookEventResponse(
            message=result["message"],
            purchase_id=result.get("purchase_id"),
            payment_status=result.get("payment_status"),
        )

    except ValueError as e:
        logger.error(f"Webhook signature verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")


@router.get("/session/{session_id}", response_model=PurchaseResponse)
def get_purchase_by_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get purchase information by Stripe session ID"""

    purchase = PurchaseService.get_purchase_by_session(db, session_id)

    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    # Ensure user can only access their own purchases
    if purchase.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return purchase


@router.get("/mypurchases", response_model=List[PurchaseWithProduct])
def get_my_purchases(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get user's completed purchases with product details"""

    purchases = (
        db.query(Purchase, Product, User)
        .join(Product, Purchase.product_id == Product.id)
        .join(User, Product.creator_id == User.id)
        .filter(
            Purchase.user_id == current_user.id,
            Purchase.payment_status == PaymentStatus.COMPLETED,
            Product.is_active == True,
        )
        .order_by(Purchase.completed_at.desc())
        .all()
    )

    return [
        PurchaseWithProduct(
            id=purchase.id,
            product_id=purchase.product_id,
            created_at=purchase.created_at,
            completed_at=purchase.completed_at,
            amount_paid=purchase.amount_paid,
            payment_status=purchase.payment_status,
            product_title=product.title,
            product_description=product.description,
            product_price=product.price,
            product_category=product.category.value,
            product_file_type=product.file_type,
            product_image_url=product.image_url,
            creator_name=creator.display_name or creator.email.split("@")[0],
            creator_id=creator.id,
        )
        for purchase, product, creator in purchases
    ]


@router.get("/mypurchases/all", response_model=List[PurchaseWithProduct])
def get_all_my_purchases(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get ALL user's purchases regardless of status (for debugging)"""

    purchases = (
        db.query(Purchase, Product, User)
        .join(Product, Purchase.product_id == Product.id)
        .join(User, Product.creator_id == User.id)
        .filter(Purchase.user_id == current_user.id, Product.is_active == True)
        .order_by(Purchase.created_at.desc())
        .all()
    )

    return [
        PurchaseWithProduct(
            id=purchase.id,
            product_id=purchase.product_id,
            created_at=purchase.created_at,
            completed_at=purchase.completed_at,
            amount_paid=purchase.amount_paid,
            payment_status=purchase.payment_status,
            product_title=product.title,
            product_description=product.description,
            product_price=product.price,
            product_category=product.category.value,
            product_file_type=product.file_type,
            product_image_url=product.image_url,
            creator_name=creator.display_name or creator.email.split("@")[0],
            creator_id=creator.id,
        )
        for purchase, product, creator in purchases
    ]


@router.get("/stats", response_model=PurchaseStatsResponse)
def get_purchase_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get purchase statistics for the current user"""

    stats = PurchaseService.get_purchase_stats(db, current_user.id)

    return PurchaseStatsResponse(**stats)


@router.post("/verify/{session_id}", response_model=PurchaseResponse)
def verify_payment_status(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually verify and update payment status by checking Stripe directly"""

    try:
        # Get the purchase record
        purchase = PurchaseService.get_purchase_by_session(db, session_id)

        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")

        # Ensure user can only verify their own purchases
        if purchase.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        # If already completed, return as is
        if purchase.payment_status == PaymentStatus.COMPLETED:
            return purchase

        # Check Stripe session status
        from backend.core.stripe import StripeService

        stripe_session = StripeService.get_session(session_id)

        if stripe_session.payment_status == "paid":
            # Payment is complete, update our record
            purchase = PurchaseService.complete_purchase(
                db=db,
                session_id=session_id,
                payment_intent_id=stripe_session.payment_intent,
            )
            logger.info(f"Manually verified and completed purchase {purchase.id}")
        elif stripe_session.payment_status == "unpaid":
            # Payment failed or expired
            purchase = PurchaseService.fail_purchase(
                db=db, session_id=session_id, reason="Payment not completed"
            )
            logger.info(
                f"Manually verified and marked purchase {purchase.id} as failed"
            )

        return purchase

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify payment status")
