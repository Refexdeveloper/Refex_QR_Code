import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { alpha, useTheme } from '@mui/material/styles';
import { Typography, ListItemButton } from '@mui/material';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';

// import Searchbar from './common/searchbar';

import Logo from 'src/components/logo';

import { HEADER } from './config-layout';
import AccountPopover from './common/account-popover';
// import LanguagePopover from './common/language-popover';

const Pages = [
  { title: 'Assets List', path: '/assets/list' },
  { title: 'Assets API Access', path: '/assets/api-access' },
];

// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const theme = useTheme();
  const pathname = usePathname();
  const lgUp = useResponsive('up', 'lg');

  const renderContent = (
    <>
      <Logo sx={{ mt: -1.25 }} />

      <Stack direction="row" alignItems="center" mx={3}>
        {Pages.map((page, index) => {
          const active = pathname.startsWith(page.path);

          return (
            <ListItemButton
              key={index}
              component={RouterLink}
              href={page.path}
              sx={{
                minHeight: 44,
                borderRadius: 0.75,
                typography: 'h6',
                color: '#2879b6',
                textTransform: 'capitalize',
                fontWeight: 'fontWeightMedium',
                ...(active && {
                  color: '#F4553B',
                  fontWeight: 'fontWeightSemiBold',
                  // bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                  },
                }),
                '&:hover': {
                  color: '#F4553B',
                },
              }}
            >
              <Box component="span">
                <Typography variant="h6">{page.title}</Typography>
              </Box>
            </ListItemButton>
          );
        })}
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        {/* <LanguagePopover /> */}
        {/* <NotificationsPopover /> */}
        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          height: HEADER.H_DESKTOP,
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
