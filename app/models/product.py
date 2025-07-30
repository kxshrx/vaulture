from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    price = Column(Float)
    file_url = Column(String)  # Supabase path
    created_at = Column(DateTime, default=func.now())
    
    creator = relationship("User", back_populates="products")
    purchases = relationship("Purchase", back_populates="product")
