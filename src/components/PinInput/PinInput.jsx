/**
 * src/components/PinInput/PinInput.jsx
 * 4-box PIN entry with auto-advance.
 */

import { useRef } from 'react';
import clsx from 'clsx';
import styles from './PinInput.module.css';

export default function PinInput({ value = '', onChange, error, id = 'pin' }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const digits = value.split('').concat(Array(4).fill('')).slice(0, 4);

  function handleKey(idx, e) {
    const char = e.key;
    if (char === 'Backspace') {
      const next = digits.map((d, i) => (i === idx ? '' : d)).join('').padEnd(0);
      const trimmed = next.slice(0, idx) + next.slice(idx + 1);
      onChange(trimmed);
      refs[Math.max(0, idx - 1)]?.current?.focus();
      e.preventDefault();
      return;
    }
    if (/^\d$/.test(char)) {
      const arr = [...digits];
      arr[idx] = char;
      onChange(arr.join(''));
      if (idx < 3) refs[idx + 1]?.current?.focus();
      e.preventDefault();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (text) onChange(text);
    e.preventDefault();
  }

  return (
    <div className={styles.wrapper} role="group" aria-label="4-digit PIN">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`${id}-${i}`}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          readOnly
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={clsx(styles.box, d && styles.filled, error && styles.error)}
          aria-label={`Digit ${i + 1} of 4`}
        />
      ))}
    </div>
  );
}
