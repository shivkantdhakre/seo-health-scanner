export interface SEOResult {
  title: string
  meta: string
  h1: string
  performance: number
  seo_score: number
  ai_suggestions: string
}

export interface ScanError {
  message: string
  code?: string
  details?: string
}

export interface ScanState {
  loading: boolean
  data: SEOResult | null
  error: string | null
}