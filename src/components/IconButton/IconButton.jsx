/**
 * src/components/IconButton/IconButton.jsx
 */

import clsx from 'clsx';
import styles from './IconButton.module.css';

export default function IconButton({
  size = 'md',
  active = false,
  'aria-label': ariaLabel,
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={clsx(styles.btn, styles[size], active && styles.active, className)}
      aria-label={ariaLabel}
      type="button"
      {...rest}
    >
      {children}
    </button>
  );
}
