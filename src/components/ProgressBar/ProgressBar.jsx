/**
 * src/components/ProgressBar/ProgressBar.jsx
 */

import clsx from 'clsx';
import styles from './ProgressBar.module.css';

export default function ProgressBar({
  value = 0,     // 0-100
  size  = 'md',  // 'sm'|'md'|'lg'
  color,         // 'success'|'warning'|'danger'|undefined (uses mode-accent)
  className,
  'aria-label': ariaLabel,
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={clsx(styles.track, size !== 'md' && styles[size], className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={clsx(styles.fill, color && styles[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
