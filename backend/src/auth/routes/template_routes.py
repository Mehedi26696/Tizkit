"""
Template API routes for user's personal LaTeX templates.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from pydantic import BaseModel

from ..models.user_template import UserTemplate
from ...utils.database import get_session
from . import get_current_user, User


template_router = APIRouter()


# Pydantic schemas
class TemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    preamble: Optional[str] = None
    code: Optional[str] = None


class TemplateUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    preamble: Optional[str] = None
    code: Optional[str] = None


class TemplateResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    preamble: Optional[str]
    code: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Routes

@template_router.get("/", response_model=List[TemplateResponse])
async def get_user_templates(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all templates for the current user"""
    query = select(UserTemplate).where(UserTemplate.user_id == current_user.id)
    query = query.order_by(UserTemplate.updated_at.desc())
    templates = session.exec(query).all()
    return templates


@template_router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: TemplateCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new template"""
    template = UserTemplate(
        user_id=current_user.id,
        title=template_data.title,
        description=template_data.description,
        preamble=template_data.preamble,
        code=template_data.code
    )
    
    session.add(template)
    session.commit()
    session.refresh(template)
    
    return template


@template_router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific template"""
    template = session.exec(
        select(UserTemplate)
        .where(UserTemplate.id == template_id)
        .where(UserTemplate.user_id == current_user.id)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@template_router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a template"""
    template = session.exec(
        select(UserTemplate)
        .where(UserTemplate.id == template_id)
        .where(UserTemplate.user_id == current_user.id)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Update only provided fields
    update_data = template_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)
    
    template.updated_at = datetime.now(timezone.utc)
    
    session.add(template)
    session.commit()
    session.refresh(template)
    
    return template


@template_router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a template"""
    template = session.exec(
        select(UserTemplate)
        .where(UserTemplate.id == template_id)
        .where(UserTemplate.user_id == current_user.id)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    session.delete(template)
    session.commit()
