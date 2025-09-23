// src/utils/i18n.ts
'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../../public/locales/en.json'
import hi from '../../public/locales/hi.json'
import ta from '../../public/locales/ta.json'
import te from '../../public/locales/te.json'
import ml from '../../public/locales/ml.json'

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  ml: { translation: ml }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
      cookieMinutes: 525600, // 1 year
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
    }
  })

export const useTranslations = () => {
  return (key: string) => i18n.t(key)
}

export const useLanguage = () => ({
  lang: i18n.language,
  setLang: (lng: string) => {
    i18n.changeLanguage(lng)
    document.cookie = `i18next=${lng};path=/;max-age=31536000`
  }
})

export default i18n