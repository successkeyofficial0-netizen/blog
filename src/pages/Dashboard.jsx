import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import ConfirmDialog from '../components/ConfirmDialog'
import CoverImage from '../components/CoverImage'
import EmptyState from '../components/EmptyState'
import { ErrorPanel, Spinner } from '../components/Feedback'
import { Icon } from '../components/Icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePosts } from '../hooks/usePosts'
import { isDemo, postsApi } from '../lib/backend'
import {
  compactNumber,
  formatDate,
  friendlyError,
  readingTime,
} from '../lib/utils'

const TABS = [
  { value: 'all', label: 'All posts' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

const SORTS = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'created', label: 'Newest first' },
  { value: 'views', label: 'Most viewed' },
  { value: 'likes', label: 'Most liked' },
  { value: 'title', label: 'Title A → Z' },
]

export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const toast = useToast()
  const { posts, loading, error } = usePosts({ authorId: user?.uid })
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('updated')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((post) => post.status === 'published').length,
      drafts: posts.filter((post) => post.status === 'draft').length,
      views: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      likes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
    }),
    [posts],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = posts.filter((post) => {
      if (tab !== 'all' && post.status !== tab) return false
      if (!needle) return true
      return [post.title, post.excerpt, post.category, (post.tags || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })

    const sorters = {
      updated: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
      created: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      views: (a, b) => (b.views || 0) - (a.views || 0),
      likes: (a, b) => (b.likes || 0) - (a.likes || 0),
      title: (a, b) => String(a.title).localeCompare(String(b.title)),
    }

    return [...list].sort(sorters[sort] || sorters.updated)
  }, [posts, tab, query, sort])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await postsApi.deletePost(deleteTarget.id)
      toast.success(`“${deleteTarget.title}” was deleted.`)
      setDeleteTarget(null)
    } catch (deleteError) {
      toast.error(friendlyError(deleteError))
    } finally {
      setDeleting(false)
    }
  }

  const firstName = (user?.displayName || 'writer').split(' ')[0]

  return (
    <>
      <section className="page-head page-head-compact">
        <div className="container dashboard-head">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Your workspace
            </span>
            <h1 className="page-title">
              Hello, <em>{firstName}.</em>
            </h1>
            <p className="page-lede">
              Everything you have written, in one calm place. Drafts stay private until you
              publish.
            </p>
          </div>
          <div className="dashboard-head-actions">
            <Link to="/write" className="btn btn-primary">
              <Icon name="plus" size={17} /> New post
            </Link>
            <Link to="/explore" className="btn btn-secondary">
              Browse stories
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-icon"><Icon name="book" size={19} /></span>
              <div>
                <strong>{loading ? '—' : stats.total}</strong>
                <span>Total posts</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon is-green"><Icon name="globe" size={19} /></span>
              <div>
                <strong>{loading ? '—' : stats.published}</strong>
                <span>Published</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon is-amber"><Icon name="edit" size={19} /></span>
              <div>
                <strong>{loading ? '—' : stats.drafts}</strong>
                <span>Drafts</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon is-blue"><Icon name="eye" size={19} /></span>
              <div>
                <strong>{loading ? '—' : compactNumber(stats.views)}</strong>
                <span>Total reads</span>
              </div>
              <span className="stat-extra">
                <Icon name="heart" size={13} /> {stats.likes}
              </span>
            </div>
          </div>

          <div className="dashboard-toolbar">
            <div className="tab-row" role="tablist" aria-label="Filter posts by status">
              {TABS.map((item) => {
                const count =
                  item.value === 'all'
                    ? stats.total
                    : item.value === 'published'
                      ? stats.published
                      : stats.drafts
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.value}
                    className={`tab${tab === item.value ? ' is-active' : ''}`}
                    onClick={() => setTab(item.value)}
                  >
                    {item.label}
                    <span className="tab-count">{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="toolbar-right">
              <div className="filter-search filter-search-sm">
                <Icon name="search" size={17} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search your posts…"
                  aria-label="Search your posts"
                />
              </div>
              <label className="select-wrap select-wrap-sm">
                <span className="sr-only">Sort posts</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Icon name="chevronDown" size={15} className="select-chevron" />
              </label>
            </div>
          </div>

          {error ? (
            <ErrorPanel title="Your posts could not be loaded" message={error.message} />
          ) : loading ? (
            <div className="dash-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="dash-row is-skeleton">
                  <div className="skeleton skeleton-thumb" />
                  <div className="dash-info">
                    <div className="skeleton skeleton-line is-title" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line is-medium" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={tab === 'draft' ? 'edit' : 'pen'}
              title={
                query
                  ? 'No posts match that search'
                  : tab === 'draft'
                    ? 'No drafts yet'
                    : tab === 'published'
                      ? 'Nothing published yet'
                      : 'Your first story starts here'
              }
              description={
                query
                  ? 'Try a different word, or clear the search to see everything.'
                  : 'Write an idea, save it as a draft, and publish when it feels ready.'
              }
              action={
                query ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setQuery('')}>
                    Clear search
                  </button>
                ) : (
                  <Link to="/write" className="btn btn-primary">
                    <Icon name="plus" size={16} /> Write a post
                  </Link>
                )
              }
            />
          ) : (
            <div className="dash-list">
              <div className="dash-list-head" aria-hidden="true">
                <span>Story</span>
                <span>Status</span>
                <span>Updated</span>
                <span>Reads</span>
                <span>Likes</span>
                <span className="sr-only">Actions</span>
              </div>
              {filtered.map((post) => (
                <article key={post.id} className="dash-row">
                  <div className="dash-story">
                    <Link
                      to={post.status === 'published' ? `/post/${post.id}` : `/edit/${post.id}`}
                      className="dash-thumb"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <CoverImage src={post.coverImage} category={post.category} />
                    </Link>
                    <div className="dash-info">
                      <Link
                        to={post.status === 'published' ? `/post/${post.id}` : `/edit/${post.id}`}
                        className="dash-title"
                      >
                        {post.title}
                      </Link>
                      <p className="dash-excerpt">{post.excerpt}</p>
                      <div className="dash-tags">
                        <span className="dash-category">{post.category}</span>
                        {(post.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="dash-tag">#{tag}</span>
                        ))}
                        <span className="dash-reading">
                          <Icon name="clock" size={12} /> {readingTime(post.content)} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="dash-cell dash-status">
                    <span className={`badge ${post.status === 'published' ? 'badge-live' : 'badge-draft'}`}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="dash-cell dash-date">
                    <span className="dash-mobile-label">Updated</span>
                    {formatDate(post.updatedAt || post.createdAt)}
                  </div>
                  <div className="dash-cell dash-number">
                    <span className="dash-mobile-label">Reads</span>
                    {(post.views || 0).toLocaleString()}
                  </div>
                  <div className="dash-cell dash-number">
                    <span className="dash-mobile-label">Likes</span>
                    {post.likes || 0}
                  </div>

                  <div className="dash-actions">
                    <Link
                      to={post.status === 'published' ? `/post/${post.id}` : `/edit/${post.id}`}
                      className="icon-btn"
                      aria-label={`Open “${post.title}”`}
                      title="Open"
                    >
                      <Icon name="external" size={17} />
                    </Link>
                    <Link
                      to={`/edit/${post.id}`}
                      className="icon-btn"
                      aria-label={`Edit “${post.title}”`}
                      title="Edit"
                    >
                      <Icon name="edit" size={17} />
                    </Link>
                    <button
                      type="button"
                      className="icon-btn is-danger"
                      onClick={() => setDeleteTarget(post)}
                      aria-label={`Delete “${post.title}”`}
                      title="Delete"
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {isDemo && (
            <p className="demo-footnote">
              <Icon name="info" size={14} /> Demo mode: your posts are saved in this browser. Connect
              Firebase to sync them across devices.
            </p>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this story?"
        message={`“${deleteTarget?.title || ''}” will be permanently deleted, along with its likes and views. This cannot be undone.`}
        confirmLabel="Delete story"
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
