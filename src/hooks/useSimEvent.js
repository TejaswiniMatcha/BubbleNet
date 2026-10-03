/**
 * src/hooks/useSimEvent.js
 * Subscribe to a simulator event bus event, auto-unsubscribing on unmount.
 */

import { useEffect } from 'react';
import { simulator } from '../sim/simulator.js';

export function useSimEvent(eventName, handler) {
  useEffect(() => {
    const unsub = simulator.eventBus.on(eventName, handler);
    return unsub;
  }, [eventName, handler]);
}
