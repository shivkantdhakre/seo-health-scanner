import { useEffect, useState } from 'react'
import { BarChart, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PerformanceScoreProps {
  score: number | undefined
  label?: string
}

export function PerformanceScore({ score, label = "Performance Score" }: PerformanceScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  useEffect(() => {
    if (score !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedScore(score)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [score])

  if (score === undefined) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
        <BarChart className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-gray-400">N/A</p>
      </div>
    )
  }

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  
  let colorClass = 'text-green-500'
  let bgColorClass = 'bg-green-50 dark:bg-green-900/20'
  let borderColorClass = 'border-green-200 dark:border-green-800'
  let icon = <TrendingUp className="w-6 h-6" />
  
  if (score < 90) {
    colorClass = 'text-yellow-500'
    bgColorClass = 'bg-yellow-50 dark:bg-yellow-900/20'
    borderColorClass = 'border-yellow-200 dark:border-yellow-800'
    icon = <Minus className="w-6 h-6" />
  }
  if (score < 50) {
    colorClass = 'text-red-500'
    bgColorClass = 'bg-red-50 dark:bg-red-900/20'
    borderColorClass = 'border-red-200 dark:border-red-800'
    icon = <TrendingDown className="w-6 h-6" />
  }

  return (
    <div className={`p-8 rounded-xl border transition-all duration-300 hover:shadow-lg ${bgColorClass} ${borderColorClass}`}>
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center space-x-2">
          <div className={`${colorClass}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {label}
          </h3>
        </div>
        
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="72"
              cy="72"
            />
            <circle
              className={`transition-all duration-1000 ease-out ${colorClass}`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="72"
              cy="72"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colorClass}`}>
              {animatedScore}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / 100
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {score >= 90 && "Excellent performance"}
            {score >= 50 && score < 90 && "Good performance, room for improvement"}
            {score < 50 && "Needs significant improvement"}
          </p>
        </div>
      </div>
    </div>
  )
}