// src/pages/RelaySettings/RelaySettings.jsx
import { BubbleGuard, StubPage } from '../stubs/StubPage.jsx';
export default function RelaySettings() {
  return <BubbleGuard><StubPage icon="🔁" title="Relay Settings" desc="Control whether your device forwards messages for others. The battery guard automatically pauses relay when charge drops below 20%." /></BubbleGuard>;
}
