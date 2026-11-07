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

// ----------------------------------------------------------------------

export default function FixedUrlCreateDialog({ open, onClose, onSubmit, saving }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
      setError('');
    }
  }, [open]);

  const handleClose = () => {
    if (saving) return;
    setValue('');
    setError('');
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('URL or data is required');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: '100%' },
          maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
        },
      }}
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
          Create Fixed URL QR Code
          {fullScreen && (
            <IconButton onClick={handleClose} disabled={saving} edge="end" aria-label="Close">
              <Iconify icon="eva:close-fill" />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, flex: 1 }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              required
              fullWidth
              multiline
              minRows={fullScreen ? 5 : 3}
              label="URL / Data"
              placeholder="https://example.com or any text to encode"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              error={Boolean(error)}
              helperText={error || 'This value will be encoded in the QR code'}
            />
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            alignItems: 'stretch',
            gap: { xs: 1, sm: 0 },
            '& > :not(:first-of-type)': { ml: { xs: 0, sm: 1 } },
          }}
        >
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

FixedUrlCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  saving: PropTypes.bool,
};
