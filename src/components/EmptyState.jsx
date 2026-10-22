import { Icon } from './Icons'

export default function EmptyState({ icon = 'book', title, description, action, compact = false }) {
  return (
    <div className={`empty-state${compact ? ' is-compact' : ''}`}>
      <span className="empty-icon">
        <Icon name={icon} size={compact ? 20 : 26} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}
