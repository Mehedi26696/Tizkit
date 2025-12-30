from sqlmodel import Session, select
from uuid import UUID
from typing import Tuple, Optional

from .models.project import Project
from .models.project_collaborator import ProjectCollaborator, InvitationStatus
from .models.sub_project import SubProject

def check_project_access(session: Session, project_id: UUID, user_id: UUID) -> Tuple[Optional[Project], bool]:
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

def check_sub_project_access(session: Session, sub_project_id: UUID, user_id: UUID) -> Tuple[Optional[SubProject], Optional[Project], bool]:
    """
    Check access via sub-project ID.
    Returns (sub_project, project, is_owner).
    """
    sub_project = session.get(SubProject, sub_project_id)
    if not sub_project:
        return None, None, False
        
    project, is_owner = check_project_access(session, sub_project.project_id, user_id)
    if not project:
        return None, None, False
        
    return sub_project, project, is_owner
