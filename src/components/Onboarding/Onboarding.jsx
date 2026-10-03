import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Onboarding.module.css';
import Button from '../Button/Button.jsx';
import { ArrowRight, Check } from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to BubbleNet',
    desc: 'Create offline social spaces anywhere. Share moments, messages, and files without internet access.',
    illu: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#E0F2FE" />
        <path d="M40 70C35 60 40 45 55 40C70 35 85 45 85 60C85 75 70 85 55 80C50 78 45 80 40 85V70Z" fill="#0284C7" />
      </svg>
    ),
  },
  {
    title: 'Mesh Relay',
    desc: 'Your phone can safely relay messages for others. The more people join, the stronger the network gets.',
    illu: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#EDE9FE" />
        <circle cx="35" cy="60" r="12" fill="#7C3AED" />
        <circle cx="85" cy="60" r="12" fill="#7C3AED" />
        <circle cx="60" cy="35" r="12" fill="#7C3AED" />
        <path d="M42 56L54 42M78 56L66 42M47 60H73" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    title: 'Emergency Ready',
    desc: 'In critical situations, use SOS mode for priority messaging. It bypasses regular traffic to get help fast.',
    illu: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#FEE2E2" />
        <rect x="40" y="40" width="40" height="40" rx="8" fill="#DC2626" />
        <path d="M60 48V72M48 60H72" stroke="white" strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const done = localStorage.getItem('onboarding_done');
      if (!done) setOpen(true);
    } catch (e) {
      // safely ignore
    }
  }, []);

  if (!open) return null;

  function finish() {
    try {
      localStorage.setItem('onboarding_done', 'true');
      if (name.trim()) localStorage.setItem('user_name', name.trim());
    } catch (e) {}
    setOpen(false);
  }

  function handleNext() {
    if (step < STEPS.length) {
      setStep(s => s + 1);
    } else {
      if (name.trim().length < 2 || name.trim().length > 20) {
        setError('Display name must be between 2 and 20 characters.');
        return;
      }
      finish();
    }
  }

  const isLast = step === STEPS.length;
  const currentStep = !isLast ? STEPS[step] : null;

  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className={styles.content}>
          <button className={styles.skipBtn} onClick={finish}>Skip</button>

          <AnimatePresence mode="wait">
            {!isLast ? (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div className={styles.illu}>{currentStep.illu}</div>
                <h2 className={styles.title}>{currentStep.title}</h2>
                <p className={styles.desc}>{currentStep.desc}</p>
              </motion.div>
            ) : (
              <motion.div
                key="step-name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={styles.form}
              >
                <div className={styles.illu} style={{ margin: '0 auto var(--sp-6)' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#F3F4F6" />
                    <circle cx="60" cy="45" r="16" fill="#9CA3AF" />
                    <path d="M30 90C30 75 45 65 60 65C75 65 90 75 90 90" stroke="#9CA3AF" strokeWidth="12" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className={styles.title} style={{ textAlign: 'center' }}>Who are you?</h2>
                <p className={styles.desc} style={{ textAlign: 'center' }}>Set a display name so others can recognize you.</p>
                
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  maxLength={20}
                  autoFocus
                />
                {error && <div className={styles.error}>{error}</div>}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ flex: 1 }} />

          {!isLast && (
            <div className={styles.dots}>
              {STEPS.map((_, i) => (
                <div key={i} className={clsx(styles.dot, step === i && styles.dotActive)} />
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Button size="lg" fullWidth onClick={handleNext}>
              {isLast ? 'Get Started' : 'Next'}
              {isLast ? <Check size={18} /> : <ArrowRight size={18} />}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
