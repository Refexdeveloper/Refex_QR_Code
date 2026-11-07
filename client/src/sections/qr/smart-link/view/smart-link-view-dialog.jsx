import PropTypes from 'prop-types';
import { QRCode } from 'react-qrcode-logo';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import { downloadQrFromCanvas } from '../../fixed-url/utils';
import {
  RESPONSIVE_DIALOG_ACTIONS_SX,
  RESPONSIVE_DIALOG_CONTENT_SX,
  RESPONSIVE_DIALOG_PAPER_SX,
} from '../../common/responsive-dialog';

// ----------------------------------------------------------------------

export default function SmartLinkViewDialog({ open, onClose, item }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  if (!item) {
    return null;
  }

  const canvasId = `smart-qr-view-${item.id}`;
  let qrSize = 240;
  if (fullScreen) qrSize = 200;
  else if (isTablet) qrSize = 220;

  const handleDownload = () => {
    downloadQrFromCanvas(canvasId, item.code);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: RESPONSIVE_DIALOG_PAPER_SX }}
    >
      <DialogTitle
        sx={{
          pr: 6,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          wordBreak: 'break-word',
        }}
      >
        <Box component="span" sx={{ minWidth: 0 }}>
          Smart Link QR — {item.code}
        </Box>
        {fullScreen && (
          <IconButton onClick={onClose} edge="end" aria-label="Close">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers sx={RESPONSIVE_DIALOG_CONTENT_SX}>
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              bgcolor: 'background.neutral',
              border: (t) => `1px solid ${t.palette.divider}`,
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <QRCode
              id={canvasId}
              value={item.static_url}
              size={qrSize}
              quietZone={12}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </Box>
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Typography variant="subtitle2">Static URL (encoded in QR)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {item.static_url}
            </Typography>
            <Typography variant="subtitle2">Android</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {item.android_url}
            </Typography>
            <Typography variant="subtitle2">iPhone / iPad / macOS</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {item.ios_url}
            </Typography>
            <Typography variant="subtitle2">Fallback</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {item.fallback_url}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={RESPONSIVE_DIALOG_ACTIONS_SX}>
        <Button onClick={onClose} fullWidth={fullScreen}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          fullWidth={fullScreen}
          startIcon={<Iconify icon="eva:download-outline" />}
        >
          Download PNG
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SmartLinkViewDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  item: PropTypes.object,
};
