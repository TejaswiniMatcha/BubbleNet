/**
 * src/pages/Dev/Dev.jsx
 */
import { useState } from 'react';
import Button from '../../components/Button/Button.jsx';
import IconButton from '../../components/IconButton/IconButton.jsx';
import Card from '../../components/Card/Card.jsx';
import Chip from '../../components/Chip/Chip.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Avatar from '../../components/Avatar/Avatar.jsx';
import Tabs from '../../components/Tabs/Tabs.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Drawer from '../../components/Drawer/Drawer.jsx';
import Popover from '../../components/Popover/Popover.jsx';
import Tooltip from '../../components/Tooltip/Tooltip.jsx';
import Switch from '../../components/Switch/Switch.jsx';
import Slider from '../../components/Slider/Slider.jsx';
import Input from '../../components/Input/Input.jsx';
import PinInput from '../../components/PinInput/PinInput.jsx';
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx';
import ProgressRing from '../../components/ProgressRing/ProgressRing.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import CountdownRing from '../../components/CountdownRing/CountdownRing.jsx';
import { useUiActions } from '../../store/uiStore.js';
import { Settings, User, X } from 'lucide-react';

export default function Dev() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [switchVal, setSwitchVal] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);
  const [pinVal, setPinVal] = useState('');
  const { addToast } = useUiActions();

  return (
    <div style={{ padding: 'var(--sp-6)', overflowY: 'auto', height: '100%', background: 'var(--bg-page)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 'var(--sp-6)' }}>Component Gallery</h1>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Button</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-3)' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>IconButton</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-3)' }}>
          <IconButton icon={<Settings size={20} />} />
          <IconButton icon={<User size={20} />} variant="primary" />
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Chip & Badge</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-3)', alignItems: 'center' }}>
          <Chip variant="default">Default</Chip>
          <Chip variant="primary">Primary</Chip>
          <Chip variant="success">Success</Chip>
          <Chip variant="warning">Warning</Chip>
          <Chip variant="danger">Danger</Chip>
          <Badge variant="primary" size="sm">2</Badge>
          <Badge variant="danger" size="md">99+</Badge>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Avatar</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-3)', alignItems: 'center' }}>
          <Avatar name="Aarav" bg="#E0F2FE" color="#0284C7" size="md" showOnlineDot online />
          <Avatar name="Meera" bg="#F0FDF4" color="#16A34A" size="md" showOnlineDot online={false} />
          <Avatar name="Rohan" bg="#FFFBEB" color="#F59E0B" size="lg" battery={15} />
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Tabs</h2>
        <div style={{ maxWidth: 400, marginTop: 'var(--sp-3)' }}>
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: '1', label: 'Tab One' },
              { id: '2', label: 'Tab Two' },
              { id: '3', label: 'Tab Three' }
            ]}
          />
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Overlays (Modal, Drawer, Popover, Tooltip)</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-3)', alignItems: 'center' }}>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
          
          <Popover trigger={<Button variant="secondary">Open Popover</Button>} placement="bottom">
            <div style={{ padding: 'var(--sp-2)' }}>Popover Content</div>
          </Popover>

          <Tooltip content="Tooltip message">
            <span style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: 4, cursor: 'pointer' }}>Hover me</span>
          </Tooltip>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Toast</h2>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'var(--sp-3)' }}>
          <Button onClick={() => addToast({ message: 'Success message', type: 'success' })}>Success Toast</Button>
          <Button onClick={() => addToast({ message: 'Error message', type: 'error' })}>Error Toast</Button>
          <Button onClick={() => addToast({ message: 'Info message', type: 'info' })}>Info Toast</Button>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Inputs (Switch, Slider, Input, PinInput)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-3)', maxWidth: 300 }}>
          <Switch id="sw1" checked={switchVal} onChange={setSwitchVal} label="Toggle me" />
          <Slider value={sliderVal} onChange={setSliderVal} />
          <Input placeholder="Type here..." />
          <PinInput id="pin" value={pinVal} onChange={setPinVal} />
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>Progress (ProgressBar, ProgressRing, CountdownRing)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-3)', maxWidth: 400 }}>
          <ProgressBar value={sliderVal} color="primary" />
          <ProgressBar value={sliderVal} color="success" size="lg" />
          <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
            <ProgressRing progress={sliderVal} size={60}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{sliderVal}%</span>
            </ProgressRing>
            <CountdownRing targetDate={Date.now() + 60000} durationMs={60000} size={60} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--sp-8)' }}>
        <h2>EmptyState</h2>
        <div style={{ height: 300, background: 'var(--bg-card)', borderRadius: 'var(--radius-panel)' }}>
          <EmptyState
            icon="📭"
            title="No items found"
            description="There's nothing to see here right now."
            action={<Button>Create One</Button>}
          />
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
        <p>Modal content goes here.</p>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-4)' }}>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </div>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Example Drawer" side="right">
        <p>Drawer content goes here.</p>
      </Drawer>
    </div>
  );
}
