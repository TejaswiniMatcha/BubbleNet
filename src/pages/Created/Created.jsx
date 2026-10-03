import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, Lock, Share2 } from 'lucide-react';
import styles from './Created.module.css';
import Button from '../../components/Button/Button.jsx';
import { useBubble } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';

export default function Created() {
  const bubble = useBubble();
  const navigate = useNavigate();
  const { addToast } = useUiActions();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const rTimer = setTimeout(() => {
      setRequests([{ id: 'r1', name: 'Aarav' }]);
    }, 3000);
    const rTimer2 = setTimeout(() => {
      setRequests(prev => [...prev, { id: 'r2', name: 'Meera' }]);
    }, 7000);
    return () => { clearTimeout(rTimer); clearTimeout(rTimer2); };
  }, []);

  const handleApprove = (id) => setRequests(prev => prev.filter(r => r.id !== id));
  const handleDeny = (id) => setRequests(prev => prev.filter(r => r.id !== id));

  useEffect(() => {
    if (!bubble) {
      navigate('/');
    }
  }, [bubble, navigate]);

  if (!bubble) return null;

  const qrData = JSON.stringify({ id: bubble.id, pin: bubble.pin });

  function copyPin() {
    navigator.clipboard.writeText(bubble.pin);
    setCopied(true);
    addToast({ message: 'PIN copied to clipboard', type: 'info' });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    const joinLink = `${window.location.origin}/join?id=${bubble.id}&pin=${bubble.pin}`;
    navigator.clipboard.writeText(joinLink);
    addToast({ message: 'Join link copied to clipboard!', type: 'success' });
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.leftCol}>
          <div className={styles.successIconWrap}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="16" y="16" width="32" height="32" rx="8" fill="#22C55E" />
              <path d="M26 32L30 36L38 28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {/* Radiating lines */}
              <path d="M12 24L16 26" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
              <path d="M24 12L26 16" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
              <path d="M52 24L48 26" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
              <path d="M40 12L38 16" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className={styles.title}>Bubble Created!</h1>
          <p className={styles.sub}>Share this QR code or PIN to invite others nearby.</p>

          <div className={styles.qrWrap} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', width: 220, height: 220, transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r="100" fill="none" stroke="#E2E8F0" strokeWidth="6" />
              <circle 
                cx="110" cy="110" r="100" fill="none" stroke="var(--mode-accent)" strokeWidth="6"
                strokeDasharray="628" strokeDashoffset={628 * (1 - timeLeft/300)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <QRCodeSVG
              value={qrData}
              size={170}
              level="M"
              bgColor="transparent"
              fgColor="#0F172A"
            />
            <div style={{ position: 'absolute', bottom: -20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Expires in {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
            </div>
          </div>

          <div className={styles.pinRow}>
            <div className={styles.pinLabel}><Lock size={14} color="#0284C7"/> PIN:</div>
            <div className={styles.pinChip}>
              {bubble.pin}
            </div>
            <button className={styles.copyBtn} onClick={copyPin} title="Copy PIN">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div className={styles.actions}>
            <Button size="lg" fullWidth onClick={handleShare}>
              <Share2 size={18} style={{ marginRight: 8 }} /> Share Bubble
            </Button>
            <Button size="lg" variant="secondary" fullWidth onClick={() => navigate('/bubble/messages')}>
              Enter Bubble →
            </Button>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.tipsHeader}>
            <Users size={18} color="#0284C7" /> Join Requests ({requests.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {requests.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
                Waiting for people to scan...
              </div>
            ) : (
              requests.map(req => (
                <motion.div 
                  key={req.id}
                  initial={{ x: 50, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  className={styles.infoCard} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mode-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--mode-accent)' }}>
                      {req.name.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 600 }}>{req.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" variant="ghost" onClick={() => handleDeny(req.id)}>Deny</Button>
                    <Button size="sm" variant="primary" onClick={() => handleApprove(req.id)}>Approve</Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
