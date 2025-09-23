// src/components/Footer.tsx
'use client'

import { useTranslations } from '../utils/i18n'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { Github, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const t = useTranslations()
  const { isConnected } = useAccount()
  
  return (
    <footer className={`bg-primary-900 text-white py-8 ${!isConnected ? 'mt-auto' : ''}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Image 
              src="/krishisetu-logo.jpg" 
              alt="KrishiSetu Logo" 
              width={50} 
              height={50}
              className="rounded-full"
            />
            <div>
              <h3 className="font-bold text-lg">KrishiSetu</h3>
              <p className="text-primary-300 text-sm">{t('footerText')}</p>
              <p className="text-primary-400 text-xs mt-1">
                Built for Project-I Coursework (VIT Chennai)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link href="https://github.com/ahkharsha/KrishiSetu" target="_blank">
              <Github className="w-6 h-6 text-primary-300 hover:text-white transition-colors" />
            </Link>
            <Link href="https://www.linkedin.com/in/harsha-kumar-a-271a76203/" target="_blank">
              <Linkedin className="w-6 h-6 text-primary-300 hover:text-white transition-colors" />
            </Link>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-primary-300">
              © {new Date().getFullYear()} KrishiSetu. {t('allRightsReserved')}
            </p>
            <p className="text-primary-400 text-sm mt-1">
              {t('sustainableFarming')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}