/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_FILE_URL?: string
  readonly VITE_LOG_AXIOS?: string

  readonly VITE_ONLYOFFICE_URL?: string
  readonly VITE_ONLY_OFFICE_URL?: string
  readonly VITE_DOC_SERVER?: string

  readonly VITE_JWT_SECRET?: string
  readonly VITE_JWT_EXPIRATION?: string
  readonly VITE_JWT_REFRESH_TOKEN_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
