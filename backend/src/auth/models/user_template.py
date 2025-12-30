"""
UserTemplate model for storing user's personal LaTeX code templates.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime


class UserTemplate(SQLModel, table=True):
    """User template model for storing personal LaTeX code templates"""
    __tablename__ = "user_templates"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    
    # LaTeX code sections
    preamble: Optional[str] = Field(default=None, sa_column=Column(Text))  # Packages, settings
    code: Optional[str] = Field(default=None, sa_column=Column(Text))  # Body content
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
