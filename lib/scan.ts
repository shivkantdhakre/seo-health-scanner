// Note: puppeteer, lighthouse, and chrome-launcher have been removed
// to fix build errors and improve reliability. We now use the
// Google PageSpeed Insights API, which runs Lighthouse remotely.

async function getAISuggestions(url: string, title: string, meta: string, h1: string, performance: number) {
  const prompt = `
Analyze the following SEO data for the webpage at ${url} and provide actionable improvement tips.
Focus on how to improve the title, meta description, H1 tag, and overall performance score.
Present the tips as a concise, easy-to-read list or bullet points.

- **URL:** ${url}
- **Title Tag:** ${title || 'Not Found'}
- **Meta Description:** ${meta || 'Not Found'}
- **H1 Heading:** ${h1 || 'Not Found'}
- **Lighthouse Performance Score:** ${performance}/100

**SEO Improvement Suggestions:**
`;

  try {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    
    // This is the fix: Explicitly read the Gemini API key from environment variables.
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API request failed:", response.status, errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates[0]?.content?.parts?.[0]) {
      return result.candidates[0].content.parts[0].text.trim();
    } else {
      console.warn("Unexpected Gemini API response structure:", result);
      return "Could not generate AI suggestions at this time.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Failed to get AI suggestions due to an internal error.";
  }
}

export async function runFullSEOScan(url: string) {
  // We use the Google PageSpeed Insights API to run Lighthouse.
  // You need to get an API key from the Google Cloud Console.
  const pagespeedApiKey = process.env.PAGESPEED_API_KEY;
  if (!pagespeedApiKey) {
    throw new Error("PAGESPEED_API_KEY environment variable is not set.");
  }

  const pagespeedApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${pagespeedApiKey}&category=PERFORMANCE&category=SEO`;

  try {
    const response = await fetch(pagespeedApiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("PageSpeed API Error:", errorData);
      throw new Error(errorData.error.message || 'Failed to fetch data from PageSpeed Insights API.');
    }
    
    const result = await response.json();
    const lighthouseResult = result.lighthouseResult;

    // Extracting the required SEO data from the Lighthouse report
    const title = lighthouseResult.audits['document-title']?.details?.items?.[0]?.title || 'N/A';
    const meta = lighthouseResult.audits['meta-description']?.details?.items?.[0]?.description || 'N/A';
    const h1 = lighthouseResult.audits['h1-element']?.details?.items?.[0]?.node?.snippet || 'N/A';
    const performanceScore = lighthouseResult.categories.performance.score
      ? Math.round(lighthouseResult.categories.performance.score * 100)
      : 0;

    const aiSuggestions = await getAISuggestions(url, title, meta, h1, performanceScore);

    return {
      title,
      meta,
      h1,
      performance: performanceScore,
      ai_suggestions: aiSuggestions,
    };
  } catch (e: any) {
    console.error(`Error during PageSpeed scan for ${url}:`, e);
    throw new Error(`Failed to scan the website via PageSpeed Insights. Details: ${e.message}`);
  }
}
