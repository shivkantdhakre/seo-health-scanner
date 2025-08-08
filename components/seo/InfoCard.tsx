import { ReactNode } from 'react'

interface InfoCardProps {
  title: string
  value: string | number | undefined
  icon: ReactNode
  description?: string
  status?: 'good' | 'warning' | 'error' | 'neutral'
}

export function InfoCard({ title, value, icon, description, status = 'neutral' }: InfoCardProps) {
  const statusStyles = {
    good: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
    neutral: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
  }

  const iconStyles = {
    good: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
    neutral: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
  }

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 ${statusStyles[status]}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${iconStyles[status]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
            {value || 'Not found'}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}