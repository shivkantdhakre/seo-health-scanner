'use client'
import { useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await axios.post('/api/scan', { url })
    setData(res.data)
    setLoading(false)
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 SEO Health Scanner</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="border p-2 w-full rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Scan
        </button>
      </form>

      {loading && <p>Scanning...</p>}
      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Meta Description:</strong> {data.meta}</p>
          <p><strong>H1:</strong> {data.h1}</p>
          <p><strong>Performance Score:</strong> {data.performance}</p>
          <p><strong>AI Suggestions:</strong> {data.ai_suggestions}</p>
        </div>
      )}
    </main>
  )
}
