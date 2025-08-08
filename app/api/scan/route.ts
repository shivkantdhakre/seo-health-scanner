import { NextRequest, NextResponse } from 'next/server'
import { runFullSEOScan } from '@/lib/scan'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  try {
    const result = await runFullSEOScan(url)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
