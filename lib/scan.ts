import { SEOResult } from '@/types'

// Defines the expected structure of the PageSpeed Insights API response.
// The `performance` and `seo` categories are marked as optional to handle cases where they might be missing.
interface PageSpeedResult {
  lighthouseResult?: {
    audits?: {
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
    categories?: {
      performance?: {
        score: number
      }
      seo?: {
        score: number
      }
    }
  }
}

// Generates AI-powered SEO suggestions using the Gemini API.
async function getAISuggestions(
  url: string,
  title: string,
  meta: string,
  h1: string,
  performance: number,
  seoScore: number
): Promise<string> {
  const prompt = `
As an expert SEO consultant, please provide a comprehensive yet easy-to-understand SEO audit and action plan for the following website.

**URL:** ${url}

**Current SEO Data:**
- **Title Tag:** ${title || 'Not Found'}
- **Meta Description:** ${meta || 'Not Found'}
- **H1 Heading:** ${h1 || 'Not Found'}
- **Performance Score:** ${performance}/100
- **SEO Score:** ${seoScore}/100

**Your Task:**
Generate a report with clear, actionable recommendations. Use markdown for formatting. The report should include the following sections:

### 🚀 **Overall SEO Health**
Provide a brief, overall summary of the website's SEO health based on the data.

### 🎯 **Priority Action Items**
List the top 3-5 most critical issues that need to be addressed first for the biggest impact.

### **Detailed Recommendations**

#### **✍️ Title Tag**
- **Analysis:** Briefly analyze the current title tag.
- **Suggestion:** Provide a revised, optimized title tag. Explain why the new title is better (e.g., keyword placement, length, clarity).

#### **📄 Meta Description**
- **Analysis:** Analyze the current meta description.
- **Suggestion:** Write a compelling, revised meta description. Explain the improvements.

#### **#️⃣ Heading Structure (H1)**
- **Analysis:** Analyze the current H1 heading.
- **Suggestion:** Suggest an improved H1 and explain how it better reflects the page content.

#### **⚡ Performance**
- **Analysis:** Comment on the performance score.
- **Suggestions:** Provide 2-3 specific, high-impact suggestions to improve the performance score (e.g., "Compress images," "Reduce unused JavaScript").

### **🏆 Quick Wins**
List a few simple, easy-to-implement changes that can provide a quick boost to SEO.

Please be specific and provide clear, actionable advice.
`

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return "AI suggestions unavailable: API key not configured. Please set the GEMINI_API_KEY environment variable."
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
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", response.status, errorText)
      return "AI suggestions are temporarily unavailable. Please try again later."
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
    return "AI suggestions are unavailable due to a technical error."
  }
}

// Extracts key SEO data from the Lighthouse report.
function extractSEOData(lighthouseResult: NonNullable<PageSpeedResult['lighthouseResult']>) {
  const title = lighthouseResult.audits?.['document-title']?.details?.items?.[0]?.title || 'No title found'
  const meta = lighthouseResult.audits?.['meta-description']?.details?.items?.[0]?.description || 'No meta description found'

  let h1 = 'No H1 heading found'
  const headingAudit = lighthouseResult.audits?.['heading-order']
  if (headingAudit?.details?.items?.[0]?.node?.snippet) {
    const snippet = headingAudit.details.items[0].node.snippet
    const textMatch = snippet.match(/>([^<]+)</)?.[1]
    if (textMatch) {
      h1 = textMatch.trim()
    }
  }

  // **FIX:** Safely access performance and SEO scores using optional chaining (`?.`).
  // This prevents crashes if the `categories` or specific scores are missing from the API response.
  const performanceScore = lighthouseResult.categories?.performance?.score
    ? Math.round(lighthouseResult.categories.performance.score * 100)
    : 0

  const seoScore = lighthouseResult.categories?.seo?.score
    ? Math.round(lighthouseResult.categories.seo.score * 100)
    : 0

  return { title, meta, h1, performanceScore, seoScore }
}

// Main function to run the full SEO scan.
export async function runFullSEOScan(url: string): Promise<SEOResult> {
  try {
    new URL(url)
  } catch {
    throw new Error("Please enter a valid URL (including http:// or https://)")
  }

  const pagespeedApiKey = process.env.PAGESPEED_API_KEY
  if (!pagespeedApiKey) {
    throw new Error("The PageSpeed API key is not configured. Please set the PAGESPEED_API_KEY environment variable.")
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
        throw new Error("The URL is invalid or the website cannot be analyzed. Please check the URL and try again.")
      } else if (response.status === 403) {
        throw new Error("The API quota has been exceeded or the API key is invalid. Please try again later.")
      } else if (response.status === 429) {
        throw new Error("Too many requests have been sent. Please wait a moment and try again.")
      } else {
        throw new Error(`Failed to analyze the website: ${errorMessage}`)
      }
    }
    
    const result: PageSpeedResult = await response.json()

    // **FIX:** Add a robust check to ensure lighthouseResult exists before proceeding.
    if (!result.lighthouseResult) {
      throw new Error("Analysis failed: Lighthouse did not return any results for this URL. It might be offline or blocking automated tools.")
    }

    const { title, meta, h1, performanceScore, seoScore } = extractSEOData(result.lighthouseResult)

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
      throw new Error("A network error occurred. Unable to connect to the analysis service. Please check your internet connection and try again.")
    }
    
    throw error
  }
}
