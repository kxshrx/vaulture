from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from backend.db.base import Base
import enum

class ProductCategory(enum.Enum):
    DIGITAL_ART = "digital_art"
    PHOTOGRAPHY = "photography"
    MUSIC = "music"
    VIDEO = "video"
    EBOOKS = "ebooks"
    SOFTWARE = "software"
    TEMPLATES = "templates"
    COURSES = "courses"
    FONTS = "fonts"
    GRAPHICS = "graphics"
    OTHER = "other"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator_name = Column(String)  # Store creator name for easy access
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(SQLEnum(ProductCategory), default=ProductCategory.OTHER)
    tags = Column(String)  # Comma-separated tags for search
    file_url = Column(String)  # Supabase path for main file
    image_url = Column(String)  # Supabase path for product image/thumbnail
    file_size = Column(Integer)  # File size in bytes
    file_type = Column(String)  # File extension/type
    is_active = Column(Boolean, default=True)  # For soft deletion
    created_at = Column(DateTime, default=func.now())
    
    creator = relationship("User", back_populates="products")
    purchases = relationship("Purchase", back_populates="product")
