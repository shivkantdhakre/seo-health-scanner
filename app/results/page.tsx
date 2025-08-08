'use client'
// The import from 'next/navigation' has been removed to fix the build error.
// We will use standard browser APIs for routing and reading URL parameters instead.
import { useEffect, useState } from 'react'
import { SEOResult } from '@/types'
import { Loader, BarChart, FileText, Type, CheckCircle, ArrowLeft } from 'lucide-react'

// A reusable card component for displaying individual SEO metrics.
const InfoCard = ({ title, value, icon }: { title: string; value: string | number | undefined; icon: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex items-start space-x-4 transition-transform hover:scale-105 duration-300">
    <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-3 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

// A component to display the performance score with an animated progress ring.
const PerformanceScore = ({ score }: { score: number | undefined }) => {
  if (score === undefined) return <InfoCard title="Performance Score" value="N/A" icon={<BarChart size={24} />} />;
  
  const circumference = 2 * Math.PI * 40; // radius is 40
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Animate the stroke-dashoffset for a nice visual effect on load.
    const animation = setTimeout(() => {
        setOffset(circumference - (score / 100) * circumference);
    }, 100);
    return () => clearTimeout(animation);
  }, [score, circumference]);
  
  let colorClass = 'text-green-500';
  if (score < 90) colorClass = 'text-yellow-500';
  if (score < 50) colorClass = 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
      <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-4">Performance Score</p>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-gray-200 dark:text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
          <circle
            className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-5xl font-bold ${colorClass}`}>
          {score}
        </span>
      </div>
    </div>
  );
};


export default function ResultsPage() {
    // We no longer use the Next.js hooks.
    const [data, setData] = useState<SEOResult | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use the standard URLSearchParams API to get data from the URL.
        const params = new URLSearchParams(window.location.search);
        const resultsData = params.get('data');
        const scannedUrl = params.get('url');
        setUrl(scannedUrl);

        if (resultsData) {
            try {
                // Decode and parse the JSON data from the URL.
                const decodedData = decodeURIComponent(resultsData);
                const parsedData: SEOResult = JSON.parse(decodedData);
                setData(parsedData);
            } catch (e) {
                setError("Failed to parse scan results. Please try again.");
            }
        } else {
            setError("No scan results found. Please go back and scan a URL.");
        }
        setLoading(false);
    }, []); // The dependency array is empty to ensure this runs only once on mount.

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 text-white px-6 py-2 font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Scanner
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
                    >
                        <ArrowLeft size={18} />
                        Scan Another Site
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">SEO Report</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 break-all">
                        Showing results for: <a href={url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{url}</a>
                    </p>

                    {data && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InfoCard title="Title Tag" value={data.title} icon={<FileText size={24} />} />
                                <InfoCard title="Meta Description" value={data.meta} icon={<FileText size={24} />} />
                                <InfoCard title="H1 Heading" value={data.h1} icon={<Type size={24} />} />
                            </div>

                            <div className="grid grid-cols-1">
                                <PerformanceScore score={data.performance} />
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <CheckCircle className="text-green-500 mr-3" />
                                    AI-Powered Suggestions
                                </h2>
                                <div className="prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {data.ai_suggestions}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
