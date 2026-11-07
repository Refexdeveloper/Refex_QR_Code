import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export default function Main({ children, sx, ...other }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minWidth: 0,
        width: '100%',
        px: { xs: 1.5, sm: 2, md: 3 },
        pt: { xs: 1.5, sm: 2 },
        pb: { xs: 3, sm: 2 },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
