import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, Send, XCircle } from 'lucide-react';
import styles from './Emergency.module.css';
import Button from '../../components/Button/Button.jsx';
import MeshMap from '../../components/MeshMap/MeshMap.jsx';
import { BubbleGuard } from '../stubs/StubPage.jsx';
import { analyzeSOS } from '../../classifier/sosClassifier.js';
import { simulator } from '../../sim/simulator.js';
import { useUiActions } from '../../store/uiStore.js';

const QUICK_CHIPS = ['Medical', 'Fire', 'Accident', 'Security', 'Disaster', 'Missing person'];

export default function Emergency() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [responders, setResponders] = useState([]);
  const { addToast } = useUiActions();

  const handleChip = (chip) => {
    setText((prev) => (prev ? `${prev} ${chip}` : chip));
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = analyzeSOS(text);
      setTelemetry({
        ...result,
        locationHint: 'Near main gate', // mocked
      });
      setAnalyzing(false);
    }, 400);
  };

  const handleBroadcast = (skip = false) => {
    let packet = telemetry;
    if (skip || !packet) {
      packet = analyzeSOS(text || 'SOS Request');
      packet.locationHint = 'Near main gate';
    }
    
    setBroadcasting(true);
    // Simulate sending SOS through simulator
    simulator.sendSOS(packet);
    
    // Simulate getting responders
    setTimeout(() => {
      setResponders([{ name: 'Meera', eta: '2 mins' }]);
    }, 2000);
    setTimeout(() => {
      setResponders(prev => [...prev, { name: 'Aarav', eta: '5 mins' }]);
    }, 4500);
  };

  const handleCancel = () => {
    setBroadcasting(false);
    setTelemetry(null);
    setResponders([]);
    setText('');
    addToast({ message: "SOS Cancelled", type: "info" });
  };

  return (
    <BubbleGuard>
      <div className={styles.page}>
        <div className={styles.container}>
          
          <div className={styles.titleRow}>
            <ShieldAlert size={32} color="#E11D48" />
            <h1 className={styles.title}>Emergency SOS</h1>
            <p className={styles.sub}>Broadcast a high-priority alert to everyone nearby.</p>
          </div>

          {!broadcasting && (
            <motion.div className={styles.promptCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <textarea
                className={styles.textArea}
                placeholder="Describe your situation... (e.g., 'Injured ankle near the main gate')"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className={styles.chips}>
                {QUICK_CHIPS.map(c => (
                  <button key={c} className={styles.chip} onClick={() => handleChip(c)}>{c}</button>
                ))}
              </div>
              <div className={styles.actionRow}>
                <Button variant="secondary" fullWidth onClick={handleAnalyze} disabled={analyzing || !text.trim()}>
                  {analyzing ? 'Structuring your alert...' : 'Analyze'}
                </Button>
                <Button variant="danger" fullWidth onClick={() => handleBroadcast(true)}>
                  Send SOS now (skip)
                </Button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {telemetry && !broadcasting && (
              <motion.div className={styles.telemetryCard} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#BE123C', fontWeight: 700 }}>
                  <Activity size={16} /> Telemetry Packet
                </div>
                
                <div className={styles.telemetryGrid}>
                  <div>
                    <div className={styles.telemetryLabel}>Type</div>
                    <input className={styles.telemetryInput} value={telemetry.type} onChange={e => setTelemetry({...telemetry, type: e.target.value})} />
                  </div>
                  <div>
                    <div className={styles.telemetryLabel}>Severity</div>
                    <div className={styles.severityMeter}>
                      {[1,2,3,4,5].map(v => (
                        <div key={v} className={`${styles.severityDot} ${v <= telemetry.severity ? styles.active : ''}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className={styles.telemetryLabel}>People</div>
                    <input type="number" className={styles.telemetryInput} value={telemetry.people} onChange={e => setTelemetry({...telemetry, people: parseInt(e.target.value) || 0})} />
                  </div>
                  <div>
                    <div className={styles.telemetryLabel}>Location</div>
                    <input className={styles.telemetryInput} value={telemetry.locationHint} onChange={e => setTelemetry({...telemetry, locationHint: e.target.value})} />
                  </div>
                </div>

                <div>
                  <div className={styles.telemetryLabel}>Summary</div>
                  <input className={styles.telemetryInput} value={telemetry.summary} onChange={e => setTelemetry({...telemetry, summary: e.target.value})} />
                </div>
                
                <div style={{ fontSize: '0.75rem', color: '#FDA4AF' }}>Packet size: {JSON.stringify(telemetry).length} bytes</div>
                
                <Button variant="danger" size="lg" fullWidth onClick={() => handleBroadcast(false)}>
                  <Send size={18} style={{ marginRight: 8 }} /> Broadcast SOS
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {broadcasting && (
            <motion.div className={styles.broadcastCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className={styles.broadcastStatus}>
                <div className={styles.pulseDot} style={{ width: 12, height: 12, background: '#E11D48', borderRadius: '50%' }} />
                Broadcasting... Reached 4 devices, 4 hops
              </div>
              
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, marginTop: 12 }}>
                <MeshMap compact />
              </div>

              <div className={styles.respondersList}>
                {responders.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748B', padding: '16px 0' }}>Waiting for responders...</div>
                ) : (
                  responders.map((r, i) => (
                    <motion.div key={i} className={styles.responderItem} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ color: '#16A34A', fontWeight: 700 }}>ETA: {r.eta}</div>
                    </motion.div>
                  ))
                )}
              </div>

              <Button variant="secondary" fullWidth onClick={handleCancel} style={{ marginTop: 16 }}>
                <XCircle size={16} style={{ marginRight: 8 }} /> Cancel SOS ("I'm safe")
              </Button>
            </motion.div>
          )}

        </div>
      </div>
    </BubbleGuard>
  );
}
