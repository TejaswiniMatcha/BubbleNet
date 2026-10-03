import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button.jsx';
import { useExpiry, useBubbleActions } from '../../store/bubbleStore.js';
import { simulator } from '../../sim/simulator.js';

export default function DissolveOverlay() {
  const { isDissolving } = useExpiry();
  const { setExpiresAt, clearBubble, setDissolving } = useBubbleActions();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDissolving) {
      document.body.style.overflow = 'hidden';
      // Apply blur to app-shell
      const shell = document.getElementById('app-shell');
      if (shell) {
        shell.style.transition = 'filter 5s ease, opacity 5s ease';
        shell.style.filter = 'blur(10px) grayscale(50%)';
        shell.style.opacity = '0.5';
        shell.style.pointerEvents = 'none';
      }
    } else {
      document.body.style.overflow = '';
      const shell = document.getElementById('app-shell');
      if (shell) {
        shell.style.transition = '';
        shell.style.filter = '';
        shell.style.opacity = '';
        shell.style.pointerEvents = '';
      }
    }
  }, [isDissolving]);

  const handleExtend = () => {
    setExpiresAt(Date.now() + 60 * 60 * 1000); // 1 hr
    setDissolving(false);
  };

  const handleArchive = () => {
    clearBubble();
    simulator.resetDemo();
    setDissolving(false);
    navigate('/expired');
  };

  return (
    <AnimatePresence>
      {isDissolving && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{
              background: '#FFF',
              padding: 24,
              borderRadius: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ fontSize: '3rem' }}>⏳</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Bubble Expired</h2>
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>This bubble has reached the end of its life. Extend it or save the data.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="primary" fullWidth onClick={handleExtend}>Extend by 1h</Button>
              <Button variant="secondary" fullWidth onClick={handleArchive}>Save to Archive</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
