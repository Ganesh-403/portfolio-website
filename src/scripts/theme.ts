// The light/dark switch. Dark (the deep field) is the default; a choice is remembered, and an
// inline script in Base.astro applies it before the first paint.
const KEY = 'theme';

export type Theme = 'light' | 'dark';

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#05060b' : '#f4f4f8');
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
}

export function themeSwitch() {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-switch]');
  if (!button) return;
  const sync = () => button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
  sync();

  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || still) {
      apply(next);
      sync();
      return;
    }
    // The new edition opens as a circle from the switch until it covers the window.
    const box = button.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => {
      apply(next);
      sync();
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  });
}
