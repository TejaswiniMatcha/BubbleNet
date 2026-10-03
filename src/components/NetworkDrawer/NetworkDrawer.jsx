import { useState } from 'react';
import Drawer from '../Drawer/Drawer.jsx';
import Tabs from '../Tabs/Tabs.jsx';
import MeshTab from './tabs/MeshTab.jsx';
import RelaySettingsTab from './tabs/RelaySettingsTab.jsx';
import OutboxTab from './tabs/OutboxTab.jsx';
import { simulator } from '../../sim/simulator.js';

export default function NetworkDrawer({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('mesh');

  const tabs = [
    { id: 'mesh', label: 'Mesh' },
    { id: 'relay', label: 'Relay Settings' },
    { id: 'outbox', label: 'Outbox / Log' },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Network" side="right">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, overflow: 'hidden' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'mesh' && <MeshTab />}
          {activeTab === 'relay' && <RelaySettingsTab />}
          {activeTab === 'outbox' && <OutboxTab />}
        </div>

        {/* Small link to trigger simulated incoming SOS */}
        <button 
          onClick={() => simulator.eventBus.emit('incoming-sos', { 
            id: 'demo-sos', 
            type: 'Medical', 
            severity: 5, 
            summary: 'Unconscious near main gate', 
            distance: '150m away', 
            hops: 2 
          })}
          style={{
            background: 'none', border: 'none', color: '#E11D48', textDecoration: 'underline', 
            cursor: 'pointer', fontSize: '0.75rem', padding: '8px 0', textAlign: 'center', marginTop: 'auto'
          }}
        >
          Simulate incoming SOS
        </button>
      </div>
    </Drawer>
  );
}
