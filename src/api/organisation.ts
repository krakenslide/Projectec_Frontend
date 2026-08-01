import type { Organisation } from "../types/organisation"
import type { OrganisationMember, OrganisationRole } from "../types/organisation"
import { apiRequest, responseData, type ApiResponse } from "./client"

export const listOrganisations = async () =>
    responseData(await apiRequest<ApiResponse<Organisation[]>>("/organizations/"));

export const createOrganisation = async (name: string, description: string) =>
    responseData(await apiRequest<ApiResponse<Organisation>>("/organizations/create", {
        method: "POST",
        body: JSON.stringify({ name, description: description || null }),
    }));

export const listOrganisationMembers = (organizationId: string) => apiRequest<OrganisationMember[]>(`/organizations/${organizationId}/members`);
export const addOrganisationMember = (organizationId: string, email: string, role: OrganisationRole) => apiRequest<OrganisationMember>(`/organizations/${organizationId}/add_members`, { method: "POST", body: JSON.stringify({ email, role }) });
export const removeOrganisationMember = (organizationId: string, userId: string) => apiRequest<{ message: string }>(`/organizations/${organizationId}/members/${userId}`, { method: "DELETE" });
