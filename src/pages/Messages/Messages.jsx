import { useRef, useEffect, memo, useState } from 'react';
import {
  Send, Clock, Check, CheckCheck, Smile, Paperclip,
  Image as ImageIcon, File, BarChart2, MapPin,
  MessageCircle, Users, ChevronDown,
  Plus, Search, MoreHorizontal, Edit2, Lock, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Messages.module.css';
import Avatar from '../../components/Avatar/Avatar.jsx';
import { useMessageStates } from '../../store/messagesStore.js';
import { useNodeList } from '../../store/membersStore.js';
import { useBubble } from '../../store/bubbleStore.js';
import { simulator } from '../../sim/simulator.js';
import { NODE_IDS, INITIAL_NODES } from '../../sim/nodes.js';
import { PRIORITY, MSG_STATE } from '../../sim/relay.js';
import { useUiActions } from '../../store/uiStore.js';
import { useNavigate } from 'react-router-dom';

const EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '😢', '👀', '✨', '💯', '🙏', '🙌', '🤔'];

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(ms) {
  const d = new Date(ms);
  return d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
}

// Seeded fake messages for demo
const FAKE_CONV = {
  group: [
    { id: 'f1', fromId: NODE_IDS.MEERA, content: "Hey everyone! Are we still meeting at the campus node?", sentAt: Date.now() - 10 * 60000 },
    { id: 'f2', fromId: NODE_IDS.YOU, content: "Yes! I'll be there in 10 mins.", sentAt: Date.now() - 8 * 60000 },
    { id: 'f3', fromId: NODE_IDS.ROHAN, content: "Great! I'm on my way too.", sentAt: Date.now() - 7 * 60000 },
    { id: 'f4', fromId: NODE_IDS.SANA, content: "Can someone share the latest QR code for the bubble?", sentAt: Date.now() - 5 * 60000 },
    { id: 'f5', fromId: NODE_IDS.YOU, content: "Here you go! QR_Code.png", sentAt: Date.now() - 4 * 60000 },
    { id: 'f6', fromId: NODE_IDS.AARAV, content: "Got it! Thanks!", sentAt: Date.now() - 2 * 60000 },
  ],
  'aarav': [{ id: 'fa1', fromId: 'aarav', content: "Let's meet at the node!", sentAt: Date.now() - 60000 }],
  'meera': [{ id: 'fm1', fromId: 'meera', content: "Okay! I'll be there soon.", sentAt: Date.now() - 90000 }],
  'rohan': [{ id: 'fr1', fromId: 'rohan', content: "Let's meet at the node!", sentAt: Date.now() - 180000 }],
  'sana':  [{ id: 'fs1', fromId: 'sana',  content: "Sounds good 👌", sentAt: Date.now() - 86400000 }],
};

const CONV_PREVIEWS = {
  group:          { preview: 'All members', time: '12:42 PM', unread: 5 },
  [NODE_IDS.AARAV]: { preview: 'No messages yet', time: '12:41 PM' },
  [NODE_IDS.MEERA]: { preview: "Okay! I'll be there soon.", time: '11:23 AM', statusCheck: true },
  [NODE_IDS.ROHAN]: { preview: "Let's meet at the node!", time: '10:05 AM', statusCheck: true },
  [NODE_IDS.SANA]:  { preview: 'Sounds good 👌', time: 'Yesterday' },
};

const DeliveryStatus = memo(({ state }) => {
  if (state === MSG_STATE.QUEUED)    return <Clock size={12} className={clsx(styles.statusIcon, styles.statusQueued)} />;
  if (state === MSG_STATE.SENT)      return <Check size={12} className={clsx(styles.statusIcon, styles.statusSent)} />;
  if (state === MSG_STATE.RELAYED)   return <CheckCheck size={12} className={clsx(styles.statusIcon, styles.statusSent)} />;
  if (state === MSG_STATE.DELIVERED) return <CheckCheck size={12} className={clsx(styles.statusIcon, styles.statusDelivered)} />;
  return null;
});

const MessageItem = memo(function MessageItem({ msg, isOwn, node, msgState }) {
  const st = msgState?.state ?? MSG_STATE.DELIVERED;
  const [showRipple, setShowRipple] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prevStateRef = useRef(st);

  useEffect(() => {
    if (prevStateRef.current === MSG_STATE.QUEUED && st === MSG_STATE.DELIVERED) {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
    }
    prevStateRef.current = st;
  }, [st]);

  if (msg.type === 'system') {
    return <div className={styles.sysMsg}>{msg.content}</div>;
  }

  return (
    <div className={clsx(styles.msgRow, isOwn && styles.ownRow)}>
      {!isOwn && (
        <Avatar name={node?.name ?? '?'} bg={node?.avatarBg ?? '#E0F2FE'} color={node?.color ?? '#0284C7'} size="sm" />
      )}
      <div className={styles.bubbleWrap}>
        {!isOwn && <div className={styles.senderName}>{node?.name ?? 'Unknown'}</div>}
        <div
          className={clsx(styles.bubble, isOwn && styles.ownBubble, showRipple && styles.rippleEffect)}
          onContextMenu={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
        >
          <div className={styles.msgText}>{msg.content}</div>
          <div className={styles.msgMeta}>
            <span className={styles.time}>{formatTime(msg.sentAt)}</span>
            {isOwn && <DeliveryStatus state={st} />}
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={styles.popover}
              style={{ [isOwn ? 'right' : 'left']: 0, top: '100%', marginTop: 4, width: 200, zIndex: 50 }}
            >
              <button className={styles.popoverBtn} onClick={() => { navigator.clipboard?.writeText(msg.content); setMenuOpen(false); }}>Copy Text</button>
              <button className={styles.popoverBtn} onClick={() => setMenuOpen(false)}>Message Details</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Auto-reply pool for simulated member responses
const AUTO_REPLIES = [
  { from: 'aarav', texts: ['Got it! 👍', 'On my way!', 'Sure, see you there!', 'Sounds good!'] },
  { from: 'meera', texts: ['Perfect 🎉', 'I\'ll be there in 5!', 'Noted!', 'Yes, agreed!'] },
  { from: 'rohan', texts: ['Cool cool 😎', 'Makes sense.', 'Let\'s go!', 'Roger that!'] },
  { from: 'sana',  texts: ['Awesome 🙌', 'On it!', 'Thanks for the update!', 'Got it!'] },
];

export default function Messages() {
  const bubble   = useBubble();
  const navigate = useNavigate();
  const { addToast } = useUiActions();
  const msgStates = useMessageStates();
  const nodes = useNodeList();

  const [activeNav, setActiveNav] = useState('chat');
  const [activeConv, setActiveConv] = useState('group');
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  // Local per-conversation message lists, seeded with FAKE_CONV
  const [convMessages, setConvMessages] = useState(() => {
    const init = {};
    Object.entries(FAKE_CONV).forEach(([k, v]) => { init[k] = [...v]; });
    return init;
  });

  const listRef = useRef(null);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const others = nodes.filter(n => n.id !== NODE_IDS.YOU);

  useEffect(() => {
    if (!bubble) { addToast({ message: 'Create or join a bubble first.', type: 'info' }); navigate('/'); }
  }, [bubble, navigate, addToast]);

  // Listen directly to simulator for incoming member messages
  useEffect(() => {
    const unsub = simulator.eventBus.on('new-message', (msg) => {
      if (msg.fromId === NODE_IDS.YOU) return; // already added optimistically
      setConvMessages(prev => {
        const convKey = 'group';
        const existing = prev[convKey] ?? [];
        if (existing.find(m => m.id === msg.id)) return prev;
        return { ...prev, [convKey]: [...existing, msg] };
      });
    });
    return () => unsub();
  }, []);

  const messages = convMessages[activeConv] ?? [];

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, activeConv]);

  function addReply(delay = 1500) {
    const pool = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const replyText = pool.texts[Math.floor(Math.random() * pool.texts.length)];
    setTimeout(() => {
      const reply = {
        id: `reply-${Date.now()}`,
        fromId: pool.from,
        toId: NODE_IDS.SANA,
        content: replyText,
        type: 'text',
        sentAt: Date.now(),
      };
      setConvMessages(prev => ({
        ...prev,
        group: [...(prev.group ?? []), reply],
      }));
    }, delay + Math.random() * 1000);
  }

  function handleSend(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    if (text.length > 10000) { addToast({ message: 'Message too long.', type: 'danger' }); return; }

    const newMsg = {
      id: `sent-${Date.now()}`,
      fromId: NODE_IDS.YOU,
      toId: activeConv === 'group' ? NODE_IDS.SANA : activeConv,
      content: text.trim(),
      type: 'text',
      priority: PRIORITY.TEXT,
      sentAt: Date.now(),
    };

    // Optimistic — add to UI immediately
    setConvMessages(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] ?? []), newMsg],
    }));

    // Push through simulator for relay/delivery states
    simulator.sendText(text.trim(), PRIORITY.TEXT, activeConv === 'group' ? NODE_IDS.SANA : activeConv);

    // Trigger a simulated reply for group chats
    if (activeConv === 'group') addReply(1200);

    setText('');
    setEmojiOpen(false);
    setAttachOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (!bubble) return null;

  const activeNode = activeConv === 'group' ? null : nodeMap.get(activeConv);
  const onlineCount = others.filter(n => n.online).length;

  const navItems = [
    { key: 'chat',    icon: <MessageCircle size={20}/>, label: 'Chat' },
    { key: 'members', icon: <Users size={20}/>,         label: 'Members' },
  ];

  return (
    <div className={styles.page}>

      {/* ── NAV RAIL ── */}
      <div className={styles.navRail}>
        {navItems.map(item => (
          <button
            key={item.key}
            className={clsx(styles.navItem, activeNav === item.key && styles.navItemActive)}
            onClick={() => {
              setActiveNav(item.key);
              // Toggle members panel when Members nav is clicked
              if (item.key === 'members') setShowMembers(prev => !prev);
              else setShowMembers(false);
            }}
          >
            {item.icon}
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONVERSATION LIST ── */}
      <div className={styles.convPanel}>
        <div className={styles.convPanelHeader}>
          <button className={styles.friendsDropdown}>
            friends <ChevronDown size={14}/>
          </button>
          <button className={styles.newChatBtn}><Plus size={16}/></button>
        </div>

        <div className={styles.searchWrap}>
          <div className={styles.searchIconWrap}>
            <Search size={14} className={styles.searchIcon}/>
            <input
              className={styles.searchInput}
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.convList}>
          {/* Group conversation */}
          {['group', ...others.map(n => n.id)]
            .filter(id => {
              const name = id === 'group' ? 'Group Bubble' : (nodeMap.get(id)?.name ?? '');
              return !search || name.toLowerCase().includes(search.toLowerCase());
            })
            .map(id => {
              const isGroup = id === 'group';
              const n = isGroup ? null : nodeMap.get(id);
              const p = CONV_PREVIEWS[id] ?? {};
              const isActive = activeConv === id;
              return (
                <button
                  key={id}
                  className={clsx(styles.convItem, isActive && styles.convActive)}
                  onClick={() => setActiveConv(id)}
                >
                  {isActive && <div className={styles.convActiveBar}/>}
                  {isGroup
                    ? <Avatar name="G" bg="#DBEAFE" color="#2563EB" size="md"/>
                    : <Avatar name={n?.name ?? '?'} bg={n?.avatarBg} color={n?.color} size="md" showOnlineDot online={n?.online}/>
                  }
                  <div className={styles.convMeta}>
                    <div className={styles.convNameRow}>
                      <span className={styles.convName}>{isGroup ? 'Group Bubble' : n?.name}</span>
                      <span className={styles.convTime}>{p.time}</span>
                    </div>
                    {!isGroup && (
                      <div className={styles.convStatus}>{n?.online ? 'Online' : 'Offline'}</div>
                    )}
                    <div className={styles.convPreview}>
                      {p.statusCheck && <CheckCheck size={11} color="#22C55E"/>}
                      {p.preview}
                      {p.unread && <div className={styles.unreadBadge} style={{marginLeft: 'auto'}}>{p.unread}</div>}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className={styles.mainArea}>
        {/* Chat header */}
        <div className={styles.chatHeader}>
          <Avatar
            name={activeConv === 'group' ? 'G' : (activeNode?.name ?? '?')}
            bg={activeConv === 'group' ? '#DBEAFE' : activeNode?.avatarBg}
            color={activeConv === 'group' ? '#2563EB' : activeNode?.color}
            size="md"
          />
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatName}>
              {activeConv === 'group' ? 'Group Bubble' : activeNode?.name}
            </div>
            <div className={styles.chatSub}>
              <span>{others.length + 1} members</span>
              <span>•</span>
              <span className={styles.onlineDot}/>
              <span>Online: {onlineCount}</span>
            </div>
          </div>
          <div className={styles.chatActions}>

            <button
              className={clsx(styles.chatActionBtn, showMembers && styles.chatActionActive)}
              onClick={() => setShowMembers(prev => !prev)}
              title="Toggle members panel"
            >
              <Users size={18}/>
            </button>
            <button className={styles.chatActionBtn}><MoreHorizontal size={18}/></button>
          </div>
        </div>

        {/* Message list */}
        <div className={styles.list} ref={listRef}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💬</div>
              <p>No messages yet. Say hello!</p>
            </div>
          )}

          {(() => {
            let lastDate = '';
            const elements = [];
            messages.forEach(msg => {
              const dateStr = new Date(msg.sentAt).toLocaleDateString();
              if (dateStr !== lastDate) {
                const label = dateStr === new Date().toLocaleDateString()
                  ? `Today, ${formatTime(msg.sentAt)}`
                  : dateStr;
                elements.push(
                  <div key={`date-${dateStr}`} className={styles.daySep}>
                    <div className={styles.dayPill}>{label}</div>
                  </div>
                );
                lastDate = dateStr;
              }
              elements.push(
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.fromId === NODE_IDS.YOU}
                  node={nodeMap.get(msg.fromId)}
                  msgState={msgStates[msg.id]}
                />
              );
            });
            return elements;
          })()}
        </div>

        {/* Composer */}
        <div className={styles.composer}>
          <AnimatePresence>
            {attachOpen && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className={styles.popover} style={{bottom: 60, left: 16}}>
                <button className={styles.popoverBtn} onClick={() => navigate('/bubble/album')}><ImageIcon size={16} color="#2563EB"/> Photo</button>
                <button className={styles.popoverBtn} onClick={() => navigate('/bubble/files')}><File size={16} color="#7C3AED"/> File</button>
                <button className={styles.popoverBtn} onClick={() => navigate('/bubble/polls')}><BarChart2 size={16} color="#D97706"/> Poll</button>
                <button className={styles.popoverBtn} onClick={() => navigate('/bubble/location')}><MapPin size={16} color="#059669"/> Location</button>
              </motion.div>
            )}
          </AnimatePresence>

          <button className={styles.actionBtn} onClick={() => { setAttachOpen(!attachOpen); setEmojiOpen(false); }}>
            <Paperclip size={20}/>
          </button>

          <div className={styles.inputWrap}>
            <textarea
              className={styles.input}
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div style={{position:'relative'}}>
              <button className={styles.actionBtn} onClick={() => { setEmojiOpen(!emojiOpen); setAttachOpen(false); }}>
                <Smile size={20}/>
              </button>
              <AnimatePresence>
                {emojiOpen && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className={styles.popover} style={{bottom: '100%', right: 0, width: 224, marginBottom: 6}}>
                    <div className={styles.emojiPicker}>
                      {EMOJIS.map(em => (
                        <button key={em} className={styles.emojiBtn} onClick={() => { setText(t => t + em); setEmojiOpen(false); }}>{em}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button className={styles.sendBtn} onClick={handleSend} disabled={!text.trim()}>
            <Send size={18}/>
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL — only visible when showMembers ── */}
      {showMembers && (
        <div className={styles.rightPanel}>
        <div className={styles.rightPanelHeader}>
          <div>
            <div className={styles.rightPanelTitle}>Members</div>
            <div className={styles.memberCountBadge}>{others.length + 1} members</div>
          </div>
          <button className={styles.chatActionBtn}><Search size={16}/></button>
        </div>

        <div className={styles.rightMemberList}>
          {/* Group entry */}
          <div className={clsx(styles.rightMemberItem)}>
            <Avatar name="G" bg="#DBEAFE" color="#2563EB" size="sm"/>
            <div className={styles.rightMemberMeta}>
              <div className={styles.rightMemberName}>Group Bubble</div>
              <div className={styles.rightMemberStatus}>All members</div>
            </div>
            <span className={clsx(styles.roleBadge, styles.roleGroup)}>Group</span>
          </div>

          {others.map(n => (
            <div key={n.id} className={styles.rightMemberItem}>
              <Avatar name={n.name} bg={n.avatarBg} color={n.color} size="sm" showOnlineDot online={n.online}/>
              <div className={styles.rightMemberMeta}>
                <div className={styles.rightMemberName}>{n.name}</div>
                <div className={styles.rightMemberStatus}>{n.online ? 'Online' : 'Offline'}</div>
              </div>
              <span className={clsx(styles.roleBadge, styles.roleMember)}>Member</span>
            </div>
          ))}
        </div>

        {/* Group Details */}
        <div className={styles.groupDetails}>
          <div className={styles.groupDetailsTitle}>
            <Settings size={16} color="#64748B"/> Group Details
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Group Name</div>
            <div className={styles.detailValue}>
              {bubble?.name ?? 'Group Bubble'}
              <button className={styles.detailEdit}><Edit2 size={13}/></button>
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Description</div>
            <div className={styles.detailValue} style={{flexDirection:'column', alignItems:'flex-start', gap:4}}>
              <span style={{color:'#64748B', fontSize:'0.75rem', lineHeight:1.4}}>All members are part of this secure bubble network.</span>
              <button className={styles.detailEdit} style={{alignSelf:'flex-end'}}><Edit2 size={13}/></button>
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Security</div>
            <div className={styles.securityRow}>
              <Lock size={14} color="#64748B"/>
              <span>End-to-end encrypted</span>
              <div className={styles.e2eDot}/>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
