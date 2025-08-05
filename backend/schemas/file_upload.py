"""
File upload validation schemas and utilities
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from fastapi import UploadFile, HTTPException
from backend.core.config import settings


class FileUploadSchema(BaseModel):
    """Schema for validating file upload parameters"""

    filename: str = Field(..., description="Original filename")
    content_type: Optional[str] = Field(None, description="MIME content type")
    size: int = Field(..., ge=1, description="File size in bytes")

    @validator("filename")
    def validate_filename(cls, v):
        if not v or not v.strip():
            raise ValueError("Filename cannot be empty")

        # Check for dangerous characters (security only)
        dangerous_chars = ["..", "<", ">", "|", '"']
        if any(char in v for char in dangerous_chars):
            raise ValueError("Filename contains invalid characters")

        # No file extension restrictions - creators freedom!
        # Just ensure there is an extension for clarity
        if "." not in v:
            raise ValueError("File should have an extension (e.g., .pdf, .zip, .mp3)")

        return v

    @validator("size")
    def validate_file_size(cls, v):
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if v > max_size:
            raise ValueError(f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
        return v


class ImageUploadSchema(BaseModel):
    """Schema for validating image upload parameters"""

    filename: str = Field(..., description="Original filename")
    content_type: Optional[str] = Field(None, description="MIME content type")
    size: int = Field(
        ..., ge=1, le=50 * 1024 * 1024, description="Image size in bytes (max 50MB)"
    )

    @validator("filename")
    def validate_image_filename(cls, v):
        if not v or not v.strip():
            raise ValueError("Filename cannot be empty")

        if "." not in v:
            raise ValueError("Image file must have an extension")

        extension = v.split(".")[-1].lower()
        allowed_image_types = ["png", "jpg", "jpeg", "gif", "svg", "webp"]

        if extension not in allowed_image_types:
            raise ValueError(
                f'Image type "{extension}" not allowed. Allowed: {", ".join(allowed_image_types)}'
            )

        return v


def validate_upload_file(file: UploadFile, is_image: bool = False) -> None:
    """
    Validate an uploaded file

    Args:
        file: FastAPI UploadFile object
        is_image: Whether this is an image file (applies stricter validation)
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Check file size (if available from headers)
    file_size = 0
    if hasattr(file, "size") and file.size:
        file_size = file.size
    else:
        # Read content to get size
        content = file.file.read()
        file_size = len(content)
        file.file.seek(0)  # Reset file pointer

    try:
        if is_image:
            ImageUploadSchema(
                filename=file.filename, content_type=file.content_type, size=file_size
            )
        else:
            FileUploadSchema(
                filename=file.filename, content_type=file.content_type, size=file_size
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Creator-friendly file policy
CREATOR_FILE_POLICY = {
    "file_type_restrictions": False,  # No restrictions on file types
    "philosophy": "Creators should have complete freedom to upload any digital content they create",
    "only_restrictions": ["file_size", "filename_security"],
    "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
    "examples_welcome": [
        "Any image format (PNG, JPG, WebP, TIFF, etc.)",
        "Any document (PDF, DOCX, TXT, Markdown, etc.)",
        "Any audio (MP3, WAV, FLAC, OGG, etc.)",
        "Any video (MP4, AVI, MOV, WebM, etc.)",
        "Any archive (ZIP, RAR, 7Z, etc.)",
        "Any code files (PY, JS, HTML, etc.)",
        "Any design files (PSD, AI, Sketch, etc.)",
        "Any other digital content you create!",
    ],
}


def get_file_type_info() -> dict:
    """Get information about file upload policy (no restrictions!)"""
    return {
        "policy": "No file type restrictions - upload anything!",
        "max_size_mb": settings.MAX_FILE_SIZE_MB,
        "restrictions": CREATOR_FILE_POLICY,
        "security_note": "Only basic filename safety checks are performed",
        "common_categories": {
            "documents": ["pdf", "doc", "docx", "txt", "md", "rtf"],
            "images": ["png", "jpg", "jpeg", "gif", "svg", "webp", "tiff"],
            "audio": ["mp3", "wav", "flac", "ogg", "aac"],
            "video": ["mp4", "avi", "mov", "mkv", "webm"],
            "archives": ["zip", "rar", "7z", "tar"],
            "design": ["psd", "ai", "sketch", "fig", "xd"],
            "code": ["py", "js", "html", "css", "json"],
            "other": ["Any file type you create!"],
        },
        "message": "Upload any digital content you've created - we trust creators to know what they're sharing!",
    }
