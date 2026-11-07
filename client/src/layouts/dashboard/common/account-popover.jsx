import { useState } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/context/AuthContext';

import ChangePasswordDialog from './change-password-dialog';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [open, setOpen] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: { xs: 40, sm: 45 },
          height: { xs: 40, sm: 45 },
          flexShrink: 0,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          // src={account.photoURL}
          alt={user.first_name}
          sx={{
            width: { xs: 34, sm: 40 },
            height: { xs: 34, sm: 40 },
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {`${user.first_name.charAt(0).toUpperCase()}${user.last_name.charAt(0).toUpperCase()}`}
        </Avatar>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            ml: 0.75,
            width: { xs: 'min(240px, calc(100vw - 24px))', sm: 200 },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {`${user.first_name} ${user.last_name}`}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
          {user.role && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap>
              {user.role}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleClose();
            setPasswordOpen(true);
          }}
          sx={{ typography: 'body2', py: 1.5 }}
        >
          Change Password
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed', m: 0 }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={() => router.push('/logout')}
          sx={{ typography: 'body2', color: 'error.main', py: 1.5 }}
        >
          Logout
        </MenuItem>
      </Popover>

      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
}
