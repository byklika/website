import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site ?? 'https://byklika.com').href;

  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapUrl}`].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
