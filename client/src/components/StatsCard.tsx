// src/components/StatsCard.tsx
'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  className = '',
  link
}: {
  title: string
  value: string | number
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  link?: string
}) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-yellow-500'
  }

  const trendIcons = {
    up: <ArrowUp className="w-4 h-4" />,
    down: <ArrowDown className="w-4 h-4" />,
    neutral: <ArrowRight className="w-4 h-4" />
  }

  const content = (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-secondary-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          trend === 'up' ? 'bg-green-100 text-green-600' : 
          trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
        }`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center mt-2 text-sm ${trendColors[trend]}`}>
          {trendIcons[trend]}
          <span className="ml-1">Last period</span>
        </div>
      )}
    </div>
  )

  return link ? (
    <Link href={link} className="block hover:scale-[1.02] transition-transform">
      {content}
    </Link>
  ) : content
}