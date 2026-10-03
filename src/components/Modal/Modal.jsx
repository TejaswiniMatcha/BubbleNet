/**
 * src/components/Modal/Modal.jsx
 * Accessible modal dialog with focus trap.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';
import styles from './Modal.module.css';
import IconButton from '../IconButton/IconButton.jsx';

export default function Modal({
  open,
  onClose,
  title,
  size,
  footer,
  children,
  className,
}) {
  const firstFocusRef = useRef(null);
  const prevFocusRef  = useRef(null);

  // Focus trap and restore
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement;
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    } else {
      prevFocusRef.current?.focus();
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className={clsx(styles.modal, size && styles[size], className)}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {title && (
              <div className={styles.header}>
                <h2 className={styles.title} ref={firstFocusRef} tabIndex={-1}>
                  {title}
                </h2>
                {onClose && (
                  <IconButton aria-label="Close dialog" onClick={onClose} size="sm">
                    <X size={16} />
                  </IconButton>
                )}
              </div>
            )}
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
