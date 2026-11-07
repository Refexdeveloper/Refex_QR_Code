import PropTypes from 'prop-types';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

import { HEADER } from './config-layout';
import { getSubNavForPath } from './config-navigation';
import AccountPopover from './common/account-popover';

// ----------------------------------------------------------------------

function SectionNavLinks({ items, pathname }) {
  if (!items?.length) {
    return null;
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={{ md: 1.5, lg: 2 }}
      sx={{
        ml: { md: 1.5, lg: 2 },
        minWidth: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {items.map((page) => {
        const active = pathname === page.path || pathname.startsWith(`${page.path}/`);

        return (
          <Link
            key={page.path}
            component={RouterLink}
            href={page.path}
            underline="none"
            variant="subtitle2"
            sx={{
              color: active ? '#F4553B' : '#2879b6',
              fontWeight: active ? 600 : 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              px: 0.5,
              py: 0.25,
              transition: 'color 0.2s',
              '&:hover': {
                color: '#F4553B',
              },
            }}
          >
            {page.title}
          </Link>
        );
      })}
    </Stack>
  );
}

SectionNavLinks.propTypes = {
  items: PropTypes.array,
  pathname: PropTypes.string,
};

function SectionNavMenu({ items, pathname }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!items?.length) {
    return null;
  }

  const activeItem = items.find(
    (page) => pathname === page.path || pathname.startsWith(`${page.path}/`)
  );

  return (
    <>
      <Button
        size="small"
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={16} />}
        startIcon={<Iconify icon="eva:menu-2-outline" width={18} />}
        sx={{
          width: { xs: 1, sm: 'auto' },
          maxWidth: 1,
          color: '#2879b6',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          px: 1.25,
          py: 0.75,
          textTransform: 'none',
          fontWeight: 600,
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {activeItem?.title || 'Pages'}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: { mt: 1, minWidth: 220, maxWidth: 'calc(100vw - 32px)' },
        }}
      >
        {items.map((page) => {
          const active = pathname === page.path || pathname.startsWith(`${page.path}/`);
          return (
            <MenuItem
              key={page.path}
              component={RouterLink}
              href={page.path}
              selected={active}
              onClick={() => setAnchorEl(null)}
              sx={{
                color: active ? '#F4553B' : 'text.primary',
                fontWeight: active ? 600 : 500,
              }}
            >
              {page.title}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

SectionNavMenu.propTypes = {
  items: PropTypes.array,
  pathname: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function TopBar({ onToggleNav, showMenuButton = false, navItems }) {
  const theme = useTheme();
  const pathname = usePathname();
  const lgUp = useResponsive('up', 'lg');
  const mdUp = useResponsive('up', 'md');
  const items = navItems || getSubNavForPath(pathname);

  return (
    <AppBar
      position="fixed"
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
          px: { xs: 1.5, sm: 2, lg: 3 },
          gap: { xs: 0.75, sm: 1 },
          minWidth: 0,
        }}
      >
        {showMenuButton && (
          <IconButton onClick={onToggleNav} edge="start" sx={{ mr: { xs: 0, sm: 0.5 } }}>
            <Iconify icon="eva:menu-2-fill" />
          </IconButton>
        )}

        <Logo
          sx={{
            mt: { xs: -0.5, md: -1.25 },
            flexShrink: 0,
            height: { xs: 28, sm: 40, md: 44 },
            width: 'auto',
            maxWidth: { xs: 108, sm: 168 },
            objectFit: 'contain',
          }}
        />

        {mdUp ? (
          <SectionNavLinks items={items} pathname={pathname} />
        ) : (
          <Box sx={{ ml: 0.5, minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
            <SectionNavMenu items={items} pathname={pathname} />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 8, display: { xs: 'none', md: 'block' } }} />

        <AccountPopover />
      </Toolbar>
    </AppBar>
  );
}

TopBar.propTypes = {
  onToggleNav: PropTypes.func,
  showMenuButton: PropTypes.bool,
  navItems: PropTypes.array,
};
