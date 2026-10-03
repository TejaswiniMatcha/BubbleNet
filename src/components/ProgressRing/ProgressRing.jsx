/**
 * src/components/ProgressRing/ProgressRing.jsx
 */
import clsx from 'clsx';
import styles from './ProgressRing.module.css';

export default function ProgressRing({ size = 40, strokeWidth = 4, progress = 0, className, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={clsx(styles.root, className)} style={{ width: size, height: size }}>
      <svg className={styles.svg} width={size} height={size}>
        <circle
          className={styles.track}
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={styles.fill}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
      </svg>
      {children && (
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}
