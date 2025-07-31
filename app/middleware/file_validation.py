"""
Flexible file validation for creator content platform
"""
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from typing import List

# Common file extensions for display purposes only
COMMON_FILE_TYPES = {
    'documents': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    'images': ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'tiff', 'webp'],
    'audio': ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'],
    'video': ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'],
    'archives': ['zip', 'rar', '7z', 'tar', 'gz'],
    'design': ['psd', 'ai', 'sketch', 'fig', 'xd'],
    'code': ['py', 'js', 'html', 'css', 'json', 'xml', 'cpp', 'java'],
    'ebooks': ['epub', 'mobi', 'azw3'],
    'fonts': ['ttf', 'otf', 'woff', 'woff2'],
    'data': ['csv', 'xlsx', 'xls', 'sql', 'db']
}

class FlexibleFileValidator:
    """Flexible file validation that doesn't restrict file types"""
    
    @staticmethod
    def validate_basic_file(file: UploadFile) -> None:
        """
        Basic file validation - only checks size and filename safety
        No file type restrictions for maximum creator freedom
        """
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check for dangerous filename patterns (security)
        dangerous_patterns = ['../', '.\\', '<script', '<?php']
        filename_lower = file.filename.lower()
        
        if any(pattern in filename_lower for pattern in dangerous_patterns):
            raise HTTPException(
                status_code=400,
                detail="Filename contains potentially dangerous content"
            )
        
        # Only validate file size - no type restrictions
        if hasattr(file, 'size') and file.size:
            max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
            if file.size > max_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
                )
    
    @staticmethod
    def validate_image_file(file: UploadFile) -> None:
        """Validate image files for thumbnails (still flexible)"""
        if not file.filename:
            return
            
        # More permissive image validation
        common_image_extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff']
        file_extension = file.filename.split('.')[-1].lower()
        
        # Only warn, don't block - let creators decide
        if file_extension not in common_image_extensions:
            # Don't raise error, just log or pass
            pass
    
    @staticmethod
    def get_file_info(file: UploadFile) -> dict:
        """Get file information for display purposes"""
        if not file.filename:
            return {"type": "unknown", "category": "other"}
        
        extension = file.filename.split('.')[-1].lower()
        
        # Categorize for display only, not restriction
        for category, extensions in COMMON_FILE_TYPES.items():
            if extension in extensions:
                return {"type": extension, "category": category}
        
        return {"type": extension, "category": "other"}
    
    @staticmethod
    def get_supported_categories() -> dict:
        """Return supported file categories for UI display"""
        return {
            "message": "All file types are supported! Upload any digital content you create.",
            "common_categories": COMMON_FILE_TYPES,
            "restrictions": {
                "file_types": "None - upload any file type",
                "max_size": f"{settings.MAX_FILE_SIZE_MB}MB",
                "security": "Only basic filename safety checks"
            }
        }
