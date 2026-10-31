// Renders the 1200×630 social preview image at build time.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { person, leapview } from '../data/profile';

const require = createRequire(import.meta.url);
const font = (weight: number) =>
  readFile(require.resolve(`@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-${weight}-normal.woff`));

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export const GET: APIRoute = async () => {
  const [regular, heavy] = await Promise.all([font(400), font(800)]);
  const { mergedPRs } = leapview.stats;
  // Same 12-week window as the hero chart; fixed-width bars must fit beside the number.
  const weekly = leapview.stats.weekly.slice(-12);
  const max = Math.max(...weekly.map((w) => w.merged), 1);

  const barWidth = 26;
  const gap = 10;
  const bars = h(
    'div',
    {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      width: weekly.length * (barWidth + gap) - gap,
      height: 150,
    },
    weekly.map((w, i) =>
      h('div', {
        display: 'flex',
        flexShrink: 0,
        width: barWidth,
        height: Math.round(Math.max(4, (w.merged / max) * 150)),
        marginLeft: i === 0 ? 0 : gap,
        background: '#ff7438',
        borderRadius: 3,
      }),
    ),
  );

  const tree = h(
    'div',
    {
      // Satori sizes boxes as content-box, so the frame is sized explicitly rather than padded.
      width: 1200 - 160,
      height: 630 - 144,
      margin: '72px 80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#e8ebf1',
      fontFamily: 'Atkinson',
    },
    [
      h('div', { display: 'flex', flexDirection: 'column', gap: 18 }, [
        h('div', { fontSize: 88, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }, person.name),
        h('div', { fontSize: 36, color: '#9aa4b5', maxWidth: 900, lineHeight: 1.3 }, `${person.role} at ${person.company}. Open-source analytics in Go and DuckDB. Available for freelance work.`),
      ]),
      h('div', { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }, [
        h('div', { display: 'flex', flexDirection: 'column', gap: 6 }, [
          h('div', { fontSize: 64, fontWeight: 800, lineHeight: 1 }, String(mergedPRs)),
          h('div', { fontSize: 28, color: '#9aa4b5' }, 'merged pull requests in LeapView'),
        ]),
        bars,
      ]),
    ],
  );

  const canvas = h('div', { width: '100%', height: '100%', display: 'flex', background: '#0d1424' }, tree);
  const svg = await satori(canvas as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Atkinson', data: regular, weight: 400, style: 'normal' },
      { name: 'Atkinson', data: heavy, weight: 800, style: 'normal' },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
