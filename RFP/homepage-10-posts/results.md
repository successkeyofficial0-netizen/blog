# Test results — Homepage: 10 latest posts + Sign up

Append-only execution log. Do not rewrite earlier runs.

## Run 2026-10-22

- Branch: feature/homepage-10-posts
- Commit: 990c6ee
- Command: `npx vitest run`
- Summary: 12/12 passed across 3 files
- Build: `npm run build` — passed (96 modules, 3.29 s)
- Browser run: playwright-cli session `rfp-homepage-10-posts`, Chromium, http://localhost:5173

| Case   | Status | Evidence |
| ------ | ------ | -------- |
| TC-001 | pass   | 10 published posts, unique ids/slugs, fields present |
| TC-002 | pass   | 1 featured + 9 cards, 10 unique post links |
| TC-003 | pass   | featured + card titles in descending `createdAt` order |
| TC-004 | pass   | 9 posts → 1 featured + 8 cards, no duplicates |
| TC-005 | pass   | empty state "The first story is waiting", 0 cards |
| TC-006 | pass   | `.featured-skeleton` shown, 0 cards |
| TC-007 | pass   | "The stories could not be loaded", 0 cards |
| TC-008 | pass   | Sign in → /login, Sign up → /register, no Start writing |
| TC-009 | pass   | no Sign up, user menu items present |
| TC-010 | pass   | Tab reached Sign up, Enter rendered /register |
| TC-011 | pass   | see E2E log below |
| TC-012 | pass   | see E2E log below |
| TC-013 | pass   | see E2E log below |
| TC-014 | pass   | deployed smoke test: 9 cards, featured, Sign up, /explore, 0 errors |

## E2E browser run

- Skill loaded: playwright-cli
- Session: rfp-homepage-10-posts
- Browser: Chromium (system Chrome)
- URL: http://localhost:5173
- Console errors: 0 (2 React Router future-flag warnings, unrelated)

### TC-011 — homepage shows 10 posts

- Commands:
  - `playwright-cli -s=rfp-homepage-10-posts open http://localhost:5173`
  - `eval "document.querySelectorAll('.post-card').length"` → `9`
  - `eval "document.querySelectorAll('article.featured-card').length"` → `1`
  - unique `href` values starting `/post/` → `10`
  - `find "Latest stories"` → 1 match
  - featured heading → `"A weekend with Firebase Hosting"` (newest seed post)
- Console errors: none
- Status: pass

### TC-012 — Sign up opens register

- Commands:
  - `find "Sign up"` → link ref `e36`
  - `click e36`
  - `eval "location.pathname"` → `"/register"`
  - `eval "document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim()"` →
    `"Create your account."`
- Console errors: none
- Status: pass

### TC-013 — 390 px menu and overflow

- Commands:
  - `resize 390 844` then `goto http://localhost:5173`
  - `eval "document.documentElement.scrollWidth <= window.innerWidth"` → `true`
  - `find "Open menu"` → ref `f1e26`, clicked
  - `find "Sign up"` → ref `f1e42`, clicked
  - `eval "location.pathname"` → `"/register"`
  - `eval "document.documentElement.scrollWidth <= window.innerWidth"` → `true`
- Console errors: none
- Status: pass

## Cycle log

### Cycle 1

- Target: TC-001, TC-002, TC-003, TC-004, TC-008, TC-010
- Change: tests written first against the current UI
- Command: `npx vitest run`
- Result: red — 6 failed, 6 passed (seed 5/10, Home 6 cards, no Sign up)

### Cycle 2

- Target: all component/unit cases
- Change: `slice(1, 10)`, guest Sign up, mobile copy, five new seed posts
- Command: `npx vitest run`
- Result: pass — 12/12 in 3.00 s
- Build: `npm run build` — pass

### Cycle 3

- Target: TC-011, TC-012, TC-013
- Change: none (verification only)
- Commands: playwright-cli session `rfp-homepage-10-posts`
- Result: pass — counts, navigation, mobile menu, and overflow verified; console clean

## Deployment

- Date: 2026-10-22 11:03
- Commit: 990c6ee (feature), deployed tree 669582b
- Command: `firebase deploy --only hosting --project bloging-4fc47`
- URL: https://bloging-4fc47.web.app
- Verification (TC-014):
  - homepage: 9 `.post-card` + 1 featured
  - header: `Sign up` → `/register`
  - deep link: `https://bloging-4fc47.web.app/explore` loads `/explore`
  - console errors: 0
- Result: success (13 files uploaded, release complete)
- Mode: demo backend (no `VITE_FIREBASE_*` at build time); no rules, indexes, or Storage deployed

## Merge

- Date: 2026-10-22 11:06
- Target: main
- Command: `git merge --ff-only feature/homepage-10-posts`
- Main HEAD: e306dd7
- Post-merge tests: `npm test` 12/12 passed; `npm run build` passed
- Pushed: no

## Publish

- Remote: https://github.com/successkeyofficial0-netizen/blog.git (`origin`)
- Branch: main
- Command: `git push -u origin main`
- Pushed commit: 57a68a5
- Verification: `origin/main` == local `HEAD`; no ahead/behind
- Result: success

## Final status

- Passed: TC-001 to TC-014
- Deferred: none
- Blocked: none
- Build: `npm run build` passed
- Branch pushed: yes — `origin/main` at 57a68a5
- Deployment: https://bloging-4fc47.web.app
- Merged to main: yes (e306dd7)
