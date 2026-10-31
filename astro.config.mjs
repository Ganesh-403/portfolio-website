// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical address for canonical URLs, the sitemap and Open Graph tags.
// Cloudflare Workers is the primary host because some Indian ISPs (Jio) block Vercel;
// every host's build points here so search engines see one site. Override with SITE_URL.
const site = process.env.SITE_URL ?? 'https://portfolio-website.gkambli70.workers.dev';

export default defineConfig({
  site,
  // Astro 7 defaults to 'jsx' whitespace rules, which drop spaces between inline elements.
  compressHTML: true,
  // The stylesheet is small; inlining it removes the only render-blocking request.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
});
