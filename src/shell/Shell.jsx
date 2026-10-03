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
import { useExpiryEngine } from '../hooks/useExpiryEngine.js';
import { useSosEngine } from '../hooks/useSosEngine.js';
import SosModal from '../components/SosModal/SosModal.jsx';
import DissolveOverlay from '../components/DissolveOverlay/DissolveOverlay.jsx';

export default function Shell() {
  useSimLoop();
  useExpiryEngine();
  useSosEngine();
  const mode = useMode();
  const bubble = useBubble();

  return (
    <>


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
      <SosModal />
      <DissolveOverlay />
    </>
  );
}
