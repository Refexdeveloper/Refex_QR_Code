import axios from 'axios';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';
import { QRCode } from 'react-qrcode-logo';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Stack,
  Button,
  Container,
  IconButton,
  Typography,
  Divider,
  Chip,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import Logo from 'src/components/logo';

const FIELD_LABELS = [
  ['asset_id', 'Asset_ID'],
  ['asset_name', 'Asset_Name'],
  ['category', 'Category'],
  ['asset_subcategory', 'Asset_SubCategory'],
  ['entity', 'Entity'],
  ['brand', 'Brand'],
  ['model', 'Model'],
  ['configuration_details', 'Configuration_Details'],
  ['asset_status', 'Asset_Status'],
  ['purchase_date', 'Purchase_Date'],
  ['warranty_expiry_date', 'Warranty_Expiry_Date'],
  ['purchase_cost', 'Purchase_Cost'],
  ['current_value', 'Current_Value'],
  ['vendor_name', 'Vendor-Name'],
  ['invoice_date', 'Invoice_Date'],
  ['assigned_employee_name', 'Assigned_Employee-Name'],
  ['assigned_employee_email', 'Assigned_Employee-Email'],
  ['location', 'Location'],
  ['notes', 'Notes'],
  ['employee_status', 'Employee_Status'],
  ['exit_date', 'Exit_Date'],
];

function chunkIntoColumns(items, columns) {
  const out = Array.from({ length: columns }, () => []);
  items.forEach((item, idx) => {
    out[idx % columns].push(item);
  });
  return out;
}

function FieldRow({ label, value }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        py: 0.75,
        borderBottom: '1px dashed rgba(145, 158, 171, 0.24)',
      }}
    >
      <Typography
        variant="caption"
        noWrap
        sx={{
          color: 'text.secondary',
          minWidth: 120,
          maxWidth: 140,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        noWrap
        sx={{
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 180,
        }}
        title={value ?? '-'}
      >
        {value ?? '-'}
      </Typography>
    </Stack>
  );
}

FieldRow.propTypes = {
  label: (props, propName) => (typeof props[propName] !== 'string' ? new Error('label must be string') : null),
  value: () => null,
};

export default function AssetPublicView() {
  const { assetId } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const cardRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);
  const [qrImgOk, setQrImgOk] = useState(true);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const publicUrl = useMemo(() => `${window.location.origin}/asset/${encodeURIComponent(assetId)}`, [assetId]);

  const fetchAsset = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/assets_public/${encodeURIComponent(assetId)}`);
      if (res.data.status) {
        setAsset(res.data.results);
        setQrImgOk(true);
      } else {
        setAsset(null);
      }
    } catch (error) {
      setAsset(null);
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    } finally {
      setLoading(false);
    }
  }, [assetId, enqueueSnackbar, action]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `Asset_${assetId}.png`;
      link.click();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="body1">Loading asset…</Typography>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={1}>
          <Typography variant="h4">Asset not found</Typography>
          <Typography variant="body2" color="text.secondary">
            Asset ID: <b>{assetId}</b>
          </Typography>
        </Stack>
      </Container>
    );
  }

  const columns = chunkIntoColumns(FIELD_LABELS, 3);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.background.default,
        py: { xs: 1.5, sm: 2 },
      }}
    >
      <Container maxWidth="lg">
        <Card
          ref={cardRef}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2.5,
            border: '1px solid rgba(145, 158, 171, 0.24)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 1, sm: 1.5 },
              py: { xs: 1, sm: 1.25 },
              borderRadius: 2,
              bgcolor: 'rgba(145, 158, 171, 0.08)',
              border: '1px solid rgba(145, 158, 171, 0.18)',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.25}
            >
              <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <Logo sx={{ width: 110, height: 40 }} />

                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{ lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={asset.asset_name || 'Asset Details'}
                  >
                    {asset.asset_name || 'Asset Details'}
                  </Typography>

                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flexWrap: 'nowrap' }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        maxWidth: { xs: '100%', sm: 360 },
                      }}
                      title={`Asset_ID: ${asset.asset_id}`}
                    >
                      <b>Asset_ID:</b> {asset.asset_id}
                    </Typography>
                    {asset.asset_status && (
                      <Chip
                        size="small"
                        color="info"
                        label={asset.asset_status}
                        sx={{ height: 22, '& .MuiChip-label': { px: 1 }, maxWidth: 140 }}
                      />
                    )}
                    {asset.employee_status && (
                      <Chip
                        size="small"
                        color="warning"
                        label={asset.employee_status}
                        sx={{ height: 22, '& .MuiChip-label': { px: 1 }, maxWidth: 140 }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                spacing={1}
                sx={{ flexShrink: 0 }}
              >
                <Stack spacing={1} sx={{ width: 140 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={fetchAsset}
                    startIcon={<Iconify icon="solar:refresh-bold" />}
                  >
                    Refresh
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    onClick={downloadAsImage}
                    startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
                  >
                    Download
                  </Button>
                </Stack>

                <Box
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.10)',
                    bgcolor: '#fff',
                    p: 0.75,
                    width: 116,
                    height: 116,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {asset.qr_image_url && qrImgOk ? (
                    <Box
                      component="img"
                      src={asset.qr_image_url}
                      alt="Asset QR"
                      onError={() => setQrImgOk(false)}
                      sx={{ width: 98, height: 98 }}
                    />
                  ) : (
                    <QRCode value={asset.public_url || publicUrl} size={98} qrStyle="dots" eyeRadius={10} />
                  )}
                </Box>
              </Stack>
            </Stack>
          </Box>

          <Grid container spacing={1.25} sx={{ mt: 1.25 }}>
            {columns.map((col, colIdx) => (
              <Grid key={colIdx} xs={12} sm={4}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    borderColor: 'rgba(145, 158, 171, 0.24)',
                    bgcolor: '#fff',
                  }}
                >
                  {col.map(([key, label]) => (
                    <FieldRow key={key} label={label} value={asset[key]} />
                  ))}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}

