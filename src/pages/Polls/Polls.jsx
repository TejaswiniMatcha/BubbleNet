import { useState, useEffect } from 'react';
import { Plus, X, Crown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './Polls.module.css';
import Button from '../../components/Button/Button.jsx';
import IconButton from '../../components/IconButton/IconButton.jsx';
import { useBubble } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';
import { tallyVotes } from '../../utils/poll.js';

const INITIAL_POLLS = [
  {
    id: 'poll-1',
    question: 'Where should we meet for lunch?',
    options: ['Food Court', 'Main Square', 'Cafeteria', 'Outside'],
    creator: 'Meera',
    closed: false,
    votes: [
      { voter: 'Aarav', optionIndex: 0 },
      { voter: 'Rohan', optionIndex: 0 },
      { voter: 'Sana', optionIndex: 1 },
    ],
  },
  {
    id: 'poll-2',
    question: 'Which presentation format?',
    options: ['Slides', 'Live Demo', 'Video'],
    creator: 'You',
    closed: true,
    votes: [
      { voter: 'Meera', optionIndex: 1 },
      { voter: 'Aarav', optionIndex: 1 },
      { voter: 'Rohan', optionIndex: 0 },
    ],
  }
];

function PollCard({ poll, onVote, onClose }) {
  // Check if I have voted
  const myVote = poll.votes.find(v => v.voter === 'You');
  const results = tallyVotes(poll.options, poll.votes);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (poll.closed) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [poll.closed]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.question}>{poll.question}</div>
          <div className={styles.meta}>
            <span>Created by {poll.creator}</span>
            <span>•</span>
            <span>{poll.votes.length} votes</span>
            {!poll.closed && (
              <>
                <span>•</span>
                <span style={{ color: '#D97706', fontWeight: 600 }}>⏱ {timeStr}</span>
              </>
            )}
            <span className={clsx(styles.badge, poll.closed ? styles.closed : styles.active)} style={{ marginLeft: 'auto' }}>
              {poll.closed ? 'Closed' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.options}>
        {results.map((r, idx) => {
          const isSelected = myVote?.optionIndex === idx;
          const isWinner = poll.closed && r.isWinner;
          return (
            <div 
              key={idx} 
              className={clsx(styles.optionRow, poll.closed && styles.closed, isSelected && styles.selected, isWinner && styles.isWinner)}
              onClick={() => !poll.closed && onVote(poll.id, idx)}
            >
              <div className={styles.optionBg}>
                <div className={styles.optionFill} style={{width: `${r.percentage}%`}} />
              </div>
              <div className={styles.optionContent}>
                <div className={styles.optionText}>
                  {!poll.closed && <div className={styles.radio} />}
                  {isWinner && <Crown size={14} color="#D97706" />}
                  {r.option}
                </div>
                <div className={styles.optionStats}>
                  <div className={styles.voterAvatars}>
                    {r.voters.slice(0,3).map((v, i) => (
                      <div key={i} className={styles.voterAvatar}>{v.charAt(0)}</div>
                    ))}
                  </div>
                  <span style={{fontWeight: 600}}>{r.percentage}%</span>
                  <span>({r.count})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {poll.creator === 'You' && !poll.closed && (
        <div style={{marginTop: 8}}>
          <Button variant="secondary" size="sm" fullWidth onClick={() => onClose(poll.id)}>Close Poll</Button>
        </div>
      )}
    </div>
  );
}

export default function Polls() {
  const bubble = useBubble();
  const { addToast } = useUiActions();
  const [polls, setPolls] = useState(INITIAL_POLLS);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' or 'ended'
  const [filterOwnership, setFilterOwnership] = useState('all'); // 'all' or 'mine'

  // New poll form
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['', '']);

  // Simulate incoming votes
  useEffect(() => {
    const timer = setInterval(() => {
      setPolls(prev => prev.map(p => {
        if (p.closed) return p;
        if (Math.random() > 0.8) {
          const who = ['Aarav', 'Meera', 'Rohan', 'Sana'][Math.floor(Math.random()*4)];
          const opt = Math.floor(Math.random() * p.options.length);
          // filter out old vote from this user
          const newVotes = p.votes.filter(v => v.voter !== who);
          newVotes.push({ voter: who, optionIndex: opt });
          return { ...p, votes: newVotes };
        }
        return p;
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleVote = (pollId, optIdx) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        const newVotes = p.votes.filter(v => v.voter !== 'You');
        newVotes.push({ voter: 'You', optionIndex: optIdx });
        return { ...p, votes: newVotes };
      }
      return p;
    }));
  };

  const handleClosePoll = (pollId) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, closed: true } : p));
  };

  const createPoll = () => {
    const validOpts = opts.filter(o => o.trim() !== '');
    if (!q.trim() || validOpts.length < 2) {
      addToast({ message: 'Poll needs a question and at least 2 options.', type: 'danger' });
      return;
    }
    const newPoll = {
      id: `poll-${Date.now()}`,
      question: q.trim(),
      options: validOpts,
      creator: 'You',
      closed: false,
      votes: [],
    };
    setPolls([newPoll, ...polls]);
    setModalOpen(false);
    setQ('');
    setOpts(['', '']);
  };

  if (!bubble) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Polls</h1>
          <div className={styles.sub}>Make group decisions without internet</div>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<Plus size={16}/>}>Create Poll</Button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button variant={filterStatus === 'active' ? 'primary' : 'default'} onClick={() => setFilterStatus('active')}>Active</Button>
        <Button variant={filterStatus === 'ended' ? 'primary' : 'default'} onClick={() => setFilterStatus('ended')}>Ended</Button>
        <div style={{ width: 1, background: '#E2E8F0', margin: '0 8px' }} />
        <Button variant={filterOwnership === 'all' ? 'primary' : 'default'} onClick={() => setFilterOwnership('all')}>All Polls</Button>
        <Button variant={filterOwnership === 'mine' ? 'primary' : 'default'} onClick={() => setFilterOwnership('mine')}>My Polls</Button>
      </div>

      <div className={styles.content}>
        {polls.filter(p => {
          if (filterStatus === 'active' && p.closed) return false;
          if (filterStatus === 'ended' && !p.closed) return false;
          if (filterOwnership === 'mine' && p.creator !== 'You') return false;
          return true;
        }).map(p => (
          <PollCard key={p.id} poll={p} onVote={handleVote} onClose={handleClosePoll} />
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className={styles.modal}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>New Poll</div>
                <IconButton onClick={() => setModalOpen(false)}><X size={20}/></IconButton>
              </div>
              <div className={styles.modalBody}>
                <div>
                  <label className={styles.label}>Question</label>
                  <input className={styles.input} placeholder="Ask something..." value={q} onChange={e => setQ(e.target.value)} />
                </div>
                
                <div>
                  <label className={styles.label}>Options</label>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {opts.map((o, i) => (
                      <div key={i} className={styles.optionInputWrap}>
                        <input className={styles.input} placeholder={`Option ${i+1}`} value={o} onChange={e => {
                          const n = [...opts]; n[i] = e.target.value; setOpts(n);
                        }} />
                        {opts.length > 2 && (
                          <button className={styles.removeBtn} onClick={() => {
                            const n = [...opts]; n.splice(i, 1); setOpts(n);
                          }}><Trash2 size={16}/></button>
                        )}
                      </div>
                    ))}
                    {opts.length < 6 && (
                      <button className={styles.addOptionBtn} onClick={() => setOpts([...opts, ''])}>
                        <Plus size={14}/> Add option
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={createPoll}>Create Poll</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
