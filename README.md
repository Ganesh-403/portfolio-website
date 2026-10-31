# Ganesh Kambli — portfolio

Source for my personal site: what I work on at [Flid AI](https://flid.ai/), my projects, open-source work, research, and how to hire me for freelance work.

Built with [Astro](https://astro.build) as a static site. Its only JavaScript is small inline scripts (theme toggle, contact form confirmation, chart readout, current-section marker and local time), and the page works without any of them.

## Updating content

Everything the site says lives in [`src/data/profile.ts`](src/data/profile.ts): the intro, LeapView work areas and their pull requests, projects, experience, papers, awards, certifications and freelance offers. Components only render that file, so most updates are a one-line edit there.

GitHub numbers (stars, merged LeapView pull requests, the weekly chart, upstream pull requests) come from a committed snapshot, [`src/data/github.json`](src/data/github.json). Refresh it with:

```bash
npm run sync:github
```

The build never calls GitHub, so deploys don't depend on its API or rate limits. Without a token the sync paces itself to GitHub's search limit and takes about a minute; set `GITHUB_TOKEN` to make it faster. If anything fails, the snapshot is left unchanged and the command exits with an error.

## Running locally

Requires Node 22.23 or newer (hosts build with Node 24).

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-checks, then builds to dist/
npm run preview   # serves dist/
```

## How it's put together

| Path | What it is |
| --- | --- |
| `src/data/profile.ts` | All site content |
| `src/data/github.json` | GitHub snapshot, written by `scripts/sync-github.mjs` |
| `src/components/` | One component per section, plus the Work chart (`MetricCard`) and the pull-request citation (`PR`) |
| `src/styles/global.css` | Colour, type and spacing tokens for light and dark themes |
| `src/pages/og.jpg.ts` | Generates the social preview image (name, photo and chart) at build time |
| `src/pages/robots.txt.ts` | robots.txt pointing at the generated sitemap |

Design notes:

- Two lenses decide what goes where. **Visual hierarchy:** each screen has one focal point, and the page runs in the order a visitor needs it: who I am and how to reach me, proof of work, what I offer, then background. **Progressive disclosure:** the line people scan is always visible; supporting detail (the pull requests behind each work area, how each project works, older projects, internship details, awards and certifications) opens on request in native `<details>` elements, which find-in-page also opens.
- Every claim links to its evidence: pull requests, repositories, papers and live demos.
- The Work section applies LeapView's idea, a metric defined in code and rendered as a chart, to my own contribution history. Point at or tap a week to read its count; the same numbers are in a table for screen readers.
- Motion answers the visitor or happens once: the photo opens out and the hero sparkline draws in on load, chart bars grow as the chart scrolls into view, disclosures animate open, the nav marks the section being read, and the theme switch crossfades. All of it is off when reduced motion is on, and nothing depends on it.
- Type is Atkinson Hyperlegible Next and Mono, self-hosted. Colours meet WCAG AA in both themes.

## Deployment

The site is static (`dist/`), so any static host works.

- **Cloudflare Pages (primary):** project `ganeshkambli`, served at https://ganeshkambli.pages.dev. Every push to `main` builds with `npm run build` and publishes `dist/`: a repository webhook (Settings → Webhooks, push events) calls the project's Pages deploy hook, because Cloudflare's own Git webhook doesn't fire for this project. A build can also be started from the Cloudflare dashboard. Node comes from [`.node-version`](.node-version) and response headers from [`public/_headers`](public/_headers). Cloudflare is primary because Jio, a major Indian ISP, blocks Vercel's (and GitHub Pages') IP addresses.
- **Cloudflare Worker `portfolio-website` (legacy):** https://portfolio-website.gkambli70.workers.dev, deployed by hand with `npx wrangler deploy` using [`wrangler.jsonc`](wrangler.jsonc).
- **Vercel (secondary):** also builds `main`, using [`vercel.json`](vercel.json).

Canonical URLs, the sitemap and Open Graph tags always point at the address in [`astro.config.mjs`](astro.config.mjs), whichever host serves the build. Set `SITE_URL` to override it, for example after moving to a custom domain.

The contact form posts to Formspree.

## License

[MIT](LICENSE)
