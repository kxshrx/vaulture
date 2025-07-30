"""
Configuration file for Vaulture Streamlit Prototype
"""

# App Configuration
APP_CONFIG = {
    "title": "Vaulture - Creators Platform",
    "icon": "🎨",
    "description": "Digital Content Platform with Secure File Delivery",
    "layout": "wide"
}

# Mock Data Configuration
MOCK_USERS = [
    {'id': 1, 'email': 'creator@example.com', 'is_creator': True},
    {'id': 2, 'email': 'buyer@example.com', 'is_creator': False},
    {'id': 3, 'email': 'artist@example.com', 'is_creator': True},
    {'id': 4, 'email': 'designer@example.com', 'is_creator': True},
    {'id': 5, 'email': 'customer@example.com', 'is_creator': False},
]

MOCK_PRODUCTS = [
    {
        'id': 1,
        'title': 'Digital Art Collection',
        'description': 'Beautiful digital art pieces perfect for your creative projects. High-resolution files included.',
        'price': 29.99,
        'creator_id': 1,
        'file_url': 'art_collection.zip',
        'created_at': '2024-12-01',
        'category': 'Art'
    },
    {
        'id': 2,
        'title': 'Photography Preset Pack',
        'description': 'Professional Lightroom presets for stunning photo editing. 20+ presets included.',
        'price': 15.99,
        'creator_id': 3,
        'file_url': 'presets.zip',
        'created_at': '2024-12-15',
        'category': 'Photography'
    },
    {
        'id': 3,
        'title': 'UI Design Templates',
        'description': 'Modern UI templates for web and mobile applications. Figma and Sketch files included.',
        'price': 49.99,
        'creator_id': 1,
        'file_url': 'ui_templates.zip',
        'created_at': '2024-12-20',
        'category': 'Design'
    },
    {
        'id': 4,
        'title': 'Stock Music Pack',
        'description': 'Royalty-free background music for videos and presentations. 10 high-quality tracks.',
        'price': 24.99,
        'creator_id': 4,
        'file_url': 'music_pack.zip',
        'created_at': '2024-12-22',
        'category': 'Audio'
    },
    {
        'id': 5,
        'title': 'Business Icons Set',
        'description': 'Professional icon set for business applications. 100+ icons in multiple formats.',
        'price': 12.99,
        'creator_id': 4,
        'file_url': 'icons.zip',
        'created_at': '2024-12-25',
        'category': 'Design'
    }
]

MOCK_PURCHASES = [
    {'id': 1, 'user_id': 2, 'product_id': 1, 'created_at': '2024-12-10'},
    {'id': 2, 'user_id': 2, 'product_id': 2, 'created_at': '2024-12-18'},
    {'id': 3, 'user_id': 5, 'product_id': 1, 'created_at': '2024-12-20'},
    {'id': 4, 'user_id': 5, 'product_id': 3, 'created_at': '2024-12-23'},
    {'id': 5, 'user_id': 2, 'product_id': 4, 'created_at': '2024-12-26'},
]

# UI Configuration
UI_CONFIG = {
    "primary_color": "#667eea",
    "secondary_color": "#764ba2",
    "success_color": "#10b981",
    "info_color": "#3b82f6",
    "warning_color": "#f59e0b",
    "error_color": "#ef4444"
}

# File Upload Configuration
UPLOAD_CONFIG = {
    "allowed_extensions": ['zip', 'pdf', 'png', 'jpg', 'jpeg', 'mp4', 'mp3', 'psd', 'ai', 'sketch', 'fig'],
    "max_file_size": 100,  # MB
    "categories": ['Art', 'Photography', 'Design', 'Audio', 'Video', 'Documents', 'Templates', 'Other']
}

# Download Configuration
DOWNLOAD_CONFIG = {
    "link_expiry_seconds": 60,
    "max_downloads_per_purchase": 10
}

# Analytics Configuration
ANALYTICS_CONFIG = {
    "chart_colors": ["#667eea", "#764ba2", "#10b981", "#3b82f6", "#f59e0b"],
    "date_format": "%Y-%m-%d",
    "currency_symbol": "$"
}
