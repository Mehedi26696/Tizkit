"""
Project models for storing user projects and files.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .sub_project import SubProject


class ProjectStatus(str, Enum):
    """Project status enumeration"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class FileType(str, Enum):
    """File type enumeration"""
    LATEX = "latex"
    TIKZ = "tikz"
    MARKDOWN = "markdown"
    TEXT = "text"
    IMAGE = "image"
    PDF = "pdf"


class Project(SQLModel, table=True):
    """Project model for storing user projects (Mother Project)"""
    __tablename__ = "projects"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT)
    
    # LaTeX specific fields (for combined output)
    latex_content: Optional[str] = Field(default=None)  # Main LaTeX content
    compiled_pdf_url: Optional[str] = Field(default=None)
    preview_image_url: Optional[str] = Field(default=None)
    
    # Metadata
    is_template: bool = Field(default=False)
    tags: Optional[str] = Field(default=None)  # Comma-separated tags
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    files: List["ProjectFile"] = Relationship(back_populates="project")
    sub_projects: List["SubProject"] = Relationship(back_populates="project")


class ProjectFile(SQLModel, table=True):
    """File model for storing project files"""
    __tablename__ = "project_files"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="projects.id", index=True)
    
    filename: str = Field(max_length=255)
    file_type: FileType = Field(default=FileType.LATEX)
    content: Optional[str] = Field(default=None)  # For text-based files
    file_url: Optional[str] = Field(default=None)  # For binary files (images, PDFs)
    file_size: Optional[int] = Field(default=None)  # Size in bytes
    
    # For ordering files in project
    order_index: int = Field(default=0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    project: Optional[Project] = Relationship(back_populates="files")
