// The field behind the page. Every bright point is one merged LeapView pull request, coloured by
// the week it landed (oldest in the second accent, newest in the signal colour). The points hold a
// different formation for each section and fly between them as you scroll:
//   hero: a spiral galaxy, one arm-segment per week, so the busiest week is the densest knot
//   work: the weekly chart itself, one column per week, one point per pull request
//   projects: six orbits, one per project
//   freelance: a double helix
//   background: a sphere
//   contact: the word "hello", written in points
// A dimmer dust fills the depth around them. The morph runs on the GPU; JavaScript only sets the
// start and end of each flight.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

type Formation = 'galaxy' | 'chart' | 'orbits' | 'helix' | 'sphere' | 'hello';
const SECTIONS: [string, Formation][] = [
  ['#top', 'galaxy'],
  ['#work', 'chart'],
  ['#projects', 'orbits'],
  ['#freelance', 'helix'],
  ['#background', 'sphere'],
  ['#contact', 'hello'],
];
// Formations that turn slowly; the chart and the word face the reader.
const SPINS: Record<Formation, boolean> = { galaxy: true, chart: false, orbits: true, helix: true, sphere: true, hello: false };

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const isDark = () => document.documentElement.dataset.theme !== 'light';
const MORPH = 1.8;
const STAGGER = 0.35;

// A seeded random, so the galaxy is the same shape on every visit.
function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aDelay;
  attribute float aSize;
  attribute float aMix;
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMotion;
  uniform vec3 uOld;
  uniform vec3 uNew;
  varying vec3 vColor;
  varying float vTwinkle;

  float ease(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }

  void main() {
    float t = ease(clamp((uProgress - aDelay) / (1.0 - ${STAGGER.toFixed(2)}), 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, t);
    // Mid-flight the points swing out a little, so the move reads as flight, not a slide.
    p += normalize(p + vec3(0.001)) * sin(t * 3.14159) * 0.35;
    float phase = aDelay * 40.0;
    p += uMotion * 0.025 * vec3(sin(uTime * 0.9 + phase), cos(uTime * 0.7 + phase), sin(uTime * 0.6 + phase * 1.3));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (34.0 / -mv.z);
    vColor = mix(uOld, uNew, aMix);
    vTwinkle = 0.75 + 0.25 * sin(uTime * 2.0 + phase) * uMotion;
  }
`;

const fragment = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    // A bright core with a soft halo, so the points glow rather than sit flat.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float halo = exp(-d * d * 22.0);
    float core = smoothstep(0.12, 0.0, d);
    gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.6), (halo * 0.8 + core) * uAlpha * vTwinkle);
  }
`;

export function mountSky(canvas: HTMLCanvasElement, weeks: number[]) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  } catch {
    return;
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const world = new Group();
  scene.add(world);

  // One point per pull request: its week, and its place within that week.
  const owner: { week: number; nth: number }[] = [];
  weeks.forEach((count, week) => {
    for (let nth = 0; nth < count; nth++) owner.push({ week, nth });
  });
  const N = owner.length;
  const W = Math.max(weeks.length - 1, 1);
  const rand = random(390);

  const shapes: Record<Formation, Float32Array> = {
    galaxy: new Float32Array(N * 3),
    chart: new Float32Array(N * 3),
    orbits: new Float32Array(N * 3),
    helix: new Float32Array(N * 3),
    sphere: new Float32Array(N * 3),
    hello: new Float32Array(N * 3),
  };
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;

  owner.forEach(({ week, nth }, i) => {
    // Galaxy: three arms; a week is a segment along an arm, older weeks nearer the core.
    const arm = week % 3;
    const r = 0.4 + (week / W) * 3.1 + gauss() * 0.32;
    const a = arm * ((Math.PI * 2) / 3) + r * 1.15 + gauss() * 0.5;
    shapes.galaxy.set([Math.cos(a) * r, gauss() * 0.12, Math.sin(a) * r], i * 3);

    // Chart: one column per week, four points to a layer.
    const layer = Math.floor(nth / 4);
    const corner = nth % 4;
    const columnX = (week - W / 2) * 0.5;
    shapes.chart.set(
      [columnX + (corner % 2) * 0.14 - 0.07 + gauss() * 0.01, -1.5 + layer * 0.072, (corner >> 1) * 0.14 - 0.07],
      i * 3,
    );

    // Orbits: six tilted rings.
    const ring = i % 6;
    const ringR = 0.7 + ring * 0.42;
    const angle = (i / N) * Math.PI * 2 * 6 + ring;
    const tilt = 0.35 + ring * 0.22;
    const ox = Math.cos(angle) * ringR;
    const oz = Math.sin(angle) * ringR;
    shapes.orbits.set([ox, oz * Math.sin(tilt) + gauss() * 0.02, oz * Math.cos(tilt)], i * 3);

    // Helix: two strands winding up, with rungs between them.
    const u = i / N;
    const strand = i % 2 ? Math.PI : 0;
    const turn = u * Math.PI * 7 + strand;
    const rung = i % 9 === 0 ? rand() : 1;
    shapes.helix.set([Math.cos(turn) * 0.9 * rung, (u - 0.5) * 4.6, Math.sin(turn) * 0.9 * rung], i * 3);

    // Sphere: evenly spread (a Fibonacci lattice).
    const y = 1 - (i / (N - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    shapes.sphere.set([Math.cos(phi) * rr * 1.9, y * 1.9, Math.sin(phi) * rr * 1.9], i * 3);
  });

  // "hello", sampled from the display face once it has loaded; a sphere stands in until then.
  shapes.hello.set(shapes.sphere);
  document.fonts.load('italic 200px "Instrument Serif"').then(() => {
    const c = document.createElement('canvas');
    c.width = 900;
    c.height = 300;
    const g = c.getContext('2d');
    if (!g) return;
    g.font = 'italic 250px "Instrument Serif", serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('hello', 450, 140);
    const data = g.getImageData(0, 0, c.width, c.height).data;
    const spots: [number, number][] = [];
    for (let y = 0; y < c.height; y += 3) {
      for (let x = 0; x < c.width; x += 3) if (data[(y * c.width + x) * 4 + 3] > 140) spots.push([x, y]);
    }
    if (!spots.length) return;
    const pick = random(7);
    for (let i = 0; i < N; i++) {
      const [x, y] = spots[Math.floor(pick() * spots.length)];
      shapes.hello.set([(x - 450) / 130, -(y - 150) / 130, (pick() - 0.5) * 0.15], i * 3);
    }
    if (current === 'hello') fly('hello');
  });

  const geometry = new BufferGeometry();
  const from = new Float32Array(shapes.galaxy);
  const to = new Float32Array(shapes.galaxy);
  const delay = new Float32Array(N);
  const size = new Float32Array(N);
  const mix = new Float32Array(N);
  owner.forEach(({ week }, i) => {
    delay[i] = rand() * STAGGER;
    size[i] = 1.6 + rand() * 2.2;
    mix[i] = week / W;
  });
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(N * 3), 3));
  geometry.setAttribute('aFrom', new BufferAttribute(from, 3));
  geometry.setAttribute('aTo', new BufferAttribute(to, 3));
  geometry.setAttribute('aDelay', new BufferAttribute(delay, 1));
  geometry.setAttribute('aSize', new BufferAttribute(size, 1));
  geometry.setAttribute('aMix', new BufferAttribute(mix, 1));
  // The bounding sphere would come from the unused position attribute; never cull the points.
  geometry.boundingSphere = null;

  const uniforms = {
    uProgress: { value: 1 },
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uMotion: { value: still ? 0 : 1 },
    uAlpha: { value: 1 },
    uOld: { value: new Color() },
    uNew: { value: new Color() },
  };
  const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
  const stars = new Points(geometry, material);
  stars.frustumCulled = false;
  world.add(stars);

  // Dust: dim specks through the whole depth, not part of the data.
  const D = innerWidth < 700 ? 500 : 1400;
  const dustGeometry = new BufferGeometry();
  const dust = new Float32Array(D * 3);
  const dustSize = new Float32Array(D);
  for (let i = 0; i < D; i++) {
    dust.set([(rand() - 0.5) * 30, (rand() - 0.5) * 20, -14 + rand() * 16], i * 3);
    dustSize[i] = 0.5 + rand() * 0.9;
  }
  dustGeometry.setAttribute('position', new BufferAttribute(dust, 3));
  dustGeometry.setAttribute('aFrom', new BufferAttribute(dust, 3));
  dustGeometry.setAttribute('aTo', new BufferAttribute(dust, 3));
  dustGeometry.setAttribute('aDelay', new BufferAttribute(new Float32Array(D).map(() => rand() * STAGGER), 1));
  dustGeometry.setAttribute('aSize', new BufferAttribute(dustSize, 1));
  dustGeometry.setAttribute('aMix', new BufferAttribute(new Float32Array(D).map(() => rand()), 1));
  const dustUniforms = { ...uniforms, uProgress: { value: 1 }, uAlpha: { value: 0.35 } };
  const dustMaterial = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: dustUniforms, transparent: true, depthWrite: false });
  const field = new Points(dustGeometry, dustMaterial);
  field.frustumCulled = false;
  scene.add(field);

  const paint = () => {
    const dark = isDark();
    uniforms.uOld.value.set(css('--accent-2'));
    uniforms.uNew.value.set(css('--accent'));
    for (const m of [material, dustMaterial]) {
      m.blending = dark ? AdditiveBlending : NormalBlending;
      m.needsUpdate = true;
    }
    uniforms.uAlpha.value = dark ? 1 : 0.85;
    dustUniforms.uAlpha.value = dark ? 0.35 : 0.22;
    render();
  };

  // Where the formation sits: right of the text on wide screens, centred and further back on phones.
  // A few formations sit a little higher or further back, clear of their section's panels.
  const anchor = { x: 0, y: 0, z: 0 };
  const nudge: Record<Formation, [number, number, number]> = {
    galaxy: [0, 0.2, 0],
    chart: [0.2, 0.4, -0.5],
    orbits: [0.4, 0.6, -1],
    helix: [0.6, 0, -0.5],
    sphere: [0.6, 0.4, -1.5],
    hello: [-0.3, 1.5, -0.5],
  };
  const target = () => {
    const [x, y, z] = nudge[current];
    const wide = canvas.clientWidth / Math.max(canvas.clientHeight, 1) > 1.1;
    return wide ? { x: anchor.x + x, y: anchor.y + y, z: anchor.z + z } : { x: anchor.x, y: anchor.y + y * 0.5, z: anchor.z };
  };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w / h > 1.1;
    anchor.x = wide ? 2.4 : 0;
    anchor.y = wide ? 0 : 0.6;
    anchor.z = wide ? 0 : -3.5;
    render();
  };

  // Flying to a new formation starts from wherever the points are right now.
  let current: Formation = 'galaxy';
  let flightStart = -1;
  const fly = (next: Formation) => {
    const p = uniforms.uProgress.value;
    for (let i = 0; i < N; i++) {
      const t = Math.min(Math.max((p - delay[i]) / (1 - STAGGER), 0), 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      for (let k = 0; k < 3; k++) from[i * 3 + k] += (to[i * 3 + k] - from[i * 3 + k]) * e;
    }
    to.set(shapes[next]);
    geometry.attributes.aFrom.needsUpdate = true;
    geometry.attributes.aTo.needsUpdate = true;
    current = next;
    uniforms.uProgress.value = still ? 1 : 0;
    flightStart = performance.now();
    render();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const formation = SECTIONS.find(([selector]) => entry.target.matches(selector))?.[1];
        if (formation && formation !== current) fly(formation);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  for (const [selector] of SECTIONS) {
    const el = document.querySelector(selector);
    if (el) observer.observe(el);
  }

  const pointer = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  addEventListener('pointermove', (event) => {
    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
  });

  // The first flight: from scattered dust into the galaxy.
  for (let i = 0; i < N; i++) from.set([(rand() - 0.5) * 18, (rand() - 0.5) * 12, -8 + rand() * 10], i * 3);
  uniforms.uProgress.value = still ? 1 : 0;
  flightStart = performance.now() + (document.documentElement.classList.contains('intro') ? 900 : 0);

  let spin = 0;
  const begin = performance.now();
  const tiltX = () => (current === 'galaxy' ? 0.42 : current === 'chart' ? 0.12 : 0.18);
  function render() {
    // Without motion nothing animates the pose, so set it here.
    if (still) {
      world.rotation.set(tiltX(), 0, current === 'galaxy' ? -0.18 : 0);
      const { x, y, z } = target();
      world.position.set(x, y, z);
    }
    renderer.render(scene, camera);
  }
  const frame = (now: number) => {
    const t = (now - begin) / 1000;
    uniforms.uTime.value = t;
    if (uniforms.uProgress.value < 1) uniforms.uProgress.value = Math.min(Math.max((now - flightStart) / 1000 / MORPH, 0), 1);

    look.x += (pointer.x - look.x) * 0.04;
    look.y += (pointer.y - look.y) * 0.04;
    // Spinning formations turn; the chart and the word ease back to face the reader.
    if (SPINS[current]) spin += 0.0018;
    else spin += ((Math.round(spin / (Math.PI * 2)) * Math.PI * 2) - spin) * 0.05;
    world.rotation.set(
      tiltX() + look.y * 0.25,
      spin + look.x * 0.5,
      current === 'galaxy' ? -0.18 : 0,
    );
    const goal = target();
    world.position.x += (goal.x - world.position.x) * 0.04;
    world.position.y += (goal.y - world.position.y) * 0.04;
    world.position.z += (goal.z - world.position.z) * 0.04;
    field.rotation.y = t * 0.01 + look.x * 0.1;
    field.position.y = (scrollY / innerHeight) * 0.6;
    render();
    raf = requestAnimationFrame(frame);
  };

  let raf = 0;
  new ResizeObserver(resize).observe(canvas);
  resize();
  paint();
  addEventListener('themechange', paint);
  world.position.set(anchor.x, anchor.y, anchor.z);

  if (still) {
    // No motion: each formation simply appears, and the frame is redrawn only when something changes.
    addEventListener('scroll', () => render(), { passive: true });
  } else {
    const run = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', run);
    run();
  }
  canvas.classList.add('is-ready');
}
