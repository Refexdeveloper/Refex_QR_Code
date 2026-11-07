import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import Box from '@mui/material/Box';

import { BRAND, CAMPAIGN_TITLE, WHEEL_SEGMENTS } from './constants';

// ----------------------------------------------------------------------

function drawWheel(ctx, size, rotationRad, segments) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  const slice = (Math.PI * 2) / segments.length;

  ctx.clearRect(0, 0, size, size);

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = 8;
  ctx.stroke();

  segments.forEach((segment, i) => {
    const start = rotationRad + i * slice - Math.PI / 2;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Prize emoji + labels
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emojiR = radius * 0.72;
    const textR = radius * 0.48;
    ctx.font = `${Math.max(18, size * 0.055)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    if (segment.emoji) {
      ctx.fillText(segment.emoji, emojiR, 0);
    }
    ctx.fillStyle = segment.textColor;
    ctx.font = `bold ${Math.max(10, size * 0.028)}px "Public Sans", sans-serif`;
    const lines = segment.label.split('\n');
    lines.forEach((line, li) => {
      ctx.fillText(line, textR, (li - (lines.length - 1) / 2) * (size * 0.034));
    });
    ctx.restore();
  });

  // Center hub
  const hub = radius * 0.18;
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, hub);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.45, BRAND.ice);
  grad.addColorStop(1, BRAND.blueDeep);
  ctx.beginPath();
  ctx.arc(cx, cy, hub, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = BRAND.navy;
  ctx.font = `800 ${Math.max(9, size * 0.028)}px "Public Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('REFEX', cx, cy - size * 0.012);
  ctx.font = `600 ${Math.max(8, size * 0.022)}px "Public Sans", sans-serif`;
  ctx.fillStyle = BRAND.orange;
  ctx.fillText('SPIN', cx, cy + size * 0.02);
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export default function SpinWheel({
  size = 340,
  spinning,
  targetIndex,
  spinToken,
  onSpinComplete,
}) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel(ctx, size, rotationRef.current, WHEEL_SEGMENTS);
    return undefined;
  }, [size]);

  useEffect(() => {
    if (!spinning || targetIndex == null || spinToken == null) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const slice = (Math.PI * 2) / WHEEL_SEGMENTS.length;
    const startRotation = rotationRef.current;

    // Pointer is at top (-90°). Segment center should land under pointer.
    const targetCenter = targetIndex * slice + slice / 2;
    const desired = -targetCenter; // relative to pointer at -90 handled in draw
    const turns = 5 + Math.floor(Math.random() * 3);
    let delta = desired - (startRotation % (Math.PI * 2));
    while (delta > 0) delta -= Math.PI * 2;
    delta -= turns * Math.PI * 2;

    const duration = 5200;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      rotationRef.current = startRotation + delta * eased;
      drawWheel(ctx, size, rotationRef.current, WHEEL_SEGMENTS);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        rotationRef.current = startRotation + delta;
        drawWheel(ctx, size, rotationRef.current, WHEEL_SEGMENTS);
        onSpinComplete?.();
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [spinning, targetIndex, spinToken, size, onSpinComplete]);

  const pointerScale = Math.max(0.75, Math.min(1.15, size / 360));

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: size,
        aspectRatio: '1 / 1',
        mx: 'auto',
        filter: 'drop-shadow(0 18px 40px rgba(7,26,46,0.4))',
      }}
    >
      {/* Pointer */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -6 * pointerScale,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: 0,
          height: 0,
          borderLeft: `${14 * pointerScale}px solid transparent`,
          borderRight: `${14 * pointerScale}px solid transparent`,
          borderTop: `${28 * pointerScale}px solid ${BRAND.gold}`,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: { xs: -8, sm: -10 },
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${BRAND.blue}, ${BRAND.orange}, ${BRAND.gold}, ${BRAND.blue})`,
          opacity: 0.32,
          animation: 'winterGlow 8s linear infinite',
          '@keyframes winterGlow': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          zIndex: 1,
          background: BRAND.navy,
          display: 'block',
        }}
        aria-label={`${CAMPAIGN_TITLE} prize wheel`}
      />
    </Box>
  );
}

SpinWheel.propTypes = {
  size: PropTypes.number,
  spinning: PropTypes.bool,
  targetIndex: PropTypes.number,
  spinToken: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSpinComplete: PropTypes.func,
};
