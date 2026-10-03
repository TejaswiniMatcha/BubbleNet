import { describe, it, expect } from 'vitest';
import { tallyVotes } from './poll.js';

describe('Poll Tally Logic', () => {
  it('computes tallies and percentages correctly', () => {
    const options = ['Pizza', 'Burger', 'Sushi'];
    const votes = [
      { voter: 'A', optionIndex: 0 },
      { voter: 'B', optionIndex: 0 },
      { voter: 'C', optionIndex: 1 },
    ];
    
    const result = tallyVotes(options, votes);
    
    expect(result[0].count).toBe(2);
    expect(result[0].percentage).toBe(67); // 2/3
    expect(result[0].isWinner).toBe(true);
    
    expect(result[1].count).toBe(1);
    expect(result[1].percentage).toBe(33); // 1/3
    expect(result[1].isWinner).toBe(false);
    
    expect(result[2].count).toBe(0);
    expect(result[2].percentage).toBe(0);
  });
  
  it('handles ties', () => {
    const options = ['Yes', 'No'];
    const votes = [
      { voter: 'A', optionIndex: 0 },
      { voter: 'B', optionIndex: 1 },
    ];
    
    const result = tallyVotes(options, votes);
    
    expect(result[0].count).toBe(1);
    expect(result[1].count).toBe(1);
    expect(result[0].isWinner).toBe(true);
    expect(result[1].isWinner).toBe(true);
  });
});
