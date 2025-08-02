from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from backend.models.product import Product, ProductCategory
from backend.models.purchase import Purchase
from backend.schemas.product import ProductCreate, ProductSearchParams, ProductSearchResponse
from backend.services.storage_service import storage_service
from backend.core.config import settings
from fastapi import UploadFile
from typing import Optional
import math

def create_product(db: Session, product_data: ProductCreate, file: UploadFile, creator_id: int, image_file: UploadFile = None):
    """Create a new product with file upload"""
    # Upload main file to storage
    file_url, file_size, file_type = storage_service.upload_file(file)
    
    # Upload image if provided
    image_url = None
    if image_file:
        image_url, _, _ = storage_service.upload_file(image_file, validate=False)  # Skip validation for images
    
    # Create product in database
    product = Product(
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        category=product_data.category,
        tags=product_data.tags,
        creator_name=product_data.creator_name,
        file_url=file_url,
        image_url=image_url,
        file_size=file_size,
        file_type=file_type,
        creator_id=creator_id
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def get_creator_products(db: Session, creator_id: int):
    """Get all products for a specific creator"""
    return db.query(Product).filter(
        Product.creator_id == creator_id,
        Product.is_active == True
    ).all()

def search_products(db: Session, params: ProductSearchParams) -> ProductSearchResponse:
    """Search and filter products with pagination"""
    query = db.query(Product).filter(Product.is_active == True)
    
    # Apply search filters
    if params.query:
        search_term = f"%{params.query.lower()}%"
        query = query.filter(
            or_(
                func.lower(Product.title).like(search_term),
                func.lower(Product.description).like(search_term),
                func.lower(Product.tags).like(search_term),
                func.lower(Product.creator_name).like(search_term)
            )
        )
    
    if params.category:
        query = query.filter(Product.category == params.category)
    
    if params.min_price is not None:
        query = query.filter(Product.price >= params.min_price)
    
    if params.max_price is not None:
        query = query.filter(Product.price <= params.max_price)
    
    if params.creator_name:
        query = query.filter(func.lower(Product.creator_name).like(f"%{params.creator_name.lower()}%"))
    
    if params.tags:
        # Search for any of the provided tags
        tag_list = [tag.strip().lower() for tag in params.tags.split(',')]
        tag_conditions = [func.lower(Product.tags).like(f"%{tag}%") for tag in tag_list]
        query = query.filter(or_(*tag_conditions))
    
    # Apply sorting
    sort_column = getattr(Product, params.sort_by)
    if params.sort_order == 'desc':
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (params.page - 1) * params.page_size
    products = query.offset(offset).limit(params.page_size).all()
    
    # Calculate pagination metadata
    total_pages = math.ceil(total / params.page_size)
    has_next = params.page < total_pages
    has_prev = params.page > 1
    
    return ProductSearchResponse(
        products=products,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )

def get_all_products(db: Session, page: int = 1, page_size: int = None):
    """Get all products for public listing with pagination"""
    if page_size is None:
        page_size = settings.DEFAULT_PAGE_SIZE
    
    # Use the search function with default parameters
    params = ProductSearchParams(page=page, page_size=page_size)
    return search_products(db, params)

def get_product_by_id(db: Session, product_id: int):
    """Get a specific product by ID"""
    return db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

def get_products_by_category(db: Session, category: ProductCategory, page: int = 1, page_size: int = None):
    """Get products filtered by category"""
    if page_size is None:
        page_size = settings.DEFAULT_PAGE_SIZE
    
    params = ProductSearchParams(category=category, page=page, page_size=page_size)
    return search_products(db, params)

def get_product_categories(db: Session):
    """Get all available product categories with counts"""
    categories = db.query(
        Product.category,
        func.count(Product.id).label('count')
    ).filter(Product.is_active == True).group_by(Product.category).all()
    
    return [{"category": cat.category, "count": cat.count} for cat in categories]
