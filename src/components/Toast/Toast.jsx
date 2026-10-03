/**
 * src/components/Toast/Toast.jsx
 * Toast notification system.
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';
import { useToasts, useUiActions } from '../../store/uiStore.js';

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info:    <Info size={16} />,
};

function ToastItem({ toast }) {
  const { removeToast } = useUiActions();

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      className={`${styles.toast} ${styles[toast.type ?? 'info']}`}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: 8,  scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon}>{ICONS[toast.type ?? 'info']}</span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.closeBtn}
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className={styles.container} aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
