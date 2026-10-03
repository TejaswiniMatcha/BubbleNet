/**
 * src/components/Tooltip/Tooltip.jsx
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Tooltip.module.css';

export default function Tooltip({ content, children, placement = 'top' }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={styles.root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && content && (
          <motion.div
            className={clsx(styles.tooltip, styles[placement])}
            initial={{ opacity: 0, y: placement === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement === 'top' ? 5 : -5 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
