---
name: RFP Feature Workflow
description: Run a feature end-to-end on the client-only React + Firebase stack (Hosting, Firestore, Storage): clarify and sharpen requirements, design test cases, get explicit approval, branch to feature/<name> with docs under RFP/<name>/, then implement autonomously until every approved test passes.
---

# RFP Feature Workflow

Use this for any new feature or behavior change in this repository. Work through the phases in
order. Phases 1–3 are conversation, phase 4 is git and documents, phase 5 is autonomous execution.

## Non-negotiables

- Read `references/coding-style.md` before writing any code or test, and match it.
- Build only with React and Firebase: Firebase Hosting for deployment, Firestore for data, Firebase
  Storage for files, all from the client. No custom server, serverless function, second database, or
  second storage provider.
- Never write production code before the Phase 3 approval.
- Never edit approved acceptance criteria, delete tests, skip tests, loosen assertions, or hardcode
  values to make a test pass.
- Deploy only after every approved test passes and `npm run build` succeeds, and only when the
  approved requirement includes release. The only deployment target is Firebase Hosting project
  `bloging-4fc47`.
- Never push, merge, rebase, force-push, or delete branches. Leave the branch local.
- Run every approved `e2e` case in a real browser through the `playwright-cli` skill. Never mark an
  E2E case green from code inspection or a component test.
- Never stash or discard the user's uncommitted work.
- Ask before destructive or irreversible actions.

## Repo facts (verify; they can change)

- Vite + React 18, plain JS/JSX (no TypeScript), Firebase optional with a localStorage demo backend.
- Entry `src/main.jsx`; providers are nested `ErrorBoundary > ThemeProvider > AuthProvider > ToastProvider`.
- Data access goes through `src/lib/backend.js`; user-facing errors go through `friendlyError()`.
- Demo credentials when Firebase env vars are absent: `demo@inkwell.blog` / `demo1234`.
- Deployment: Firebase Hosting serves `dist` with an SPA rewrite configured in `firebase.json`.
  The target project is `bloging-4fc47`; `.firebaserc` is local and gitignored, so select it with
  `firebase use bloging-4fc47` when it is missing.
- Data: Firestore only. Files: Firebase Storage only, bucket from `VITE_FIREBASE_STORAGE_BUCKET`.
  All access uses the Firebase web SDK from React; there is no server.
- `src/lib/firebase.js` initialises app, auth, and db. Export `getStorage(app)` from there when the
  first upload feature lands; do not create the bucket client elsewhere.
- Test stack: Vitest + React Testing Library for unit/component, `playwright-cli` for E2E.
  See `references/test-strategy.md`.

## Platform constraints

This project is a client-only React SPA on Firebase. Treat this list as a hard boundary; if a
requirement cannot be met within it, raise that in Phase 1 instead of adding infrastructure.

- **Deployment:** Firebase Hosting, project `bloging-4fc47`, from the Vite build in `dist`
  (`npm run build` then `firebase deploy --only hosting --project bloging-4fc47`). No SSR, no
  Next.js, no Express, no Cloud Functions, no containers, no other host.
- **Data:** Firestore is the only persistent store. No REST API layer, SQL database, or second NoSQL
  store. Reads and writes happen directly from React through `src/lib/backend.js`.
- **Files:** Firebase Storage is the only binary store. No S3, Cloudinary, or base64-in-Firestore
  workarounds. Store the download URL and the storage path with the Firestore document.
- **Identity:** Firebase Auth only. No custom auth server or third-party identity provider.
- **Security:** the client is untrusted. `firestore.rules` and `storage.rules` are the boundary.
  Never rely on hidden UI, `isDemo`, or client-side checks for authorization.
- **Secrets:** only public `VITE_FIREBASE_*` config reaches the browser. Never ship admin SDK
  credentials, service accounts, or private keys. Never add Admin SDK code to this repo.
- **Demo mode:** the localStorage backend is a development fallback for missing config, never the
  production data path. Do not build features that only work in demo mode.

## Phase 1 — Requirements: ask, discuss, enhance

1. Read the request, then skim `README.md`, the files most likely affected, and `git status --short`.
2. Ask before assuming. Cover: problem and success metric; users and roles; in scope; out of scope;
   UX and copy; Firestore document shape and paths; file uploads (types, size limits, storage paths,
   cleanup, who may read); auth and permissions; empty/loading/error/offline states; accessibility;
   responsive behavior; compatibility; security; deployment and hosting impact.
3. Ask 3–6 highest-value questions per round, then summarize the answers back. One round is usually
   not enough; continue until every answer is testable.
4. Enhance the request: point out gaps, edge cases, simpler alternatives, risks, and assumptions.
   Label them **Assumption**, **Recommendation**, or **Risk** so they are easy to accept or reject.
5. Draft `requirements.md` from `templates/requirements.md`. Number acceptance criteria `AC-1`,
   `AC-2`, … Each must be observable and testable.
6. Checkpoint: present the draft and ask whether the requirement is complete and correct. If not,
   revise. Do not continue while goals or scope are still open.

## Phase 2 — Test cases: discuss and design

1. Map every acceptance criterion to at least one case. No orphan criteria, no untraceable tests.
2. Cover the happy path, boundaries, invalid input, empty/loading/error/offline states, permissions,
   accessibility, and regression of touched behavior.
3. For each case record: id `TC-001`, linked AC, layer (`unit`, `component`, `e2e`), priority
   (`P0`, `P1`, `P2`), preconditions, steps, expected result, and evidence to capture.
4. Make cases deterministic and order-independent. E2E steps must be reproducible with
   `playwright-cli`, including the exact URL, locator or visible text, and expected observation.
5. Use `templates/test-cases.md`. Prefer fewer meaningful cases over volume.
6. Checkpoint: present the matrix, call out what is deliberately not covered, and ask whether
   coverage is right. Revise before asking for approval.

## Phase 3 — Approval: hard gate

Present, in one message:

- the final requirements (`AC-*`)
- the final test cases (`TC-*`)
- the files and areas expected to change
- any `firestore.rules`, `storage.rules`, `firebase.json`, or index change the feature needs
- any new dependency or setup command needed to run the tests
- the branch name and the RFP path

Then ask explicitly: “Approve requirements, test cases, and test setup?” Proceed only on an explicit
yes. Silence, approval of only one section, or a follow-up question is not approval. If the user
edits either document, re-present both and ask again. Record the approval in `requirements.md` under
`Approval`.

## Phase 4 — Branch and RFP folder

1. Run `git status --short`. If unrelated uncommitted changes exist, stop and ask how to handle them.
   Never stash or discard.
2. Choose `feature/<feature-name>` (lowercase kebab-case, 2–5 words) and `RFP/<feature-name>/`.
3. Create the branch from the base branch (`main`):
   `git switch -c feature/<feature-name> main`.
   If `main` does not exist, branch from the current `HEAD`. If the branch already exists, stop and
   ask.
4. Materialize the approved documents at `RFP/<feature-name>/requirements.md` and
   `RFP/<feature-name>/test-cases.md`. If drafts already exist on disk, move them (`git mv` or
   `Move-Item`); do not leave duplicate copies behind.
5. Fill the metadata: status `approved`, date, branch, approver.
6. Commit the documents before writing any code:
   `git add RFP/<feature-name>` then
   `git commit -m "docs(<feature-name>): add requirements and test cases"`.
7. Create `RFP/<feature-name>/results.md` from `templates/results.md`. It is a living log, not part
   of the approved specification.

## Phase 5 — Autonomous build until green

Announce that you are entering autonomous mode, then work without routine check-ins.

Loop, maximum 10 cycles:

1. Pick the highest-priority failing or unimplemented case (P0, then P1, then P2).
2. Write the smallest test that expresses it, following the existing test conventions.
3. Run it targeted, for example `npx vitest run src/lib/utils.test.js`.
4. Implement the minimal production change in the repo's style.
5. Re-run targeted tests until green. Run the full unit suite after shared-code changes.
6. For `e2e` cases: load the `playwright-cli` skill, start the dev server, launch the browser with
   `playwright-cli open`, execute every approved E2E case in the browser using snapshots and refs,
   record evidence for each case, then close the browser and stop the server. Component tests never
   substitute for an approved E2E case.
7. Commit coherent green increments: `feat(<feature>): …`, `fix(<feature>): …`,
   `test(<feature>): …`.
8. Append a result row to `results.md` with the command and the observed evidence.

Rules:

- A test is green only when you have seen it pass in this session. Never infer a pass.
- If the same failure survives two fix attempts, stop repeating and diagnose the root cause. If it is
  still blocked, stop and report.
- If a case is wrong or incomplete, stop and ask. Never “fix” a test to match the code. Only the user
  can change approved criteria.
- No `test.skip`, `it.only`, `describe.only`, loosened assertions, sleeps to hide races, or hardcoded
  outputs.
- Keep changes scoped to the feature. No drive-by refactors.
- Never add a server, Cloud Function, second database, or second storage service to make a case pass.
  If the requirement needs one, stop and report in Phase 1 terms.

Stop when one of these is true:

- every approved P0/P1 case passes, including E2E cases executed in the browser and recorded in
  `results.md`, P2 cases pass or are explicitly deferred, `npm run build` succeeds, and no console
  errors appeared during E2E;
- 10 cycles are exhausted;
- a genuine blocker appears (missing credentials, ambiguous behavior, a destructive change, an
  unavailable external service).

Final report:

- case-by-case result table (pass, fail, deferred)
- commits made and files touched
- residual risks and follow-ups
- explicit note that the branch remains local and unpushed; when Phase 6 ran, include the hosting URL
  and the deployed commit

## Phase 6 — Deploy to Firebase Hosting

Run this phase when the approved requirement includes release. The target is always Firebase
Hosting project `bloging-4fc47`.

1. Confirm tooling and access: `firebase --version`, `firebase login:list`, and that
   `bloging-4fc47` is reachable (`firebase projects:list`). If authentication is missing, stop and
   give the user the exact `firebase login` command. Do not guess credentials or use another project.
2. Re-run the full unit suite and `npm run build`. Never deploy from a red or stale tree.
3. Deploy hosting only:
   `firebase deploy --only hosting --project bloging-4fc47`.
   Do not deploy Firestore rules, Storage rules, indexes, or functions unless the approved
   requirement explicitly says so.
4. Verify the live site with `playwright-cli`: load the hosting URL, check the homepage renders 10
   posts and Sign up, open the browser console for errors, and load one deep link to prove the SPA
   rewrite works.
5. Record the deployment in `results.md`: date, commit, command, hosting URL, verification result.
6. Report the live URL and the deployed commit in the final summary. Keep the branch local and
   unpushed.

If the deploy fails (auth, permissions, quota), report the exact error and stop after two attempts.
Leave the green, built branch ready for a retry; do not switch to another host.

## Reference files

- `references/coding-style.md` — mandatory before writing code or tests
- `references/test-strategy.md` — setup, commands, E2E recipe
- `templates/requirements.md`, `templates/test-cases.md`, `templates/results.md`
