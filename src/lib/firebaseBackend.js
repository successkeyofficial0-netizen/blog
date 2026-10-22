import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { excerptFrom, slugify, toMillis } from './utils'

const POSTS = 'posts'

function mapUser(user) {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Writer',
    photoURL: user.photoURL || null,
  }
}

function mapPost(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    ...data,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

export const firebaseAuthApi = {
  subscribe(callback) {
    return onAuthStateChanged(auth, (user) => callback(mapUser(user)))
  },

  async signIn(email, password) {
    const credential = await signInWithEmailAndPassword(
      auth,
      String(email).trim().toLowerCase(),
      password,
    )
    return mapUser(credential.user)
  },

  async signUp(email, password, displayName) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      String(email).trim().toLowerCase(),
      password,
    )
    const name = String(displayName || '').trim()
    if (name) {
      await updateProfile(credential.user, { displayName: name })
    }
    return mapUser({ ...credential.user, displayName: name || credential.user.displayName })
  },

  async signOut() {
    await firebaseSignOut(auth)
  },

  async resetPassword(email) {
    await sendPasswordResetEmail(auth, String(email).trim().toLowerCase())
    return true
  },
}

export const firebasePostsApi = {
  subscribePosts({ status, authorId } = {}, callback, onError) {
    const constraints = []
    if (status) constraints.push(where('status', '==', status))
    if (authorId) constraints.push(where('authorId', '==', authorId))
    constraints.push(limit(300))

    const q = query(collection(db, POSTS), ...constraints)

    return onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs
          .map(mapPost)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        callback(posts)
      },
      (error) => onError?.(error),
    )
  },

  subscribePost(postId, callback, onError) {
    return onSnapshot(
      doc(db, POSTS, postId),
      (snapshot) => callback(snapshot.exists() ? mapPost(snapshot) : null),
      (error) => onError?.(error),
    )
  },

  async createPost(data, user) {
    const payload = {
      title: String(data.title || '').trim(),
      slug: data.slug || slugify(data.title),
      excerpt: String(data.excerpt || '').trim() || excerptFrom(data.content),
      content: String(data.content || ''),
      coverImage: String(data.coverImage || '').trim(),
      category: data.category || 'Life',
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status === 'published' ? 'published' : 'draft',
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Writer',
      likes: 0,
      likedBy: [],
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, POSTS), payload)
    return ref.id
  },

  async updatePost(postId, data) {
    const payload = {
      title: String(data.title || '').trim(),
      slug: data.slug || slugify(data.title),
      excerpt: String(data.excerpt || '').trim() || excerptFrom(data.content),
      content: String(data.content || ''),
      coverImage: String(data.coverImage || '').trim(),
      category: data.category || 'Life',
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status === 'published' ? 'published' : 'draft',
      updatedAt: serverTimestamp(),
    }
    await updateDoc(doc(db, POSTS, postId), payload)
    return postId
  },

  async deletePost(postId) {
    await deleteDoc(doc(db, POSTS, postId))
  },

  async toggleLike(postId, uid, liked) {
    await updateDoc(doc(db, POSTS, postId), {
      likes: increment(liked ? 1 : -1),
      likedBy: liked ? arrayUnion(uid) : arrayRemove(uid),
    })
  },

  async incrementViews(postId) {
    await updateDoc(doc(db, POSTS, postId), { views: increment(1) })
  },
}
