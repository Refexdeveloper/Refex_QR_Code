import { useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter, usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';
import { useAuth } from 'src/context/AuthContext';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import { adminSidebarNav, getSectionFromPath } from './config-navigation';

// ----------------------------------------------------------------------

function NavAccount() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = `${user.first_name?.charAt(0)?.toUpperCase() || ''}${user.last_name?.charAt(0)?.toUpperCase() || ''}`;

  return (
    <Box
      sx={{
        flexShrink: 0,
        px: 1.5,
        py: 1.5,
        borderTop: (theme) => `dashed 1px ${theme.palette.divider}`,
        bgcolor: 'background.default',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{initials}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block', lineHeight: 1.3 }}>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.3 }}>
            {user.role}
          </Typography>
        </Box>
      </Stack>

      <Button
        fullWidth
        size="small"
        color="error"
        variant="outlined"
        sx={{ py: 0.5, minHeight: 32, fontSize: 12 }}
        startIcon={<Iconify icon="eva:log-out-outline" width={16} />}
        onClick={() => router.push('/logout')}
      >
        Logout
      </Button>
    </Box>
  );
}

// ----------------------------------------------------------------------

function NavMenu({ pathname }) {
  return (
    <Stack component="nav" spacing={0.25} sx={{ py: 1, px: 1 }}>
      {adminSidebarNav.map((item) => (
        <NavItem key={item.title} item={item} pathname={pathname} />
      ))}
    </Stack>
  );
}

NavMenu.propTypes = {
  pathname: PropTypes.string,
};

// ----------------------------------------------------------------------

function SidebarShell({ headerHeight, pathname }) {
  const sidebarHeight = `calc(100dvh - ${headerHeight}px)`;

  return (
    <Box
      sx={{
        width: NAV.WIDTH,
        height: sidebarHeight,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Scrollbar
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <NavMenu pathname={pathname} />
      </Scrollbar>

      <NavAccount />
    </Box>
  );
}

SidebarShell.propTypes = {
  headerHeight: PropTypes.number,
  pathname: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function Nav({ open = true, mobileOpen = false, headerHeight = 64, onCloseMobile }) {
  const theme = useTheme();
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');

  useEffect(() => {
    if (mobileOpen) {
      onCloseMobile?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const sidebarHeight = `calc(100dvh - ${headerHeight}px)`;

  if (!upLg) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onCloseMobile}
        PaperProps={{
          sx: {
            width: NAV.WIDTH,
            overflow: 'hidden',
          },
        }}
      >
        <SidebarShell headerHeight={headerHeight} pathname={pathname} />
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        width: open ? NAV.WIDTH : 0,
        overflow: 'hidden',
        transition: theme.transitions.create('width', {
          duration: theme.transitions.duration.shorter,
        }),
        borderRight: open ? (t) => `dashed 1px ${t.palette.divider}` : 'none',
        bgcolor: 'background.default',
        position: 'sticky',
        top: `${headerHeight}px`,
        alignSelf: 'flex-start',
        height: sidebarHeight,
      }}
    >
      <SidebarShell headerHeight={headerHeight} pathname={pathname} />
    </Box>
  );
}

Nav.propTypes = {
  open: PropTypes.bool,
  mobileOpen: PropTypes.bool,
  headerHeight: PropTypes.number,
  onCloseMobile: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item, pathname }) {
  const activeSection = getSectionFromPath(pathname);
  const active = activeSection === item.section;

  return (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 34,
        py: 0.5,
        px: 1,
        borderRadius: 0.75,
        typography: 'caption',
        fontSize: 13,
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 500,
        ...(active && {
          color: 'primary.main',
          fontWeight: 600,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
    >
      <Box component="span" sx={{ width: 18, height: 18, mr: 1.25, display: 'flex' }}>
        {item.icon}
      </Box>

      <Box component="span">{item.title}</Box>
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
  pathname: PropTypes.string,
};
