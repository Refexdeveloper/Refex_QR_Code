import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function StepItem({ index, step, accent }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          bgcolor: alpha(accent, 0.12),
          border: `1px solid ${alpha(accent, 0.2)}`,
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {index}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
          <Iconify icon={step.icon} width={18} sx={{ color: accent }} />
          <Typography variant="subtitle2">{step.title}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {step.description}
        </Typography>
      </Box>
    </Stack>
  );
}

StepItem.propTypes = {
  index: PropTypes.number,
  step: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
  }),
  accent: PropTypes.string,
};

function UseCaseCard({ item, accent }) {
  return (
    <Box
      sx={{
        height: 1,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[4],
          borderColor: alpha(accent, 0.45),
        },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          mb: 1.5,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          bgcolor: alpha(accent, 0.12),
        }}
      >
        <Iconify icon={item.icon} width={24} />
      </Box>
      <Typography variant="subtitle2" gutterBottom>
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
        {item.description}
      </Typography>
    </Box>
  );
}

UseCaseCard.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
  }),
  accent: PropTypes.string,
};

export default function QrFeatureGuide({ guide }) {
  if (!guide) return null;

  const { accent, accentSoft, accentBorder } = guide;

  return (
    <Card
      sx={{
        mt: 3,
        overflow: 'hidden',
        border: `1px solid ${accentBorder}`,
        background: (theme) =>
          `linear-gradient(135deg, ${accentSoft} 0%, ${theme.palette.background.paper} 42%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          px: { xs: 2.5, md: 3.5 },
          pt: { xs: 2.5, md: 3 },
          pb: { xs: 2.5, md: 3.5 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -36,
            right: -28,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: alpha(accent, 0.08),
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: 40,
            right: 80,
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: alpha(accent, 0.06),
            pointerEvents: 'none',
          }}
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          mb={3}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ maxWidth: 760 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accent,
                bgcolor: 'background.paper',
                border: `1px solid ${accentBorder}`,
                boxShadow: (theme) => theme.customShadows?.z4 || theme.shadows[2],
              }}
            >
              <Iconify icon={guide.heroIcon || guide.icon} width={30} />
            </Box>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: accent, letterSpacing: 1.1, fontWeight: 700 }}
              >
                Feature guide
              </Typography>
              <Typography variant="h5" sx={{ mb: 0.75 }}>
                {guide.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {guide.subtitle}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 999,
              bgcolor: 'background.paper',
              border: `1px solid ${accentBorder}`,
              color: accent,
            }}
          >
            <Iconify icon="solar:lightbulb-bolt-bold-duotone" width={18} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Quick start & use cases
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 860, lineHeight: 1.7 }}
        >
          {guide.overview}
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12} md={5}>
            <Box
              sx={{
                p: 2.5,
                height: 1,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                How it works
              </Typography>
              <Stack spacing={2.25}>
                {guide.steps.map((step, index) => (
                  <StepItem key={step.title} index={index + 1} step={step} accent={accent} />
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid xs={12} md={7}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Example use cases
            </Typography>
            <Grid container spacing={1.5}>
              {guide.useCases.map((item) => (
                <Grid xs={12} sm={6} key={item.title}>
                  <UseCaseCard item={item} accent={accent} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {guide.tip && (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(accent, 0.08),
              border: `1px dashed ${accentBorder}`,
            }}
          >
            <Iconify
              icon="solar:info-circle-bold-duotone"
              width={22}
              sx={{ color: accent, mt: 0.15, flexShrink: 0 }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ color: accent, mb: 0.25 }}>
                Pro tip
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {guide.tip}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>
    </Card>
  );
}

QrFeatureGuide.propTypes = {
  guide: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    accent: PropTypes.string,
    accentSoft: PropTypes.string,
    accentBorder: PropTypes.string,
    icon: PropTypes.string,
    heroIcon: PropTypes.string,
    overview: PropTypes.string,
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        icon: PropTypes.string,
      })
    ),
    useCases: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        icon: PropTypes.string,
      })
    ),
    tip: PropTypes.string,
  }),
};
