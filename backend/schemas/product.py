from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime
from backend.models.product import ProductCategory


class ProductCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Product title")
    description: Optional[str] = Field(
        None, max_length=2000, description="Product description"
    )
    price: float = Field(
        ..., gt=0, le=10000, description="Product price (must be positive, max $10,000)"
    )
    category: ProductCategory = Field(
        default=ProductCategory.OTHER, description="Product category"
    )
    tags: Optional[str] = Field(
        None, max_length=500, description="Comma-separated tags"
    )
    creator_name: str = Field(..., description="Creator name")

    @validator("price")
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError("Price must be greater than 0")
        return round(v, 2)  # Round to 2 decimal places

    @validator("tags")
    def validate_tags(cls, v):
        if v:
            # Clean up tags: remove extra spaces, convert to lowercase
            tags = [tag.strip().lower() for tag in v.split(",") if tag.strip()]
            return ",".join(tags[:10])  # Limit to 10 tags
        return v


class ProductResponse(BaseModel):
    id: int
    creator_id: int
    creator_name: str
    title: str
    description: Optional[str]
    price: float
    category: ProductCategory
    tags: Optional[str]
    file_url: Optional[str]
    image_url: Optional[str]
    image_urls: Optional[List[str]] = None  # Additional product images
    file_size: Optional[int]
    file_type: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: int
    creator_name: str
    title: str
    description: Optional[str]
    price: float
    category: ProductCategory
    tags: Optional[str]
    image_url: Optional[str]
    image_urls: Optional[List[str]] = None  # Additional product images
    file_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProductSearchParams(BaseModel):
    query: Optional[str] = Field(
        None, description="Search query for title, description, or tags"
    )
    category: Optional[ProductCategory] = Field(None, description="Filter by category")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price filter")
    creator_name: Optional[str] = Field(None, description="Filter by creator name")
    tags: Optional[str] = Field(None, description="Filter by tags (comma-separated)")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(10, ge=1, le=100, description="Number of items per page")
    sort_by: Optional[str] = Field(
        "created_at", description="Sort field: created_at, price, title"
    )
    sort_order: Optional[str] = Field("desc", description="Sort order: asc or desc")

    @validator("sort_by")
    def validate_sort_by(cls, v):
        allowed_fields = ["created_at", "price", "title", "category"]
        if v not in allowed_fields:
            raise ValueError(f"sort_by must be one of: {allowed_fields}")
        return v

    @validator("sort_order")
    def validate_sort_order(cls, v):
        if v.lower() not in ["asc", "desc"]:
            raise ValueError('sort_order must be "asc" or "desc"')
        return v.lower()


class ProductSearchResponse(BaseModel):
    products: List[ProductListResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
