'use client'
import { useState } from 'react'
import axios from 'axios'
import { SEOResult } from '@/types'
import { Loader, AlertCircle, CheckCircle, BarChart, FileText, Type, Search } from 'lucide-react'

// A simple card component for displaying data
const InfoCard = ({ title, value, icon }: { title: string; value: string | number | undefined; icon: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex items-start space-x-4 transition-transform hover:scale-105 duration-300">
    <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-3 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</p>
    </div>
  </div>
);

// A component to display the performance score with a progress ring
const PerformanceScore = ({ score }: { score: number | undefined }) => {
  if (score === undefined) return <InfoCard title="Performance Score" value="N/A" icon={<BarChart size={24} />} />;
  
  const circumference = 2 * Math.PI * 20; // 2 * pi * radius
  const offset = circumference - (score / 100) * circumference;
  
  let colorClass = 'text-green-500';
  if (score < 90) colorClass = 'text-yellow-500';
  if (score < 50) colorClass = 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">Performance Score</p>
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 44 44">
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
          />
          <circle
            className={`transform -rotate-90 origin-center transition-all duration-1000 ${colorClass}`}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${colorClass}`}>
          {score}
        </span>
      </div>
    </div>
  );
};

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SEOResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setError('Please enter a valid URL including http:// or https://');
        return;
    }
    
    setLoading(true)
    setData(null)
    setError(null)
    
    try {
      const res = await axios.post('/api/scan', { url })
      if (res.data.error) {
        setError(res.data.error)
      } else {
        setData(res.data)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-4 rounded-2xl mb-6">
            <Search size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">SEO Health Scanner</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Enter a URL to get a complete SEO analysis, including performance scores and AI-powered recommendations.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-grow p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
              type="url"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-8 py-4 font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : 'Scan Site'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div role="status" className="inline-flex items-center space-x-2">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-lg font-medium">Scanning website... This may take a moment.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="h-6 w-6 text-red-500 mr-4" /></div>
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="max-w-4xl mx-auto mt-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <InfoCard title="Title Tag" value={data.title} icon={<FileText size={24} />} />
              <InfoCard title="Meta Description" value={data.meta} icon={<FileText size={24} />} />
              <InfoCard title="H1 Heading" value={data.h1} icon={<Type size={24} />} />
              <div className="lg:col-span-3">
                <PerformanceScore score={data.performance} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
               <h2 className="text-2xl font-bold mb-4 flex items-center">
                 <CheckCircle className="text-green-500 mr-2" />
                 AI-Powered Suggestions
               </h2>
               <div className="prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap">
                 {data.ai_suggestions}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
