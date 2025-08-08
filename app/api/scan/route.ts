import { NextRequest, NextResponse } from 'next/server'
import { runFullSEOScan } from '@/lib/scan'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' }, 
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid URL including http:// or https://' },
        { status: 400 }
      )
    }

    const result = await runFullSEOScan(url)
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Scan API error:', error)
    
    // Return user-friendly error messages
    const errorMessage = error.message || 'An unexpected error occurred while analyzing the website'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to scan a website.' },
    { status: 405 }
  )
}