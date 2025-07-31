from pydantic import BaseModel, EmailStr, Field, validator
import re

class RegisterSchema(BaseModel):
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=50, description="Password (8-50 characters)")
    
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
    created_at: str
    
    class Config:
        from_attributes = True
