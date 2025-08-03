import uuid
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from backend.core.config import settings

class StorageService:
    def __init__(self):
        # Check if Supabase is properly configured
        self.use_supabase = (
            settings.SUPABASE_URL and 
            settings.SUPABASE_KEY and 
            settings.SUPABASE_URL != "https://your-project.supabase.co" and
            settings.SUPABASE_KEY != "your-service-role-key"
        )
        
        if self.use_supabase:
            from backend.core.supabase import get_supabase_admin_client
            self.supabase = get_supabase_admin_client()  # Use admin client for file operations
            self.bucket_name = "product-files"  # Main bucket for product files
            self.images_bucket = "product-images"  # Separate bucket for images
            print(f"✅ Using Supabase storage with admin privileges (buckets: {self.bucket_name}, {self.images_bucket})")
        else:
            # Fallback to local storage for development
            self.local_storage_path = Path(settings.UPLOAD_FOLDER)
            self.local_storage_path.mkdir(exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> None:
        """Flexible file validation - only checks size and basic security"""
        # Check file size
        if file.size and file.size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
            )
        
        # Basic filename security check (no file type restrictions)
        if file.filename:
            # Check for dangerous filename patterns
            dangerous_patterns = ['../', '.\\', '<script', '<?php']
            filename_lower = file.filename.lower()
            
            if any(pattern in filename_lower for pattern in dangerous_patterns):
                raise HTTPException(
                    status_code=400,
                    detail="Filename contains potentially dangerous content"
                )
            
            # No file type restrictions - creators can upload anything!
    
    def upload_file(self, file: UploadFile, file_type: str = "product", validate: bool = True) -> tuple[str, int, str]:
        """Upload file to Supabase storage or local storage and return (file_path, file_size, file_type)"""
        try:
            if validate:
                self.validate_file(file)
            
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
            
            # Read file content once
            file_content = file.file.read()
            file_size = len(file_content)
            
            if self.use_supabase:
                # Choose bucket based on file type
                bucket = self.images_bucket if file_type == "image" else self.bucket_name
                print(f"📤 Uploading {file.filename} to bucket: {bucket}")
                
                # Upload to Supabase
                response = self.supabase.storage.from_(bucket).upload(
                    unique_filename, 
                    file_content,
                    file_options={"cache-control": "3600", "upsert": "false"}
                )
                
                if hasattr(response, 'status_code') and response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Failed to upload file to Supabase")
                
                print(f"✅ Upload successful: {unique_filename}")
                return unique_filename, file_size, file_extension
            else:
                # Upload to local storage
                file_path = self.local_storage_path / unique_filename
                with open(file_path, "wb") as buffer:
                    buffer.write(file_content)
                
                return unique_filename, file_size, file_extension
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    def get_signed_url(self, file_path: str, expires_in: int = 60) -> str:
        """Generate signed URL for file download"""
        try:
            if self.use_supabase:
                response = self.supabase.storage.from_(self.bucket_name).create_signed_url(
                    file_path, expires_in
                )
                return response['signedURL']
            else:
                # For local storage, create time-limited token-based URL that requires authentication
                import time
                import hashlib
                current_time = int(time.time())
                expires_at = current_time + expires_in
                
                # Create a secure token based on file path and expiration
                token_data = f"{file_path}:{expires_at}:{settings.JWT_SECRET}"
                token = hashlib.md5(token_data.encode()).hexdigest()
                
                # Return URL that points to our secure endpoint (not static files)
                return f"http://localhost:8000/files/{file_path}?token={token}&expires={expires_at}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")

storage_service = StorageService()
