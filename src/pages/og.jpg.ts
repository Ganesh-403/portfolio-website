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

// The same galaxy as the site's hero: one dot per merged pull request, three arms, a week per
// segment, coloured from the first week (violet) to the latest (lime).
function galaxy(weeks: number[], cx: number, cy: number) {
  let seed = 390;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  const last = Math.max(weeks.length - 1, 1);
  const mix = (t: number) => {
    const a = [139, 123, 255];
    const b = [200, 255, 77];
    return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(' ')})`;
  };
  const dots: Node[] = [];
  weeks.forEach((count, week) => {
    for (let n = 0; n < count; n++) {
      const r = 0.35 + (week / last) * 2.6 + gauss() * 0.3;
      const a = (week % 3) * ((Math.PI * 2) / 3) + r * 1.15 + gauss() * 0.5;
      // Seen from above at an angle: squash the disc vertically.
      const x = cx + Math.cos(a) * r * 88;
      const y = cy + Math.sin(a) * r * 44;
      const size = 3 + Math.round(rand() * 3);
      dots.push(
        h('div', {
          position: 'absolute',
          left: Math.round(x),
          top: Math.round(y),
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: mix(week / last),
          boxShadow: `0 0 ${size * 3}px ${mix(week / last)}`,
        }),
      );
    }
  });
  return dots;
}

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
    h('div', { marginTop: 28, fontSize: 22, color: '#a2a6c0' }, `${mergedPRs} merged pull requests in LeapView, one point of light each.`),
  ]);
  const portrait = h(
    'div',
    { position: 'absolute', right: 80, bottom: 70, display: 'flex', padding: 10, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' },
    [
      {
        type: 'img',
        props: { src: `data:image/jpeg;base64,${photo.toString('base64')}`, width: 190, height: 190, style: { borderRadius: 18 } },
      },
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
    [...galaxy(weeks, 880, 250), text, portrait],
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
