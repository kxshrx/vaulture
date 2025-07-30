from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import RegisterSchema, LoginSchema, TokenSchema, UserResponse
from app.services.auth_service import create_user, authenticate_user
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register/creator", response_model=UserResponse)
def register_creator(user_data: RegisterSchema, db: Session = Depends(get_db)):
    """Register as creator (is_creator=True)"""
    user = create_user(db, user_data, is_creator=True)
    return user

@router.post("/register/buyer", response_model=UserResponse)
def register_buyer(user_data: RegisterSchema, db: Session = Depends(get_db)):
    """Register as buyer (is_creator=False)"""
    user = create_user(db, user_data, is_creator=False)
    return user

@router.post("/login", response_model=TokenSchema)
def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    """Login with JWT"""
    return authenticate_user(db, login_data.email, login_data.password)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    return current_user
