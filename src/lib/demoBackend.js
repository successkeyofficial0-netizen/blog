import { DEMO_AUTHORS, DEMO_CREDENTIALS, DEMO_POSTS } from './seed'
import { excerptFrom, slugify } from './utils'

/**
 * A small Firebase-shaped backend that stores everything in localStorage.
 * It exists so the UI can be explored before a Firebase project is created.
 * It is NOT a security boundary — never use this in production.
 */

const KEYS = {
  users: 'inkwell.demo.users.v1',
  posts: 'inkwell.demo.posts.v1',
  session: 'inkwell.demo.session.v1',
}

const isBrowser = typeof window !== 'undefined'

function read(key, fallback) {
  if (!isBrowser) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Demo storage is full or unavailable.', error)
  }
}

function ensureSeed() {
  if (!isBrowser) return
  if (window.localStorage.getItem(KEYS.users) === null) {
    write(
      KEYS.users,
      Object.values(DEMO_AUTHORS).map((user) => ({ ...user })),
    )
  }
  if (window.localStorage.getItem(KEYS.posts) === null) {
    write(KEYS.posts, DEMO_POSTS)
  }
}

ensureSeed()

const authListeners = new Set()
const postListeners = new Set()

function fail(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function delay(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function newId(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return `${prefix}-${random}`
}

function publicUser(user) {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: null,
  }
}

function getUsers() {
  return read(KEYS.users, [])
}

function saveUsers(users) {
  write(KEYS.users, users)
}

function currentUser() {
  if (!isBrowser) return null
  const uid = read(KEYS.session, null)
  if (!uid) return null
  return publicUser(getUsers().find((user) => user.uid === uid))
}

function emitAuth() {
  const user = currentUser()
  authListeners.forEach((listener) => listener(user))
}

/* ── Auth ─────────────────────────────────────────────────────── */

export const demoAuthApi = {
  subscribe(callback) {
    authListeners.add(callback)
    const timer = setTimeout(() => callback(currentUser()), 60)
    return () => {
      clearTimeout(timer)
      authListeners.delete(callback)
    }
  },

  async signIn(email, password) {
    await delay()
    const normalized = String(email).trim().toLowerCase()
    const user = getUsers().find((item) => item.email === normalized)
    if (!user) throw fail('auth/user-not-found', 'No account found with that email.')
    if (user.password !== password) {
      throw fail('auth/wrong-password', 'Incorrect email or password.')
    }
    write(KEYS.session, user.uid)
    emitAuth()
    return publicUser(user)
  },

  async signUp(email, password, displayName) {
    await delay(200)
    const normalized = String(email).trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      throw fail('auth/invalid-email', 'That email address does not look right.')
    }
    if (String(password).length < 6) {
      throw fail('auth/weak-password', 'Password should be at least 6 characters.')
    }
    const users = getUsers()
    if (users.some((item) => item.email === normalized)) {
      throw fail('auth/email-already-in-use', 'An account with this email already exists.')
    }
    const user = {
      uid: newId('demo-user'),
      email: normalized,
      displayName: String(displayName || normalized.split('@')[0]).trim(),
      password,
    }
    saveUsers([...users, user])
    write(KEYS.session, user.uid)
    emitAuth()
    return publicUser(user)
  },

  async signOut() {
    await delay(80)
    if (isBrowser) window.localStorage.removeItem(KEYS.session)
    emitAuth()
  },

  async resetPassword(email) {
    await delay()
    const normalized = String(email).trim().toLowerCase()
    const exists = getUsers().some((item) => item.email === normalized)
    if (!exists) throw fail('auth/user-not-found', 'No account found with that email.')
    return true
  },
}

/* ── Posts ────────────────────────────────────────────────────── */

function getPosts() {
  return read(KEYS.posts, [])
}

function savePosts(posts) {
  write(KEYS.posts, posts)
  postListeners.forEach((listener) => listener())
}

function sortByNewest(posts) {
  return [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

function selectPosts({ status, authorId } = {}) {
  return sortByNewest(
    getPosts().filter((post) => {
      if (status && post.status !== status) return false
      if (authorId && post.authorId !== authorId) return false
      return true
    }),
  )
}

export const demoPostsApi = {
  subscribePosts(filters, callback, onError) {
    const run = () => {
      try {
        callback(selectPosts(filters))
      } catch (error) {
        onError?.(error)
      }
    }
    postListeners.add(run)
    const timer = setTimeout(run, 140)
    return () => {
      clearTimeout(timer)
      postListeners.delete(run)
    }
  },

  subscribePost(postId, callback, onError) {
    const run = () => {
      try {
        callback(getPosts().find((post) => post.id === postId) || null)
      } catch (error) {
        onError?.(error)
      }
    }
    postListeners.add(run)
    const timer = setTimeout(run, 120)
    return () => {
      clearTimeout(timer)
      postListeners.delete(run)
    }
  },

  async createPost(data, user) {
    await delay(60)
    if (!user) throw fail('permission-denied', 'Please sign in first.')
    const post = {
      id: newId('post'),
      title: data.title,
      slug: data.slug || slugify(data.title),
      excerpt: data.excerpt || excerptFrom(data.content),
      content: data.content,
      coverImage: data.coverImage || '',
      category: data.category || 'Life',
      tags: data.tags || [],
      status: data.status === 'published' ? 'published' : 'draft',
      authorId: user.uid,
      authorName: user.displayName || user.email,
      likes: 0,
      likedBy: [],
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    savePosts([post, ...getPosts()])
    return post.id
  },

  async updatePost(postId, data) {
    await delay(60)
    const posts = getPosts()
    const index = posts.findIndex((post) => post.id === postId)
    if (index === -1) throw fail('not-found', 'This post no longer exists.')
    const next = {
      ...posts[index],
      ...data,
      updatedAt: Date.now(),
    }
    posts[index] = next
    savePosts(posts)
    return postId
  },

  async deletePost(postId) {
    await delay(80)
    savePosts(getPosts().filter((post) => post.id !== postId))
  },

  async toggleLike(postId, uid, liked) {
    const posts = getPosts()
    const index = posts.findIndex((post) => post.id === postId)
    if (index === -1) return
    const post = posts[index]
    const likedBy = new Set(post.likedBy || [])
    if (liked) {
      if (likedBy.has(uid)) return
      likedBy.add(uid)
      post.likes = (post.likes || 0) + 1
    } else {
      if (!likedBy.has(uid)) return
      likedBy.delete(uid)
      post.likes = Math.max(0, (post.likes || 0) - 1)
    }
    post.likedBy = [...likedBy]
    posts[index] = post
    savePosts(posts)
  },

  async incrementViews(postId) {
    const posts = getPosts()
    const index = posts.findIndex((post) => post.id === postId)
    if (index === -1) return
    posts[index] = { ...posts[index], views: (posts[index].views || 0) + 1 }
    savePosts(posts)
  },
}

export const demoCredentials = DEMO_CREDENTIALS

export function resetDemoData() {
  if (!isBrowser) return
  window.localStorage.removeItem(KEYS.posts)
  window.localStorage.removeItem(KEYS.users)
  window.localStorage.removeItem(KEYS.session)
  ensureSeed()
  postListeners.forEach((listener) => listener())
  emitAuth()
}
