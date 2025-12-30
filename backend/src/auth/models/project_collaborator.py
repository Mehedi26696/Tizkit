"""
Project Collaborator model for storing collaboration relationships and invitations.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .project import Project
    from .user import User


class InvitationStatus(str, Enum):
    """Invitation status enumeration"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class ProjectCollaborator(SQLModel, table=True):
    """
    Model for storing project collaboration relationships.
    Tracks invitations and access grants for project sharing.
    """
    __tablename__ = "project_collaborators"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="projects.id", index=True)
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id", index=True)  # Can be null if user not registered yet
    invited_by: UUID = Field(foreign_key="users.id")  # The owner who sent the invitation
    invited_email: str = Field(max_length=255, index=True)  # Email used for invitation
    
    status: InvitationStatus = Field(default=InvitationStatus.PENDING)
    role: str = Field(default="collaborator", max_length=50)  # Future: viewer, editor, admin
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = Field(default=None)
    
    class Config:
        use_enum_values = True
