export async function fetchWebpageContent(rawUrl: string): Promise<{ title: string; content: string }> {
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const parsedUrl = new URL(url);
  // Avoid local/private addresses
  if (
    parsedUrl.hostname === 'localhost' ||
    parsedUrl.hostname === '127.0.0.1' ||
    parsedUrl.hostname.startsWith('192.168.') ||
    parsedUrl.hostname.startsWith('10.')
  ) {
    throw new Error('Local and private IP addresses cannot be fetched for security reasons.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AccessibilityBot/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`Failed to fetch URL. Server responded with status ${res.status}`);
  }

  const html = await res.text();

  // Basic HTML text extraction
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

  // Remove scripts, styles, navigations, footers, svg, comments
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Replace block elements with newlines
  clean = clean.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|blockquote|article|section)>/gi, '\n\n');
  clean = clean.replace(/<br\s*[\/]?>/gi, '\n');

  // Strip all remaining HTML tags
  clean = clean.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  clean = clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Collapse consecutive whitespaces and clean lines
  const lines = clean
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 20); // filter out tiny navigation snippets

  const textContent = lines.join('\n\n').slice(0, 15000);

  if (!textContent || textContent.length < 50) {
    throw new Error('Unable to extract meaningful readable content from the provided URL.');
  }

  return {
    title,
    content: textContent,
  };
}
