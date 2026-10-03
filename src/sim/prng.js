/**
 * src/sim/prng.js
 * Seeded pseudo-random number generator (Mulberry32).
 * Never use Math.random() in src/sim — use this instead.
 */

/**
 * Create a seeded PRNG.
 * @param {number} seed - integer seed
 * @returns {{ next: () => number, nextInt: (min:number, max:number) => number, nextFloat: (min:number, max:number) => number }}
 */
export function createPRNG(seed) {
  let s = seed >>> 0;

  function next() {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min, max) {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function nextFloat(min, max) {
    return next() * (max - min) + min;
  }

  function getSeed() {
    return s;
  }

  return { next, nextInt, nextFloat, getSeed };
}

export const DEFAULT_SEED = 42;
