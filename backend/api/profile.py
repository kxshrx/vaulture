"""
User profile management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.db.session import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.product import Product
from backend.models.purchase import Purchase
from backend.schemas.user_profile import (
    UserProfileUpdate, 
    PasswordChangeRequest, 
    UserProfileResponse, 
    PublicProfileResponse
)
from backend.services.user_profile_service import (
    get_user_profile,
    get_public_profile,
    update_user_profile,
    change_user_password,
    search_users
)

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's complete profile with private information and stats"""
    return get_user_profile(db, current_user.id)

@router.get("/{user_id}", response_model=PublicProfileResponse)
def get_public_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get public profile information for any user by ID"""
    return get_public_profile(db, user_id)

@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information
    
    Available fields:
    - display_name: Your public display name (2-50 characters)
    - bio: Tell others about yourself (max 500 characters)
    - website: Your website or portfolio URL
    - social_links: Links to your social media profiles
    """
    return update_user_profile(db, current_user.id, profile_data)

@router.post("/me/change-password")
def change_my_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password
    
    Requires:
    - current_password: Your current password
    - new_password: New password (8-50 chars, must contain letters and numbers)
    - confirm_password: Confirm the new password
    """
    return change_user_password(db, current_user.id, password_data)



@router.get("/search/users")
def search_user_profiles(
    query: str = Query(..., min_length=2, description="Search by display name or email"),
    user_type: Optional[str] = Query(None, description="Filter by user type: 'creator' or 'buyer'"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    db: Session = Depends(get_db)
):
    """
    Search for users by display name or email
    
    Returns public profiles only - no private information
    """
    return search_users(db, query, user_type, limit)



@router.delete("/me")
def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ⚠️ Delete current user account (PERMANENT)
    
    This will:
    - Delete the user account
    - Mark all products as inactive (soft delete)
    - Preserve purchase records for data integrity
    """
    # Soft delete products instead of hard delete
    if current_user.is_creator:
        products = db.query(Product).filter(Product.creator_id == current_user.id).all()
        for product in products:
            product.is_active = False
    
    # Delete the user
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}


