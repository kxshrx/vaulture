from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Text, JSON
from sqlalchemy.orm import relationship
from backend.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_creator = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Profile fields
    display_name = Column(String(50))
    bio = Column(Text)
    website = Column(String(200))
    social_links = Column(JSON)  # Store social media links as JSON
    
    products = relationship("Product", back_populates="creator")
    purchases = relationship("Purchase", back_populates="user")
