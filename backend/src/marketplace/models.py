from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime, Text, Float, Integer
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime, timezone
from enum import Enum

if TYPE_CHECKING:
    from ..auth.models.user import User


class MarketplaceItemType(str, Enum):
    TEMPLATE = "template"
    PROJECT = "project"


class MarketplaceCategory(SQLModel, table=True):
    """Categories for marketplace items (e.g., CV, Thesis, Resume, Diagram)"""
    __tablename__ = "marketplace_categories"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=100, unique=True)
    slug: str = Field(max_length=100, unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=500)
    icon_name: Optional[str] = Field(default="Box")  # Lucide icon name
    
    # Relationships
    items: List["MarketplaceItem"] = Relationship(back_populates="category")


class MarketplaceItem(SQLModel, table=True):
    """Public items shared in the marketplace"""
    __tablename__ = "marketplace_items"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    category_id: UUID = Field(foreign_key="marketplace_categories.id", index=True)
    
    title: str = Field(max_length=255)
    slug: str = Field(max_length=255, unique=True, index=True)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    item_type: MarketplaceItemType = Field(default=MarketplaceItemType.TEMPLATE)
    
    # Content (could be a copy of project contents)
    latex_content: Optional[str] = Field(default=None, sa_column=Column(Text))
    preamble: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Stats
    rating_avg: float = Field(default=0.0, sa_column=Column(Float))
    review_count: int = Field(default=0, sa_column=Column(Integer))
    usage_count: int = Field(default=0, sa_column=Integer)
    
    # Monetization
    is_free: bool = Field(default=True)
    price: float = Field(default=0.0, sa_column=Column(Float))
    
    # Metadata
    preview_image_url: Optional[str] = Field(default=None)
    tags: Optional[str] = Field(default=None)  # Comma-separated tags
    
    is_public: bool = Field(default=True)
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    
    # Relationships
    category: Optional[MarketplaceCategory] = Relationship(back_populates="items")
    reviews: List["MarketplaceReview"] = Relationship(
        back_populates="item",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class MarketplaceReview(SQLModel, table=True):
    """Reviews and ratings for marketplace items"""
    __tablename__ = "marketplace_reviews"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    item_id: UUID = Field(foreign_key="marketplace_items.id", index=True)
    
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    
    # Relationships
    item: Optional[MarketplaceItem] = Relationship(back_populates="reviews")
