"""
Project API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
import io

from ..models.project import Project, ProjectFile, ProjectStatus, FileType
from ..models.project_collaborator import ProjectCollaborator, InvitationStatus
from ..schemas.project_schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    FileCreate,
    FileUpdate,
    ProjectFileResponse,
    AutoSaveRequest,
    AutoSaveResponse,
    ProjectCollaboratorInfo
)
from ...utils.database import get_session
from ...utils.supabase_storage import storage_service
from . import get_current_user, User

project_router = APIRouter()


def check_project_access(session: Session, project_id: UUID, user_id: UUID) -> tuple[Project | None, bool]:
    """
    Check if user has access to project (owner or accepted collaborator).
    Returns (project, is_owner) tuple.
    """
    project = session.get(Project, project_id)
    if not project:
        return None, False
    
    # Check if owner
    if project.user_id == user_id:
        return project, True
    
    # Check if accepted collaborator
    collaborator = session.exec(
        select(ProjectCollaborator)
        .where(ProjectCollaborator.project_id == project_id)
        .where(ProjectCollaborator.user_id == user_id)
        .where(ProjectCollaborator.status == InvitationStatus.ACCEPTED)
    ).first()
    
    if collaborator:
        return project, False
    
    return None, False


# Project CRUD Operations

@project_router.get("/", response_model=List[ProjectListResponse])
async def get_user_projects(
    status_filter: ProjectStatus = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all projects for the current user (owned and shared)"""
    # Get IDs of projects where user is an accepted collaborator
    collab_project_ids = session.exec(
        select(ProjectCollaborator.project_id)
        .where(ProjectCollaborator.user_id == current_user.id)
        .where(ProjectCollaborator.status == InvitationStatus.ACCEPTED)
    ).all()
    
    # Query for owned projects OR shared projects
    query = select(Project).where(
        or_(
            Project.user_id == current_user.id,
            Project.id.in_(collab_project_ids) if collab_project_ids else False
        )
    )
    
    if status_filter:
        query = query.where(Project.status == status_filter)
    
    query = query.order_by(Project.updated_at.desc())
    projects = session.exec(query).all()
    
    # Create response with role
    result = []
    for project in projects:
        role = "owner" if project.user_id == current_user.id else "collaborator"
        result.append(ProjectListResponse(
            id=project.id,
            user_id=project.user_id,
            title=project.title,
            description=project.description,
            status=project.status,
            preview_image_url=project.preview_image_url,
            tags=project.tags,
            created_at=project.created_at,
            updated_at=project.updated_at,
            role=role
        ))
    
    return result


@project_router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new project"""
    project = Project(
        user_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        status=project_data.status or ProjectStatus.DRAFT,
        latex_content=project_data.latex_content,
        tags=project_data.tags
    )
    
    session.add(project)
    session.commit()
    session.refresh(project)
    
    return project


@project_router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific project with all its files (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
        
    # Get owner name
    owner = session.get(User, project.user_id)
    owner_name = owner.full_name or owner.username if owner else "Unknown"
    
    # Get collaborators
    collaborators = session.exec(
        select(User, ProjectCollaborator)
        .join(ProjectCollaborator, User.id == ProjectCollaborator.user_id)
        .where(ProjectCollaborator.project_id == project_id)
        .where(ProjectCollaborator.status == InvitationStatus.ACCEPTED)
    ).all()
    
    collaborator_list = []
    for user, collab in collaborators:
        collaborator_list.append(ProjectCollaboratorInfo(
            user_id=user.id,
            name=user.full_name or user.username,
            email=user.email,
            role=collab.role
        ))
        
    response = ProjectResponse.model_validate(project)
    response.owner_name = owner_name
    response.collaborators = collaborator_list
    
    return response


@project_router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a project"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update only provided fields
    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    project.updated_at = datetime.now(timezone.utc)
    
    session.add(project)
    session.commit()
    session.refresh(project)
    
    # Get owner name
    owner = session.get(User, project.user_id)
    owner_name = owner.full_name or owner.username if owner else "Unknown"
    
    # Get collaborators
    collaborators = session.exec(
        select(User, ProjectCollaborator)
        .join(ProjectCollaborator, User.id == ProjectCollaborator.user_id)
        .where(ProjectCollaborator.project_id == project_id)
        .where(ProjectCollaborator.status == InvitationStatus.ACCEPTED)
    ).all()
    
    collaborator_list = []
    for user, collab in collaborators:
        collaborator_list.append(ProjectCollaboratorInfo(
            user_id=user.id,
            name=user.full_name or user.username,
            email=user.email,
            role=collab.role
        ))
        
    response = ProjectResponse.model_validate(project)
    response.owner_name = owner_name
    response.collaborators = collaborator_list
    
    return response


@project_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a project and all its files (owner only)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can delete the project"
        )
    
    # Delete all associated files first
    files = session.exec(
        select(ProjectFile).where(ProjectFile.project_id == project_id)
    ).all()
    for file in files:
        session.delete(file)
    
    session.delete(project)
    session.commit()


# Auto-save endpoint
@project_router.post("/{project_id}/autosave", response_model=AutoSaveResponse)
async def autosave_project(
    project_id: UUID,
    save_data: AutoSaveRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Auto-save project content (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project.latex_content = save_data.latex_content
    project.updated_at = datetime.now(timezone.utc)
    
    session.add(project)
    session.commit()
    
    return AutoSaveResponse(
        success=True,
        saved_at=project.updated_at,
        project_id=project.id
    )


# File CRUD Operations

@project_router.get("/{project_id}/files", response_model=List[ProjectFileResponse])
async def get_project_files(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all files for a project (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    files = session.exec(
        select(ProjectFile)
        .where(ProjectFile.project_id == project_id)
        .order_by(ProjectFile.order_index)
    ).all()
    
    return files


@project_router.post("/{project_id}/files", response_model=ProjectFileResponse, status_code=status.HTTP_201_CREATED)
async def create_file(
    project_id: UUID,
    file_data: FileCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Add a new file to a project (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    file = ProjectFile(
        project_id=project_id,
        filename=file_data.filename,
        file_type=file_data.file_type,
        content=file_data.content,
        file_url=file_data.file_url,
        order_index=file_data.order_index or 0
    )
    
    session.add(file)
    session.commit()
    session.refresh(file)
    
    # Update project's updated_at
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    
    return file


@project_router.put("/{project_id}/files/{file_id}", response_model=ProjectFileResponse)
async def update_file(
    project_id: UUID,
    file_id: UUID,
    file_data: FileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a file in a project (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    file = session.exec(
        select(ProjectFile)
        .where(ProjectFile.id == file_id)
        .where(ProjectFile.project_id == project_id)
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Update only provided fields
    update_data = file_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(file, key, value)
    file.updated_at = datetime.now(timezone.utc)
    
    session.add(file)
    session.commit()
    session.refresh(file)
    
    # Update project's updated_at
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    
    return file


@project_router.delete("/{project_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    project_id: UUID,
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a file from a project (owner only)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can delete files"
        )
    
    file = session.exec(
        select(ProjectFile)
        .where(ProjectFile.id == file_id)
        .where(ProjectFile.project_id == project_id)
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Delete from Supabase storage if file has a storage path
    if file.file_url and file.file_url.startswith(str(current_user.id)):
        await storage_service.delete_file(file.file_url)
    
    session.delete(file)
    session.commit()
    
    # Update project's updated_at
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()


# File Upload/Download with Supabase Storage

@project_router.post("/{project_id}/upload", response_model=ProjectFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_project_file(
    project_id: UUID,
    file: UploadFile = File(...),
    file_type: str = Form(default="text"),
    order_index: int = Form(default=0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Upload a file to a project using Supabase Storage (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Upload to Supabase Storage
    upload_result = await storage_service.upload_file(
        file_content=file_content,
        filename=file.filename,
        user_id=str(current_user.id),
        project_id=str(project_id),
        content_type=file.content_type or "application/octet-stream"
    )
    
    if not upload_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage"
        )
    
    # Create file record in database
    try:
        file_type_enum = FileType(file_type)
    except ValueError:
        file_type_enum = FileType.TEXT
    
    project_file = ProjectFile(
        project_id=project_id,
        filename=file.filename,
        file_type=file_type_enum,
        file_url=upload_result["path"],  # Store the path, not signed URL
        file_size=file_size,
        order_index=order_index
    )
    
    session.add(project_file)
    session.commit()
    session.refresh(project_file)
    
    # Update project's updated_at
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    
    return project_file


@project_router.get("/{project_id}/files/{file_id}/download")
async def download_project_file(
    project_id: UUID,
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Download a file from a project (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    file = session.exec(
        select(ProjectFile)
        .where(ProjectFile.id == file_id)
        .where(ProjectFile.project_id == project_id)
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # If file has content stored directly, return it
    if file.content:
        return StreamingResponse(
            io.BytesIO(file.content.encode()),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={file.filename}"}
        )
    
    # Otherwise, download from Supabase Storage
    if not file.file_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File content not available"
        )
    
    file_content = await storage_service.download_file(file.file_url)
    
    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download file from storage"
        )
    
    # Determine content type based on file type
    content_type_map = {
        FileType.LATEX: "application/x-tex",
        FileType.TIKZ: "application/x-tex",
        FileType.IMAGE: "image/png",
        FileType.PDF: "application/pdf",
        FileType.MARKDOWN: "text/markdown",
        FileType.TEXT: "text/plain",
    }
    content_type = content_type_map.get(file.file_type, "application/octet-stream")
    
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={file.filename}"}
    )


@project_router.get("/{project_id}/files/{file_id}/url")
async def get_file_signed_url(
    project_id: UUID,
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a signed URL for a file (for direct browser access) (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    file = session.exec(
        select(ProjectFile)
        .where(ProjectFile.id == file_id)
        .where(ProjectFile.project_id == project_id)
    ).first()
    
    if not file or not file.file_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    signed_url = await storage_service.get_signed_url(file.file_url, expires_in=3600)
    
    if not signed_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate signed URL"
        )
    
    return {"url": signed_url, "expires_in": 3600}


@project_router.post("/{project_id}/upload-tex", response_model=ProjectResponse)
async def upload_tex_content(
    project_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Upload a .tex file and set it as the project's main LaTeX content (owner or collaborator)"""
    project, is_owner = check_project_access(session, project_id, current_user.id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Read .tex file content
    file_content = await file.read()
    latex_content = file_content.decode('utf-8')
    
    # Update project with LaTeX content
    project.latex_content = latex_content
    project.updated_at = datetime.now(timezone.utc)
    
    # Also save to Supabase as a backup
    upload_result = await storage_service.upload_file(
        file_content=file_content,
        filename=file.filename or "main.tex",
        user_id=str(current_user.id),
        project_id=str(project_id),
        content_type="application/x-tex"
    )
    
    if upload_result:
        # Create a file record for the .tex file
        tex_file = ProjectFile(
            project_id=project_id,
            filename=file.filename or "main.tex",
            file_type=FileType.LATEX,
            content=latex_content,
            file_url=upload_result["path"],
            file_size=len(file_content),
            order_index=0
        )
        session.add(tex_file)
    
    session.add(project)
    session.commit()
    session.refresh(project)
    
    # Get owner name
    owner = session.get(User, project.user_id)
    owner_name = owner.full_name or owner.username if owner else "Unknown"
    
    # Get collaborators
    collaborators = session.exec(
        select(User, ProjectCollaborator)
        .join(ProjectCollaborator, User.id == ProjectCollaborator.user_id)
        .where(ProjectCollaborator.project_id == project_id)
        .where(ProjectCollaborator.status == InvitationStatus.ACCEPTED)
    ).all()
    
    collaborator_list = []
    for user, collab in collaborators:
        collaborator_list.append(ProjectCollaboratorInfo(
            user_id=user.id,
            name=user.full_name or user.username,
            email=user.email,
            role=collab.role
        ))
        
    response = ProjectResponse.model_validate(project)
    response.owner_name = owner_name
    response.collaborators = collaborator_list
    
    return response
