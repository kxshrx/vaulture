from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, String, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    stripe_payment_intent_id = Column(String, unique=True, nullable=True)
    stripe_session_id = Column(String, unique=True, nullable=True)
    amount_paid = Column(Float)
    currency = Column(String, default="usd")
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="purchases")
    product = relationship("Product", back_populates="purchases")
