from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class RegisterSchema(BaseModel):
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=50, description="Password (8-50 characters)")
    display_name: Optional[str] = Field(None, min_length=2, max_length=50, description="Display name (2-50 characters)")
    bio: Optional[str] = Field(None, max_length=500, description="User bio (max 500 characters)")
    website: Optional[str] = Field(None, max_length=200, description="Website URL")
    social_links: Optional[dict] = Field(None, description="Social media links")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 50:
            raise ValueError('Password must be less than 50 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Display name must be at least 2 characters')
        return v.strip() if v else v
    
    @validator('website')
    def validate_website(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('Website must start with http:// or https://')
        return v
    
    @validator('social_links')
    def validate_social_links(cls, v):
        if v:
            allowed_platforms = ['twitter', 'instagram', 'linkedin', 'github', 'youtube', 'tiktok', 'facebook']
            for platform, url in v.items():
                if platform not in allowed_platforms:
                    raise ValueError(f'Social platform "{platform}" not supported. Allowed: {", ".join(allowed_platforms)}')
                if not isinstance(url, str) or len(url) > 200:
                    raise ValueError(f'Social link for {platform} must be a string under 200 characters')
        return v

class LoginSchema(BaseModel):
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=1, description="Password")

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration time in seconds")

class UserResponse(BaseModel):
    id: int
    email: str
    is_creator: bool
    display_name: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    social_links: Optional[dict]
    created_at: str
    # Additional computed fields for creator stats
    total_products: Optional[int] = 0
    total_sales: Optional[int] = 0
    total_revenue: Optional[float] = 0.0
    total_purchases: Optional[int] = 0
    member_since: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=50, description="Display name (2-50 characters)")
    bio: Optional[str] = Field(None, max_length=500, description="User bio (max 500 characters)")
    website: Optional[str] = Field(None, max_length=200, description="Website URL")
    social_links: Optional[dict] = Field(None, description="Social media links")
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError('Display name must be at least 2 characters')
        return v.strip() if v else v
    
    @validator('website')
    def validate_website(cls, v):
        if v and not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('Website must start with http:// or https://')
        return v
    
    @validator('social_links')
    def validate_social_links(cls, v):
        if v:
            allowed_platforms = ['twitter', 'instagram', 'linkedin', 'github', 'youtube', 'tiktok', 'facebook']
            for platform, url in v.items():
                if platform not in allowed_platforms:
                    raise ValueError(f'Social platform "{platform}" not supported. Allowed: {", ".join(allowed_platforms)}')
                if not isinstance(url, str) or len(url) > 200:
                    raise ValueError(f'Social link for {platform} must be a string under 200 characters')
        return v

class ChangePasswordSchema(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=50, description="New password (8-50 characters)")
    confirm_password: str = Field(..., description="Confirm new password")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        if len(v) > 50:
            raise ValueError('New password must be less than 50 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('New password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('New password must contain at least one number')
        return v
    
    @validator('confirm_password')
    def validate_confirm_password(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Password confirmation does not match')
        return v

class UserProfileResponse(BaseModel):
    id: int
    email: str
    is_creator: bool
    display_name: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    social_links: Optional[dict]
    created_at: str
    # Creator-specific fields
    total_products: Optional[int] = None
    total_sales: Optional[int] = None
    total_revenue: Optional[float] = None
    # Buyer-specific fields
    total_purchases: Optional[int] = None
    
    class Config:
        from_attributes = True

class PublicProfileResponse(BaseModel):
    """Public profile information that can be viewed by anyone"""
    id: int
    display_name: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    social_links: Optional[dict]
    is_creator: bool
    created_at: str
    # Public stats
    total_products: Optional[int] = None
    
    class Config:
        from_attributes = True
