import type { ReadResult } from '@/types/jarvis';

export async function readUrl(url: string): Promise<ReadResult> {
  try {
    // Validate URL
    const parsed = new URL(url);

    const res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        title: 'Error',
        content: `Failed to fetch page: HTTP ${res.status}`,
        url: parsed.toString(),
      };
    }

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : parsed.hostname;

    // Strip HTML tags and clean up
    let content = html
      // Remove script and style blocks
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      // Remove nav, header, footer
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Limit content length
    if (content.length > 3000) {
      content = content.slice(0, 3000) + '... [content truncated]';
    }

    return {
      title,
      content,
      url: parsed.toString(),
    };
  } catch (error) {
    return {
      title: 'Error',
      content: `Failed to read URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url,
    };
  }
}
