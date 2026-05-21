import type {
  CreateIssuePayload,
  IssuePriority,
  Issue,
  IssueStatus,
  MoveIssuePayload,
  UpdateIssuePayload,
  UpdateIssueStatusPayload,
} from "../types/issue";
import { apiRequest } from "./client";

export const listIssuesByProject = (projectId: string) =>
  apiRequest<Issue[]>(`/issues/${projectId}`);

export const createIssue = (
  title: string,
  description: string,
  priority: IssuePriority,
  project_id: string
) =>
  apiRequest<Issue>("/issues/", {
    method: "POST",
    body: JSON.stringify({ title, description, priority, project_id }),
  });

export const createIssueFromPayload = (payload: CreateIssuePayload) =>
  apiRequest<Issue>("/issues/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateIssue = (issueId: string, payload: UpdateIssuePayload) =>
  apiRequest<Issue>(`/issues/${issueId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateIssueStatus = (
  issueId: string,
  payload: IssueStatus | UpdateIssueStatusPayload
) =>
  apiRequest<Issue>(`/issues/${issueId}/status`, {
    method: "PATCH",
    body: JSON.stringify(
      typeof payload === "string" ? { status: payload } : payload
    ),
  });

export const moveIssue = (
  issueId: string,
  status: IssueStatus,
  position: number
) =>
  apiRequest<Issue>(`/issues/${issueId}/move`, {
    method: "PATCH",
    body: JSON.stringify({ status, position }),
  });

export const moveIssueWithPayload = (
  issueId: string,
  payload: MoveIssuePayload
) =>
  apiRequest<Issue>(`/issues/${issueId}/move`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteIssue = (issueId: string) =>
  apiRequest<{ message: string }>(`/issues/${issueId}`, {
    method: "DELETE",
  });
