import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import { formatAccessMode } from '../filter-config';
import {
  RESPONSIVE_DIALOG_ACTIONS_SX,
  RESPONSIVE_DIALOG_CONTENT_SX,
  RESPONSIVE_DIALOG_PAPER_SX,
} from '../../common/responsive-dialog';

// ----------------------------------------------------------------------

export default function UploadFileEditDialog({ open, onClose, onSubmit, item, saving }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);
  const [accessMode, setAccessMode] = useState('view');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && item) {
      setAccessMode(item.access_mode || 'view');
      setFile(null);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, item]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    onSubmit({ accessMode, file });
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
            Edit Upload File QR — {item.code}
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
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              Current file: {item.original_name} ({item.file_size_label})
            </Typography>

            <FormControl fullWidth>
              <InputLabel>When QR is scanned</InputLabel>
              <Select
                label="When QR is scanned"
                value={accessMode}
                onChange={(e) => setAccessMode(e.target.value)}
              >
                <MenuItem value="view">View in browser</MenuItem>
                <MenuItem value="download">Download file</MenuItem>
              </Select>
            </FormControl>

            <Stack spacing={1}>
              <Button variant="outlined" component="label" fullWidth={fullScreen}>
                Replace file (optional)
                <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
              </Button>
              {file ? (
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  New file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Leave empty to keep the current file. Current mode:{' '}
                  {formatAccessMode(item.access_mode)}
                </Typography>
              )}
            </Stack>

            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
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

UploadFileEditDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  item: PropTypes.object,
  saving: PropTypes.bool,
};
