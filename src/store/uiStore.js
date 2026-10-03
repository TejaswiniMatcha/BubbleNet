/**
 * src/store/uiStore.js
 * Zustand slice for global UI state.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

const useUiStore = create((set) => ({
  demoOpen:          false,
  rightPanelTab:     'members', // 'members' | 'mesh'
  rightPanelVisible: true,
  toasts:            [],  // { id, message, type, duration }

  setDemoOpen:          (open)    => set({ demoOpen: open }),
  setRightPanelTab:     (tab)     => set({ rightPanelTab: tab }),
  setRightPanelVisible: (v)       => set({ rightPanelVisible: v }),

  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { id: `toast-${Date.now()}`, duration: 3500, ...toast }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export default useUiStore;

export const useDemoOpen = ()          => useUiStore((s) => s.demoOpen);
export const useRightPanelTab = ()     => useUiStore((s) => s.rightPanelTab);
export const useRightPanelVisible = () => useUiStore((s) => s.rightPanelVisible);
export const useToasts = ()            => useUiStore(useShallow((s) => s.toasts));
export const useUiActions = ()         => useUiStore(useShallow((s) => ({
  setDemoOpen:          s.setDemoOpen,
  setRightPanelTab:     s.setRightPanelTab,
  setRightPanelVisible: s.setRightPanelVisible,
  addToast:             s.addToast,
  removeToast:          s.removeToast,
})));
