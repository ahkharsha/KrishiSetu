'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type NotificationType = 'success' | 'error' | 'info' | 'points'

export default function Notification({ message, type, onClose }: {
  message: string
  type: NotificationType
  onClose: () => void
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose()
    }, 4000) // Auto close after 4s

    return () => clearTimeout(timer)
  }, [onClose])

  // Define styles based on type
  const styleConfig = {
    success: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-green-500',
      iconColor: 'text-green-500',
      Icon: CheckCircle,
      title: 'Success'
    },
    error: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-red-500',
      iconColor: 'text-red-500',
      Icon: XCircle,
      title: 'Error'
    },
    info: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-blue-500',
      iconColor: 'text-blue-500',
      Icon: Info,
      title: 'Info'
    },
    points: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-yellow-500',
      iconColor: 'text-yellow-500',
      Icon: Award,
      title: 'Points Earned!'
    }
  }[type]

  const { Icon, iconColor, bg, border } = styleConfig

  return (
    <AnimatePresence>
      {visible && (
        // Z-INDEX 9999 ENSURES IT IS ON TOP OF EVERYTHING
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto shadow-2xl rounded-xl p-6 max-w-md w-full mx-4 ${bg} ${border} relative overflow-hidden`}
          >
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 ${iconColor.replace('text-', 'bg-')}`}></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className={`p-2 rounded-full bg-gray-50 dark:bg-gray-700 shrink-0 ${iconColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className={`font-bold text-lg ${iconColor} mb-1`}>{styleConfig.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>
              <button 
                onClick={() => {
                  setVisible(false)
                  onClose()
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                &times;
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}