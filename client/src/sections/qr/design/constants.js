export const EYE_LABELS = ['Top left eye', 'Top right eye', 'Bottom left eye'];

export const CORNER_LABELS = ['Top left', 'Top right', 'Bottom right', 'Bottom left'];

export const DEFAULT_CORNER_RADIUS = [0, 0, 0, 0];

export const DEFAULT_EYE_RADIUS = [
  { outer: [0, 0, 0, 0], inner: [0, 0, 0, 0] },
  { outer: [0, 0, 0, 0], inner: [0, 0, 0, 0] },
  { outer: [0, 0, 0, 0], inner: [0, 0, 0, 0] },
];

export const DEFAULT_EYE_COLOR = [
  { outer: '#000000', inner: '#000000' },
  { outer: '#000000', inner: '#000000' },
  { outer: '#000000', inner: '#000000' },
];

export const DEFAULT_DESIGN = {
  name: '',
  value: '',
  ecLevel: 'M',
  enableCORS: false,
  size: 300,
  quietZone: 10,
  bgColor: '#FFFFFF',
  fgColor: '#000000',
  qrStyle: 'squares',
  logoWidth: 60,
  logoHeight: 60,
  logoOpacity: 1,
  logoPadding: 0,
  logoPaddingStyle: 'square',
  logoPaddingRadius: 0,
  removeQrCodeBehindLogo: false,
  eyeRadius: DEFAULT_EYE_RADIUS,
  eyeColor: DEFAULT_EYE_COLOR,
};

function normalizeCorners(value) {
  if (Array.isArray(value)) {
    return [
      Number(value[0]) || 0,
      Number(value[1]) || 0,
      Number(value[2]) || 0,
      Number(value[3]) || 0,
    ];
  }
  if (typeof value === 'number') {
    return [value, value, value, value];
  }
  return [...DEFAULT_CORNER_RADIUS];
}

export function normalizeEyeRadius(eyeRadius) {
  if (!Array.isArray(eyeRadius)) {
    return DEFAULT_EYE_RADIUS.map((eye) => ({
      outer: [...eye.outer],
      inner: [...eye.inner],
    }));
  }

  return DEFAULT_EYE_RADIUS.map((fallback, index) => {
    const eye = eyeRadius[index];

    if (typeof eye === 'number') {
      const corners = normalizeCorners(eye);
      return { outer: [...corners], inner: [...corners] };
    }

    if (eye && typeof eye === 'object') {
      return {
        outer: normalizeCorners(eye.outer),
        inner: normalizeCorners(eye.inner),
      };
    }

    return {
      outer: [...fallback.outer],
      inner: [...fallback.inner],
    };
  });
}

export function normalizeEyeColor(eyeColor) {
  if (!Array.isArray(eyeColor)) {
    return DEFAULT_EYE_COLOR.map((eye) => ({ ...eye }));
  }

  return DEFAULT_EYE_COLOR.map((fallback, index) => {
    const eye = eyeColor[index];

    if (typeof eye === 'string') {
      return { outer: eye, inner: eye };
    }

    if (eye && typeof eye === 'object') {
      return {
        outer: eye.outer || fallback.outer,
        inner: eye.inner || fallback.inner,
      };
    }

    return { ...fallback };
  });
}

export function cloneDesign(design) {
  return {
    ...design,
    eyeRadius: normalizeEyeRadius(design.eyeRadius),
    eyeColor: normalizeEyeColor(design.eyeColor),
  };
}
