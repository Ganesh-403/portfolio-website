// The hero's orbit: one point of light per merged LeapView pull request, in a ring around the photo.
// The ring is a timeline: the points go round in the order they landed, first to latest, so each
// week takes a stretch of the ring as long as its count (the busiest week is the longest bright
// arc), and the colour runs from the first week (second accent) to the latest (accent).
//
// It is drawn on two canvases, one behind the photo and one in front, from the same scene: the
// back one keeps only the far half of the ring and the front one only the near half, so the ring
// passes behind the photo card and comes round in front of it.
//
// On load the points gather in once; after that the ring only turns, slowly and steadily, and leans
// a little toward the pointer. It draws only while the hero is on screen.
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

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const GATHER = 2.2;
// Tipped back from the top, and wide enough to clear the card above and below.
const TILT = -0.42;
const DISTANCE = 19;

// A seeded random, so the galaxy is the same shape on every visit.
function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const vertex = /* glsl */ `
  attribute vec3 aFrom;
  attribute float aDelay;
  attribute float aSize;
  attribute float aMix;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform vec3 uOld;
  uniform vec3 uNew;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    float t = clamp((uProgress - aDelay) / 0.7, 0.0, 1.0);
    t = 1.0 - pow(1.0 - t, 3.0);
    vec4 world = modelMatrix * vec4(mix(aFrom, position, t), 1.0);
    vDepth = world.z;
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (52.0 / -mv.z);
    vColor = mix(uOld, uNew, aMix);
  }
`;

const fragment = /* glsl */ `
  uniform float uAlpha;
  uniform float uSide;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    // This canvas keeps only its half of the ring: in front of the photo, or behind it.
    if (vDepth * uSide < 0.0) discard;
    // A bright core with a soft halo.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float halo = exp(-d * d * 22.0);
    float core = smoothstep(0.12, 0.0, d);
    gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.6), (halo * 0.8 + core) * uAlpha);
  }
`;

export function mountGalaxy(back: HTMLCanvasElement, front: HTMLCanvasElement, weeks: number[]) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rand = random(390);
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  const last = Math.max(weeks.length - 1, 1);
  const total = weeks.reduce((sum, count) => sum + count, 0) || 1;
  const points: { x: number; y: number; z: number; mix: number }[] = [];
  let order = 0;
  weeks.forEach((count, week) => {
    for (let n = 0; n < count; n++, order++) {
      // A narrow band, with a little scatter so it reads as light rather than a line.
      const a = (order / total) * Math.PI * 2;
      const r = 5.1 + gauss() * 0.12;
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: gauss() * 0.08, mix: week / last });
    }
  });

  const N = points.length;
  const position = new Float32Array(N * 3);
  const from = new Float32Array(N * 3);
  const delay = new Float32Array(N);
  const size = new Float32Array(N);
  const mix = new Float32Array(N);
  points.forEach((p, i) => {
    position.set([p.x, p.y, p.z], i * 3);
    // Before the gather each point waits further out along its own direction.
    const out = 1.8 + rand() * 1.2;
    from.set([p.x * out, p.y * out, (rand() - 0.5) * 6], i * 3);
    delay[i] = rand() * 0.3;
    size[i] = 1.8 + rand() * 2;
    mix[i] = p.mix;
  });

  const progress = { value: still ? 1 : 0 };
  const layer = (canvas: HTMLCanvasElement, side: 1 | -1) => {
    const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(position, 3));
    geometry.setAttribute('aFrom', new BufferAttribute(from, 3));
    geometry.setAttribute('aDelay', new BufferAttribute(delay, 1));
    geometry.setAttribute('aSize', new BufferAttribute(size, 1));
    geometry.setAttribute('aMix', new BufferAttribute(mix, 1));
    const uniforms = {
      uProgress: progress,
      uPixelRatio: { value: renderer.getPixelRatio() },
      uAlpha: { value: 1 },
      uSide: { value: side },
      uOld: { value: new Color() },
      uNew: { value: new Color() },
    };
    const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
    const stars = new Points(geometry, material);
    stars.frustumCulled = false;
    const group = new Group();
    group.add(stars);
    const scene = new Scene();
    scene.add(group);
    const camera = new PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 0, DISTANCE);
    return { canvas, renderer, scene, camera, group, material, uniforms };
  };

  let layers: ReturnType<typeof layer>[];
  try {
    layers = [layer(back, -1), layer(front, 1)];
  } catch {
    return;
  }

  const render = () => layers.forEach(({ renderer, scene, camera }) => renderer.render(scene, camera));

  const paint = () => {
    const dark = document.documentElement.dataset.theme !== 'light';
    for (const { material, uniforms } of layers) {
      uniforms.uOld.value.set(css('--accent-2'));
      uniforms.uNew.value.set(css('--accent'));
      uniforms.uAlpha.value = dark ? 1 : 0.9;
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
    }
    render();
  };

  // Both canvases cover the same box, so one size fits both.
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = back;
    for (const { renderer, camera } of layers) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the whole ring in frame however narrow the box.
      camera.position.z = w < h ? DISTANCE / Math.max(w / h, 0.6) : DISTANCE;
      camera.updateProjectionMatrix();
    }
    render();
  };

  const pointer = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  back.closest('section')?.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
  });

  const pose = (t: number) => {
    for (const { group } of layers) {
      // One steady turn about the ring's own axis, about four minutes a revolution.
      group.rotation.set(TILT - look.y * 0.08, look.x * 0.15, -0.3 + t * 0.026);
    }
  };

  const start = performance.now() + (document.documentElement.classList.contains('intro') ? 900 : 0);
  let raf = 0;
  const frame = (now: number) => {
    const t = Math.max((now - start) / 1000, 0);
    progress.value = Math.min(t / GATHER, 1);
    look.x += (pointer.x - look.x) * 0.04;
    look.y += (pointer.y - look.y) * 0.04;
    pose(t);
    render();
    raf = requestAnimationFrame(frame);
  };

  pose(0);
  new ResizeObserver(resize).observe(back);
  resize();
  paint();
  addEventListener('themechange', paint);

  if (!still) {
    // Draw only while the hero is on screen and the tab is visible.
    let onScreen = true;
    const run = () => {
      cancelAnimationFrame(raf);
      if (onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      run();
    }).observe(back);
    document.addEventListener('visibilitychange', run);
  }
  back.classList.add('is-ready');
  front.classList.add('is-ready');
}
