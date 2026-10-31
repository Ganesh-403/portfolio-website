# Ganesh Kambli — portfolio

Source for my personal site: what I work on at [Flid AI](https://flid.ai/), my projects, open-source work, research, and how to hire me for freelance work.

Built with [Astro](https://astro.build) as a static site. Its only JavaScript is small inline scripts (pointer glow, area tabs, chart readout, current-section marker, local time and the contact form's inline confirmation), and the page works without any of them.

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
| `src/styles/global.css` | Colour, type and spacing tokens, cards and the disclosure pattern |
| `src/pages/og.jpg.ts` | Generates the social preview image (name, photo and chart) at build time |
| `src/pages/robots.txt.ts` | robots.txt pointing at the generated sitemap |

Design notes:

- **Lamplight.** The page is lit like the photo: a night-blue background, a warm lamp-gold accent taken from the lamp behind me, and a soft glow that follows the pointer. Display type is Bricolage Grotesque; body text is Atkinson Hyperlegible Next. Dark only, and every text colour meets WCAG AA (most well beyond it).
- **Visual hierarchy.** Each screen has one focal point, and the page runs in the order a visitor needs it: who I am and how to reach me, what I'm working on now, what I've built, what I offer, then background.
- **Progressive disclosure.** The line people scan is always visible; detail opens on request: the six LeapView areas are tabs (all shown when JavaScript is off), each project's "How it works", older projects, internship details, and awards and certifications sit in native `<details>` elements, which find-in-page also opens.
- **Evidence.** Every claim links to pull requests, repositories, papers or live demos. The LeapView chart can be explored by pointing at or tapping a week; the same numbers are in a "Weekly numbers" table.
- **Motion.** One load sequence (the photo opens out, the hero lines rise in, the sparkline draws), chart bars that grow as the chart scrolls into view, a header that tints as you scroll, animated disclosures and tabs, and a nav marker for the section being read. All of it is off under reduced motion, and nothing depends on it.
- **A build gotcha.** Astro's CSS minifier folds `animation-timeline` into the `animation` shorthand, which browsers reject. Scroll-driven animations therefore set their timeline in a separate rule.

## Deployment

The site is static (`dist/`), so any static host works.

- **Cloudflare Pages (primary):** project `ganeshkambli`, served at https://ganeshkambli.pages.dev. Every push to `main` builds with `npm run build` and publishes `dist/`: a repository webhook (Settings → Webhooks, push events) calls the project's Pages deploy hook, because Cloudflare's own Git webhook doesn't fire for this project. A build can also be started from the Cloudflare dashboard. Node comes from [`.node-version`](.node-version) and response headers from [`public/_headers`](public/_headers). Cloudflare is primary because Jio, a major Indian ISP, blocks Vercel's (and GitHub Pages') IP addresses.
- **Cloudflare Worker `portfolio-website` (legacy):** https://portfolio-website.gkambli70.workers.dev, deployed by hand with `npx wrangler deploy` using [`wrangler.jsonc`](wrangler.jsonc).
- **Vercel (secondary):** also builds `main`, using [`vercel.json`](vercel.json).

Canonical URLs, the sitemap and Open Graph tags always point at the address in [`astro.config.mjs`](astro.config.mjs), whichever host serves the build. Set `SITE_URL` to override it, for example after moving to a custom domain.

The contact form posts to Formspree.

## License

[MIT](LICENSE)
