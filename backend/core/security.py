from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.db.session import get_db
from backend.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Truncate password to 72 bytes for bcrypt compatibility
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        # Handle bcrypt errors gracefully
        if "password cannot be longer than 72 bytes" in str(e):
            # Try with truncated password
            truncated = plain_password[:72]
            return pwd_context.verify(truncated, hashed_password)
        raise


def get_password_hash(password: str) -> str:
    # Truncate password to 72 bytes for bcrypt compatibility
    if isinstance(password, str):
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_optional(request):
    """Get current user if authenticated, otherwise return None"""
    try:
        token = None

        # Try to get token from Authorization header first
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        # If no header, try to get from cookies (for browser requests)
        if not token:
            token = request.cookies.get("vaulture_token")

        # If no cookie, try query parameter (as fallback)
        if not token:
            token = request.query_params.get("token")

        if not token:
            return None

        user_id = verify_token(token)

        # Get database session
        from backend.db.session import SessionLocal

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            return user
        finally:
            db.close()
    except:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    user_id = verify_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_creator(user: User = Depends(get_current_user)):
    """Require user to be a creator for creator-only endpoints"""
    if not user.is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only creators allowed"
        )
    return user


def allow_creator_purchases(user: User = Depends(get_current_user)):
    """Allow both creators and buyers to make purchases - creators can buy from other creators"""
    return user  # Any authenticated user can purchase
