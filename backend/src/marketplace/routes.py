from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
import re

from ..utils.database import get_session
from ..auth.routes.auth_routes import get_current_user
from ..auth.models.user import User
from .models import MarketplaceCategory, MarketplaceItem, MarketplaceReview, MarketplaceItemType
from .schemas import (
    ItemCreate, ItemRead, ItemList, 
    CategoryRead, ReviewCreate, ReviewRead
)

marketplace_router = APIRouter()

# Helper to generate slug
def generate_slug(title: str) -> str:
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug

@marketplace_router.get("/categories", response_model=List[CategoryRead])
def get_categories(session: Session = Depends(get_session)):
    """Get all marketplace categories."""
    return session.exec(select(MarketplaceCategory)).all()

@marketplace_router.get("/items", response_model=ItemList)
def list_items(
    session: Session = Depends(get_session),
    category_id: Optional[UUID] = None,
    item_type: Optional[MarketplaceItemType] = None,
    search: Optional[str] = None,
    user_id: Optional[UUID] = None,
    sort_by: str = Query("newest", enum=["newest", "popular", "top_rated"]),
    offset: int = 0,
    limit: int = 20
):
    """List marketplace items with filters."""
    query = select(MarketplaceItem, User.username, MarketplaceCategory.name.label("category_name")).join(User, MarketplaceItem.user_id == User.id).join(MarketplaceCategory, MarketplaceItem.category_id == MarketplaceCategory.id).where(MarketplaceItem.is_public == True)
    
    if category_id:
        query = query.where(MarketplaceItem.category_id == category_id)
    if item_type:
        query = query.where(MarketplaceItem.item_type == item_type)
    if search:
        query = query.where(MarketplaceItem.title.ilike(f"%{search}%"))
    if user_id:
        query = query.where(MarketplaceItem.user_id == user_id)
        
    if sort_by == "newest":
        query = query.order_by(MarketplaceItem.created_at.desc())
    elif sort_by == "popular":
        query = query.order_by(MarketplaceItem.usage_count.desc())
    elif sort_by == "top_rated":
        query = query.order_by(MarketplaceItem.rating_avg.desc())
        
    total = session.exec(select(func.count(MarketplaceItem.id)).where(MarketplaceItem.is_public == True)).one()
    
    results = session.exec(query.offset(offset).limit(limit)).all()
    
    items = []
    for item, username, category_name in results:
        item_dict = item.model_dump()
        item_dict["username"] = username
        item_dict["category_name"] = category_name
        items.append(ItemRead(**item_dict))
        
    return {"items": items, "total": total}

@marketplace_router.get("/items/{item_id}", response_model=ItemRead)
def get_item(item_id: UUID, session: Session = Depends(get_session)):
    """Get a single marketplace item by ID."""
    result = session.exec(
        select(MarketplaceItem, User.username, MarketplaceCategory.name.label("category_name"))
        .join(User, MarketplaceItem.user_id == User.id)
        .join(MarketplaceCategory, MarketplaceItem.category_id == MarketplaceCategory.id)
        .where(MarketplaceItem.id == item_id)
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Item not found")
        
    item, username, category_name = result
    item_dict = item.model_dump()
    item_dict["username"] = username
    item_dict["category_name"] = category_name
    return ItemRead(**item_dict)

@marketplace_router.post("/items", response_model=ItemRead)
def export_to_marketplace(
    item_in: ItemCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Export a template/snippet to the marketplace."""
    category_id = item_in.category_id
    
    # If no category is provided, default to 'General' (create if it doesn't exist)
    if not category_id:
        general_cat = session.exec(select(MarketplaceCategory).where(MarketplaceCategory.slug == "general")).first()
        if not general_cat:
            general_cat = MarketplaceCategory(name="General", slug="general", description="General purpose LaTeX assets")
            session.add(general_cat)
            session.commit()
            session.refresh(general_cat)
        category_id = general_cat.id

    slug = generate_slug(item_in.title)
    
    # Check for slug collision
    existing = session.exec(select(MarketplaceItem).where(MarketplaceItem.slug == slug)).first()
    if existing:
        slug = f"{slug}-{datetime.now().strftime('%H%M%S')}"
        
    item_data = item_in.model_dump()
    item_data["category_id"] = category_id
    
    item = MarketplaceItem(
        **item_data,
        user_id=current_user.id,
        slug=slug
    )
    
    session.add(item)
    session.commit()
    session.refresh(item)
    
    # Return with joined info
    return get_item(item.id, session)

@marketplace_router.post("/items/{item_id}/reviews", response_model=ReviewRead)
def add_review(
    item_id: UUID,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Add a review and rating to an item."""
    item = session.get(MarketplaceItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    # Check if user already reviewed
    existing = session.exec(
        select(MarketplaceReview)
        .where(MarketplaceReview.item_id == item_id)
        .where(MarketplaceReview.user_id == current_user.id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this item")
        
    review = MarketplaceReview(
        **review_in.model_dump(exclude={"item_id"}),
        user_id=current_user.id,
        item_id=item_id
    )
    
    session.add(review)
    
    # Update item ratings
    total_rating = item.rating_avg * item.review_count
    item.review_count += 1
    item.rating_avg = (total_rating + review.rating) / item.review_count
    
    session.add(item)
    session.commit()
    session.refresh(review)
    
    return review

@marketplace_router.get("/items/{item_id}/reviews", response_model=List[ReviewRead])
def list_reviews(
    item_id: UUID,
    session: Session = Depends(get_session)
):
    """List reviews for a marketplace item."""
    results = session.exec(
        select(MarketplaceReview, User.username)
        .join(User, MarketplaceReview.user_id == User.id)
        .where(MarketplaceReview.item_id == item_id)
        .order_by(MarketplaceReview.created_at.desc())
    ).all()

    reviews: List[ReviewRead] = []
    for review, username in results:
        review_data = review.model_dump()
        review_data["username"] = username
        reviews.append(ReviewRead(**review_data))

    return reviews
@marketplace_router.post("/items/{item_id}/install")
def install_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Acquire a marketplace item and deploy it to user's personal projects."""
    from ..auth.models.project import Project, ProjectStatus
    
    item = session.get(MarketplaceItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
        
    # In a real app, we would check if the user has paid for the item if is_free=False
    if not item.is_free:
        # Check if user has already 'unlocked' this item (e.g., in an orders table)
        # For simulation, we'll allow it but we could log a warning or check credits
        pass

    # Increment usage count
    item.usage_count += 1
    session.add(item)
    
    if item.item_type == MarketplaceItemType.PROJECT:
        from ..auth.models.project import Project, ProjectStatus
        # Create a new project
        new_project = Project(
            user_id=current_user.id,
            title=f"{item.title} (Deployed)",
            description=item.description or f"Acquired from marketplace: {item.title}",
            latex_content=item.latex_content,
            preamble=item.preamble,
            status=ProjectStatus.DRAFT,
            preview_image_url=item.preview_image_url,
            is_template=False
        )
        session.add(new_project)
        session.commit()
        session.refresh(new_project)
        return {"status": "success", "type": "project", "id": new_project.id}
    else:
        from ..auth.models.user_template import UserTemplate
        # Create a new user template
        new_template = UserTemplate(
            user_id=current_user.id,
            title=f"{item.title} (Personal Template)",
            description=item.description or f"Acquired from marketplace: {item.title}",
            preamble=item.preamble,
            code=item.latex_content
        )
        session.add(new_template)
        session.commit()
        session.refresh(new_template)
        return {"status": "success", "type": "template", "id": new_template.id}
@marketplace_router.delete("/items/{item_id}")
def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a marketplace item created by the current user."""
    item = session.get(MarketplaceItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
        
    session.delete(item)
    session.commit()
    
    return {"status": "success", "message": "Item deleted"}
