import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import CoverImage from '../components/CoverImage'
import EmptyState from '../components/EmptyState'
import { ErrorPanel } from '../components/Feedback'
import { Icon } from '../components/Icons'
import MarkdownView from '../components/MarkdownView'
import PostCard from '../components/PostCard'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePost, usePosts } from '../hooks/usePosts'
import { postsApi } from '../lib/backend'
import {
  compactNumber,
  copyText,
  formatDate,
  friendlyError,
  readingTime,
} from '../lib/utils'

export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { post, loading, error } = usePost(postId)
  const { posts } = usePosts({ status: 'published' })
  const [progress, setProgress] = useState(0)
  const [likeBusy, setLikeBusy] = useState(false)

  useDocumentTitle(post?.title)

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setProgress(max > 0 ? Math.min(100, (root.scrollTop / max) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [postId])

  useEffect(() => {
    if (!post || post.status !== 'published') return
    const key = `inkwell.viewed.${post.id}`
    try {
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')
    } catch {
      /* private mode — still count the view */
    }
    postsApi.incrementViews(post.id).catch(() => {})
  }, [post])

  const isOwner = Boolean(user && post && post.authorId === user.uid)
  const isPrivate = Boolean(post && post.status !== 'published' && !isOwner)
  const liked = Boolean(user && (post?.likedBy || []).includes(user.uid))

  const related = useMemo(() => {
    if (!post) return []
    return posts
      .filter((item) => item.id !== post.id)
      .sort((a, b) => {
        const aScore = a.category === post.category ? 1 : 0
        const bScore = b.category === post.category ? 1 : 0
        return bScore - aScore || (b.createdAt || 0) - (a.createdAt || 0)
      })
      .slice(0, 3)
  }, [posts, post])

  async function handleLike() {
    if (!post) return
    if (!user) {
      toast.info('Sign in to like this story.')
      navigate('/login', { state: { from: `/post/${post.id}` } })
      return
    }
    setLikeBusy(true)
    try {
      await postsApi.toggleLike(post.id, user.uid, !liked)
    } catch (likeError) {
      toast.error(friendlyError(likeError))
    } finally {
      setLikeBusy(false)
    }
  }

  async function handleCopy() {
    const ok = await copyText(window.location.href)
    if (ok) toast.success('Link copied to your clipboard.')
    else toast.error('Could not copy the link. Copy it from the address bar instead.')
  }

  if (loading) {
    return (
      <div className="container article-loading" role="status" aria-label="Loading story">
        <div className="skeleton skeleton-line is-short" />
        <div className="skeleton skeleton-line is-hero-title" />
        <div className="skeleton skeleton-line is-medium" />
        <div className="skeleton skeleton-article-cover" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line is-medium" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container section">
        <ErrorPanel
          title="This story could not be loaded"
          message={error.message}
          action={
            <Link to="/explore" className="btn btn-secondary btn-sm">
              Back to explore
            </Link>
          }
        />
      </div>
    )
  }

  if (!post || isPrivate) {
    return (
      <div className="container section">
        <EmptyState
          icon="lock"
          title="This story is not available"
          description="It may have been unpublished, deleted, or it is still a private draft."
          action={
            <Link to="/explore" className="btn btn-primary">
              Explore published stories <Icon name="arrowRight" size={16} />
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <>
      <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <article className="article-page">
        <header className="article-header">
          <div className="article-kicker">
            <Link
              to={`/explore?category=${encodeURIComponent(post.category || 'all')}`}
              className="pill-category"
            >
              {post.category || 'Story'}
            </Link>
            {post.status !== 'published' && <span className="badge badge-draft">Draft preview</span>}
            <span className="article-kicker-time">{readingTime(post.content)} min read</span>
          </div>

          <h1 className="article-title">{post.title}</h1>
          {post.excerpt && <p className="article-lede">{post.excerpt}</p>}

          <div className="article-meta">
            <Avatar name={post.authorName} size="md" />
            <div className="article-byline">
              <strong>{post.authorName}</strong>
              <span>
                {formatDate(post.createdAt)} · {compactNumber(post.views || 0)}{' '}
                {(post.views || 0) === 1 ? 'view' : 'views'}
              </span>
            </div>

            <div className="article-actions">
              <button
                type="button"
                className={`action-btn${liked ? ' is-liked' : ''}`}
                onClick={handleLike}
                disabled={likeBusy}
                aria-pressed={liked}
                title={liked ? 'Remove like' : 'Like this story'}
              >
                <Icon name="heart" size={17} />
                <span>{post.likes || 0}</span>
              </button>
              <button type="button" className="action-btn" onClick={handleCopy} title="Copy link">
                <Icon name="link" size={17} />
                <span className="action-label">Copy link</span>
              </button>
              {isOwner && (
                <Link to={`/edit/${post.id}`} className="action-btn" title="Edit this story">
                  <Icon name="edit" size={17} />
                  <span className="action-label">Edit</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <figure className="article-cover">
          <CoverImage src={post.coverImage} category={post.category} alt={`Cover for ${post.title}`} eager />
        </figure>

        <div className="article-body">
          {post.status !== 'published' && (
            <div className="draft-banner">
              <Icon name="eye" size={18} />
              <div>
                <strong>Draft preview</strong>
                <p>Only you can see this story. Publish it from the editor when it is ready.</p>
              </div>
              <Link to={`/edit/${post.id}`} className="btn btn-secondary btn-sm">
                Continue editing
              </Link>
            </div>
          )}

          <MarkdownView content={post.content} className="article-prose" />

          {post.tags?.length > 0 && (
            <div className="article-tags">
              <span className="chip-label">
                <Icon name="tag" size={14} /> Tagged
              </span>
              {post.tags.map((tag) => (
                <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="tag-pill">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="article-divider" />

          <section className="author-card">
            <Avatar name={post.authorName} size="lg" />
            <div className="author-card-copy">
              <span className="eyebrow">Written by</span>
              <h3>{post.authorName}</h3>
              <p>
                Independent writer and builder, sharing notes on craft, code and the occasional
                detour. Published on Inkwell.
              </p>
            </div>
            <Link
              to={`/explore?q=${encodeURIComponent(post.authorName)}`}
              className="btn btn-secondary btn-sm"
            >
              More by {String(post.authorName).split(' ')[0]} <Icon name="arrowRight" size={15} />
            </Link>
          </section>

          {related.length > 0 && (
            <section className="related">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Keep reading</span>
                  <h2 className="section-title">You might also like</h2>
                </div>
                <Link to="/explore" className="text-link">
                  Explore all <Icon name="arrowRight" size={16} />
                </Link>
              </div>
              <div className="post-grid">
                {related.map((item, index) => (
                  <PostCard key={item.id} post={item} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
