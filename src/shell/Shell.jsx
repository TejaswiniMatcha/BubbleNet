/**
 * src/shell/Shell.jsx
 * Main app shell — CSS grid layout with sidebar, topbar, main, right panel.
 */

import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import styles from './Shell.module.css';
import TopBar from './TopBar/TopBar.jsx';
import ToastContainer from '../components/Toast/Toast.jsx';
import Onboarding from '../components/Onboarding/Onboarding.jsx';
import { useSimLoop } from '../hooks/useSimLoop.js';
import { useBubble, useMode } from '../store/bubbleStore.js';

export default function Shell() {
  useSimLoop();
  const mode = useMode();
  const bubble = useBubble();

  return (
    <>
      {/* Narrow window guard */}
      <div className="narrow-guard" aria-live="polite">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
          <rect x="4" y="8" width="40" height="32" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2"/>
          <rect x="10" y="14" width="28" height="20" rx="2" fill="#BFDBFE"/>
        </svg>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
          BubbleNet is designed for laptop screens
        </h1>
        <p style={{ color: '#475569', maxWidth: 360 }}>
          Please widen your browser window to at least 900&nbsp;px to use this app.
        </p>
      </div>

      {/* Main shell */}
      <div
        id="app-shell"
        className={clsx(styles.shell, `mode-${mode}`, !bubble && styles.noPanel)}
      >
        <TopBar />
        <main className={styles.main}>
          {/* Background Spheres */}
          <div className={styles.bgSpheres}>
            <div className={clsx(styles.sphere, styles.s1)} />
            <div className={clsx(styles.sphere, styles.s2)} />
            <div className={clsx(styles.sphere, styles.s3)} />
            <div className={clsx(styles.sphere, styles.s4)} />
            
            {/* Dotted connection lines */}
            <svg className={styles.bgLines} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,25 Q15,35 12,45" fill="none" stroke="var(--mode-accent)" strokeWidth="0.15" strokeDasharray="1,1.5" opacity="0.4" />
              <path d="M100,85 Q80,50 87,17" fill="none" stroke="var(--mode-accent)" strokeWidth="0.15" strokeDasharray="1,1.5" opacity="0.4" />
            </svg>
          </div>
          <Outlet />
        </main>
      </div>

      <ToastContainer />
      <Onboarding />
    </>
  );
}
