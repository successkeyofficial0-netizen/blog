import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

/** Markdown → sanitized HTML. Safe for dangerouslySetInnerHTML. */
export function renderMarkdown(markdown = '') {
  if (!markdown) return ''
  const html = marked.parse(String(markdown), { async: false })
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  })

  // Wide tables scroll inside their own container instead of widening the page.
  return clean
    .replace(/<table/g, '<div class="table-wrap"><table')
    .replace(/<\/table>/g, '</table></div>')
}

/** Adds copy buttons + safe external links to rendered article HTML. */
export function decorateArticle(root) {
  if (!root) return () => {}

  const cleanups = []

  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy')) return
    pre.classList.add('code-block')
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy'
    button.textContent = 'Copy'
    const onClick = async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText
      try {
        await navigator.clipboard.writeText(code)
        button.textContent = 'Copied!'
        setTimeout(() => {
          button.textContent = 'Copy'
        }, 1600)
      } catch {
        button.textContent = 'Press Ctrl+C'
      }
    }
    button.addEventListener('click', onClick)
    pre.appendChild(button)
    cleanups.push(() => button.removeEventListener('click', onClick))
  })

  root.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href') || ''
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank')
      anchor.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return () => cleanups.forEach((fn) => fn())
}
