# Test cases — <Feature name>

Every acceptance criterion in `requirements.md` maps to at least one case below. Cases are
deterministic, independent, and runnable in any order.

## Index

| ID     | AC   | Layer     | Priority | Title                          |
| ------ | ---- | --------- | -------- | ------------------------------ |
| TC-001 | AC-1 | unit      | P0       | <short title>                  |
| TC-002 | AC-2 | component | P0       | <short title>                  |
| TC-003 | AC-3 | e2e       | P1       | <short title>                  |

## TC-001 — <title>

- **AC:** AC-1
- **Layer:** unit
- **Priority:** P0
- **Preconditions:** <state needed before the test>
- **Steps:**
  1. <step>
  2. <step>
- **Expected result:** <exact observable outcome>
- **Evidence to capture:** <command and the output that proves it>

## TC-002 — <title>

- **AC:** AC-2
- **Layer:** component
- **Priority:** P0
- **Preconditions:** providers rendered through `renderWithProviders`; backend mocked
- **Steps:**
  1. <step>
  2. <step>
- **Expected result:** <exact observable outcome>
- **Evidence to capture:** <assertion name and failure output on red>

## TC-003 — <title>

- **AC:** AC-3
- **Layer:** e2e
- **Priority:** P1
- **Preconditions:** `playwright-cli` skill loaded; demo mode or Firebase Emulator Suite (never
  project `bloging-4fc47`); `npm run dev -- --port 5173 --strictPort`; data reset; session
  `rfp-<feature>`
- **Steps:**
  1. `playwright-cli -s=rfp-<feature> open http://localhost:5173/<route>`
  2. `playwright-cli -s=rfp-<feature> snapshot` and note refs
  3. `playwright-cli -s=rfp-<feature> click <ref>`
  4. `playwright-cli -s=rfp-<feature> find "<expected text>"`
- **Expected result:** <exact text, URL, or DOM state>
- **Evidence to capture:** the `find` output plus `console error` result

## Deliberately not covered

- <behavior> — reason: <cost, out of scope, covered elsewhere>

## Traceability check

- [ ] Every `AC-*` appears in the index at least once.
- [ ] Every `TC-*` references an existing `AC-*`.
- [ ] P0 cases cover the primary happy path and the most damaging failure.
