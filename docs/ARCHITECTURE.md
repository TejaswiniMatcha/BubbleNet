## Current-state overrides
- The app opens on the Create Bubble page at "/". After creating, the Bubble Created page shows the QR, 4-digit PIN, copy button, and the side-by-side "Share Bubble" (copies a join link) and "Enter Bubble" buttons. "Enter Bubble" opens the bubble.
- Inside a bubble there is NO left sidebar and NO right panel. The six tabs (Messages, Album, Files, Notes, Polls, Location) are in the top bar, plus a Home icon button that returns to the dashboard.
- Messages is a 4-panel WhatsApp-style layout (left rail with Chat and Members toggle, conversation list, chat, optional members panel). It has no call/video icons and no Nearby/Settings rail items.
- The "Demo controls" popover was removed on purpose. Do not re-add it.
- Decorative floating bubbles/spheres and dotted lines are part of the Shell background and must stay.
- Narrow-screen guard is 900px (not 1100px). Laptop only.
- A demo bubble ("Group Bubble", PIN 5250) is auto-created if no bubble is stored. Keep that behavior.
- Tooling: lint = `npm run lint` (oxlint), tests = `npm run test:run`, build = `npm run build`, install with `--legacy-peer-deps`. Quality gate = all three green.
