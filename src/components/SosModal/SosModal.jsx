import { ShieldAlert, Activity, Navigation } from 'lucide-react';
import Button from '../Button/Button.jsx';
import Modal from '../Modal/Modal.jsx';
import { useSosState, useBubbleActions } from '../../store/bubbleStore.js';
import styles from './SosModal.module.css';

export default function SosModal() {
  const { alerts, chimeEnabled } = useSosState();
  const { removeSosAlert, setChimeEnabled } = useBubbleActions();

  if (!alerts || alerts.length === 0) return null;

  const alert = alerts[0]; // Show the first active alert

  return (
    <Modal
      open={true}
      onClose={() => {}} // Can't close by clicking outside
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#BE123C' }}>
          <ShieldAlert size={20} /> INCOMING SOS
        </div>
      }
      footer={
        <div style={{ display: 'flex', width: '100%', gap: 12 }}>
          <Button variant="ghost" fullWidth onClick={() => removeSosAlert(alert.id)}>
            Dismiss
          </Button>
          <Button variant="primary" fullWidth onClick={() => {
            // handle ACK
            removeSosAlert(alert.id);
          }}>
            I can help (ACK)
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        <div className={styles.typeRow}>
          <span className={styles.typeBadge}>{alert.type || 'General'}</span>
          <span className={styles.severityBadge}>Severity {alert.severity || 2}/5</span>
        </div>
        
        <p className={styles.summary}>{alert.summary || 'Emergency reported nearby.'}</p>
        
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <Navigation size={14} /> {alert.distance || '120m away'}
          </div>
          <div className={styles.metaItem}>
            <Activity size={14} /> {alert.hops || 2} hops
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#64748B', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={chimeEnabled} 
              onChange={(e) => setChimeEnabled(e.target.checked)} 
              style={{ accentColor: '#E11D48' }}
            />
            Play sound on SOS
          </label>
        </div>
      </div>
    </Modal>
  );
}
