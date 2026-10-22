import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import CoverImage from '../components/CoverImage'
import EmptyState from '../components/EmptyState'
import { ErrorPanel, PageLoader, Spinner } from '../components/Feedback'
import { Icon } from '../components/Icons'
import MarkdownView from '../components/MarkdownView'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePost } from '../hooks/usePosts'
import { postsApi } from '../lib/backend'
import { CATEGORIES, SAMPLE_COVERS } from '../lib/constants'
import {
  countWords,
  excerptFrom,
  friendlyError,
  readingTime,
  slugify,
} from '../lib/utils'

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'Engineering',
  tags: '',
}

const VIEWS = [
  { value: 'write', label: 'Write' },
  { value: 'split', label: 'Split' },
  { value: 'preview', label: 'Preview' },
]

export default function PostEditor() {
  const { postId } = useParams()
  const isEditing = Boolean(postId)
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { post, loading, error } = usePost(postId)

  useDocumentTitle(isEditing ? 'Edit story' : 'New story')

  const [form, setForm] = useState(EMPTY_FORM)
  const [initialized, setInitialized] = useState(!isEditing)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'split'
    return window.matchMedia('(max-width: 720px)').matches ? 'write' : 'split'
  })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const textareaRef = useRef(null)

  const isOwner = Boolean(post && user && post.authorId === user.uid)

  useEffect(() => {
    if (!isEditing || !post || initialized) return
    if (post.authorId !== user?.uid) return
    setForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      category: post.category || 'Engineering',
      tags: (post.tags || []).join(', '),
    })
    setInitialized(true)
  }, [isEditing, post, user, initialized])

  useEffect(() => {
    if (!dirty) return undefined
    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const parsedTags = useMemo(() => {
    const seen = new Set()
    return form.tags
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter((tag) => {
        const key = tag.toLowerCase()
        if (!tag || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 8)
  }, [form.tags])

  const words = countWords(form.content)

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
    setDirty(true)
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: '' }))
  }

  function removeTag(tag) {
    update(
      'tags',
      parsedTags.filter((item) => item !== tag).join(', '),
    )
  }

  function wrapSelection(before, after, placeholder) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.slice(start, end) || placeholder
    const next =
      form.content.slice(0, start) + before + selected + after + form.content.slice(end)
    update('content', next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  function prefixLine(prefix, placeholder) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const value = form.content
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const isEmptyLine = value.slice(lineStart).startsWith('\n') || lineStart === value.length
    const insertion = prefix + (isEmptyLine ? placeholder : '')
    update('content', value.slice(0, lineStart) + insertion + value.slice(lineStart))
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertion.length, start + insertion.length)
    })
  }

  function insertSnippet(snippet) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    update('content', form.content.slice(0, start) + snippet + form.content.slice(end))
    requestAnimationFrame(() => {
      textarea.focus()
      const position = start + snippet.length
      textarea.setSelectionRange(position, position)
    })
  }

  const tools = [
    { icon: 'bold', label: 'Bold', run: () => wrapSelection('**', '**', 'bold text') },
    { icon: 'italic', label: 'Italic', run: () => wrapSelection('_', '_', 'italic text') },
    { icon: 'heading', label: 'Heading', run: () => prefixLine('## ', 'Heading') },
    { icon: 'quote', label: 'Quote', run: () => prefixLine('> ', 'A memorable line') },
    { icon: 'list', label: 'Bullet list', run: () => prefixLine('- ', 'List item') },
    { icon: 'code', label: 'Code block', run: () => insertSnippet('\n```js\n// your code\n```\n') },
    { icon: 'link', label: 'Link', run: () => wrapSelection('[', '](https://example.com)', 'link text') },
    { icon: 'image', label: 'Image', run: () => insertSnippet('\n![Alt text](https://images.example.com/photo.jpg)\n') },
  ]

  function validate() {
    const next = {}
    if (form.title.trim().length < 4) {
      next.title = 'Give your story a title of at least 4 characters.'
    }
    if (form.content.trim().length < 30) {
      next.content = 'Write at least a few sentences (30 characters) so readers have something to read.'
    }
    if (!form.category) next.category = 'Choose a category.'
    if (form.excerpt.length > 240) next.excerpt = 'Keep the excerpt under 240 characters.'
    if (parsedTags.length >= 8 && form.tags.split(',').length > 8) {
      next.tags = 'Use up to 8 tags.'
    }
    if (form.coverImage.trim() && !/^(https?:\/\/|\/)/i.test(form.coverImage.trim())) {
      next.coverImage = 'Use a full image URL starting with https:// or a path starting with /.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error('Please fix the highlighted fields before saving.')
      return false
    }
    return true
  }

  async function handleSave(status) {
    if (!validate()) return
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || excerptFrom(form.content, 180),
      content: form.content,
      coverImage: form.coverImage.trim(),
      category: form.category,
      tags: parsedTags,
      status,
      slug: slugify(form.title),
    }

    try {
      if (isEditing) {
        await postsApi.updatePost(postId, payload)
        setDirty(false)
        if (status === 'published') {
          toast.success('Story updated and live.')
          navigate(`/post/${postId}`)
        } else {
          toast.success(post?.status === 'published' ? 'Story moved to drafts.' : 'Draft saved.')
        }
      } else {
        const newId = await postsApi.createPost(payload, user)
        setDirty(false)
        if (status === 'published') {
          toast.success('Published! Your story is live.')
          navigate(`/post/${newId}`, { replace: true })
        } else {
          toast.success('Draft saved. Find it in your dashboard.')
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (saveError) {
      toast.error(friendlyError(saveError))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await postsApi.deletePost(postId)
      setDirty(false)
      toast.success('Story deleted.')
      navigate('/dashboard', { replace: true })
    } catch (deleteError) {
      toast.error(friendlyError(deleteError))
      setDeleting(false)
    }
  }

  if (isEditing && loading) {
    return <PageLoader label="Opening your story…" />
  }

  if (isEditing && error) {
    return (
      <div className="container section">
        <ErrorPanel
          title="This story could not be opened"
          message={error.message}
          action={
            <Link to="/dashboard" className="btn btn-secondary btn-sm">
              Back to dashboard
            </Link>
          }
        />
      </div>
    )
  }

  if (isEditing && !loading && !post) {
    return (
      <div className="container section">
        <EmptyState
          icon="search"
          title="Story not found"
          description="It may have been deleted, or the link is incomplete."
          action={
            <Link to="/dashboard" className="btn btn-primary">
              Back to dashboard
            </Link>
          }
        />
      </div>
    )
  }

  if (isEditing && post && !isOwner) {
    return (
      <div className="container section">
        <EmptyState
          icon="lock"
          title="This story belongs to another writer"
          description="You can only edit posts that you have written."
          action={
            <Link to={`/post/${post.id}`} className="btn btn-primary">
              Read the story instead
            </Link>
          }
        />
      </div>
    )
  }

  const statusLabel = isEditing
    ? post?.status === 'published'
      ? 'Published'
      : 'Draft'
    : 'New draft'

  return (
    <>
      <div className="editor-topbar">
        <div className="container editor-topbar-inner">
          <div className="editor-topbar-left">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <Icon name="arrowLeft" size={16} /> Back
            </button>
            <span className={`save-state${dirty ? ' is-dirty' : ''}`}>
              <span className="status-dot" />
              {saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>
          <div className="editor-topbar-actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn-ghost btn-sm is-danger editor-delete"
                onClick={() => setDeleteOpen(true)}
                title="Delete this story"
              >
                <Icon name="trash" size={16} />
                <span className="hide-sm">Delete</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              Save draft
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSave('published')}
              disabled={saving}
            >
              {saving ? <Spinner size={15} /> : <Icon name="send" size={15} />}
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="container editor-grid">
        <div className="editor-main">
          <div className="editor-title-block">
            <label htmlFor="story-title" className="sr-only">
              Story title
            </label>
            <input
              id="story-title"
              type="text"
              className="editor-title-input"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Give your story a title…"
              maxLength={120}
              autoFocus={!isEditing}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="editor-panes-toolbar">
            <div className="md-toolbar" role="toolbar" aria-label="Markdown formatting">
              {tools.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  className="md-btn"
                  onClick={tool.run}
                  title={tool.label}
                  aria-label={tool.label}
                >
                  <Icon name={tool.icon} size={17} />
                </button>
              ))}
            </div>
            <div className="view-switch" role="group" aria-label="Editor view">
              {VIEWS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={view === option.value ? 'is-active' : ''}
                  onClick={() => setView(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`editor-panes view-${view}`}>
            <div className="editor-write">
              <textarea
                ref={textareaRef}
                className="editor-textarea"
                value={form.content}
                onChange={(event) => update('content', event.target.value)}
                placeholder={'Start writing…\n\n## A heading\n\nMarkdown is supported: **bold**, _italic_, lists, quotes, links and code blocks.'}
                spellCheck="true"
                aria-label="Story content in Markdown"
              />
              {errors.content && <p className="field-error editor-content-error">{errors.content}</p>}
            </div>

            <div className="editor-preview">
              <div className="editor-preview-head">
                <span>
                  <Icon name="eye" size={15} /> Live preview
                </span>
                <span className="editor-preview-lang">Markdown</span>
              </div>
              <div className="editor-preview-body">
                <h1 className="preview-title">{form.title || 'Untitled story'}</h1>
                {form.excerpt && <p className="preview-excerpt">{form.excerpt}</p>}
                <MarkdownView
                  content={form.content}
                  className="article-prose preview-prose"
                  empty={
                    <p className="preview-empty">
                      Your story preview appears here as you type. Formatting, links, images and
                      code blocks render exactly as readers will see them.
                    </p>
                  }
                />
              </div>
            </div>
          </div>

          <div className="editor-status-bar">
            <span>{words} {words === 1 ? 'word' : 'words'}</span>
            <span>{readingTime(form.content)} min read</span>
            <span>{form.content.length} characters</span>
            <span className="editor-status-hint">Markdown · saved to Firestore</span>
          </div>
        </div>

        <aside className="editor-side">
          <div className="editor-panel">
            <div className="editor-panel-head">
              <h3>Publishing</h3>
              <span className={`badge ${statusLabel === 'Published' ? 'badge-live' : 'badge-draft'}`}>
                {statusLabel}
              </span>
            </div>
            <p className="hint">
              {statusLabel === 'Published'
                ? 'This story is live. Saving a draft will unpublish it and hide it from readers.'
                : 'Drafts are private. Publish when the story feels ready — readers see it instantly.'}
            </p>
            <div className="editor-panel-row">
              <span>Words</span>
              <strong>{words}</strong>
            </div>
            <div className="editor-panel-row">
              <span>Reading time</span>
              <strong>{readingTime(form.content)} min</strong>
            </div>
            <div className="editor-panel-row">
              <span>Last saved</span>
              <strong>{dirty ? 'Not yet' : 'Up to date'}</strong>
            </div>
          </div>

          <div className="editor-panel">
            <h3>Story details</h3>

            <label className="field">
              <span>Excerpt <em className="field-hint">optional</em></span>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(event) => update('excerpt', event.target.value)}
                placeholder="A one or two sentence summary for cards and search results."
                maxLength={260}
              />
              <span className={`field-counter${form.excerpt.length > 240 ? ' is-over' : ''}`}>
                {form.excerpt.length}/240
              </span>
            </label>
            {errors.excerpt && <p className="field-error">{errors.excerpt}</p>}

            <label className="field">
              <span>Category</span>
              <div className="select-wrap">
                <select
                  value={form.category}
                  onChange={(event) => update('category', event.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Icon name="chevronDown" size={15} className="select-chevron" />
              </div>
            </label>
            {errors.category && <p className="field-error">{errors.category}</p>}

            <label className="field">
              <span>Tags <em className="field-hint">comma separated</em></span>
              <input
                type="text"
                value={form.tags}
                onChange={(event) => update('tags', event.target.value)}
                placeholder="react, firebase, writing"
              />
            </label>
            {parsedTags.length > 0 && (
              <div className="editor-tag-list">
                {parsedTags.map((tag) => (
                  <button key={tag} type="button" className="tag-pill" onClick={() => removeTag(tag)} title="Remove tag">
                    #{tag} <Icon name="close" size={11} />
                  </button>
                ))}
              </div>
            )}
            {errors.tags && <p className="field-error">{errors.tags}</p>}

            <label className="field">
              <span>Cover image URL <em className="field-hint">optional</em></span>
              <input
                type="url"
                value={form.coverImage}
                onChange={(event) => update('coverImage', event.target.value)}
                placeholder="https://… or /covers/cover-1.svg"
              />
            </label>
            {errors.coverImage && <p className="field-error">{errors.coverImage}</p>}

            <div className="cover-preview">
              <CoverImage
                src={form.coverImage}
                category={form.category}
                alt="Cover preview"
                className="cover-preview-img"
              />
            </div>

            <div className="cover-samples">
              {SAMPLE_COVERS.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={form.coverImage === src ? 'is-active' : ''}
                  onClick={() => update('coverImage', form.coverImage === src ? '' : src)}
                  aria-label={`Use cover ${src}`}
                  title="Use this cover"
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="editor-panel editor-tips">
            <h3>Good to know</h3>
            <ul>
              <li>Use the toolbar for bold, headings, quotes and code blocks.</li>
              <li>The preview is sanitized — raw HTML is rendered safely.</li>
              <li>Every save updates Firestore in realtime.</li>
              <li>Leave the cover empty to get a generated category cover.</li>
            </ul>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this story?"
        message="This permanently removes the story, its likes and its views. This cannot be undone."
        confirmLabel="Delete story"
        busy={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
