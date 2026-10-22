/**
 * Bilingual, step-by-step Firebase deployment guide.
 * Bodies are Markdown; `code` blocks are rendered with copy buttons.
 */

export const GUIDE = {
  en: {
    label: 'English',
    badge: 'Deployment handbook',
    title: 'Ship Inkwell to Firebase.',
    subtitle:
      'Authentication, Firestore, security rules and hosting — a complete, tested walkthrough from an empty console to a live URL.',
    readTime: '~15 minutes',
    intro:
      'You do not need a backend server. Firebase Authentication handles accounts, Firestore stores the posts in realtime, and Firebase Hosting serves the built React app on a global CDN.',
    ui: {
      onThisPage: 'On this page',
      markDone: 'Mark done',
      done: 'Done',
      progress: 'Setup progress',
      completed: 'completed',
      reset: 'Reset',
      step: 'Step',
      copy: 'Copy',
      copied: 'Copied',
      troubleshooting: 'Troubleshooting',
      quickRef: 'Quick reference',
      openConsole: 'Open Firebase Console',
      demoNote:
        'You are in demo mode right now. The steps below turn this local demo into a real, multi-device app.',
      liveNote: 'Firebase is connected. Your data is already syncing with Firestore.',
      tip: 'Tip',
      warning: 'Careful',
      note: 'Note',
      deployTitle: 'Ready when you are',
      deployBody:
        'Build, deploy and verify in three commands. The first deploy usually takes under a minute.',
      backToTop: 'Back to top',
    },
    steps: [
      {
        id: 'prerequisites',
        title: 'Install the prerequisites',
        summary: 'Node.js, npm and a Google account. The free Spark plan is enough.',
        body: `You need three things before starting. None of them requires a credit card — Firebase's **Spark plan** is free and more than enough for this blog.

**Required**
- **Node.js 18 or newer** (20 LTS recommended) and npm.
- A **Google account**.
- This project, with dependencies installed.

Open a terminal in the project folder and check your versions:`,
        code: [
          {
            label: 'Terminal',
            lang: 'bash',
            content: 'node -v\nnpm -v\nnpm install',
          },
        ],
        tip: {
          type: 'tip',
          title: 'Already installed?',
          body: 'If `node -v` prints v18 or higher, skip the install and run `npm install` once in the project root.',
        },
      },
      {
        id: 'create-project',
        title: 'Create a Firebase project',
        summary: 'One project holds Auth, Firestore and Hosting for this app.',
        body: `1. Open the [Firebase Console](https://console.firebase.google.com/) and choose **Add project**.
2. Name it something like **inkwell-blog**. The project ID is derived from this name and must be globally unique.
3. Analytics is optional — Inkwell does not need it, so you can switch it off for a faster setup.
4. Accept the terms and choose **Create project**.

Your project ID becomes part of the Hosting URL (\`your-project-id.web.app\`). It cannot be renamed later, so choose carefully.`,
        tip: {
          type: 'note',
          title: 'Choose a region early',
          body: 'Firestore asks for a location when the database is created. It cannot be changed afterwards, so pick the region closest to your readers.',
        },
      },
      {
        id: 'register-app',
        title: 'Register the web app',
        summary: 'Copy the firebaseConfig object. Its values become environment variables.',
        body: `Inside the project, open **Project settings** (the gear icon) → **General** → **Your apps**.

1. Choose the **Web** platform, the \`</>\` button.
2. Give it a nickname such as \`inkwell-web\`.
3. Leave **Also set up Firebase Hosting** unchecked for now — Hosting is configured later in this guide.
4. Choose **Register app**.
5. Firebase displays a \`firebaseConfig\` object. Keep this tab open; you will move each value into \`.env.local\` in step 6.

The object looks like this:`,
        code: [
          {
            label: 'firebaseConfig',
            lang: 'js',
            content: `const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "inkwell-blog.firebaseapp.com",
  projectId: "inkwell-blog",
  storageBucket: "inkwell-blog.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};`,
          },
        ],
        tip: {
          type: 'warning',
          title: 'The apiKey is not a password',
          body: 'Firebase web API keys are designed to be public. Your data is protected by Firestore security rules and Auth authorized domains, not by hiding the key. Still, never commit service-account JSON files.',
        },
      },
      {
        id: 'enable-auth',
        title: 'Enable Email/Password sign-in',
        summary: 'Two minutes in the console. No additional backend required.',
        body: `1. In the left sidebar choose **Build → Authentication**.
2. Choose **Get started**.
3. Open the **Sign-in method** tab.
4. Select **Email/Password**, turn **Enable** on, and save.
5. Optionally open **Templates** and customise the password-reset email with your own project name.

Inkwell already implements sign up, sign in, sign out and password reset. You do not need to write any authentication code — the app calls the Firebase SDK directly.`,
        tip: {
          type: 'tip',
          title: 'No email verification by default',
          body: 'New accounts work immediately. If you want verified emails later, enable it under Authentication → Settings → User actions.',
        },
      },
      {
        id: 'create-firestore',
        title: 'Create the Firestore database',
        summary: 'A single posts collection powers the feed, dashboard and editor.',
        body: `1. Choose **Build → Firestore Database → Create database**.
2. Select **Standard edition**.
3. Pick a location close to your readers. This cannot be changed later.
4. Start in **Production mode** — real security rules are added in step 7.
5. Choose **Create**.

You do **not** need to create collections by hand. The app creates the \`posts\` collection the first time you publish, and stores timestamps with \`serverTimestamp()\`.

**Document shape**

| Field | Type | Notes |
| --- | --- | --- |
| \`title\` | string | Story title |
| \`slug\` | string | Generated from the title |
| \`excerpt\` | string | Card summary |
| \`content\` | string | Markdown source |
| \`coverImage\` | string | URL or local path |
| \`category\` | string | One of six topics |
| \`tags\` | array | Up to eight strings |
| \`status\` | string | \`draft\` or \`published\` |
| \`authorId\` | string | Firebase Auth uid |
| \`authorName\` | string | Denormalised display name |
| \`likes\` / \`likedBy\` | number / array | Engagement |
| \`views\` | number | Incremented on first open |
| \`createdAt\` / \`updatedAt\` | timestamp | Server timestamps |`,
        tip: {
          type: 'note',
          title: 'Why store authorName on each post?',
          body: 'It avoids an extra profile read for every card in the feed. Profile names change rarely; feed reads happen constantly.',
        },
      },
      {
        id: 'env',
        title: 'Connect the app with .env.local',
        summary: 'Copy six values, restart Vite, and demo mode disappears.',
        body: `Copy the example file and open it in your editor. On macOS or Linux:

\`\`\`bash
cp .env.example .env.local
\`\`\`

On Windows PowerShell:

\`\`\`powershell
Copy-Item .env.example .env.local
\`\`\`

Map the Firebase config values like this:

| firebaseConfig | .env.local |
| --- | --- |
| \`apiKey\` | \`VITE_FIREBASE_API_KEY\` |
| \`authDomain\` | \`VITE_FIREBASE_AUTH_DOMAIN\` |
| \`projectId\` | \`VITE_FIREBASE_PROJECT_ID\` |
| \`storageBucket\` | \`VITE_FIREBASE_STORAGE_BUCKET\` |
| \`messagingSenderId\` | \`VITE_FIREBASE_MESSAGING_SENDER_ID\` |
| \`appId\` | \`VITE_FIREBASE_APP_ID\` |

Then restart the dev server. Vite only reads environment files at startup.`,
        code: [
          {
            label: '.env.local',
            lang: 'bash',
            content: `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=inkwell-blog.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inkwell-blog
VITE_FIREBASE_STORAGE_BUCKET=inkwell-blog.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456`,
          },
        ],
        tip: {
          type: 'warning',
          title: '.env.local is private',
          body: 'It is already listed in .gitignore. Never commit it, and never rename the keys — the `VITE_` prefix is required for the browser bundle.',
        },
      },
      {
        id: 'rules',
        title: 'Deploy the security rules',
        summary: 'Published posts are public. Drafts belong to their author. Nothing else is allowed.',
        body: `The repository ships a reviewed \`firestore.rules\` file. It enforces three ideas:

- **Published posts are public; drafts are private** to their author.
- A post can only be created with your own uid as \`authorId\`.
- Readers may update only \`likes\`, \`likedBy\` and \`views\` — never the content.

**Option A — Console.** Open **Firestore Database → Rules**, paste the file, and choose **Publish**.

**Option B — CLI.** After step 10, run:

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

The full rule set:`,
        code: [
          {
            label: 'firestore.rules',
            lang: 'js',
            content: `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(data) {
      return signedIn() && data.authorId == request.auth.uid;
    }

    match /posts/{postId} {
      allow read: if resource.data.status == 'published'
                  || isOwner(resource.data);

      allow create: if signedIn()
                    && request.resource.data.authorId == request.auth.uid
                    && request.resource.data.status in ['draft', 'published'];

      allow update: if (isOwner(resource.data)
                        && request.resource.data.authorId == resource.data.authorId)
                    || (signedIn()
                        && request.resource.data.diff(resource.data)
                             .affectedKeys()
                             .hasOnly(['likes', 'likedBy', 'views']));

      allow delete: if isOwner(resource.data);
    }

    match /users/{userId} {
      allow read: if signedIn();
      allow write: if signedIn() && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}`,
          },
        ],
        tip: {
          type: 'warning',
          title: 'Never launch in test mode',
          body: 'Test-mode rules allow anyone to read and write every document, and they expire after 30 days. Your console will show a warning until real rules are published.',
        },
      },
      {
        id: 'run',
        title: 'Run and test locally',
        summary: 'Verify the whole loop before anything is public.',
        body: `Start the app and open [http://localhost:5173](http://localhost:5173):

\`\`\`bash
npm run dev
\`\`\`

Test the complete loop:

1. **Create an account.** Check Authentication → Users: a new user appears immediately.
2. **Save a draft.** It shows in your dashboard and nowhere else.
3. **Publish it.** The story appears in the public feed without a refresh.
4. **Like it.** The counter changes and is stored in \`likedBy\`.
5. **Open a private window.** The published story is readable while signed out; drafts return “not available”.
6. **Check Firestore → Data.** Documents update as you save.

Because listeners are realtime, a second browser tab updates automatically.`,
        tip: {
          type: 'tip',
          title: 'Test the rules, not just the UI',
          body: 'In a private window, try opening a draft URL directly. It must be blocked. That is your security rule doing its job.',
        },
      },
      {
        id: 'build',
        title: 'Create a production build',
        summary: 'Vite bakes the environment variables into the bundle.',
        body: `Build the site and sanity-check the output:

\`\`\`bash
npm run build
npm run preview
\`\`\`

The build writes static files to \`dist/\`. That folder is what Firebase Hosting serves.`,
        tip: {
          type: 'warning',
          title: 'Rebuild after changing env values',
          body: 'Production builds bake env variables in at build time. If you change .env.local, run npm run build again before deploying.',
        },
      },
      {
        id: 'hosting',
        title: 'Set up Firebase Hosting',
        summary: 'One small config file is already prepared for you.',
        body: `Install the Firebase CLI and sign in:

\`\`\`bash
npm install -g firebase-tools
firebase login
\`\`\`

Select the project. This creates \`.firebaserc\`:

\`\`\`bash
firebase use --add
\`\`\`

Choose your project and an alias such as \`default\`.

This repository already contains \`firebase.json\` with the SPA rewrite and cache headers, plus \`firestore.rules\`. You **do not** need \`firebase init hosting\`.

If you prefer to run it anyway, answer:
- **Public directory:** \`dist\`
- **Single-page app rewrite:** Yes
- **Set up automatic deploys with GitHub:** No (optional)
- **Overwrite dist/index.html:** No
- **Overwrite firebase.json:** No`,
        tip: {
          type: 'warning',
          title: 'Keep the SPA rewrite',
          body: 'Without the rewrite, refreshing /post/abc returns a 404. If you overwrite firebase.json, restore the "rewrites" block from the repository.',
        },
      },
      {
        id: 'deploy',
        title: 'Deploy to the web',
        summary: 'Sync Auth, Firestore rules and Hosting in one command.',
        body: `Build and deploy:

\`\`\`bash
npm run build
firebase deploy
\`\`\`

Or use the bundled script, which does both:

\`\`\`bash
npm run deploy
\`\`\`

Firebase prints a Hosting URL such as \`https://inkwell-blog.web.app\`. Because \`firebase.json\` references Firestore, a full deploy also publishes your rules.

**After the first deploy**
1. Open the live URL and create a real account.
2. Publish a story, then refresh a deep link such as \`/post/...\` — it must load.
3. Add a custom domain under **Hosting → Add custom domain** if you have one.
4. Add that domain under **Authentication → Settings → Authorized domains**, otherwise sign-in fails on it.

Useful deploy variants:`,
        code: [
          {
            label: 'Deploy commands',
            lang: 'bash',
            content: `firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase hosting:channel:deploy preview
firebase hosting:rollback`,
          },
        ],
        tip: {
          type: 'tip',
          title: 'Preview channels are free',
          body: 'A preview channel gives you a temporary URL for a build. Share it for feedback before promoting to the live site.',
        },
      },
      {
        id: 'github-actions',
        title: 'Automate deploys with GitHub Actions',
        summary: 'Push to main, build with secrets, and ship Hosting + rules automatically.',
        body: `GitHub holds the source and runs the pipeline; **Firebase Hosting still serves the site**. Keeping hosting on Firebase preserves the SPA rewrite and lets the same workflow publish your security rules.

This repository already includes two workflows:

- \`.github/workflows/ci.yml\` builds every push and pull request (no secrets needed).
- \`.github/workflows/firebase-hosting-merge.yml\` deploys Hosting and Firestore rules on every push to \`main\`.

**Create the service account**
1. Open the [Google Cloud Console](https://console.cloud.google.com/) for the same project.
2. Go to **IAM & Admin → Service Accounts → Create service account**.
3. Grant **Firebase Hosting Admin**, **Firebase Rules Admin** and **Cloud Datastore User**.
4. Open the account, choose **Keys → Add key → Create new key → JSON**, and download it.

**Add secrets and a variable** in GitHub under **Settings → Secrets and variables → Actions**:

| Name | Type | Value |
| --- | --- | --- |
| \`FIREBASE_SERVICE_ACCOUNT\` | secret | the entire JSON key file |
| \`VITE_FIREBASE_API_KEY\` | secret | web API key |
| \`VITE_FIREBASE_AUTH_DOMAIN\` | secret | \`your-project.firebaseapp.com\` |
| \`VITE_FIREBASE_PROJECT_ID\` | secret | project ID |
| \`VITE_FIREBASE_STORAGE_BUCKET\` | secret | \`your-project.appspot.com\` |
| \`VITE_FIREBASE_MESSAGING_SENDER_ID\` | secret | sender ID |
| \`VITE_FIREBASE_APP_ID\` | secret | web app ID |
| \`FIREBASE_PROJECT_ID\` | variable | project ID |

Commit the workflow and push to \`main\`. The run installs dependencies, builds with the \`VITE_*\` values, authenticates with the service account, and runs:

\`\`\`bash
npx firebase-tools deploy --only hosting,firestore:rules \\
  --project "$FIREBASE_PROJECT_ID" --non-interactive
\`\`\`

Watch the result in the **Actions** tab, then open the Hosting URL from the log.`,
        code: [
          {
            label: 'Firebase deploy workflow (essential steps)',
            lang: 'yaml',
            content: `- uses: google-github-actions/auth@v2
  with:
    credentials_json: \${{ secrets.FIREBASE_SERVICE_ACCOUNT }}

- run: npx --yes firebase-tools@13 deploy --only hosting,firestore:rules --project "\$FIREBASE_PROJECT_ID" --non-interactive
  env:
    FIREBASE_PROJECT_ID: \${{ vars.FIREBASE_PROJECT_ID }}`,
          },
        ],
        tip: {
          type: 'warning',
          title: 'Never commit the key',
          body: 'The service-account JSON grants deploy access to your project. Keep it only in the GitHub secret. `.env.local` is already ignored; `VITE_` values are public in the client bundle by design, but the service account is not.',
        },
      },
      {
        id: 'beyond',
        title: 'Going further',
        summary: 'Optional upgrades once the basics are live.',
        body: `The blog is complete, but these are the natural next steps:

- **Scheduled publishing.** Add \`publishAt\`, store drafts with a future date, and reveal them when the time passes.
- **Image uploads.** Enable Firebase Storage and replace the cover URL field with an uploader. Add \`storage.rules\` before going live.
- **App Check.** Protect Firestore from scripted abuse with reCAPTCHA Enterprise or DeviceCheck.
- **Backups.** Enable scheduled Firestore backups, or export to Cloud Storage on a schedule.
- **Search at scale.** Client-side search is fast for a few hundred posts. Move to Algolia or Typesense when the archive grows.
- **Custom domain, RSS and social cards.** A little polish that makes the blog feel finished.

Every feature follows the same pattern: a query in \`src/lib/firebaseBackend.js\`, a rule in \`firestore.rules\`, and a component that renders state.`,
      },
    ],
    troubleshooting: {
      title: 'Troubleshooting',
      subtitle: 'The errors you are most likely to see, and exactly how to fix them.',
      items: [
        {
          q: 'auth/unauthorized-domain',
          a: 'Open **Authentication → Settings → Authorized domains** and add the domain you are using (for example `inkwell-blog.web.app` or your custom domain). localhost is authorised automatically.',
        },
        {
          q: 'Missing or insufficient permissions',
          a: 'Rules are not deployed, or the document author does not match the signed-in uid. Publish `firestore.rules`, sign out and back in, and confirm `authorId` in the document equals `request.auth.uid`.',
        },
        {
          q: 'The app still shows Demo mode',
          a: 'Check the file name is exactly `.env.local`, that every key starts with `VITE_`, and that you restarted `npm run dev`. Environment values are read once, at startup.',
        },
        {
          q: 'auth/operation-not-allowed',
          a: 'Email/Password sign-in is disabled. Enable it under **Authentication → Sign-in method**, then try again.',
        },
        {
          q: 'auth/invalid-api-key',
          a: 'The API key is missing or copied incorrectly. Re-copy it from Project settings → Your apps → SDK setup, and rebuild if this is a production bundle.',
        },
        {
          q: 'Refreshing /post/... returns 404',
          a: 'The Hosting rewrite is missing. Keep the `"rewrites": [{ "source": "**", "destination": "/index.html" }]` block in `firebase.json` and redeploy.',
        },
        {
          q: 'Posts do not appear instantly',
          a: 'Check the browser console and the Network tab. An offline connection, a blocked WebSocket, or a rule that rejects the list query will stop listeners. The feed only queries `status == "published"`.',
        },
        {
          q: 'npm run build fails',
          a: 'Use Node 18 or newer. Delete `node_modules` and `package-lock.json`, then run `npm install` again. Rebuild after fixing any console errors.',
        },
      ],
    },
    quickRef: {
      title: 'Quick reference',
      commands: `npm install          # install dependencies
npm run dev          # local development
npm run build        # production bundle in dist/
npm run preview      # preview the production build

firebase login       # authenticate the CLI
firebase use --add   # select your project
npm run deploy       # build + deploy hosting & rules`,
      files: [
        ['src/lib/firebase.js', 'Reads VITE_ variables and initialises Firebase'],
        ['src/lib/backend.js', 'Chooses Firebase or the local demo backend'],
        ['firestore.rules', 'Security rules to publish'],
        ['firebase.json', 'Hosting rewrites, headers and emulators'],
        ['.env.example', 'Template for .env.local'],
        ['.github/workflows/firebase-hosting-merge.yml', 'GitHub Actions deploy pipeline'],
      ],
    },
  },

  hi: {
    label: 'हिंदी',
    badge: 'डिप्लॉयमेंट हैंडबुक',
    title: 'Inkwell को Firebase पर लाइव करें।',
    subtitle:
      'Authentication, Firestore, security rules और hosting — खाली console से लाइव URL तक का पूरा, परखा हुआ रास्ता।',
    readTime: '~15 मिनट',
    intro:
      'किसी अलग backend सर्वर की ज़रूरत नहीं है। Firebase Authentication अकाउंट संभालता है, Firestore पोस्ट को realtime में रखता है, और Firebase Hosting आपकी React app को दुनिया भर के CDN से serve करता है।',
    ui: {
      onThisPage: 'इस पेज पर',
      markDone: 'पूरा हुआ',
      done: 'हो गया',
      progress: 'सेटअप प्रगति',
      completed: 'पूरे',
      reset: 'रीसेट',
      step: 'स्टेप',
      copy: 'कॉपी',
      copied: 'कॉपी हो गया',
      troubleshooting: 'समस्या हल',
      quickRef: 'क्विक रेफ़रेंस',
      openConsole: 'Firebase Console खोलें',
      demoNote:
        'अभी आप demo mode में हैं। नीचे दिए स्टेप्स इस लोकल डेमो को असली, मल्टी-डिवाइस ऐप बना देंगे।',
      liveNote: 'Firebase जुड़ा हुआ है। आपका डेटा Firestore के साथ सिंक हो रहा है।',
      tip: 'टिप',
      warning: 'ध्यान दें',
      note: 'नोट',
      deployTitle: 'जब आप तैयार हों',
      deployBody:
        'तीन कमांड में build, deploy और verify करें। पहला deploy आम तौर पर एक मिनट से कम समय लेता है।',
      backToTop: 'ऊपर जाएँ',
    },
    steps: [
      {
        id: 'prerequisites',
        title: 'ज़रूरी चीज़ें इंस्टॉल करें',
        summary: 'Node.js, npm और एक Google अकाउंट। मुफ़्त Spark plan काफ़ी है।',
        body: `शुरू करने से पहले तीन चीज़ें चाहिए। इनमें से किसी के लिए क्रेडिट कार्ड नहीं चाहिए — Firebase का **Spark plan** मुफ़्त है और इस ब्लॉग के लिए पर्याप्त है।

**ज़रूरी**
- **Node.js 18 या नया** (20 LTS सुझाया गया) और npm।
- एक **Google अकाउंट**।
- यह प्रोजेक्ट, सारी dependencies के साथ।

प्रोजेक्ट फ़ोल्डर में terminal खोलें और वर्ज़न जाँचें:`,
        code: [
          {
            label: 'Terminal',
            lang: 'bash',
            content: 'node -v\nnpm -v\nnpm install',
          },
        ],
        tip: {
          type: 'tip',
          title: 'पहले से इंस्टॉल है?',
          body: 'अगर `node -v` में v18 या उससे नया दिखे, तो बस प्रोजेक्ट रूट में एक बार `npm install` चलाएँ।',
        },
      },
      {
        id: 'create-project',
        title: 'Firebase प्रोजेक्ट बनाएँ',
        summary: 'एक ही प्रोजेक्ट में Auth, Firestore और Hosting रहेंगे।',
        body: `1. [Firebase Console](https://console.firebase.google.com/) खोलें और **Add project** चुनें।
2. नाम दें, जैसे **inkwell-blog**। इसी से project ID बनता है और वह दुनिया में यूनिक होना चाहिए।
3. Analytics ज़रूरी नहीं — Inkwell को इसकी ज़रूरत नहीं, तो तेज़ सेटअप के लिए बंद कर सकते हैं।
4. शर्तें स्वीकार करें और **Create project** चुनें।

आपका project ID Hosting URL का हिस्सा बनेगा (\`your-project-id.web.app\`). इसे बाद में बदला नहीं जा सकता, इसलिए सोच-समझकर चुनें।`,
        tip: {
          type: 'note',
          title: 'region पहले ही चुनें',
          body: 'Firestore डेटाबेस बनाते समय location पूछता है। इसे बाद में बदला नहीं जा सकता, इसलिए अपने पाठकों के सबसे नज़दीकी region चुनें।',
        },
      },
      {
        id: 'register-app',
        title: 'Web app रजिस्टर करें',
        summary: 'firebaseConfig कॉपी करें। इसकी वैल्यूज़ environment variables बनेंगी।',
        body: `प्रोजेक्ट के अंदर **Project settings** (गियर आइकन) → **General** → **Your apps** खोलें।

1. **Web** प्लेटफ़ॉर्म चुनें, यानी \`</>\` बटन।
2. निकनेम दें, जैसे \`inkwell-web\`।
3. अभी **Also set up Firebase Hosting** को अनचेक रहने दें — Hosting इस गाइड में आगे सेट होगी।
4. **Register app** चुनें।
5. Firebase एक \`firebaseConfig\` ऑब्जेक्ट दिखाएगा। यह टैब खुला रखें; स्टेप 6 में हर वैल्यू \`.env.local\` में डालनी है।

ऑब्जेक्ट ऐसा दिखता है:`,
        code: [
          {
            label: 'firebaseConfig',
            lang: 'js',
            content: `const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "inkwell-blog.firebaseapp.com",
  projectId: "inkwell-blog",
  storageBucket: "inkwell-blog.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};`,
          },
        ],
        tip: {
          type: 'warning',
          title: 'apiKey कोई पासवर्ड नहीं है',
          body: 'Firebase की web API key सार्वजनिक होने के लिए ही बनी है। आपका डेटा Firestore security rules और Auth authorized domains से सुरक्षित रहता है, key छिपाने से नहीं। फिर भी service-account JSON कभी commit न करें।',
        },
      },
      {
        id: 'enable-auth',
        title: 'Email/Password साइन-इन चालू करें',
        summary: 'Console में दो मिनट। अलग backend की ज़रूरत नहीं।',
        body: `1. बाएँ साइडबार में **Build → Authentication** चुनें।
2. **Get started** पर क्लिक करें।
3. **Sign-in method** टैब खोलें।
4. **Email/Password** चुनें, **Enable** चालू करें और सेव करें।
5. चाहें तो **Templates** में जाकर password-reset ईमेल में अपने प्रोजेक्ट का नाम जोड़ें।

Inkwell में sign up, sign in, sign out और password reset पहले से बने हैं। आपको कोई authentication कोड लिखने की ज़रूरत नहीं — ऐप सीधे Firebase SDK इस्तेमाल करता है।`,
        tip: {
          type: 'tip',
          title: 'डिफ़ॉल्ट में email verification नहीं',
          body: 'नए अकाउंट तुरंत काम करते हैं। बाद में verified email चाहिए तो Authentication → Settings → User actions में चालू कर सकते हैं।',
        },
      },
      {
        id: 'create-firestore',
        title: 'Firestore डेटाबेस बनाएँ',
        summary: 'एक ही posts collection पूरा फ़ीड, डैशबोर्ड और एडिटर चलाता है।',
        body: `1. **Build → Firestore Database → Create database** चुनें।
2. **Standard edition** चुनें।
3. अपने पाठकों के नज़दीकी location चुनें। इसे बाद में बदला नहीं जा सकता।
4. **Production mode** से शुरू करें — असली security rules स्टेप 7 में लगेंगी।
5. **Create** चुनें।

कलेक्शन हाथ से बनाने की ज़रूरत **नहीं** है। पहली बार publish करते ही ऐप \`posts\` collection बना देता है और समय \`serverTimestamp()\` से सेव करता है।

**डॉक्यूमेंट का ढाँचा**

| फ़ील्ड | टाइप | जानकारी |
| --- | --- | --- |
| \`title\` | string | स्टोरी का शीर्षक |
| \`slug\` | string | शीर्षक से बना |
| \`excerpt\` | string | कार्ड के लिए सारांश |
| \`content\` | string | Markdown सामग्री |
| \`coverImage\` | string | URL या लोकल path |
| \`category\` | string | छह विषयों में से एक |
| \`tags\` | array | अधिकतम आठ |
| \`status\` | string | \`draft\` या \`published\` |
| \`authorId\` | string | Firebase Auth uid |
| \`authorName\` | string | दिखने वाला नाम |
| \`likes\` / \`likedBy\` | number / array | लाइक डेटा |
| \`views\` | number | पहली बार खुलने पर बढ़ता है |
| \`createdAt\` / \`updatedAt\` | timestamp | सर्वर समय |`,
        tip: {
          type: 'note',
          title: 'हर पोस्ट में authorName क्यों?',
          body: 'इससे फ़ीड के हर कार्ड के लिए अलग प्रोफ़ाइल पढ़नी नहीं पड़ती। नाम कभी-कभी बदलते हैं, फ़ीड बार-बार पढ़ा जाता है।',
        },
      },
      {
        id: 'env',
        title: 'ऐप को .env.local से जोड़ें',
        summary: 'छह वैल्यू भरें, Vite रीस्टार्ट करें, demo mode गायब हो जाएगा।',
        body: `उदाहरण फ़ाइल कॉपी करें और एडिटर में खोलें। macOS या Linux पर:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Windows PowerShell पर:

\`\`\`powershell
Copy-Item .env.example .env.local
\`\`\`

Firebase config की वैल्यूज़ इस तरह मैप करें:

| firebaseConfig | .env.local |
| --- | --- |
| \`apiKey\` | \`VITE_FIREBASE_API_KEY\` |
| \`authDomain\` | \`VITE_FIREBASE_AUTH_DOMAIN\` |
| \`projectId\` | \`VITE_FIREBASE_PROJECT_ID\` |
| \`storageBucket\` | \`VITE_FIREBASE_STORAGE_BUCKET\` |
| \`messagingSenderId\` | \`VITE_FIREBASE_MESSAGING_SENDER_ID\` |
| \`appId\` | \`VITE_FIREBASE_APP_ID\` |

अब dev सर्वर रीस्टार्ट करें। Vite environment फ़ाइलें सिर्फ़ शुरू होते समय पढ़ता है।`,
        code: [
          {
            label: '.env.local',
            lang: 'bash',
            content: `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=inkwell-blog.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inkwell-blog
VITE_FIREBASE_STORAGE_BUCKET=inkwell-blog.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456`,
          },
        ],
        tip: {
          type: 'warning',
          title: '.env.local निजी है',
          body: 'यह पहले से .gitignore में है। इसे कभी commit न करें और keys के नाम कभी न बदलें — browser bundle के लिए \`VITE_\` prefix ज़रूरी है।',
        },
      },
      {
        id: 'rules',
        title: 'Security Rules डिप्लॉय करें',
        summary: 'Published पोस्ट सबके लिए, draft सिर्फ़ लेखक के लिए। बाकी सब बंद।',
        body: `रीपो में तैयार \`firestore.rules\` फ़ाइल है। यह तीन बातें लागू करती है:

- **Published पोस्ट सार्वजनिक, draft सिर्फ़ लेखक के लिए।**
- पोस्ट सिर्फ़ अपने uid को \`authorId\` बनाकर ही बनाई जा सकती है।
- पाठक सिर्फ़ \`likes\`, \`likedBy\` और \`views\` बदल सकते हैं — सामग्री कभी नहीं।

**तरीका A — Console.** **Firestore Database → Rules** खोलें, फ़ाइल पेस्ट करें और **Publish** दबाएँ।

**तरीका B — CLI.** स्टेप 10 के बाद चलाएँ:

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

पूरे rules:`,
        code: [
          {
            label: 'firestore.rules',
            lang: 'js',
            content: `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(data) {
      return signedIn() && data.authorId == request.auth.uid;
    }

    match /posts/{postId} {
      allow read: if resource.data.status == 'published'
                  || isOwner(resource.data);

      allow create: if signedIn()
                    && request.resource.data.authorId == request.auth.uid
                    && request.resource.data.status in ['draft', 'published'];

      allow update: if (isOwner(resource.data)
                        && request.resource.data.authorId == resource.data.authorId)
                    || (signedIn()
                        && request.resource.data.diff(resource.data)
                             .affectedKeys()
                             .hasOnly(['likes', 'likedBy', 'views']));

      allow delete: if isOwner(resource.data);
    }

    match /users/{userId} {
      allow read: if signedIn();
      allow write: if signedIn() && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}`,
          },
        ],
        tip: {
          type: 'warning',
          title: 'test mode में लाइव कभी न जाएँ',
          body: 'Test-mode rules किसी को भी हर डॉक्यूमेंट पढ़ने-लिखने देते हैं और 30 दिन में खत्म हो जाते हैं। असली rules publish होने तक Console चेतावनी दिखाता रहेगा।',
        },
      },
      {
        id: 'run',
        title: 'लोकल पर चलाएँ और टेस्ट करें',
        summary: 'कुछ भी सार्वजनिक करने से पहले पूरा चक्र जाँचें।',
        body: `ऐप शुरू करें और [http://localhost:5173](http://localhost:5173) खोलें:

\`\`\`bash
npm run dev
\`\`\`

पूरा चक्र टेस्ट करें:

1. **अकाउंट बनाएँ।** Authentication → Users में नया यूज़र तुरंत दिखेगा।
2. **Draft सेव करें।** वह सिर्फ़ डैशबोर्ड में दिखेगा, कहीं और नहीं।
3. **Publish करें।** रिफ़्रेश के बिना पोस्ट सार्वजनिक फ़ीड में आ जाएगी।
4. **लाइक करें।** गिनती बदलेगी और \`likedBy\` में सेव होगी।
5. **Private window खोलें।** Published पोस्ट बिना साइन-इन पढ़ी जा सकेगी; draft पर “not available” दिखेगा।
6. **Firestore → Data देखें।** सेव करते ही डॉक्यूमेंट अपडेट होते दिखेंगे।

चूँकि listeners realtime हैं, दूसरा browser tab अपने आप अपडेट हो जाएगा।`,
        tip: {
          type: 'tip',
          title: 'सिर्फ़ UI नहीं, rules भी टेस्ट करें',
          body: 'Private window में किसी draft का URL सीधे खोलें। वह block होना चाहिए। यही आपका security rule काम कर रहा है।',
        },
      },
      {
        id: 'build',
        title: 'Production build बनाएँ',
        summary: 'Vite environment variables को bundle में bake करता है।',
        body: `साइट build करें और आउटपुट जाँचें:

\`\`\`bash
npm run build
npm run preview
\`\`\`

Build सारी static फ़ाइलें \`dist/\` में डालता है। Firebase Hosting यही फ़ोल्डर serve करता है।`,
        tip: {
          type: 'warning',
          title: 'env बदला तो फिर build करें',
          body: 'Production build में env variables build के समय ही भर जाते हैं। .env.local बदलने पर deploy से पहले दोबारा npm run build चलाएँ।',
        },
      },
      {
        id: 'hosting',
        title: 'Firebase Hosting सेट करें',
        summary: 'एक छोटी config फ़ाइल पहले से तैयार है।',
        body: `Firebase CLI इंस्टॉल करें और साइन इन करें:

\`\`\`bash
npm install -g firebase-tools
firebase login
\`\`\`

प्रोजेक्ट चुनें। इससे \`.firebaserc\` बनता है:

\`\`\`bash
firebase use --add
\`\`\`

अपना प्रोजेक्ट और \`default\` जैसा alias चुनें।

इस रीपो में \`firebase.json\` पहले से है — SPA rewrite और cache headers के साथ — और \`firestore.rules\` भी। आपको \`firebase init hosting\` चलाने की **ज़रूरत नहीं**।

फिर भी चलाना चाहें तो ये जवाब दें:
- **Public directory:** \`dist\`
- **Single-page app rewrite:** Yes
- **GitHub से automatic deploy:** No (वैकल्पिक)
- **dist/index.html overwrite:** No
- **firebase.json overwrite:** No`,
        tip: {
          type: 'warning',
          title: 'SPA rewrite बनाए रखें',
          body: 'Rewrite के बिना /post/abc refresh करने पर 404 आएगा। अगर firebase.json overwrite हो जाए, तो रीपो से "rewrites" ब्लॉक वापस जोड़ें।',
        },
      },
      {
        id: 'deploy',
        title: 'वेब पर डिप्लॉय करें',
        summary: 'एक कमांड में Auth, Firestore rules और Hosting सिंक करें।',
        body: `Build और deploy:

\`\`\`bash
npm run build
firebase deploy
\`\`\`

या तैयार स्क्रिप्ट, जो दोनों करती है:

\`\`\`bash
npm run deploy
\`\`\`

Firebase एक Hosting URL देगा, जैसे \`https://inkwell-blog.web.app\`। चूँकि \`firebase.json\` Firestore को भी दर्शाता है, पूरा deploy आपके rules भी publish कर देता है।

**पहले deploy के बाद**
1. लाइव URL खोलें और असली अकाउंट बनाएँ।
2. पोस्ट publish करें, फिर \`/post/...\` जैसा deep link refresh करें — उसे खुलना चाहिए।
3. कस्टम डोमेन हो तो **Hosting → Add custom domain** से जोड़ें।
4. उस डोमेन को **Authentication → Settings → Authorized domains** में जोड़ें, वरना वहाँ साइन-इन फेल होगा।

उपयोगी deploy विकल्प:`,
        code: [
          {
            label: 'Deploy commands',
            lang: 'bash',
            content: `firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase hosting:channel:deploy preview
firebase hosting:rollback`,
          },
        ],
        tip: {
          type: 'tip',
          title: 'Preview channels मुफ़्त हैं',
          body: 'Preview channel आपको build के लिए अस्थायी URL देता है। लाइव साइट पर भेजने से पहले फ़ीडबैक के लिए शेयर करें।',
        },
      },
      {
        id: 'github-actions',
        title: 'GitHub Actions से deploy अपने आप करें',
        summary: 'main पर push करें, secrets से build हो और Hosting + rules अपने आप deploy हों।',
        body: `GitHub source रखता है और pipeline चलाता है; **साइट Firebase Hosting पर ही रहती है**। Hosting Firebase पर रखने से SPA rewrite बना रहता है और वही workflow security rules भी publish कर देता है।

इस repository में दो workflows पहले से हैं:

- \`.github/workflows/ci.yml\` हर push और pull request पर build करता है (secrets की ज़रूरत नहीं)।
- \`.github/workflows/firebase-hosting-merge.yml\` \`main\` पर हर push के साथ Hosting और Firestore rules deploy करता है।

**Service account बनाएँ**
1. उसी प्रोजेक्ट के लिए [Google Cloud Console](https://console.cloud.google.com/) खोलें।
2. **IAM & Admin → Service Accounts → Create service account** पर जाएँ।
3. **Firebase Hosting Admin**, **Firebase Rules Admin** और **Cloud Datastore User** roles दें।
4. अकाउंट खोलें, **Keys → Add key → Create new key → JSON** चुनें और फ़ाइल डाउनलोड करें।

**GitHub में secrets और variable जोड़ें** — **Settings → Secrets and variables → Actions**:

| नाम | Type | Value |
| --- | --- | --- |
| \`FIREBASE_SERVICE_ACCOUNT\` | secret | पूरी JSON key फ़ाइल |
| \`VITE_FIREBASE_API_KEY\` | secret | web API key |
| \`VITE_FIREBASE_AUTH_DOMAIN\` | secret | \`your-project.firebaseapp.com\` |
| \`VITE_FIREBASE_PROJECT_ID\` | secret | project ID |
| \`VITE_FIREBASE_STORAGE_BUCKET\` | secret | \`your-project.appspot.com\` |
| \`VITE_FIREBASE_MESSAGING_SENDER_ID\` | secret | sender ID |
| \`VITE_FIREBASE_APP_ID\` | secret | web app ID |
| \`FIREBASE_PROJECT_ID\` | variable | project ID |

Workflow commit करके \`main\` पर push करें। Run dependencies इंस्टॉल करेगा, \`VITE_*\` values से build करेगा, service account से authenticate करेगा और यह चलाएगा:

\`\`\`bash
npx firebase-tools deploy --only hosting,firestore:rules \\
  --project "$FIREBASE_PROJECT_ID" --non-interactive
\`\`\`

नतीजा **Actions** tab में देखें, फिर log में दिए Hosting URL को खोलें।`,
        code: [
          {
            label: 'Firebase deploy workflow (मुख्य steps)',
            lang: 'yaml',
            content: `- uses: google-github-actions/auth@v2
  with:
    credentials_json: \${{ secrets.FIREBASE_SERVICE_ACCOUNT }}

- run: npx --yes firebase-tools@13 deploy --only hosting,firestore:rules --project "\$FIREBASE_PROJECT_ID" --non-interactive
  env:
    FIREBASE_PROJECT_ID: \${{ vars.FIREBASE_PROJECT_ID }}`,
          },
        ],
        tip: {
          type: 'warning',
          title: 'Key कभी commit न करें',
          body: 'Service-account JSON आपके प्रोजेक्ट में deploy का पूरा अधिकार देती है। इसे सिर्फ़ GitHub secret में रखें। `.env.local` पहले से ignored है; `VITE_` values client bundle में सार्वजनिक होना सामान्य है, लेकिन service account नहीं।',
        },
      },
      {
        id: 'beyond',
        title: 'आगे क्या कर सकते हैं',
        summary: 'बुनियादी चीज़ें लाइव होने के बाद वैकल्पिक सुधार।',
        body: `ब्लॉग पूरा है, लेकिन आगे के स्वाभाविक कदम ये हैं:

- **Scheduled publishing.** \`publishAt\` जोड़ें, भविष्य की तारीख वाले draft रखें और समय आने पर दिखाएँ।
- **Image uploads.** Firebase Storage चालू करें और cover URL की जगह uploader लगाएँ। लाइव जाने से पहले \`storage.rules\` ज़रूर जोड़ें।
- **App Check.** reCAPTCHA Enterprise या DeviceCheck से Firestore को scripted दुरुपयोग से बचाएँ।
- **Backups.** Firestore के scheduled backups चालू करें या समय-समय पर Cloud Storage में export करें।
- **बड़े पैमाने पर खोज.** कुछ सौ पोस्ट तक client-side search तेज़ है। आर्काइव बढ़ने पर Algolia या Typesense पर जाएँ।
- **कस्टम डोमेन, RSS और social cards.** छोटी चीज़ें जो ब्लॉग को पूरा महसूस कराती हैं।

हर फ़ीचर एक ही तरीके से बनता है: \`src/lib/firebaseBackend.js\` में query, \`firestore.rules\` में नियम, और state दिखाने वाला component।`,
      },
    ],
    troubleshooting: {
      title: 'समस्या हल',
      subtitle: 'सबसे आम errors और उनका सीधा हल।',
      items: [
        {
          q: 'auth/unauthorized-domain',
          a: '**Authentication → Settings → Authorized domains** खोलें और अपना डोमेन जोड़ें (जैसे `inkwell-blog.web.app` या कस्टम डोमेन)। localhost अपने आप authorized रहता है।',
        },
        {
          q: 'Missing or insufficient permissions',
          a: 'या तो rules deploy नहीं हुए, या डॉक्यूमेंट का author साइन-इन uid से मेल नहीं खाता। `firestore.rules` publish करें, साइन आउट करके दोबारा साइन इन करें, और देखें कि `authorId` वही है जो `request.auth.uid` है।',
        },
        {
          q: 'ऐप अभी भी Demo mode दिखा रहा है',
          a: 'फ़ाइल का नाम ठीक `.env.local` है या नहीं देखें, हर key `VITE_` से शुरू होनी चाहिए, और `npm run dev` रीस्टार्ट करना ज़रूरी है। env values सिर्फ़ startup पर पढ़ी जाती हैं।',
        },
        {
          q: 'auth/operation-not-allowed',
          a: 'Email/Password साइन-इन बंद है। **Authentication → Sign-in method** में उसे चालू करें और दोबारा कोशिश करें।',
        },
        {
          q: 'auth/invalid-api-key',
          a: 'API key गायब है या गलत कॉपी हुई है। Project settings → Your apps → SDK setup से दोबारा कॉपी करें। Production bundle हो तो rebuild करें।',
        },
        {
          q: '/post/... refresh करने पर 404',
          a: 'Hosting rewrite नहीं है। `firebase.json` में `"rewrites": [{ "source": "**", "destination": "/index.html" }]` ब्लॉक रखें और दोबारा deploy करें।',
        },
        {
          q: 'पोस्ट तुरंत नहीं दिखतीं',
          a: 'Browser console और Network tab देखें। ऑफ़लाइन कनेक्शन, blocked WebSocket, या list query को रोकने वाला rule listener बंद कर देता है। फ़ीड सिर्फ़ `status == "published"` query करता है।',
        },
        {
          q: 'npm run build फेल हो रहा है',
          a: 'Node 18 या नया इस्तेमाल करें। `node_modules` और `package-lock.json` हटाकर दोबारा `npm install` चलाएँ। console की errors ठीक करके rebuild करें।',
        },
      ],
    },
    quickRef: {
      title: 'क्विक रेफ़रेंस',
      commands: `npm install          # dependencies इंस्टॉल करें
npm run dev          # लोकल डेवलपमेंट
npm run build        # dist/ में production bundle
npm run preview      # production build देखें

firebase login       # CLI साइन इन
firebase use --add   # प्रोजेक्ट चुनें
npm run deploy       # build + hosting और rules deploy`,
      files: [
        ['src/lib/firebase.js', 'VITE_ variables पढ़कर Firebase शुरू करता है'],
        ['src/lib/backend.js', 'Firebase या लोकल demo backend चुनता है'],
        ['firestore.rules', 'Publish करने वाले security rules'],
        ['firebase.json', 'Hosting rewrites, headers और emulators'],
        ['.env.example', '.env.local के लिए टेम्पलेट'],
        ['.github/workflows/firebase-hosting-merge.yml', 'GitHub Actions deploy pipeline'],
      ],
    },
  },
}

export const GUIDE_LANGS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
]
