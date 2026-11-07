import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { useResponsive } from 'src/hooks/use-responsive';

import Nav from './nav';
import Main from './main';
import TopBar from './top-bar';
import Footer from './footer';
import { HEADER } from './config-layout';

// ----------------------------------------------------------------------

export default function AdminLayout({ children }) {
  const lgUp = useResponsive('up', 'lg');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const headerHeight = lgUp ? HEADER.H_DESKTOP : HEADER.H_MOBILE;

  const handleToggleNav = () => {
    if (lgUp) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileNavOpen((prev) => !prev);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: '100dvh', sm: '100vh' },
        width: '100%',
      }}
    >
      <TopBar showMenuButton onToggleNav={handleToggleNav} />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          width: '100%',
          pt: `${headerHeight}px`,
        }}
      >
        <Nav
          open={sidebarOpen}
          mobileOpen={mobileNavOpen}
          headerHeight={headerHeight}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Main sx={{ flex: '1 0 auto' }}>{children}</Main>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
};
