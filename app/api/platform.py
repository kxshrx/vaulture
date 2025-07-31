"""
Platform statistics and public information endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.platform_analytics import (
    get_platform_stats, 
    get_popular_products,
    get_category_stats,
    get_recent_products
)
from app.schemas.file_upload import get_file_type_info
from app.core.config import settings

router = APIRouter()

@router.get("/stats")
def get_platform_statistics(db: Session = Depends(get_db)):
    """Get overall platform statistics (public)"""
    return get_platform_stats(db)

@router.get("/popular")
def get_popular_products_endpoint(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get most popular products by sales"""
    return get_popular_products(db, limit)

@router.get("/recent")
def get_recent_products_endpoint(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recently added products"""
    return get_recent_products(db, limit)

@router.get("/categories/stats")
def get_category_statistics(db: Session = Depends(get_db)):
    """Get statistics by product category"""
    return get_category_stats(db)

@router.get("/file-types")
def get_supported_file_types():
    """Get information about file upload policy (no restrictions!)"""
    return {
        "policy": "🎉 NO FILE TYPE RESTRICTIONS!",
        "message": "Upload ANY digital content you create - we believe in creator freedom!",
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
        "security": "Only basic filename safety and size checks",
        "examples": [
            "📄 Documents: PDF, DOCX, TXT, MD, etc.",
            "🖼️ Images: PNG, JPG, GIF, SVG, WebP, TIFF, etc.",
            "🎵 Audio: MP3, WAV, FLAC, OGG, AAC, etc.",
            "🎬 Video: MP4, AVI, MOV, WebM, MKV, etc.",
            "📦 Archives: ZIP, RAR, 7Z, TAR, etc.",
            "🎨 Design: PSD, AI, Sketch, Figma, XD, etc.",
            "💻 Code: Any programming language files",
            "📚 E-books: EPUB, MOBI, AZW3, etc.",
            "🔤 Fonts: TTF, OTF, WOFF, etc.",
            "🎮 Games: Unity packages, executable files, etc.",
            "📊 Data: CSV, JSON, XML, databases, etc.",
            "✨ And literally ANY other digital content!"
        ],
        "philosophy": "Creators know best what they want to share. We don't limit creativity!"
    }

@router.get("/info")
def get_platform_info():
    """Get general platform information"""
    return {
        "name": "Vaulture",
        "description": "A secure digital content platform for creators",
        "version": "1.0.0",
        "features": [
            "Secure file delivery",
            "Multiple payment options",
            "Creator analytics",
            "Advanced search and filtering",
            "Category-based organization",
            "Time-limited download links"
        ],
        "supported_categories": [
            "Digital Art",
            "Photography", 
            "Music",
            "Video",
            "E-books",
            "Software",
            "Templates",
            "Courses",
            "Fonts",
            "Graphics"
        ]
    }
