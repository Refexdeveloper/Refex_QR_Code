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

import { downloadQrFromCanvas } from '../utils';

// ----------------------------------------------------------------------

export default function FixedUrlViewDialog({ open, onClose, item }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  if (!item) {
    return null;
  }

  const canvasId = `fixed-qr-view-${item.id}`;
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
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
        },
      }}
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
          QR Code — {item.code}
        </Box>
        {fullScreen && (
          <IconButton onClick={onClose} edge="end" aria-label="Close">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
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
              value={item.value}
              size={qrSize}
              quietZone={12}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ wordBreak: 'break-all', width: '100%', textAlign: { xs: 'left', sm: 'center' } }}
          >
            {item.value}
          </Typography>
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

FixedUrlViewDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  item: PropTypes.object,
};
