import { create } from "zustand";
import { listOrganisations } from "../api/organisation";
import type { Organisation } from "../types/organisation";

type OrgStore = {
  organizations: Organisation[];
  activeOrg: Organisation | null;
  loading: boolean;
  fetchOrganizations: () => Promise<void>;
  setActiveOrg: (org: Organisation) => void;
};

export const useOrgStore = create<OrgStore>((set) => ({
  organizations: [], activeOrg: null, loading: false,
  fetchOrganizations: async () => {
    set({ loading: true });
    try {
      const organizations = await listOrganisations();
      const activeOrg = organizations.find(org => org.id === localStorage.getItem("activeOrgId")) ?? null;
      set({ organizations, activeOrg });
    } finally { set({ loading: false }); }
  },
  setActiveOrg: (activeOrg) => { localStorage.setItem("activeOrgId", activeOrg.id); set({ activeOrg }); },
}));
