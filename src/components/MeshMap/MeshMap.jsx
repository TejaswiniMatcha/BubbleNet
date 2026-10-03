/**
 * src/components/MeshMap/MeshMap.jsx
 * SVG mesh map — crisp at 320px and 900px.
 * Driven by the simulator event bus (packet-hop events animate pulses).
 * Nodes are NOT draggable.
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MeshMap.module.css';
import { useNodeList } from '../../store/membersStore.js';
import { simulator } from '../../sim/simulator.js';
import { BATTERY_WARN_THRESHOLD, NODE_IDS, TOPOLOGY_EDGES } from '../../sim/nodes.js';

/* ── Layout helpers ── */
const VIEWBOX_W  = 400;
const VIEWBOX_H  = 180;
const NODE_R     = 22;

// Fixed horizontal positions for the chain: You-Aarav-Meera-Rohan-Sana
const NODE_POSITIONS = {
  [NODE_IDS.YOU]:   { x: 40,  y: 90 },
  [NODE_IDS.AARAV]: { x: 120, y: 90 },
  [NODE_IDS.MEERA]: { x: 200, y: 90 },
  [NODE_IDS.ROHAN]: { x: 280, y: 90 },
  [NODE_IDS.SANA]:  { x: 360, y: 90 },
};

const PRIORITY_COLORS = { 0: '#DC2626', 1: '#0284C7', 2: '#7C3AED', 3: '#059669' };

function batteryColor(pct) {
  if (pct <= 20)  return '#DC2626';
  if (pct <= BATTERY_WARN_THRESHOLD) return '#F59E0B';
  return '#16A34A';
}

/* ── Pulse dot animation ── */
function PulseDot({ fromId, toId, color, id }) {
  const from = NODE_POSITIONS[fromId];
  const to   = NODE_POSITIONS[toId];
  if (!from || !to) return null;

  return (
    <motion.circle
      key={id}
      cx={from.x}
      cy={from.y}
      r={5}
      fill={color}
      opacity={0.85}
      initial={{ cx: from.x, cy: from.y, opacity: 0.9 }}
      animate={{ cx: to.x,   cy: to.y,   opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    />
  );
}

/* ── Node renderer ── */
function MeshNode({ node, compact }) {
  const pos      = NODE_POSITIONS[node.id];
  if (!pos) return null;
  const isLow    = node.battery <= BATTERY_WARN_THRESHOLD;
  const isOffline= !node.online;
  const bColor   = batteryColor(node.battery);
  const r        = NODE_R;
  const circumf  = 2 * Math.PI * (r - 3);
  const dashOff  = circumf * (1 - node.battery / 100);

  return (
    <g>
      {/* Battery ring track */}
      <circle
        cx={pos.x} cy={pos.y} r={r - 3}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={2.5}
      />
      {/* Battery ring fill */}
      {!isOffline && (
        <circle
          cx={pos.x} cy={pos.y} r={r - 3}
          fill="none"
          stroke={bColor}
          strokeWidth={2.5}
          strokeDasharray={circumf}
          strokeDashoffset={dashOff}
          strokeLinecap="round"
          transform={`rotate(-90 ${pos.x} ${pos.y})`}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      )}
      {/* Avatar circle */}
      <circle
        cx={pos.x} cy={pos.y} r={r - 6}
        fill={isOffline ? '#F1F5F9' : node.avatarBg}
        stroke="none"
      />
      {/* Initials */}
      <text
        x={pos.x} y={pos.y}
        className={styles.nodeLabel}
        style={{
          dominantBaseline: 'middle',
          fill: isOffline ? '#94A3B8' : node.color,
          fontSize: compact ? 9 : 11,
          fontWeight: 700,
          textAnchor: 'middle',
        }}
      >
        {node.name.slice(0, 2).toUpperCase()}
      </text>

      {/* Low battery shield */}
      {isLow && !isOffline && (
        <text
          x={pos.x + r - 6}
          y={pos.y - r + 6}
          style={{ fontSize: 9, textAnchor: 'middle', dominantBaseline: 'middle' }}
        >
          🛡️
        </text>
      )}

      {/* Name label */}
      <text
        x={pos.x}
        y={pos.y + r + 12}
        className={styles.nodeLabel}
        style={{
          fill: isOffline ? '#94A3B8' : '#0F172A',
          fontSize: compact ? 9 : 11,
        }}
      >
        {node.name}
      </text>

      {/* Hop label (not for You) */}
      {node.id !== NODE_IDS.YOU && (
        <text
          x={pos.x}
          y={pos.y + r + 24}
          className={styles.hopLabel}
          style={{ fontSize: compact ? 8 : 10 }}
        >
          {node.hopIndex} hop{node.hopIndex !== 1 ? 's' : ''}
        </text>
      )}
    </g>
  );
}

/* ── Main component ── */
export default function MeshMap({ compact = false }) {
  const nodes = useNodeList();
  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  const [pulses, setPulses] = useState([]); // [{id, fromId, toId, color}]
  const pulseIdRef = useRef(0);

  const addPulse = useCallback(({ fromId, toId, priority }) => {
    const id    = `pulse-${pulseIdRef.current++}`;
    const color = PRIORITY_COLORS[priority ?? 1] ?? '#0284C7';
    setPulses((prev) => [...prev.slice(-8), { id, fromId, toId, color }]);
    // Clean up after animation
    setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  }, []);

  useEffect(() => {
    const unsub = simulator.eventBus.on('packet-hop', addPulse);
    return unsub;
  }, [addPulse]);

  return (
    <div className={styles.root}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        aria-label="Mesh network topology"
        role="img"
        style={{ width: '100%', maxWidth: 900 }}
      >
        {/* ── Links ── */}
        {TOPOLOGY_EDGES.map(([aId, bId]) => {
          const a       = NODE_POSITIONS[aId];
          const b       = NODE_POSITIONS[bId];
          const nodeA   = nodeMap.get(aId);
          const nodeB   = nodeMap.get(bId);
          const offline = !nodeA?.online || !nodeB?.online;
          return (
            <line
              key={`${aId}-${bId}`}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              className={offline ? styles.linkOffline : styles.link}
            />
          );
        })}

        {/* ── Pulse dots ── */}
        <AnimatePresence>
          {pulses.map((p) => (
            <PulseDot key={p.id} {...p} />
          ))}
        </AnimatePresence>

        {/* ── Nodes ── */}
        {nodes.map((n) => (
          <MeshNode key={n.id} node={n} compact={compact} />
        ))}
      </svg>
    </div>
  );
}
