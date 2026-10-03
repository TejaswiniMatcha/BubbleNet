import { describe, it, expect } from 'vitest';
import { LWWRegister, LWWMap } from './lamport.js';

describe('Lamport LWW Register', () => {
  it('should resolve concurrent edits using timestamps', () => {
    const regA = new LWWRegister('nodeA', 'val1', 1);
    const regB = new LWWRegister('nodeB', 'val2', 2);
    
    // A merges B
    regA.merge(regB.getState());
    expect(regA.value).toBe('val2');
    expect(regA.time).toBe(2);
    
    // B merges A (no change for B)
    regB.merge(regA.getState());
    expect(regB.value).toBe('val2');
  });

  it('should break ties using nodeId', () => {
    // Both happen at time 5
    const regA = new LWWRegister('nodeA', 'valA', 5);
    const regB = new LWWRegister('nodeB', 'valB', 5);
    
    regA.merge(regB.getState());
    regB.merge(regA.getState());
    
    // nodeB > nodeA, so nodeB's value wins
    expect(regA.value).toBe('valB');
    expect(regB.value).toBe('valB');
  });

  it('converges correctly under shuffled operation order', () => {
    const nodes = ['n1', 'n2', 'n3'].map(id => new LWWMap(id));
    
    // Generate some concurrent operations
    const ops = [
      { from: 0, key: 'note1', val: 'Hello from n1' },
      { from: 1, key: 'note1', val: 'Hi from n2' },
      { from: 2, key: 'note2', val: 'n3 new note' },
      { from: 0, key: 'note1', val: 'Hello again n1' }
    ];
    
    // Apply them locally and capture their exported states
    const states = ops.map(op => {
      nodes[op.from].set(op.key, op.val);
      return { key: op.key, state: nodes[op.from].data.get(op.key).getState() };
    });
    
    // Shuffle the states differently for each node to simulate network jitter
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    
    nodes[0].merge(states[2].key, states[2].state);
    nodes[0].merge(states[1].key, states[1].state);
    
    nodes[1].merge(states[0].key, states[0].state);
    nodes[1].merge(states[3].key, states[3].state);
    
    // Apply all randomly to everyone
    for (let i = 0; i < 3; i++) {
      const shuffledStates = shuffle(states);
      for (const s of shuffledStates) {
        nodes[i].merge(s.key, s.state);
      }
    }
    
    // All nodes should have converged to the exact same values
    const vals0 = nodes[0].exportValues();
    const vals1 = nodes[1].exportValues();
    const vals2 = nodes[2].exportValues();
    
    expect(vals0).toEqual(vals1);
    expect(vals1).toEqual(vals2);
  });
});
