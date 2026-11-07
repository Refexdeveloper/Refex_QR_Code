import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

import AssetsForm from './assets-form';

export default function AssetsEdit() {
  const { assetId } = useParams();
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get(`/api/assets/${encodeURIComponent(assetId)}`);
        if (res.data.status) setAsset(res.data.results);
        else setAsset(null);
      } catch (error) {
        setAsset(null);
        enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetId, enqueueSnackbar, action]);

  const handleSubmit = async (values) => {
    try {
      const res = await axios.put(`/api/assets/${encodeURIComponent(assetId)}`, values);
      enqueueSnackbar(res.data.message || 'Asset updated', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      if (res.data.status) router.push('/assets/list');
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Typography variant="body1">Loading…</Typography>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Edit Asset</Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push('/assets/list')}
          >
            Back to list
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Asset not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Edit Asset {assetId}</Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push('/assets/list')}
        >
          Back to list
        </Button>
      </Stack>

      <AssetsForm mode="edit" initialValues={asset} onSubmit={handleSubmit} onCancel={() => router.push('/assets/list')} />
    </Container>
  );
}

