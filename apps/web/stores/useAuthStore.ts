import { create } from "zustand";
import { type AuthUser, authEndpoints } from "@/lib/api/endpoints";

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

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

  logout: async () => {
    try {
      await authEndpoints.logout();
    } finally {
      set({ user: null });
    }
  },
}));
