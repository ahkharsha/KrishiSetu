// src/app/layout.tsx
import './globals.css'
import { Providers } from './providers'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'KrishiSetu - Sustainable Farming on Blockchain',
  description: 'Decentralized platform for Indian farmers to trade crops and participate in governance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col bg-primary-50">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Nav />
            <main className="flex-1">
              <div className="max-w-7xl mx-auto px-4 py-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}