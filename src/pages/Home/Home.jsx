/**
 * src/pages/Home/Home.jsx
 * Landing page — Create or Join a bubble.
 */

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './Home.module.css';
import Button from '../../components/Button/Button.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import { useBubble, useMode, useBubbleActions } from '../../store/bubbleStore.js';
import useBubbleStore from '../../store/bubbleStore.js';
import { Users, UserPlus, LogOut, Radio, Clock, ShieldAlert, Handshake } from 'lucide-react';
import { simulator } from '../../sim/simulator.js';

const FEATURES = [
  { icon: '📡', title: 'Mesh Relay',    desc: 'Messages hop through nearby devices, reaching members up to 4 nodes away — no internet required.' },
  { icon: '🔒', title: 'E2E Encrypted', desc: 'Every message is end-to-end encrypted. Only bubble members can read it.' },
  { icon: '⚡', title: 'Offline-first', desc: 'Works without internet. Store-and-forward ensures delivery even when nodes are offline.' },
  { icon: '📍', title: 'Nearby & Private', desc: 'Messages stay within your local network. No central servers. No tracking.' },
];

export default function Home() {
  const navigate = useNavigate();
  const bubble   = useBubble();
  const currentMode = useMode();
  const { clearBubble, setMode } = useBubbleActions();
  const expiresAt = useBubbleStore((s) => s.expiresAt);
  const [remaining, setRemaining] = useState(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  useEffect(() => {
    if (!expiresAt) { setRemaining(null); return; }
    function update() {
      const left = expiresAt - Date.now();
      setRemaining(Math.max(0, left));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  function formatRemaining(ms) {
    if (!ms || ms <= 0) return '00h : 00m';
    const totalMins = Math.floor(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2,'0')}h : ${String(m).padStart(2,'0')}m remaining`;
  }

  function handleLeave() {
    clearBubble();
    simulator.resetDemo();
    setLeaveModalOpen(false);
  }

  if (bubble) {
    return (
      <div className={styles.page}>
        <div className={styles.activeContainer}>
          <motion.div
            className={styles.activeCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.activeHeader}>
              <div className={styles.activeIcon}><Radio size={24} color="var(--mode-accent)"/></div>
              <div className={styles.activeTitleWrap}>
                <h2 className={styles.activeTitle}>{bubble.name}</h2>
                <div className={styles.activeMeta}>
                  <Clock size={14} /> {formatRemaining(remaining)}
                </div>
              </div>
            </div>
            <div className={styles.activeActions}>
              <Button fullWidth onClick={() => navigate('/bubble/messages')}>Open Bubble</Button>
              <Button fullWidth variant="ghost" onClick={() => setLeaveModalOpen(true)} className={styles.leaveBtn}>
                <LogOut size={18} /> Leave
              </Button>
            </div>
          </motion.div>

          <motion.div
            className={styles.quickModes}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <button className={clsx(styles.quickCard, currentMode === 'social' && styles.quickActive)} onClick={() => { setMode('social'); navigate('/bubble/messages'); }}>
              <div className={styles.quickIcon} style={{color: '#0284C7'}}><Users size={20} /></div>
              <div className={styles.quickTitle}>Social</div>
            </button>
            <button className={clsx(styles.quickCard, currentMode === 'collab' && styles.quickActive)} onClick={() => { setMode('collab'); navigate('/bubble/messages'); }}>
              <div className={styles.quickIcon} style={{color: '#D97706'}}><Handshake size={20} /></div>
              <div className={styles.quickTitle}>Collaborate</div>
            </button>
            <button className={clsx(styles.quickCard, currentMode === 'sos' && styles.quickActive)} onClick={() => { setMode('sos'); navigate('/bubble/messages'); }}>
              <div className={styles.quickIcon} style={{color: '#DC2626'}}><ShieldAlert size={20} /></div>
              <div className={styles.quickTitle}>Emergency</div>
            </button>
          </motion.div>
        </div>

        <Modal
          open={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          title="Leave Bubble?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleLeave}>Leave Bubble</Button>
            </>
          }
        >
          <p>Are you sure you want to leave <strong>{bubble.name}</strong>? You will be disconnected from the mesh network.</p>
        </Modal>
      </div>
    );
  }

  return (
    <div className={styles.page}>


      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className={styles.heroIcon}>
          <div className={styles.logoMark} />
        </div>
        <h1 className={styles.heroTitle}>Create a Social Bubble</h1>
        <p className={styles.heroSub}>
          Share messages, photos, files and location with people nearby — no internet required.
          Powered by device-to-device mesh relay.
        </p>
      </motion.div>

      <div className={styles.actions}>
        <Button size="lg" variant="primary" onClick={() => navigate('/create')} icon={<Users size={18} />}>
          Create Bubble
        </Button>
        <Button size="lg" variant="secondary" onClick={() => navigate('/join')} icon={<UserPlus size={18} />}>
          Join Bubble
        </Button>
      </div>

      <motion.div
        className={styles.features}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div className={styles.featureTitle}>{f.title}</div>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
