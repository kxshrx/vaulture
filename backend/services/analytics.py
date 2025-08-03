from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.models.product import Product
from backend.models.purchase import Purchase
from backend.models.user import User
from datetime import datetime, timedelta

def get_creator_stats(db: Session, creator_id: int):
    """Get analytics/stats for a creator"""
    # Get total sales and revenue
    stats = db.query(
        Product.id,
        Product.title,
        func.count(Purchase.id).label('sales'),
        func.sum(Product.price).label('revenue')
    ).join(
        Purchase, Product.id == Purchase.product_id, isouter=True
    ).filter(
        Product.creator_id == creator_id
    ).group_by(Product.id, Product.title).all()
    
    # Calculate totals
    total_sales = sum(stat.sales for stat in stats)
    total_revenue = sum(stat.revenue or 0 for stat in stats)
    
    return {
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "product_breakdown": [
            {
                "product_id": stat.id,
                "product_title": stat.title,
                "sales": stat.sales,
                "revenue": stat.revenue or 0
            }
            for stat in stats
        ]
    }

def get_creator_public_stats(db: Session, creator_id: int):
    """Get public analytics/stats for a creator (no revenue information)"""
    # Get total products and sales count
    total_products = db.query(Product).filter(
        Product.creator_id == creator_id,
        Product.is_active == True
    ).count()
    
    total_sales = db.query(Purchase).join(
        Product, Purchase.product_id == Product.id
    ).filter(Product.creator_id == creator_id).count()
    
    # Get products with sales count but no revenue
    product_stats = db.query(
        Product.id,
        Product.title,
        func.count(Purchase.id).label('sales')
    ).join(
        Purchase, Product.id == Purchase.product_id, isouter=True
    ).filter(
        Product.creator_id == creator_id,
        Product.is_active == True
    ).group_by(Product.id, Product.title).all()
    
    return {
        "total_products": total_products,
        "total_sales": total_sales,
        "product_breakdown": [
            {
                "product_id": stat.id,
                "product_title": stat.title,
                "sales": stat.sales
            }
            for stat in product_stats
        ]
    }

def get_recent_sales(db: Session, creator_id: int, limit: int = 10):
    """Get recent sales for a creator"""
    recent_sales = db.query(
        Purchase.id,
        Purchase.created_at,
        Purchase.amount_paid,
        Product.title.label('product_title'),
        User.display_name.label('buyer_name'),
        User.email.label('buyer_email')
    ).join(
        Product, Purchase.product_id == Product.id
    ).join(
        User, Purchase.user_id == User.id
    ).filter(
        Product.creator_id == creator_id,
        Purchase.payment_status == 'COMPLETED'
    ).order_by(desc(Purchase.created_at)).limit(limit).all()
    
    return [
        {
            "id": sale.id,
            "product": sale.product_title,
            "buyer": sale.buyer_name or sale.buyer_email.split('@')[0],
            "sale_date": sale.created_at.isoformat(),
            "amount": float(sale.amount_paid or 0)
        }
        for sale in recent_sales
    ]

def get_sales_analytics(db: Session, creator_id: int):
    """Get sales analytics for charts and insights"""
    # Get sales over last 7 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    daily_sales = db.query(
        func.date(Purchase.created_at).label('sale_date'),
        func.sum(Purchase.amount_paid).label('revenue'),
        func.count(Purchase.id).label('sales_count')
    ).join(
        Product, Purchase.product_id == Product.id
    ).filter(
        Product.creator_id == creator_id,
        Purchase.created_at >= start_date,
        Purchase.payment_status == 'COMPLETED'
    ).group_by(func.date(Purchase.created_at)).all()
    
    # Get top products by sales
    top_products = db.query(
        Product.title,
        func.count(Purchase.id).label('sales')
    ).join(
        Purchase, Product.id == Purchase.product_id, isouter=True
    ).filter(
        Product.creator_id == creator_id,
        Product.is_active == True
    ).group_by(Product.id, Product.title).order_by(desc('sales')).limit(5).all()
    
    return {
        "daily_revenue": [
            {
                "name": sale.sale_date.strftime("%b %d"),
                "value": float(sale.revenue or 0)
            }
            for sale in daily_sales
        ],
        "top_products": [
            {
                "name": product.title,
                "value": product.sales
            }
            for product in top_products
        ]
    }
