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
const font = (family: string, weight: number, style = 'normal') =>
  readFile(require.resolve(`@fontsource/${family}/files/${family}-latin-${weight}-${style}.woff`));

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export const GET: APIRoute = async () => {
  const [regular, display, displayItalic, photo] = await Promise.all([
    font('atkinson-hyperlegible-next', 400),
    font('instrument-serif', 400),
    font('instrument-serif', 400, 'italic'),
    // Builds run from the project root; import.meta.url points into the build output.
    readFile(join(process.cwd(), 'src/assets/ganesh.jpg')),
  ]);
  const { mergedPRs } = leapview.stats;
  const weeks = leapview.stats.weekly.map((w) => w.merged);
  const [first, ...rest] = person.name.split(' ');

  const text = h('div', { position: 'absolute', left: 80, top: 90, display: 'flex', flexDirection: 'column', width: 620 }, [
    h('div', { fontFamily: 'Atkinson', fontSize: 22, color: '#a2a6c0', letterSpacing: 2 }, `${person.role.toUpperCase()} · ${person.company.toUpperCase()} · ${person.location.toUpperCase()}`),
    h('div', { display: 'flex', flexDirection: 'column', marginTop: 26, fontFamily: 'Instrument Serif', fontSize: 150, lineHeight: 0.86, letterSpacing: -4 }, [
      h('div', {}, first),
      h('div', { color: '#c8ff4d', fontStyle: 'italic' }, rest.join(' ')),
    ]),
    h('div', { marginTop: 34, fontSize: 30, color: '#eeeef6', lineHeight: 1.3 }, 'I build software end to end, from first sketch to production.'),
  ]);
  const portrait = h(
    'div',
    { position: 'absolute', left: 760, top: 95, display: 'flex', padding: 10, borderRadius: 26, backgroundColor: '#0c0e17', border: '1px solid rgba(255,255,255,0.14)' },
    [
      {
        type: 'img',
        props: { src: `data:image/jpeg;base64,${photo.toString('base64')}`, width: 360, height: 360, style: { borderRadius: 18 } },
      },
    ],
  );

  // The hero's LeapView note: the count, then a bar per week with the busiest lit.
  const busiest = Math.max(...weeks, 1);
  const note = h(
    'div',
    {
      position: 'absolute',
      left: 690,
      top: 360,
      display: 'flex',
      flexDirection: 'column',
      width: 250,
      padding: '18px 20px',
      borderRadius: 20,
      backgroundColor: 'rgba(17,19,30,0.92)',
      border: '1px solid rgba(255,255,255,0.14)',
    },
    [
      h('div', { fontSize: 16, color: '#a2a6c0' }, 'LeapView'),
      h('div', { display: 'flex', alignItems: 'baseline', marginTop: 4 }, [
        h('div', { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 52, color: '#c8ff4d', lineHeight: 1 }, String(mergedPRs)),
        h('div', { fontSize: 18, marginLeft: 10 }, 'merged PRs'),
      ]),
      h(
        'div',
        { display: 'flex', alignItems: 'flex-end', height: 44, marginTop: 10 },
        weeks.map((w, i) =>
          h('div', {
            display: 'flex',
            flex: 1,
            height: Math.max(4, Math.round((w / busiest) * 44)),
            marginLeft: i ? 4 : 0,
            borderRadius: 2,
            backgroundColor: w === busiest ? '#c8ff4d' : 'rgba(238,238,246,0.3)',
          }),
        ),
      ),
    ],
  );

  const canvas = h(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      position: 'relative',
      backgroundColor: '#05060b',
      backgroundImage: 'radial-gradient(circle at 85% 0%, rgba(139,123,255,0.35), rgba(5,6,11,0) 55%)',
      color: '#eeeef6',
      fontFamily: 'Atkinson',
    },
    [text, portrait, note],
  );
  const svg = await satori(canvas as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Atkinson', data: regular, weight: 400, style: 'normal' },
      { name: 'Instrument Serif', data: display, weight: 400, style: 'normal' },
      { name: 'Instrument Serif', data: displayItalic, weight: 400, style: 'italic' },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
