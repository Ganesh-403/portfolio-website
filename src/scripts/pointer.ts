// Pointer effects for mouse and pen only: a ring that sits on the cursor and swells over anything
// clickable, and the lamp that lights every card from where the pointer is.
export function pointer() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...document.querySelectorAll<HTMLElement>('.card')];

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  if (!still) document.body.append(ring);

  const at = { x: -100, y: -100 };
  let queued = false;

  const paint = () => {
    queued = false;
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(at.x - box.left).toFixed(0)}px`);
      card.style.setProperty('--my', `${(at.y - box.top).toFixed(0)}px`);
    }
  };

  addEventListener('pointermove', (event) => {
    at.x = event.clientX;
    at.y = event.clientY;
    // Placed straight away, not eased towards the pointer, so it never lags behind the cursor.
    if (!still) ring.style.translate = `${at.x}px ${at.y}px`;
    const target = event.target as Element | null;
    ring.classList.toggle('is-over', !!target?.closest('a, button, summary, [role="tab"], [data-tilt], input, textarea'));
    if (!queued) {
      queued = true;
      requestAnimationFrame(paint);
    }
  });
  addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(paint);
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => ring.classList.add('is-away'));
  document.documentElement.addEventListener('pointerenter', () => ring.classList.remove('is-away'));
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));
}

// Section names decode from scrambled type the first time they scroll into view. Screen readers
// get the plain name; only the visible copy scrambles.
export function scramble() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+<>';
  const names = document.querySelectorAll<HTMLElement>('.section-name');

  const run = (el: HTMLElement) => {
    const text = el.dataset.text ?? '';
    const shown = el.querySelector<HTMLElement>('[data-shown]');
    if (!shown) return;
    const start = performance.now();
    const step = (now: number) => {
      const done = Math.floor((now - start) / 28);
      shown.textContent = [...text]
        .map((char, i) => (i < done || char === ' ' ? char : glyphs[Math.floor(Math.random() * glyphs.length)]))
        .join('');
      if (done < text.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      seen.unobserve(entry.target);
      run(entry.target as HTMLElement);
    }
  }, { rootMargin: '0px 0px -15% 0px' });

  for (const el of names) {
    const text = el.textContent?.trim() ?? '';
    el.dataset.text = text;
    el.innerHTML = '';
    const plain = document.createElement('span');
    plain.className = 'visually-hidden';
    plain.textContent = text;
    const shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    shown.dataset.shown = '';
    shown.textContent = text;
    el.append(plain, shown);
    seen.observe(el);
  }
}
