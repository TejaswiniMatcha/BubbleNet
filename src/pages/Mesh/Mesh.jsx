import { BubbleGuard } from '../stubs/StubPage.jsx';
import MeshTab from '../../components/NetworkDrawer/tabs/MeshTab.jsx';

export default function Mesh() {
  return (
    <BubbleGuard>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 'var(--sp-6)', gap: 'var(--sp-4)', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 1.5vw, 1.5rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Mesh Network
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
            Live view of the relay topology. Pulses show messages in transit.
          </p>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', padding: 'var(--sp-6)' }}>
          <MeshTab />
        </div>
      </div>
    </BubbleGuard>
  );
}
