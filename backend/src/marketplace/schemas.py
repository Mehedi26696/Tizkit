from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from .models import MarketplaceItemType

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon_name: Optional[str] = "Box"

class CategoryRead(CategoryBase):
    id: UUID

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    item_id: UUID

class ReviewRead(ReviewBase):
    id: UUID
    user_id: UUID
    item_id: UUID
    created_at: datetime
    
    # Optional user info if needed
    username: Optional[str] = None

class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    item_type: MarketplaceItemType = MarketplaceItemType.TEMPLATE
    category_id: Optional[UUID] = None
    is_free: bool = True
    price: float = 0.0
    latex_content: Optional[str] = None
    preamble: Optional[str] = None
    preview_image_url: Optional[str] = None
    tags: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemRead(ItemBase):
    id: UUID
    user_id: UUID
    slug: str
    rating_avg: float
    review_count: int
    usage_count: int
    created_at: datetime
    updated_at: datetime
    
    # Joined info
    username: Optional[str] = None
    category_name: Optional[str] = None

class ItemList(BaseModel):
    items: List[ItemRead]
    total: int
