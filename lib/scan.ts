import puppeteer from 'puppeteer'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({ token: 'rwZ4fN4DwIAQrItAp3QcnAAM3aCCsUCBZu5Pvuf7' })

export async function runFullSEOScan(url: string) {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })

  const title = await page.title()
  const meta = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => 'N/A')
  const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'N/A')

  const chrome = await launch({ chromeFlags: ['--headless'] })
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
  })

  const performance = result.lhr.categories.performance.score * 100

  const ai = await cohere.generate({
    prompt: `Give SEO improvement tips based on this: Title: ${title}, Meta: ${meta}, H1: ${h1}, Score: ${performance}`,
    maxTokens: 100,
  })

  await browser.close()
  return {
    title,
    meta,
    h1,
    performance,
    ai_suggestions: ai.generations[0].text.trim(),
  }
}
