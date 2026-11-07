import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';

export default function AssetsApiAccess() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const baseUrl = useMemo(() => window.location.origin, []);

  const sampleCreateBody = useMemo(
    () =>
      JSON.stringify({
        Asset_ID: 'LAP-001',
        Asset_Name: 'Dell Latitude',
        Category: 'Laptop',
      }),
    []
  );

  const sampleUpdateBody = useMemo(
    () =>
      JSON.stringify({
        Asset_Status: 'Allocated',
        'Assigned_Employee-Email': 'user@company.com',
      }),
    []
  );

  const curlCreate = useMemo(
    () =>
      `curl -X POST "${baseUrl}/api/integrations/assets" \\\n  -H "Authorization: Bearer ${
        token || '<ASSETS_API_TOKEN>'
      }" \\\n  -H "Content-Type: application/json" \\\n  -d '${sampleCreateBody}'`,
    [baseUrl, token, sampleCreateBody]
  );

  const curlUpdate = useMemo(
    () =>
      `curl -X PUT "${baseUrl}/api/integrations/assets/LAP-001" \\\n  -H "Authorization: Bearer ${
        token || '<ASSETS_API_TOKEN>'
      }" \\\n  -H "Content-Type: application/json" \\\n  -d '${sampleUpdateBody}'`,
    [baseUrl, token, sampleUpdateBody]
  );

  const curlList = useMemo(
    () =>
      `curl -X GET "${baseUrl}/api/integrations/assets?page=1&limit=10&search=" \\\n  -H "Authorization: Bearer ${
        token || '<ASSETS_API_TOKEN>'
      }"`,
    [baseUrl, token]
  );

  const issueToken = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/integrations/assets/token');
      if (res.data.status) {
        setToken(res.data.results.token);
        enqueueSnackbar('API token issued', { variant: 'success', action });
      } else {
        enqueueSnackbar(res.data.message || 'Failed to issue token', { variant: 'error', action });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar(`${label} copied`, { variant: 'success', action });
    } catch (error) {
      enqueueSnackbar('Copy failed', { variant: 'error', action });
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Assets API Access</Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Use this token in other systems to create/update Assets via integration APIs. Treat it like a password.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button
              variant="contained"
              onClick={issueToken}
              disabled={loading}
              startIcon={<Iconify icon="solar:key-bold-duotone" />}
            >
              Issue API Token
            </Button>
            <Button
              variant="outlined"
              onClick={() => copy(token || '', 'Token')}
              disabled={!token}
              startIcon={<Iconify icon="solar:copy-bold-duotone" />}
            >
              Copy token
            </Button>
          </Stack>

          <TextField
            label="Assets API Token (Bearer)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Click 'Issue API Token' or paste existing token"
            fullWidth
          />

          <Divider />

          <Typography variant="h6">Integration endpoints</Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <b>List (pagination)</b>: <code>{baseUrl}/api/integrations/assets?page=1&amp;limit=10&amp;search=</code>
            </Typography>
            <Typography variant="body2">
              <b>Create (or update if exists)</b>: <code>{baseUrl}/api/integrations/assets</code>
            </Typography>
            <Typography variant="body2">
              <b>Update</b>: <code>{baseUrl}/api/integrations/assets/:asset_id</code>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Auth header required: <code>Authorization: Bearer &lt;ASSETS_API_TOKEN&gt;</code>
            </Typography>
          </Stack>

          <Divider />

          <Typography variant="h6">curl examples</Typography>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">List (pagination)</Typography>
              <Button size="small" variant="outlined" onClick={() => copy(curlList, 'List curl')}>
                Copy
              </Button>
            </Stack>
            <TextField value={curlList} fullWidth multiline minRows={3} />
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Create / Upsert</Typography>
              <Button size="small" variant="outlined" onClick={() => copy(curlCreate, 'Create curl')}>
                Copy
              </Button>
            </Stack>
            <TextField value={curlCreate} fullWidth multiline minRows={4} />
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Update</Typography>
              <Button size="small" variant="outlined" onClick={() => copy(curlUpdate, 'Update curl')}>
                Copy
              </Button>
            </Stack>
            <TextField value={curlUpdate} fullWidth multiline minRows={4} />
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
}

