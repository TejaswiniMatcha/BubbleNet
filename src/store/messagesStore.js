/**
 * src/store/messagesStore.js
 * Zustand slice for chat messages.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

const useMessagesStore = create((set) => ({
  messages: [],  // { id, fromId, toId, content, type, priority, sentAt, state, hopCount, path }
  states:   {},  // msgId -> { state, hopCount, path }

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateMessageState: (msgId, state, meta = {}) =>
    set((s) => ({
      states: {
        ...s.states,
        [msgId]: { state, hopCount: meta.hopCount, path: meta.path },
      },
    })),

  clearMessages: () => set({ messages: [], states: {} }),
}));

export default useMessagesStore;

export const useMessages = () => useMessagesStore(useShallow((s) => s.messages));
export const useMessageStates = () => useMessagesStore(useShallow((s) => s.states));
export const useMessagesActions = () =>
  useMessagesStore(useShallow((s) => ({
    addMessage:          s.addMessage,
    updateMessageState:  s.updateMessageState,
    clearMessages:       s.clearMessages,
  })));
