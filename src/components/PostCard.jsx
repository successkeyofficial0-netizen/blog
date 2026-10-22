import { Link } from 'react-router-dom'
import { readingTime, formatDate, cls } from '../lib/utils'
import Avatar from './Avatar'
import CoverImage from './CoverImage'
import { Icon } from './Icons'

export default function PostCard({ post, index = 0 }) {
  const author = post.authorName || 'Inkwell writer'

  return (
    <article className={cls('post-card', 'reveal')} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
      <Link to={`/post/${post.id}`} className="post-card-link" aria-label={`Read “${post.title}”`}>
        <div className="post-card-media">
          <CoverImage src={post.coverImage} category={post.category} className="post-card-cover" />
          {post.status === 'draft' && <span className="badge badge-draft">Draft</span>}
          {post.category && <span className="post-card-category">{post.category}</span>}
        </div>

        <div className="post-card-body">
          <h3 className="post-card-title">{post.title}</h3>
          <p className="post-card-excerpt">{post.excerpt}</p>

          <div className="post-card-meta">
            <Avatar name={author} size="xs" />
            <span className="meta-author">{author}</span>
            <span className="meta-sep" aria-hidden="true">·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span className="meta-spacer" />
            <span className="meta-stat" title={`${readingTime(post.content)} minute read`}>
              <Icon name="clock" size={14} />
              {readingTime(post.content)}m
            </span>
            <span className="meta-stat" title={`${post.likes || 0} likes`}>
              <Icon name="heart" size={14} />
              {post.likes || 0}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
