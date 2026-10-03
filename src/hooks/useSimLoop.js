/**
 * src/hooks/useSimLoop.js
 * Drives the simulator clock from a requestAnimationFrame loop.
 */

import { useEffect, useRef } from 'react';
import { simulator } from '../sim/simulator.js';
import { useNodeList, useMembersActions } from '../store/membersStore.js';
import { useMessagesActions } from '../store/messagesStore.js';
import useBubbleStore from '../store/bubbleStore.js';

export function useSimLoop() {
  const rafRef       = useRef(null);
  const lastTimeRef  = useRef(null);
  const { updateNode } = useMembersActions();
  const { addMessage, updateMessageState } = useMessagesActions();
  const speed        = useBubbleStore((s) => s.speed);

  useEffect(() => {
    // Subscribe to sim events
    const unsubs = [
      simulator.eventBus.on('new-message', (msg) => {
        addMessage({ ...msg, state: 'queued' });
      }),
      simulator.eventBus.on('message-state', ({ msgId, state, hopCount, path }) => {
        updateMessageState(msgId, state, { hopCount, path });
      }),
      simulator.eventBus.on('node-changed', ({ nodeId, ...patch }) => {
        updateNode(nodeId, patch);
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [addMessage, updateMessageState, updateNode]);

  useEffect(() => {
    function loop(now) {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (speed !== 'pause') {
        simulator.tick(Math.min(delta, 100)); // cap at 100ms to avoid big jumps
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [speed]);
}
