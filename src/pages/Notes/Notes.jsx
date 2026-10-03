import { useState, useRef, useEffect, memo } from 'react';
import { Pin, PinOff, Clock, X, Send, Reply, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Notes.module.css';
import Avatar from '../../components/Avatar/Avatar.jsx';
import IconButton from '../../components/IconButton/IconButton.jsx';
import { useBubble } from '../../store/bubbleStore.js';
import { NODE_IDS } from '../../sim/nodes.js';
import { LWWMap } from '../../utils/lamport.js';

// Seed some initial pinned cards
const INITIAL_PINS = [
  { id: 'p1', author: 'Aarav', content: 'Standup is moved to 10:30 AM.' },
  { id: 'p2', author: 'Meera', content: 'Link to the latest design files is in the Files tab.' }
];

const INITIAL_NOTES_OPS = [
  { key: 'n1', val: { id: 'n1', author: 'Sana', content: 'Has anyone reviewed the PR?', time: Date.now()-60000, replies: [] } },
  { key: 'n2', val: { id: 'n2', author: 'Rohan', content: 'Checklist for today:\n- [x] Fix login bug\n- [ ] Update docs\n\n```javascript\nconsole.log("hello");\n```', time: Date.now()-120000, replies: [] } }
];

function renderMarkdown(text) {
  // Very basic markdown for demo purposes
  let html = text.replace(/```([\s\S]*?)```/g, '<pre style="background:#f1f5f9;padding:8px;border-radius:4px;overflow-x:auto;">$1</pre>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

const NoteItem = memo(function NoteItem({ n, highlightNote, setReplyTo, setEditId, setText, deleteNote }) {
  const [viewMode, setViewMode] = useState('note'); // 'note' or 'code'

  return (
    <div className={clsx(styles.noteItem, highlightNote === n.id && styles.highlight)}>
      <Avatar name={n.author} size="sm" bg={n.author === 'You' ? 'var(--mode-accent)' : '#E2E8F0'} color={n.author === 'You' ? '#fff' : '#475569'} />
      <div className={styles.noteContent}>
        <div className={styles.noteHeader}>
          <span className={styles.authorName}>{n.author}</span>
          <span className={styles.noteTime}>{new Date(n.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: '#F1F5F9', padding: 2, borderRadius: 6 }}>
            <button 
              onClick={() => setViewMode('note')} 
              style={{ fontSize: '0.65rem', padding: '2px 6px', border: 'none', borderRadius: 4, cursor: 'pointer', background: viewMode === 'note' ? '#FFF' : 'transparent', fontWeight: viewMode === 'note' ? 600 : 400, boxShadow: viewMode === 'note' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              Note
            </button>
            <button 
              onClick={() => setViewMode('code')} 
              style={{ fontSize: '0.65rem', padding: '2px 6px', border: 'none', borderRadius: 4, cursor: 'pointer', background: viewMode === 'code' ? '#FFF' : 'transparent', fontWeight: viewMode === 'code' ? 600 : 400, boxShadow: viewMode === 'code' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
            >
              Code
            </button>
          </div>
        </div>
        
        {viewMode === 'note' ? (
          <div className={styles.noteText} dangerouslySetInnerHTML={{ __html: renderMarkdown(n.content) }} />
        ) : (
          <pre className={styles.noteText} style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {n.content}
          </pre>
        )}
        
        <div className={styles.noteActions}>
          <button className={styles.actionBtn} onClick={() => { setReplyTo(n.id); setEditId(null); setText(''); }}><Reply size={12}/> Reply</button>
          {n.author === 'You' && (
            <>
              <button className={styles.actionBtn} onClick={() => { setEditId(n.id); setReplyTo(null); setText(n.content); }}><Edit2 size={12}/> Edit</button>
              <button className={styles.actionBtn} onClick={() => deleteNote(n.id)}><Trash2 size={12}/> Delete</button>
            </>
          )}
        </div>

        {n.replies && n.replies.length > 0 && (
          <div className={styles.replies}>
            {n.replies.map(r => (
              <div key={r.id} style={{display:'flex', gap: 8, marginTop: 8}}>
                <Avatar name={r.author} size="xs" />
                <div>
                  <div style={{fontSize: '0.75rem'}}>
                    <span style={{fontWeight: 600}}>{r.author}</span> <span style={{color: 'var(--text-muted)'}}>{new Date(r.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <div style={{fontSize: '0.875rem'}} dangerouslySetInnerHTML={{ __html: renderMarkdown(r.content) }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default function Notes() {
  const bubble = useBubble();
  
  const [pins, setPins] = useState(INITIAL_PINS);
  
  // Lamport LWW map for notes
  const mapRef = useRef(new LWWMap(NODE_IDS.YOU));
  const [notesRecord, setNotesRecord] = useState({});
  const [history, setHistory] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [presence, setPresence] = useState('');
  const [highlightNote, setHighlightNote] = useState(null);

  // Init LWW map
  useEffect(() => {
    INITIAL_NOTES_OPS.forEach(op => {
      mapRef.current.set(op.key, op.val);
      setHistory(prev => [...prev, { time: Date.now(), user: op.val.author, action: 'Created note' }]);
    });
    setNotesRecord(mapRef.current.exportValues());
  }, []);

  // Simulate remote presence and edits
  useEffect(() => {
    const pTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        const who = ['Aarav', 'Meera', 'Rohan'][Math.floor(Math.random()*3)];
        setPresence(`${who} is editing...`);
        setTimeout(() => setPresence(''), 3000);
      }
    }, 5000);

    const eTimer = setInterval(() => {
      if (Math.random() > 0.8 && Object.keys(notesRecord).length > 0) {
        const keys = Object.keys(notesRecord);
        const k = keys[Math.floor(Math.random()*keys.length)];
        const oldVal = mapRef.current.get(k);
        if (oldVal) {
          const who = ['Aarav', 'Meera'][Math.floor(Math.random()*2)];
          const newVal = { ...oldVal, content: oldVal.content + '\n(Edit by ' + who + ')' };
          
          // Simulate remote merge
          const remoteReg = { value: newVal, time: mapRef.current.data.get(k).time + 1, nodeId: 'n-'+who };
          mapRef.current.merge(k, remoteReg);
          
          setNotesRecord(mapRef.current.exportValues());
          setHighlightNote(k);
          setHistory(prev => [{ time: Date.now(), user: who, action: 'Edited note' }, ...prev]);
          setTimeout(() => setHighlightNote(null), 2000);
        }
      }
    }, 8000);

    return () => { clearInterval(pTimer); clearInterval(eTimer); };
  }, [notesRecord]);

  const handleSend = () => {
    if (!text.trim()) return;
    
    if (editId) {
      const old = mapRef.current.get(editId);
      if (old) {
        mapRef.current.set(editId, { ...old, content: text.trim() });
        setHistory(prev => [{ time: Date.now(), user: 'You', action: 'Edited note' }, ...prev]);
      }
      setEditId(null);
    } else if (replyTo) {
      const old = mapRef.current.get(replyTo);
      if (old) {
        const newReply = { id: Date.now().toString(), author: 'You', content: text.trim(), time: Date.now() };
        mapRef.current.set(replyTo, { ...old, replies: [...(old.replies||[]), newReply] });
        setHistory(prev => [{ time: Date.now(), user: 'You', action: 'Replied to note' }, ...prev]);
      }
      setReplyTo(null);
    } else {
      const id = Date.now().toString();
      mapRef.current.set(id, { id, author: 'You', content: text.trim(), time: Date.now(), replies: [] });
      setHistory(prev => [{ time: Date.now(), user: 'You', action: 'Created note' }, ...prev]);
    }
    
    setNotesRecord(mapRef.current.exportValues());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const deleteNote = (id) => {
    const old = mapRef.current.get(id);
    if (old && old.author === 'You') {
      mapRef.current.set(id, { ...old, deleted: true });
      setNotesRecord(mapRef.current.exportValues());
      setHistory(prev => [{ time: Date.now(), user: 'You', action: 'Deleted note' }, ...prev]);
    }
  };

  const unpin = (id) => {
    setPins(p => p.filter(x => x.id !== id));
  };

  if (!bubble) return null;

  const notesList = Object.values(notesRecord)
    .filter(n => !n.deleted)
    .sort((a,b) => a.time - b.time);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notes & Board</h1>
          <div className={styles.sub}>Collaboration mode active</div>
        </div>
        <IconButton onClick={() => setDrawerOpen(true)} aria-label="History"><Clock size={20}/></IconButton>
      </div>

      <div className={styles.splitContainer}>
        {/* TOP: Pinned Board */}
        <div className={styles.pinnedBoard}>
          <div className={styles.sectionTitle}><Pin size={14}/> Pinned Board</div>
          <div className={styles.pinnedGrid}>
            {pins.map(p => (
              <div key={p.id} className={styles.pinCard}>
                <div className={styles.pinCardHeader}>
                  <div className={styles.pinAuthor}>{p.author}</div>
                  <button className={styles.unpinBtn} onClick={() => unpin(p.id)}><PinOff size={14}/></button>
                </div>
                <div className={styles.pinContent}>{p.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Threaded Notes */}
        <div className={styles.threadArea}>
          <div className={styles.threadList}>
            {notesList.length === 0 && <div style={{color: 'var(--text-muted)', textAlign: 'center', marginTop: 40}}>No notes yet.</div>}
            
            {notesList.map(n => (
              <NoteItem 
                key={n.id} 
                n={n} 
                highlightNote={highlightNote} 
                setReplyTo={setReplyTo} 
                setEditId={setEditId} 
                setText={setText} 
                deleteNote={deleteNote} 
              />
            ))}
          </div>

          <div className={styles.editorWrap}>
            <div className={styles.presenceRow}>
              {presence && <><div className={styles.presenceDot}/> {presence}</>}
              {replyTo && <div style={{display:'flex', alignItems:'center', gap:4, color:'var(--mode-accent)'}}><Reply size={12}/> Replying to thread <X size={12} style={{cursor:'pointer'}} onClick={()=>setReplyTo(null)}/></div>}
              {editId && <div style={{display:'flex', alignItems:'center', gap:4, color:'var(--mode-accent)'}}><Edit2 size={12}/> Editing note <X size={12} style={{cursor:'pointer'}} onClick={()=>{setEditId(null);setText('');}}/></div>}
            </div>
            
            <div className={styles.editorInput}>
              <textarea
                className={styles.textarea}
                placeholder="Write a note... (Markdown supported)"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.sendBtn} onClick={handleSend} disabled={!text.trim()}><Send size={20}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
            <motion.div 
              className={styles.drawer}
              initial={{x: 320}} animate={{x: 0}} exit={{x: 320}} transition={{duration: 0.2}}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.drawerHeader}>
                Version History
                <IconButton onClick={() => setDrawerOpen(false)}><X size={20}/></IconButton>
              </div>
              <div className={styles.drawerContent}>
                {history.map((h, i) => (
                  <div key={i} className={styles.historyItem}>
                    <div className={styles.historyTime}>{new Date(h.time).toLocaleTimeString()}</div>
                    <div><span className={styles.historyUser}>{h.user}</span> {h.action.toLowerCase()}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
