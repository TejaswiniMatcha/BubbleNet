/**
 * src/sim/emergencyClassifier.js
 * Rule-based classifier for Emergency mode message structuring.
 * No ML, no React, no external deps.
 */

export const CATEGORY = {
  DANGER:    'DANGER',
  SITUATION: 'SITUATION',
  STATUS_OK: 'STATUS_OK',
  INFO:      'INFO',
};

const DANGER_KEYWORDS = [
  'fire', 'smoke', 'trapped', 'injured', 'bleeding', 'medical',
  'help', 'sos', 'emergency', 'hurt', 'unconscious', 'attack',
];

const SITUATION_KEYWORDS = [
  'power out', 'power outage', 'no signal', 'lost', 'dark',
  'no electricity', 'blackout', 'flooding', 'earthquake',
  'evacuation', 'evacuate', 'blocked', 'collapse',
];

const STATUS_OK_KEYWORDS = [
  'safe', 'found exit', 'ok', 'okay', 'accounted', 'outside',
  'evacuated', 'fine', 'not hurt', 'im alright', "i'm alright",
  'all good', 'reached', 'secure',
];

/**
 * @param {string} text
 * @returns {{ category: string, priority: number, suggestedActions: string[] }}
 */
export function classifyMessage(text) {
  const lower = text.toLowerCase();

  if (DANGER_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      category: CATEGORY.DANGER,
      priority: 0,
      suggestedActions: [
        'Call emergency services if radio available',
        'Mark your location on the radar',
        'Stay low if smoke is present',
      ],
    };
  }

  if (SITUATION_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      category: CATEGORY.SITUATION,
      priority: 1,
      suggestedActions: [
        'Share your location on the radar',
        'Enable relay to extend network reach',
        'Conserve battery — keep screen dim',
      ],
    };
  }

  if (STATUS_OK_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      category: CATEGORY.STATUS_OK,
      priority: 2,
      suggestedActions: [
        'Confirm head count in your group',
        'Share your exit route with others',
      ],
    };
  }

  return {
    category: CATEGORY.INFO,
    priority: 3,
    suggestedActions: [],
  };
}
