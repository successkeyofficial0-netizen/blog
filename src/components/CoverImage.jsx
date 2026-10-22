import { useEffect, useState } from 'react'
import { CATEGORY_META } from '../lib/constants'
import { cls } from '../lib/utils'

export default function CoverImage({ src, alt = '', category = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const tone = CATEGORY_META[category]?.tone || 'teal'

  if (!src || failed) {
    return (
      <div className={cls('cover-fallback', `tone-${tone}`, className)} aria-hidden="true">
        <span className="cover-fallback-grid" />
        <span className="cover-fallback-label">{category || 'Inkwell'}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
