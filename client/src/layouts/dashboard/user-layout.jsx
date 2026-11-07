import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { useAuth } from 'src/context/AuthContext';
import { hasPageAccess } from 'src/utils/pageAccess';
import { useResponsive } from 'src/hooks/use-responsive';

import Main from './main';
import TopBar from './top-bar';
import Footer from './footer';
import { HEADER } from './config-layout';
import { SECTIONS, sectionSubNav } from './config-navigation';

// ----------------------------------------------------------------------

export default function UserLayout({ children, navItems }) {
  const { user } = useAuth();
  const lgUp = useResponsive('up', 'lg');
  const headerHeight = lgUp ? HEADER.H_DESKTOP : HEADER.H_MOBILE;
  const items =
    navItems ||
    [
      ...sectionSubNav[SECTIONS.qrCode],
      ...(hasPageAccess(user, 'campaign')
        ? [{ title: 'Winter Carnival', path: '/carnival/review' }]
        : []),
    ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: '100dvh', sm: '100vh' },
        width: '100%',
      }}
    >
      <TopBar navItems={items} showMenuButton={false} />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          pt: `${headerHeight}px`,
        }}
      >
        <Main sx={{ flex: '1 0 auto' }}>{children}</Main>
        <Footer />
      </Box>
    </Box>
  );
}

UserLayout.propTypes = {
  children: PropTypes.node,
  navItems: PropTypes.array,
};
