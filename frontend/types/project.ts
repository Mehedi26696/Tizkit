// Project types

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type FileType = 'latex' | 'tikz' | 'markdown' | 'text' | 'image' | 'pdf';
export type SubProjectType = 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart' | 'document';

export interface ProjectFile {
  id: string;
  project_id: string;
  filename: string;
  file_type: FileType;
  content: string | null;
  file_url: string | null;
  file_size: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SubProject {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  sub_project_type: SubProjectType;
  latex_code: string | null;
  editor_data: string | null;  // JSON string with editor state
  source_file_id: string | null;
  preview_image_url: string | null;
  compiled_pdf_url: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubProjectListItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  sub_project_type: SubProjectType;
  is_completed: boolean;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubProjectCreate {
  title?: string;
  description?: string;
  sub_project_type: SubProjectType;
  latex_code?: string;
  editor_data?: string;
  source_file_id?: string;
}

export interface SubProjectUpdate {
  title?: string;
  description?: string;
  latex_code?: string;
  editor_data?: string;
  source_file_id?: string;
  preview_image_url?: string;
  is_completed?: boolean;
}

export interface SubProjectAutoSave {
  latex_code?: string;
  editor_data?: string;
}

export interface SubProjectFileLink {
  id: string;
  sub_project_id: string;
  project_file_id: string;
  usage_type: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  latex_content: string | null;
  compiled_pdf_url: string | null;
  preview_image_url: string | null;
  is_template: boolean;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCollaboratorInfo {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  latex_content: string | null;
  compiled_pdf_url: string | null;
  preview_image_url: string | null;
  is_template: boolean;
  tags: string | null;
  owner_name: string;
  collaborators: ProjectCollaboratorInfo[];
  created_at: string;
  updated_at: string;
  files: ProjectFile[];
  sub_projects?: SubProjectListItem[];
}

export interface ProjectListItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  preview_image_url: string | null;
  tags: string | null;
  role?: 'owner' | 'collaborator';
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
  status?: ProjectStatus;
  latex_content?: string;
  tags?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  latex_content?: string;
  compiled_pdf_url?: string;
  preview_image_url?: string;
  tags?: string;
}

export interface FileCreate {
  filename: string;
  file_type?: FileType;
  content?: string;
  file_url?: string;
  order_index?: number;
}

export interface FileUpdate {
  filename?: string;
  file_type?: FileType;
  content?: string;
  file_url?: string;
  order_index?: number;
}

export interface AutoSaveResponse {
  success: boolean;
  saved_at: string;
  project_id: string;
}

export interface SubProjectAutoSaveResponse {
  success: boolean;
  message: string;
  updated_at: string;
}
