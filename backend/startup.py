"""
Startup script that runs automatically on Render deployment.
Creates tables and seeds the database if it's empty.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to the Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir.parent))

from sqlalchemy.orm import Session
from backend.db.base import engine, Base
from backend.db.session import get_db
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase
from backend.core.security import get_password_hash
from datetime import datetime

def create_tables():
    """Create all database tables"""
    print("🔧 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

def seed_database():
    """Seed the database with initial data if empty"""
    db = next(get_db())
    
    try:
        # Check if data already exists
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"✅ Database already has {existing_products} products. Skipping seed.")
            return
        
        print("🌱 Seeding database with sample data...")
        
        # Create a sample creator user
        password = "Demo1234!"
        creator = User(
            email="creator@vaulture.com",
            username="demo_creator",
            hashed_password=get_password_hash(password[:72]),
            full_name="Demo Creator",
            is_active=True,
            is_creator=True,
            stripe_account_id="acct_demo123",
            created_at=datetime.utcnow()
        )
        db.add(creator)
        db.flush()
        
        print(f"✅ Created demo creator (ID: {creator.id})")
        
        # Sample products (50 items for free tier)
        products_data = [
            # Templates (10)
            {"title": "Professional Resume Template Pack", "description": "10 modern, ATS-friendly resume templates", "price": 19.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800"},
            {"title": "Email Marketing Templates", "description": "25 high-converting email templates", "price": 24.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800"},
            {"title": "Notion Productivity Templates", "description": "12 Notion templates for productivity", "price": 19.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"},
            {"title": "Business Proposal Templates", "description": "15 professional business proposal templates", "price": 29.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800"},
            {"title": "Invoice & Receipt Templates", "description": "Complete billing templates for businesses", "price": 14.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800"},
            {"title": "Social Media Post Templates", "description": "200+ social media templates", "price": 27.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800"},
            {"title": "PowerPoint Presentation Bundle", "description": "50 modern PowerPoint templates", "price": 34.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800"},
            {"title": "Wedding Invitation Templates", "description": "Beautiful wedding invitations", "price": 16.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"},
            {"title": "eBook Template Collection", "description": "10 professional eBook templates", "price": 22.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"},
            {"title": "Real Estate Flyer Templates", "description": "25 eye-catching property flyers", "price": 18.99, "category": "Templates", "preview_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"},
            
            # Courses (8)
            {"title": "Python Web Scraping Course", "description": "Complete web scraping guide with 15 lessons", "price": 49.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800"},
            {"title": "Full Stack Web Development Bootcamp", "description": "Master React, Node.js, MongoDB", "price": 89.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"},
            {"title": "Digital Marketing Masterclass", "description": "Learn SEO, social media, and analytics", "price": 59.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"},
            {"title": "Graphic Design Fundamentals", "description": "Adobe Photoshop and Illustrator", "price": 44.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"},
            {"title": "Excel for Business Analytics", "description": "Master Excel for data analysis", "price": 39.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"},
            {"title": "Photography for Beginners", "description": "Camera basics and photo editing", "price": 54.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800"},
            {"title": "Mobile App Development with Flutter", "description": "Build cross-platform apps", "price": 74.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800"},
            {"title": "Copywriting Crash Course", "description": "Persuasive writing for marketing", "price": 42.99, "category": "Courses", "preview_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"},
            
            # Graphics (10)
            {"title": "Social Media Graphics Bundle", "description": "500+ customizable templates", "price": 29.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"},
            {"title": "UI/UX Design System", "description": "200+ components for Figma", "price": 79.99, "category": "Design", "preview_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"},
            {"title": "Logo Design Pack - 100 Logos", "description": "Professional logo designs", "price": 49.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800"},
            {"title": "Icon Set - 500 Icons", "description": "Pixel-perfect icons", "price": 24.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800"},
            {"title": "Infographic Templates Collection", "description": "50 stunning infographic templates", "price": 32.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"},
            {"title": "YouTube Thumbnail Templates", "description": "100 eye-catching thumbnails", "price": 19.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800"},
            {"title": "Business Card Design Bundle", "description": "40 modern business cards", "price": 21.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800"},
            {"title": "Instagram Story Highlights Icons", "description": "200+ minimalist icons", "price": 12.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"},
            {"title": "Poster Design Templates", "description": "25 creative poster templates", "price": 26.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"},
            {"title": "Mockup Collection - Devices", "description": "50 realistic device mockups", "price": 37.99, "category": "Graphics", "preview_url": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800"},
            
            # Photography (6)
            {"title": "Stock Photo Collection - Business", "description": "100 high-quality business photos", "price": 39.99, "category": "Photography", "preview_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800"},
            {"title": "Nature Photography Bundle", "description": "150 stunning nature photos in 4K", "price": 44.99, "category": "Photography", "preview_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"},
            {"title": "Food Photography Collection", "description": "80 mouthwatering food photos", "price": 34.99, "category": "Photography", "preview_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"},
            {"title": "Abstract Background Photos", "description": "100 unique abstract backgrounds", "price": 29.99, "category": "Photography", "preview_url": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800"},
            {"title": "Lifestyle Photography Pack", "description": "120 authentic lifestyle photos", "price": 49.99, "category": "Photography", "preview_url": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800"},
            {"title": "Urban Architecture Photos", "description": "90 urban and architectural photos", "price": 39.99, "category": "Photography", "preview_url": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800"},
            
            # Video (5)
            {"title": "Instagram Reels Video Templates", "description": "50 trendy video templates", "price": 34.99, "category": "Video", "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800"},
            {"title": "After Effects Logo Animation Pack", "description": "20 logo animation templates", "price": 54.99, "category": "Video", "preview_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"},
            {"title": "YouTube Intro & Outro Templates", "description": "30 customizable video intros", "price": 29.99, "category": "Video", "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800"},
            {"title": "Motion Graphics Asset Pack", "description": "500+ animated elements", "price": 64.99, "category": "Video", "preview_url": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800"},
            {"title": "Explainer Video Templates", "description": "15 animated explainer templates", "price": 44.99, "category": "Video", "preview_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"},
            
            # Guides (6)
            {"title": "SEO Checklist & Tools Guide", "description": "Step-by-step SEO guide", "price": 14.99, "category": "Guides", "preview_url": "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800"},
            {"title": "Freelancing Success Guide", "description": "Start your freelance business", "price": 24.99, "category": "Guides", "preview_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"},
            {"title": "Social Media Growth Playbook", "description": "Grow your following organically", "price": 19.99, "category": "Guides", "preview_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800"},
            {"title": "Passive Income Ideas eBook", "description": "50 realistic passive income ideas", "price": 17.99, "category": "Guides", "preview_url": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800"},
            {"title": "Email List Building Guide", "description": "Master email marketing", "price": 22.99, "category": "Guides", "preview_url": "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800"},
            {"title": "Content Creator's Handbook", "description": "Create engaging content", "price": 27.99, "category": "Guides", "preview_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"},
            
            # Spreadsheets (5)
            {"title": "Financial Planning Spreadsheet", "description": "Budget tracker and planner", "price": 12.99, "category": "Spreadsheets", "preview_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800"},
            {"title": "Business Expense Tracker", "description": "Track expenses and taxes", "price": 16.99, "category": "Spreadsheets", "preview_url": "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800"},
            {"title": "Project Management Dashboard", "description": "Excel dashboard for projects", "price": 24.99, "category": "Spreadsheets", "preview_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"},
            {"title": "Content Calendar Template", "description": "Plan your content strategy", "price": 14.99, "category": "Spreadsheets", "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800"},
            {"title": "Sales CRM Spreadsheet", "description": "Manage leads and sales", "price": 19.99, "category": "Spreadsheets", "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"},
        ]
        
        for idx, product_data in enumerate(products_data, 1):
            product = Product(
                creator_id=creator.id,
                title=product_data["title"],
                description=product_data["description"],
                price=product_data["price"],
                category=product_data["category"],
                preview_url=product_data["preview_url"],
                file_path=f"demo_files/{product_data['category'].lower()}/sample_{idx}.zip",
                file_size=1024 * 1024 * 5,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(product)
            
            if idx % 10 == 0:
                print(f"  ✓ Created {idx} products...")
        
        db.commit()
        print(f"✅ Successfully created {len(products_data)} products!")
        print(f"\n🎉 Database seeded successfully!")
        print(f"\nDemo Account:")
        print(f"  Email: creator@vaulture.com")
        print(f"  Password: Demo1234!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

def main():
    """Main startup function"""
    try:
        # Only run in production (on Render)
        is_production = os.getenv("DATABASE_URL", "").startswith("postgresql")
        
        if is_production:
            print("=" * 60)
            print("🚀 RENDER STARTUP: Initializing Database")
            print("=" * 60)
            
            create_tables()
            seed_database()
            
            print("\n" + "=" * 60)
            print("✅ Startup completed successfully!")
            print("=" * 60 + "\n")
        else:
            print("ℹ️  Skipping auto-seed (local development mode)")
            
    except Exception as e:
        print(f"\n❌ Startup failed: {e}")
        # Don't exit with error code - let the app start anyway
        # The database might already be set up

if __name__ == "__main__":
    main()
