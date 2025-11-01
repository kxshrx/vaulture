"""
Seed the database with sample products for testing and demo purposes.
Run this script after deploying to Render to populate the database.
"""
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir.parent))

from sqlalchemy.orm import Session
from backend.db.base import engine, Base
from backend.db.session import get_db
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase  # Import to resolve relationships
from backend.core.security import get_password_hash
from datetime import datetime

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")

def seed_data():
    """Seed the database with sample data"""
    db = next(get_db())
    
    try:
        # Check if data already exists
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"⚠️  Database already has {existing_products} products. Skipping seed.")
            return
        
        print("Creating sample creator account...")
        # Create a sample creator user
        # Hash password with bcrypt - truncate if needed for bcrypt 72-byte limit
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
        db.flush()  # Get the creator ID
        
        print(f"✓ Created demo creator (ID: {creator.id})")
        
        # Sample products with various categories and price points (50 products)
        products_data = [
            # Templates (10 products)
            {
                "title": "Professional Resume Template Pack",
                "description": "A collection of 10 modern, ATS-friendly resume templates in Word and PDF format. Perfect for job seekers across all industries.",
                "price": 19.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
            },
            {
                "title": "Email Marketing Templates",
                "description": "25 high-converting email templates for newsletters, promotions, and automated sequences.",
                "price": 24.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800",
            },
            {
                "title": "Notion Productivity Templates",
                "description": "12 Notion templates for project management, habit tracking, note-taking, and goal setting.",
                "price": 19.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
            },
            {
                "title": "Business Proposal Templates",
                "description": "15 professional business proposal templates with contracts, invoices, and agreements.",
                "price": 29.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
            },
            {
                "title": "Invoice & Receipt Templates",
                "description": "Complete set of customizable invoice, receipt, and billing templates for small businesses.",
                "price": 14.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800",
            },
            {
                "title": "Social Media Post Templates",
                "description": "200+ ready-to-use social media templates for all platforms. Fully editable in Canva.",
                "price": 27.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
            },
            {
                "title": "PowerPoint Presentation Bundle",
                "description": "50 modern PowerPoint templates for business, education, and creative presentations.",
                "price": 34.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800",
            },
            {
                "title": "Wedding Invitation Templates",
                "description": "Beautiful wedding invitation designs in various styles. Print-ready and fully customizable.",
                "price": 16.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
            },
            {
                "title": "eBook Template Collection",
                "description": "10 professional eBook templates for fiction, non-fiction, and guides. InDesign & Word formats.",
                "price": 22.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
            },
            {
                "title": "Real Estate Flyer Templates",
                "description": "25 eye-catching real estate flyer templates for property listings and open houses.",
                "price": 18.99,
                "category": "Templates",
                "preview_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
            },
            
            # Courses (8 products)
            {
                "title": "Python Web Scraping Course",
                "description": "Complete guide to web scraping with Python, BeautifulSoup, and Selenium. Includes 15 video lessons and source code.",
                "price": 49.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
            },
            {
                "title": "Full Stack Web Development Bootcamp",
                "description": "Master React, Node.js, MongoDB, and deployment. 40+ hours of content with real-world projects.",
                "price": 89.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
            },
            {
                "title": "Digital Marketing Masterclass",
                "description": "Learn SEO, social media marketing, email campaigns, and analytics. Includes certification.",
                "price": 59.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            },
            {
                "title": "Graphic Design Fundamentals",
                "description": "Learn Adobe Photoshop, Illustrator, and design principles. Perfect for beginners.",
                "price": 44.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            },
            {
                "title": "Excel for Business Analytics",
                "description": "Master Excel functions, pivot tables, macros, and data visualization for business analysis.",
                "price": 39.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            },
            {
                "title": "Photography for Beginners",
                "description": "Learn camera basics, composition, lighting, and photo editing. Includes RAW files for practice.",
                "price": 54.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
            },
            {
                "title": "Mobile App Development with Flutter",
                "description": "Build cross-platform mobile apps with Flutter and Dart. 30+ hours of hands-on tutorials.",
                "price": 74.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
            },
            {
                "title": "Copywriting Crash Course",
                "description": "Learn persuasive writing for ads, sales pages, and email campaigns. Includes templates.",
                "price": 42.99,
                "category": "Courses",
                "preview_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
            },
            
            # Graphics & Design (10 products)
            {
                "title": "Social Media Graphics Bundle",
                "description": "500+ customizable social media templates for Instagram, Facebook, and Twitter. Canva-compatible.",
                "price": 29.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
            },
            {
                "title": "UI/UX Design System",
                "description": "Complete design system with 200+ components, color palettes, and typography guidelines for Figma.",
                "price": 79.99,
                "category": "Design",
                "preview_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            },
            {
                "title": "Logo Design Pack - 100 Logos",
                "description": "100 professional logo designs across various industries. Fully editable vector files.",
                "price": 49.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
            },
            {
                "title": "Icon Set - 500 Icons",
                "description": "500 pixel-perfect icons for web and mobile apps. Multiple formats: SVG, PNG, AI.",
                "price": 24.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800",
            },
            {
                "title": "Infographic Templates Collection",
                "description": "50 stunning infographic templates for data visualization and presentations.",
                "price": 32.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            },
            {
                "title": "YouTube Thumbnail Templates",
                "description": "100 eye-catching YouTube thumbnail templates. Boost your click-through rate instantly.",
                "price": 19.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
            },
            {
                "title": "Business Card Design Bundle",
                "description": "40 modern business card designs in multiple formats. Print-ready with bleed.",
                "price": 21.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
            },
            {
                "title": "Instagram Story Highlights Icons",
                "description": "200+ minimalist icons for Instagram story highlights. Multiple color schemes included.",
                "price": 12.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
            },
            {
                "title": "Poster Design Templates",
                "description": "25 creative poster templates for events, promotions, and advertising campaigns.",
                "price": 26.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            },
            {
                "title": "Mockup Collection - Devices",
                "description": "50 realistic device mockups: phones, tablets, laptops. Perfect for showcasing designs.",
                "price": 37.99,
                "category": "Graphics",
                "preview_url": "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
            },
            
            # Photography (6 products)
            {
                "title": "Stock Photo Collection - Business",
                "description": "100 high-quality stock photos perfect for business websites, presentations, and marketing materials.",
                "price": 39.99,
                "category": "Photography",
                "preview_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
            },
            {
                "title": "Nature Photography Bundle",
                "description": "150 stunning nature and landscape photos in 4K resolution. Commercial license included.",
                "price": 44.99,
                "category": "Photography",
                "preview_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            },
            {
                "title": "Food Photography Collection",
                "description": "80 mouthwatering food photos perfect for restaurants, blogs, and menus.",
                "price": 34.99,
                "category": "Photography",
                "preview_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
            },
            {
                "title": "Abstract Background Photos",
                "description": "100 unique abstract backgrounds and textures for graphic design projects.",
                "price": 29.99,
                "category": "Photography",
                "preview_url": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800",
            },
            {
                "title": "Lifestyle Photography Pack",
                "description": "120 authentic lifestyle photos featuring people, work, and daily activities.",
                "price": 49.99,
                "category": "Photography",
                "preview_url": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800",
            },
            {
                "title": "Urban Architecture Photos",
                "description": "90 high-quality urban and architectural photos from cities around the world.",
                "price": 39.99,
                "category": "Photography",
                "preview_url": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
            },
            
            # Video & Animation (5 products)
            {
                "title": "Instagram Reels Video Templates",
                "description": "50 trendy video templates for Instagram Reels and TikTok. Editable in Canva and CapCut.",
                "price": 34.99,
                "category": "Video",
                "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
            },
            {
                "title": "After Effects Logo Animation Pack",
                "description": "20 professional logo animation templates for After Effects. Easy to customize.",
                "price": 54.99,
                "category": "Video",
                "preview_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
            },
            {
                "title": "YouTube Intro & Outro Templates",
                "description": "30 customizable video intros and outros for YouTube channels. Multiple styles.",
                "price": 29.99,
                "category": "Video",
                "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
            },
            {
                "title": "Motion Graphics Asset Pack",
                "description": "500+ animated elements, transitions, and effects for video editing.",
                "price": 64.99,
                "category": "Video",
                "preview_url": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800",
            },
            {
                "title": "Explainer Video Templates",
                "description": "15 animated explainer video templates perfect for product demos and tutorials.",
                "price": 44.99,
                "category": "Video",
                "preview_url": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
            },
            
            # Guides & eBooks (6 products)
            {
                "title": "SEO Checklist & Tools Guide",
                "description": "Step-by-step SEO checklist and guide to free tools for improving your website's search rankings.",
                "price": 14.99,
                "category": "Guides",
                "preview_url": "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800",
            },
            {
                "title": "Freelancing Success Guide",
                "description": "Complete guide to starting and growing your freelance business. Includes contracts and pricing calculator.",
                "price": 24.99,
                "category": "Guides",
                "preview_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
            },
            {
                "title": "Social Media Growth Playbook",
                "description": "Proven strategies to grow your following on Instagram, TikTok, and YouTube organically.",
                "price": 19.99,
                "category": "Guides",
                "preview_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
            },
            {
                "title": "Passive Income Ideas eBook",
                "description": "50 realistic passive income ideas with step-by-step implementation guides.",
                "price": 17.99,
                "category": "Guides",
                "preview_url": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800",
            },
            {
                "title": "Email List Building Guide",
                "description": "Master email marketing: build your list, create sequences, and boost conversions.",
                "price": 22.99,
                "category": "Guides",
                "preview_url": "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800",
            },
            {
                "title": "Content Creator's Handbook",
                "description": "Everything you need to know about creating content that engages and converts.",
                "price": 27.99,
                "category": "Guides",
                "preview_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
            },
            
            # Tools & Spreadsheets (5 products)
            {
                "title": "Financial Planning Spreadsheet",
                "description": "Excel budget tracker, expense analyzer, and financial planning tool with automated calculations.",
                "price": 12.99,
                "category": "Spreadsheets",
                "preview_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
            },
            {
                "title": "Business Expense Tracker",
                "description": "Track business expenses, categorize spending, and generate tax reports automatically.",
                "price": 16.99,
                "category": "Spreadsheets",
                "preview_url": "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800",
            },
            {
                "title": "Project Management Dashboard",
                "description": "Excel dashboard for managing projects, tasks, timelines, and team resources.",
                "price": 24.99,
                "category": "Spreadsheets",
                "preview_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
            },
            {
                "title": "Content Calendar Template",
                "description": "Plan and organize your content strategy with this comprehensive content calendar.",
                "price": 14.99,
                "category": "Spreadsheets",
                "preview_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
            },
            {
                "title": "Sales CRM Spreadsheet",
                "description": "Manage leads, track sales pipeline, and analyze performance with this CRM template.",
                "price": 19.99,
                "category": "Spreadsheets",
                "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            },
        ]
        
        print(f"Creating {len(products_data)} sample products...")
        
        for idx, product_data in enumerate(products_data, 1):
            product = Product(
                creator_id=creator.id,
                title=product_data["title"],
                description=product_data["description"],
                price=product_data["price"],
                category=product_data["category"],
                preview_url=product_data["preview_url"],
                file_path=f"demo_files/{product_data['category'].lower()}/sample_{idx}.zip",
                file_size=1024 * 1024 * 5,  # 5MB dummy file size
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(product)
            
            if idx % 3 == 0:
                print(f"  ✓ Created {idx} products...")
        
        db.commit()
        print(f"✓ Successfully created {len(products_data)} products!")
        print(f"\n🎉 Database seeded successfully!")
        print(f"\nDemo Account Credentials:")
        print(f"  Email: creator@vaulture.com")
        print(f"  Password: Demo1234!")
        print(f"\n📦 Product Categories:")
        print(f"  • Templates: 10 products")
        print(f"  • Courses: 8 products")
        print(f"  • Graphics & Design: 10 products")
        print(f"  • Photography: 6 products")
        print(f"  • Video: 5 products")
        print(f"  • Guides: 6 products")
        print(f"  • Spreadsheets: 5 products")
        print(f"\n💰 Price Range: $12.99 - $89.99")
        print(f"\nYou can now view products at: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}/products")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

def main():
    """Main function to run the seed script"""
    print("=" * 60)
    print("Vaulture Database Seeding Script")
    print("=" * 60)
    
    try:
        # Create tables first
        create_tables()
        
        # Seed data
        seed_data()
        
        print("\n" + "=" * 60)
        print("✓ Seeding completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
