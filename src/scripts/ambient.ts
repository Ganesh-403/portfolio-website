// The ambient layer: paper planes, loose sheets and a few solid shapes hang in the space behind the
// page. The camera follows the scroll at a slower pace than the text, so they drift past at their
// own depth, and it leans with the pointer. Shapes straddle the window's edges, clear of the text.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from 'three';

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// A folded paper dart: two wings and a keel, all from one nose.
function planeGeometry() {
  const nose = [0, 0, 1.1];
  const left = [-0.75, 0.08, -0.55];
  const right = [0.75, 0.08, -0.55];
  const back = [0, 0, -0.55];
  const keel = [0, -0.28, -0.55];
  const faces = [nose, left, back, nose, back, right, nose, back, keel];
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(faces.flat(), 3));
  geometry.computeVertexNormals();
  return geometry;
}

// How far the camera travels per screen of scrolling; less than the text so the shapes lag behind.
const PACE = 0.55;
const FOV = 35;
const DISTANCE = 10;

export function mountAmbient(canvas: HTMLCanvasElement) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;

  // Each shape has a role in the palette, so it can repaint when the edition changes.
  const roles = { paper: '--paper', shade: '--paper-shade', accent: '--accent', ochre: '--ochre', ink: '--ink' } as const;
  type Role = keyof typeof roles;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.z = DISTANCE;
  scene.add(new AmbientLight(0xffffff, 1.7));
  const sun = new DirectionalLight(0xffffff, 2);
  sun.position.set(-4, 6, 8);
  scene.add(sun);

  const outline = new LineBasicMaterial({ transparent: true, opacity: 0.85 });
  const materials = new Map<Role, MeshStandardMaterial>(
    (Object.keys(roles) as Role[]).map((role) => [role, new MeshStandardMaterial({ roughness: 0.95, flatShading: true, side: DoubleSide })]),
  );
  const make = (geometry: BufferGeometry, role: Role) => {
    const mesh = new Mesh(geometry, materials.get(role));
    mesh.add(new LineSegments(new EdgesGeometry(geometry, 20), outline));
    return mesh;
  };

  // Dust: fine specks of ink (or, in the dark, of light) through the whole depth of the page.
  const dustMaterial = new PointsMaterial({ size: 0.04, transparent: true, depthWrite: false });
  let dust: Points | null = null;

  const paint = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    for (const [role, material] of materials) {
      material.color.set(css(roles[role]));
      const glows = dark && (role === 'accent' || role === 'ochre');
      material.emissive.set(glows ? css(roles[role]) : '#000000');
      material.emissiveIntensity = glows ? 0.35 : 0;
    }
    outline.color.set(css('--ink'));
    outline.opacity = dark ? 0.55 : 0.85;
    dustMaterial.color.set(dark ? css('--ochre') : css('--ink'));
    dustMaterial.opacity = dark ? 0.7 : 0.35;
  };
  paint();
  addEventListener('themechange', paint);

  // The cast, in the order they appear down the page.
  const kinds = [
    () => make(planeGeometry(), 'paper'),
    () => make(new OctahedronGeometry(0.55), 'accent'),
    () => make(new BoxGeometry(0.9, 1.2, 0.02), 'paper'),
    () => make(new TorusGeometry(0.45, 0.16, 10, 28), 'ochre'),
    () => make(planeGeometry(), 'paper'),
    () => make(new IcosahedronGeometry(0.5), 'shade'),
    () => make(new ConeGeometry(0.45, 0.9, 4), 'ink'),
    () => make(new BoxGeometry(0.5, 0.5, 0.5), 'accent'),
  ];

  const unitHeight = 2 * DISTANCE * Math.tan((FOV / 2) * (Math.PI / 180));
  type Item = { mesh: Mesh; group: Group; scale: number; side: number; depth: number; y: number; spin: number; phase: number; plane: boolean };
  let items: Item[] = [];

  // Lays the shapes out for the page's current length; one every ~0.7 screens, sides alternating.
  const layout = () => {
    const screens = document.documentElement.scrollHeight / innerHeight;
    const count = Math.max(6, Math.round(screens / 0.7));
    // Opening a disclosure changes the length a little; only a new count rebuilds the cast.
    if (count === items.length) return place();
    for (const { group, mesh } of items) {
      scene.remove(group);
      mesh.geometry.dispose();
    }
    items = Array.from({ length: count }, (_, i) => {
      const kind = i % kinds.length;
      const mesh = kinds[kind]();
      const group = new Group();
      group.add(mesh);
      const depth = -1.5 - ((i * 7) % 5) * 0.9;
      const y = -(0.35 + i * 0.7) * unitHeight * PACE - Math.sin(i * 2.3) * 0.6;
      scene.add(group);
      const scale = 0.8 + ((i * 3) % 4) * 0.18;
      return { mesh, group, scale, side: i % 2 ? 1 : -1, depth, y, spin: 0.15 + ((i * 5) % 7) * 0.05, phase: i * 1.7, plane: kind === 0 || kind === 4 };
    });
    // The dust spans the same stretch of page as the shapes.
    if (dust) {
      scene.remove(dust);
      dust.geometry.dispose();
    }
    const bottom = -(0.35 + count * 0.7) * unitHeight * PACE;
    const specks = Math.min(900, count * 60);
    const positions = new Float32Array(specks * 3);
    for (let i = 0; i < specks; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = 2 + Math.random() * (bottom - 4);
      positions[i * 3 + 2] = -7 + Math.random() * 9;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    dust = new Points(geometry, dustMaterial);
    scene.add(dust);
    place();
  };

  // Each shape sits on the window's edge at its depth, so only part of it shows. A narrow window has
  // no margins beside the text, so there the shapes shrink and sit half outside it.
  const place = () => {
    const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    const narrow = aspect < 1;
    const shrink = Math.min(1, aspect / 1.3);
    for (const item of items) {
      const halfWidth = ((DISTANCE - item.depth) * Math.tan((FOV / 2) * (Math.PI / 180))) * aspect;
      item.group.position.set(item.side * halfWidth * (narrow ? 1.02 : 0.84), item.y, item.depth);
      item.group.scale.setScalar(item.scale * shrink);
    }
  };

  const resize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    place();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  layout();
  new ResizeObserver(() => layout()).observe(document.body);

  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', (event) => {
    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
  });

  const look = { x: 0, y: 0, scroll: scrollY };
  const start = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const t = (now - start) / 1000;
    look.x += (pointer.x - look.x) * 0.05;
    look.y += (pointer.y - look.y) * 0.05;
    look.scroll += (scrollY - look.scroll) * 0.12;
    camera.position.x = look.x * 0.8;
    camera.position.y = -(look.scroll / innerHeight) * unitHeight * PACE - look.y * 0.5;
    camera.lookAt(look.x * 0.3, camera.position.y, 0);

    for (const item of items) {
      const { mesh, group, spin, phase, plane } = item;
      if (plane) {
        // Planes glide: a slow bank and a little lift, nose pointing across the page.
        mesh.rotation.set(0.25 + Math.sin(t * 0.8 + phase) * 0.12, item.side * -1.1, Math.sin(t * 0.6 + phase) * 0.35);
        group.position.y = item.y + Math.sin(t * 0.7 + phase) * 0.25;
      } else {
        mesh.rotation.x = t * spin + phase;
        mesh.rotation.y = t * spin * 0.7 + phase;
        group.position.y = item.y + Math.sin(t * 0.5 + phase) * 0.15;
      }
    }
    if (dust) {
      dust.position.x = Math.sin(t * 0.05) * 0.4;
      dust.position.y = Math.sin(t * 0.08) * 0.3;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const run = () => {
    cancelAnimationFrame(raf);
    if (document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', run);
  run();
  canvas.classList.add('is-ready');
}
