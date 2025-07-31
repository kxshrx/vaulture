"""
User profile management service
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.product import Product
from app.models.purchase import Purchase
from app.schemas.user_profile import UserProfileUpdate, PasswordChangeRequest, UserProfileResponse, PublicProfileResponse
from app.core.security import get_password_hash, verify_password
from fastapi import HTTPException, status
from typing import Optional

def get_user_profile(db: Session, user_id: int) -> UserProfileResponse:
    """Get complete user profile with stats"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user stats
    stats = {}
    if user.is_creator:
        # Creator stats
        total_products = db.query(Product).filter(
            Product.creator_id == user_id,
            Product.is_active == True
        ).count()
        
        total_sales = db.query(Purchase).join(
            Product, Purchase.product_id == Product.id
        ).filter(Product.creator_id == user_id).count()
        
        total_revenue = db.query(func.sum(Product.price)).join(
            Purchase, Purchase.product_id == Product.id
        ).filter(Product.creator_id == user_id).scalar() or 0
        
        stats = {
            "total_products": total_products,
            "total_sales": total_sales,
            "total_revenue": float(total_revenue)
        }
    else:
        # Buyer stats
        total_purchases = db.query(Purchase).filter(Purchase.user_id == user_id).count()
        stats = {"total_purchases": total_purchases}
    
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        is_creator=user.is_creator,
        display_name=user.display_name,
        bio=user.bio,
        website=user.website,
        social_links=user.social_links,
        member_since=user.created_at,
        **stats
    )

def get_public_profile(db: Session, user_id: int) -> PublicProfileResponse:
    """Get public profile information (no email or private stats)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Only show products count for creators in public profile
    total_products = None
    if user.is_creator:
        total_products = db.query(Product).filter(
            Product.creator_id == user_id,
            Product.is_active == True
        ).count()
    
    return PublicProfileResponse(
        id=user.id,
        display_name=user.display_name,
        bio=user.bio,
        website=user.website,
        social_links=user.social_links,
        is_creator=user.is_creator,
        member_since=user.created_at,
        total_products=total_products
    )

def update_user_profile(db: Session, user_id: int, profile_data: UserProfileUpdate) -> UserProfileResponse:
    """Update user profile information"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields that are provided
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    # Return updated profile with stats
    return get_user_profile(db, user_id)

def change_user_password(db: Session, user_id: int, password_data: PasswordChangeRequest) -> dict:
    """Change user password"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Check if new password is different from current
    if verify_password(password_data.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    # Update password
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

def search_users(db: Session, query: str, user_type: Optional[str] = None, limit: int = 20):
    """Search users by display name or email (for public profiles)"""
    search_query = db.query(User)
    
    if query:
        search_term = f"%{query.lower()}%"
        search_query = search_query.filter(
            (func.lower(User.display_name).like(search_term)) |
            (func.lower(User.email).like(search_term))
        )
    
    if user_type == "creator":
        search_query = search_query.filter(User.is_creator == True)
    elif user_type == "buyer":
        search_query = search_query.filter(User.is_creator == False)
    
    users = search_query.limit(limit).all()
    
    # Return public profiles only
    return [
        PublicProfileResponse(
            id=user.id,
            display_name=user.display_name,
            bio=user.bio,
            website=user.website,
            social_links=user.social_links,
            is_creator=user.is_creator,
            member_since=user.created_at,
            total_products=db.query(Product).filter(
                Product.creator_id == user.id,
                Product.is_active == True
            ).count() if user.is_creator else None
        )
        for user in users
    ]
