// Renders the 1200×630 social preview image at build time.
// JPEG keeps it small: WhatsApp skips preview images over about 300 KB.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { person, leapview } from '../data/profile';

const require = createRequire(import.meta.url);
const font = (family: string, weight: number) =>
  readFile(require.resolve(`@fontsource/${family}/files/${family}-latin-${weight}-normal.woff`));

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export const GET: APIRoute = async () => {
  const [regular, display, photo] = await Promise.all([
    font('atkinson-hyperlegible-next', 400),
    font('bricolage-grotesque', 800),
    // Builds run from the project root; import.meta.url points into the build output.
    readFile(join(process.cwd(), 'src/assets/ganesh.jpg')),
  ]);
  const { mergedPRs } = leapview.stats;
  // Same 12-week window as the site's charts.
  const weekly = leapview.stats.weekly.slice(-12);
  const max = Math.max(...weekly.map((w) => w.merged), 1);

  const barWidth = 14;
  const gap = 6;
  const barHeight = 56;
  const bars = h(
    'div',
    { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', height: barHeight },
    weekly.map((w, i) =>
      h('div', {
        display: 'flex',
        flexShrink: 0,
        width: barWidth,
        height: Math.round(Math.max(3, (w.merged / max) * barHeight)),
        marginLeft: i === 0 ? 0 : gap,
        backgroundImage: 'linear-gradient(#f3c37c, #e2603a)',
        borderRadius: 2,
      }),
    ),
  );

  const [first, ...rest] = person.name.split(' ');
  const side = 430;
  const text = h(
    'div',
    { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 1040 - side - 64, height: side },
    [
      h('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
        h('div', { display: 'flex', flexDirection: 'column', fontFamily: 'Bricolage', fontSize: 104, fontWeight: 800, letterSpacing: -5, lineHeight: 0.9 }, [
          h('div', {}, first),
          h('div', { color: '#f3c37c' }, rest.join(' ')),
        ]),
        h('div', { fontSize: 32, color: '#a3a9b6', lineHeight: 1.3 }, `${person.role} at ${person.company}. I build software end to end, from first sketch to production.`),
      ]),
      h('div', { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 20 }, [
        bars,
        h('div', { display: 'flex', flexDirection: 'column' }, [
          h('div', { fontFamily: 'Bricolage', fontSize: 48, fontWeight: 800, lineHeight: 1 }, String(mergedPRs)),
          h('div', { fontSize: 22, color: '#a3a9b6' }, 'merged pull requests in LeapView'),
        ]),
      ]),
    ],
  );
  const portrait = {
    type: 'img',
    props: {
      src: `data:image/jpeg;base64,${photo.toString('base64')}`,
      width: side,
      height: side,
      style: { borderRadius: 28 },
    },
  };

  const tree = h(
    'div',
    {
      // Satori sizes boxes as content-box, so the frame is sized explicitly rather than padded.
      width: 1200 - 160,
      height: 630 - 200,
      margin: '100px 80px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#efe8dd',
      fontFamily: 'Atkinson',
    },
    [text, portrait],
  );

  // The lamp glow sits behind the photo, as on the page.
  const canvas = h(
    'div',
    { width: '100%', height: '100%', display: 'flex', backgroundColor: '#0f1426', backgroundImage: 'radial-gradient(circle at 76% 50%, rgba(243, 195, 124, 0.16), rgba(15, 20, 38, 0) 55%)' },
    tree,
  );
  const svg = await satori(canvas as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Atkinson', data: regular, weight: 400, style: 'normal' },
      { name: 'Bricolage', data: display, weight: 800, style: 'normal' },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
