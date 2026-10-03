/**
 * src/components/Card/Card.jsx
 */

import clsx from 'clsx';
import styles from './Card.module.css';

export default function Card({
  elevated = false,
  clickable = false,
  flush = false,
  size,
  className,
  children,
  ...rest
}) {
  return (
    <div
      className={clsx(
        styles.card,
        elevated  && styles.elevated,
        clickable && styles.clickable,
        flush     && styles.flush,
        size      && styles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
