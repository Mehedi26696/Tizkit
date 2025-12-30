// Collaboration API functions

import apiClient from './client';

export interface Collaborator {
  id: string;
  user_id: string | null;
  invited_email: string;
  username: string | null;
  full_name: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  role: string;
  created_at: string;
  accepted_at: string | null;
}

export interface Invitation {
  id: string;
  project_id: string;
  project_title: string;
  project_description: string | null;
  invited_by_id: string;
  invited_by_name: string;
  invited_by_email: string;
  status: string;
  created_at: string;
}

export interface InvitationActionResponse {
  success: boolean;
  message: string;
  invitation_id: string;
  status: string;
}

/**
 * Invite a collaborator to a project by email
 */
export async function inviteCollaborator(projectId: string, email: string): Promise<Collaborator> {
  const response = await apiClient.post<Collaborator>(`/api/projects/${projectId}/collaborators`, {
    email,
  });
  return response.data;
}

/**
 * Get all collaborators for a project
 */
export async function getProjectCollaborators(projectId: string): Promise<Collaborator[]> {
  const response = await apiClient.get<Collaborator[]>(`/api/projects/${projectId}/collaborators`);
  return response.data;
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(projectId: string, collaboratorId: string): Promise<void> {
  await apiClient.delete(`/api/projects/${projectId}/collaborators/${collaboratorId}`);
}

/**
 * Get pending invitations for the current user
 */
export async function getMyInvitations(): Promise<Invitation[]> {
  const response = await apiClient.get<Invitation[]>('/api/invitations');
  return response.data;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: string): Promise<InvitationActionResponse> {
  const response = await apiClient.post<InvitationActionResponse>(`/api/invitations/${invitationId}/accept`);
  return response.data;
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(invitationId: string): Promise<InvitationActionResponse> {
  const response = await apiClient.post<InvitationActionResponse>(`/api/invitations/${invitationId}/reject`);
  return response.data;
}

/**
 * Get count of pending invitations
 */
export async function getPendingInvitationCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>('/api/invitations/count');
  return response.data.count;
}
