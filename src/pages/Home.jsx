import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import CoverImage from '../components/CoverImage'
import EmptyState from '../components/EmptyState'
import { ErrorPanel, SkeletonGrid } from '../components/Feedback'
import { Icon } from '../components/Icons'
import PostCard from '../components/PostCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePosts } from '../hooks/usePosts'
import { CATEGORIES } from '../lib/constants'
import { compactNumber, formatDate, readingTime, topTags } from '../lib/utils'

export default function Home() {
  useDocumentTitle()
  const navigate = useNavigate()
  const { posts, loading, error } = usePosts({ status: 'published' })
  const [query, setQuery] = useState('')

  const sorted = useMemo(
    () => [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [posts],
  )

  const featured = sorted[0]
  const latest = sorted.slice(1, 10)
  const tags = useMemo(() => topTags(posts, 6), [posts])
  const usedCategories = useMemo(
    () => CATEGORIES.filter((category) => posts.some((post) => post.category === category)),
    [posts],
  )
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
  const region = loading ? '—' : posts.length
  const topicCount = loading ? '—' : usedCategories.length
  const readCount = loading ? '—' : compactNumber(totalViews)

  function handleSearch(event) {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore')
  }

  function handleCategory(category) {
    navigate(`/explore?category=${encodeURIComponent(category)}`)
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> A journal for builders &amp; thinkers
            </span>
            <h1 className="hero-title">
              Ideas worth <em>keeping.</em>
            </h1>
            <p className="hero-lede">
              Inkwell is a calm place to write, publish and grow your ideas — with realtime
              updates, thoughtful reading and a little less noise.
            </p>

            <form className="hero-search" onSubmit={handleSearch} role="search">
              <Icon name="search" size={20} className="hero-search-icon" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search stories, tags or authors…"
                aria-label="Search stories"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            {tags.length > 0 && (
              <div className="hero-tags">
                <span className="hero-tags-label">Popular</span>
                {tags.map((tag) => (
                  <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="tag-pill">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="hero-stats">
              <div>
                <strong>{region}</strong>
                <span>stories</span>
              </div>
              <div>
                <strong>{topicCount}</strong>
                <span>topics</span>
              </div>
              <div>
                <strong>{readCount}</strong>
                <span>reads</span>
              </div>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-art-grid">
              <img src="/covers/cover-2.svg" alt="" className="hero-art-1" />
              <img src="/covers/cover-1.svg" alt="" className="hero-art-2" />
              <img src="/covers/cover-4.svg" alt="" className="hero-art-3" />
            </div>
            <div className="hero-float-card">
              <span className="pulse-dot" />
              <div>
                <strong>Published in realtime</strong>
                <span>Firestore listeners active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="section section-tight">
          <div className="container">
            <ErrorPanel
              title="The stories could not be loaded"
              message={error.message}
              action={
                <Link to="/guide" className="btn btn-secondary btn-sm">
                  Check the setup guide
                </Link>
              }
            />
          </div>
        </section>
      ) : (
        <>
          <section className="section section-tight">
            <div className="container">
              {loading ? (
                <div className="featured-skeleton">
                  <div className="skeleton skeleton-media" />
                  <div className="featured-body">
                    <div className="skeleton skeleton-line is-short" />
                    <div className="skeleton skeleton-line is-title" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line is-medium" />
                  </div>
                </div>
              ) : featured ? (
                <article className="featured-card reveal">
                  <Link to={`/post/${featured.id}`} className="featured-media" tabIndex={-1} aria-hidden="true">
                    <CoverImage src={featured.coverImage} category={featured.category} eager />
                  </Link>
                  <div className="featured-body">
                    <span className="featured-label">
                      <Icon name="star" size={14} /> Featured story
                    </span>
                    <h2>
                      <Link to={`/post/${featured.id}`}>{featured.title}</Link>
                    </h2>
                    <p>{featured.excerpt}</p>
                    <div className="featured-meta">
                      <Avatar name={featured.authorName} size="sm" />
                      <span className="featured-author">{featured.authorName}</span>
                      <span className="meta-sep">·</span>
                      <span>{formatDate(featured.createdAt)}</span>
                      <span className="meta-sep">·</span>
                      <span>{readingTime(featured.content)} min read</span>
                    </div>
                    <Link to={`/post/${featured.id}`} className="btn btn-light">
                      Read the story <Icon name="arrowRight" size={16} />
                    </Link>
                  </div>
                </article>
              ) : (
                <EmptyState
                  icon="pen"
                  title="The first story is waiting"
                  description="Publish a post and it will appear here instantly — no refresh required."
                  action={
                    <Link to="/write" className="btn btn-primary">
                      Write the first post <Icon name="arrowRight" size={16} />
                    </Link>
                  }
                />
              )}
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Fresh off the desk</span>
                  <h2 className="section-title">Latest stories</h2>
                </div>
                <Link to="/explore" className="text-link">
                  Browse everything <Icon name="arrowRight" size={16} />
                </Link>
              </div>

              {loading ? (
                <SkeletonGrid count={6} />
              ) : latest.length > 0 ? (
                <div className="post-grid">
                  {latest.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="layers"
                  title="More stories are on the way"
                  description="There is only one story so far. Explore it, or add your own."
                />
              )}
            </div>
          </section>
        </>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse by curiosity</span>
              <h2 className="section-title">Topics</h2>
            </div>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((category, index) => {
              const count = posts.filter((post) => post.category === category).length
              return (
                <button
                  key={category}
                  type="button"
                  className="category-card"
                  onClick={() => handleCategory(category)}
                >
                  <span className="category-index">0{index + 1}</span>
                  <span className="category-name">{category}</span>
                  <span className="category-count">
                    {count} {count === 1 ? 'story' : 'stories'}
                  </span>
                  <Icon name="arrowUpRight" size={18} className="category-arrow" />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="eyebrow eyebrow-light">Your turn</span>
              <h2>Have something worth saying?</h2>
              <p>
                Draft in Markdown, preview as you type, and publish in one click. Your words,
                delivered in realtime.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/write" className="btn btn-light">
                Start writing <Icon name="pen" size={16} />
              </Link>
              <Link to="/guide" className="btn btn-outline-light">
                See how it deploys
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
