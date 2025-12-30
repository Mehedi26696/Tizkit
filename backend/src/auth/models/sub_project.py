"""
SubProject model for individual work items within a project.
"""

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Text, DateTime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime, timezone
from enum import Enum

if TYPE_CHECKING:
    from .project import Project, ProjectFile


class SubProjectType(str, Enum):
    """Types of sub-projects"""
    TABLE = "table"
    DIAGRAM = "diagram"
    IMAGE_TO_LATEX = "imageToLatex"
    HANDWRITTEN_FLOWCHART = "handwrittenFlowchart"
    DOCUMENT = "document"


class SubProject(SQLModel, table=True):
    """
    Sub-project model - individual work items within a mother project.
    Each sub-project represents one table, diagram, image-to-latex, or handwritten conversion.
    """
    __tablename__ = "sub_projects"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: UUID = Field(foreign_key="projects.id", index=True)  # Mother project
    user_id: UUID = Field(foreign_key="users.id", index=True)
    
    # Basic info
    title: str = Field(max_length=255, default="Untitled")
    description: Optional[str] = Field(default=None)
    sub_project_type: SubProjectType = Field(index=True)
    
    # Content - use sa_column for TEXT type
    latex_code: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Editor state - stores the full editor data as JSON string
    # For tables: rows, columns, cell content, styles
    # For diagrams: nodes, edges, positions
    # For imageToLatex: source image reference, OCR results
    # For handwritten: source image, AI analysis results
    editor_data: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # Source file reference (for imageToLatex and handwritten types)
    source_file_id: Optional[UUID] = Field(default=None, foreign_key="project_files.id")
    
    # Preview/output
    preview_image_url: Optional[str] = Field(default=None)
    compiled_pdf_url: Optional[str] = Field(default=None)
    
    # Status
    is_completed: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    
    # Relationships
    project: Optional["Project"] = Relationship(back_populates="sub_projects")
    source_file: Optional["ProjectFile"] = Relationship()


class SubProjectFileLink(SQLModel, table=True):
    """
    Many-to-many link between sub-projects and project files.
    Tracks which files from the mother project are used in a sub-project.
    """
    __tablename__ = "sub_project_file_links"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    sub_project_id: UUID = Field(foreign_key="sub_projects.id", index=True)
    project_file_id: UUID = Field(foreign_key="project_files.id", index=True)
    
    # How the file is used
    usage_type: str = Field(default="reference", max_length=50)  # reference, source, output
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
