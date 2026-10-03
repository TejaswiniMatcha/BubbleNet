/**
 * src/sim/relay.js
 * Relay engine — controlled flooding with priority queues.
 * No React imports. No Date.now(). No Math.random().
 */

import { BATTERY_LOW_THRESHOLD, buildAdjacency, TOPOLOGY_EDGES } from './nodes.js';
import { eventBus } from './eventBus.js';

/** Message priority levels */
export const PRIORITY = { SOS: 0, TEXT: 1, PHOTO: 2, FILE: 3 };

/** Default TTL values */
export const DEFAULT_TTL = 8;
export const SOS_TTL     = 16;

/** Per-hop virtual latency range (ms) */
export const HOP_LATENCY_MIN = 250;
export const HOP_LATENCY_MAX = 600;

/** Message delivery states */
export const MSG_STATE = {
  QUEUED:    'queued',
  SENT:      'sent',
  RELAYED:   'relayed',
  DELIVERED: 'delivered',
  FAILED:    'failed',
};

/**
 * Create the relay engine.
 * @param {Object} opts
 * @param {Function} opts.getNodes  - () => Map<id, nodeState>
 * @param {Function} opts.prng      - PRNG instance with nextInt(min,max)
 * @param {Function} opts.onStateChange - (msgId, state, meta) => void
 */
export function createRelayEngine({ getNodes, prng, onStateChange }) {
  const adjacency = buildAdjacency(TOPOLOGY_EDGES);

  /**
   * In-flight packets: Map<msgId, {
   *   msg, hops: [{fromId, toId, scheduledAt, hop, ttl, path}], seen: Set<nodeId>,
   *   delivered: boolean, hopCount: number, path: string[]
   * }>
   */
  const inflight = new Map();

  /**
   * Store-and-forward queues: Map<nodeId, [{msg, prevHop, ttl, hopCount, path}]>
   */
  const storeQueue = new Map();

  /**
   * Attempt to forward a packet from fromId to its eligible neighbors.
   * Schedules hops relative to arrivalTime.
   */
  function forwardFrom(fromId, msg, prevHop, ttl, hopCount, path, arrivalTime) {
    if (ttl <= 0) return 0;
    const nodes    = getNodes();
    const fromNode = nodes.get(fromId);
    if (!fromNode?.online) return 0;

    const neighbors = adjacency.get(fromId) ?? [];
    let scheduled   = 0;

    // Ensure istate exists
    if (!inflight.has(msg.id)) {
      inflight.set(msg.id, {
        msg,
        seen: new Set([fromId]),
        delivered: false,
        hopCount: 0,
        path: [fromId],
        hops: [],
      });
    }
    const istate = inflight.get(msg.id);

    for (const toId of neighbors) {
      if (toId === prevHop)       continue; // no back-prop
      if (istate.seen.has(toId)) continue;  // duplicate suppression

      const toNode = nodes.get(toId);
      if (!toNode) continue;

      // If toNode is offline → store-and-forward
      if (!toNode.online) {
        enqueueStored(toId, msg, fromId, ttl - 1, hopCount + 1, [...path, toId]);
        continue;
      }

      // Battery guard for relay nodes (not the originator)
      if (fromId !== msg.fromId) {
        if (fromNode.battery < BATTERY_LOW_THRESHOLD && !fromNode.charging) {
          if (msg.priority !== PRIORITY.SOS) {
            enqueueStored(toId, msg, fromId, ttl - 1, hopCount + 1, [...path, toId]);
            continue;
          }
        }
        if (!fromNode.relayEnabled && msg.priority !== PRIORITY.SOS) {
          enqueueStored(toId, msg, fromId, ttl - 1, hopCount + 1, [...path, toId]);
          continue;
        }
      }

      const latency    = prng.nextInt(HOP_LATENCY_MIN, HOP_LATENCY_MAX);
      const deliverAt  = arrivalTime + latency;

      istate.seen.add(toId);
      istate.hops.push({
        fromId,
        toId,
        scheduledAt: deliverAt,
        hop:  hopCount + 1,
        ttl:  ttl - 1,
        path: [...path, toId],
      });

      scheduled++;
    }
    return scheduled;
  }

  function enqueueStored(nodeId, msg, prevHop, ttl, hopCount, path) {
    if (!storeQueue.has(nodeId)) storeQueue.set(nodeId, []);
    const queue = storeQueue.get(nodeId);
    if (!queue.find((q) => q.msg.id === msg.id)) {
      queue.push({ msg, prevHop, ttl, hopCount, path });
      queue.sort((a, b) => a.msg.priority - b.msg.priority);
    }
  }

  /**
   * Send a message from the originator.
   */
  function send(msg, virtualNow) {
    const ttl = msg.priority === PRIORITY.SOS ? SOS_TTL : DEFAULT_TTL;
    inflight.set(msg.id, {
      msg,
      seen:      new Set([msg.fromId]),
      delivered: false,
      hopCount:  0,
      path:      [msg.fromId],
      hops:      [],
    });
    onStateChange(msg.id, MSG_STATE.QUEUED, { msg });
    forwardFrom(msg.fromId, msg, null, ttl, 0, [msg.fromId], virtualNow);
    const istate = inflight.get(msg.id);
    if (istate?.hops?.length > 0) {
      onStateChange(msg.id, MSG_STATE.SENT, { msg });
    }
  }

  /**
   * Process all in-flight hops due by virtualNow.
   * Newly scheduled downstream hops are appended and immediately checked
   * in the same tick pass if their scheduledAt <= virtualNow.
   */
  function tick(virtualNow) {
    const nodes = getNodes();

    for (const [msgId, istate] of inflight) {
      if (istate.delivered) continue;

      // Keep looping until no more due hops remain (handles cascading same-tick hops)
      let safety = 0;
      while (safety++ < 200) {
        const dueIdx = istate.hops.findIndex((h) => h.scheduledAt <= virtualNow);
        if (dueIdx === -1) break;

        // Remove and process the due hop
        const [hop] = istate.hops.splice(dueIdx, 1);

        if (istate.delivered) continue;

        const toNode = nodes.get(hop.toId);
        if (!toNode?.online) {
          enqueueStored(hop.toId, istate.msg, hop.fromId, hop.ttl, hop.hop, hop.path);
          continue;
        }

        // Emit animation event
        eventBus.emit('packet-hop', {
          msgId,
          fromId:   hop.fromId,
          toId:     hop.toId,
          hop:      hop.hop,
          priority: istate.msg.priority,
        });

        if (hop.toId === istate.msg.toId) {
          // Delivered!
          istate.delivered = true;
          istate.hopCount  = hop.hop;
          istate.path      = hop.path;
          onStateChange(msgId, MSG_STATE.DELIVERED, {
            msg:      istate.msg,
            hopCount: hop.hop,
            path:     hop.path,
          });
        } else {
          // Relay forward — pass hop's scheduledAt as the arrival time so
          // sub-hops are scheduled relative to when this hop arrived, not FAR_FUTURE
          onStateChange(msgId, MSG_STATE.RELAYED, { msg: istate.msg, hop: hop.hop });
          forwardFrom(
            hop.toId, istate.msg, hop.fromId,
            hop.ttl, hop.hop, hop.path,
            hop.scheduledAt,   // ← use arrival time, not virtualNow
          );
        }
      }
    }

    // Drain store-and-forward queues for online nodes
    for (const [nodeId, queue] of storeQueue) {
      const node = nodes.get(nodeId);
      if (!node?.online || queue.length === 0) continue;

      const toProcess = [...queue];
      storeQueue.set(nodeId, []);

      for (const { msg, prevHop, ttl, hopCount, path } of toProcess) {
        const ist = inflight.get(msg.id);
        if (ist?.delivered) continue;
        // Use virtualNow as arrival for store-and-forward resumed packets
        forwardFrom(nodeId, msg, prevHop, ttl, hopCount, path, virtualNow);
      }
    }
  }

  function nodeOnline(nodeId, virtualNow) {
    tick(virtualNow);
  }

  function getInflight()   { return inflight; }
  function getStoreQueue() { return storeQueue; }

  function reset() {
    inflight.clear();
    storeQueue.clear();
  }

  return { send, tick, nodeOnline, getInflight, getStoreQueue, reset };
}
