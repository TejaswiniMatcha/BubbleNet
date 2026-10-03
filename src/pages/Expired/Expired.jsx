/**
 * src/pages/Expired/Expired.jsx
 */

import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';

export default function Expired() {
  const navigate = useNavigate();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>⏰</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Bubble Expired</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 360, textAlign: 'center' }}>
        This bubble has ended. All messages were only stored locally and have now been cleared.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button onClick={() => navigate('/create')}>Create New Bubble</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );
}
