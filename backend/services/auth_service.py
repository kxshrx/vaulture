from sqlalchemy.orm import Session
from backend.models.user import User
from backend.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from backend.core.config import settings
from backend.schemas.auth import RegisterSchema, LoginSchema
from fastapi import HTTPException, status


def create_user(db: Session, user_data: RegisterSchema, is_creator: bool = False):
    """Create a new user with validation and profile information"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user with profile information
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        is_creator=is_creator,
        display_name=user_data.display_name,
        bio=user_data.bio,
        website=user_data.website,
        social_links=user_data.social_links,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token for the new user
    access_token = create_access_token(
        data={"sub": str(user.id), "is_creator": user.is_creator}
    )

    # Return token and user data like the login endpoint
    user_data = {
        "id": user.id,
        "email": user.email,
        "is_creator": user.is_creator,
        "display_name": user.display_name,
        "bio": user.bio,
        "website": user.website,
        "social_links": user.social_links,
        "member_since": user.created_at,
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user_data,
    }


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user and return JWT token with expiration info"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "is_creator": user.is_creator}
    )

    # Add user info to response
    user_data = {
        "id": user.id,
        "email": user.email,
        "is_creator": user.is_creator,
        "display_name": user.display_name,
        "bio": user.bio,
        "website": user.website,
        "social_links": user.social_links,
        "member_since": user.created_at,
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        "user": user_data,
    }


def refresh_access_token(refresh_token: str):
    """Generate new access token from refresh token (simplified implementation)"""
    # In a real implementation, you would:
    # 1. Validate the refresh token
    # 2. Extract user info from it
    # 3. Generate a new access token
    # For now, we'll raise an exception as this is not implemented
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Refresh token functionality not implemented yet",
    )
