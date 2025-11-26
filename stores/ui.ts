import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: 'post' | 'template' | 'timepicker' | 'recurring' | null;
  data?: Record<string, unknown>;
}

interface UIState {
  // サイドバー
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  // モーダル
  modal: ModalState;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;

  openModal: (type: ModalState['type'], data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,

  modal: {
    isOpen: false,
    type: null,
    data: undefined,
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  openModal: (type, data) =>
    set({
      modal: {
        isOpen: true,
        type,
        data,
      },
    }),

  closeModal: () =>
    set({
      modal: {
        isOpen: false,
        type: null,
        data: undefined,
      },
    }),
}));
