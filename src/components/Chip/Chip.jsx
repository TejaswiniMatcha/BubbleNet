/**
 * src/components/Chip/Chip.jsx
 * Pill/chip for labels, badges, status indicators.
 */

import clsx from 'clsx';
import styles from './Chip.module.css';

export default function Chip({
  variant = 'default',
  size = 'sm',
  dot = false,
  icon,
  children,
  className,
  ...rest
}) {
  return (
    <span
      className={clsx(styles.chip, styles[variant], styles[size], className)}
      {...rest}
    >
      {dot && <span className={styles.dot} aria-hidden />}
      {icon}
      {children}
    </span>
  );
}
