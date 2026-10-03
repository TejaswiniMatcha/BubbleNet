/**
 * src/pages/Join/Join.jsx
 * Join an existing bubble via PIN.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Flashlight, ArrowRight, ShieldAlert, KeyRound, Radio } from 'lucide-react';
import clsx from 'clsx';
import styles from './Join.module.css';
import Button from '../../components/Button/Button.jsx';
import PinInput from '../../components/PinInput/PinInput.jsx';
import Tabs from '../../components/Tabs/Tabs.jsx';
import { useBubbleActions } from '../../store/bubbleStore.js';
import { simulator } from '../../sim/simulator.js';

export default function Join() {
  const navigate = useNavigate();
  const { setBubble, setMode, setExpiresAt } = useBubbleActions();
  
  const [activeTab, setActiveTab] = useState('pin'); // 'qr', 'pin', 'nearby'
  
  // PIN state
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [failures, setFailures] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // QR state
  const [scanning, setScanning] = useState(false);

  // Nearby state
  const [nearbyStatus, setNearbyStatus] = useState('idle'); // idle | requesting | joined | denied

  useEffect(() => {
    let timer;
    if (lockoutTimer > 0) {
      timer = setInterval(() => setLockoutTimer(t => t - 1), 1000);
    } else if (lockoutTimer === 0 && failures >= 5) {
      setFailures(0);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer, failures]);

  function handleJoinPin(e) {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    if (pin.length < 4) return;
    
    setLoading(true);
    setTimeout(() => {
      if (pin === '4827') {
        const bubble = simulator.joinBubble(pin);
        setBubble(bubble);
        setMode('social');
        setExpiresAt(Date.now() + 3600 * 1000);
        navigate('/bubble/messages');
      } else {
        setLoading(false);
        setError(true);
        setTimeout(() => setError(false), 500); // shake duration
        setFailures(f => f + 1);
        if (failures >= 4) {
          setLockoutTimer(60);
        }
      }
    }, 700);
  }

  function handleScanQR() {
    setScanning(true);
    setTimeout(() => {
      const bubble = simulator.joinBubble('4827');
      setBubble(bubble);
      setMode('social');
      setExpiresAt(Date.now() + 3600 * 1000);
      navigate('/bubble/messages');
    }, 1200);
  }

  function handleRequestNearby() {
    setNearbyStatus('requesting');
    setTimeout(() => {
      setNearbyStatus('joined');
      setTimeout(() => {
        const bubble = simulator.joinBubble('4827');
        setBubble(bubble);
        setMode('social');
        setExpiresAt(Date.now() + 3600 * 1000);
        navigate('/bubble/messages');
      }, 800);
    }, 2000);
  }

  const TABS = [
    { id: 'qr', label: 'Scan QR' },
    { id: 'pin', label: 'Enter PIN' },
    { id: 'nearby', label: 'Nearby' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.bgSpheres}>
        <div className={clsx(styles.sphere, styles.s1)} />
        <div className={clsx(styles.sphere, styles.s2)} />
        <div className={clsx(styles.sphere, styles.s3)} />
      </div>

      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Join a <span className={styles.highlight}>Bubble</span></h1>
        </div>

        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            {activeTab === 'qr' && (
              <motion.div key="qr" className={styles.tabPane} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <div className={styles.viewfinder}>
                  <div className={styles.cornerTL} />
                  <div className={styles.cornerTR} />
                  <div className={styles.cornerBL} />
                  <div className={styles.cornerBR} />
                  <div className={styles.scanLine} />
                  <button className={styles.torchBtn}><Flashlight size={20} /></button>
                </div>
                <Button size="lg" fullWidth loading={scanning} onClick={handleScanQR} icon={<Camera size={18}/>}>
                  {scanning ? 'Scanning...' : 'Use demo QR'}
                </Button>
                <button className={styles.textLink}>Try an invalid code</button>
              </motion.div>
            )}

            {activeTab === 'pin' && (
              <motion.div key="pin" className={styles.tabPane} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <form onSubmit={handleJoinPin} className={styles.form}>
                  <p className={styles.desc}>Enter the 4-digit PIN shared by the creator.</p>
                  <div className={styles.pinSection}>
                    <motion.div
                      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <PinInput
                        id="join-pin"
                        value={pin}
                        onChange={(v) => { setPin(v); setError(false); }}
                        error={error}
                      />
                    </motion.div>
                  </div>

                  {lockoutTimer > 0 && (
                    <div className={styles.lockoutMsg}>
                      <ShieldAlert size={16} /> Too many attempts. Try again in {lockoutTimer}s.
                    </div>
                  )}

                  <p className={styles.hint}>Demo PIN: 4827</p>

                  <Button type="submit" fullWidth size="lg" loading={loading} disabled={pin.length < 4 || lockoutTimer > 0} icon={<ArrowRight size={18}/>}>
                    Join Bubble
                  </Button>
                </form>
              </motion.div>
            )}

            {activeTab === 'nearby' && (
              <motion.div key="nearby" className={styles.tabPane} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <p className={styles.desc}>Discoverable bubbles in range via mesh.</p>
                <div className={styles.bubbleList}>
                  <div className={styles.bubbleCard}>
                    <div className={styles.bubbleIcon}><Radio size={24} color="var(--mode-accent)"/></div>
                    <div className={styles.bubbleInfo}>
                      <div className={styles.bubbleName}>Campus Fest Block A</div>
                      <div className={styles.bubbleMeta}>Social • 5 members • 12m away</div>
                    </div>
                    {nearbyStatus === 'idle' && (
                      <Button size="sm" onClick={handleRequestNearby}>Join</Button>
                    )}
                    {nearbyStatus === 'requesting' && (
                      <div className={styles.statusWait}>Waiting...</div>
                    )}
                    {nearbyStatus === 'joined' && (
                      <div className={styles.statusSuccess}>Joined!</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
