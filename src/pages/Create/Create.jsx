/**
 * src/pages/Create/Create.jsx
 * Create a new bubble.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Create.module.css';
import Button from '../../components/Button/Button.jsx';
import { useBubbleActions } from '../../store/bubbleStore.js';
import { simulator } from '../../sim/simulator.js';
import { MessageCircle, Tag, Users, Clock, Check, ArrowRight, Sparkles, Handshake } from 'lucide-react';
import clsx from 'clsx';
import Switch from '../../components/Switch/Switch.jsx';

const EXPIRY_OPTIONS = [
  { label: '30 min', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '3 hours', value: 10800 },
  { label: 'Manual', value: 0 },
];

const MODE_OPTIONS = [
  { key: 'social', label: 'Social',        desc: 'Share moments and stay connected at events.', icon: <Users size={20} color="#0284C7" /> },
  { key: 'collab', label: 'Collaborate',   desc: 'Work together on shared tasks and files.', icon: <Handshake size={20} color="#D97706" /> },
  { key: 'sos',    label: 'Emergency',     desc: 'Priority messaging for critical situations.', icon: <span style={{color:"#DC2626", fontWeight:800, fontSize:14}}>SOS</span> },
];

export default function Create() {
  const navigate = useNavigate();
  const { setBubble, setMode, setExpiresAt } = useBubbleActions();

  const [name,     setName]     = useState('');
  const [mode,     setModeLocal] = useState('social');
  const [expiry,   setExpiry]   = useState(3600);
  const [allowRelay, setAllowRelay] = useState(true);
  const [autoApprove, setAutoApprove] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error,    setError]    = useState('');

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a bubble name.'); return; }
    setLoading(true);
    setLoadingText('Starting Bluetooth LE...');
    
    setTimeout(() => {
      setLoadingText('Enabling Wi-Fi Direct...');
      
      setTimeout(() => {
        setLoadingText('Bubble ready');
        
        setTimeout(() => {
          const bubble = simulator.createBubble({ name: name.trim(), mode, expiry, autoApprove });
          setBubble(bubble);
          setMode(mode);
          if (expiry > 0) setExpiresAt(Date.now() + expiry * 1000);
          setLoading(false);
          navigate('/created');
        }, 400);
      }, 400);
    }, 400);
  }

  return (
    <div className={styles.page}>


      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <MessageCircle size={24} color="#FFF" />
          </div>
          <div>
            <h1 className={styles.title}>Create a <span className={styles.highlight}>Bubble</span></h1>
            <p className={styles.subtitle}>
              Stay connected, share moments, and keep your circle close —<br/>
              no internet required. Powered by device-to-device mesh relay.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className={styles.form}>
          {/* Bubble Name */}
          <div className={styles.section}>
            <div className={styles.label}>
              <span className={styles.labelIcon}>✏️</span> Bubble Name
            </div>
            <div className={styles.inputWrapper}>
              <Tag size={16} className={styles.inputIcon} />
              <input
                id="bubble-name"
                className={styles.input}
                placeholder="e.g. Campus Fest Block A"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* Mode selector */}
          <div className={styles.section}>
            <div className={styles.label}>
              <Users size={16} className={styles.labelIconSvg} /> Mode
            </div>
            <div className={styles.modeGrid}>
              {MODE_OPTIONS.map((m) => {
                const isSelected = mode === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={clsx(styles.modeCard, isSelected && styles.selected)}
                    onClick={() => setModeLocal(m.key)}
                    aria-pressed={isSelected}
                  >
                    {isSelected && (
                      <div className={styles.checkBadge}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                    <div className={styles.modeIconWrapper}>{m.icon}</div>
                    <div className={styles.modeContent}>
                      <div className={styles.modeLabel}>{m.label}</div>
                      <div className={styles.modeDesc}>{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiry */}
          <div className={styles.section}>
            <div className={styles.label}>
              <Clock size={16} className={styles.labelIconSvg} /> Bubble duration
            </div>
            <div className={styles.expiryRow}>
              {EXPIRY_OPTIONS.map((o) => {
                const isSelected = expiry === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={clsx(styles.expiryBtn, isSelected && styles.selected)}
                    onClick={() => setExpiry(o.value)}
                    aria-pressed={isSelected}
                  >
                    {o.label}
                    {isSelected && <Check size={14} className={styles.expiryCheck} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.togglesRow}>
            <Switch
              id="allow-relay"
              label="Allow relay through my phone"
              checked={allowRelay}
              onChange={setAllowRelay}
            />
            <Switch
              id="auto-approve"
              label="Auto-approve nearby phones"
              checked={autoApprove}
              onChange={setAutoApprove}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? null : <Sparkles size={18} />}
            {loading ? loadingText : 'Create Bubble'}
            {loading ? null : <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
