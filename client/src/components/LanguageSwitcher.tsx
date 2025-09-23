// src/components/LanguageSwitcher.tsx
'use client'

import { useLanguage } from '../utils/i18n'
import { Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ml', name: 'മലയാളം' }
  ]

  const handleLanguageChange = (code: string) => {
    setLang(code)
    setIsOpen(false)
    router.refresh()
  }

  if (!mounted) return null

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline-block text-sm">
          {languages.find(l => l.code === lang)?.name}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg z-50 border border-secondary-200">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 hover:bg-primary-50 ${
                lang === language.code 
                  ? 'text-primary-600 font-medium bg-primary-50' 
                  : 'text-secondary-700'
              }`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}