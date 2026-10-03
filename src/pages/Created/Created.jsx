import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, Lightbulb, Wifi, MapPin, Shield, ArrowRight, Lock, Share2 } from 'lucide-react';
import styles from './Created.module.css';
import Button from '../../components/Button/Button.jsx';
import { useBubble } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';

export default function Created() {
  const bubble = useBubble();
  const navigate = useNavigate();
  const { addToast } = useUiActions();

  const [copied, setCopied] = useState(false);

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

          <div className={styles.qrWrap}>
            <QRCodeSVG
              value={qrData}
              size={180}
              level="M"
              bgColor="#F0F9FF"
              fgColor="#0F172A"
            />
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
          <div className={styles.infoCard}>
            <div className={styles.iconCircle}><Users size={20} /></div>
            <div>
              <div className={styles.infoTitle}>What happens next?</div>
              <div className={styles.infoText}>
                People nearby can scan the QR code or enter the PIN to join this bubble and connect with you.
              </div>
            </div>
          </div>

          <div className={styles.tipsHeader}>
            <Lightbulb size={18} color="#0284C7" /> Quick Tips
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}><Wifi size={16} /></div>
            <div className={styles.tipText}>Keep your device's mesh relay on for better connectivity.</div>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}><MapPin size={16} /></div>
            <div className={styles.tipText}>Stay in the same area for a stronger connection.</div>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}><Shield size={16} /></div>
            <div className={styles.tipText}>End-to-end encrypted & privacy focused.</div>
          </div>

          <div className={styles.networkCard} onClick={handleShare}>
            <div className={styles.iconCircle}><Users size={20} /></div>
            <div>
              <div className={styles.networkTitle}>More people = Stronger network</div>
              <div className={styles.tipText}>Invite your friends and grow your bubble!</div>
            </div>
            <div className={styles.networkArrow}>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
