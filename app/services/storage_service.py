import uuid
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.core.config import settings

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
            from app.core.supabase import get_supabase_client
            self.supabase = get_supabase_client()
            self.bucket_name = "products"
        else:
            # Fallback to local storage for development
            self.local_storage_path = Path("uploads")
            self.local_storage_path.mkdir(exist_ok=True)
    
    def upload_file(self, file: UploadFile) -> str:
        """Upload file to Supabase storage or local storage and return file path"""
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
            
            if self.use_supabase:
                # Upload to Supabase
                file_content = file.file.read()
                response = self.supabase.storage.from_(self.bucket_name).upload(
                    unique_filename, file_content
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Failed to upload file to Supabase")
                
                return unique_filename
            else:
                # Upload to local storage
                file_path = self.local_storage_path / unique_filename
                with open(file_path, "wb") as buffer:
                    content = file.file.read()
                    buffer.write(content)
                
                return unique_filename
                
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
                # For local storage, return a simple file URL
                # In production, you would use a proper file server
                return f"http://localhost:8000/files/{file_path}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")

storage_service = StorageService()
