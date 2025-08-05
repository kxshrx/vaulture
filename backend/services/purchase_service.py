from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional, List
from backend.models.purchase import Purchase, PaymentStatus
from backend.models.product import Product
from backend.models.user import User
from backend.core.stripe import StripeService
from fastapi import HTTPException, status
import stripe


class PurchaseService:

    @staticmethod
    def create_checkout_session(
        db: Session,
        product_id: int,
        user_id: int,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> dict:
        """Create a Stripe checkout session and pending purchase record"""

        # Get product
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Check if user is trying to buy their own product
        if product.creator_id == user_id:
            raise HTTPException(
                status_code=400, detail="Cannot purchase your own product"
            )

        # Check if already purchased (completed purchases only)
        existing_purchase = (
            db.query(Purchase)
            .filter(
                Purchase.user_id == user_id,
                Purchase.product_id == product_id,
                Purchase.payment_status == PaymentStatus.COMPLETED,
            )
            .first()
        )

        if existing_purchase:
            raise HTTPException(status_code=400, detail="Product already purchased")

        # Validate price
        if product.price <= 0:
            raise HTTPException(status_code=400, detail="Product price is invalid")

        try:
            # Create Stripe checkout session
            session = StripeService.create_checkout_session(
                product_title=product.title,
                product_description=product.description or "",
                price=product.price,
                product_id=product_id,
                user_id=user_id,
                success_url=success_url,
                cancel_url=cancel_url,
            )

            # Create pending purchase record
            purchase = Purchase(
                user_id=user_id,
                product_id=product_id,
                stripe_session_id=session.id,
                amount_paid=product.price,
                currency="usd",
                payment_status=PaymentStatus.PENDING,
            )
            db.add(purchase)
            db.commit()
            db.refresh(purchase)

            return {
                "checkout_url": session.url,
                "session_id": session.id,
                "expires_at": session.expires_at,
                "purchase_id": purchase.id,
            }

        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=400, detail=f"Payment processing error: {str(e)}"
            )

    @staticmethod
    def complete_purchase(
        db: Session, session_id: str, payment_intent_id: str
    ) -> Purchase:
        """Complete a purchase after successful payment"""

        purchase = (
            db.query(Purchase).filter(Purchase.stripe_session_id == session_id).first()
        )

        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")

        if purchase.payment_status == PaymentStatus.COMPLETED:
            return purchase

        # Update purchase with payment information
        purchase.stripe_payment_intent_id = payment_intent_id
        purchase.payment_status = PaymentStatus.COMPLETED
        purchase.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(purchase)

        return purchase

    @staticmethod
    def fail_purchase(
        db: Session, session_id: str, reason: Optional[str] = None
    ) -> Purchase:
        """Mark a purchase as failed"""

        purchase = (
            db.query(Purchase).filter(Purchase.stripe_session_id == session_id).first()
        )

        if not purchase:
            raise HTTPException(status_code=404, detail="Purchase not found")

        purchase.payment_status = PaymentStatus.FAILED

        db.commit()
        db.refresh(purchase)

        return purchase

    @staticmethod
    def get_user_purchases(
        db: Session, user_id: int, completed_only: bool = True
    ) -> List[Purchase]:
        """Get all purchases for a user"""
        query = db.query(Purchase).filter(Purchase.user_id == user_id)

        if completed_only:
            query = query.filter(Purchase.payment_status == PaymentStatus.COMPLETED)

        return query.order_by(Purchase.created_at.desc()).all()

    @staticmethod
    def has_purchased_product(db: Session, user_id: int, product_id: int) -> bool:
        """Check if user has successfully purchased a product"""
        purchase = (
            db.query(Purchase)
            .filter(
                Purchase.user_id == user_id,
                Purchase.product_id == product_id,
                Purchase.payment_status == PaymentStatus.COMPLETED,
            )
            .first()
        )

        return purchase is not None

    @staticmethod
    def get_purchase_by_session(db: Session, session_id: str) -> Optional[Purchase]:
        """Get purchase by Stripe session ID"""
        return (
            db.query(Purchase).filter(Purchase.stripe_session_id == session_id).first()
        )

    @staticmethod
    def get_purchase_stats(db: Session, user_id: int) -> dict:
        """Get purchase statistics for a user"""
        purchases = (
            db.query(Purchase, Product)
            .join(Product, Purchase.product_id == Product.id)
            .filter(
                Purchase.user_id == user_id,
                Purchase.payment_status == PaymentStatus.COMPLETED,
            )
            .all()
        )

        total_purchases = len(purchases)
        total_spent = sum(purchase.amount_paid or 0 for purchase, _ in purchases)

        # Category breakdown
        categories = {}
        for purchase, product in purchases:
            category = product.category.value
            categories[category] = categories.get(category, 0) + 1

        # Recent purchases (last 30 days)
        thirty_days_ago = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        thirty_days_ago = thirty_days_ago - timedelta(days=30)

        recent_purchases = (
            db.query(Purchase)
            .filter(
                Purchase.user_id == user_id,
                Purchase.payment_status == PaymentStatus.COMPLETED,
                Purchase.completed_at >= thirty_days_ago,
            )
            .count()
        )

        return {
            "total_purchases": total_purchases,
            "total_spent": total_spent,
            "categories": categories,
            "recent_purchases": recent_purchases,
        }
