import { useState } from 'react';
import { Lock, ShieldAlert, Key, Zap, CheckCircle2 } from 'lucide-react';
import Button from '../Button/Button.jsx';

export default function E2EInspector() {
  const [tampered, setTampered] = useState(false);
  const [view, setView] = useState('member'); // 'member' or 'relay'

  const cryptoAvail = typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;

  return (
    <div style={{ width: 320, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {!cryptoAvail && (
        <div style={{ padding: 12, background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 8, color: '#BE123C', fontSize: '0.8125rem' }}>
          <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> WebCrypto API unavailable. Falling back to plain text.
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--success)' }}>
          <Lock size={16} /> End-to-End Encrypted
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Only devices in this bubble can read your messages. AES-GCM 256-bit.
        </div>
      </div>

      <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, border: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Key size={12} /> BUBBLE KEY FINGERPRINT
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569', letterSpacing: 1, wordBreak: 'break-all' }}>
          3A:4F:92:B1:C8:77:E5:6D<br/>
          F0:22:1A:8C:99:34:B5:E1
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 8, padding: 4, marginBottom: 12 }}>
          <button onClick={() => setView('member')} style={{ flex: 1, padding: '4px 0', borderRadius: 4, border: 'none', background: view === 'member' ? '#FFF' : 'transparent', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: view === 'member' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            Member sees
          </button>
          <button onClick={() => setView('relay')} style={{ flex: 1, padding: '4px 0', borderRadius: 4, border: 'none', background: view === 'relay' ? '#FFF' : 'transparent', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: view === 'relay' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            Relay sees
          </button>
        </div>

        <div style={{ background: '#0F172A', borderRadius: 8, padding: 12, color: '#E2E8F0', fontSize: '0.75rem', fontFamily: 'monospace', minHeight: 120 }}>
          {view === 'member' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tampered ? (
                <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert size={14}/> MAC verification failed! Message rejected.</div>
              ) : (
                <>
                  <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14}/> Decrypted successfully</div>
                  <div style={{ color: '#FCD34D' }}>Sender: Sana</div>
                  <div>"Hey, I'm at the main gate!"</div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#94A3B8' }}>// Unencrypted Envelope</div>
              <div style={{ color: '#FCD34D' }}>To: Broadcast</div>
              <div style={{ color: '#FCD34D' }}>TTL: 16, Priority: 1</div>
              <div style={{ color: '#94A3B8', marginTop: 8 }}>// Ciphertext (AES-GCM)</div>
              <div style={{ wordBreak: 'break-all', color: '#38BDF8', lineHeight: 1.4 }}>
                0x8F4A2B9C7D1E5F0<br/>A3B6C9D2E5F8A1B4<br/>C7D0E3F6A9B2C5D8
              </div>
            </div>
          )}
        </div>
      </div>

      <Button variant="secondary" fullWidth onClick={() => setTampered(!tampered)}>
        <Zap size={14} style={{ marginRight: 6 }} /> {tampered ? 'Reset Message' : 'Simulate Tampering'}
      </Button>

    </div>
  );
}
