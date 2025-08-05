"""
Platform statistics and public information endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.services.platform_analytics import (
    get_popular_products,
    get_category_stats,
    get_recent_products,
)

router = APIRouter()


@router.get("/popular")
def get_popular_products_endpoint(limit: int = 10, db: Session = Depends(get_db)):
    """Get most popular products by sales"""
    return get_popular_products(db, limit)


@router.get("/recent")
def get_recent_products_endpoint(limit: int = 10, db: Session = Depends(get_db)):
    """Get recently added products"""
    return get_recent_products(db, limit)


@router.get("/categories/stats")
def get_category_statistics(db: Session = Depends(get_db)):
    """Get statistics by product category"""
    return get_category_stats(db)
