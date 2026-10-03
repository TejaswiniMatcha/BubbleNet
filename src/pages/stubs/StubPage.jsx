/**
 * src/pages/stubs/StubPage.jsx
 * Generic stub for pages not yet fully built.
 */

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useBubble } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';

const STUB_STYLES = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  color: 'var(--text-secondary)',
};

export function BubbleGuard({ children }) {
  const bubble   = useBubble();
  const navigate = useNavigate();
  const { addToast } = useUiActions();

  useEffect(() => {
    if (!bubble) {
      addToast({ message: 'Create or join a bubble to access this.', type: 'info' });
      navigate('/');
    }
  }, [bubble, navigate, addToast]);

  if (!bubble) return null;
  return children;
}

export function StubPage({ icon, title, desc }) {
  return (
    <div style={STUB_STYLES}>
      <div style={{ fontSize: '3rem' }}>{icon}</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
