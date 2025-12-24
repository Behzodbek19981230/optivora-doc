// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

interface GuestGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth resolves
    if (auth.loading) return

    // If already authenticated (or has persisted userData), keep guest pages inaccessible.
    const hasUserData = Boolean(window.localStorage.getItem('userData'))
    if (auth.user !== null || hasUserData) {
      router.replace('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user])

  if (auth.loading) {
    return fallback
  }

  // If authenticated, we are redirecting away -> don't show guest page.
  if (auth.user !== null || window.localStorage.getItem('userData')) {
    return null
  }

  return <>{children}</>
}

export default GuestGuard
