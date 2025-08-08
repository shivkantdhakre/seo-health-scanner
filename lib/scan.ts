import { SEOResult } from '@/types'

interface PageSpeedResult {
  lighthouseResult: {
    audits: {
      'document-title'?: {
        details?: {
          items?: Array<{ title: string }>
        }
      }
      'meta-description'?: {
        details?: {
          items?: Array<{ description: string }>
        }
      }
      'heading-order'?: {
        details?: {
          items?: Array<{ node?: { snippet: string } }>
        }
      }
    }
    categories: {
      performance: {
        score: number
      }
      seo: {
        score: number
      }
    }
  }
}

async function getAISuggestions(
  url: string, 
  title: string, 
  meta: string, 
  h1: string, 
  performance: number,
  seoScore: number
): Promise<string> {
  const prompt = `
As an SEO expert, analyze this website and provide specific, actionable improvement recommendations:

**Website:** ${url}
**Title Tag:** ${title || 'Missing'}
**Meta Description:** ${meta || 'Missing'}  
**H1 Heading:** ${h1 || 'Missing'}
**Performance Score:** ${performance}/100
**SEO Score:** ${seoScore}/100

Please provide:
1. **Critical Issues** - Most important problems to fix first
2. **Title Tag Optimization** - Specific improvements for the title
3. **Meta Description Enhancement** - How to improve the meta description
4. **Content Structure** - H1 and heading recommendations
5. **Performance Improvements** - Key areas to boost loading speed
6. **Quick Wins** - Easy changes with high impact

Format your response with clear headings and bullet points. Be specific and actionable.
`

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return "AI suggestions unavailable: API key not configured. Please set GEMINI_API_KEY environment variable."
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", response.status, errorText)
      return "AI suggestions temporarily unavailable. Please try again later."
    }

    const result = await response.json()
    
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text.trim()
    } else {
      console.warn("Unexpected Gemini API response:", result)
      return "AI suggestions could not be generated at this time."
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return "AI suggestions unavailable due to a technical error."
  }
}

function extractSEOData(lighthouseResult: PageSpeedResult['lighthouseResult']) {
  // Extract title
  const titleAudit = lighthouseResult.audits['document-title']
  const title = titleAudit?.details?.items?.[0]?.title || 'No title found'

  // Extract meta description  
  const metaAudit = lighthouseResult.audits['meta-description']
  const meta = metaAudit?.details?.items?.[0]?.description || 'No meta description found'

  // Extract H1 - try multiple audit types
  let h1 = 'No H1 heading found'
  const headingAudit = lighthouseResult.audits['heading-order']
  if (headingAudit?.details?.items?.[0]?.node?.snippet) {
    const snippet = headingAudit.details.items[0].node.snippet
    // Extract text content from HTML snippet
    const textMatch = snippet.match(/>([^<]+)</)?.[1]
    if (textMatch) {
      h1 = textMatch.trim()
    }
  }

  // Extract performance score
  const performanceScore = lighthouseResult.categories.performance.score
    ? Math.round(lighthouseResult.categories.performance.score * 100)
    : 0

  // Extract SEO score
  const seoScore = lighthouseResult.categories.seo.score
    ? Math.round(lighthouseResult.categories.seo.score * 100)
    : 0

  return { title, meta, h1, performanceScore, seoScore }
}

export async function runFullSEOScan(url: string): Promise<SEOResult> {
  // Validate URL
  try {
    new URL(url)
  } catch {
    throw new Error("Please enter a valid URL (including http:// or https://)")
  }

  const pagespeedApiKey = process.env.PAGESPEED_API_KEY
  if (!pagespeedApiKey) {
    throw new Error("PageSpeed API key not configured. Please set PAGESPEED_API_KEY environment variable.")
  }

  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  apiUrl.searchParams.set('url', url)
  apiUrl.searchParams.set('key', pagespeedApiKey)
  apiUrl.searchParams.set('category', 'PERFORMANCE')
  apiUrl.searchParams.set('category', 'SEO')
  apiUrl.searchParams.set('strategy', 'DESKTOP')

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': 'SEO-Health-Scanner/1.0'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
      
      if (response.status === 400) {
        throw new Error("Invalid URL or the website cannot be analyzed. Please check the URL and try again.")
      } else if (response.status === 403) {
        throw new Error("API quota exceeded or invalid API key. Please try again later.")
      } else if (response.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.")
      } else {
        throw new Error(`Failed to analyze website: ${errorMessage}`)
      }
    }
    
    const result: PageSpeedResult = await response.json()
    const { title, meta, h1, performanceScore, seoScore } = extractSEOData(result.lighthouseResult)

    // Get AI suggestions
    const aiSuggestions = await getAISuggestions(url, title, meta, h1, performanceScore, seoScore)

    return {
      title,
      meta,
      h1,
      performance: performanceScore,
      seo_score: seoScore,
      ai_suggestions: aiSuggestions,
    }
  } catch (error: any) {
    console.error(`Error during PageSpeed scan for ${url}:`, error)
    
    if (error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to the analysis service. Please check your internet connection and try again.")
    }
    
    throw error
  }
}