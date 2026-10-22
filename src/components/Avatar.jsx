import { avatarTone, cls, initials } from '../lib/utils'

export default function Avatar({ name = '', size = 'md', className = '', tone }) {
  return (
    <span
      className={cls('avatar', `avatar-${size}`, `tone-${tone || avatarTone(name)}`, className)}
      aria-hidden="true"
      title={name}
    >
      {initials(name)}
    </span>
  )
}
