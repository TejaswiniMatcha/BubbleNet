/**
 * src/components/Tabs/Tabs.jsx
 */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import styles from './Tabs.module.css';

export default function Tabs({ tabs, activeTab, onChange, className }) {
  const [activeRect, setActiveRect] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const activeEl = rootRef.current.querySelector('[aria-selected="true"]');
    if (activeEl) {
      setActiveRect({
        width: activeEl.offsetWidth,
        left: activeEl.offsetLeft,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className={clsx(styles.tabs, className)} ref={rootRef} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={clsx(styles.tab, isActive && styles.active)}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
      {activeRect && (
        <motion.div
          className={styles.underline}
          initial={false}
          animate={{
            left: activeRect.left,
            width: activeRect.width,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  );
}
