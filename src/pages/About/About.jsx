/**
 * src/pages/About/About.jsx
 */

const s = {
  page: { height: '100%', overflow: 'auto', padding: 'var(--sp-8)', maxWidth: 640, margin: '0 auto' },
  title: { fontSize: 'clamp(1.5rem, 2vw, 1.875rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 },
  section: { marginBottom: 'var(--sp-6)' },
  h2: { fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  p: { color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' },
};

export default function About() {
  return (
    <div style={s.page}>
      <h1 style={s.title}>About BubbleNet</h1>
      <div style={s.section}>
        <h2 style={s.h2}>What is BubbleNet?</h2>
        <p style={s.p}>BubbleNet is a frontend prototype for iQOO Social Relay — a temporary "Social Bubble" that lets nearby devices communicate without any internet connection. Messages, photos, and files relay hop-by-hop across a mesh of participating phones.</p>
      </div>
      <div style={s.section}>
        <h2 style={s.h2}>How it works</h2>
        <p style={s.p}>Devices discover each other via QR code, 4-digit PIN, or Nearby discovery. A controlled-flooding relay protocol forwards packets with TTL limits, duplicate suppression, and priority queues (SOS first). The battery guard ensures low-power nodes don't exhaust themselves relaying for others.</p>
      </div>
      <div style={s.section}>
        <h2 style={s.h2}>Prototype notes</h2>
        <p style={s.p}>This is a frontend-only demo. All radio communication is simulated by a deterministic in-browser engine. No real Bluetooth, Wi-Fi, or data is transmitted. The mesh topology is a 5-node chain: You — Aarav — Meera — Rohan — Sana.</p>
      </div>
    </div>
  );
}
