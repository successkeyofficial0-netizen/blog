import { useEffect, useState } from 'react'
import { postsApi } from '../lib/backend'

/** Subscribes to a realtime list of posts with loading + error states. */
export function usePosts({ status, authorId } = {}) {
  const [state, setState] = useState({ posts: [], loading: true, error: null })

  useEffect(() => {
    let active = true
    setState({ posts: [], loading: true, error: null })

    const unsubscribe = postsApi.subscribePosts(
      { status, authorId },
      (posts) => {
        if (active) setState({ posts, loading: false, error: null })
      },
      (error) => {
        if (active) setState({ posts: [], loading: false, error })
      },
    )

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [status, authorId])

  return state
}

/** Subscribes to a single post document. */
export function usePost(postId) {
  const [state, setState] = useState({ post: null, loading: true, error: null })

  useEffect(() => {
    if (!postId) {
      setState({ post: null, loading: false, error: null })
      return undefined
    }
    let active = true
    setState({ post: null, loading: true, error: null })

    const unsubscribe = postsApi.subscribePost(
      postId,
      (post) => {
        if (active) setState({ post, loading: false, error: null })
      },
      (error) => {
        if (active) setState({ post: null, loading: false, error })
      },
    )

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [postId])

  return state
}

export { usePosts as default }
