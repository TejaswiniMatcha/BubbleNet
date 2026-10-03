export function analyzeSOS(text) {
  if (!text) return { type: 'General', severity: 1, people: 0, needs: [], summary: '', confidence: 0 };
  
  const lower = text.toLowerCase();
  
  const keywords = {
    Medical: ['medical', 'injured', 'hurt', 'bleeding', 'unconscious', 'breathing', 'heart', 'doctor', 'hospital', 'ambulance', 'sick', 'broken leg', 'pain', 'chest'],
    Fire: ['fire', 'burn', 'smoke', 'aag', 'flame', 'burning'],
    Accident: ['accident', 'crash', 'collision', 'hit', 'car', 'wreck'],
    Security: ['security', 'police', 'attack', 'gun', 'robbery', 'thief', 'danger', 'shooter', 'intruder', 'assault'],
    Disaster: ['disaster', 'earthquake', 'flood', 'trapped', 'building collapsed', 'tsunami', 'storm', 'tornado', 'hurricane'],
    'Missing person': ['missing', 'lost', 'kidnapped', 'can\'t find', 'abducted']
  };

  const misspellings = {
    'injurd': 'Medical',
    'helpp': 'General',
    'emergancy': 'General',
    'ambulanc': 'Medical',
    'madad': 'General',
  };

  let severity = 2; // Default
  if (/(not breathing|unconscious|bleeding|trapped|heart attack|severe|critical|gun|shooter|building collapsed)/.test(lower)) severity = 5;
  else if (/(broken|fire|crash|robbery)/.test(lower)) severity = 4;
  else if (/(hurt|lost|stuck|sick)/.test(lower)) severity = 3;

  if (/(no fire|false alarm|not an emergency)/.test(lower)) {
    severity = 1;
  }

  let scores = {};
  for (const [type, words] of Object.entries(keywords)) {
    scores[type] = 0;
    for (const word of words) {
      if (lower.includes(word)) scores[type]++;
    }
  }
  for (const [misspell, type] of Object.entries(misspellings)) {
    if (lower.includes(misspell)) {
      if (scores[type] !== undefined) scores[type]++;
    }
  }

  let bestType = 'General';
  let maxScore = 0;
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestType = type;
    }
  }

  let people = 0;
  const peopleMatch = lower.match(/(\d+)\s*(people|person|men|women|children|kids|students|injured|dead|casualties)/);
  if (peopleMatch) {
    people = parseInt(peopleMatch[1], 10);
  } else {
    // try word numbers
    const numWords = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10 };
    for (const [w, n] of Object.entries(numWords)) {
      if (new RegExp(`${w}\\s+(people|person|men|women|children|kids|students|injured)`).test(lower)) {
        people = n;
        break;
      }
    }
  }

  let needs = [];
  if (bestType === 'Medical' || severity >= 4) needs.push('Ambulance');
  if (bestType === 'Fire') needs.push('Firetruck');
  if (bestType === 'Security' || /(gun|robbery|attack)/.test(lower)) needs.push('Police');
  if (/(trapped|stuck|collapsed)/.test(lower)) needs.push('Rescue');

  // dedup needs
  needs = [...new Set(needs)];

  let summary = text.substring(0, 137);
  if (text.length > 137) summary += '...';

  let confidence = Math.min(100, maxScore * 20 + 40);
  if (maxScore === 0) confidence = 20;
  
  if (lower.includes('no fire')) {
    bestType = 'General';
    severity = 1;
  }

  return {
    type: bestType,
    severity,
    people,
    needs,
    summary,
    confidence
  };
}
