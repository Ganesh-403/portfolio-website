// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is the project's shortest production
// domain, so canonical URLs follow a domain change without a code edit.
const productionHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? 'portfolio-website-ganesh-kamblis-projects.vercel.app';

export default defineConfig({
  site: `https://${productionHost}`,
  // Astro 7 defaults to 'jsx' whitespace rules, which drop spaces between inline elements.
  compressHTML: true,
  // The stylesheet is small; inlining it removes the only render-blocking request.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
});
