from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.schemas.auth import (
    RegisterSchema,
    LoginSchema,
    TokenSchema,
    UserResponse,
    RefreshTokenSchema,
)
from backend.services.auth_service import (
    create_user,
    authenticate_user,
    refresh_access_token,
)
from backend.core.security import get_current_user

router = APIRouter()


@router.post("/register/creator", response_model=TokenSchema)
def register_creator(user_data: RegisterSchema, db: Session = Depends(get_db)):
    """Register as creator - Can sell products and also purchase from other creators"""
    return create_user(db, user_data, is_creator=True)


@router.post("/register/buyer", response_model=TokenSchema)
def register_buyer(user_data: RegisterSchema, db: Session = Depends(get_db)):
    """Register as buyer - Can only purchase, cannot sell products"""
    return create_user(db, user_data, is_creator=False)


@router.post("/login", response_model=TokenSchema)
def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    """Login with JWT - Works for both creators and buyers"""
    return authenticate_user(db, login_data.email, login_data.password)


@router.post("/upgrade-to-creator", response_model=UserResponse)
def upgrade_to_creator(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Upgrade existing buyer to creator status - For users who want to start selling"""
    if current_user.is_creator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a creator"
        )

    # Update user to creator
    current_user.is_creator = True
    db.commit()
    db.refresh(current_user)

    # Return updated user info with stats
    user_response = {
        "id": current_user.id,
        "email": current_user.email,
        "is_creator": current_user.is_creator,
        "display_name": current_user.display_name,
        "bio": current_user.bio,
        "website": current_user.website,
        "social_links": current_user.social_links,
        "created_at": (
            current_user.created_at.isoformat() if current_user.created_at else None
        ),
        "total_products": 0,  # New creator starts with 0
        "total_sales": 0,
        "total_revenue": 0.0,
        "total_purchases": 0,  # Will be calculated if needed
        "member_since": (
            current_user.created_at.isoformat() if current_user.created_at else None
        ),
    }

    return user_response


@router.post("/refresh", response_model=TokenSchema)
def refresh_token(refresh_data: RefreshTokenSchema, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        return refresh_access_token(refresh_data.refresh_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )


@router.post("/logout")
def logout(current_user=Depends(get_current_user)):
    """Logout endpoint - In a stateless JWT system, logout is handled client-side"""
    # In a real implementation, you might want to:
    # 1. Add the token to a blacklist
    # 2. Log the logout event
    # 3. Invalidate refresh tokens

    return {"message": "Successfully logged out"}
