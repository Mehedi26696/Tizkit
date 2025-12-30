"""
Collaboration schemas for project sharing and invitations.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class InviteCollaboratorRequest(BaseModel):
    """Request schema for inviting a collaborator"""
    email: EmailStr


class CollaboratorResponse(BaseModel):
    """Response schema for a collaborator"""
    id: UUID
    user_id: Optional[UUID] = None
    invited_email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    status: str
    role: str
    created_at: datetime
    accepted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvitationResponse(BaseModel):
    """Response schema for a pending invitation"""
    id: UUID
    project_id: UUID
    project_title: str
    project_description: Optional[str] = None
    invited_by_id: UUID
    invited_by_name: str
    invited_by_email: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class InvitationActionResponse(BaseModel):
    """Response schema for invitation accept/reject"""
    success: bool
    message: str
    invitation_id: UUID
    status: str
