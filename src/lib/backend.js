import { firebaseEnabled } from './firebase'
import { firebaseAuthApi, firebasePostsApi } from './firebaseBackend'
import { demoAuthApi, demoCredentials, demoPostsApi } from './demoBackend'

/**
 * Chooses the backend once, at module load time.
 *
 *  • Firebase env vars present → real Firebase Auth + Firestore.
 *  • Env vars missing          → local demo backend (localStorage).
 */
export const isDemo = !firebaseEnabled

export const authApi = isDemo ? demoAuthApi : firebaseAuthApi
export const postsApi = isDemo ? demoPostsApi : firebasePostsApi
export const demoLogin = isDemo ? demoCredentials : null
