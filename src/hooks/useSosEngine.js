import { useEffect } from 'react';
import { simulator } from '../sim/simulator.js';
import { useBubbleActions, useSosState } from '../store/bubbleStore.js';
import { useUiActions } from '../store/uiStore.js';

let audioCtx = null;

function playChime() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  } catch {
    // Ignore audio errors
  }
}

export function useSosEngine() {
  const { addSosAlert, removeSosAlert } = useBubbleActions();
  const { chimeEnabled } = useSosState();
  const { addToast } = useUiActions();

  useEffect(() => {
    const handleIncomingSOS = (packet) => {
      // De-duplicate by alertId (simulated by using packet.id or timestamp)
      const id = packet.id || `sos-${Date.now()}`;
      
      const alert = {
        ...packet,
        id,
        receivedAt: Date.now(),
        distance: packet.distance || '120m away',
        hops: packet.hops || 2,
      };
      
      addSosAlert(alert);
      
      // Play chime if enabled
      if (chimeEnabled) {
        playChime();
      }
    };
    
    const handleCancelSOS = (alertId) => {
      removeSosAlert(alertId);
      addToast({ message: "SOS Alert Cancelled by sender", type: "info" });
    };

    const unsub1 = simulator.eventBus.on('incoming-sos', handleIncomingSOS);
    const unsub2 = simulator.eventBus.on('cancel-sos', handleCancelSOS);

    return () => {
      unsub1();
      unsub2();
    };
  }, [addSosAlert, removeSosAlert, chimeEnabled, addToast]);
}
