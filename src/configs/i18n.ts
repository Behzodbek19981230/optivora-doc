import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const LANGUAGE_STORAGE_KEY = 'i18nextLng'

// NOTE: keep SSR/static-export safe (no direct window access at module top-level)
const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'ru'
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'ru'
}

i18n

  // Enables the i18next backend
  .use(Backend)

  // Enable automatic language detection
  .use(LanguageDetector)

  // Enables the hook initialization module
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    backend: {
      /* translation file path */
      loadPath: '/locales/{{lng}}.json'
    },
    fallbackLng: 'ru',
    debug: false,
    keySeparator: false,
    supportedLngs: ['uz', 'ru', 'en'],
    nonExplicitSupportedLngs: true,
    detection: {
      // Use localStorage first; fallback to browser language; cache language changes.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
      // Some builds of the detector also support this option.
      // When it does, it prevents caching an empty string.
      excludeCacheFor: ['cimode']
    },
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ','
    }
  })

// Persist on any language change (extra safety in case detector caching is disabled)
i18n.on('languageChanged', lng => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    // ignore storage errors
  }
})

export default i18n
