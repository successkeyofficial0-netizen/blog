import { getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

/**
 * Firebase is configured through Vite environment variables.
 * Copy `.env.example` to `.env.local`, paste your web app config,
 * and restart the dev server.
 *
 * When the required keys are missing, `firebaseEnabled` is false and the
 * app falls back to a fully functional localStorage demo backend.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

const requiredKeys = ['apiKey', 'projectId', 'appId']

export const firebaseEnabled = requiredKeys.every(
  (key) => Boolean(firebaseConfig[key]),
)

export const missingFirebaseKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key],
)

let app = null
let auth = null
let db = null

export const useEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'

if (firebaseEnabled) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Optional local development against the Firebase Emulator Suite.
  // Enable with VITE_USE_FIREBASE_EMULATORS=true, then run `npm run emulators`.
  if (useEmulators && !globalThis.__inkwellEmulatorsConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    globalThis.__inkwellEmulatorsConnected = true
  }
}

export { app, auth, db }
