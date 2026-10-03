import { useState, useEffect } from 'react';
import Button from '../../Button/Button.jsx';
import { Clock, RefreshCcw, Send, CheckCircle2 } from 'lucide-react';
import { simulator } from '../../../sim/simulator.js';

const PRIORITY_COLORS = { 0: '#DC2626', 1: '#0284C7', 2: '#7C3AED', 3: '#059669' };

export default function OutboxTab() {
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([
    { id: 'msg-v2', type: 'text', priority: 1, attempts: 2, nextRetry: 12 },
    { id: 'file-v4', type: 'file', priority: 3, attempts: 1, nextRetry: 45 },
  ]);

  useEffect(() => {
    // Tick down retries
    const timer = setInterval(() => {
      setPending(prev => prev.map(p => ({
        ...p,
        nextRetry: Math.max(0, p.nextRetry - 1)
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleHop = (packet) => {
      setLogs(prev => [{
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        type: packet.priority === 0 ? 'SOS' : packet.priority === 3 ? 'FILE' : 'TEXT',
        priority: packet.priority,
        msgId: packet.id?.substring(0, 5) || 'pkt',
        from: packet.fromId,
        to: packet.toId,
        ttl: packet.ttl || 16
      }, ...prev].slice(0, 20));
    };
    
    const unsub = simulator.eventBus.on('packet-hop', handleHop);
    return unsub;
  }, []);

  const handleRetry = (id) => {
    setPending(prev => prev.filter(p => p.id !== id));
    simulator.sendText("Retried packet", 1, 'meera');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Pending Frames</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pending.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', background: '#F8FAFC', borderRadius: 8, color: '#64748B', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} style={{ marginBottom: 4 }} />
              <div>Outbox empty. All frames delivered.</div>
            </div>
          ) : (
            pending.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.875rem', color: PRIORITY_COLORS[p.priority] }}>
                    <Send size={12} /> {p.type.toUpperCase()} - {p.id}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
                    Attempts: {p.attempts} • Retry in <Clock size={10} style={{ display: 'inline' }} /> {p.nextRetry}s
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleRetry(p.id)}>
                  <RefreshCcw size={12} style={{ marginRight: 4 }} /> Retry
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Packet Log</div>
        <div style={{ flex: 1, background: '#0F172A', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '60px 40px 50px 80px 40px', gap: 8, padding: '8px 12px', background: '#1E293B', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>
            <div>TIME</div>
            <div>TYPE</div>
            <div>ID</div>
            <div>ROUTE</div>
            <div>TTL</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748B', padding: 16 }}>No packets recorded yet.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '60px 40px 50px 80px 40px', gap: 8, padding: '4px 12px', color: '#E2E8F0', alignItems: 'center' }}>
                  <div style={{ color: '#94A3B8' }}>{log.time.split(' ')[0]}</div>
                  <div style={{ color: PRIORITY_COLORS[log.priority], fontWeight: 700 }}>{log.type}</div>
                  <div>{log.msgId}</div>
                  <div style={{ color: '#FCD34D' }}>{log.from[0].toUpperCase()} → {log.to[0].toUpperCase()}</div>
                  <div>{log.ttl}</div>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
