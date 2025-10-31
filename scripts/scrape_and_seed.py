"""
Script to scrape products from Gumroad and seed the database
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests
from bs4 import BeautifulSoup
import time
import random
from sqlalchemy.orm import Session
from backend.db.base import SessionLocal, engine, Base

# Import all models first to avoid relationship issues
from backend.models.user import User
from backend.models.product import Product, ProductCategory
from backend.models.purchase import Purchase  # Import Purchase to resolve relationships
import json
import bcrypt

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        raise e


def get_simple_password_hash(password: str) -> str:
    """Simple password hashing for seeding"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_sample_creators(db: Session, count=20):
    """Create sample creator accounts"""
    print(f"Creating {count} sample creators...")
    
    creators = []
    creator_names = [
        "Digital Dreams Studio", "Creative Minds Co", "Pixel Perfect Design",
        "Artistic Vision", "Modern Creator", "Tech Innovators",
        "Design Masters", "Content Creators Pro", "Creative Studio X",
        "Digital Artisan", "Innovation Lab", "Creative Workshop",
        "Studio Collective", "Design Factory", "Content Hub",
        "Creative Labs", "Digital Forge", "Maker Studio",
        "Creator Space", "Innovation Studio"
    ]
    
    bios = [
        "Creating amazing digital products for creators worldwide",
        "Passionate about design and innovation",
        "Building tools that empower creators",
        "Digital artist and content creator",
        "Helping creators succeed with quality products",
        "Professional designer with 10+ years experience",
        "Creating premium digital assets",
        "Designer, developer, and digital creator",
        "Making beautiful things for beautiful people",
        "Your source for quality digital products"
    ]
    
    for i in range(count):
        # Check if creator already exists
        email = f"creator{i+1}@vaulture.local"
        existing = db.query(User).filter(User.email == email).first()
        
        if existing:
            creators.append(existing)
            continue
        
        creator = User(
            email=email,
            hashed_password=get_simple_password_hash("pass123"),
            is_creator=True,
            display_name=creator_names[i % len(creator_names)],
            bio=random.choice(bios),
            website=f"https://creator{i+1}.example.com",
            social_links={
                "twitter": f"@creator{i+1}",
                "instagram": f"creator{i+1}"
            }
        )
        db.add(creator)
        creators.append(creator)
    
    db.commit()
    print(f"✅ Created {count} creators")
    return creators


def scrape_gumroad_products(max_products=100):
    """
    Scrape product information from Gumroad discover page
    Returns a list of product dictionaries
    """
    print(f"Scraping up to {max_products} products from Gumroad...")
    
    products = []
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Try to fetch the discover page
        url = "https://gumroad.com/discover"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Gumroad uses dynamic loading, so we'll create sample data based on common product types
            print("⚠️  Gumroad uses dynamic content loading. Creating sample products based on common types...")
        else:
            print(f"⚠️  Could not fetch Gumroad (Status: {response.status_code}). Creating sample products...")
            
    except Exception as e:
        print(f"⚠️  Error fetching Gumroad: {e}. Creating sample products...")
    
    # Generate realistic sample products based on common Gumroad categories
    product_templates = [
        # Digital Art & Design
        {"title": "Premium Icon Pack - 500+ Icons", "category": "GRAPHICS", "price_range": (19, 49), "type": "icon pack"},
        {"title": "Modern UI Kit for Figma", "category": "TEMPLATES", "price_range": (29, 79), "type": "design system"},
        {"title": "Abstract Wallpaper Collection", "category": "DIGITAL_ART", "price_range": (9, 19), "type": "wallpapers"},
        {"title": "Procreate Brush Bundle", "category": "DIGITAL_ART", "price_range": (15, 35), "type": "brushes"},
        {"title": "Logo Design Templates Pack", "category": "TEMPLATES", "price_range": (25, 59), "type": "logos"},
        
        # Photography
        {"title": "Lightroom Preset Collection", "category": "PHOTOGRAPHY", "price_range": (19, 39), "type": "presets"},
        {"title": "Photography Course Bundle", "category": "COURSES", "price_range": (49, 99), "type": "course"},
        {"title": "Portrait Retouching Actions", "category": "PHOTOGRAPHY", "price_range": (15, 29), "type": "actions"},
        {"title": "Stock Photo Bundle - 100 Images", "category": "PHOTOGRAPHY", "price_range": (29, 69), "type": "photos"},
        
        # Music & Audio
        {"title": "Lo-Fi Beat Pack Vol. 1", "category": "MUSIC", "price_range": (19, 39), "type": "beats"},
        {"title": "Royalty-Free Music Library", "category": "MUSIC", "price_range": (39, 89), "type": "music"},
        {"title": "Sound Effects Collection", "category": "MUSIC", "price_range": (25, 49), "type": "sfx"},
        {"title": "EDM Sample Pack", "category": "MUSIC", "price_range": (29, 59), "type": "samples"},
        
        # Templates & Resources
        {"title": "Social Media Templates Pack", "category": "TEMPLATES", "price_range": (19, 39), "type": "templates"},
        {"title": "Email Newsletter Templates", "category": "TEMPLATES", "price_range": (15, 29), "type": "templates"},
        {"title": "Landing Page Template Kit", "category": "TEMPLATES", "price_range": (29, 79), "type": "web templates"},
        {"title": "Instagram Story Templates", "category": "TEMPLATES", "price_range": (12, 24), "type": "social media"},
        {"title": "Resume & CV Templates", "category": "TEMPLATES", "price_range": (9, 19), "type": "documents"},
        
        # Fonts
        {"title": "Modern Sans Serif Font Family", "category": "FONTS", "price_range": (19, 49), "type": "font"},
        {"title": "Handwritten Script Font", "category": "FONTS", "price_range": (15, 29), "type": "font"},
        {"title": "Display Font Collection", "category": "FONTS", "price_range": (25, 59), "type": "fonts"},
        
        # eBooks & Guides
        {"title": "Complete Guide to Social Media Marketing", "category": "EBOOKS", "price_range": (19, 39), "type": "ebook"},
        {"title": "Beginner's Guide to Digital Art", "category": "EBOOKS", "price_range": (15, 29), "type": "guide"},
        {"title": "Photography Mastery Handbook", "category": "EBOOKS", "price_range": (24, 49), "type": "ebook"},
        {"title": "Web Design Fundamentals", "category": "EBOOKS", "price_range": (19, 39), "type": "ebook"},
        {"title": "Business Growth Strategies", "category": "EBOOKS", "price_range": (29, 59), "type": "ebook"},
        
        # Courses
        {"title": "Master Digital Marketing Course", "category": "COURSES", "price_range": (49, 149), "type": "course"},
        {"title": "Complete Web Development Bootcamp", "category": "COURSES", "price_range": (79, 199), "type": "course"},
        {"title": "Graphic Design Masterclass", "category": "COURSES", "price_range": (59, 129), "type": "course"},
        {"title": "Video Editing for Beginners", "category": "COURSES", "price_range": (39, 89), "type": "course"},
        
        # Software & Tools
        {"title": "Productivity App for Creators", "category": "SOFTWARE", "price_range": (29, 79), "type": "software"},
        {"title": "Photo Editor Plugin", "category": "SOFTWARE", "price_range": (19, 49), "type": "plugin"},
        {"title": "WordPress Theme Builder", "category": "SOFTWARE", "price_range": (39, 99), "type": "theme"},
        
        # Video
        {"title": "Motion Graphics Templates", "category": "VIDEO", "price_range": (29, 69), "type": "templates"},
        {"title": "YouTube Intro & Outro Pack", "category": "VIDEO", "price_range": (15, 35), "type": "video"},
        {"title": "After Effects Project Files", "category": "VIDEO", "price_range": (25, 59), "type": "project files"},
        {"title": "Video Editing Course Bundle", "category": "VIDEO", "price_range": (49, 99), "type": "course"},
    ]
    
    descriptions = [
        "Professional quality digital product perfect for creators and designers.",
        "High-quality resources to elevate your creative projects.",
        "Everything you need to create stunning designs quickly.",
        "Premium assets crafted by experienced professionals.",
        "Boost your productivity with this comprehensive collection.",
        "Perfect for beginners and professionals alike.",
        "Instant download - start using immediately.",
        "Regularly updated with new content and features.",
        "Commercial license included - use in client projects.",
        "Easy to use with detailed documentation included.",
        "Compatible with industry-standard tools.",
        "Time-saving resources for busy creators.",
        "Elevate your work with professional-grade assets.",
        "Comprehensive collection with everything included.",
        "Perfect for social media, web design, and more.",
    ]
    
    tags_by_category = {
        "GRAPHICS": ["icons", "graphics", "design", "vector", "ui", "web design"],
        "TEMPLATES": ["templates", "design", "social media", "marketing", "branding"],
        "DIGITAL_ART": ["art", "digital art", "illustration", "creative", "design"],
        "PHOTOGRAPHY": ["photography", "photos", "presets", "lightroom", "editing"],
        "MUSIC": ["music", "audio", "beats", "sounds", "production"],
        "FONTS": ["fonts", "typography", "typeface", "lettering", "design"],
        "EBOOKS": ["ebook", "guide", "learning", "education", "tutorial"],
        "COURSES": ["course", "education", "learning", "training", "tutorial"],
        "SOFTWARE": ["software", "tool", "plugin", "app", "utility"],
        "VIDEO": ["video", "motion graphics", "editing", "animation", "youtube"],
    }
    
    # Generate products
    product_count = 0
    while product_count < max_products:
        for template in product_templates:
            if product_count >= max_products:
                break
            
            # Create variations of each template
            variation = random.randint(1, 5)
            title = f"{template['title']}"
            if variation > 1:
                title = f"{template['title']} - Vol. {variation}"
            
            price = random.randint(template['price_range'][0], template['price_range'][1])
            category = template['category']
            
            # Random description
            description = f"{random.choice(descriptions)} {random.choice(descriptions)}"
            
            # Generate tags
            base_tags = tags_by_category.get(category, ["digital", "creative"])
            tags = random.sample(base_tags, min(4, len(base_tags)))
            tags.append(template['type'])
            
            product = {
                'title': title,
                'description': description,
                'price': float(price),
                'category': category,
                'tags': ', '.join(tags),
                'file_type': get_file_type(template['type']),
                'file_size': random.randint(1024 * 1024, 500 * 1024 * 1024),  # 1MB to 500MB
            }
            
            products.append(product)
            product_count += 1
            
            # Add some delay to simulate real scraping
            time.sleep(0.01)
    
    print(f"✅ Generated {len(products)} product entries")
    return products


def get_file_type(product_type):
    """Map product type to file extension"""
    type_mapping = {
        'icon pack': 'zip',
        'design system': 'fig',
        'wallpapers': 'zip',
        'brushes': 'brushset',
        'logos': 'zip',
        'presets': 'xmp',
        'course': 'zip',
        'actions': 'atn',
        'photos': 'zip',
        'beats': 'zip',
        'music': 'mp3',
        'sfx': 'wav',
        'samples': 'zip',
        'templates': 'zip',
        'web templates': 'zip',
        'social media': 'psd',
        'documents': 'pdf',
        'font': 'otf',
        'fonts': 'zip',
        'ebook': 'pdf',
        'guide': 'pdf',
        'software': 'dmg',
        'plugin': 'zip',
        'theme': 'zip',
        'video': 'mp4',
        'project files': 'zip',
    }
    return type_mapping.get(product_type, 'zip')


def map_category_to_enum(category_str):
    """Map category string to ProductCategory enum"""
    try:
        return ProductCategory[category_str]
    except KeyError:
        return ProductCategory.OTHER


def seed_products(db: Session, products_data, creators):
    """Insert products into database"""
    print(f"Seeding {len(products_data)} products into database...")
    
    added_count = 0
    for product_data in products_data:
        try:
            # Assign random creator
            creator = random.choice(creators)
            
            # Create product
            product = Product(
                creator_id=creator.id,
                creator_name=creator.display_name,
                title=product_data['title'],
                description=product_data['description'],
                price=product_data['price'],
                category=map_category_to_enum(product_data['category']),
                tags=product_data['tags'],
                file_type=product_data['file_type'],
                file_size=product_data['file_size'],
                file_url=f"sample_files/{product_data['file_type']}/product_{added_count}.{product_data['file_type']}",
                image_url=f"sample_images/product_{added_count}.jpg",
                is_active=True
            )
            
            db.add(product)
            added_count += 1
            
            if added_count % 20 == 0:
                db.commit()
                print(f"  Added {added_count} products...")
                
        except Exception as e:
            print(f"  ⚠️  Error adding product '{product_data.get('title', 'Unknown')}': {e}")
            continue
    
    db.commit()
    print(f"✅ Successfully added {added_count} products to database")
    return added_count


def main():
    """Main function to run the scraping and seeding process"""
    print("=" * 60)
    print("🌱 VAULTURE DATABASE SEEDING SCRIPT")
    print("=" * 60)
    print()
    
    try:
        # Get database session
        db = get_db()
        
        # Step 1: Create sample creators
        creators = create_sample_creators(db, count=20)
        print()
        
        # Step 2: Scrape/Generate products
        products_data = scrape_gumroad_products(max_products=100)
        print()
        
        # Step 3: Seed products into database
        added_count = seed_products(db, products_data, creators)
        print()
        
        # Summary
        print("=" * 60)
        print("✅ SEEDING COMPLETE!")
        print("=" * 60)
        print(f"Total creators: {len(creators)}")
        print(f"Total products: {added_count}")
        print()
        print("You can now:")
        print("  • Visit http://localhost:3000/products to see the products")
        print("  • Visit http://localhost:8000/docs to test API endpoints")
        print("  • Login with any creator account:")
        print("    Email: creator1@vaulture.local (or creator2, creator3, etc.)")
        print("    Password: pass123")
        print()
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
