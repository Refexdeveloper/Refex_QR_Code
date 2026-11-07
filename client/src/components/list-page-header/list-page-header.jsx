import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function ListPageHeader({ title, actions, sx, ...other }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      gap={2}
      mb={3}
      sx={sx}
      {...other}
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: '1.35rem', sm: '1.5rem', md: '2rem' },
          flexShrink: 0,
          pr: { sm: 2 },
        }}
      >
        {title}
      </Typography>

      {actions ? (
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
          useFlexGap
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{
            flex: { sm: 1 },
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {actions}
        </Stack>
      ) : null}
    </Stack>
  );
}

ListPageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  actions: PropTypes.node,
  sx: PropTypes.object,
};
