import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

import AssetsForm from './assets-form';

const emptyAsset = {
  asset_id: '',
  asset_name: '',
  category: '',
  asset_subcategory: '',
  entity: '',
  brand: '',
  model: '',
  configuration_details: '',
  asset_status: '',
  purchase_date: '',
  warranty_expiry_date: '',
  purchase_cost: '',
  current_value: '',
  vendor_name: '',
  invoice_date: '',
  assigned_employee_name: '',
  assigned_employee_email: '',
  location: '',
  notes: '',
  employee_status: '',
  exit_date: '',
};

export default function AssetsCreate() {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleSubmit = async (values) => {
    try {
      const res = await axios.post('/api/assets', values);
      enqueueSnackbar(res.data.message || 'Asset created', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      if (res.data.status) router.push('/assets/list');
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Create Asset</Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push('/assets/list')}
        >
          Back to list
        </Button>
      </Stack>

      <AssetsForm mode="create" initialValues={emptyAsset} onSubmit={handleSubmit} onCancel={() => router.push('/assets/list')} />
    </Container>
  );
}

