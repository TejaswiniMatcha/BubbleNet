/**
 * src/components/EmptyState/EmptyState.jsx
 */
import clsx from 'clsx';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={clsx(styles.root, className)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
