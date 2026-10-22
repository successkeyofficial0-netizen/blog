# <Feature name>

- Status: draft
- Date: <YYYY-MM-DD>
- Branch: feature/<feature-name>
- Firebase project: bloging-4fc47
- Owner: <name>
- Approver: <name>

## Problem

What is broken, missing, or expensive today? Include the evidence or user report.

## Goal and success metric

What changes for the user, and how will we know it worked?

## Users and roles

Who uses this, and what are they allowed to do? Note guest, signed-in, and author/admin differences.

## Scope

### In scope

- <capability>

### Out of scope

- <explicit non-goal>

## UX and behavior

Describe the flow, copy, states, and transitions. Include loading, empty, error, and offline behavior.

## Data, storage, and deployment

- **Firestore:** collections, document paths, field shapes, defaults, validation, timestamps, and
  query or index needs.
- **Storage:** paths, allowed types, size limits, read access, and what happens to replaced files.
- **Rules:** required `firestore.rules` and `storage.rules` changes; default deny.
- **Deployment:** Firebase Hosting, project `bloging-4fc47`. Deploy after every test and the build
  pass when release is in scope; hosting only unless rules changes are approved.

## Auth and permissions

State the required session and the rules that enforce it. Note any `firestore.rules` change.

## Edge cases and error states

- <edge case> → <expected behavior>
- <failure> → <user-visible message>

## Accessibility and responsive behavior

Keyboard path, focus management, labels, contrast, and behavior at 390 px, tablet, and desktop.

## Constraints and dependencies

New packages, APIs, env vars, browser support, and anything that can block delivery.

## Assumptions

- **Assumption:** <what we are taking as true>

## Recommendations

- **Recommendation:** <improvement with rationale>

## Risks

- **Risk:** <risk> → <mitigation>

## Acceptance criteria

Each criterion must be observable and testable.

- [ ] **AC-1** — <observable behavior>
- [ ] **AC-2** — <observable behavior>
- [ ] **AC-3** — <observable behavior>

## Approval

- Approved by: <name>
- Approved on: <YYYY-MM-DD>
- Notes: <scope changes or conditions>
