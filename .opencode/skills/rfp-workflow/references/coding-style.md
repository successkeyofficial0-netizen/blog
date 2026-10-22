# Coding style — Inkwell

Inferred from the existing codebase. Treat it as the default. If code and this guide disagree, follow
the closest existing pattern and note the discrepancy rather than reformatting unrelated files.

## Formatting

- Plain JavaScript and JSX. No TypeScript, no CSS-in-JS, no CSS framework.
- Two-space indentation. No tabs.
- No semicolons.
- Single quotes for strings and imports. Template literals only for interpolation.
- Trailing commas in multiline object, array, argument, and parameter lists.
- Always parenthesize arrow parameters, including single ones: `(event) =>`, `(post) =>`.
- Break long prop lists and argument lists one item per line; keep short JSX on one line.
- One blank line between logical blocks. No blank lines inside small JSX blocks.

## Files and symbols

- Components and pages are `PascalCase.jsx`; the file name matches the default export.
  `PostCard.jsx` exports `export default function PostCard(...)`.
- Hooks live in `src/hooks/` as `useThing.js`.
- Contexts live in `src/contexts/` as `ThingContext.jsx` and export `ThingProvider` plus `useThing`.
- Pure helpers live in `src/lib/*.js` and use named exports.
- Module-level constants are `UPPER_SNAKE_CASE` (`CATEGORIES`, `PAGE_SIZE`, `DEMO_COVER`).
- Booleans read as predicates: `isDemo`, `loading`, `compact`, `firebaseEnabled`.
- Event handlers are `handleX`; callback props are `onX`.
- Tests are co-located: `src/lib/utils.test.js`, `src/components/PostCard.test.jsx`.

## Imports

One contiguous block, ordered external packages first, then local components, hooks, and lib modules.
Use default imports for components and named imports for everything else.

```jsx
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { usePosts } from '../hooks/usePosts'
import { CATEGORIES } from '../lib/constants'
import { compactNumber, formatDate } from '../lib/utils'
```

Do not add unused imports. Do not introduce path aliases; relative paths are the convention.

## Components

- Destructure props in the signature and give defaults there:
  `function EmptyState({ icon = 'book', title, description, action, compact = false })`.
- One component per file. Extract a new component when JSX grows or is reused.
- Prefer early returns and ternaries over nested conditionals in JSX.
- Build class names with `cls()` from `src/lib/utils.js`:
  `<article className={cls('post-card', 'reveal')}>`.
  A single conditional may use a template literal: `` `empty-state${compact ? ' is-compact' : ''}` ``.
- CSS class names are kebab-case and describe structure or state: `post-card-meta`, `is-compact`,
  `badge-draft`. Never style by test id.
- Avoid inline styles. The existing exception is computed animation delay:
  `style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}`.
- Accessibility is part of done:
  - every icon-only control has `aria-label`
  - decorative elements use `aria-hidden="true"` or `alt=""`
  - decorative icons inside labeled links stay hidden from assistive tech
  - toasts use `role="status"` with `aria-live="polite"`
  - forms use `aria-label` or a visible `<label>`
  - keyboard interaction is preserved on custom interactive elements
- User-facing copy is sentence case and concise. Match the existing punctuation style (`—`, `…`).
- Loading, empty, and error states are explicit. Use `SkeletonGrid`/`featured-skeleton`,
  `EmptyState`, and `ErrorPanel` rather than inventing new patterns.

## State, effects, and contexts

- Keep state local until a second consumer needs it; then lift it or use a context.
- Derive values with `useMemo` instead of syncing state in effects.
- Wrap context API functions in `useCallback` and the exposed object in `useMemo`.
- Effects clean up timers and listeners:
  ```js
  useEffect(() => {
    const active = timers.current
    return () => {
      active.forEach((timer) => clearTimeout(timer))
      active.clear()
    }
  }, [])
  ```
- Guard browser-only APIs with `typeof window !== 'undefined'`.
- Context hooks throw a descriptive error when the provider is missing:
  `if (!context) throw new Error('useToast must be used inside <ToastProvider>')`.

## Firebase data, storage, and errors

- The app is client-only. Components and pages never import the Firebase SDK directly; go through
  `src/lib/backend.js`, which selects the Firebase or demo implementation at module load.
- Firestore is the only database and Firebase Storage is the only file store. There is no REST API,
  server, or Cloud Function. Project id: `bloging-4fc47`.
- Firestore:
  - keep documents flat and serialisable; `serverTimestamp()` for writes where the server clock
    matters, millisecond numbers in the UI
  - use `onSnapshot` for live views and always return its unsubscribe function from the effect
  - use a batch or transaction when one action writes several documents
  - define collection and path names in `src/lib/constants.js` once they are used in more than one file
- Storage:
  - export `storage = getStorage(app)` from `src/lib/firebase.js`; never construct a second storage
    client elsewhere
  - upload with `uploadBytesResumable`, then read `getDownloadURL`
  - store `{ url, path, contentType, bytes }` on the Firestore document; the `path` is required so the
    object can be replaced or deleted later
  - validate `file.type` and `file.size` before uploading, and enforce the same limits in
    `storage.rules`
  - delete the previous object when replacing a file; never leave orphaned blobs
  - never base64-encode files into Firestore
- Normalize inputs with defaults in the signature (`= ''`, `= []`, `= 0`) and guard clauses at the
  top of the function.
- Return early. Avoid deeply nested `if` trees.
- Pure helpers stay pure and live in `src/lib/utils.js`.
- User-facing errors go through `friendlyError(error)`; do not surface raw provider messages.
- `console.error` is reserved for developer diagnostics, not user feedback.
- Async functions either handle their failure or propagate it deliberately; do not leave floating
  promises in event handlers.

## Security rules

- Every new collection, document path, or storage prefix needs a matching rule. Default deny.
- Rules enforce authentication and ownership, not the UI. Test them against the emulators, never
  against project `bloging-4fc47`.
- `firestore.rules`: validate required fields and types, and require `request.auth.uid` to own writes.
- `storage.rules`: restrict size and `contentType`, and require paths to start with the owner's uid or
  an approved public prefix.
- Never widen or disable a rule to make a test pass. A rules change belongs in the plan and in the
  Phase 3 approval.

## Deployment

- Deploy only when the user explicitly asks. `npm run deploy` builds and then runs `firebase deploy`.
  Without a local `.firebaserc`, pass the project: `firebase deploy --only hosting --project
  bloging-4fc47`.
- Hosting target: project `bloging-4fc47`, `public: "dist"`, SPA rewrite to `/index.html`.
- Environment values are baked in at build time. Only public `VITE_*` values belong in the bundle;
  never ship admin credentials or service accounts, and never commit `.env.local`.
- Add a `storage` block to `firebase.json` and a `storage.rules` file the first time uploads ship.
- Do not add Cloud Functions, an API rewrite, or a second hosting target.

## Comments and documentation

- One-line JSDoc above a module or a non-obvious helper:
  `/** Builds a plain-text summary from markdown. */`
- Comments explain why, not what. Keep them sparse.
- No commented-out code. No `TODO` without an owner or issue reference.
- Update `README.md` when behavior, scripts, setup, or deployment changes.

## Test style

- Import Vitest explicitly: `import { describe, expect, it, vi } from 'vitest'`.
- Use React Testing Library with accessible queries: `getByRole`, `getByLabelText`, `findByText`.
  Do not assert on CSS classes or component internals.
- Name tests as observable behavior:
  `it('shows an error when the email is invalid')`.
- Arrange–Act–Assert. No comment headings inside a test.
- Keep tests deterministic: fake timers for relative dates, mock at the `src/lib/backend.js` boundary,
  never call the network.
- One behavior per test. Share fixtures through `src/test/`, not copy-paste.
- A bug fix starts with a failing test that reproduces it.

## Things not to introduce without approval

- TypeScript, a CSS framework, a state-management library, or a second test runner.
- Any backend: Express, Next.js, Cloud Functions, a REST proxy, or a serverless function.
- Any second data store or file host: SQL, Supabase, MongoDB, S3, Cloudinary, or base64 blobs in
  Firestore.
- A second identity provider or a custom auth server.
- New global CSS files; extend the existing `src/styles/base.css` and `src/styles/app.css`.
- Path aliases, barrel files, or a different folder structure.
- Automatic formatting of untouched files.
