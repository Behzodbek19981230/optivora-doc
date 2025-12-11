// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'
import { DataService } from 'src/configs/dataService'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  const initAuth = async (): Promise<void> => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
    if (storedToken) {
      setLoading(true)
      await DataService.get(authConfig.meEndpoint)
        .then(async response => {
          setLoading(false)
          const raw = response.data as UserDataType
          // ensure company_current / company_id exist based on companies
          const normalized: UserDataType = { ...raw }
          if (normalized.company_current == null) {
            if (Array.isArray(normalized.companies) && normalized.companies.length > 0) {
              normalized.company_current = normalized.companies[0]
            }
          }
          if (normalized.company_id == null) {
            normalized.company_id = normalized.company_current ?? null
          }
          setUser(normalized)
          if (!localStorage.getItem('userData')) window.localStorage.setItem('userData', JSON.stringify(normalized))
        })
        .catch(() => {
          localStorage.removeItem('userData')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('accessToken')
          setUser(null)
          setLoading(false)
          if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
            router.replace('/login')
          }
        })
    } else {
      setLoading(false)
    }
  }
  useEffect(() => {
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    DataService.login(authConfig.loginEndpoint, params)
      .then(async response => {
        const loginData = response.data as { access: string; refresh?: string; userData: UserDataType }

        // augment user with company_id if missing
        const userData = { ...loginData.userData }
        if (userData.company_current == null && Array.isArray(userData.companies) && userData.companies.length > 0) {
          userData.company_id = userData.companies[0]
        } else if (userData.company_current != null) {
          userData.company_id = userData.company_current
        }

        // Persist token & user immediately to avoid AuthGuard redirect loop
        if (loginData.access) {
          window.localStorage.setItem(authConfig.storageTokenKeyName, loginData.access)
        }
        window.localStorage.setItem('userData', JSON.stringify(userData))
        setUser(userData)

        // Optionally refresh profile in background
        initAuth()

        const returnUrl = router.query.returnUrl as string | undefined
        const roleName = (userData as any)?.roles?.name || (userData as any)?.role || 'admin'
        const homeRoute = getHomeRoute(roleName)

        // If user has no current company, force company selection page
        const needsCompanySelection =
          userData.company_current == null && (!userData.company_id || userData.company_id == null)
        const redirectURL = needsCompanySelection
          ? '/choose-company'
          : returnUrl && returnUrl !== '/'
          ? returnUrl
          : homeRoute || '/'

        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
