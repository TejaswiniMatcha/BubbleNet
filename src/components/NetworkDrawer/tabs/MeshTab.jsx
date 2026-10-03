import { useState } from 'react';
import MeshMap from '../../MeshMap/MeshMap.jsx';
import Button from '../../Button/Button.jsx';
import Switch from '../../Switch/Switch.jsx';
import { useNodeList, useMembersActions } from '../../../store/membersStore.js';
import { simulator } from '../../../sim/simulator.js';
import { useUiActions } from '../../../store/uiStore.js';
import { NODE_IDS } from '../../../sim/nodes.js';

export default function MeshTab() {
  const nodes = useNodeList();
  const { updateNode } = useMembersActions();
  const { addToast } = useUiActions();
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const toggleOnline = (n) => {
    const isOnline = !n.online;
    updateNode(n.id, { online: isOnline });
    if (!isOnline) {
      addToast({ message: `${n.name} offline: 3 messages waiting`, type: "danger" });
    }
  };

  const toggleRelay = (n) => {
    updateNode(n.id, { isRelay: !n.isRelay });
  };

  const sendTestPacket = () => {
    simulator.sendText("Test packet", 1, NODE_IDS.SANA);
    addToast({ message: "Test packet sent to Sana", type: "success" });
  };

  const priorityDemo = () => {
    simulator.sendText("Priority SOS", 0, NODE_IDS.SANA); // SOS
    simulator.sendText("Large file", 3, NODE_IDS.SANA); // File
    addToast({ message: "File & SOS sent. SOS overtakes!", type: "info" });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, border: '1px solid #E2E8F0', flexShrink: 0 }}>
        <MeshMap />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button size="sm" variant="secondary" onClick={sendTestPacket}>Send test packet</Button>
        <Button size="sm" variant="primary" onClick={priorityDemo}>Priority routing demo</Button>
      </div>

      {/* Select node to simulate click. We don't have interactive nodes in MeshMap easily, so we add a selector or just show list below */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {nodes.map(n => (
          <button key={n.id} onClick={() => handleNodeClick(n)} style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid #CBD5E1', background: selectedNode?.id === n.id ? '#E0F2FE' : '#FFF', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {n.name}
          </button>
        ))}
      </div>

      {selectedNode && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedNode.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.875rem' }}>
            <div><strong>Hops from you:</strong> {selectedNode.hopIndex}</div>
            <div><strong>Battery:</strong> {selectedNode.battery}%</div>
            <div><strong>Signal:</strong> Excellent</div>
            <div><strong>Packets forwarded:</strong> {selectedNode.id === NODE_IDS.YOU ? 12 : 45}</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Relay enabled</span>
            <Switch checked={selectedNode.isRelay !== false} onChange={() => toggleRelay(selectedNode)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Online</span>
            <Switch checked={selectedNode.online} onChange={() => toggleOnline(selectedNode)} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F1F5F9', padding: '12px 16px', borderRadius: 12, marginTop: 'auto', fontSize: '0.8125rem', color: '#475569' }}>
        <div>Hops to farthest: 4</div>
        <div>Relayed: 128</div>
        <div>Queued: 3</div>
        <div>Avg lat: 14ms</div>
      </div>
    </div>
  );
}
