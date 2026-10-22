# Test strategy

Two layers. Unit and component behavior is asserted by Vitest. End-to-end behavior is driven through
`playwright-cli` and evidenced with page snapshots and DOM checks.

## Layers

| Layer     | Runner              | Location                          | Use for                                              |
| --------- | ------------------- | --------------------------------- | ---------------------------------------------------- |
| unit      | Vitest              | `src/lib/*.test.js`               | pure helpers, formatting, validation, sorting        |
| component | Vitest + RTL        | `src/components/*.test.jsx`       | rendering, props, user events, empty/loading/error   |
| e2e       | `playwright-cli`    | steps recorded in the RFP doc     | routing, auth, persistence, full user journeys       |

Keep the pyramid bottom-heavy. A behavior that a component test can prove should not become an E2E
case.

## One-time setup

Skip this section when `npx vitest --version` already succeeds.

```sh
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Add the test block to `vite.config.js`:

```js
test: {
  environment: 'jsdom',
  globals: false,
  setupFiles: './src/test/setup.js',
  css: false,
  include: ['src/**/*.{test,spec}.{js,jsx}'],
},
```

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest'
```

Create `src/test/render.jsx` mirroring the provider stack in `src/main.jsx`:

```jsx
import { render } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ToastProvider } from '../contexts/ToastContext'

export function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  )
}
```

`globals: false` matches the repo style: import `describe`, `it`, `expect`, and `vi` from `vitest`
in every test file.

## Firebase safety

Never point a test at the real project `bloging-4fc47`. Unit and component tests use mocks. E2E runs
against the demo backend (default when Firebase env vars are absent) or the Firebase Emulator Suite
when the feature touches Firestore or Storage. Never write, seed, or delete data in production.

For emulator runs:

```sh
# .env.local
VITE_USE_FIREBASE_EMULATORS=true

npm run emulators
npm run dev -- --port 5173 --strictPort
```

Add the `storage` emulator (port 9199) to `firebase.json` and `connectStorageEmulator(storage,
'127.0.0.1', 9199)` in `src/lib/firebase.js` before testing uploads. Rules changes are verified with
the emulators, not the deployed project.

## Commands

```sh
npx vitest run                         # full unit suite, once
npx vitest run src/lib/utils.test.js   # one file
npx vitest run -t "slugify"            # one test name
npx vitest                             # watch mode, human use only
npm run build                          # must pass before the final report
```

Never leave a watch-mode process running in autonomous mode.

## E2E with playwright-cli (required)

E2E cases are executed in a real browser. Load the `playwright-cli` skill with the `skill` tool before
the first E2E case and use its command surface; do not invent browser automation or replace an
approved E2E case with a component test.

Prerequisites: `playwright-cli --version` works (already installed globally). The app runs in demo
mode when Firebase env vars are absent, with seeded localStorage data. For Firestore or Storage
behavior, run against the Firebase Emulator Suite as described above.

### Session procedure

1. Load skill `playwright-cli`.
2. Start the app in the background: `npm run dev -- --port 5173 --strictPort`.
3. Launch one browser for the run:
   `playwright-cli -s=rfp-<feature> open http://localhost:5173`.
4. Execute each E2E case in priority order:
   - reset state when the case needs a clean start
   - `snapshot` to get refs, then act with `click`, `fill`, `press`, or `goto`
   - assert with `find`, `eval`, or a targeted `snapshot`
   - append the case result to `RFP/<feature>/results.md` immediately
5. Check for unexpected errors: `playwright-cli -s=rfp-<feature> console error`.
6. Close the session (`close`), clear leftovers (`close-all`), and stop the dev server.

One browser session per feature run, reused across cases. Re-snapshot after every navigation or major
DOM change because refs go stale.

```sh
# launch and inspect
playwright-cli -s=rfp-<feature> open http://localhost:5173
playwright-cli -s=rfp-<feature> snapshot

# interact using refs from the snapshot
playwright-cli -s=rfp-<feature> click e15
playwright-cli -s=rfp-<feature> fill e7 "demo@inkwell.blog"
playwright-cli -s=rfp-<feature> press Enter

# assert against observable evidence
playwright-cli -s=rfp-<feature> find "Published in realtime"
playwright-cli -s=rfp-<feature> eval "location.pathname"
playwright-cli -s=rfp-<feature> console error

# cleanup
playwright-cli -s=rfp-<feature> close
playwright-cli close-all
```

Notes:

- `find <text>` searches the current snapshot and returns matching nodes with context. Prefer it
  over full snapshots for large pages.
- `eval` is for small, deterministic checks such as `location.pathname`, an input value, or a count.
  Wrap results with `--raw` when you need a clean value.
- Use `delete-data` (or `eval "localStorage.clear()"`) plus `reload` to reset the demo backend
  between scenarios. `resetDemoData()` is also exported by `src/lib/demoBackend.js`.
- Demo credentials: `demo@inkwell.blog` / `demo1234`.
- `resize 390 844` checks the phone layout; `set-color-scheme dark` checks the dark theme.
- Record console errors with `console error`; any unexpected error fails the E2E case.

### Recording an E2E result

For every case, write to `RFP/<feature>/results.md`:

```md
### TC-010 — homepage shows 10 posts

- Session: rfp-homepage-10-posts
- Commands:
  - `playwright-cli -s=... eval "document.querySelectorAll('.post-card').length"`
  - `playwright-cli -s=... find "Latest stories"`
- Observed: `9` cards plus the featured story; featured title matches the newest post
- Console errors: none
- Status: pass
```

A case passes only when the expected observation is present in the snapshot, `find` output, or an
`eval` result, and no unexpected console error occurred. A screenshot alone is not evidence. If a
screenshot helps, save it under `RFP/<feature>/evidence/` and reference the path; keep the folder
small.

## Post-deploy verification

After a successful deploy, load the live URL with `playwright-cli` and repeat a short smoke pass:

- homepage renders, with the expected post count and header actions
- one deep link loads through the SPA rewrite
- `console error` is clean

Record the URL, commit, and smoke result in `RFP/<feature>/results.md`.

## Mocking rules

- Mock at the backend boundary (`src/lib/backend.js`), not inside components. `vi.mock('../lib/backend')`
  keeps component tests independent of Firebase and localStorage.
- For helper tests, do not mock at all.
- Freeze time for relative dates:
  ```js
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  ```
  Restore with `vi.useRealTimers()` in `afterEach`.
- No network calls, no real Firebase project, no sleeps. If a test needs a delay, the code under test
  probably needs a deterministic seam. Mock at `src/lib/backend.js` rather than the Firebase SDK.

## Failure triage

1. Reproduce with the single test command and read the full assertion diff.
2. Decide which is wrong: the expectation, the test setup, or the implementation. Only the first two
   may be changed, and only with user approval when they touch an approved case.
3. Fix the smallest cause. Re-run the single test, then the full suite.
4. If two attempts fail, stop and report the root-cause hypothesis instead of trying random edits.
