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
  companies?: number[]
  companies_detail?: Array<{
    id: number
    code?: string
    name: string
    is_active?: boolean
    phone?: string
    region?: number
    region_detail?: any
    district?: number
    district_detail?: any
    address?: string
    created_time?: string
    created_by?: any
    logo?: string | null
  }>
  company_current?: number | null
  company_id?: number | null
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
