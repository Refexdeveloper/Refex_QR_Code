import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

export const EMPTY_SSO_FORM = {
  provider: '',
  displayName: '',
  iconUrl: '',
  sortOrder: 0,
  isActive: true,
  clientId: '',
  clientSecret: '',
  redirectUri: '',
  frontendBaseUrl: '',
  discoveryUrl: '',
  authorizationUrl: '',
  tokenUrl: '',
  userInfoUrl: '',
  scopes: 'openid email profile',
};

export default function SsoFormDialog({ open, onClose, onSubmit, initialData, saving }) {
  const [form, setForm] = useState(EMPTY_SSO_FORM);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        provider: initialData.provider || '',
        displayName: initialData.displayName || '',
        iconUrl: initialData.iconUrl || '',
        sortOrder: initialData.sortOrder ?? 0,
        isActive: initialData.isActive !== false,
        clientId: initialData.clientId || '',
        clientSecret: '',
        redirectUri: initialData.redirectUri || '',
        frontendBaseUrl: initialData.frontendBaseUrl || '',
        discoveryUrl: initialData.discoveryUrl || '',
        authorizationUrl: initialData.authorizationUrl || '',
        tokenUrl: initialData.tokenUrl || '',
        userInfoUrl: initialData.userInfoUrl || '',
        scopes: initialData.scopes || 'openid email profile',
      });
    } else {
      setForm(EMPTY_SSO_FORM);
    }
  }, [open, initialData]);

  const handleChange = (field) => (event) => {
    const value =
      field === 'isActive' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  let submitLabel = 'Create';
  if (saving) submitLabel = 'Saving…';
  else if (initialData) submitLabel = 'Update';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit SSO Provider' : 'Add SSO Provider'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                fullWidth
                label="Provider slug"
                placeholder="refex-one"
                value={form.provider}
                onChange={handleChange('provider')}
                disabled={Boolean(initialData)}
                helperText="Lowercase slug used in callback URL"
              />
              <TextField
                fullWidth
                label="Display name"
                value={form.displayName}
                onChange={handleChange('displayName')}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Sort order"
                value={form.sortOrder}
                onChange={handleChange('sortOrder')}
              />
              <FormControlLabel
                control={
                  <Switch checked={form.isActive} onChange={handleChange('isActive')} />
                }
                label="Active"
              />
            </Stack>

            <TextField
              fullWidth
              label="Icon URL"
              value={form.iconUrl}
              onChange={handleChange('iconUrl')}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                fullWidth
                label="Client ID"
                value={form.clientId}
                onChange={handleChange('clientId')}
              />
              <TextField
                fullWidth
                type="password"
                label="Client secret"
                value={form.clientSecret}
                onChange={handleChange('clientSecret')}
                placeholder={initialData?.hasClientSecret ? 'Leave blank to keep current' : ''}
              />
            </Stack>

            <TextField
              fullWidth
              label="Redirect URI"
              value={form.redirectUri}
              onChange={handleChange('redirectUri')}
              placeholder="https://your-api.com/auth/sso/refex-one/callback"
              helperText="Leave empty to auto-generate from API host"
            />

            <TextField
              fullWidth
              label="Frontend base URL"
              value={form.frontendBaseUrl}
              onChange={handleChange('frontendBaseUrl')}
              placeholder="https://your-app.com"
            />

            <TextField
              fullWidth
              label="Discovery URL"
              value={form.discoveryUrl}
              onChange={handleChange('discoveryUrl')}
              placeholder="https://idp.example.com/.well-known/openid-configuration"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Authorization URL"
                value={form.authorizationUrl}
                onChange={handleChange('authorizationUrl')}
              />
              <TextField
                fullWidth
                label="Token URL"
                value={form.tokenUrl}
                onChange={handleChange('tokenUrl')}
              />
            </Stack>

            <TextField
              fullWidth
              label="UserInfo URL"
              value={form.userInfoUrl}
              onChange={handleChange('userInfoUrl')}
            />

            <TextField
              fullWidth
              label="Scopes"
              value={form.scopes}
              onChange={handleChange('scopes')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

SsoFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  saving: PropTypes.bool,
};
