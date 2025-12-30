"""
SubProject Pydantic schemas for API validation.
"""

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class SubProjectType(str, Enum):
    """Types of sub-projects"""
    TABLE = "table"
    DIAGRAM = "diagram"
    IMAGE_TO_LATEX = "imageToLatex"
    HANDWRITTEN_FLOWCHART = "handwrittenFlowchart"
    DOCUMENT = "document"


# Request Schemas

class SubProjectCreate(BaseModel):
    """Schema for creating a new sub-project"""
    title: str = "Untitled"
    description: Optional[str] = None
    sub_project_type: SubProjectType
    latex_code: Optional[str] = None
    editor_data: Optional[str] = None  # JSON string
    source_file_id: Optional[UUID] = None


class SubProjectUpdate(BaseModel):
    """Schema for updating a sub-project"""
    title: Optional[str] = None
    description: Optional[str] = None
    latex_code: Optional[str] = None
    editor_data: Optional[str] = None
    source_file_id: Optional[UUID] = None
    preview_image_url: Optional[str] = None
    is_completed: Optional[bool] = None


class SubProjectAutoSave(BaseModel):
    """Schema for auto-saving sub-project content"""
    latex_code: Optional[str] = None
    editor_data: Optional[str] = None  # JSON string with editor state


# Response Schemas

class SubProjectResponse(BaseModel):
    """Schema for sub-project response"""
    id: UUID
    project_id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    sub_project_type: SubProjectType
    latex_code: Optional[str]
    editor_data: Optional[str]
    source_file_id: Optional[UUID]
    preview_image_url: Optional[str]
    compiled_pdf_url: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubProjectListResponse(BaseModel):
    """Schema for listing sub-projects (without full content)"""
    id: UUID
    project_id: UUID
    title: str
    description: Optional[str]
    sub_project_type: SubProjectType
    is_completed: bool
    preview_image_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubProjectAutoSaveResponse(BaseModel):
    """Schema for auto-save response"""
    success: bool
    message: str
    updated_at: datetime


# File Link Schemas

class SubProjectFileLinkCreate(BaseModel):
    """Schema for linking a file to a sub-project"""
    project_file_id: UUID
    usage_type: str = "reference"  # reference, source, output


class SubProjectFileLinkResponse(BaseModel):
    """Schema for file link response"""
    id: UUID
    sub_project_id: UUID
    project_file_id: UUID
    usage_type: str
    created_at: datetime

    class Config:
        from_attributes = True
