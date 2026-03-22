import { create } from "zustand";
import { type AuthUser, authEndpoints } from "@/lib/api/endpoints";

interface AuthStore {
  // NOTE: The authenticated user object is stored in Zustand (not TanStack Query)
  // intentionally. Auth state must: (1) survive a query cache flush on logout,
  // (2) be readable synchronously by route protection middleware without suspense.
  // Do NOT copy this pattern for other server data — use TanStack Query for all
  // other server state (pets, visits, etc.).
  user: AuthUser | null;
  isLoading: boolean;
  twoFactorPending: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setTwoFactorPending: (value: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  // Start true so the dashboard layout waits for the first fetchUser() to
  // complete before rendering children or deciding on redirects.
  isLoading: true,
  twoFactorPending: false,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { data } = await authEndpoints.user();
      set({ user: data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  setTwoFactorPending: (value) => set({ twoFactorPending: value }),

  logout: async () => {
    try {
      await authEndpoints.logout();
    } finally {
      set({ user: null, twoFactorPending: false });
    }
  },
}));
