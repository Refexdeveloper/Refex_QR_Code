import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import {
  RESPONSIVE_DIALOG_ACTIONS_SX,
  RESPONSIVE_DIALOG_CONTENT_SX,
  RESPONSIVE_DIALOG_PAPER_SX,
} from '../../common/responsive-dialog';

// ----------------------------------------------------------------------

export default function SmartLinkCreateDialog({ open, onClose, onSubmit, saving }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState('');
  const [androidUrl, setAndroidUrl] = useState('');
  const [iosUrl, setIosUrl] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setAndroidUrl('');
      setIosUrl('');
      setFallbackUrl('');
      setError('');
    }
  }, [open]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!androidUrl.trim() || !iosUrl.trim() || !fallbackUrl.trim()) {
      setError('All three links are required');
      return;
    }
    setError('');
    onSubmit({
      name: name.trim(),
      androidUrl: androidUrl.trim(),
      iosUrl: iosUrl.trim(),
      fallbackUrl: fallbackUrl.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: RESPONSIVE_DIALOG_PAPER_SX }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', height: fullScreen ? '100%' : 'auto' }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            fontSize: { xs: '1.15rem', sm: '1.25rem' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          Create Smart Link QR Code
          {fullScreen && (
            <IconButton onClick={handleClose} disabled={saving} edge="end" aria-label="Close">
              <Iconify icon="eva:close-fill" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ ...RESPONSIVE_DIALOG_CONTENT_SX, flex: 1 }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              required
              fullWidth
              label="Name"
              placeholder="e.g. refex-eveelz-app"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              helperText="Used in the static QR link path"
            />
            <TextField
              required
              fullWidth
              type="url"
              label="Android Link"
              placeholder="https://play.google.com/store/apps/details?id=..."
              value={androidUrl}
              onChange={(e) => {
                setAndroidUrl(e.target.value);
                setError('');
              }}
            />
            <TextField
              required
              fullWidth
              type="url"
              label="iPhone / iPad / macOS Link"
              placeholder="https://apps.apple.com/..."
              value={iosUrl}
              onChange={(e) => {
                setIosUrl(e.target.value);
                setError('');
              }}
            />
            <TextField
              required
              fullWidth
              type="url"
              label="Fallback Link"
              placeholder="https://example.com"
              value={fallbackUrl}
              onChange={(e) => {
                setFallbackUrl(e.target.value);
                setError('');
              }}
              error={Boolean(error)}
              helperText={
                error ||
                'QR encodes a static URL; device type decides which link opens. Links can be edited later.'
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={RESPONSIVE_DIALOG_ACTIONS_SX}>
          <Button onClick={handleClose} disabled={saving} fullWidth={fullScreen}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} fullWidth={fullScreen}>
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

SmartLinkCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  saving: PropTypes.bool,
};
