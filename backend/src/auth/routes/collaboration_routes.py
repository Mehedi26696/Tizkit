"""
Collaboration API routes for project sharing and invitations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from ..models.project import Project
from ..models.project_collaborator import ProjectCollaborator, InvitationStatus
from ..models.user import User
from ..schemas.collaboration_schemas import (
    InviteCollaboratorRequest,
    CollaboratorResponse,
    InvitationResponse,
    InvitationActionResponse
)
from ...utils.database import get_session
from . import get_current_user

collaboration_router = APIRouter()


# ==================== Project Collaborator Management ====================

@collaboration_router.post("/projects/{project_id}/collaborators", response_model=CollaboratorResponse)
async def invite_collaborator(
    project_id: UUID,
    request: InviteCollaboratorRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Invite a collaborator to a project by email (owner only)"""
    # Verify project exists and user is owner
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can invite collaborators")
    
    # Check if user is trying to invite themselves
    if request.email.lower() == current_user.email.lower():
        raise HTTPException(status_code=400, detail="Cannot invite yourself")
    
    # Check if already invited
    existing = session.exec(
        select(ProjectCollaborator)
        .where(ProjectCollaborator.project_id == project_id)
        .where(ProjectCollaborator.invited_email == request.email.lower())
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already invited to this project")
    
    # Find user by email (if registered)
    invited_user = session.exec(
        select(User).where(User.email == request.email.lower())
    ).first()
    
    # Create invitation
    collaborator = ProjectCollaborator(
        project_id=project_id,
        user_id=invited_user.id if invited_user else None,
        invited_by=current_user.id,
        invited_email=request.email.lower(),
        status=InvitationStatus.PENDING
    )
    
    session.add(collaborator)
    session.commit()
    session.refresh(collaborator)
    
    return CollaboratorResponse(
        id=collaborator.id,
        user_id=collaborator.user_id,
        invited_email=collaborator.invited_email,
        username=invited_user.username if invited_user else None,
        full_name=invited_user.full_name if invited_user else None,
        status=collaborator.status.value,
        role=collaborator.role,
        created_at=collaborator.created_at,
        accepted_at=collaborator.accepted_at
    )


@collaboration_router.get("/projects/{project_id}/collaborators", response_model=List[CollaboratorResponse])
async def get_project_collaborators(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all collaborators for a project"""
    # Verify project exists and user has access
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is owner or collaborator
    is_owner = project.user_id == current_user.id
    is_collaborator = session.exec(
        select(ProjectCollaborator)
        .where(ProjectCollaborator.project_id == project_id)
        .where(ProjectCollaborator.user_id == current_user.id)
        .where(ProjectCollaborator.status == InvitationStatus.ACCEPTED)
    ).first() is not None
    
    if not is_owner and not is_collaborator:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all collaborators
    collaborators = session.exec(
        select(ProjectCollaborator)
        .where(ProjectCollaborator.project_id == project_id)
    ).all()
    
    result = []
    for collab in collaborators:
        user = session.get(User, collab.user_id) if collab.user_id else None
        result.append(CollaboratorResponse(
            id=collab.id,
            user_id=collab.user_id,
            invited_email=collab.invited_email,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            status=collab.status.value,
            role=collab.role,
            created_at=collab.created_at,
            accepted_at=collab.accepted_at
        ))
    
    return result


@collaboration_router.delete("/projects/{project_id}/collaborators/{collaborator_id}")
async def remove_collaborator(
    project_id: UUID,
    collaborator_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Remove a collaborator from a project (owner only)"""
    # Verify project exists and user is owner
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can remove collaborators")
    
    # Find collaborator
    collaborator = session.get(ProjectCollaborator, collaborator_id)
    if not collaborator or collaborator.project_id != project_id:
        raise HTTPException(status_code=404, detail="Collaborator not found")
    
    session.delete(collaborator)
    session.commit()
    
    return {"success": True, "message": "Collaborator removed"}


# ==================== User Invitations ====================

@collaboration_router.get("/invitations", response_model=List[InvitationResponse])
async def get_my_invitations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all pending invitations for the current user"""
    # Find invitations by email or user_id
    invitations = session.exec(
        select(ProjectCollaborator)
        .where(
            (ProjectCollaborator.invited_email == current_user.email.lower()) |
            (ProjectCollaborator.user_id == current_user.id)
        )
        .where(ProjectCollaborator.status == InvitationStatus.PENDING)
    ).all()
    
    result = []
    for inv in invitations:
        project = session.get(Project, inv.project_id)
        inviter = session.get(User, inv.invited_by)
        
        if project and inviter:
            result.append(InvitationResponse(
                id=inv.id,
                project_id=inv.project_id,
                project_title=project.title,
                project_description=project.description,
                invited_by_id=inviter.id,
                invited_by_name=inviter.full_name or inviter.username,
                invited_by_email=inviter.email,
                status=inv.status.value,
                created_at=inv.created_at
            ))
    
    return result


@collaboration_router.post("/invitations/{invitation_id}/accept", response_model=InvitationActionResponse)
async def accept_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Accept a project invitation"""
    invitation = session.get(ProjectCollaborator, invitation_id)
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Verify this invitation belongs to current user
    if invitation.invited_email.lower() != current_user.email.lower() and invitation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This invitation is not for you")
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Invitation already {invitation.status.value}")
    
    # Accept invitation
    invitation.status = InvitationStatus.ACCEPTED
    invitation.user_id = current_user.id  # Link to user if not already
    invitation.accepted_at = datetime.now(timezone.utc)
    
    session.add(invitation)
    session.commit()
    
    return InvitationActionResponse(
        success=True,
        message="Invitation accepted successfully",
        invitation_id=invitation_id,
        status="accepted"
    )


@collaboration_router.post("/invitations/{invitation_id}/reject", response_model=InvitationActionResponse)
async def reject_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Reject a project invitation"""
    invitation = session.get(ProjectCollaborator, invitation_id)
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    # Verify this invitation belongs to current user
    if invitation.invited_email.lower() != current_user.email.lower() and invitation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This invitation is not for you")
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Invitation already {invitation.status.value}")
    
    # Reject invitation
    invitation.status = InvitationStatus.REJECTED
    
    session.add(invitation)
    session.commit()
    
    return InvitationActionResponse(
        success=True,
        message="Invitation rejected",
        invitation_id=invitation_id,
        status="rejected"
    )


@collaboration_router.get("/invitations/count")
async def get_pending_invitation_count(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get count of pending invitations for the current user"""
    count = len(session.exec(
        select(ProjectCollaborator)
        .where(
            (ProjectCollaborator.invited_email == current_user.email.lower()) |
            (ProjectCollaborator.user_id == current_user.id)
        )
        .where(ProjectCollaborator.status == InvitationStatus.PENDING)
    ).all())
    
    return {"count": count}
