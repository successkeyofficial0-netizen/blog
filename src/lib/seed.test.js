import { describe, expect, it } from 'vitest'
import { DEMO_POSTS } from './seed'

const REQUIRED_FIELDS = [
  'id',
  'title',
  'slug',
  'excerpt',
  'coverImage',
  'category',
  'tags',
  'status',
  'authorId',
  'authorName',
  'likes',
  'likedBy',
  'views',
  'createdAt',
  'updatedAt',
  'content',
]

describe('DEMO_POSTS', () => {
  const published = DEMO_POSTS.filter((post) => post.status === 'published')

  it('has 10 published posts for the homepage', () => {
    expect(published).toHaveLength(10)
  })

  it('uses unique ids and slugs', () => {
    expect(new Set(published.map((post) => post.id)).size).toBe(published.length)
    expect(new Set(published.map((post) => post.slug)).size).toBe(published.length)
  })

  it('provides every field the UI reads', () => {
    for (const post of published) {
      for (const field of REQUIRED_FIELDS) {
        expect(post, `${post.id} is missing ${field}`).toHaveProperty(field)
      }
      expect(typeof post.createdAt).toBe('number')
      expect(typeof post.updatedAt).toBe('number')
      expect(Array.isArray(post.tags)).toBe(true)
      expect(post.content.length).toBeGreaterThan(0)
    }
  })
})
