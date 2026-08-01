export interface Project {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string | null;
  description?: string | null;
}

export type ProjectRole = "Project Owner" | "Project Admin" | "Engineer" | "QA" | "Reporter" | "Viewer";
export interface ProjectMember { id: string; project_id: string; user_id: string; email: string; name: string; role: ProjectRole; created_at: string; updated_at: string; }
