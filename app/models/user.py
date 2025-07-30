from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_creator = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    products = relationship("Product", back_populates="creator")
    purchases = relationship("Purchase", back_populates="user")
