import { create } from "zustand";

interface Toast {
  message: string;
  type: "success" | "error";
}

interface ToastStore {
  toast: Toast | null;
  showToast: (message: string, type: "success" | "error") => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));
