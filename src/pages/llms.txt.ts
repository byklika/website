import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '~/lib/seo/llms-txt';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? 'https://byklika.com';

  return new Response(buildLlmsTxt(origin), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
