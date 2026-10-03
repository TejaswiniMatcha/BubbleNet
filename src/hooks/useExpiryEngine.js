import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBubbleStore from '../store/bubbleStore.js';
import { useUiActions } from '../store/uiStore.js';

export function useExpiryEngine() {
  const expiresAt = useBubbleStore((s) => s.expiresAt);
  const setRemaining = useBubbleStore((s) => s.setRemaining);
  const setDissolving = useBubbleStore((s) => s.setDissolving);
  const { addToast } = useUiActions();
  const navigate = useNavigate();
  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    
    let notified5 = false;
    let notified1 = false;
    
    function update() {
      const left = expiresAt - Date.now();
      
      if (left <= 0) {
        setRemaining(0);
        setDissolving(true);
        return;
      }
      
      setRemaining(left);
      
      if (left <= 5 * 60 * 1000 && !notified5) {
        addToast({ message: 'Bubble expires in 5 minutes.', type: 'warning' });
        notified5 = true;
      }
      if (left <= 60 * 1000 && !notified1) {
        addToast({ message: 'Bubble expires in 1 minute.', type: 'danger' });
        notified1 = true;
      }
    }
    
    update();
    if (expiresAt - Date.now() > 0) {
      const id = setInterval(update, 1000);
      return () => clearInterval(id);
    }
  }, [expiresAt, navigate, addToast, setRemaining, setDissolving]);
}
