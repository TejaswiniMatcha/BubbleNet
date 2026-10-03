/**
 * src/components/Input/Input.jsx
 */

import clsx from 'clsx';
import styles from './Input.module.css';

export default function Input({
  label,
  helper,
  error,
  leadIcon,
  trailIcon,
  id,
  className,
  ...rest
}) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <div className={styles.inputWrap}>
        {leadIcon  && <span className={styles.leadIcon}>{leadIcon}</span>}
        <input
          id={id}
          className={clsx(
            styles.input,
            leadIcon  && styles.hasLeft,
            trailIcon && styles.hasRight,
            error     && styles.hasError,
          )}
          aria-describedby={helper || error ? `${id}-help` : undefined}
          aria-invalid={!!error}
          {...rest}
        />
        {trailIcon && <span className={styles.trailIcon}>{trailIcon}</span>}
      </div>
      {(helper || error) && (
        <span
          id={`${id}-help`}
          className={clsx(styles.helper, error && styles.error)}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}
