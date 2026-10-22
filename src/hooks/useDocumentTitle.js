import { useEffect } from 'react'

const SUFFIX = 'Inkwell'
const DEFAULT_TITLE = 'Inkwell — Write what matters'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : DEFAULT_TITLE
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}
