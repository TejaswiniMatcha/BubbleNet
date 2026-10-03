/**
 * src/store/bubbleStore.js
 * Zustand slice for active bubble state — persisted to localStorage.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

const STORAGE_KEY = 'socialbubble-bubble-v1';

/** Demo bubble used when no bubble exists (enables direct URL navigation) */
export const DEMO_PIN = '5250';
const DEMO_BUBBLE = {
  id:           'demo-bubble-001',
  name:         'Group Bubble',
  pin:          DEMO_PIN,
  mode:         'social',
  autoApprove:  true,
  expiry:       0,
  createdAt:    Date.now(),
};

function loadPersistedBubble() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch { /* corrupted data — ignore */ }
  return DEMO_BUBBLE; // fallback to demo so tabs always work
}

function saveBubble(bubble) {
  try {
    if (bubble) localStorage.setItem(STORAGE_KEY, JSON.stringify(bubble));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* quota exceeded — ignore */ }
}

const useBubbleStore = create((set) => ({
  bubble:    loadPersistedBubble(),
  mode:      'social',
  speed:     '1x',
  expiresAt: null,
  remaining: null,
  isDissolving: false,
  sosAlerts: [],
  chimeEnabled: false,

  setBubble: (bubble) => {
    saveBubble(bubble);
    set({ bubble, isDissolving: false });
  },
  clearBubble: () => {
    saveBubble(null);
    set({ bubble: null, expiresAt: null, sosAlerts: [], isDissolving: false });
  },
  setMode:      (mode)  => set({ mode }),
  setSpeed:     (speed) => set({ speed }),
  setExpiresAt: (t)     => set({ expiresAt: t, isDissolving: false }),
  setRemaining: (r)     => set({ remaining: r }),
  setDissolving: (v)    => set({ isDissolving: v }),
  addSosAlert:  (alert) => set((s) => {
    if (s.sosAlerts.find(a => a.id === alert.id)) return s;
    return { sosAlerts: [...s.sosAlerts, alert] };
  }),
  removeSosAlert: (id)  => set((s) => ({ sosAlerts: s.sosAlerts.filter(a => a.id !== id) })),
  clearSosAlerts: ()    => set({ sosAlerts: [] }),
  setChimeEnabled: (v)  => set({ chimeEnabled: v }),
}));

export default useBubbleStore;

// Selectors
export const useBubble  = () => useBubbleStore(useShallow((s) => s.bubble));
export const useMode    = () => useBubbleStore((s) => s.mode);
export const useSpeed   = () => useBubbleStore((s) => s.speed);
export const useExpiry  = () => useBubbleStore(useShallow((s) => ({
  expiresAt: s.expiresAt,
  remaining: s.remaining,
  bubble:    s.bubble,
  isDissolving: s.isDissolving,
})));
export const useSosState = () => useBubbleStore(useShallow((s) => ({
  alerts: s.sosAlerts,
  chimeEnabled: s.chimeEnabled,
})));
export const useBubbleActions = () => useBubbleStore(useShallow((s) => ({
  setBubble:    s.setBubble,
  clearBubble:  s.clearBubble,
  setMode:      s.setMode,
  setSpeed:     s.setSpeed,
  setExpiresAt: s.setExpiresAt,
  setDissolving: s.setDissolving,
  addSosAlert:  s.addSosAlert,
  removeSosAlert: s.removeSosAlert,
  clearSosAlerts: s.clearSosAlerts,
  setChimeEnabled: s.setChimeEnabled,
})));
