from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.purchase import Purchase

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
