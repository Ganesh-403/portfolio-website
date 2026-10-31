# Ganesh Kambli — portfolio

Source for my personal site: what I work on at [Flid AI](https://flid.ai/), my projects, open-source work, research, and how to hire me for freelance work.

Built with [Astro](https://astro.build) as a static site. It ships no JavaScript except the theme toggle and the contact form's inline confirmation, and it works without either.

## Updating content

Everything the site says lives in [`src/data/profile.ts`](src/data/profile.ts): the intro, LeapView work areas and their pull requests, projects, experience, papers, awards, certifications and freelance offers. Components only render that file, so most updates are a one-line edit there.

GitHub numbers (stars, merged LeapView pull requests, the weekly chart, upstream pull requests) come from a committed snapshot, [`src/data/github.json`](src/data/github.json). Refresh it with:

```bash
npm run sync:github
```

The build never calls GitHub, so deploys don't depend on its API or rate limits. Set `GITHUB_TOKEN` if you hit the unauthenticated limit while syncing.

## Running locally

Requires Node 22.23 or newer.

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
| `src/components/` | One component per section, plus the hero's metric card and the pull-request citation chip |
| `src/styles/global.css` | Colour, type and spacing tokens for light and dark themes |
| `src/pages/og.png.ts` | Generates the social preview image at build time |
| `src/pages/robots.txt.ts` | robots.txt pointing at the generated sitemap |

Design notes:

- Every claim links to its evidence: pull requests, repositories, papers and live demos.
- The hero applies LeapView's idea, a metric defined in code and rendered as a chart, to my own contribution history.
- Type is Atkinson Hyperlegible Next and Mono, self-hosted. Colours meet WCAG AA in both themes, and the only animation (the chart drawing in) is skipped when reduced motion is on.

## Deployment

Vercel builds from `main` using [`vercel.json`](vercel.json) (Astro preset, `npm run build`, output `dist/`). Canonical URLs, the sitemap and Open Graph tags use the project's production domain from `VERCEL_PROJECT_PRODUCTION_URL`, so changing the domain in Vercel needs no code change.

The contact form posts to Formspree.

## License

[MIT](LICENSE)
