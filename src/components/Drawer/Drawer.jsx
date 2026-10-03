/**
 * src/components/Drawer/Drawer.jsx
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';
import styles from './Drawer.module.css';
import IconButton from '../IconButton/IconButton.jsx';

export default function Drawer({ open, onClose, title, children, side = 'right' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={clsx(styles.drawer, styles[side])}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <IconButton icon={<X size={20} />} onClick={onClose} aria-label="Close" />
            </div>
            <div className={styles.content}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
