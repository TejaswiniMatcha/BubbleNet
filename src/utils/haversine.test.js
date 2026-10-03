import { describe, it, expect } from 'vitest';
import { getDistance, getBearing } from './haversine.js';

describe('Haversine Formula', () => {
  it('calculates distance correctly between known points', () => {
    // New York: 40.7128° N, 74.0060° W
    // London: 51.5074° N, 0.1278° W
    const dist = getDistance(40.7128, -74.0060, 51.5074, -0.1278);
    // Approximate distance is ~5570 km
    expect(dist).toBeGreaterThan(5500000);
    expect(dist).toBeLessThan(5600000);
  });

  it('calculates bearing correctly between known points', () => {
    // Paris: 48.8566° N, 2.3522° E
    // Berlin: 52.5200° N, 13.4050° E
    const bearing = getBearing(48.8566, 2.3522, 52.5200, 13.4050);
    // Approximate initial bearing is ~54 degrees (North-East)
    expect(bearing).toBeGreaterThan(50);
    expect(bearing).toBeLessThan(60);
  });
  
  it('handles identical points as 0 distance', () => {
    const dist = getDistance(40, -74, 40, -74);
    expect(dist).toBeCloseTo(0);
  });
});
