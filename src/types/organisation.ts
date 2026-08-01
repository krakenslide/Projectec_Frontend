export interface Organisation {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export type OrganisationRole = "Owner" | "Administrator" | "Member";
export interface OrganisationMember { id: string; organization_id: string; user_id: string; role_id: string; role_name: OrganisationRole; email: string; name: string; created_at: string; updated_at: string; }
