import { useState } from 'react';
import Switch from '../../Switch/Switch.jsx';
import Slider from '../../Slider/Slider.jsx';
import ProgressBar from '../../ProgressBar/ProgressBar.jsx';
import { useNodeList, useMembersActions } from '../../../store/membersStore.js';
import { NODE_IDS } from '../../../sim/nodes.js';

export default function RelaySettingsTab() {
  const nodes = useNodeList();
  const { updateNode } = useMembersActions();
  const you = nodes.find(n => n.id === NODE_IDS.YOU) || { isRelay: true, battery: 80 };

  const [sosOnly, setSosOnly] = useState(false);
  const [batteryGuard, setBatteryGuard] = useState(true);
  const [storageCap, setStorageCap] = useState(50); // MB

  const handleRelayChange = (checked) => {
    updateNode(NODE_IDS.YOU, { isRelay: checked });
  };

  const handleBatteryChange = (val) => {
    updateNode(NODE_IDS.YOU, { battery: val });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 0' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Let my phone relay for others</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Help extend the mesh network range.</div>
          </div>
          <Switch checked={you.isRelay !== false} onChange={handleRelayChange} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>SOS-only relay mode</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Only relay emergency packets.</div>
          </div>
          <Switch checked={sosOnly} onChange={setSosOnly} disabled={you.isRelay === false} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Battery Guard</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Pause relaying under 20% charge.</div>
          </div>
          <Switch checked={batteryGuard} onChange={setBatteryGuard} disabled={you.isRelay === false} />
        </div>
      </div>

      <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Simulate Battery</span>
          <span style={{ fontWeight: 700, color: 'var(--mode-accent)' }}>{you.battery}%</span>
        </div>
        <Slider min={0} max={100} value={you.battery} onChange={handleBatteryChange} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Relay Storage Cap</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{storageCap} MB</span>
        </div>
        <Slider min={10} max={100} value={storageCap} onChange={setStorageCap} />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span>Usage: 14.2 MB stored</span>
          <span>{Math.round((14.2/storageCap)*100)}%</span>
        </div>
        <ProgressBar progress={(14.2/storageCap)*100} color="var(--mode-accent)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
        <div style={{ background: '#FFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 12 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>128</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Packets Forwarded</div>
        </div>
        <div style={{ background: '#FFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 12 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F43F5E' }}>4</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Dropped (TTL)</div>
        </div>
      </div>
    </div>
  );
}
