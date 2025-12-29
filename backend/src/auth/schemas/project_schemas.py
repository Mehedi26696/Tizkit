"""
Pydantic schemas for project API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

from ..models.project import ProjectStatus, FileType


# Project Schemas
class ProjectCreate(BaseModel):
    """Schema for creating a new project"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[ProjectStatus] = ProjectStatus.DRAFT
    latex_content: Optional[str] = None
    tags: Optional[str] = None


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[ProjectStatus] = None
    latex_content: Optional[str] = None
    compiled_pdf_url: Optional[str] = None
    preview_image_url: Optional[str] = None
    tags: Optional[str] = None


class ProjectFileResponse(BaseModel):
    """Response schema for project files"""
    id: UUID
    project_id: UUID
    filename: str
    file_type: FileType
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    order_index: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    """Response schema for projects"""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    status: ProjectStatus
    latex_content: Optional[str] = None
    compiled_pdf_url: Optional[str] = None
    preview_image_url: Optional[str] = None
    is_template: bool
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    files: List[ProjectFileResponse] = []

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Response schema for project list (without files for performance)"""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    status: ProjectStatus
    preview_image_url: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# File Schemas
class FileCreate(BaseModel):
    """Schema for creating a new file"""
    filename: str = Field(..., min_length=1, max_length=255)
    file_type: Optional[FileType] = FileType.LATEX
    content: Optional[str] = None
    file_url: Optional[str] = None
    order_index: Optional[int] = 0


class FileUpdate(BaseModel):
    """Schema for updating a file"""
    filename: Optional[str] = Field(None, min_length=1, max_length=255)
    file_type: Optional[FileType] = None
    content: Optional[str] = None
    file_url: Optional[str] = None
    order_index: Optional[int] = None


# Auto-save schema
class AutoSaveRequest(BaseModel):
    """Schema for auto-save requests"""
    latex_content: str
    

class AutoSaveResponse(BaseModel):
    """Schema for auto-save response"""
    success: bool
    saved_at: datetime
    project_id: UUID
