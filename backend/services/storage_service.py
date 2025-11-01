import uuid
import os
import time
import hashlib
from pathlib import Path
from fastapi import UploadFile, HTTPException
from backend.core.config import settings


class StorageService:
    def __init__(self):
        # Use local file storage
        self.local_storage_path = Path(settings.UPLOAD_FOLDER)
        self.local_storage_path.mkdir(parents=True, exist_ok=True)
        print(f"Using local file storage at: {self.local_storage_path.absolute()}")

    def validate_file(self, file: UploadFile) -> None:
        """Flexible file validation - only checks size and basic security"""
        # Check file size
        if file.size and file.size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
            )

        # Basic filename security check (no file type restrictions)
        if file.filename:
            # Check for dangerous filename patterns
            dangerous_patterns = ["../", ".\\", "<script", "<?php"]
            filename_lower = file.filename.lower()

            if any(pattern in filename_lower for pattern in dangerous_patterns):
                raise HTTPException(
                    status_code=400,
                    detail="Filename contains potentially dangerous content",
                )

            # No file type restrictions - creators can upload anything!

    def upload_file(
        self, file: UploadFile, file_type: str = "product", validate: bool = True
    ) -> tuple[str, int, str]:
        """Upload file to local storage and return (file_path, file_size, file_type)"""
        try:
            if validate:
                self.validate_file(file)

            # Generate unique filename
            file_extension = (
                file.filename.split(".")[-1] if "." in file.filename else ""
            )
            unique_filename = (
                f"{uuid.uuid4()}.{file_extension}"
                if file_extension
                else str(uuid.uuid4())
            )

            # Read file content once
            file_content = file.file.read()
            file_size = len(file_content)

            # Upload to local storage
            file_path = self.local_storage_path / unique_filename
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)

            print(f"Upload successful: {unique_filename} ({file_size} bytes)")
            return unique_filename, file_size, file_extension

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    def get_signed_url(self, file_path: str, expires_in: int = 60) -> str:
        """Generate time-limited signed URL for secure file download"""
        try:
            # Verify file exists
            full_path = self.local_storage_path / file_path
            if not full_path.exists():
                raise HTTPException(status_code=404, detail="File not found")

            # Create time-limited token
            current_time = int(time.time())
            expires_at = current_time + expires_in

            # Create a secure token based on file path and expiration
            token_data = f"{file_path}:{expires_at}:{settings.JWT_SECRET}"
            token = hashlib.md5(token_data.encode()).hexdigest()

            # Get base URL from settings or environment
            base_url = os.getenv("API_BASE_URL", "http://localhost:8000")

            # Return URL that points to our secure endpoint (not static files)
            signed_url = f"{base_url}/files/{file_path}?token={token}&expires={expires_at}"
            print(f"Signed URL created for {file_path} (expires in {expires_in}s)")
            return signed_url

        except Exception as e:
            print(f"Signed URL creation failed: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to generate download URL: {str(e)}"
            )


storage_service = StorageService()
