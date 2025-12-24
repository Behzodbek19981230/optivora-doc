import { useLocation, useNavigate, useParams } from 'react-router-dom'

type UrlObject = { pathname: string; query?: Record<string, any> }

const buildSearch = (query?: Record<string, any>) => {
  if (!query) return ''
  const usp = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v == null) return
    usp.set(k, String(v))
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

const toPath = (url: string | UrlObject) => {
  if (typeof url === 'string') return url
  return `${url.pathname}${buildSearch(url.query)}`
}

// Drop-in-ish replacement for `next/router` `useRouter()` used throughout the codebase.
export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const searchParams = new URLSearchParams(location.search)
  const queryFromSearch: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    queryFromSearch[key] = value
  })

  const query = { ...queryFromSearch, ...params }

  return {
    isReady: true,
    route: location.pathname,
    pathname: location.pathname,
    asPath: `${location.pathname}${location.search}${location.hash}`,
    query,
    push: (url: string | UrlObject) => navigate(toPath(url)),
    replace: (url: string | UrlObject) => navigate(toPath(url), { replace: true }),
    back: () => navigate(-1)
  }
}
