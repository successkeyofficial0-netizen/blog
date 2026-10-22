import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { ErrorPanel, SkeletonGrid } from '../components/Feedback'
import { Icon } from '../components/Icons'
import PostCard from '../components/PostCard'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePosts } from '../hooks/usePosts'
import { CATEGORIES, PAGE_SIZE, SORT_OPTIONS } from '../lib/constants'
import { filterAndSortPosts, topTags } from '../lib/utils'

export default function Explore() {
  useDocumentTitle('Explore stories')
  const [params, setParams] = useSearchParams()
  const queryParam = params.get('q') || ''
  const category = params.get('category') || 'all'
  const tag = params.get('tag') || ''
  const sort = params.get('sort') || 'newest'

  const [query, setQuery] = useState(queryParam)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const debouncedQuery = useDebouncedValue(query, 220)
  const { posts, loading, error } = usePosts({ status: 'published' })

  useEffect(() => {
    setQuery(queryParam)
  }, [queryParam])

  useEffect(() => {
    const nextQuery = debouncedQuery.trim()
    if (nextQuery === queryParam) return
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (nextQuery) next.set('q', nextQuery)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [debouncedQuery, queryParam, setParams])

  const updateParam = (key, value) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      const isDefault = !value || value === 'all' || (key === 'sort' && value === 'newest')
      if (isDefault) next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  const clearAll = () => {
    setQuery('')
    setParams({})
  }

  const filtered = useMemo(
    () =>
      filterAndSortPosts(posts, {
        query: debouncedQuery,
        category,
        tag,
        sort,
      }),
    [posts, debouncedQuery, category, tag, sort],
  )

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [debouncedQuery, category, tag, sort])

  const tags = useMemo(() => topTags(posts, 9), [posts])
  const shown = filtered.slice(0, visible)
  const hasFilters = Boolean(debouncedQuery || category !== 'all' || tag || sort !== 'newest')

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Explore the archive
          </span>
          <h1 className="page-title">
            Find your next <em>good read.</em>
          </h1>
          <p className="page-lede">
            Search every story by title, tag, author or idea. Filter by topic, then sort by what
            matters to you.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="filter-panel">
            <div className="filter-top">
              <div className="filter-search">
                <Icon name="search" size={19} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search stories…"
                  aria-label="Search stories"
                />
                {query && (
                  <button
                    type="button"
                    className="filter-clear"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <Icon name="close" size={15} />
                  </button>
                )}
              </div>

              <label className="select-wrap">
                <Icon name="filter" size={16} />
                <span className="sr-only">Sort stories</span>
                <select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Icon name="chevronDown" size={15} className="select-chevron" />
              </label>
            </div>

            <div className="chip-row" role="group" aria-label="Filter by category">
              <button
                type="button"
                className={`chip${category === 'all' ? ' is-active' : ''}`}
                onClick={() => updateParam('category', 'all')}
              >
                All stories
                <span className="chip-count">{posts.length}</span>
              </button>
              {CATEGORIES.map((name) => {
                const count = posts.filter((post) => post.category === name).length
                return (
                  <button
                    key={name}
                    type="button"
                    className={`chip${category === name ? ' is-active' : ''}`}
                    onClick={() => updateParam('category', name)}
                  >
                    {name}
                    <span className="chip-count">{count}</span>
                  </button>
                )
              })}
            </div>

            {tags.length > 0 && (
              <div className="chip-row chip-row-tags">
                <span className="chip-label">
                  <Icon name="tag" size={14} /> Tags
                </span>
                {tags.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`tag-chip${tag === name ? ' is-active' : ''}`}
                    onClick={() => updateParam('tag', tag === name ? '' : name)}
                  >
                    #{name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="results-bar">
            <p>
              <strong>{filtered.length}</strong> {filtered.length === 1 ? 'story' : 'stories'}
              {debouncedQuery && (
                <>
                  {' '}
                  for <span className="results-query">“{debouncedQuery}”</span>
                </>
              )}
              {tag && <span className="results-tag"> tagged #{tag}</span>}
            </p>
            {hasFilters && (
              <button type="button" className="text-link" onClick={clearAll}>
                Clear all filters <Icon name="close" size={14} />
              </button>
            )}
          </div>

          {error ? (
            <ErrorPanel
              title="Search is unavailable"
              message={error.message}
              action={
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
                  Reload
                </button>
              }
            />
          ) : loading ? (
            <SkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="search"
              title="No stories match that search"
              description="Try fewer words, a different topic, or clear the filters to see everything."
              action={
                <button type="button" className="btn btn-primary" onClick={clearAll}>
                  Reset filters
                </button>
              }
            />
          ) : (
            <>
              <div className="post-grid">
                {shown.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="load-more">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setVisible((count) => count + PAGE_SIZE)}
                  >
                    Load {Math.min(PAGE_SIZE, filtered.length - visible)} more
                    <Icon name="arrowDown" size={16} />
                  </button>
                  <p>
                    Showing {shown.length} of {filtered.length} stories
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
