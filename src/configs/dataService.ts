import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import authConfig from 'src/configs/auth'

export interface ApiError {
  error?: string
  message: string
  statusCode: number
  details?: unknown
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

interface OptionalHeaders {
  [key: string]: string
}

interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
}

const getAuthHeader = (): { Authorization: string } | {} => {
  if (typeof window === 'undefined') return {}

  const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: false,
  maxRetries: 2,
  retryDelay: 1000
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

const client: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: DEFAULT_HEADERS
})

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authHeader = getAuthHeader()
    if (authHeader && Object.keys(authHeader).length > 0) {
      config.headers.Authorization = (authHeader as { Authorization: string }).Authorization
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

client.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NEXT_PUBLIC_LOG_AXIOS === 'true') {
      const cfg: any = response.config || {}
      const took = cfg._startedAt ? `${Date.now() - cfg._startedAt}ms` : '—'
      // eslint-disable-next-line no-console
      console.log('[API] <-', response.status, response.config.method?.toUpperCase(), response.config.url, took)
    }
    return response
  },
  async (error: AxiosError<ApiError>) => {
    if (process.env.NEXT_PUBLIC_LOG_AXIOS === 'true') {
      const res = error.response
      const status = res?.status || 'ERR'
      // eslint-disable-next-line no-console
      console.warn('[API] x ', status, error.config?.method?.toUpperCase(), error.config?.url, error.message)
    }
    const config = error.config as RequestConfig

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400: {
          return Promise.reject({
            message: data?.message || 'Bad Request.',
            statusCode: 400,
            errors: data || []
          } as ApiError)
        }
        case 401: {
          window.localStorage.removeItem('userData')
          window.localStorage.removeItem(authConfig.storageTokenKeyName)

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
          return Promise.reject({
            message: data?.message || 'Session expired. Please login again.',
            statusCode: 401,
            error: 'Unauthorized'
          } as ApiError)
        }

        case 403: {
          return Promise.reject({
            message: data?.message || 'You do not have permission to access this resource.',
            statusCode: 403,
            error: 'Forbidden'
          } as ApiError)
        }

        case 404: {
          return Promise.reject({
            message: data?.message || 'Resource not found.',
            statusCode: 404,
            error: 'Not Found'
          } as ApiError)
        }

        case 422: {
          return Promise.reject({
            message: data?.message || 'Validation error.',
            statusCode: 422,
            error: 'Validation Error',
            details: data?.details || data
          } as ApiError)
        }

        case 429: {
          // Too Many Requests
          return Promise.reject({
            message: data?.message || 'Too many requests. Please try again later.',
            statusCode: 429,
            error: 'Rate Limit Exceeded'
          } as ApiError)
        }

        case 500:
        case 502:
        case 503:
        case 504: {
          // Server Errors - retry logic
          const retryCount = config._retryCount || 0

          if (retryCount < API_CONFIG.maxRetries && config && !config._retry) {
            config._retryCount = retryCount + 1
            config._retry = true

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (retryCount + 1)))

            return client(config)
          }

          return Promise.reject({
            message: data?.message || 'Server error. Please try again later.',
            statusCode: status,
            error: 'Server Error'
          } as ApiError)
        }

        default: {
          return Promise.reject({
            message: data?.message || 'An error occurred. Please try again.',
            statusCode: status,
            error: data?.error || 'Unknown Error',
            details: data
          } as ApiError)
        }
      }
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please check your connection.',
        statusCode: 0,
        error: 'Timeout'
      } as ApiError)
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
        error: 'Network Error'
      } as ApiError)
    }

    return Promise.reject({
      message: error.message || 'An unexpected error occurred.',
      statusCode: 0,
      error: 'Unknown Error'
    } as ApiError)
  }
)

class DataService {
  /**
   * GET Request
   * @param path - API endpoint path
   * @param params - Query parameters
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async get<T = unknown>(
    path: string,
    params: Record<string, string | number | boolean> = {},
    headers: OptionalHeaders = {}
  ) {
    return client.get<T>(path, {
      params,
      headers: { ...getAuthHeader(), ...headers }
    })
  }

  /**
   * POST Request
   * @param path - API endpoint path
   * @param data - Request body data
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async post<T = unknown>(
    path: string,
    data: unknown = {},
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.post<T>(path, data, {
      headers: { ...getAuthHeader(), ...headers }
    })
  }

  /**
   * PUT Request
   * @param path - API endpoint path
   * @param data - Request body data
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async put<T = unknown>(
    path: string,
    data: unknown = {},
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.put<T>(path, data, {
      headers: { ...getAuthHeader(), ...headers }
    })
  }

  /**
   * PATCH Request
   * @param path - API endpoint path
   * @param data - Request body data
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async patch<T = unknown>(
    path: string,
    data: unknown = {},
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.patch<T>(path, data, {
      headers: { ...getAuthHeader(), ...headers }
    })
  }

  /**
   * DELETE Request
   * @param path - API endpoint path
   * @param data - Optional request body data
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async delete<T = unknown>(
    path: string,
    data: unknown = {},
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.delete<T>(path, {
      data,
      headers: { ...getAuthHeader(), ...headers }
    })
  }

  /**
   * Login Request (without auth header)
   * @param path - API endpoint path
   * @param data - Login credentials
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async login<T = unknown>(
    path: string,
    data: unknown = {},
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.post<T>(path, data, {
      headers: { ...headers }
    })
  }

  /**
   * POST Form Data Request
   * @param path - API endpoint path
   * @param data - FormData object
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async postForm<T = unknown>(
    path: string,
    data: FormData,
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.post<T>(path, data, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
        ...headers
      }
    })
  }

  /**
   * PUT Form Data Request
   * @param path - API endpoint path
   * @param data - FormData object
   * @param headers - Optional additional headers
   * @returns Promise with response data
   */
  static async putForm<T = unknown>(
    path: string,
    data: FormData,
    headers: OptionalHeaders = {}
  ): Promise<AxiosResponse<T>> {
    return client.put<T>(path, data, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
        ...headers
      }
    })
  }

  /**
   * Upload File with Progress
   * @param path - API endpoint path
   * @param file - File to upload
   * @param onProgress - Progress callback
   * @param additionalData - Additional form data
   * @returns Promise with response data
   */
  static async uploadFile<T = unknown>(
    path: string,
    file: File,
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    additionalData: Record<string, string> = {}
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    // Append additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    return client.post<T>(path, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  }

  /**
   * Download File
   * @param path - API endpoint path
   * @param filename - Optional filename for download
   * @returns Promise with blob data
   */
  static async downloadFile(path: string, filename?: string): Promise<void> {
    const response = await client.get(path, {
      responseType: 'blob',
      headers: { ...getAuthHeader() }
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || 'download')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  static getClient(): AxiosInstance {
    return client
  }

  static setBaseURL(url: string): void {
    client.defaults.baseURL = url
  }

  static setTimeout(timeout: number): void {
    client.defaults.timeout = timeout
  }
}

export type { OptionalHeaders, RequestConfig }
export { client, API_CONFIG }
export { DataService }
