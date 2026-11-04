// Cards marked data-tilt lean toward the pointer like a sheet lifted off the desk; the ink block
// under them slides the other way. Only with a mouse or pen, and never with reduced motion.
export function tilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;

  for (const card of document.querySelectorAll<HTMLElement>('[data-tilt]')) {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      for (const name of ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y']) card.style.removeProperty(name);
    });
  }
}

// Buttons marked data-magnet lean toward a nearby pointer, then spring back when it leaves.
export function magnet() {
  if (!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;

  for (const button of document.querySelectorAll<HTMLElement>('[data-magnet]')) {
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect();
      const x = event.clientX - (box.left + box.width / 2);
      const y = event.clientY - (box.top + box.height / 2);
      button.style.translate = `${(x * 0.22).toFixed(1)}px ${(y * 0.32).toFixed(1)}px`;
    });
    button.addEventListener('pointerleave', () => button.style.removeProperty('translate'));
  }
}
