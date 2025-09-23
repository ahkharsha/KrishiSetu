// src/components/Card.tsx
import { ReactNode } from 'react'
import { useTranslations } from '../utils/i18n'

export default function Card({
  children,
  className = '',
  title,
  action,
  onClick
}: {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
  onClick?: () => void
}) {
  const t = useTranslations()
  
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-secondary-200 ${className} ${
        onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="border-b border-secondary-200 p-4 flex justify-between items-center bg-primary-50">
          {title && <h3 className="font-semibold text-lg text-secondary-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}