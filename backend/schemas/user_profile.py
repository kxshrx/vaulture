"""
User profile management schemas and utilities
"""

from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict
from datetime import datetime


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information"""

    display_name: Optional[str] = Field(
        None, min_length=2, max_length=100, description="Display name"
    )
    bio: Optional[str] = Field(None, max_length=500, description="User biography")
    website: Optional[str] = Field(None, max_length=200, description="Website URL")
    social_links: Optional[Dict[str, str]] = Field(
        None, description="Social media links"
    )

    @validator("display_name")
    def validate_display_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Display name must be at least 2 characters")
        return v.strip() if v else v

    @validator("website")
    def validate_website(cls, v):
        if v and not (v.startswith("http://") or v.startswith("https://")):
            return f"https://{v}"
        return v

    @validator("social_links")
    def validate_social_links(cls, v):
        if v:
            allowed_platforms = [
                "twitter",
                "instagram",
                "linkedin",
                "github",
                "youtube",
                "tiktok",
                "facebook",
            ]
            for platform, url in v.items():
                if platform not in allowed_platforms:
                    raise ValueError(
                        f'Social platform "{platform}" not supported. Allowed: {", ".join(allowed_platforms)}'
                    )
                if not isinstance(url, str) or len(url) > 200:
                    raise ValueError(
                        f"Social link for {platform} must be a string under 200 characters"
                    )
        return v


class UserProfileResponse(BaseModel):
    """Response schema for user profile"""

    id: int
    email: EmailStr
    is_creator: bool
    display_name: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    social_links: Optional[Dict[str, str]]
    # Creator stats
    total_products: Optional[int] = 0
    total_sales: Optional[int] = 0
    total_revenue: Optional[float] = 0.0
    # Buyer stats
    total_purchases: Optional[int] = 0
    member_since: datetime

    class Config:
        from_attributes = True


class PublicProfileResponse(BaseModel):
    """Public profile (visible to anyone)"""

    id: int
    display_name: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    social_links: Optional[Dict[str, str]]
    is_creator: bool
    total_products: Optional[int] = None  # Only for creators
    member_since: datetime

    class Config:
        from_attributes = True


class PasswordChangeRequest(BaseModel):
    """Schema for password change requests"""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(
        ..., min_length=8, max_length=50, description="New password"
    )
    confirm_password: str = Field(..., description="Confirm new password")

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v

    @validator("new_password")
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v
