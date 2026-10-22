# Test results — <Feature name>

Append-only execution log. Do not rewrite earlier runs. Never edit `test-cases.md` from this loop.

## Run <YYYY-MM-DD HH:mm>

- Branch: feature/<feature-name>
- Commit: <short sha>
- Command: `npx vitest run`
- Summary: <passed>/<total> passed
- Browser run: playwright-cli session `rfp-<feature>`, Chromium, http://localhost:5173

| Case   | Status  | Evidence                                  |
| ------ | ------- | ----------------------------------------- |
| TC-001 | pass    | `utils.test.js` 8 passed                  |
| TC-002 | fail    | expected role=alert, container empty      |
| TC-003 | blocked | dev server port 5173 already in use       |

## E2E browser run

- Skill loaded: playwright-cli
- Session: rfp-<feature>
- Browser: Chromium (system Chrome)
- URL: http://localhost:5173
- Console errors: <none / list>

### TC-003 — <title>

- Commands:
  - `playwright-cli -s=rfp-<feature> eval "<check>"`
- Observed: <exact output that proves the expectation>
- Status: pass

## Cycle log

### Cycle 1

- Target: TC-002
- Change: <one line about the code change>
- Command: `npx vitest run src/components/<Name>.test.jsx`
- Result: fail — <assertion diff summary>

### Cycle 2

- Target: TC-002
- Change: <one line>
- Command: `npx vitest run src/components/<Name>.test.jsx`
- Result: pass
- Full suite: `npx vitest run` — <passed>/<total>

## Final status

- Passed: <ids>
- Deferred: <ids and reason, only if the user approved deferral>
- Blocked: <ids and blocker>
- Build: `npm run build` — <result>
- Branch pushed: no
