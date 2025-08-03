from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.db.session import get_db
from backend.models.product import ProductCategory
from backend.schemas.product import ProductSearchParams, ProductSearchResponse, ProductResponse
from backend.services.product_service import search_products, get_product_categories, get_products_by_category, get_product_by_id, get_creator_products
from backend.services.analytics import get_creator_public_stats

router = APIRouter()

@router.get("/products", response_model=ProductSearchResponse)
def get_products(
    query: Optional[str] = Query(None, description="Search in title, description, tags, or creator name"),
    category: Optional[ProductCategory] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    creator_name: Optional[str] = Query(None, description="Filter by creator name"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Sort by: created_at, price, title, category"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """Search and browse products with filtering, sorting, and pagination"""
    search_params = ProductSearchParams(
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        creator_name=creator_name,
        tags=tags,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return search_products(db, search_params)

@router.get("/products/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all available product categories with product counts"""
    return get_product_categories(db)

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific product by ID"""
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/category/{category}", response_model=ProductSearchResponse)
def get_products_by_category_endpoint(
    category: ProductCategory,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get products filtered by category"""
    return get_products_by_category(db, category, page, page_size)

@router.get("/creator/{creator_id}/products", response_model=List[ProductResponse])
def get_creator_products_public(
    creator_id: int,
    db: Session = Depends(get_db)
):
    """Get all active products for a specific creator (public endpoint)"""
    return get_creator_products(db, creator_id)

@router.get("/creator/{creator_id}/stats")
def get_creator_stats_public(
    creator_id: int,
    db: Session = Depends(get_db)
):
    """Get public statistics for a specific creator (no revenue information)"""
    return get_creator_public_stats(db, creator_id)
