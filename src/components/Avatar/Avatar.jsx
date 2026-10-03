/**
 * src/components/Avatar/Avatar.jsx
 * Avatar with initials, custom background colour, battery ring, and online dot.
 */

import clsx from 'clsx';
import styles from './Avatar.module.css';
import { BATTERY_WARN_THRESHOLD, BATTERY_LOW_THRESHOLD } from '../../sim/nodes.js';

function batteryColor(pct) {
  if (pct <= BATTERY_LOW_THRESHOLD) return '#DC2626';
  if (pct <= BATTERY_WARN_THRESHOLD) return '#F59E0B';
  return '#16A34A';
}

/**
 * @param {{
 *   name: string,
 *   bg?: string,
 *   color?: string,
 *   size?: 'xs'|'sm'|'md'|'lg'|'xl',
 *   battery?: number,   // 0-100; omit to hide ring
 *   online?: boolean,   // omit to hide dot
 *   showOnlineDot?: boolean,
 *   className?: string,
 * }} props
 */
function Avatar({
  name,
  bg = '#E0F2FE',
  color = '#0284C7',
  size = 'md',
  battery,
  online,
  showOnlineDot = false,
  className,
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  // Battery ring SVG
  const ringSize = { xs: 32, sm: 40, md: 48, lg: 56, xl: 64 }[size] ?? 48;
  const r = ringSize / 2 - 2;
  const circumference = 2 * Math.PI * r;
  const bColor = battery != null ? batteryColor(battery) : '#16A34A';
  const dashOffset = battery != null
    ? circumference * (1 - battery / 100)
    : circumference;

  return (
    <div className={clsx(styles.avatar, styles[size], className)}
      style={{ background: bg }}>
      <span className={styles.initials} style={{ color }}>
        {initials}
      </span>

      {battery != null && (
        <svg
          className={styles.ring}
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          aria-hidden
        >
          {/* Track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={2}
          />
          {/* Progress */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={r}
            fill="none"
            stroke={bColor}
            strokeWidth={2}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
      )}

      {showOnlineDot && (
        <span
          className={clsx(styles.onlineDot, !online && styles.offline)}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

export default Avatar;
