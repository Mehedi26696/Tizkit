// Sub-Project API functions

import apiClient from './client';
import type {
  SubProject,
  SubProjectListItem,
  SubProjectCreate,
  SubProjectUpdate,
  SubProjectAutoSave,
  SubProjectAutoSaveResponse,
  SubProjectFileLink,
  SubProjectType
} from '@/types/project';

// Sub-Project CRUD

/**
 * Get all sub-projects for a mother project
 */
export async function getSubProjects(
  projectId: string,
  subType?: SubProjectType
): Promise<SubProjectListItem[]> {
  const params = subType ? { sub_type: subType } : {};
  const response = await apiClient.get<SubProjectListItem[]>(
    `/projects/${projectId}/sub-projects`,
    { params }
  );
  return response.data;
}

/**
 * Get a specific sub-project with all its data
 */
export async function getSubProject(
  projectId: string,
  subProjectId: string
): Promise<SubProject> {
  const response = await apiClient.get<SubProject>(
    `/projects/${projectId}/sub-projects/${subProjectId}`
  );
  return response.data;
}

/**
 * Create a new sub-project
 */
export async function createSubProject(
  projectId: string,
  data: SubProjectCreate
): Promise<SubProject> {
  const response = await apiClient.post<SubProject>(
    `/projects/${projectId}/sub-projects`,
    data
  );
  return response.data;
}

/**
 * Update a sub-project
 */
export async function updateSubProject(
  projectId: string,
  subProjectId: string,
  data: SubProjectUpdate
): Promise<SubProject> {
  const response = await apiClient.put<SubProject>(
    `/projects/${projectId}/sub-projects/${subProjectId}`,
    data
  );
  return response.data;
}

/**
 * Delete a sub-project
 */
export async function deleteSubProject(
  projectId: string,
  subProjectId: string
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/sub-projects/${subProjectId}`);
}

/**
 * Auto-save sub-project content (LaTeX and editor state)
 */
export async function autoSaveSubProject(
  projectId: string,
  subProjectId: string,
  data: SubProjectAutoSave
): Promise<SubProjectAutoSaveResponse> {
  const response = await apiClient.post<SubProjectAutoSaveResponse>(
    `/projects/${projectId}/sub-projects/${subProjectId}/autosave`,
    data
  );
  return response.data;
}

// Sub-Project File Links

/**
 * Get all files linked to a sub-project
 */
export async function getSubProjectFileLinks(
  projectId: string,
  subProjectId: string
): Promise<SubProjectFileLink[]> {
  const response = await apiClient.get<SubProjectFileLink[]>(
    `/projects/${projectId}/sub-projects/${subProjectId}/files`
  );
  return response.data;
}

/**
 * Link a file from the mother project to a sub-project
 */
export async function linkFileToSubProject(
  projectId: string,
  subProjectId: string,
  projectFileId: string,
  usageType: string = 'reference'
): Promise<SubProjectFileLink> {
  const response = await apiClient.post<SubProjectFileLink>(
    `/projects/${projectId}/sub-projects/${subProjectId}/files`,
    { project_file_id: projectFileId, usage_type: usageType }
  );
  return response.data;
}

/**
 * Remove a file link from a sub-project
 */
export async function unlinkFileFromSubProject(
  projectId: string,
  subProjectId: string,
  linkId: string
): Promise<void> {
  await apiClient.delete(
    `/projects/${projectId}/sub-projects/${subProjectId}/files/${linkId}`
  );
}

// Helper function to get sub-project type label
export function getSubProjectTypeLabel(type: SubProjectType): string {
  const labels: Record<SubProjectType, string> = {
    table: 'Table',
    diagram: 'Diagram',
    imageToLatex: 'Image to LaTeX',
    handwrittenFlowchart: 'Handwritten Flowchart'
  };
  return labels[type] || type;
}

// Helper function to get sub-project type icon name
export function getSubProjectTypeIcon(type: SubProjectType): string {
  const icons: Record<SubProjectType, string> = {
    table: 'table',
    diagram: 'git-branch',
    imageToLatex: 'image',
    handwrittenFlowchart: 'pen-tool'
  };
  return icons[type] || 'file';
}
