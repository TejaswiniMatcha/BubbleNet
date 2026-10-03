/**
 * src/shell/Sidebar/Sidebar.jsx
 * Left sidebar: logo, navigation, active bubble card.
 */

import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Home, MessageCircle, Image, FolderOpen, StickyNote,
  BarChart2, MapPin, Network, Info, Wifi,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import Avatar from '../../components/Avatar/Avatar.jsx';
import Chip from '../../components/Chip/Chip.jsx';
import useBubbleStore, { useBubble, useMode } from '../../store/bubbleStore.js';
import { useNodeList } from '../../store/membersStore.js';
import { useUiActions } from '../../store/uiStore.js';
import { simulator } from '../../sim/simulator.js';

const NAV_ITEMS = [
  { label: 'Home',          icon: Home,            path: '/',                    requiresBubble: false },
  { label: 'Messages',      icon: MessageCircle,   path: '/bubble/messages',     requiresBubble: true  },
  { label: 'Album',         icon: Image,           path: '/bubble/album',        requiresBubble: true  },
  { label: 'Files',         icon: FolderOpen,      path: '/bubble/files',        requiresBubble: true  },
  { label: 'Notes',         icon: StickyNote,      path: '/bubble/notes',        requiresBubble: true  },
  { label: 'Polls',         icon: BarChart2,       path: '/bubble/polls',        requiresBubble: true  },
  { label: 'Location',      icon: MapPin,          path: '/bubble/location',     requiresBubble: true  },
  { label: 'Mesh Network',  icon: Network,         path: '/mesh',                requiresBubble: true  },
  { label: 'Relay Settings',icon: Wifi,            path: '/relay-settings',      requiresBubble: true  },
  { label: 'About',         icon: Info,            path: '/about',               requiresBubble: false },
];

function formatCountdown(ms) {
  if (ms <= 0) return '0:00';
  const s   = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  const h   = Math.floor(min / 60);
  const m   = min % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function Sidebar() {
  const bubble  = useBubble();
  const mode    = useMode();
  const nodes   = useNodeList();
  const { addToast } = useUiActions();
  const navigate = useNavigate();
  const expiresAt = useBubbleStore((s) => s.expiresAt);

  const [remaining, setRemaining] = useState(null);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) { setRemaining(null); return; }
    
    let notified5 = false;
    let notified1 = false;
    
    function update() {
      const left = expiresAt - Date.now();
      setRemaining(Math.max(0, left));
      
      if (left > 0 && left <= 5 * 60 * 1000 && !notified5) {
        addToast({ message: 'Bubble expires in 5 minutes.', type: 'warning' });
        notified5 = true;
      }
      if (left > 0 && left <= 60 * 1000 && !notified1) {
        addToast({ message: 'Bubble expires in 1 minute.', type: 'danger' });
        notified1 = true;
      }
      
      if (left <= 0) {
        useBubbleStore.getState().clearBubble();
        simulator.resetDemo();
        navigate('/expired');
      }
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt, navigate, addToast]);

  function handleDisabledClick() {
    addToast({ message: 'Create or join a bubble first.', type: 'info' });
  }

  const modeLabel = { social: 'Social', collab: 'Collaboration', sos: 'Emergency' }[mode] ?? 'Social';
  const modeVariant = { social: 'primary', collab: 'success', sos: 'danger' }[mode] ?? 'primary';

  const members = nodes.filter((n) => n.id !== 'you').slice(0, 4);

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      {/* Logo */}
      <div className={styles.logoArea}>
        <div className={styles.logoMark} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" fill="white" opacity=".9"/>
            <circle cx="9" cy="9" r="4" fill="white"/>
            <circle cx="5" cy="6" r="2" fill="white" opacity=".6"/>
            <circle cx="13" cy="6" r="2" fill="white" opacity=".6"/>
          </svg>
        </div>
        <span className={styles.logoText}>BubbleNet</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav} aria-label="Application navigation">
        {NAV_ITEMS.map((item) => {
          const disabled = item.requiresBubble && !bubble;
          const Icon     = item.icon;
          if (disabled) {
            return (
              <button
                key={item.path}
                className={clsx(styles.navItem, styles.disabled)}
                onClick={handleDisabledClick}
                aria-disabled="true"
                title="Create or join a bubble to access this"
                type="button"
              >
                <span className={styles.navIcon}><Icon size={18} /></span>
                {item.label}
              </button>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(styles.navItem, isActive && styles.active)
              }
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Active Bubble Card */}
      {bubble && (
        <div className={styles.bubbleCard}>
          <div className={styles.bubbleCardTitle}>
            <span>📡</span>
            <span className="truncate">{bubble.name}</span>
          </div>
          <div className={styles.bubbleCardMeta}>
            <Chip variant={modeVariant} size="xs">{modeLabel}</Chip>
            <span>PIN: <strong className="tabular-nums">{bubble.pin}</strong></span>
          </div>
          {remaining != null && (
            <div className={styles.countdown} aria-label="Time remaining">
              ⏱ {formatCountdown(remaining)}
            </div>
          )}
          {/* Member avatars */}
          <div className={styles.avatarRow}>
            {members.map((n) => (
              <Avatar
                key={n.id}
                name={n.name}
                bg={n.avatarBg}
                color={n.color}
                size="xs"
                showOnlineDot
                online={n.online}
              />
            ))}
            {nodes.length > 5 && (
              <Chip variant="default" size="xs">+{nodes.length - 5}</Chip>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
