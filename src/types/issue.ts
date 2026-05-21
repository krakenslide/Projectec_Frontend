export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH";

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  position: number;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  TODO: Issue[];
  IN_PROGRESS: Issue[];
  DONE: Issue[];
}

export interface CreateIssuePayload {
  title: string;
  description?: string | null;
  priority?: IssuePriority | null;
  project_id: string;
}

export interface UpdateIssuePayload {
  title?: string | null;
  description?: string | null;
  priority?: IssuePriority | null;
}

export interface UpdateIssueStatusPayload {
  status: IssueStatus;
}

export interface MoveIssuePayload {
  status: IssueStatus;
  position: number;
}
