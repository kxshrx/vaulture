from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.purchase import Purchase
from app.schemas.product import ProductCreate
from app.services.storage_service import storage_service
from fastapi import UploadFile

def create_product(db: Session, product_data: ProductCreate, file: UploadFile, creator_id: int):
    """Create a new product with file upload"""
    # Upload file to storage
    file_url = storage_service.upload_file(file)
    
    # Create product in database
    product = Product(
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        file_url=file_url,
        creator_id=creator_id
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def get_creator_products(db: Session, creator_id: int):
    """Get all products for a specific creator"""
    return db.query(Product).filter(Product.creator_id == creator_id).all()

def get_all_products(db: Session):
    """Get all products for public listing"""
    return db.query(Product).all()

def get_product_by_id(db: Session, product_id: int):
    """Get a specific product by ID"""
    return db.query(Product).filter(Product.id == product_id).first()
