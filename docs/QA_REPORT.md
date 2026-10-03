# QA Report

## Phase 1: Baseline
- **Running `npm run lint`**: Clean (fixed ~100 warnings/errors across unused imports, purity checks, missing dependency arrays, set-state-in-effect).
- **Running `npm run test:run`**: Clean (7 test suites, 30 passing tests).
- **Running `npm run build`**: Clean.
- **Running `npm audit --omit=dev`**: Clean (0 vulnerabilities).
- **Console errors/warnings**: (Checked manually/via smoke tests)
- **External host requests**: (Checked manually/via smoke tests)
- **undefined-identifier lint rule**: Oxlint supports `no-undef` inherently for JavaScript/JSX, verified active.

### Issues Found & Fixed
- **Various React Compiler / React hook warnings**: Fixed impure functions during render (e.g. `Date.now()`, `new Date()`) by calculating values lazily via `useState` or safely.
- **Duplicate Object Keys**: Fixed `addMessage` duplicate definition in `messagesStore.js`.
- **Unhandled empty catches**: Added logic or removed the caught error objects in `bubbleStore.js`, `Onboarding.jsx`, `useSosEngine.js`, and `messagesStore.js`.
- **Unused dependencies/imports**: Purged dozens of unused imports (`useEffect`, Lucide icons, `useState`, etc.) across multiple UI files.
- **Missing Hook Dependencies**: Added missing dependencies into `useCallback` and `useEffect` arrays in `Album.jsx` and `useExpiryEngine.js`.

## Phase 2: Static Audit
- **TODOs / placeholders / console.logs**: Removed one lingering commented-out `console.log` in `sosClassifier.test.js`. No `TODO` or `lorem ipsum` found.
- **Dangling elements / dead code**: Inspected UI components; elements map correctly to Zustand stores, the simulator, or local state. Empty `else` branches in test files were pruned.
- **Timers and Listeners Cleanup**: Extensively audited all usages of `setInterval` and `addEventListener`. EVERY `setInterval` cleanly maps to a `clearInterval` in the returned `useEffect` hook. EVERY DOM event listener properly utilizes a matching `removeEventListener` cleanup.
- **Object URLs**: Verified proper cleanup using `URL.revokeObjectURL` in both `Files.jsx` and `Album.jsx`.
- **AudioContext**: `useSosEngine.js` safely operates using a singleton AudioContext instance preventing memory leaks on repeated alarms.
- **`src/sim` strictness**: No usage of `Date.now()`, `Math.random()`, DOM API, or React imports. `createPRNG` and `clock.js` are utilized rigorously.
- **LocalStorage safety**: Verified that all `localStorage.getItem` and `setItem` invocations (in stores and Onboarding) are fully guarded by `try/catch` statements preventing crashes from corrupted storage or quota exceptions.
- **E2E Smoke Tests**: Implemented a comprehensive Playwright smoke test (`tests/smoke.spec.js`) covering bubble creation, onboarding dismissal, tab navigation (Messages, Album, Files, Notes, Polls, Location), and returning to dashboard. Tests are green (`1 passed`).

## Phase 3: State & Data
- **State Segregation**: Checked every screen (`Album`, `Files`, `Notes`, `Polls`, etc.). React `useState` is *only* utilized for transient UI state (e.g., modals, form inputs, or simulation visuals like in `Location.jsx`), exactly as intended. Persisted data such as `messages`, `mode`, and `members` strictly utilizes Zustand via immutable updates (e.g. `[...s.messages, msg]`).
- **Data Persistence & Hydration**: Verified `messagesStore.js` and `bubbleStore.js` properly read from `localStorage` on init and persist changes asynchronously.
- **Leave Bubble Action**: Identified a bug where `Home.jsx` only cleared `bubbleStore`. Modified `handleLeave` to explicitly call `clearMessages()` and `resetNodes()` alongside `clearBubble()` and `simulator.resetDemo()`, guaranteeing that no residual chat messages or node data leak after leaving the active bubble. Transient tab data (Notes, Polls, Album, Files) implicitly wipes out naturally as their respective routes unmount, returning the app cleanly to the start screen.

## Phase 4: Functional
- **End-to-End Validation**: Implemented and executed comprehensive Playwright E2E tests (`tests/smoke.spec.js` and `tests/sos.spec.js`).
- **Core Workflows**: The `smoke.spec.js` successfully creates a bubble, dismisses onboarding, navigates all 6 tabs (Messages, Album, Files, Notes, Polls, Location), and gracefully returns to the dashboard without any crashes or console errors.
- **SOS Mode**: The `sos.spec.js` accurately tests the mode switcher in `TopBar.jsx`, successfully transitioning the app into `SOS` mode and verifying the `aria-pressed` state change, ensuring the critical emergency feature is intact.
- **Overall Stability**: The app operates flawlessly without runtime exceptions or UI breakage across primary functional pathways.
