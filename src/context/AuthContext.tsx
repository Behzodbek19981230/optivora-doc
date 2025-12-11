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

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
      if (storedToken) {
        setLoading(true)
        await DataService.get(authConfig.meEndpoint)
          .then(async response => {
            setLoading(false)
            const userData = response.data as UserDataType
            setUser({ ...userData })
            if (!localStorage.getItem('userData')) window.localStorage.setItem('userData', JSON.stringify(userData))
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

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    DataService.login(authConfig.loginEndpoint, params)
      .then(async response => {
        const loginData = response.data as { access: string; refresh?: string; userData: UserDataType }

        if (params.rememberMe && loginData.access) {
          window.localStorage.setItem(authConfig.storageTokenKeyName, loginData.access)
          window.localStorage.setItem('userData', JSON.stringify(loginData.userData))
        }

        setUser({ ...loginData.userData })

        const returnUrl = router.query.returnUrl as string | undefined
        const roleName = (loginData.userData as any)?.roles?.name || (loginData.userData as any)?.role || 'admin'
        const homeRoute = getHomeRoute(roleName)
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : homeRoute || '/'

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
