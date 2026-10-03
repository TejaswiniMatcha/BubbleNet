import { describe, it, expect } from 'vitest';
import { analyzeSOS } from './sosClassifier.js';

describe('sosClassifier', () => {
  it('handles empty input', () => {
    const res = analyzeSOS('');
    expect(res.type).toBe('General');
    expect(res.severity).toBe(1);
  });

  it('handles 10,000 character input', () => {
    const longText = 'fire '.repeat(2000); // 10,000 chars
    const res = analyzeSOS(longText);
    expect(res.type).toBe('Fire');
    expect(res.summary.length).toBeLessThanOrEqual(140);
  });

  it('classifies sentences with >= 90% accuracy', () => {
    const dataset = [
      // Medical
      { text: "My friend is bleeding heavily", expected: "Medical" },
      { text: "Someone is unconscious here", expected: "Medical" },
      { text: "He is not breathing, need a doctor", expected: "Medical" },
      { text: "Having chest pains, heart attack maybe", expected: "Medical" },
      { text: "Broken leg, hurts a lot", expected: "Medical" },
      { text: "Need ambulanc fast", expected: "Medical" }, // misspelling
      { text: "She is sick and dizzy", expected: "Medical" },
      { text: "Multiple injured people here", expected: "Medical" },
      { text: "Deep cut, bleeding", expected: "Medical" },
      { text: "Need medical attention", expected: "Medical" },
      // Fire
      { text: "Huge fire in the building", expected: "Fire" },
      { text: "I can smell smoke everywhere", expected: "Fire" },
      { text: "The house is burning", expected: "Fire" },
      { text: "Flames coming out of window", expected: "Fire" },
      { text: "Aag lag gayi", expected: "Fire" }, // hindi
      { text: "Kitchen is on fire", expected: "Fire" },
      { text: "Car is burning", expected: "Fire" },
      { text: "We need a firetruck now", expected: "Fire" }, // Wait, firetruck is not a keyword. The word 'fire' is.
      // Accident
      { text: "Car crash on highway", expected: "Accident" },
      { text: "Two cars collided", expected: "Accident" },
      { text: "Traffic accident", expected: "Accident" },
      { text: "Bike hit a truck", expected: "Accident" },
      { text: "Terrible wreck", expected: "Accident" },
      { text: "Bus collision", expected: "Accident" },
      // Security
      { text: "Active shooter spotted", expected: "Security" },
      { text: "Someone has a gun", expected: "Security" },
      { text: "Robbery in progress", expected: "Security" },
      { text: "Thief running away", expected: "Security" },
      { text: "Call police, we are in danger", expected: "Security" },
      { text: "Terrorist attack", expected: "Security" },
      { text: "Being assaulted", expected: "Security" },
      { text: "Intruder in my house", expected: "Security" },
      // Disaster
      { text: "Earthquake just happened", expected: "Disaster" },
      { text: "Building collapsed from earthquake", expected: "Disaster" },
      { text: "Trapped under rubble", expected: "Disaster" },
      { text: "Flood waters rising", expected: "Disaster" },
      { text: "Tsunami warning", expected: "Disaster" },
      { text: "Huge storm approaching", expected: "Disaster" },
      { text: "Tornado touching down", expected: "Disaster" },
      { text: "Hurricane damages", expected: "Disaster" },
      // Missing person
      { text: "My son is missing", expected: "Missing person" },
      { text: "Little girl kidnapped", expected: "Missing person" },
      { text: "Can't find my friend", expected: "Missing person" },
      { text: "Lost in the woods", expected: "Missing person" },
      { text: "Child abducted", expected: "Missing person" },
      // General / Negative
      { text: "I need madad", expected: "General" }, // madad is in misspellings mapped to General
      { text: "Just a test, no fire", expected: "General" },
      { text: "This is not an emergency", expected: "General" },
      { text: "Hello world", expected: "General" },
      { text: "Testing SOS", expected: "General" },
      { text: "Please helpp", expected: "General" }
    ];

    let correct = 0;
    for (const item of dataset) {
      const res = analyzeSOS(item.text);
      if (res.type === item.expected) {
        correct++;
      }
    }
    
    const accuracy = correct / dataset.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.9);
  });

  it('extracts people count correctly', () => {
    expect(analyzeSOS("4 people are hurt").people).toBe(4);
    expect(analyzeSOS("10 injured here").people).toBe(10);
    expect(analyzeSOS("five children stuck").people).toBe(5);
  });

  it('computes correct severity', () => {
    expect(analyzeSOS("unconscious").severity).toBe(5);
    expect(analyzeSOS("robbery").severity).toBe(4);
    expect(analyzeSOS("lost").severity).toBe(3);
    expect(analyzeSOS("hello").severity).toBe(2);
    expect(analyzeSOS("false alarm").severity).toBe(1);
    expect(analyzeSOS("no fire").severity).toBe(1);
  });
});
