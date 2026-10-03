/**
 * src/store/bubbleStore.js
 * Zustand slice for active bubble state — persisted to localStorage.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

const STORAGE_KEY = 'socialbubble-bubble-v1';

/** Demo bubble used when no bubble exists (enables direct URL navigation) */
const DEMO_BUBBLE = {
  id:           'demo-bubble-001',
  name:         'Group Bubble',
  pin:          '5250',
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
  } catch (_) { /* corrupted data — ignore */ }
  return DEMO_BUBBLE; // fallback to demo so tabs always work
}

function saveBubble(bubble) {
  try {
    if (bubble) localStorage.setItem(STORAGE_KEY, JSON.stringify(bubble));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (_) { /* quota exceeded — ignore */ }
}

const useBubbleStore = create((set) => ({
  bubble:    loadPersistedBubble(),
  mode:      'social',
  speed:     '1x',
  expiresAt: null,

  setBubble: (bubble) => {
    saveBubble(bubble);
    set({ bubble });
  },
  clearBubble: () => {
    saveBubble(null);
    set({ bubble: null, expiresAt: null });
  },
  setMode:      (mode)  => set({ mode }),
  setSpeed:     (speed) => set({ speed }),
  setExpiresAt: (t)     => set({ expiresAt: t }),
}));

export default useBubbleStore;

// Selectors
export const useBubble  = () => useBubbleStore(useShallow((s) => s.bubble));
export const useMode    = () => useBubbleStore((s) => s.mode);
export const useSpeed   = () => useBubbleStore((s) => s.speed);
export const useExpiry  = () => useBubbleStore(useShallow((s) => ({
  expiresAt: s.expiresAt,
  bubble:    s.bubble,
})));
export const useBubbleActions = () => useBubbleStore(useShallow((s) => ({
  setBubble:    s.setBubble,
  clearBubble:  s.clearBubble,
  setMode:      s.setMode,
  setSpeed:     s.setSpeed,
  setExpiresAt: s.setExpiresAt,
})));
