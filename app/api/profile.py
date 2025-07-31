"""
User profile management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.purchase import Purchase
from app.schemas.user_profile import (
    UserProfileUpdate, 
    PasswordChangeRequest, 
    UserProfileResponse, 
    PublicProfileResponse
)
from app.services.user_profile_service import (
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

@router.get("/{user_id}", response_model=PublicProfileResponse)
def get_user_public_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get public profile of any user (no private information)"""
    return get_public_profile(db, user_id)

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

@router.get("/creators/featured")
def get_featured_creators(
    limit: int = Query(10, ge=1, le=50, description="Number of creators to return"),
    db: Session = Depends(get_db)
):
    """Get featured creators with most products or sales"""
    # Get creators with most products
    creators = search_users(db, "", "creator", limit * 2)  # Get more to filter
    
    # Sort by number of products (if available)
    featured = sorted(
        [c for c in creators if c.total_products and c.total_products > 0],
        key=lambda x: x.total_products or 0,
        reverse=True
    )[:limit]
    
    return {
        "featured_creators": featured,
        "total_found": len(featured)
    }

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

@router.get("/me/stats")
def get_my_detailed_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed statistics for current user"""
    if current_user.is_creator:
        # Creator detailed stats
        products = db.query(Product).filter(
            Product.creator_id == current_user.id,
            Product.is_active == True
        ).all()
        
        sales_by_product = {}
        revenue_by_product = {}
        
        for product in products:
            sales_count = db.query(Purchase).filter(Purchase.product_id == product.id).count()
            revenue = sales_count * product.price
            sales_by_product[product.title] = sales_count
            revenue_by_product[product.title] = revenue
        
        return {
            "user_type": "creator",
            "total_products": len(products),
            "active_products": len(products),
            "sales_by_product": sales_by_product,
            "revenue_by_product": revenue_by_product,
            "total_revenue": sum(revenue_by_product.values()),
            "average_price": sum(p.price for p in products) / len(products) if products else 0
        }
    else:
        # Buyer detailed stats
        purchases = db.query(Purchase).filter(Purchase.user_id == current_user.id).all()
        
        purchases_by_category = {}
        total_spent = 0
        
        for purchase in purchases:
            product = db.query(Product).filter(Product.id == purchase.product_id).first()
            if product:
                category = product.category.value
                purchases_by_category[category] = purchases_by_category.get(category, 0) + 1
                total_spent += product.price
        
        return {
            "user_type": "buyer",
            "total_purchases": len(purchases),
            "purchases_by_category": purchases_by_category,
            "total_spent": total_spent,
            "average_purchase_price": total_spent / len(purchases) if purchases else 0
        }
