/**
 * src/components/Badge/Badge.jsx
 */
import clsx from 'clsx';
import styles from './Badge.module.css';

export default function Badge({ children, variant = 'primary', size = 'md', className }) {
  if (!children && children !== 0) return null;
  return (
    <span className={clsx(styles.badge, styles[variant], styles[size], className)}>
      {children}
    </span>
  );
}
