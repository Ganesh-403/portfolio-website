// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical address for canonical URLs, the sitemap and Open Graph tags.
// The site is served from Cloudflare Pages (some Indian ISPs, such as Jio, block Vercel);
// every build points here so search engines see one site. Override with SITE_URL.
const site = process.env.SITE_URL ?? 'https://ganeshkambli.pages.dev';

export default defineConfig({
  site,
  // Astro 7 defaults to 'jsx' whitespace rules, which drop spaces between inline elements.
  compressHTML: true,
  // The stylesheet is small; inlining it removes the only render-blocking request.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
});
