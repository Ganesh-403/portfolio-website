// The hero's 3D stage: the portrait printed on a thick card, an ink block behind it, and one paper
// block per week of merged LeapView pull requests standing in front, the busiest week in vermilion.
// It replaces the flat photo only once the first frame has drawn; without WebGL the photo stays.
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type Material,
} from 'three';

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

export async function mountStage(figure: HTMLElement) {
  const canvas = figure.querySelector<HTMLCanvasElement>('canvas');
  const src = figure.dataset.texture;
  const weeks: number[] = JSON.parse(figure.dataset.weeks ?? '[]');
  if (!canvas || !src) return;

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;


  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0.6, 2.1, 8.4);
  camera.lookAt(0, 1.25, 0);

  scene.add(new AmbientLight(0xffffff, 1.6));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-1.5, 8, 3.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 16 });
  scene.add(sun);

  // Only the shadows show on the page's own paper; the floor itself is invisible.
  const shadow = new ShadowMaterial();
  const floor = new Mesh(new PlaneGeometry(14, 14), shadow);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const outline = new LineBasicMaterial();
  const outlined = (mesh: Mesh) => {
    mesh.add(new LineSegments(new EdgesGeometry(mesh.geometry), outline));
    mesh.castShadow = true;
    return mesh;
  };

  const world = new Group();
  scene.add(world);

  // The photograph: a 2.4 unit square card with paper edges, and a solid ink block behind it.
  const texture = await new TextureLoader().loadAsync(src).catch(() => null);
  if (!texture) {
    renderer.dispose();
    return;
  }
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const edge = new MeshStandardMaterial({ roughness: 1 });
  const photo = new MeshBasicMaterial({ map: texture });
  const cardMaterials: Material[] = [edge, edge, edge, edge, photo, edge];
  const card = outlined(new Mesh(new BoxGeometry(2.4, 2.4, 0.06), cardMaterials));
  const blockMaterial = new MeshStandardMaterial({ roughness: 0.9 });
  const block = outlined(new Mesh(new BoxGeometry(2.4, 2.4, 0.3), blockMaterial));
  block.position.set(0.22, -0.22, -0.42);

  const print = new Group();
  print.add(card, block);
  print.position.set(-0.15, 1.75, -0.2);
  print.rotation.set(0, 0.12, -0.02);
  world.add(print);

  // One block per week, in front of the photo; heights share one scale so the weeks compare.
  const peak = Math.max(...weeks, 1);
  const busiest = weeks.indexOf(peak);
  const barMaterial = new MeshStandardMaterial({ roughness: 1 });
  const peakMaterial = new MeshStandardMaterial({ roughness: 0.8 });
  const bars = weeks.map((merged, i) => {
    const height = 0.08 + (merged / peak) * 1.05;
    const geometry = new BoxGeometry(0.2, height, 0.2);
    geometry.translate(0, height / 2, 0);
    const bar = outlined(new Mesh(geometry, i === busiest ? peakMaterial : barMaterial));
    bar.position.set(-1.25 + i * 0.27, 0, 0.95 - i * 0.04);
    world.add(bar);
    return bar;
  });

  // Loose sheets drifting behind, for depth.
  const sheets = [
    { x: -2.1, y: 2.8, z: -1.6, r: 0.5, s: 0.7 },
    { x: 1.45, y: 3.05, z: -1.4, r: -0.4, s: 0.5 },
    { x: -2.35, y: 0.9, z: -1.2, r: 0.9, s: 0.4 },
  ].map(({ x, y, z, r, s }) => {
    const sheet = outlined(new Mesh(new BoxGeometry(s, s * 1.3, 0.015), edge));
    sheet.position.set(x, y, z);
    sheet.rotation.set(r * 0.4, r, r * 0.3);
    world.add(sheet);
    return { sheet, y, r };
  });

  // Colours come from the page's palette, so the scene changes edition with it. In the dark edition
  // the busiest week glows a little.
  const paint = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    outline.color.set(css('--ink'));
    edge.color.set(css('--paper'));
    barMaterial.color.set(css('--paper-deep'));
    blockMaterial.color.set(css('--block'));
    peakMaterial.color.set(css('--accent'));
    peakMaterial.emissive.set(dark ? css('--accent') : '#000000');
    peakMaterial.emissiveIntensity = dark ? 0.45 : 0;
    shadow.color.set(dark ? '#000000' : css('--ink'));
    shadow.opacity = dark ? 0.55 : 0.16;
  };
  paint();
  addEventListener('themechange', () => {
    paint();
    frame(performance.now());
  });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // The pointer turns the stage a little, anywhere over the hero; it eases rather than snaps.
  const target = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  if (!still) {
    figure.closest('section')?.addEventListener('pointermove', (event) => {
      const box = canvas.getBoundingClientRect();
      target.x = ((event.clientX - box.left) / box.width - 0.5) * 2;
      target.y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    });
    figure.closest('section')?.addEventListener('pointerleave', () => {
      target.x = target.y = 0;
    });
  }

  // During the first-visit intro the stage waits for the curtain to lift.
  const start = performance.now() + (document.documentElement.classList.contains('intro') ? 1100 : 0);
  const frame = (now: number) => {
    const t = still ? 10 : (now - start) / 1000;
    look.x += (target.x - look.x) * 0.06;
    look.y += (target.y - look.y) * 0.06;

    // Scrolling away swings the stage round and tips the card back, so it leaves in depth.
    const hero = figure.closest('section');
    const away = hero ? Math.min(Math.max(scrollY / hero.offsetHeight, 0), 1) : 0;
    world.rotation.y = -0.32 + look.x * 0.28 + Math.sin(t * 0.35) * 0.05 + away * 0.8;
    world.rotation.x = look.y * 0.06 + away * 0.25;

    // The card settles in, then floats; the weeks rise one after another.
    const settle = easeOut(t / 1.2);
    print.position.y = 1.75 + (1 - settle) * 0.6 + Math.sin(t * 0.9) * 0.04;
    print.rotation.z = -0.02 + (1 - settle) * 0.12;
    bars.forEach((bar, i) => bar.scale.set(1, Math.max(easeOut((t - 0.4 - i * 0.07) / 0.7), 0.001), 1));
    sheets.forEach(({ sheet, y, r }, i) => {
      sheet.position.y = y + Math.sin(t * 0.6 + i * 2) * 0.12;
      sheet.rotation.y = r + Math.sin(t * 0.3 + i) * 0.2;
    });

    renderer.render(scene, camera);
  };

  // Draw only while the hero is on screen.
  let running = false;
  let raf = 0;
  const loop = (now: number) => {
    frame(now);
    if (running) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => {
    running = !still && entry.isIntersecting;
    cancelAnimationFrame(raf);
    if (running) raf = requestAnimationFrame(loop);
  }).observe(canvas);

  frame(performance.now());
  figure.classList.add('is-3d');
}
