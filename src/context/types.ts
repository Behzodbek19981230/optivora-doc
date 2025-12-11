export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  // Support either username or email for login
  username: string
  password: string
  rememberMe?: boolean
}

// Align with backend user payload
export type UserDataType = {
  id: number
  username: string
  password?: string
  email?: string
  fullname?: string
  avatar?: string | null
  phone_number?: string
  address?: string | null
  region?: string | null
  district?: string | null
  gender?: string | null
  is_active?: boolean
  date_joined?: string
  date_of_birthday?: string | null
  role: number | null
  roles: {
    id: number
    name: string
    description: string
  } | null
  companies?: any[]
  companies_detail?: any[]
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
