/**
 * src/store/messagesStore.js
 * Zustand slice for chat messages.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { NODE_IDS } from '../sim/nodes.js';

const STORAGE_KEY = 'socialbubble-messages-v1';

const FAKE_CONV = {
  group: [
    { id: 'f1', fromId: NODE_IDS.MEERA, content: "Hey everyone! Are we still meeting at the campus node?", sentAt: Date.now() - 10 * 60000 },
    { id: 'f2', fromId: NODE_IDS.YOU, content: "Yes! I'll be there in 10 mins.", sentAt: Date.now() - 8 * 60000 },
    { id: 'f3', fromId: NODE_IDS.ROHAN, content: "Great! I'm on my way too.", sentAt: Date.now() - 7 * 60000 },
    { id: 'f4', fromId: NODE_IDS.SANA, content: "Can someone share the latest QR code for the bubble?", sentAt: Date.now() - 5 * 60000 },
    { id: 'f5', fromId: NODE_IDS.YOU, content: "Here you go! QR_Code.png", sentAt: Date.now() - 4 * 60000 },
    { id: 'f6', fromId: NODE_IDS.AARAV, content: "Got it! Thanks!", sentAt: Date.now() - 2 * 60000 },
  ],
  'aarav': [{ id: 'fa1', fromId: 'aarav', content: "Let's meet at the node!", sentAt: Date.now() - 60000 }],
  'meera': [{ id: 'fm1', fromId: 'meera', content: "Okay! I'll be there soon.", sentAt: Date.now() - 90000 }],
  'rohan': [{ id: 'fr1', fromId: 'rohan', content: "Let's meet at the node!", sentAt: Date.now() - 180000 }],
  'sana':  [{ id: 'fs1', fromId: 'sana',  content: "Sounds good 👌", sentAt: Date.now() - 86400000 }],
};

function loadConvMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  const init = {};
  Object.entries(FAKE_CONV).forEach(([k, v]) => { init[k] = [...v]; });
  return init;
}

function saveConvMessages(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const useMessagesStore = create((set) => ({
  messages: [],  // { id, fromId, toId, content, type, priority, sentAt, state, hopCount, path }
  states:   {},  // msgId -> { state, hopCount, path }
  convMessages: loadConvMessages(),

  setConvMessages: (updater) => set((s) => {
    const newMsgs = typeof updater === 'function' ? updater(s.convMessages) : updater;
    saveConvMessages(newMsgs);
    return { convMessages: newMsgs };
  }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateMessageState: (msgId, state, meta = {}) =>
    set((s) => ({
      states: {
        ...s.states,
        [msgId]: { state, hopCount: meta.hopCount, path: meta.path },
      },
    })),

  clearMessages: () => {
    saveConvMessages({});
    set({ messages: [], states: {}, convMessages: {} });
  },
}));

export default useMessagesStore;

export const useMessages = () => useMessagesStore(useShallow((s) => s.messages));
export const useMessageStates = () => useMessagesStore(useShallow((s) => s.states));
export const useConvMessages = () => useMessagesStore(useShallow((s) => s.convMessages));
export const useMessagesActions = () =>
  useMessagesStore(useShallow((s) => ({
    addMessage:          s.addMessage,
    updateMessageState:  s.updateMessageState,
    clearMessages:       s.clearMessages,
    setConvMessages:     s.setConvMessages,
  })));
