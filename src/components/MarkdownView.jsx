import { useEffect, useMemo, useRef } from 'react'
import { decorateArticle, renderMarkdown } from '../lib/markdown'
import { cls } from '../lib/utils'

export default function MarkdownView({ content = '', className = '', empty = null }) {
  const ref = useRef(null)
  const html = useMemo(() => renderMarkdown(content), [content])

  useEffect(() => {
    const cleanup = decorateArticle(ref.current)
    return cleanup
  }, [html])

  if (!html) return empty

  return (
    <div
      ref={ref}
      className={cls('prose', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
