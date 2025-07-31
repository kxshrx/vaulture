from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import RegisterSchema, LoginSchema, TokenSchema, UserResponse
from app.services.auth_service import create_user, authenticate_user
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register/creator", response_model=UserResponse)
def register_creator(user_data: RegisterSchema, db: Session = Depends(get_db)):
    """Register as creator (is_creator=True) - Creators can also purchase from other creators"""
    user = create_user(db, user_data, is_creator=True)
    return user

@router.post("/register/buyer", response_model=UserResponse)
def register_buyer(user_data: RegisterSchema, db: Session = Depends(get_db)):
    """Register as buyer (is_creator=False) - Pure buyers who don't sell content"""
    user = create_user(db, user_data, is_creator=False)
    return user

@router.post("/register", response_model=UserResponse)
def register_user(user_data: RegisterSchema, is_creator: bool = False, db: Session = Depends(get_db)):
    """General registration endpoint with optional creator flag"""
    user = create_user(db, user_data, is_creator=is_creator)
    return user

@router.post("/login", response_model=TokenSchema)
def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    """Login with JWT"""
    return authenticate_user(db, login_data.email, login_data.password)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user information with stats"""
    # Get purchase count for the user
    from app.models.purchase import Purchase
    total_purchases = db.query(Purchase).filter(Purchase.user_id == current_user.id).count()
    
    # Get creator stats if user is a creator
    total_products = 0
    total_sales = 0
    total_revenue = 0.0
    
    if current_user.is_creator:
        from app.models.product import Product
        from sqlalchemy import func
        
        # Get total products created
        total_products = db.query(Product).filter(Product.creator_id == current_user.id).count()
        
        # Get total sales and revenue
        sales_stats = db.query(
            func.count(Purchase.id).label('total_sales'),
            func.sum(Purchase.amount).label('total_revenue')
        ).join(Product).filter(Product.creator_id == current_user.id).first()
        
        if sales_stats:
            total_sales = sales_stats.total_sales or 0
            total_revenue = float(sales_stats.total_revenue or 0.0)
    
    user_response = {
        "id": current_user.id,
        "email": current_user.email,
        "is_creator": current_user.is_creator,
        "display_name": current_user.display_name,
        "bio": current_user.bio,
        "website": current_user.website,
        "social_links": current_user.social_links,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "total_products": total_products,
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "total_purchases": total_purchases,
        "member_since": current_user.created_at.isoformat() if current_user.created_at else None
    }
    
@router.post("/upgrade-to-creator", response_model=UserResponse)
def upgrade_to_creator(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Upgrade existing user to creator status"""
    if current_user.is_creator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a creator"
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
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "total_products": 0,  # New creator starts with 0
        "total_sales": 0,
        "total_revenue": 0.0,
        "total_purchases": 0,  # Will be calculated if needed
        "member_since": current_user.created_at.isoformat() if current_user.created_at else None
    }
    
    return user_response
