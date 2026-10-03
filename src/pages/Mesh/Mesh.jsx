/**
 * src/pages/Mesh/Mesh.jsx
 * Full mesh network view.
 */

import { BubbleGuard } from '../stubs/StubPage.jsx';
import MeshMap from '../../components/MeshMap/MeshMap.jsx';

const pageStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--sp-6)',
  gap: 'var(--sp-4)',
};

const headerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const mapStyle = {
  flex: 1,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  boxShadow: 'var(--shadow-sm)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--sp-6)',
};

export default function Mesh() {
  return (
    <BubbleGuard>
      <div style={pageStyle}>
        <div style={headerStyle}>
          <h1 style={{ fontSize: 'clamp(1.25rem, 1.5vw, 1.5rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Mesh Network
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            Live view of the relay topology. Pulses show messages in transit.
          </p>
        </div>
        <div style={mapStyle}>
          <MeshMap />
        </div>
      </div>
    </BubbleGuard>
  );
}
