// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth resolves (avoids redirect flicker)
    if (auth.loading) return

    // If user is not authenticated, redirect to login.
    // IMPORTANT: don't rely on `router.isReady/router.route` (can be flaky on fresh load/static export).
    const hasUserData = Boolean(window.localStorage.getItem('userData'))
    if (auth.user === null && !hasUserData) {
      const returnUrl = router.asPath && router.asPath !== '/' ? router.asPath : undefined
      router.replace(returnUrl ? { pathname: '/login', query: { returnUrl } } : '/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user, router.asPath])

  if (auth.loading) {
    return fallback
  }

  // If auth resolved but user is still null, we're redirecting to /login → don't show infinite loader.
  if (auth.user === null) {
    return null
  }

  return <>{children}</>
}

export default AuthGuard
