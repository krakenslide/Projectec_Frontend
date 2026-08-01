import type { CreateProjectPayload, Project, UpdateProjectPayload } from "../types/project";
import type { ProjectMember, ProjectRole } from "../types/project";
import { apiRequest, responseData, type ApiResponse } from "./client";

export const listProjects = async (organizationId: string) =>
  responseData(await apiRequest<ApiResponse<Project[]>>(`/projects/organizations/${organizationId}`));

export const createProject = async (organizationId: string, payload: CreateProjectPayload) =>
  responseData(await apiRequest<ApiResponse<Project>>(`/projects/organizations/${organizationId}`, {
    method: "POST",
    body: JSON.stringify({ ...payload, description: payload.description || null }),
  }));

export const getProject = async (projectId: string) =>
  responseData(await apiRequest<ApiResponse<Project>>(`/projects/${projectId}`));

export const updateProject = (projectId: string, payload: UpdateProjectPayload) =>
  apiRequest<ApiResponse<Project>>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then(responseData);

export const deleteProject = (projectId: string) =>
  apiRequest<ApiResponse<Project>>(`/projects/${projectId}`, { method: "DELETE" }).then(responseData);

export const listProjectMembers = (projectId: string) => apiRequest<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`).then(responseData);
export const addProjectMember = (projectId: string, email: string, role: ProjectRole) => apiRequest<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ email, role }) }).then(responseData);
export const updateProjectMemberRole = (projectId: string, userId: string, role: ProjectRole) => apiRequest<ApiResponse<ProjectMember>>(`/projects/${projectId}/members/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) }).then(responseData);
export const removeProjectMember = (projectId: string, userId: string) => apiRequest<ApiResponse<null>>(`/projects/${projectId}/members/${userId}`, { method: "DELETE" });
