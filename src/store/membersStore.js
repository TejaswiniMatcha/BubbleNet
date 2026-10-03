/**
 * src/store/membersStore.js
 * Zustand slice for mesh members / nodes.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { INITIAL_NODES } from '../sim/nodes.js';

const useMembersStore = create((set) => ({
  nodes: new Map(INITIAL_NODES.map((n) => [n.id, { ...n }])),

  updateNode: (nodeId, patch) =>
    set((s) => {
      const next = new Map(s.nodes);
      const existing = next.get(nodeId);
      if (existing) next.set(nodeId, { ...existing, ...patch });
      return { nodes: next };
    }),

  resetNodes: () =>
    set({ nodes: new Map(INITIAL_NODES.map((n) => [n.id, { ...n }])) }),
}));

export default useMembersStore;

export const useNodes = () => useMembersStore((s) => s.nodes);
export const useNodeList = () =>
  useMembersStore(useShallow((s) => Array.from(s.nodes.values())));
export const useMembersActions = () =>
  useMembersStore(useShallow((s) => ({
    updateNode:  s.updateNode,
    resetNodes:  s.resetNodes,
  })));
