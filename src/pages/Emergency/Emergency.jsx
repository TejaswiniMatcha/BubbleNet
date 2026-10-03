// src/pages/Emergency/Emergency.jsx
import { BubbleGuard, StubPage } from '../stubs/StubPage.jsx';
export default function Emergency() {
  return <BubbleGuard><StubPage icon="🆘" title="Emergency Mode" desc="In emergency mode, SOS messages bypass the queue and are delivered with highest priority. AI-assisted structuring helps you communicate clearly under stress." /></BubbleGuard>;
}
