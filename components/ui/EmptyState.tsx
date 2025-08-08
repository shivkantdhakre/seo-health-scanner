import { Search } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  message?: string
}

export function EmptyState({
  title = "Ready to start?",
  message = "Enter a URL above to begin your SEO analysis."
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-4 rounded-full mb-6">
        <Search size={40} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  )
}