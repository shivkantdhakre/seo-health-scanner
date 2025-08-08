import { Loader } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <Loader className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
      {text && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse-slow">
          {text}
        </p>
      )}
    </div>
  )
}