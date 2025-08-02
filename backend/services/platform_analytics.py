"""
Product statistics and analytics service
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.models.product import Product, ProductCategory
from backend.models.purchase import Purchase
from backend.models.user import User
from typing import Dict, List, Any

def get_platform_stats(db: Session) -> Dict[str, Any]:
    """Get overall platform statistics"""
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_creators = db.query(User).filter(User.is_creator == True).count()
    total_buyers = db.query(User).filter(User.is_creator == False).count()
    total_purchases = db.query(Purchase).count()
    
    # Calculate total revenue
    total_revenue = db.query(func.sum(Product.price)).join(
        Purchase, Product.id == Purchase.product_id
    ).scalar() or 0
    
    return {
        "total_products": total_products,
        "total_creators": total_creators,
        "total_buyers": total_buyers,
        "total_purchases": total_purchases,
        "total_revenue": round(total_revenue, 2),
        "average_product_price": round(
            db.query(func.avg(Product.price)).filter(Product.is_active == True).scalar() or 0, 2
        )
    }

def get_popular_products(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """Get most popular products by purchase count"""
    popular = db.query(
        Product.id,
        Product.title,
        Product.creator_name,
        Product.price,
        Product.category,
        func.count(Purchase.id).label('purchase_count')
    ).join(
        Purchase, Product.id == Purchase.product_id
    ).filter(
        Product.is_active == True
    ).group_by(
        Product.id
    ).order_by(
        desc('purchase_count')
    ).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "creator_name": p.creator_name,
            "price": p.price,
            "category": p.category.value,
            "purchase_count": p.purchase_count
        }
        for p in popular
    ]

def get_category_stats(db: Session) -> List[Dict[str, Any]]:
    """Get statistics by product category"""
    stats = db.query(
        Product.category,
        func.count(Product.id).label('product_count'),
        func.count(Purchase.id).label('total_sales'),
        func.sum(Product.price).label('total_revenue')
    ).outerjoin(
        Purchase, Product.id == Purchase.product_id
    ).filter(
        Product.is_active == True
    ).group_by(
        Product.category
    ).all()
    
    return [
        {
            "category": stat.category.value,
            "product_count": stat.product_count,
            "total_sales": stat.total_sales or 0,
            "total_revenue": round(stat.total_revenue or 0, 2)
        }
        for stat in stats
    ]

def get_recent_products(db: Session, limit: int = 10) -> List[Product]:
    """Get recently added products"""
    return db.query(Product).filter(
        Product.is_active == True
    ).order_by(
        desc(Product.created_at)
    ).limit(limit).all()

def search_products_advanced(db: Session, **filters) -> List[Product]:
    """Advanced product search with multiple filters"""
    query = db.query(Product).filter(Product.is_active == True)
    
    # Apply filters dynamically
    for key, value in filters.items():
        if value is not None:
            if key == 'title_contains':
                query = query.filter(Product.title.ilike(f'%{value}%'))
            elif key == 'min_price':
                query = query.filter(Product.price >= value)
            elif key == 'max_price':
                query = query.filter(Product.price <= value)
            elif key == 'category':
                query = query.filter(Product.category == value)
            elif key == 'creator_name':
                query = query.filter(Product.creator_name.ilike(f'%{value}%'))
            elif key == 'has_image':
                if value:
                    query = query.filter(Product.image_url.isnot(None))
                else:
                    query = query.filter(Product.image_url.is_(None))
    
    return query.all()
