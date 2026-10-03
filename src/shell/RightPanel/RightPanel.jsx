/**
 * src/shell/RightPanel/RightPanel.jsx
 * Right panel: Members tab + Mesh Map tab.
 */

import { memo } from 'react';
import clsx from 'clsx';
import { Battery, Wifi, WifiOff } from 'lucide-react';
import styles from './RightPanel.module.css';
import Avatar from '../../components/Avatar/Avatar.jsx';
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx';
import MeshMap from '../../components/MeshMap/MeshMap.jsx';
import { useNodeList } from '../../store/membersStore.js';
import { useRightPanelTab, useUiActions } from '../../store/uiStore.js';
import { BATTERY_WARN_THRESHOLD, BATTERY_LOW_THRESHOLD } from '../../sim/nodes.js';

function batteryColor(pct) {
  if (pct <= BATTERY_LOW_THRESHOLD)  return 'danger';
  if (pct <= BATTERY_WARN_THRESHOLD) return 'warning';
  return 'success';
}

const MemberItem = memo(function MemberItem({ node }) {
  const bColor = batteryColor(node.battery);

  return (
    <div className={styles.memberItem}>
      <Avatar
        name={node.name}
        bg={node.avatarBg}
        color={node.color}
        size="sm"
        battery={node.battery}
        showOnlineDot
        online={node.online}
      />
      <div className={styles.memberInfo}>
        <div className={styles.memberName}>{node.name}</div>
        <div className={styles.memberMeta}>
          <span className={styles.batteryVal}>
            <Battery size={11} />
            <span className="tabular-nums">{node.battery}%</span>
          </span>
          {node.relayEnabled
            ? <Wifi size={11} style={{ color: 'var(--success)' }} />
            : <WifiOff size={11} style={{ color: 'var(--text-muted)' }} />
          }
          {!node.online && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Offline</span>}
        </div>
        <ProgressBar
          value={node.battery}
          size="sm"
          color={bColor}
          aria-label={`${node.name} battery ${node.battery}%`}
        />
      </div>
    </div>
  );
});

export default function RightPanel() {
  const nodes = useNodeList();
  const tab   = useRightPanelTab();
  const { setRightPanelTab } = useUiActions();

  return (
    <aside className={styles.panel} aria-label="Members and mesh panel">
      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {['members', 'mesh'].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={clsx(styles.tab, tab === t && styles.active)}
            onClick={() => setRightPanelTab(t)}
            type="button"
          >
            {t === 'members' ? '👥 Members' : '🌐 Mesh'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className={styles.content}
        role="tabpanel"
        aria-label={tab === 'members' ? 'Members list' : 'Mesh map'}
      >
        {tab === 'members' && (
          <>
            {nodes.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: 32 }}>
                No members yet
              </p>
            )}
            {nodes.map((n) => <MemberItem key={n.id} node={n} />)}
          </>
        )}
        {tab === 'mesh' && (
          <div className={styles.meshWrap}>
            <MeshMap compact />
          </div>
        )}
      </div>
    </aside>
  );
}
