import { create } from "zustand";

interface NotificationStore {
  bellOpen: boolean;
  anchorEl: HTMLElement | null;
  openBell: (anchor: HTMLElement) => void;
  closeBell: () => void;
  toggleBell: (anchor: HTMLElement) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  bellOpen: false,
  anchorEl: null,

  openBell: (anchor) => set({ bellOpen: true, anchorEl: anchor }),

  closeBell: () => set({ bellOpen: false, anchorEl: null }),

  toggleBell: (anchor) => {
    const { bellOpen } = get();
    if (bellOpen) {
      set({ bellOpen: false, anchorEl: null });
    } else {
      set({ bellOpen: true, anchorEl: anchor });
    }
  },
}));
