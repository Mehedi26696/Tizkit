// Project API functions

import apiClient from './client';
import type {
  Project,
  ProjectListItem,
  ProjectCreate,
  ProjectUpdate,
  ProjectFile,
  FileCreate,
  FileUpdate,
  AutoSaveResponse,
  ProjectStatus
} from '@/types/project';

// Project CRUD

/**
 * Get all projects for the current user
 */
export async function getProjects(statusFilter?: ProjectStatus): Promise<ProjectListItem[]> {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const response = await apiClient.get<ProjectListItem[]>('/projects/', { params });
  return response.data;
}

/**
 * Get a specific project with all its files
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${projectId}`);
  return response.data;
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectCreate): Promise<Project> {
  const response = await apiClient.post<Project>('/projects/', data);
  return response.data;
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, data: ProjectUpdate): Promise<Project> {
  const response = await apiClient.put<Project>(`/projects/${projectId}`, data);
  return response.data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}

/**
 * Auto-save project content
 */
export async function autoSaveProject(projectId: string, latexContent: string): Promise<AutoSaveResponse> {
  const response = await apiClient.post<AutoSaveResponse>(`/projects/${projectId}/autosave`, {
    latex_content: latexContent
  });
  return response.data;
}

// File CRUD

/**
 * Get all files for a project
 */
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const response = await apiClient.get<ProjectFile[]>(`/projects/${projectId}/files`);
  return response.data;
}

/**
 * Create a new file in a project
 */
export async function createFile(projectId: string, data: FileCreate): Promise<ProjectFile> {
  const response = await apiClient.post<ProjectFile>(`/projects/${projectId}/files`, data);
  return response.data;
}

/**
 * Update a file in a project
 */
export async function updateFile(projectId: string, fileId: string, data: FileUpdate): Promise<ProjectFile> {
  const response = await apiClient.put<ProjectFile>(`/projects/${projectId}/files/${fileId}`, data);
  return response.data;
}

/**
 * Delete a file from a project
 */
export async function deleteFile(projectId: string, fileId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/files/${fileId}`);
}

// File Upload/Download with Supabase Storage

/**
 * Upload a file to a project (stored in Supabase Storage)
 */
export async function uploadProjectFile(
  projectId: string,
  file: File,
  fileType: string = 'text',
  orderIndex: number = 0
): Promise<ProjectFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);
  formData.append('order_index', orderIndex.toString());

  const response = await apiClient.post<ProjectFile>(
    `/projects/${projectId}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Upload a .tex file and set it as the project's main LaTeX content
 */
export async function uploadTexFile(projectId: string, file: File): Promise<Project> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<Project>(
    `/projects/${projectId}/upload-tex`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Get a signed URL for downloading/viewing a file
 */
export async function getFileSignedUrl(projectId: string, fileId: string): Promise<{ url: string; expires_in: number }> {
  const response = await apiClient.get<{ url: string; expires_in: number }>(
    `/projects/${projectId}/files/${fileId}/url`
  );
  return response.data;
}

/**
 * Download a file from a project
 */
export async function downloadProjectFile(projectId: string, fileId: string): Promise<Blob> {
  const response = await apiClient.get(
    `/projects/${projectId}/files/${fileId}/download`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

/**
 * Helper function to determine file type from extension
 */
export function getFileTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const typeMap: Record<string, string> = {
    'tex': 'latex',
    'tikz': 'tikz',
    'png': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'gif': 'image',
    'webp': 'image',
    'pdf': 'pdf',
    'md': 'markdown',
    'txt': 'text',
  };
  return typeMap[ext || ''] || 'text';
}
