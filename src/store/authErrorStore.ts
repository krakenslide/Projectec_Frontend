import { create } from "zustand";

type AuthErrorStore = {
  /** True whenever any API call has just come back with a 401. */
  active: boolean;
  /** The path that triggered the 401, purely for debugging/telemetry. */
  path: string | null;
  trigger: (path?: string) => void;
  dismiss: () => void;
};

export const useAuthErrorStore = create<AuthErrorStore>((set) => ({
  active: false,
  path: null,
  trigger: (path) => set({ active: true, path: path ?? null }),
  dismiss: () => set({ active: false, path: null }),
}));
