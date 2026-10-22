# Inkwell

A modern, responsive publishing app built with **React + Vite**, **Firebase Authentication**, **Cloud Firestore** in realtime, and an in-app bilingual deployment guide. Write in Markdown, preview as you type, publish in one click, and deploy to Firebase Hosting with GitHub Actions.

> **Demo mode included.** If no Firebase keys are configured, the app runs immediately against a local sample backend, so you can explore every screen before creating a project.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Part 1 — Firebase setup (step by step)](#part-1--firebase-setup-step-by-step)
- [Part 2 — Deploy manually](#part-2--deploy-manually)
- [Part 3 — GitHub + automatic deploys](#part-3--github--automatic-deploys)
- [Firestore data model](#firestore-data-model)
- [Security rules](#security-rules)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Firebase Authentication** — email/password sign-up, sign-in, sign-out, password reset, persistent sessions and friendly error messages.
- **Realtime Firestore CRUD** — create, read, update and delete posts with `onSnapshot` listeners. Changes appear instantly in every open tab.
- **Markdown editor** — write/split/preview modes, formatting toolbar, word count, reading time and a live sanitized preview.
- **Drafts & publishing** — drafts are readable only by their author; publishing makes a story public immediately.
- **Public reading experience** — featured story, latest stories, topic browsing, related posts, reading progress, share link, views and likes.
- **Search & filtering** — full-text client search, category chips, tag filters, sorting and incremental “load more”.
- **Personal dashboard** — totals, published/draft counts, reads, likes, search, sorting and delete confirmation.
- **Authorisation-aware UI** — protected routes, owner-only editing and a clean signed-out experience.
- **Themes** — warm paper light theme and a deep green dark theme, remembered in `localStorage`.
- **Responsive by design** — tested layouts for desktop, tablet and 390 px phones.
- **Accessibility** — keyboard navigation, focus states, skip link, ARIA labels, focus-trapped modals, reduced-motion support.
- **Bilingual Firebase guide** — a complete English + हिंदी walkthrough inside the app at `/guide`, with progress tracking and copyable commands.
- **GitHub Actions** — CI build and automated Firebase Hosting + Firestore rules deployment.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 18, React Router 6 |
| Build | Vite 5 |
| Auth | Firebase Authentication (Email/Password) |
| Data | Cloud Firestore (realtime listeners) |
| Markdown | `marked` + `dompurify` |
| Styling | Hand-written CSS design system (no UI framework) |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |

---

## Quick start

### 1. Requirements

- Node.js **18+** (20 LTS recommended)
- npm 9+
- A Google account for Firebase (free Spark plan is enough)

### 2. Run the demo

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

Because `.env.local` does not exist yet, the app starts in **demo mode**:

- Demo account: `demo@inkwell.blog` / `demo1234`
- Data is stored in your browser’s `localStorage`.
- Every feature works — auth, CRUD, drafts, likes, search, dashboard and editor.
- The demo data can be reset from the browser console with:

```js
localStorage.clear()
location.reload()
```

Demo mode is a convenience for exploring the UI. It is **not** a security boundary.

---

## Project structure

```text
blog_website/
├── .github/workflows/
│   ├── ci.yml                         # build check on every push / PR
│   └── firebase-hosting-merge.yml     # deploy Hosting + Firestore rules on main
├── public/
│   ├── covers/cover-1.svg … cover-6.svg
│   └── favicon.svg
├── src/
│   ├── components/                    # Navbar, PostCard, Editor, Modal, …
│   ├── content/guide.js               # bilingual deployment guide content
│   ├── contexts/                      # Auth, Theme, Toast providers
│   ├── hooks/                         # usePosts, usePost, debounce, title
│   ├── lib/
│   │   ├── backend.js                 # chooses Firebase or demo backend
│   │   ├── firebase.js                # initialises Firebase from env vars
│   │   ├── firebaseBackend.js         # Auth + Firestore operations
│   │   ├── demoBackend.js             # localStorage demo implementation
│   │   ├── markdown.js                # Markdown → sanitized HTML
│   │   ├── constants.js
│   │   ├── seed.js
│   │   └── utils.js
│   ├── pages/                         # Home, Explore, PostDetail, Dashboard, …
│   ├── styles/
│   │   ├── base.css                   # tokens, reset, shared primitives
│   │   └── app.css                    # layout, pages, responsive rules
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .firebaserc.example
├── firebase.json                      # Hosting SPA rewrite + cache headers
├── firestore.rules                    # production security rules
├── firestore.indexes.json
└── package.json
```

---

# Part 1 — Firebase setup (step by step)

## Step 1. Create a Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Choose **Add project**.
3. Name it, for example **inkwell-blog**. The project ID must be globally unique and cannot be renamed later.
4. Google Analytics is optional — you can disable it for this app.
5. Choose **Create project**.

## Step 2. Register the web app

1. In the project, open **Project settings** (gear icon) → **General** → **Your apps**.
2. Choose the **Web** platform (`</>`).
3. Give it a nickname such as `inkwell-web`.
4. Leave **Also set up Firebase Hosting** unchecked for now.
5. Choose **Register app**.
6. Keep the `firebaseConfig` object visible — you will copy its values in Step 4.

```js
const firebaseConfig = {
  apiKey: 'AIzaSy...',
  authDomain: 'inkwell-blog.firebaseapp.com',
  projectId: 'inkwell-blog',
  storageBucket: 'inkwell-blog.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abc123def456',
}
```

> The Firebase **web API key is not a password**. It is designed to be public. Your data is protected by Authentication and Firestore security rules. Never commit a service-account JSON file.

## Step 3. Enable Email/Password authentication

1. Open **Build → Authentication**.
2. Choose **Get started**.
3. Under **Sign-in method**, enable **Email/Password**.
4. Leave **Email link (passwordless)** disabled.
5. Save.

`localhost` is authorised automatically. After deploying, add your production domain under **Authentication → Settings → Authorized domains** if you use a custom domain.

## Step 4. Connect the app with `.env.local`

Create `.env.local` in the project root.

macOS / Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the values from `firebaseConfig`:

```dotenv
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=inkwell-blog.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inkwell-blog
VITE_FIREBASE_STORAGE_BUCKET=inkwell-blog.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

| firebaseConfig | .env.local |
| --- | --- |
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

Restart the dev server:

```bash
npm run dev
```

The footer should now say **Connected to Firebase**, and the demo bar disappears. The app detects Firebase when `apiKey`, `projectId` and `appId` are present.

## Step 5. Create the Firestore database

1. Open **Build → Firestore Database**.
2. Choose **Create database**.
3. Choose a location close to your readers. **This cannot be changed later.**
4. Start in **Production mode** — the rules in this repository replace the defaults.
5. Choose **Create**.

The app uses a single `posts` collection. No manual collections or indexes are required: the two queries (`status == 'published'` and `authorId == <uid>`) use automatic single-field indexes.

## Step 6. Deploy the security rules

Install the Firebase CLI once:

```bash
npm install -g firebase-tools
firebase login
```

Select the project (this creates `.firebaserc`):

```bash
firebase use --add
```

Choose your project and an alias such as `default`.

Deploy the rules:

```bash
firebase deploy --only firestore:rules
```

The full rules live in [`firestore.rules`](./firestore.rules). They enforce:

- Anyone can read **published** posts; drafts are readable only by their author.
- Only a signed-in user can create a post, and `authorId` must match their UID.
- Only the author can update story fields or delete a post.
- Signed-in readers may only toggle their own like.
- Anyone may increment `views` by exactly one on a published post.
- All other paths are denied.

> **Rules are not filters.** A query must only return documents the rules allow. The app queries published posts publicly and own posts by `authorId`, which satisfies these rules.

## Step 7. Run and test

```bash
npm run dev
```

1. Create an account at `/register`.
2. Write a story at `/write`.
3. Use **Save draft** — it appears only in your dashboard.
4. Use **Publish** — the story becomes public at `/post/<id>`.
5. Open a second browser tab. Saving in one tab updates the other instantly.
6. Like the story, check the counter, and refresh.
7. Open a private window. Published stories load; draft URLs are blocked.
8. Check **Firestore → Data** — the document updates as you type/save.

### Optional: Firebase Emulator Suite

The project includes emulator configuration and an opt-in switch.

1. Install Java 11+ (required by the Firestore emulator).
2. Set `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local`.
3. Run:

```bash
npm run emulators
npm run dev
```

Auth runs on `127.0.0.1:9099`, Firestore on `127.0.0.1:8080`, and the Emulator UI on `http://127.0.0.1:4000`.

---

# Part 2 — Deploy manually

## Step 8. Build the app

```bash
npm run build
npm run preview
```

The production bundle is written to `dist/`. Vite bakes environment variables in at build time — **rebuild after changing `.env.local`**.

## Step 9. Configure Hosting

The repository already contains the production-ready [`firebase.json`](./firebase.json):

- `public: "dist"`
- SPA rewrite `** → /index.html` (deep links such as `/post/abc` work on refresh)
- Long-lived caching for hashed assets, no-cache for `index.html`
- Firestore rules and indexes paths
- Emulator ports

You do **not** need to run `firebase init hosting`. If you do, answer:

- Public directory: `dist`
- Single-page app rewrite: **Yes**
- Set up automatic deploys with GitHub: **No** (configured manually in Part 3)
- Overwrite `dist/index.html`: **No**
- Overwrite `firebase.json`: **No**

## Step 10. Deploy

```bash
npm run deploy
```

or:

```bash
npm run build
firebase deploy
```

Firebase prints a URL like `https://inkwell-blog.web.app`.

Useful variants:

```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase hosting:channel:deploy preview
firebase hosting:rollback
```

### After the first deploy

1. Open the live URL and create a real account.
2. Publish a story and refresh a deep link.
3. Optionally add a custom domain in **Hosting → Add custom domain**.
4. Add that domain under **Authentication → Settings → Authorized domains**.
5. If sign-in fails with `auth/unauthorized-domain`, the domain is missing from that list.

---

# Part 3 — GitHub + automatic deploys

GitHub stores the source and runs CI/CD. **Firebase Hosting serves the site** — this keeps SPA rewrites and Firestore rules deployment working. Do not use GitHub Pages for this app unless you add an SPA fallback, because deep links would 404 and `firebase deploy` would not run.

## Step 11. Push the project to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Inkwell blog"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `dist`, `.env.local`, `.firebaserc` and Firebase debug logs. **Never commit `.env.local` or service-account keys.**

## Step 12. Create a service account for GitHub Actions

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and select your Firebase project.
2. Go to **IAM & Admin → Service Accounts → Create service account**.
3. Name it `github-actions-deploy`.
4. Grant these roles (least privilege for this repo):
   - **Firebase Hosting Admin**
   - **Firebase Rules Admin** (for `firestore.rules`)
   - **Cloud Datastore User** (read access used by the CLI)
5. Create the account, open it, go to **Keys → Add key → Create new key → JSON**.
6. Download the JSON file. Treat it like a password.

> If your organisation restricts role grants, the broader **Firebase Admin** role also works.

## Step 13. Add GitHub secrets and variables

In your repository: **Settings → Secrets and variables → Actions**.

Add these **secrets**:

| Secret | Value |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | The entire contents of the service-account JSON file |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | Web app ID |

Add one **variable**:

| Variable | Value |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID (for example `inkwell-blog`) |

The workflow reads these values at build time. They are public in the client bundle by design; the service-account secret is what actually authorises deployment.

## Step 14. Enable the workflows

Two workflows are included:

- **`.github/workflows/ci.yml`** — installs dependencies and runs `npm run build` on every push and pull request. No secrets required; it builds in demo mode.
- **`.github/workflows/firebase-hosting-merge.yml`** — on every push to `main` (or manual dispatch):
  1. installs dependencies,
  2. builds with your `VITE_*` secrets,
  3. authenticates with the service account,
  4. deploys **Hosting + Firestore rules**.
- **`.github/workflows/firebase-hosting-pull-request.yml`** — deploys a temporary preview channel for pull requests from this repository and comments the URL on the PR. Fork PRs are skipped because they do not receive repository secrets.

Commit and push them:

```bash
git add .github
git commit -m "ci: deploy to Firebase Hosting"
git push
```

Watch the run under the **Actions** tab. The first deployment usually finishes in under two minutes.

## Step 15. Verify the live site

1. Open the Hosting URL from the workflow log or Firebase Console.
2. Sign up, publish a post and refresh the deep link.
3. Confirm `firestore.rules` is live: in a private window, a draft URL must be blocked.
4. Add any custom domain to **Authentication → Settings → Authorized domains**.

### Manual deploy vs. GitHub Actions

| | Manual | GitHub Actions |
| --- | --- | --- |
| Command | `npm run deploy` | Push to `main` |
| Credentials | Your Firebase CLI login | `FIREBASE_SERVICE_ACCOUNT` secret |
| Firestore rules | Included | Included |
| Best for | First setup, hotfixes | Continuous deployment |

---

## Firestore data model

Collection: `posts`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | 4–120 characters in the editor |
| `slug` | string | Generated from the title |
| `excerpt` | string | Optional; generated from the content when empty |
| `content` | string | Markdown source |
| `coverImage` | string | Absolute URL or `/covers/cover-N.svg` |
| `category` | string | Engineering, Design, Product, Career, Life, Tutorial |
| `tags` | array<string> | Up to 8 tags |
| `status` | string | `draft` or `published` |
| `authorId` | string | Firebase Auth UID (immutable) |
| `authorName` | string | Display name at publish time |
| `likes` | number | Denormalised like counter |
| `likedBy` | array<string> | UIDs that liked the post |
| `views` | number | Incremented once per browser session |
| `createdAt` | timestamp | Firestore server timestamp |
| `updatedAt` | timestamp | Firestore server timestamp |

All timestamps are normalised to milliseconds in the UI layer.

---

## Security rules

The complete rules are in [`firestore.rules`](./firestore.rules). Key points:

- **List queries must be satisfiable by rules.** Public queries filter `status == 'published'`; the dashboard filters `authorId == uid`.
- **No client-chosen ownership.** A create request is rejected unless `authorId` equals the caller’s UID.
- **Engagement writes are constrained.** Likes must add/remove exactly the caller’s UID and move the counter in the right direction; views may only increase by one.
- **Everything else is denied** by the catch-all rule.

Deploy rules after any change:

```bash
firebase deploy --only firestore:rules
```

Always test drafts in a private window — that is the check that proves the rules are working.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite at `http://localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Build and deploy with the Firebase CLI |
| `npm run emulators` | Start the Firebase Emulator Suite |

---

## Troubleshooting

### The app still shows “Demo mode”

- The file must be named exactly `.env.local` in the project root.
- Every key must start with `VITE_`.
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_APP_ID` are required.
- Restart `npm run dev`; Vite reads env files at startup.
- Rebuild before deploying — production builds bake values in.

### `auth/unauthorized-domain`

Add the domain under **Authentication → Settings → Authorized domains**. `localhost` is automatic.

### `Missing or insufficient permissions`

- Deploy `firestore.rules`.
- Make sure the signed-in user is the post’s `authorId`.
- Check that your query only requests allowed documents (published, or your own).

### `auth/operation-not-allowed`

Enable **Email/Password** under **Authentication → Sign-in method**.

### A deep link returns 404

`firebase.json` must contain the SPA rewrite:

```json
"rewrites": [{ "source": "**", "destination": "/index.html" }]
```

### GitHub Actions fails on deploy

- `FIREBASE_SERVICE_ACCOUNT` must be the **full JSON**, including the private key and newlines.
- The service account needs Hosting Admin + Rules Admin permissions.
- `FIREBASE_PROJECT_ID` must match the project in Firebase.
- The Firebase web app values must exist as `VITE_*` secrets.
- If the key was revoked, create a new service-account key and update the secret.

### Blank page after deployment

- Run `npm run build` locally and check that `dist/` exists.
- `firebase.json` must point `public` at `dist`.
- Check the browser console for a CSP or MIME error.
- Rebuild after adding env variables.

### Firestore asks for an index

The current queries use single-field indexes. If you add a compound query (for example `status + createdAt`), Firestore prints a link to create the index; add it to `firestore.indexes.json` and deploy:

```bash
firebase deploy --only firestore:indexes
```

---

## License

MIT — use it, ship it, and write something worth keeping.
