/**
 * src/components/Slider/Slider.jsx
 */
import clsx from 'clsx';
import styles from './Slider.module.css';

export default function Slider({ value, min = 0, max = 100, onChange, className }) {
  return (
    <div className={clsx(styles.root, className)}>
      <input
        type="range"
        className={styles.input}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
