import { apiRequest, responseData, type ApiResponse } from "./client";

export interface UserOption { id: string; name: string; email: string; is_active: boolean; created_at: string; updated_at: string; }
export const listUsers = async (params: { organizationId?: string; projectId?: string; search?: string; page?: number; pageSize?: number } = {}) => {
  const query = new URLSearchParams();
  if (params.organizationId) query.set("organization_id", params.organizationId);
  if (params.projectId) query.set("project_id", params.projectId);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("page_size", String(params.pageSize));
  return responseData(await apiRequest<ApiResponse<UserOption[]>>(`/users${query.size ? `?${query}` : ""}`));
};
