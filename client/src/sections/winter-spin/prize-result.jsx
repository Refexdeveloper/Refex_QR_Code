import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import { BRAND, getPrizeMeta } from './constants';

// ----------------------------------------------------------------------

export default function PrizeResult({ entry, alreadySpun }) {
  if (!entry) return null;

  const meta = getPrizeMeta(entry.prizeCode);
  const isCashWin = ['win_2000', 'win_5000', 'win_7000', 'win_10000'].includes(entry.prizeCode);
  const isBumper = entry.prizeCode === 'bumper';
  const isBetterLuck = entry.prizeCode === 'better_luck';

  let title = 'Your result';
  let accent = BRAND.blue;

  if (isCashWin) {
    title = 'Congratulations!';
    accent = BRAND.gold;
  } else if (isBumper) {
    title = 'Lucky Draw Entry!';
    accent = BRAND.orange;
  } else if (isBetterLuck) {
    title = 'Thanks for playing!';
    accent = BRAND.mist;
  }

  return (
    <Box
      sx={{
        height: 1,
        p: { xs: 2.25, sm: 2.75, md: 3.25 },
        borderRadius: { xs: 2.5, md: 3 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha('#04101D', 0.58),
        border: `1px solid ${alpha(accent, 0.55)}`,
        boxShadow: `0 20px 60px ${alpha(BRAND.navy, 0.45)}, inset 0 1px 0 ${alpha('#fff', 0.06)}`,
        backdropFilter: 'blur(10px)',
        minHeight: { xs: 240, sm: 300, md: 440 },
        backgroundImage: `radial-gradient(circle at 50% 0%, ${alpha(accent, 0.18)}, transparent 55%)`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: 96, sm: 118, md: 132 },
          height: { xs: 96, sm: 118, md: 132 },
          mb: { xs: 1.5, sm: 2 },
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(accent, 0.16),
          border: `3px solid ${alpha(accent, 0.7)}`,
          boxShadow: `0 0 0 8px ${alpha(accent, 0.12)}, 0 16px 40px ${alpha(accent, 0.28)}`,
          animation: 'prizePop 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
          '@keyframes prizePop': {
            '0%': { transform: 'scale(0.4)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      >
        <Typography
          component="span"
          sx={{ fontSize: { xs: 44, sm: 56, md: 64 }, lineHeight: 1 }}
        >
          {meta.emoji}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -2, sm: -4 },
            bottom: { xs: -2, sm: -4 },
            width: { xs: 34, sm: 40 },
            height: { xs: 34, sm: 40 },
            borderRadius: '50%',
            bgcolor: BRAND.navy,
            border: `2px solid ${accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon={meta.icon} width={20} sx={{ color: accent }} />
        </Box>
      </Box>

      <Chip
        size="small"
        label={meta.badge || 'Prize'}
        sx={{
          mb: 1.25,
          fontWeight: 700,
          color: '#fff',
          bgcolor: alpha(accent, 0.25),
          border: `1px solid ${alpha(accent, 0.55)}`,
        }}
      />

      <Typography
        variant="overline"
        sx={{ color: alpha('#fff', 0.7), letterSpacing: 1.2, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
      >
        {alreadySpun ? 'Saved result' : 'Spin result'}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 0.5,
          color: '#fff',
          fontWeight: 800,
          fontSize: { xs: '1.25rem', sm: '1.55rem', md: '1.85rem' },
          px: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: accent,
          fontWeight: 800,
          fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
          maxWidth: 340,
          px: 1,
          lineHeight: 1.35,
        }}
      >
        {entry.prizeLabel}
      </Typography>

      <Stack spacing={0.75} sx={{ mt: { xs: 2, sm: 2.5 }, color: alpha('#fff', 0.8), maxWidth: 340, px: 1 }}>
        {isCashWin && (
          <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
            This is an instant gift, not cash. The store manager confirms it with the Refex Floor Manager before handover.
          </Typography>
        )}
        {isBumper && (
          <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
            You are eligible for the bumper gift through the lucky draw. This spin does not include an instant gift.
          </Typography>
        )}
        {isBetterLuck && (
          <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
            Thank you for joining the Refex Winter Carnival. This spin does not include an instant gift, and you remain eligible for the weekly bumper lucky draw.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

PrizeResult.propTypes = {
  entry: PropTypes.object,
  alreadySpun: PropTypes.bool,
};
