import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function Footer({ sx, ...props }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems="center"
      justifyContent="center"
      spacing={{ xs: 0.25, sm: 0 }}
      sx={{
        flexShrink: 0,
        px: { xs: 2, sm: 3 },
        pt: { xs: 1.5, sm: 2 },
        pb: {
          xs: 'max(16px, calc(12px + env(safe-area-inset-bottom, 0px)))',
          sm: 2,
        },
        textAlign: 'center',
        ...sx,
      }}
      {...props}
    >
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.5 }}
      >
        Developed&nbsp;by&nbsp;
        <a
          href="https://www.refex.co.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit' }}
        >
          Refex&nbsp;AI&nbsp;Team
        </a>
        &nbsp;© {new Date().getFullYear()}
      </Typography>
    </Stack>
  );
}

Footer.propTypes = {
  sx: PropTypes.object,
};
