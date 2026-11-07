import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import SsoFormDialog from './sso-form-dialog';

// ----------------------------------------------------------------------

export default function SsoConfigView() {
  const { enqueueSnackbar } = useSnackbar();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/sso-providers');
      setProviders(res.data.results || []);
    } catch (error) {
      setProviders([]);
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = async (form) => {
    try {
      setSaving(true);
      const payload = {
        provider: form.provider.trim(),
        displayName: form.displayName.trim() || form.provider.trim(),
        iconUrl: form.iconUrl.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        clientId: form.clientId.trim(),
        redirectUri: form.redirectUri.trim() || null,
        frontendBaseUrl: form.frontendBaseUrl.trim() || null,
        authorizationUrl: form.authorizationUrl.trim() || null,
        tokenUrl: form.tokenUrl.trim() || null,
        userInfoUrl: form.userInfoUrl.trim() || null,
        discoveryUrl: form.discoveryUrl.trim() || null,
        scopes: form.scopes.trim() || 'openid email profile',
      };
      if (form.clientSecret.trim()) {
        payload.clientSecret = form.clientSecret.trim();
      }

      const res = editingItem
        ? await axios.put(`/api/sso-providers/${editingItem.id}`, payload)
        : await axios.post('/api/sso-providers', payload);

      enqueueSnackbar(res.data.message || 'SSO provider saved', {
        variant: res.data.status ? 'success' : 'error',
      });

      if (res.data.status) {
        setFormOpen(false);
        setEditingItem(null);
        await loadProviders();
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await axios.delete(`/api/sso-providers/${deleteItem.id}`);
      enqueueSnackbar(res.data.message || 'SSO provider deleted', {
        variant: res.data.status ? 'success' : 'error',
      });
      setDeleteItem(null);
      await loadProviders();
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="lg">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4">SSO Configuration</Typography>
        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleCreate}>
          Add Provider
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure OIDC providers for the login page. Only active providers with a client ID are shown to users.
        Redirect URI example:{' '}
        <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
          https://your-api.com/auth/sso/refex-one/callback
        </Typography>
      </Typography>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Icon</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && providers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        No SSO providers configured yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((provider) => (
                    <TableRow key={provider.id} hover>
                      <TableCell>{provider.sortOrder ?? 0}</TableCell>
                      <TableCell>
                        {provider.iconUrl ? (
                          <Box
                            component="img"
                            src={provider.iconUrl}
                            alt=""
                            sx={{ width: 28, height: 28, objectFit: 'contain' }}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {provider.displayName || provider.provider}
                      </TableCell>
                      <TableCell>{provider.provider}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={provider.isActive ? 'Active' : 'Inactive'}
                          color={provider.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" title="Edit" onClick={() => handleEdit(provider)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            title="Delete"
                            onClick={() => setDeleteItem(provider)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      <SsoFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        saving={saving}
        onSubmit={handleSubmit}
      />

      <Dialog open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)}>
        <DialogTitle>Delete SSO Provider</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Delete <strong>{deleteItem?.displayName || deleteItem?.provider}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
