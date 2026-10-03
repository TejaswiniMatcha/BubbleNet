/**
 * src/sim/clock.js
 * Virtual clock for the simulator.
 * Never calls Date.now() — driven by the React layer via tick().
 */

const SPEEDS = { pause: 0, '1x': 1, '5x': 5, '20x': 20 };

export function createClock(initialSpeed = '1x') {
  let virtualMs = 0;
  let speedKey = initialSpeed;

  /** Advance virtual time. realDeltaMs = real elapsed ms since last tick. */
  function tick(realDeltaMs) {
    const multiplier = SPEEDS[speedKey] ?? 1;
    virtualMs += realDeltaMs * multiplier;
    return virtualMs;
  }

  function setSpeed(key) {
    if (!(key in SPEEDS)) throw new Error(`Unknown speed: ${key}`);
    speedKey = key;
  }

  function getSpeed() { return speedKey; }

  function getVirtualMs() { return virtualMs; }

  function reset() {
    virtualMs = 0;
  }

  return { tick, setSpeed, getSpeed, getVirtualMs, reset };
}

export const SPEED_OPTIONS = Object.keys({ pause: 0, '1x': 1, '5x': 5, '20x': 20 });
