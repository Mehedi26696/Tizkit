"""
SubProject API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime

from ..models.project import Project
from ..models.sub_project import SubProject, SubProjectType, SubProjectFileLink
from ..schemas.sub_project_schemas import (
    SubProjectCreate,
    SubProjectUpdate,
    SubProjectResponse,
    SubProjectListResponse,
    SubProjectAutoSave,
    SubProjectAutoSaveResponse,
    SubProjectFileLinkCreate,
    SubProjectFileLinkResponse
)
from ...utils.database import get_session
from . import get_current_user, User

sub_project_router = APIRouter()


# SubProject CRUD Operations

@sub_project_router.get("/{project_id}/sub-projects", response_model=List[SubProjectListResponse])
async def get_project_sub_projects(
    project_id: UUID,
    sub_type: SubProjectType = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all sub-projects for a mother project"""
    # Verify mother project ownership
    project = session.exec(
        select(Project)
        .where(Project.id == project_id)
        .where(Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    query = select(SubProject).where(SubProject.project_id == project_id)
    
    if sub_type:
        query = query.where(SubProject.sub_project_type == sub_type)
    
    query = query.order_by(SubProject.updated_at.desc())
    sub_projects = session.exec(query).all()
    
    return sub_projects


@sub_project_router.post("/{project_id}/sub-projects", response_model=SubProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_sub_project(
    project_id: UUID,
    sub_project_data: SubProjectCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new sub-project within a mother project"""
    # Verify mother project ownership
    project = session.exec(
        select(Project)
        .where(Project.id == project_id)
        .where(Project.user_id == current_user.id)
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    sub_project = SubProject(
        project_id=project_id,
        user_id=current_user.id,
        title=sub_project_data.title,
        description=sub_project_data.description,
        sub_project_type=sub_project_data.sub_project_type,
        latex_code=sub_project_data.latex_code,
        editor_data=sub_project_data.editor_data,
        source_file_id=sub_project_data.source_file_id
    )
    
    session.add(sub_project)
    
    # Update mother project's updated_at
    project.updated_at = datetime.utcnow()
    session.add(project)
    
    session.commit()
    session.refresh(sub_project)
    
    return sub_project


@sub_project_router.get("/{project_id}/sub-projects/{sub_project_id}", response_model=SubProjectResponse)
async def get_sub_project(
    project_id: UUID,
    sub_project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific sub-project with all its data"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    return sub_project


@sub_project_router.put("/{project_id}/sub-projects/{sub_project_id}", response_model=SubProjectResponse)
async def update_sub_project(
    project_id: UUID,
    sub_project_id: UUID,
    sub_project_data: SubProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a sub-project"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    # Update only provided fields
    update_data = sub_project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sub_project, key, value)
    
    sub_project.updated_at = datetime.utcnow()
    
    session.add(sub_project)
    
    # Update mother project's updated_at
    project = session.get(Project, project_id)
    if project:
        project.updated_at = datetime.utcnow()
        session.add(project)
    
    session.commit()
    session.refresh(sub_project)
    
    return sub_project


@sub_project_router.delete("/{project_id}/sub-projects/{sub_project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sub_project(
    project_id: UUID,
    sub_project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a sub-project"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    # Delete file links first
    file_links = session.exec(
        select(SubProjectFileLink)
        .where(SubProjectFileLink.sub_project_id == sub_project_id)
    ).all()
    
    for link in file_links:
        session.delete(link)
    
    session.delete(sub_project)
    
    # Update mother project's updated_at
    project = session.get(Project, project_id)
    if project:
        project.updated_at = datetime.utcnow()
        session.add(project)
    
    session.commit()


@sub_project_router.post("/{project_id}/sub-projects/{sub_project_id}/autosave", response_model=SubProjectAutoSaveResponse)
async def autosave_sub_project(
    project_id: UUID,
    sub_project_id: UUID,
    save_data: SubProjectAutoSave,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Auto-save sub-project content (LaTeX and editor state)"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    if save_data.latex_code is not None:
        sub_project.latex_code = save_data.latex_code
    
    if save_data.editor_data is not None:
        sub_project.editor_data = save_data.editor_data
    
    sub_project.updated_at = datetime.utcnow()
    
    session.add(sub_project)
    session.commit()
    session.refresh(sub_project)
    
    return SubProjectAutoSaveResponse(
        success=True,
        message="Auto-saved successfully",
        updated_at=sub_project.updated_at
    )


# File Link Operations

@sub_project_router.get("/{project_id}/sub-projects/{sub_project_id}/files", response_model=List[SubProjectFileLinkResponse])
async def get_sub_project_files(
    project_id: UUID,
    sub_project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all files linked to a sub-project"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    file_links = session.exec(
        select(SubProjectFileLink)
        .where(SubProjectFileLink.sub_project_id == sub_project_id)
    ).all()
    
    return file_links


@sub_project_router.post("/{project_id}/sub-projects/{sub_project_id}/files", response_model=SubProjectFileLinkResponse, status_code=status.HTTP_201_CREATED)
async def link_file_to_sub_project(
    project_id: UUID,
    sub_project_id: UUID,
    link_data: SubProjectFileLinkCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Link a file from the mother project to a sub-project"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    # Check if link already exists
    existing_link = session.exec(
        select(SubProjectFileLink)
        .where(SubProjectFileLink.sub_project_id == sub_project_id)
        .where(SubProjectFileLink.project_file_id == link_data.project_file_id)
    ).first()
    
    if existing_link:
        return existing_link
    
    link = SubProjectFileLink(
        sub_project_id=sub_project_id,
        project_file_id=link_data.project_file_id,
        usage_type=link_data.usage_type
    )
    
    session.add(link)
    session.commit()
    session.refresh(link)
    
    return link


@sub_project_router.delete("/{project_id}/sub-projects/{sub_project_id}/files/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_file_from_sub_project(
    project_id: UUID,
    sub_project_id: UUID,
    link_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Remove a file link from a sub-project"""
    sub_project = session.exec(
        select(SubProject)
        .where(SubProject.id == sub_project_id)
        .where(SubProject.project_id == project_id)
        .where(SubProject.user_id == current_user.id)
    ).first()
    
    if not sub_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub-project not found"
        )
    
    link = session.exec(
        select(SubProjectFileLink)
        .where(SubProjectFileLink.id == link_id)
        .where(SubProjectFileLink.sub_project_id == sub_project_id)
    ).first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File link not found"
        )
    
    session.delete(link)
    session.commit()
