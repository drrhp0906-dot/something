import { NextRequest, NextResponse } from 'next/server';
import { readUrl } from '@/lib/tools/web-reader';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL string is required' }, { status: 400 });
    }

    const result = await readUrl(url);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Read URL API error:', error);
    return NextResponse.json(
      { error: 'Failed to read URL', result: null },
      { status: 500 }
    );
  }
}
