import type { Board } from "../types/issue";
import type { Project, UpdateProjectPayload } from "../types/project";
import { apiRequest } from "./client";

export const listProjects = () =>
  apiRequest<Project[]>("/projects/");

export const createProject = (name: string, description: string) =>
  apiRequest<Project>("/projects/", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

export const getProject = (projectId: string) =>
  apiRequest<Project>(`/projects/${projectId}`);

export const getBoard = (projectId: string) =>
  apiRequest<Board>(`/projects/${projectId}/board`);

export const updateProject = (
  projectId: string,
  payload: UpdateProjectPayload
) =>
  apiRequest<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteProject = (projectId: string) =>
  apiRequest<{ message: string }>(`/projects/${projectId}`, {
    method: "DELETE",
  });
