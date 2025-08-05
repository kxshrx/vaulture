from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from enum import Enum


class PaymentMethodType(str, Enum):
    STRIPE = "stripe"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PurchaseRequest(BaseModel):
    """Request schema for creating a purchase"""

    payment_method: PaymentMethodType = Field(
        default=PaymentMethodType.STRIPE, description="Payment method"
    )
    success_url: Optional[str] = Field(
        None, description="URL to redirect to after successful payment"
    )
    cancel_url: Optional[str] = Field(
        None, description="URL to redirect to after cancelled payment"
    )


class CheckoutSessionResponse(BaseModel):
    """Response schema for checkout session creation"""

    checkout_url: str
    session_id: str
    expires_at: int


class PurchaseResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    stripe_payment_intent_id: Optional[str]
    stripe_session_id: Optional[str]
    amount_paid: Optional[float]
    currency: str
    payment_status: PaymentStatus
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class PurchaseWithProduct(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    completed_at: Optional[datetime]
    amount_paid: Optional[float]
    payment_status: PaymentStatus
    product_title: str
    product_description: Optional[str]
    product_price: float
    product_category: str
    product_file_type: Optional[str]
    product_image_url: Optional[str]
    creator_name: str
    creator_id: int

    class Config:
        from_attributes = True


class PurchaseStatsResponse(BaseModel):
    total_purchases: int
    total_spent: float
    categories: dict = Field(..., description="Purchase count by category")
    recent_purchases: int = Field(..., description="Purchases in last 30 days")


class WebhookEventResponse(BaseModel):
    """Response schema for webhook processing"""

    message: str
    purchase_id: Optional[int] = None
    payment_status: Optional[PaymentStatus] = None
