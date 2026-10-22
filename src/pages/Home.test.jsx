import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Home from './Home'
import { renderWithRouter } from '../test/render'

const usePostsMock = vi.hoisted(() => vi.fn())

vi.mock('../hooks/usePosts', () => ({ usePosts: usePostsMock }))

function makePost(index) {
  return {
    id: `post-${index}`,
    title: `Story number ${index + 1}`,
    slug: `story-number-${index + 1}`,
    excerpt: `Excerpt for story ${index + 1}`,
    content: `Content for story ${index + 1}`,
    coverImage: '/covers/cover-1.svg',
    category: 'Engineering',
    tags: ['testing'],
    status: 'published',
    authorId: 'author-1',
    authorName: 'Test Author',
    likes: 3,
    likedBy: [],
    views: 40,
    createdAt: Date.UTC(2026, 0, 20) - index * 3600000,
    updatedAt: Date.UTC(2026, 0, 20) - index * 3600000,
  }
}

function makePosts(count) {
  return Array.from({ length: count }, (_, index) => makePost(index))
}

function mockPosts(posts) {
  usePostsMock.mockReturnValue({ posts, loading: false, error: null })
}

function postLinks(container) {
  return [...container.querySelectorAll('a[href^="/post/"]')].map((link) => link.getAttribute('href'))
}

describe('Home', () => {
  it('renders one featured story and nine cards for ten posts', () => {
    mockPosts(makePosts(10))
    const { container } = renderWithRouter(<Home />)

    expect(container.querySelectorAll('article.featured-card')).toHaveLength(1)
    expect(container.querySelectorAll('article.post-card')).toHaveLength(9)
    expect(new Set(postLinks(container)).size).toBe(10)
  })

  it('orders the featured story and grid newest first', () => {
    const posts = makePosts(10)
    mockPosts(posts)
    renderWithRouter(<Home />)

    expect(screen.getByRole('heading', { level: 2, name: posts[0].title })).toBeInTheDocument()

    const cardTitles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(cardTitles).toEqual(posts.slice(1, 10).map((post) => post.title))
  })

  it('renders every available post once when there are fewer than ten', () => {
    const posts = makePosts(9)
    mockPosts(posts)
    const { container } = renderWithRouter(<Home />)

    expect(container.querySelectorAll('article.featured-card')).toHaveLength(1)
    expect(container.querySelectorAll('article.post-card')).toHaveLength(8)
    expect(new Set(postLinks(container)).size).toBe(9)
  })

  it('shows the empty state when there are no posts', () => {
    mockPosts([])
    const { container } = renderWithRouter(<Home />)

    expect(screen.getByText('The first story is waiting')).toBeInTheDocument()
    expect(container.querySelectorAll('article.post-card')).toHaveLength(0)
  })

  it('shows skeletons while loading', () => {
    usePostsMock.mockReturnValue({ posts: [], loading: true, error: null })
    const { container } = renderWithRouter(<Home />)

    expect(container.querySelectorAll('.featured-skeleton')).toHaveLength(1)
    expect(container.querySelectorAll('article.post-card')).toHaveLength(0)
  })

  it('shows the error panel when loading fails', () => {
    usePostsMock.mockReturnValue({ posts: [], loading: false, error: new Error('boom') })
    const { container } = renderWithRouter(<Home />)

    expect(screen.getByText('The stories could not be loaded')).toBeInTheDocument()
    expect(container.querySelectorAll('article.post-card')).toHaveLength(0)
  })
})
