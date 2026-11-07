import confetti from 'canvas-confetti';

import { BRAND } from './constants';

// ----------------------------------------------------------------------

const CASH_COLORS = [
  BRAND.gold,
  '#FFE08A',
  BRAND.orange,
  BRAND.coral,
  BRAND.blue,
  '#7EC8FF',
  '#FFFFFF',
  '#FFD1C2',
];

const BUMPER_COLORS = [
  BRAND.orange,
  BRAND.coral,
  BRAND.gold,
  '#FFFFFF',
  '#FF8A65',
  BRAND.blue,
  '#FFF3BF',
];

const DEFAULT_COLORS = [BRAND.mist, BRAND.blue, BRAND.gold, '#FFFFFF', BRAND.coral];

function colorsFor(kind) {
  if (kind === 'cash') return CASH_COLORS;
  if (kind === 'bumper') return BUMPER_COLORS;
  return DEFAULT_COLORS;
}

function sideCannon(side, colors, extra = {}) {
  const isLeft = side === 'left';
  return confetti({
    particleCount: 18,
    angle: isLeft ? 60 : 120,
    spread: 55,
    startVelocity: 55,
    gravity: 0.85,
    drift: isLeft ? 0.35 : -0.35,
    ticks: 260,
    origin: { x: isLeft ? 0 : 1, y: 0.72 },
    colors,
    shapes: ['square', 'circle'],
    scalar: 1.05,
    zIndex: 9999,
    ...extra,
  });
}

function glitterBurst(colors) {
  return confetti({
    particleCount: 90,
    spread: 360,
    startVelocity: 28,
    gravity: 0.55,
    ticks: 220,
    origin: { x: 0.5, y: 0.42 },
    colors,
    shapes: ['star', 'circle'],
    scalar: 0.85,
    zIndex: 9999,
  });
}

function paperRain(colors) {
  return confetti({
    particleCount: 55,
    spread: 120,
    startVelocity: 35,
    gravity: 1.05,
    ticks: 300,
    origin: { x: 0.5, y: 0 },
    colors,
    shapes: ['square'],
    scalar: 1.15,
    zIndex: 9999,
  });
}

/**
 * Full-screen celebration: side cannons of color paper + glitter stars.
 * Safe to call multiple times; returns a cleanup that clears pending timers.
 */
export function celebratePrize(kind = 'cash') {
  const colors = colorsFor(kind);
  const timers = [];
  let intensity = 0.7;
  if (kind === 'cash') intensity = 1;
  else if (kind === 'bumper') intensity = 0.9;

  const schedule = (fn, delay) => {
    const id = window.setTimeout(fn, delay);
    timers.push(id);
  };

  // Wave 1 — dual side blast
  sideCannon('left', colors, { particleCount: Math.round(22 * intensity), startVelocity: 62 });
  sideCannon('right', colors, { particleCount: Math.round(22 * intensity), startVelocity: 62 });

  // Wave 2 — keep firing from both edges (cannon stream)
  let frame = 0;
  const stream = window.setInterval(() => {
    frame += 1;
    sideCannon('left', colors, {
      particleCount: Math.round(12 * intensity),
      startVelocity: 48 + frame * 2,
      spread: 50 + frame * 3,
    });
    sideCannon('right', colors, {
      particleCount: Math.round(12 * intensity),
      startVelocity: 48 + frame * 2,
      spread: 50 + frame * 3,
    });
    if (frame >= 6) window.clearInterval(stream);
  }, 140);
  timers.push(stream);

  // Wave 3 — center glitter / stars
  schedule(() => glitterBurst(colors), 180);
  schedule(() => glitterBurst(colors), 420);

  // Wave 4 — color paper from the top
  schedule(() => paperRain(colors), 260);
  schedule(() => paperRain(colors), 560);

  // Wave 5 — final dual pop near mid-height
  schedule(() => {
    confetti({
      particleCount: Math.round(70 * intensity),
      angle: 55,
      spread: 70,
      startVelocity: 58,
      origin: { x: 0.08, y: 0.55 },
      colors,
      shapes: ['square', 'star', 'circle'],
      zIndex: 9999,
    });
    confetti({
      particleCount: Math.round(70 * intensity),
      angle: 125,
      spread: 70,
      startVelocity: 58,
      origin: { x: 0.92, y: 0.55 },
      colors,
      shapes: ['square', 'star', 'circle'],
      zIndex: 9999,
    });
  }, 700);

  // Soft lingering glitter
  schedule(() => {
    confetti({
      particleCount: 40,
      spread: 100,
      startVelocity: 22,
      gravity: 0.4,
      ticks: 280,
      origin: { x: 0.5, y: 0.3 },
      colors,
      shapes: ['star'],
      scalar: 0.7,
      zIndex: 9999,
    });
  }, 980);

  return () => {
    timers.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
  };
}
