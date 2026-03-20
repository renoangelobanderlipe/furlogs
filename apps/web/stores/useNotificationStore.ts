import { create } from "zustand";

interface NotificationStore {
  anchorEl: HTMLElement | null;
  openBell: (anchor: HTMLElement) => void;
  closeBell: () => void;
  toggleBell: (anchor: HTMLElement) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  anchorEl: null,

  openBell: (anchor) => set({ anchorEl: anchor }),

  closeBell: () => set({ anchorEl: null }),

  toggleBell: (anchor) => {
    set({ anchorEl: get().anchorEl !== null ? null : anchor });
  },
}));
