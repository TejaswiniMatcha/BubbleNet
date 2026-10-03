/**
 * src/components/Button/Button.jsx
 * Primary shared button — variants: primary, secondary, ghost, danger.
 */

import clsx from 'clsx';
import styles from './Button.module.css';

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'ghost'|'danger',
 *   size?: 'sm'|'md'|'lg',
 *   loading?: boolean,
 *   fullWidth?: boolean,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   children?: React.ReactNode,
 *   className?: string,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...rest
}) {
  return (
    <button
      className={clsx(
        styles.btn,
        styles[variant],
        size !== 'md' && styles[size],
        loading  && styles.loading,
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
