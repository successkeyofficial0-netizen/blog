import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icons'
import MarkdownView from '../components/MarkdownView'
import { GUIDE, GUIDE_LANGS } from '../content/guide'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isDemo } from '../lib/backend'
import { copyText } from '../lib/utils'

const LANG_KEY = 'inkwell.guide.lang'
const DONE_KEY = 'inkwell.guide.done.v1'

function readDone() {
  try {
    const raw = window.localStorage.getItem(DONE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function CodeBlock({ label, lang, content, copyLabel = 'Copy', copiedLabel = 'Copied' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyText(content)
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="code-card">
      <div className="code-card-head">
        <span className="code-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code-label">{label || lang}</span>
        <button type="button" className="code-copy-btn" onClick={handleCopy}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  )
}

const TIP_ICONS = { tip: 'sparkles', warning: 'alert', note: 'info' }

export default function Guide() {
  useDocumentTitle('Firebase deployment guide')
  const location = useLocation()
  const [lang, setLang] = useState(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY)
      return stored === 'hi' ? 'hi' : 'en'
    } catch {
      return 'en'
    }
  })
  const [done, setDone] = useState(readDone)
  const [openFaq, setOpenFaq] = useState(null)

  const content = GUIDE[lang]
  const { ui } = content
  const stepIds = useMemo(() => content.steps.map((step) => step.id), [content])
  const completed = done.filter((id) => stepIds.includes(id)).length
  const progress = Math.round((completed / content.steps.length) * 100)

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
    return () => {
      document.documentElement.lang = 'en'
    }
  }, [lang])

  useEffect(() => {
    try {
      window.localStorage.setItem(DONE_KEY, JSON.stringify(done))
    } catch {
      /* ignore */
    }
  }, [done])

  useEffect(() => {
    if (!location.hash) return undefined
    const id = location.hash.replace('#', '')
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => clearTimeout(timer)
  }, [location.hash, lang])

  function toggleDone(id) {
    setDone((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function resetProgress() {
    setDone([])
  }

  return (
    <>
      <section className="guide-hero" id="top">
        <div className="container guide-hero-grid">
          <div className="guide-hero-copy">
            <span className="eyebrow eyebrow-light">
              <span className="eyebrow-dot" /> {content.badge}
            </span>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>

            <div className="guide-meta">
              <span>
                <Icon name="clock" size={15} /> {content.readTime}
              </span>
              <span>
                <Icon name="layers" size={15} /> {content.steps.length} steps
              </span>
              <span>
                <Icon name="globe" size={15} /> English + हिंदी
              </span>
              <span className={`badge ${isDemo ? 'badge-draft' : 'badge-live'}`}>
                {isDemo ? 'Demo mode' : 'Firebase connected'}
              </span>
            </div>

            <div className="guide-hero-actions">
              <a
                className="btn btn-light"
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
              >
                {ui.openConsole} <Icon name="external" size={15} />
              </a>
              <div className="guide-lang" role="group" aria-label="Guide language">
                {GUIDE_LANGS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={lang === option.value ? 'is-active' : ''}
                    onClick={() => setLang(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="guide-progress-card">
            <div className="guide-progress-head">
              <span>{ui.progress}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>
              {completed} / {content.steps.length} {ui.completed}
            </p>
            <div className={`guide-mode-note${isDemo ? ' is-demo' : ''}`}>
              <Icon name={isDemo ? 'info' : 'check'} size={16} />
              <span>{isDemo ? ui.demoNote : ui.liveNote}</span>
            </div>
            {completed > 0 && (
              <button type="button" className="text-link" onClick={resetProgress}>
                <Icon name="refresh" size={13} /> {ui.reset}
              </button>
            )}
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container guide-layout">
          <aside className="guide-toc">
            <p className="guide-toc-title">{ui.onThisPage}</p>
            <nav aria-label="Guide steps">
              {content.steps.map((step, index) => (
                <a
                  key={step.id}
                  href={`#step-${step.id}`}
                  className={done.includes(step.id) ? 'is-done' : ''}
                >
                  <span className="guide-toc-num">{String(index + 1).padStart(2, '0')}</span>
                  <span>{step.title}</span>
                  {done.includes(step.id) && <Icon name="check" size={13} />}
                </a>
              ))}
            </nav>
            <a className="guide-toc-extra" href="#troubleshooting">
              <Icon name="alert" size={14} /> {ui.troubleshooting}
            </a>
            <a className="guide-toc-extra" href="#quick-ref">
              <Icon name="code" size={14} /> {ui.quickRef}
            </a>
          </aside>

          <div className="guide-content">
            {content.steps.map((step, index) => (
              <article key={step.id} id={`step-${step.id}`} className="guide-step">
                <header className="guide-step-head">
                  <span className="guide-step-num">{String(index + 1).padStart(2, '0')}</span>
                  <div className="guide-step-title">
                    <h2>{step.title}</h2>
                    {step.summary && <p>{step.summary}</p>}
                  </div>
                  <button
                    type="button"
                    className={`guide-check${done.includes(step.id) ? ' is-done' : ''}`}
                    onClick={() => toggleDone(step.id)}
                    aria-pressed={done.includes(step.id)}
                  >
                    <Icon name="check" size={14} />
                    {done.includes(step.id) ? ui.done : ui.markDone}
                  </button>
                </header>

                <div className="guide-step-body">
                  <MarkdownView content={step.body} className="guide-prose" />

                  {step.code?.map((block, blockIndex) => (
                    <CodeBlock
                      key={`${step.id}-${blockIndex}`}
                      label={block.label}
                      lang={block.lang}
                      content={block.content}
                      copyLabel={ui.copy}
                      copiedLabel={ui.copied}
                    />
                  ))}

                  {step.tip && (
                    <div className={`callout callout-${step.tip.type}`}>
                      <span className="callout-icon">
                        <Icon name={TIP_ICONS[step.tip.type] || 'info'} size={17} />
                      </span>
                      <div>
                        <strong>
                          {step.tip.type === 'warning'
                            ? ui.warning
                            : step.tip.type === 'note'
                              ? ui.note
                              : ui.tip}
                          {' · '}
                          {step.tip.title}
                        </strong>
                        <div className="callout-body">
                          <MarkdownView content={step.tip.body} className="callout-prose" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}

            <section id="troubleshooting" className="guide-faq">
              <div className="section-head">
                <div>
                  <span className="eyebrow">{ui.troubleshooting}</span>
                  <h2 className="section-title">{content.troubleshooting.title}</h2>
                  <p className="section-sub">{content.troubleshooting.subtitle}</p>
                </div>
              </div>

              <div className="faq-list">
                {content.troubleshooting.items.map((item, index) => {
                  const open = openFaq === index
                  return (
                    <div key={item.q} className={`faq-item${open ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() => setOpenFaq(open ? null : index)}
                        aria-expanded={open}
                      >
                        <span>{item.q}</span>
                        <Icon name={open ? 'close' : 'plus'} size={16} />
                      </button>
                      {open && (
                        <div className="faq-answer">
                          <MarkdownView content={item.a} className="guide-prose" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            <section id="quick-ref" className="guide-quick-ref">
              <h2>{content.quickRef.title}</h2>
              <CodeBlock
                label="terminal"
                content={content.quickRef.commands}
                copyLabel={ui.copy}
                copiedLabel={ui.copied}
              />
              <div className="file-list">
                {content.quickRef.files.map(([path, description]) => (
                  <div key={path} className="file-row">
                    <code>{path}</code>
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="guide-final">
              <div className="guide-final-copy">
                <span className="eyebrow">{ui.deployTitle}</span>
                <h2>{ui.deployTitle}</h2>
                <p>{ui.deployBody}</p>
                <div className="guide-final-actions">
                  <a
                    className="btn btn-light"
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {ui.openConsole} <Icon name="external" size={15} />
                  </a>
                  <a className="btn btn-outline-light" href="#top">
                    {ui.backToTop}
                  </a>
                </div>
              </div>
              <div className="guide-final-art" aria-hidden="true">
                <img src="/covers/cover-2.svg" alt="" />
                <span className="guide-final-badge">firebase deploy</span>
              </div>
            </section>

            <p className="guide-footnote">
              Need the big picture? <Link to="/explore">Browse the stories</Link> or{' '}
              <Link to="/write">write your first post</Link>. The whole guide is also in{' '}
              <code>README.md</code>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
