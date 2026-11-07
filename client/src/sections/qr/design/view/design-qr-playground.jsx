import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import DesignQrControls from './design-qr-controls';
import DesignQrPreview from './design-qr-preview';
import { cloneDesign, DEFAULT_DESIGN } from '../constants';
import { buildSaveFormData, designFromSavedItem } from '../utils';

// ----------------------------------------------------------------------

const PREVIEW_CANVAS_ID = 'design-qr-playground-preview';

export default function DesignQrPlayground({ open, onClose, onSaved, initialItem }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { enqueueSnackbar } = useSnackbar();
  const [design, setDesign] = useState(() => cloneDesign(DEFAULT_DESIGN));
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (initialItem) {
      setDesign(designFromSavedItem(initialItem));
      setLogoPreview(initialItem.design_config?.logoImage || '');
      setEditingId(initialItem.id);
    } else {
      setDesign(cloneDesign(DEFAULT_DESIGN));
      setLogoPreview('');
      setEditingId(null);
    }
    setLogoFile(null);
    setRemoveLogo(false);
  }, [open, initialItem]);

  const handleLogoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setRemoveLogo(false);

    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoClear = () => {
    setLogoFile(null);
    setLogoPreview('');
    setRemoveLogo(true);
  };

  const handleSave = async (currentDesign) => {
    if (!currentDesign.name?.trim()) {
      enqueueSnackbar('Please enter a design name', { variant: 'warning' });
      return;
    }
    if (!currentDesign.value?.trim()) {
      enqueueSnackbar('Please enter a QR value', { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      const { formData } = buildSaveFormData(currentDesign, { logoFile, removeLogo, editingId });

      const res = editingId
        ? await axios.put(`/api/design-qr/${editingId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await axios.post('/api/design-qr', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

      enqueueSnackbar(res.data.message || 'Design saved', {
        variant: res.data.status ? 'success' : 'error',
      });

      if (res.data.status) {
        onSaved?.(res.data.results);
        onClose?.();
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message || 'Failed to save design', {
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Toolbar
        sx={{
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          flexShrink: 0,
          gap: 1,
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <IconButton edge="start" onClick={onClose} aria-label="close">
          <Iconify icon="eva:close-fill" />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            ml: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {editingId ? 'Edit Design' : 'QR Design Playground'}
        </Typography>
        {!isMobile && (
          <Button color="inherit" onClick={onClose}>
            Close
          </Button>
        )}
      </Toolbar>

      <DialogContent
        sx={{
          p: 0,
          height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            // Preview first on mobile/tablet; side-by-side on large screens
            flexDirection: { xs: 'column-reverse', lg: 'row' },
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: { xs: '1 1 auto', lg: '1 1 50%' },
              width: { lg: '50%' },
              maxWidth: { lg: '50%' },
              minWidth: 0,
              minHeight: 0,
              overflow: 'auto',
              p: { xs: 1.5, sm: 2, md: 2.5 },
              borderRight: { lg: 1 },
              borderTop: { xs: 1, lg: 0 },
              borderColor: 'divider',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <DesignQrControls
              design={design}
              onChange={setDesign}
              logoPreview={logoPreview}
              onLogoSelect={handleLogoSelect}
              onLogoClear={handleLogoClear}
            />
          </Box>

          <Box
            sx={{
              flex: { xs: '0 0 auto', lg: '1 1 50%' },
              width: { lg: '50%' },
              maxWidth: { lg: '50%' },
              height: { xs: 'auto', lg: '100%' },
              maxHeight: { xs: '42vh', sm: '46vh', lg: '100%' },
              minWidth: 0,
              minHeight: { xs: 280, lg: 0 },
              overflow: 'hidden',
              p: { xs: 1.5, sm: 2 },
              bgcolor: 'background.neutral',
              borderLeft: { lg: 1 },
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              position: { xs: 'sticky', lg: 'relative' },
              top: { xs: 0, lg: 'auto' },
              zIndex: { xs: 1, lg: 'auto' },
            }}
          >
            <DesignQrPreview
              design={design}
              logoPreview={logoPreview}
              canvasId={PREVIEW_CANVAS_ID}
              saving={saving}
              editingId={editingId}
              onNameChange={(name) => setDesign((prev) => ({ ...prev, name }))}
              onSave={handleSave}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

DesignQrPlayground.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
  initialItem: PropTypes.object,
};

export { PREVIEW_CANVAS_ID };
