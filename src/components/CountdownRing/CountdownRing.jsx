/**
 * src/components/CountdownRing/CountdownRing.jsx
 */
import { useEffect, useState } from 'react';
import ProgressRing from '../ProgressRing/ProgressRing.jsx';

export default function CountdownRing({ targetDate, durationMs = 3600000, size = 40, strokeWidth = 4, className }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!targetDate) return;

    function update() {
      const now = Date.now();
      const remaining = Math.max(0, targetDate - now);
      const pct = (remaining / durationMs) * 100;
      setProgress(pct);
    }
    
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate, durationMs]);

  return (
    <ProgressRing size={size} strokeWidth={strokeWidth} progress={progress} className={className} />
  );
}
