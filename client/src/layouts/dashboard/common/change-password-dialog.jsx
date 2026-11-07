import axios from 'axios';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// ----------------------------------------------------------------------

const EMPTY_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ChangePasswordDialog({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError('');
  };

  const handleClose = () => {
    if (saving) return;
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post('/auth/change_password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      enqueueSnackbar(res.data.message || 'Password changed', {
        variant: res.data.status ? 'success' : 'warning',
      });

      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.results?.[0]?.msg ||
        err.message ||
        'Failed to change password';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              required
              fullWidth
              type="password"
              label="Current Password"
              value={form.currentPassword}
              onChange={handleChange('currentPassword')}
              autoComplete="current-password"
            />
            <TextField
              required
              fullWidth
              type="password"
              label="New Password"
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
              helperText="Minimum 6 characters"
            />
            <TextField
              required
              fullWidth
              type="password"
              label="Confirm New Password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
              error={Boolean(error)}
              helperText={error || ' '}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Change Password'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

ChangePasswordDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
