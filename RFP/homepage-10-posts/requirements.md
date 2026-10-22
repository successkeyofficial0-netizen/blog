# Homepage: 10 latest posts + Sign up

- Status: approved
- Date: 2026-10-22
- Branch: feature/homepage-10-posts
- Firebase project: bloging-4fc47
- Owner: project owner
- Approver: project owner (chat approval, 2026-10-22)

## Problem

The homepage currently renders a featured story plus 6 latest cards (7 visible posts maximum), and the
desktop navbar has no Sign up action. A guest can only find registration on `/register` or inside the
mobile menu.

## Goal and success metric

A guest landing on `/` sees 10 published blog posts and an obvious Sign up action in the site header.
Success: one featured story plus nine cards, and a working Sign up link on desktop and mobile.

## Users and roles

- Guest: primary audience; sees posts, Sign in, Sign up.
- Signed-in user: sees the existing user menu and no Sign up.
- Mobile guest: reaches Sign up from the mobile menu.

## Scope

### In scope

- `src/pages/Home.jsx`: featured + next 9 published posts.
- `src/components/Navbar.jsx`: guest Sign up action, mobile copy.
- `src/lib/seed.js`: five additional published demo posts.
- Component, unit, and E2E tests for the above.

### Out of scope

- Visual redesign, new routes, pagination or "load more".
- Real content migration or production data changes.
- Auth logic changes, Firestore rules, Storage, deployment.

## UX and behavior

- Homepage keeps the hero, topics, and CTA sections.
- Featured = newest published post by `createdAt`; the grid shows the next 9 in descending order.
- 1–9 posts: show all available once, with no padding or duplicates.
- 0 posts: existing `EmptyState` ("The first story is waiting").
- Loading and error states keep their current behavior.
- Desktop, logged out: `Sign in` (ghost) + `Sign up` (primary) linking to `/register`. No
  `Start writing` for guests.
- Desktop, logged in: unchanged user menu; no Sign up.
- Mobile menu, logged out: `Sign up` (renamed from "Create an account") linking to `/register`.

## Data, storage, and deployment

- **Firestore:** the existing `posts` collection and document shape are unchanged. No new fields,
  indexes, or rules.
- **Storage:** not used by this feature.
- **Seed:** `src/lib/seed.js` grows to 10 published posts; the existing draft stays.
- **Deployment:** no `firebase.json` change. Deployment is out of scope and requires a separate
  request.

## Auth and permissions

No change. `/register` and the existing auth flow remain the only sign-up path. Authorization is not
affected.

## Edge cases and error states

- Fewer than 10 published posts: render all available, once.
- One post: it is featured; the latest grid shows the existing compact empty state.
- Zero posts: full empty state, no cards.
- Demo data: only used when Firebase env vars are absent; production reads Firestore.

## Accessibility and responsive behavior

- Sign up is a real link with an accessible name, reachable by keyboard, with the existing focus style.
- The 10-post grid uses the existing responsive CSS; no horizontal overflow at 390 px.
- Post links keep their accessible labels.

## Constraints and dependencies

- Client-only React + Firebase; no server or new service.
- New dev dependencies are limited to the test stack (Vitest, RTL, jsdom).
- Existing cover SVGs are reused; no new image assets.

## Assumptions

- **Assumption:** "newest" means `createdAt` descending, matching current behavior.
- **Assumption:** 10 is a homepage maximum, not a pagination feature.
- **Assumption:** the six existing cover SVGs can be reused across 10 posts.

## Recommendations

- **Recommendation:** unify guest copy to "Sign up" on desktop and mobile.
- **Recommendation:** remove the guest "Start writing" action, since writing already requires auth.

## Risks

- **Risk:** demo counts change on Explore and Dashboard → expected; tests assert the new total.
- **Risk:** test tooling is not installed → added as dev dependencies in this branch.

## Acceptance criteria

- [ ] **AC-1** — Guest on `/` sees exactly 10 published posts: 1 featured + 9 grid, newest first.
- [ ] **AC-2** — Desktop header, logged out: `Sign in` + `Sign up`; no `Start writing`; Sign up
      navigates to `/register`.
- [ ] **AC-3** — Desktop header, logged in: no `Sign up`; the existing user menu works unchanged.
- [ ] **AC-4** — Mobile menu, logged out: `Sign up` navigates to `/register`.
- [ ] **AC-5** — Demo seed contains 10 published posts and the page still loads through
      `usePosts`/`postsApi`; no hardcoded posts in the page.
- [ ] **AC-6** — With 1–9 posts, all are shown once; with 0, the empty state appears; no padding or
      duplicates.
- [ ] **AC-7** — Loading skeletons and the error panel still behave as today.
- [ ] **AC-8** — Sign up is keyboard-reachable with visible focus; the 10-card grid has no horizontal
      overflow at 390 px.

## Approval

- Approved by: project owner
- Approved on: 2026-10-22
- Notes: approved via chat after requirements, test coverage, and setup review. Branch local only;
  nothing pushed or deployed.
