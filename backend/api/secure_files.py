from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pathlib import Path
import time
import hashlib
from backend.core.config import settings

router = APIRouter()


@router.get("/files/{file_path:path}")
async def serve_secure_file(
    file_path: str,
    token: str = Query(..., description="Security token"),
    expires: int = Query(..., description="Expiration timestamp"),
):
    """
    Secure file serving with time-limited access
    
    - Validates token matches file_path + expires + secret
    - Checks if link has expired
    - Streams file if valid
    - Returns 403 if token invalid or expired
    """
    
    # STEP 1: Check if link has expired
    current_time = int(time.time())
    if current_time > expires:
        raise HTTPException(
            status_code=403,
            detail="Download link has expired. Please request a new download link."
        )
    
    # STEP 2: Validate token
    expected_token_data = f"{file_path}:{expires}:{settings.JWT_SECRET}"
    expected_token = hashlib.md5(expected_token_data.encode()).hexdigest()
    
    if token != expected_token:
        raise HTTPException(
            status_code=403,
            detail="Invalid download token"
        )
    
    # STEP 3: Check if file exists
    upload_folder = Path(settings.UPLOAD_FOLDER)
    full_file_path = upload_folder / file_path
    
    if not full_file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # STEP 4: Verify file is within uploads directory (security check)
    try:
        full_file_path.resolve().relative_to(upload_folder.resolve())
    except ValueError:
        # File is outside uploads directory - potential path traversal attack
        raise HTTPException(status_code=403, detail="Access denied")
    
    # STEP 5: Stream the file
    return FileResponse(
        path=str(full_file_path),
        filename=file_path.split("/")[-1],
        media_type="application/octet-stream"
    )
