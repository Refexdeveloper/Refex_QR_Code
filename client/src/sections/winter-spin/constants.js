// Refex brand + Winter Campaign palette
export const BRAND = {
  blue: '#2879B6',
  blueDeep: '#0B3D66',
  navy: '#071A2E',
  orange: '#F4553B',
  coral: '#FF6B4A',
  gold: '#F5C542',
  ice: '#E8F6FF',
  mist: '#B8D9F0',
  white: '#FFFFFF',
};

export const CAMPAIGN_TITLE = 'Refex Winter Carnival';
export const CAMPAIGN_TAGLINE = 'Shop & Win Contest at Pune International Airport';

/** Segment order must match server prize codes for landing animation. */
export const WHEEL_SEGMENTS = [
  {
    code: 'better_luck',
    label: 'Better Luck\nNext Time',
    color: '#123A5C',
    textColor: '#F3F8FC',
    icon: 'solar:smile-circle-bold-duotone',
    emoji: '🙂',
    badge: 'Try again',
  },
  {
    code: 'win_2000',
    label: 'Gift up to\n₹2,000',
    color: BRAND.blue,
    textColor: '#FFFFFF',
    icon: 'solar:gift-bold-duotone',
    emoji: '🎁',
    badge: 'Instant gift',
  },
  {
    code: 'bumper',
    label: 'Bumper Gift\nLucky Draw',
    color: BRAND.orange,
    textColor: '#FFFFFF',
    icon: 'solar:cup-star-bold-duotone',
    emoji: '🏆',
    badge: 'Lucky draw',
  },
  {
    code: 'win_5000',
    label: 'Gift up to\n₹5,000',
    color: '#0E7490',
    textColor: '#FFFFFF',
    icon: 'solar:gift-bold-duotone',
    emoji: '🎁',
    badge: 'Instant gift',
  },
  {
    code: 'win_7000',
    label: 'Gift up to\n₹7,000',
    color: '#B45309',
    textColor: '#FFFFFF',
    icon: 'solar:gift-bold-duotone',
    emoji: '🎁',
    badge: 'Instant gift',
  },
  {
    code: 'win_10000',
    label: 'Gift up to\n₹10,000',
    color: '#7C2D12',
    textColor: '#FFFFFF',
    icon: 'solar:gift-bold-duotone',
    emoji: '🎁',
    badge: 'Instant gift',
  },
];

export function segmentIndexForCode(code) {
  const idx = WHEEL_SEGMENTS.findIndex((s) => s.code === code);
  return idx >= 0 ? idx : 0;
}

export function getPrizeMeta(code) {
  return WHEEL_SEGMENTS.find((s) => s.code === code) || WHEEL_SEGMENTS[0];
}
