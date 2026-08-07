import type { SearchResult } from '@/types/jarvis';

export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    const results: SearchResult[] = [];

    // Parse DuckDuckGo HTML results
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a[\s>]*[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a/gi;
    let match;

    while ((match = resultRegex.exec(html)) !== null && results.length < 8) {
      const urlMatch = match[1];
      const titleMatch = match[2].replace(/<[^>]*>/g, '').trim();
      const snippetMatch = match[3].replace(/<[^>]*>/g, '').trim();

      if (urlMatch && titleMatch) {
        results.push({
          title: titleMatch,
          url: urlMatch,
          snippet: snippetMatch || '',
        });
      }
    }

    // Fallback: try a simpler regex if no results found
    if (results.length === 0) {
      const simpleRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
      while ((match = simpleRegex.exec(html)) !== null && results.length < 8) {
        const urlMatch = match[1];
        const titleMatch = match[2].replace(/<[^>]*>/g, '').trim();
        if (urlMatch && titleMatch) {
          results.push({
            title: titleMatch,
            url: urlMatch,
            snippet: '',
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
