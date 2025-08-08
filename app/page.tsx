'use client'
import { useState } from 'react'
import { SEOResult } from '@/types'
import { Search, Globe, Zap, Target, TrendingUp } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { InfoCard } from '@/components/seo/InfoCard'
import { PerformanceScore } from '@/components/seo/PerformanceScore'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SEOResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Please enter a URL to analyze')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL including http:// or https://')
      return
    }
    
    setLoading(true)
    setData(null)
    setError(null)
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze website')
      }

      setData(result)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    if (url) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }

  const getSEOStatus = (title: string, meta: string, h1: string) => {
    if (title.includes('No title') || title.includes('Not found')) return 'error'
    if (meta.includes('No meta') || meta.includes('Not found')) return 'warning'
    if (h1.includes('No H1') || h1.includes('Not found')) return 'warning'
    return 'good'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              SEO Health Scanner
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-4 rounded-2xl mb-6 animate-fade-in">
            <Target size={48} />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analyze Your Website's
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">SEO Performance</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in">
            Get comprehensive SEO insights, performance metrics, and AI-powered recommendations to boost your website's search rankings.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <Globe className="w-8 h-8 text-blue-500" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">SEO Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete SEO audit</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Speed & optimization</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smart recommendations</p>
              </div>
            </div>
          </div>

          {/* Scan Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto animate-fade-in">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-grow p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus-ring transition-all"
              required
              type="url"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Website'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto">
            <LoadingSpinner 
              size="lg" 
              text="Analyzing your website... This may take up to 30 seconds."
              className="py-16"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <ErrorAlert 
              message={error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="max-w-6xl mx-auto mt-16 animate-fade-in">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Analysis Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Showing SEO analysis for: <span className="font-medium text-blue-600 dark:text-blue-400">{url}</span>
              </p>
            </div>

            {/* SEO Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <InfoCard 
                title="Title Tag" 
                value={data.title}
                description={`${data.title.length} characters`}
                icon={<Globe size={24} />}
                status={getSEOStatus(data.title, '', '')}
              />
              <InfoCard 
                title="Meta Description" 
                value={data.meta}
                description={`${data.meta.length} characters`}
                icon={<Search size={24} />}
                status={getSEOStatus('', data.meta, '')}
              />
              <InfoCard 
                title="H1 Heading" 
                value={data.h1}
                icon={<Target size={24} />}
                status={getSEOStatus('', '', data.h1)}
              />
            </div>

            {/* Performance Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PerformanceScore score={data.performance} label="Performance Score" />
              <PerformanceScore score={data.seo_score} label="SEO Score" />
            </div>
            
            {/* AI Suggestions */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Powered Recommendations
                </h3>
              </div>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data.ai_suggestions}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Built with Next.js, powered by Google PageSpeed Insights and AI
          </p>
        </div>
      </footer>
    </div>
  )
}