/**
 * src/shell/TopBar/TopBar.jsx
 * Top status bar: bubble info, mode switcher, pills, demo controls.
 */

import clsx from 'clsx';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Users, Signal, Search, MessageCircle, Image as ImageIcon, FolderOpen, StickyNote, BarChart2, MapPin, Home } from 'lucide-react';
import styles from './TopBar.module.css';
import Chip from '../../components/Chip/Chip.jsx';
import { useBubble, useMode, useBubbleActions } from '../../store/bubbleStore.js';
import { useNodeList } from '../../store/membersStore.js';
import { simulator } from '../../sim/simulator.js';

const MODE_OPTIONS = [
  { key: 'social', label: '😊 Social' },
  { key: 'collab', label: '🤝 Collaborate' },
  { key: 'sos',    label: '🆘 SOS' },
];

const NAV_ITEMS = [
  { label: 'Messages', icon: MessageCircle, path: '/bubble/messages' },
  { label: 'Album',    icon: ImageIcon,     path: '/bubble/album'    },
  { label: 'Files',    icon: FolderOpen,    path: '/bubble/files'    },
  { label: 'Notes',    icon: StickyNote,    path: '/bubble/notes'    },
  { label: 'Polls',    icon: BarChart2,     path: '/bubble/polls'    },
  { label: 'Location', icon: MapPin,        path: '/bubble/location' },
];

export default function TopBar() {
  const bubble     = useBubble();
  const mode       = useMode();
  const nodes      = useNodeList();
  const { setMode } = useBubbleActions();
  const navigate   = useNavigate();
  const location   = useLocation();

  const onlineCount = nodes.filter((n) => n.online).length;

  function handleModeChange(m) {
    setMode(m);
    simulator.setMode(m);
    // Swap mode class on #app-shell
    const shell = document.getElementById('app-shell');
    if (shell) {
      shell.classList.remove('mode-social', 'mode-collab', 'mode-sos');
      shell.classList.add(`mode-${m}`);
    }
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.topRow}>
        {/* Left: Logo + Bubble info */}
      <div className={styles.leftSection}>
        {!bubble && (
          <div className={styles.logo}>
            <div className={styles.logoMark} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>BubbleNet</span>
          </div>
        )}
        
        <div className={styles.bubbleInfo}>
          {bubble ? (
            <>
              <button className={styles.homeBtn} onClick={() => navigate('/')} title="Back to Dashboard">
                <Home size={18} />
              </button>
              <span className={styles.bubbleName}>{bubble.name}</span>
              <Chip variant="primary" size="xs" dot>Live</Chip>
            </>
          ) : (
            <div className={styles.searchBar}>
              <Search size={16} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>No active bubble</span>
            </div>
          )}
        </div>
      </div>

      {/* Mode switcher */}
      <div className={styles.modeSwitch} role="group" aria-label="Mode switcher">
        {MODE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            className={clsx(styles.modeSeg, styles[key], mode === key && styles.active)}
            onClick={() => handleModeChange(key)}
            aria-pressed={mode === key}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right pills */}
      <div className={styles.pills}>
        {/* Simulated radios badge */}
        <Chip variant="default" size="xs" icon={<Signal size={11} />}>Simulated&nbsp;radios</Chip>

        {/* Nodes count */}
        <Chip variant="default" size="xs" icon={<Users size={11} />}>
          <span className="tabular-nums">{onlineCount}</span>&nbsp;Nodes
        </Chip>

        {/* Encryption */}
        <Chip variant="success" size="xs" icon={<Lock size={11} />}>E2E</Chip>
      </div>
      </div>

      {/* Navigation Row */}
      {bubble && location.pathname.startsWith('/bubble') && (
        <nav className={styles.navRow} aria-label="Bubble navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(styles.navItem, isActive && styles.active)
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}

    </header>
  );
}
