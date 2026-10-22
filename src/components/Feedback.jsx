export function Spinner({ size = 20, label, className = '' }) {
  return (
    <span
      className={`spinner ${className}`.trim()}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    />
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status">
      <Spinner size={28} />
      <p>{label}</p>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="post-card is-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-media" />
      <div className="post-card-body">
        <div className="skeleton skeleton-line is-short" />
        <div className="skeleton skeleton-line is-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line is-medium" />
        <div className="skeleton-row">
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton skeleton-line is-tiny" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="post-grid">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function ErrorPanel({ title = 'Something went wrong', message, onRetry, action }) {
  return (
    <div className="panel panel-error" role="alert">
      <span className="panel-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </span>
      <div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
      </div>
      {(onRetry || action) && (
        <div className="panel-actions">
          {onRetry && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
              Try again
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
