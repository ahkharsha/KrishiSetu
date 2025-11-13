'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, Award, X } from 'lucide-react'
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
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const styleConfig = {
    success: {
      gradient: 'from-emerald-500 to-green-600',
      iconColor: 'text-emerald-500',
      Icon: CheckCircle,
      title: 'Success'
    },
    error: {
      gradient: 'from-red-500 to-rose-600',
      iconColor: 'text-red-500',
      Icon: XCircle,
      title: 'Error'
    },
    info: {
      gradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-500',
      Icon: Info,
      title: 'Information'
    },
    points: {
      gradient: 'from-amber-400 to-orange-500',
      iconColor: 'text-amber-500',
      Icon: Award,
      title: 'Points Earned!'
    }
  }[type]

  const { Icon, gradient, iconColor, title } = styleConfig

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Blur Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setVisible(false); onClose(); }}
          />

          {/* Notification Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top Gradient Border */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon Box */}
                <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-inner ${iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-none mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Close Button Area */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => { setVisible(false); onClose(); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${gradient} hover:shadow-lg hover:opacity-90 transition-all active:scale-95`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}