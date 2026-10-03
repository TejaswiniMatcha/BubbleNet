/**
 * src/components/Switch/Switch.jsx
 */

import clsx from 'clsx';
import styles from './Switch.module.css';

export default function Switch({
  checked,
  onChange,
  label,
  sublabel,
  id,
  disabled,
  className,
}) {
  return (
    <label className={clsx(styles.wrapper, className)} htmlFor={id}>
      <span className={clsx(styles.track, checked && styles.checked)}>
        <span className={styles.thumb} />
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className={styles.input}
        />
      </span>
      {(label || sublabel) && (
        <span className={styles.labelGroup}>
          {label    && <span className={styles.label}>{label}</span>}
          {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
        </span>
      )}
    </label>
  );
}
