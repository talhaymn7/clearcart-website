// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { hasSiteUrl, siteOrigin } from './src/config.ts';

/**
 * GitHub Pages'te repo adı altında yayınlanırken base gerekir.
 * Vercel'de bu değişken tanımlı olmadığı için base '/' kalır.
 * Örnek: PAGES_BASE=/clearcart-website npm run build
 */
const base = process.env.PAGES_BASE || undefined;

export default defineConfig({
  output: 'static',
  // siteUrl boşken site/sitemap üretilmez — yanlış alan adı vermektense hiç vermemek daha iyi.
  site: hasSiteUrl ? siteOrigin : undefined,
  base,
  // Sitemap'e yalnızca gerçek dil sayfaları girer. Kök adres sadece /tr/ adresine
  // yönlendiren noindex bir sayfadır, dizine eklenmesi istenmez.
  integrations: hasSiteUrl
    ? [sitemap({ filter: (page) => /\/(tr|en)\/$/.test(new URL(page).pathname) })]
    : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
