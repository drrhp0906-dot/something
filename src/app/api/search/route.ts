import { NextRequest, NextResponse } from 'next/server';
import { searchWeb } from '@/lib/tools/web-search';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required' }, { status: 400 });
    }

    const results = await searchWeb(query);

    return NextResponse.json({ results, query });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
