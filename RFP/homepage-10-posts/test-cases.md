# Test cases — Homepage: 10 latest posts + Sign up

Every acceptance criterion maps to at least one case. Cases are deterministic and independent.

## Index

| ID     | AC       | Layer     | Priority | Title                                  |
| ------ | -------- | --------- | -------- | -------------------------------------- |
| TC-001 | AC-5     | unit      | P1       | Demo seed integrity                    |
| TC-002 | AC-1     | component | P0       | Home renders 1 featured + 9 cards      |
| TC-003 | AC-1     | component | P1       | Featured and grid are newest first     |
| TC-004 | AC-6     | component | P1       | Nine posts render once, no padding     |
| TC-005 | AC-6     | component | P1       | Zero posts show the empty state        |
| TC-006 | AC-7     | component | P1       | Loading shows skeletons only           |
| TC-007 | AC-7     | component | P1       | Error shows the error panel            |
| TC-008 | AC-2     | component | P0       | Guest navbar shows Sign in + Sign up   |
| TC-009 | AC-3     | component | P1       | Signed-in navbar hides Sign up         |
| TC-010 | AC-8     | component | P1       | Sign up is keyboard reachable          |
| TC-011 | AC-1/AC-5 | e2e      | P0       | Browser: homepage shows 10 posts       |
| TC-012 | AC-2     | e2e      | P0       | Browser: Sign up opens register        |
| TC-013 | AC-4/AC-8 | e2e      | P1       | Browser: 390 px menu and overflow      |

## TC-001 — Demo seed integrity

- **AC:** AC-5
- **Layer:** unit
- **Priority:** P1
- **Preconditions:** none
- **Steps:**
  1. Import `DEMO_POSTS` from `src/lib/seed.js`.
  2. Filter `status === 'published'`.
  3. Check ids and slugs are unique and required fields exist.
- **Expected result:** exactly 10 published posts; each has `id`, `title`, `slug`, `excerpt`,
  `coverImage`, `category`, `tags`, `authorId`, `authorName`, `likes`, `likedBy`, `views`,
  `createdAt`, `updatedAt`, `content`; timestamps are numbers.
- **Evidence:** `npx vitest run src/lib/seed.test.js`

## TC-002 — Home renders 1 featured + 9 cards

- **AC:** AC-1
- **Layer:** component
- **Priority:** P0
- **Preconditions:** `usePosts` mocked with 10 published posts; `MemoryRouter`
- **Steps:**
  1. Render `<Home />`.
  2. Count `article.featured-card` and `article.post-card`.
  3. Collect unique `a[href^="/post/"]` values.
- **Expected result:** 1 featured, 9 cards, 10 unique post links.
- **Evidence:** the three counts from the rendered container.

## TC-003 — Featured and grid are newest first

- **AC:** AC-1
- **Layer:** component
- **Priority:** P1
- **Preconditions:** 10 posts with distinct `createdAt`
- **Steps:**
  1. Render `<Home />`.
  2. Read the featured title and each card title in DOM order.
- **Expected result:** featured = newest; cards = posts 2–10 in descending `createdAt` order.
- **Evidence:** title list assertion in `Home.test.jsx`.

## TC-004 — Nine posts render once, no padding

- **AC:** AC-6
- **Layer:** component
- **Priority:** P1
- **Preconditions:** `usePosts` returns 9 posts
- **Steps:**
  1. Render `<Home />`.
  2. Count featured, cards, and unique titles.
- **Expected result:** 1 featured + 8 cards; 9 unique titles; no duplicates.
- **Evidence:** counts and title set size.

## TC-005 — Zero posts show the empty state

- **AC:** AC-6
- **Layer:** component
- **Priority:** P1
- **Preconditions:** `usePosts` returns `[]`, `loading: false`
- **Steps:**
  1. Render `<Home />`.
- **Expected result:** "The first story is waiting" is visible; zero `.post-card` elements.
- **Evidence:** `screen.getByText` plus count.

## TC-006 — Loading shows skeletons only

- **AC:** AC-7
- **Layer:** component
- **Priority:** P1
- **Preconditions:** `usePosts` returns `{ posts: [], loading: true, error: null }`
- **Steps:**
  1. Render `<Home />`.
- **Expected result:** `.featured-skeleton` exists; zero `.post-card`; no empty state.
- **Evidence:** container query counts.

## TC-007 — Error shows the error panel

- **AC:** AC-7
- **Layer:** component
- **Priority:** P1
- **Preconditions:** `usePosts` returns `error: new Error('boom')`, `loading: false`
- **Steps:**
  1. Render `<Home />`.
- **Expected result:** "The stories could not be loaded" is visible; zero `.post-card`.
- **Evidence:** `screen.getByText` plus count.

## TC-008 — Guest navbar shows Sign in + Sign up

- **AC:** AC-2
- **Layer:** component
- **Priority:** P0
- **Preconditions:** auth mocked as signed out; `MemoryRouter`
- **Steps:**
  1. Render `<Navbar />`.
  2. Read the guest actions.
- **Expected result:** `Sign in` → `/login`; `Sign up` → `/register`; no `Start writing` link.
- **Evidence:** role/name and `href` assertions.

## TC-009 — Signed-in navbar hides Sign up

- **AC:** AC-3
- **Layer:** component
- **Priority:** P1
- **Preconditions:** auth mocked with a user
- **Steps:**
  1. Render `<Navbar />`.
  2. Open the user menu.
- **Expected result:** no `Sign up`; user menu shows Dashboard, Write a post, and Sign out.
- **Evidence:** query absence plus menu items.

## TC-010 — Sign up is keyboard reachable

- **AC:** AC-8
- **Layer:** component
- **Priority:** P1
- **Preconditions:** guest navbar rendered
- **Steps:**
  1. Tab until `Sign up` has focus.
  2. Press Enter.
- **Expected result:** focus reaches the link within 15 tabs; Enter renders the `/register` route.
- **Evidence:** `document.activeElement` and routed content assertion.

## TC-011 — Browser: homepage shows 10 posts

- **AC:** AC-1, AC-5
- **Layer:** e2e
- **Priority:** P0
- **Preconditions:** `playwright-cli` skill loaded; demo mode; dev server on 5173; session
  `rfp-homepage-10-posts`
- **Steps:**
  1. `playwright-cli -s=rfp-homepage-10-posts open http://localhost:5173`
  2. `eval "document.querySelectorAll('.post-card').length"`
  3. `eval "document.querySelectorAll('article.featured-card').length"`
  4. `eval "new Set([...document.querySelectorAll('a[href^=\"/post/\"]')].map(a => a.getAttribute('href'))).size"`
  5. `find "Latest stories"`
  6. `console error`
- **Expected result:** 9 cards; 1 featured; 10 unique post links; "Latest stories" present; no
  unexpected console errors. Featured title is the newest seed post.
- **Evidence:** the eval outputs and console output, recorded in `results.md`.

## TC-012 — Browser: Sign up opens register

- **AC:** AC-2
- **Layer:** e2e
- **Priority:** P0
- **Preconditions:** same session as TC-011, still on `/`
- **Steps:**
  1. `find "Sign up"` and click the returned ref.
  2. `eval "location.pathname"`
  3. `eval "document.querySelector('h1').textContent.trim()"`
  4. `console error`
- **Expected result:** pathname `/register`; heading "Create your account."; no unexpected console
  errors.
- **Evidence:** pathname and heading output.

## TC-013 — Browser: 390 px menu and overflow

- **AC:** AC-4, AC-8
- **Layer:** e2e
- **Priority:** P1
- **Preconditions:** same session; return to `/`
- **Steps:**
  1. `resize 390 844`, then `reload`.
  2. `find "Open menu"` and click the returned ref.
  3. `find "Sign up"` and click the returned ref.
  4. `eval "location.pathname"`
  5. `eval "document.documentElement.scrollWidth <= window.innerWidth"`
- **Expected result:** pathname `/register`; horizontal-overflow check `true`.
- **Evidence:** pathname and boolean output.

## Deliberately not covered

- Pixel-perfect visual comparison — no design baseline; CSS regression is not asserted.
- Real Firestore content or rules — production content is outside this feature.
- Browsers other than Chromium — the installed `playwright-cli` uses system Chrome.
- Pagination or load-more — explicitly out of scope.
- Signed-in E2E — covered at component level; the auth journey is unchanged.

## Traceability check

- [x] Every `AC-*` appears in the index at least once.
- [x] Every `TC-*` references an existing `AC-*`.
- [x] P0 cases cover the primary happy path and the most damaging failure.
