import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

export function useNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const push = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  const replace = useCallback((path: string) => {
    navigate(path, { replace: true })
  }, [navigate])

  const back = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const refresh = useCallback(() => {
    window.location.reload()
  }, [])

  const pathname = location.pathname
  const query = Object.fromEntries(searchParams.entries())

  return {
    push,
    replace,
    back,
    refresh,
    pathname,
    query,
    searchParams
  }
}

// Hook to get current route parameters
export function useParams() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  // Simple parameter extraction for common patterns
  const params: Record<string, string> = {}
  
  // Extract ID from paths like /profile/:id, /booking/:id, etc.
  if (pathSegments.length >= 2) {
    const lastSegment = pathSegments[pathSegments.length - 1]
    if (lastSegment && lastSegment !== 'edit' && lastSegment !== 'payment') {
      params.id = lastSegment
      params.slug = lastSegment
    }
  }
  
  return params
}