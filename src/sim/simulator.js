/**
 * src/sim/simulator.js
 * Main simulator facade — wires PRNG, clock, relay engine, and member behaviour.
 * No React imports.
 */

import { createPRNG, DEFAULT_SEED } from './prng.js';
import { createClock } from './clock.js';
import { createRelayEngine, PRIORITY, MSG_STATE } from './relay.js';
import { INITIAL_NODES, NODE_IDS } from './nodes.js';
import { eventBus } from './eventBus.js';

/* ── Social-mode copy ── */
const SOCIAL_MESSAGES = [
  'Who is at the main stage? ',
  'The food stalls near Gate 3 are incredible!',
  'Lost a blue cap near the amphitheatre — anyone?',
  'Battery charging station is behind the info tent',
  'Meet at the fountain in 10 mins?',
  'The DJ set starts in 20. Do not miss it!',
  'Anyone have extra sunscreen?',
  'Queue for wristbands is moving fast now',
  'Spotted the organiser — merch table is open!',
  'Water refill point is at the east entrance',
];

/* ── Collaboration-mode copy ── */
const COLLAB_MESSAGES = [
  'Section 3 of the report is done — review needed',
  'Can someone share the updated wireframes?',
  'Stand-up in 5 mins at table B',
  'API mock is ready, you can start integrating',
  'Found a bug in the auth flow — see notes',
  'Deadline moved up by 2 hours — heads up!',
  'Coffee break, then final review at 3 PM',
  'Who has the design file? Sharing via bubble',
  'Tests are green on my machine ✅',
  'Someone needs to update the README before submit',
];

/* ── Emergency-mode copy ── */
const EMERGENCY_MESSAGES = [
  'Power is out on floors 3–6. Taking the stairs.',
  'Assembly point is the parking lot south side',
  'Smoke on Level 4 — do NOT use elevators',
  "I'm at the lobby exit, can see everyone from here",
  'Fire alarm went off in Block B — evacuating now',
  "Security confirmed it's safe to leave via Gate A",
  'Roll call — is everyone from the 3rd floor here?',
  'One person still on floor 5, someone needs to check',
  'Backup generator came on in the server room',
  "Safe. I'm outside at the car park. 10 of us here.",
];

function getCopy(mode) {
  if (mode === 'collab') return COLLAB_MESSAGES;
  if (mode === 'sos') return EMERGENCY_MESSAGES;
  return SOCIAL_MESSAGES;
}

let _msgCounter = 1;
function newMsgId() { return `msg-${_msgCounter++}`; }

export function createSimulator(seed = DEFAULT_SEED) {
  const prng = createPRNG(seed);
  const clock = createClock('1x');

  // Node state: Map<id, nodeState>
  const nodes = new Map(INITIAL_NODES.map((n) => [n.id, { ...n }]));

  // Delivered messages array (for the store)
  const deliveredMessages = [];

  // Message state map
  const messageStates = new Map(); // msgId -> { state, hopCount, path }

  const relay = createRelayEngine({
    getNodes: () => nodes,
    prng,
    onStateChange: (msgId, state, meta) => {
      const existing = messageStates.get(msgId) ?? {};
      messageStates.set(msgId, {
        ...existing,
        state,
        hopCount: meta?.hopCount ?? existing.hopCount,
        path: meta?.path ?? existing.path,
      });
      eventBus.emit('message-state', { msgId, state, ...meta });

      if (state === MSG_STATE.DELIVERED) {
        const msg = meta?.msg;
        if (msg) {
          deliveredMessages.push({
            ...msg,
            hopCount: meta.hopCount,
            path: meta.path,
            deliveredAt: clock.getVirtualMs(),
          });
          eventBus.emit('message-delivered', {
            ...msg,
            hopCount: meta.hopCount,
            path: meta.path,
          });
        }
      }
    },
  });

  // Bubble state
  let bubble = null;
  let mode = 'social';

  // Member behaviour: next action time
  const nextActionAt = new Map();
  const MEMBERS = [NODE_IDS.AARAV, NODE_IDS.MEERA, NODE_IDS.ROHAN, NODE_IDS.SANA];

  function scheduleMemberAction(memberId) {
    const delay = prng.nextInt(8000, 20000); // 8–20 s virtual
    nextActionAt.set(memberId, clock.getVirtualMs() + delay);
  }

  function initMemberSchedules() {
    for (const id of MEMBERS) {
      scheduleMemberAction(id);
    }
  }

  function memberAction(memberId, virtualNow) {
    const node = nodes.get(memberId);
    if (!node?.online || !bubble) return;

    const copy = getCopy(mode);
    const text = copy[prng.nextInt(0, copy.length - 1)];
    const msgId = newMsgId();
    const priority = mode === 'sos' ? PRIORITY.SOS : PRIORITY.TEXT;

    const msg = {
      id: msgId,
      fromId: memberId,
      toId: NODE_IDS.SANA,
      content: text,
      type: 'text',
      priority,
      sentAt: virtualNow,
    };

    messageStates.set(msgId, { state: MSG_STATE.QUEUED });
    relay.send(msg, virtualNow);
    eventBus.emit('new-message', msg);
  }

  /**
   * Main tick — call every animation frame from the React layer.
   * @param {number} realDeltaMs
   */
  function tick(realDeltaMs) {
    const virtualNow = clock.tick(realDeltaMs);
    relay.tick(virtualNow);

    // Drive member behaviour
    for (const memberId of MEMBERS) {
      const nextAt = nextActionAt.get(memberId) ?? 0;
      if (virtualNow >= nextAt) {
        memberAction(memberId, virtualNow);
        scheduleMemberAction(memberId);
      }
    }

    return virtualNow;
  }

  /* ── Public API ── */

  function createBubble({ name, mode: m = 'social', expiry = 3600, autoApprove = true }) {
    bubble = {
      id: `bubble-${prng.nextInt(1000, 9999)}`,
      name,
      mode: m,
      expiry,
      autoApprove,
      pin: String(prng.nextInt(1000, 9999)),
      createdAt: clock.getVirtualMs(),
    };
    mode = m;
    initMemberSchedules();
    eventBus.emit('bubble-created', bubble);
    return bubble;
  }

  function joinBubble(pin) {
    // Simulate join by PIN — always succeed in the demo
    bubble = {
      id: `bubble-joined-${prng.nextInt(1000, 9999)}`,
      name: 'Campus Fest Bubble',
      mode: 'social',
      expiry: 3600,
      pin,
      createdAt: clock.getVirtualMs(),
    };
    mode = 'social';
    initMemberSchedules();
    eventBus.emit('bubble-joined', bubble);
    return bubble;
  }

  function setMode(m) {
    mode = m;
    eventBus.emit('mode-changed', m);
  }

  function setNodeOnline(nodeId, online) {
    const node = nodes.get(nodeId);
    if (!node) return;
    node.online = online;
    eventBus.emit('node-changed', { nodeId, online });
    if (online) relay.nodeOnline(nodeId, clock.getVirtualMs());
  }

  function setRelayEnabled(nodeId, enabled) {
    const node = nodes.get(nodeId);
    if (!node) return;
    node.relayEnabled = enabled;
    eventBus.emit('node-changed', { nodeId, relayEnabled: enabled });
    if (enabled) relay.nodeOnline(nodeId, clock.getVirtualMs()); // drain queues
  }

  function setBattery(nodeId, pct) {
    const node = nodes.get(nodeId);
    if (!node) return;
    node.battery = Math.max(0, Math.min(100, pct));
    eventBus.emit('node-changed', { nodeId, battery: node.battery });
  }

  function sendText(text, priority = PRIORITY.TEXT, toId = 'group') {
    if (!bubble) return null;
    const msgId = newMsgId();
    const msg = {
      id: msgId,
      fromId: NODE_IDS.YOU,
      toId: toId === 'group' ? NODE_IDS.SANA : toId,
      content: text,
      type: 'text',
      priority,
      sentAt: clock.getVirtualMs(),
    };
    messageStates.set(msgId, { state: MSG_STATE.QUEUED });
    relay.send(msg, clock.getVirtualMs());
    eventBus.emit('new-message', msg);
    return msgId;
  }

  function sendSOS(text) {
    return sendText(text, PRIORITY.SOS);
  }

  function triggerIncomingPhoto() {
    const sender = MEMBERS[prng.nextInt(0, MEMBERS.length - 1)];
    const msgId = newMsgId();
    const msg = {
      id: msgId,
      fromId: sender,
      toId: NODE_IDS.YOU,
      content: '[Photo shared]',
      type: 'photo',
      priority: PRIORITY.PHOTO,
      sentAt: clock.getVirtualMs(),
    };
    relay.send(msg, clock.getVirtualMs());
    eventBus.emit('new-message', msg);
    return msgId;
  }

  function triggerIncomingFile() {
    const sender = MEMBERS[prng.nextInt(0, MEMBERS.length - 1)];
    const msgId = newMsgId();
    const msg = {
      id: msgId,
      fromId: sender,
      toId: NODE_IDS.YOU,
      content: '[File shared: project-plan.pdf]',
      type: 'file',
      priority: PRIORITY.FILE,
      sentAt: clock.getVirtualMs(),
    };
    relay.send(msg, clock.getVirtualMs());
    eventBus.emit('new-message', msg);
    return msgId;
  }

  function triggerSOS() {
    const sender = MEMBERS[prng.nextInt(0, MEMBERS.length - 1)];
    const msgId = newMsgId();
    const sosMessages = [
      'HELP — trapped on Level 5, smoke in the corridor!',
      'SOS — person injured near stairwell B',
      'Emergency! Fire on the 4th floor, need evacuation help',
    ];
    const msg = {
      id: msgId,
      fromId: sender,
      toId: NODE_IDS.YOU,
      content: sosMessages[prng.nextInt(0, sosMessages.length - 1)],
      type: 'text',
      priority: PRIORITY.SOS,
      sentAt: clock.getVirtualMs(),
    };
    relay.send(msg, clock.getVirtualMs());
    eventBus.emit('new-message', msg);
    eventBus.emit('sos-alert', msg);
    return msgId;
  }

  function setSpeed(key) { clock.setSpeed(key); }
  function getSpeed() { return clock.getSpeed(); }
  function getVirtualMs() { return clock.getVirtualMs(); }

  function getNodes() { return nodes; }
  function getBubble() { return bubble; }
  function getMode() { return mode; }

  function getMessageState(msgId) { return messageStates.get(msgId); }

  function resetDemo() {
    relay.reset();
    messageStates.clear();
    deliveredMessages.length = 0;
    _msgCounter = 1;
    bubble = null;
    // Reset nodes
    for (const n of INITIAL_NODES) {
      nodes.set(n.id, { ...n });
    }
    clock.reset();
    nextActionAt.clear();
    eventBus.emit('demo-reset', {});
  }

  return {
    tick,
    createBubble,
    joinBubble,
    setMode,
    setNodeOnline,
    setRelayEnabled,
    setBattery,
    sendText,
    sendSOS,
    triggerIncomingPhoto,
    triggerIncomingFile,
    triggerSOS,
    setSpeed,
    getSpeed,
    getVirtualMs,
    getNodes,
    getBubble,
    getMode,
    getMessageState,
    resetDemo,
    eventBus,
  };
}

/** Singleton simulator instance */
export const simulator = createSimulator(DEFAULT_SEED);
