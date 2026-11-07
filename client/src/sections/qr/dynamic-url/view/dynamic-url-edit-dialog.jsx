import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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

export default function DynamicUrlEditDialog({ open, onClose, onSubmit, item, saving }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [dynamicValue, setDynamicValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && item) {
      setDynamicValue(item.dynamic_value || '');
      setError('');
    }
  }, [open, item]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!dynamicValue.trim()) {
      setError('Dynamic URL or data is required');
      return;
    }
    setError('');
    onSubmit(dynamicValue.trim());
  };

  if (!item) {
    return null;
  }

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
            wordBreak: 'break-word',
          }}
        >
          <Box component="span" sx={{ minWidth: 0 }}>
            Edit Dynamic Link — {item.code}
          </Box>
          {fullScreen && (
            <IconButton onClick={handleClose} disabled={saving} edge="end" aria-label="Close">
              <Iconify icon="eva:close-fill" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ ...RESPONSIVE_DIALOG_CONTENT_SX, flex: 1 }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Name: <strong>{item.name}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              Static URL (unchanged): {item.static_url}
            </Typography>
            <TextField
              required
              fullWidth
              multiline
              minRows={fullScreen ? 5 : 3}
              label="Dynamic URL / Data"
              value={dynamicValue}
              onChange={(e) => {
                setDynamicValue(e.target.value);
                setError('');
              }}
              error={Boolean(error)}
              helperText={error || 'Update where the static QR link redirects'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={RESPONSIVE_DIALOG_ACTIONS_SX}>
          <Button onClick={handleClose} disabled={saving} fullWidth={fullScreen}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} fullWidth={fullScreen}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

DynamicUrlEditDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  item: PropTypes.object,
  saving: PropTypes.bool,
};
