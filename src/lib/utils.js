/** Small, dependency-free helpers shared across the app. */

export function cls(...values) {
  return values.filter(Boolean).join(' ')
}

export function formatDate(value, options = {}) {
  const ms = toMillis(value)
  if (!ms) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(ms))
}

export function toMillis(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  if (typeof value?.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function timeAgo(value) {
  const ms = toMillis(value)
  if (!ms) return 'just now'
  const seconds = Math.max(1, Math.round((Date.now() - ms) / 1000))
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secondsInUnit] of units) {
    const amount = Math.floor(seconds / secondsInUnit)
    if (amount >= 1) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        -amount,
        unit,
      )
    }
  }
  return 'just now'
}

export function readingTime(text = '') {
  const words = countWords(text)
  return Math.max(1, Math.round(words / 200))
}

export function countWords(text = '') {
  return String(text).trim().split(/\s+/).filter(Boolean).length
}

export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

/** Builds a plain-text summary from markdown. */
export function excerptFrom(markdown = '', maxLength = 165) {
  const plain = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= maxLength) return plain
  const cut = plain.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : maxLength).trim()}…`
}

export function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IW'
}

const TONES = ['sage', 'amber', 'rose', 'blue', 'violet', 'sand']

export function avatarTone(seed = '') {
  let hash = 0
  for (let i = 0; i < String(seed).length; i += 1) {
    hash = (hash * 31 + String(seed).charCodeAt(i)) % 9973
  }
  return TONES[hash % TONES.length]
}

export function compactNumber(value = 0) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value)
}

/** Groups posts by category and returns the most used ones. */
export function topTags(posts = [], limit = 10) {
  const counts = new Map()
  for (const post of posts) {
    for (const tag of post.tags || []) {
      const key = String(tag).trim()
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag)
}

export function filterAndSortPosts(posts = [], filters = {}) {
  const { query = '', category = 'all', tag = '', sort = 'newest' } = filters
  const needle = query.trim().toLowerCase()

  const filtered = posts.filter((post) => {
    if (category && category !== 'all' && post.category !== category) return false
    if (tag && !(post.tags || []).includes(tag)) return false
    if (!needle) return true
    const haystack = [
      post.title,
      post.excerpt,
      post.content,
      post.category,
      post.authorName,
      ...(post.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return needle.split(/\s+/).every((word) => haystack.includes(word))
  })

  const sorters = {
    newest: (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt),
    oldest: (a, b) => toMillis(a.createdAt) - toMillis(b.createdAt),
    popular: (a, b) =>
      (b.likes || 0) * 3 + (b.views || 0) - ((a.likes || 0) * 3 + (a.views || 0)),
    title: (a, b) => String(a.title).localeCompare(String(b.title)),
  }

  return [...filtered].sort(sorters[sort] || sorters.newest)
}

export function safeImage(url, fallback = '') {
  if (!url) return fallback
  if (/^(https?:\/\/|\/)/i.test(url)) return url
  return fallback
}

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

const AUTH_MESSAGES = {
  'auth/invalid-email': 'That email address does not look right.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-login-credentials': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please try again in a minute.',
  'auth/network-request-failed': 'Network error. Check your connection and retry.',
  'auth/missing-password': 'Please enter your password.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'permission-denied': 'You do not have permission to do that.',
  'unavailable': 'Could not reach the server. Check your connection.',
  'failed-precondition': 'Firestore needs an index for this query.',
}

export function friendlyError(error) {
  if (!error) return 'Something went wrong. Please try again.'
  const code = error.code || ''
  if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]
  const message = String(error.message || '')
  if (message.includes('Missing or insufficient permissions')) {
    return 'Firestore rules blocked this action. Check firestore.rules.'
  }
  if (message.includes('client is offline')) {
    return 'You appear to be offline. Reconnect and try again.'
  }
  return message || 'Something went wrong. Please try again.'
}
