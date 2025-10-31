"""
Script to seed random transactions (purchases) in the database
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.db.base import SessionLocal, Base, engine
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


def create_random_transactions(db: Session, count=100):
    """Create random purchase transactions"""
    print(f"Creating {count} random transactions...")
    
    # Get all active products
    products = db.query(Product).filter(Product.is_active == True).all()
    if not products:
        print("❌ No products found! Please seed products first.")
        return
    
    # Get all users (buyers and creators)
    users = db.query(User).all()
    if not users:
        print("❌ No users found! Please seed users first.")
        return
    
    print(f"Found {len(products)} products and {len(users)} users")
    
    # Track which user bought which product to avoid duplicates
    purchases_made = set()
    transactions_created = 0
    
    # Generate random transactions
    while transactions_created < count:
        # Randomly select a product
        product = random.choice(products)
        
        # Randomly select a buyer (shouldn't be the product creator)
        buyer = random.choice(users)
        
        # Skip if buyer is the creator of this product
        if buyer.id == product.creator_id:
            continue
        
        # Skip if this user already bought this product
        purchase_key = (buyer.id, product.id)
        if purchase_key in purchases_made:
            continue
        
        # Random purchase date in the last 90 days
        days_ago = random.randint(0, 90)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        purchase_date = datetime.now() - timedelta(
            days=days_ago, 
            hours=hours_ago, 
            minutes=minutes_ago
        )
        
        # Create the purchase
        from backend.models.purchase import PaymentStatus
        purchase = Purchase(
            user_id=buyer.id,
            product_id=product.id,
            amount_paid=product.price,
            currency="usd",
            stripe_payment_intent_id=f"pi_test_{random.randint(100000, 999999)}_{transactions_created}",
            stripe_session_id=f"cs_test_{random.randint(100000, 999999)}_{transactions_created}",
            payment_status=PaymentStatus.COMPLETED,
            created_at=purchase_date,
            completed_at=purchase_date + timedelta(minutes=random.randint(1, 5))
        )
        
        db.add(purchase)
        purchases_made.add(purchase_key)
        transactions_created += 1
        
        if transactions_created % 20 == 0:
            db.commit()
            print(f"  Created {transactions_created} transactions...")
    
    # Final commit
    db.commit()
    print(f"✅ Successfully created {transactions_created} random transactions")
    
    # Show some statistics
    print("\n" + "=" * 60)
    print("📊 TRANSACTION STATISTICS")
    print("=" * 60)
    
    # Total revenue
    total_revenue = db.query(Purchase).count()
    print(f"Total Purchases: {total_revenue}")
    
    # Top selling products
    from sqlalchemy import func, desc
    top_products = (
        db.query(
            Product.title,
            Product.price,
            func.count(Purchase.id).label('sales_count'),
            (func.count(Purchase.id) * Product.price).label('revenue')
        )
        .join(Purchase, Purchase.product_id == Product.id)
        .group_by(Product.id, Product.title, Product.price)
        .order_by(desc('sales_count'))
        .limit(10)
        .all()
    )
    
    print("\n🏆 Top 10 Best Selling Products:")
    for i, (title, price, sales, revenue) in enumerate(top_products, 1):
        print(f"  {i}. {title[:40]:<40} | {sales} sales | ₹{int(price * 83):,} × {sales} = ₹{int(revenue * 83):,}")
    
    # Top creators by sales
    top_creators = (
        db.query(
            User.display_name,
            func.count(Purchase.id).label('total_sales'),
            func.sum(Product.price).label('total_revenue')
        )
        .join(Product, Product.creator_id == User.id)
        .join(Purchase, Purchase.product_id == Product.id)
        .group_by(User.id, User.display_name)
        .order_by(desc('total_sales'))
        .limit(10)
        .all()
    )
    
    print("\n🎨 Top 10 Creators by Sales:")
    for i, (name, sales, revenue) in enumerate(top_creators, 1):
        revenue_inr = int(revenue * 83) if revenue else 0
        display_name = name if name else "Unknown"
        print(f"  {i}. {display_name[:30]:<30} | {sales} sales | ₹{revenue_inr:,} revenue")
    
    # Most active buyers
    top_buyers = (
        db.query(
            User.display_name,
            func.count(Purchase.id).label('purchase_count'),
            func.sum(Purchase.amount_paid).label('total_spent')
        )
        .join(Purchase, Purchase.user_id == User.id)
        .group_by(User.id, User.display_name)
        .order_by(desc('purchase_count'))
        .limit(10)
        .all()
    )
    
    print("\n🛒 Top 10 Most Active Buyers:")
    for i, (name, purchases, spent) in enumerate(top_buyers, 1):
        spent_inr = int(spent * 83) if spent else 0
        display_name = name if name else "Unknown"
        print(f"  {i}. {display_name[:30]:<30} | {purchases} purchases | ₹{spent_inr:,} spent")
    
    # Category performance
    from backend.models.product import ProductCategory
    category_stats = (
        db.query(
            Product.category,
            func.count(Purchase.id).label('sales_count'),
            func.sum(Product.price).label('revenue')
        )
        .join(Purchase, Purchase.product_id == Product.id)
        .group_by(Product.category)
        .order_by(desc('sales_count'))
        .all()
    )
    
    print("\n📦 Sales by Category:")
    for category, sales, revenue in category_stats:
        revenue_inr = int(revenue * 83) if revenue else 0
        print(f"  {category.value.replace('_', ' ').title():<20} | {sales} sales | ₹{revenue_inr:,} revenue")


def main():
    print("=" * 60)
    print("💰 SEEDING RANDOM TRANSACTIONS")
    print("=" * 60)
    print()
    
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    
    try:
        db = SessionLocal()
        create_random_transactions(db, count=100)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
    
    print()
    print("=" * 60)
    print("✅ SEEDING COMPLETE!")
    print("=" * 60)
    print()
    print("You can now:")
    print("  • Visit http://localhost:3000/products to see products with sales data")
    print("  • Visit creator dashboards to see revenue and sales")
    print("  • Check the platform analytics")


if __name__ == "__main__":
    main()
