import type { APIRoute } from 'astro';
import { hasSiteUrl, siteOrigin } from '../config.ts';

export const GET: APIRoute = () => {
  const lines = ['User-agent: *', 'Allow: /'];

  // Sitemap satırı ancak siteUrl doldurulduğunda anlamlı olur.
  if (hasSiteUrl) {
    lines.push('', `Sitemap: ${siteOrigin}${import.meta.env.BASE_URL}sitemap-index.xml`);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
