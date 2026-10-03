/**
 * src/sim/nodes.js
 * Static node definitions and topology.
 * Topology: You - Aarav - Meera - Rohan - Sana (chain)
 */

export const NODE_IDS = {
  YOU:   'you',
  AARAV: 'aarav',
  MEERA: 'meera',
  ROHAN: 'rohan',
  SANA:  'sana',
};

/** Initial node definitions */
export const INITIAL_NODES = [
  {
    id:           NODE_IDS.YOU,
    name:         'You',
    battery:      100,
    charging:     false,
    relayEnabled: true,
    online:       true,
    color:        '#0284C7',
    avatarBg:     '#E0F2FE',
    hopIndex:     0,
  },
  {
    id:           NODE_IDS.AARAV,
    name:         'Aarav',
    battery:      82,
    charging:     false,
    relayEnabled: true,
    online:       true,
    color:        '#7C3AED',
    avatarBg:     '#EDE9FE',
    hopIndex:     1,
  },
  {
    id:           NODE_IDS.MEERA,
    name:         'Meera',
    battery:      64,
    charging:     false,
    relayEnabled: true,
    online:       true,
    color:        '#D97706',
    avatarBg:     '#FEF3C7',
    hopIndex:     2,
  },
  {
    id:           NODE_IDS.ROHAN,
    name:         'Rohan',
    battery:      31,
    charging:     false,
    relayEnabled: true,
    online:       true,
    color:        '#059669',
    avatarBg:     '#ECFDF5',
    hopIndex:     3,
  },
  {
    id:           NODE_IDS.SANA,
    name:         'Sana',
    battery:      90,
    charging:     false,
    relayEnabled: true,
    online:       true,
    color:        '#DB2777',
    avatarBg:     '#FCE7F3',
    hopIndex:     4,
  },
];

/**
 * Adjacency list for the chain topology.
 * Each entry: [nodeId, neighborId]
 */
export const TOPOLOGY_EDGES = [
  [NODE_IDS.YOU,   NODE_IDS.AARAV],
  [NODE_IDS.AARAV, NODE_IDS.MEERA],
  [NODE_IDS.MEERA, NODE_IDS.ROHAN],
  [NODE_IDS.ROHAN, NODE_IDS.SANA],
];

/**
 * Build adjacency map from edges.
 * @param {Array<[string,string]>} edges
 * @returns {Map<string, string[]>}
 */
export function buildAdjacency(edges) {
  const adj = new Map();
  for (const [a, b] of edges) {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  }
  return adj;
}

export const BATTERY_LOW_THRESHOLD  = 20;   // % — relay suspended below this
export const BATTERY_WARN_THRESHOLD = 35;   // % — amber warning shown
