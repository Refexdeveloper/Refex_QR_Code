import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { ROLES } from 'src/utils/roles';
import { OPTIONAL_PAGES, parsePageAccess } from 'src/utils/pageAccess';

// ----------------------------------------------------------------------

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  userName: '',
  employeeId: '',
  companyName: '',
  designation: '',
  role: ROLES.User,
  password: '',
  pageAccess: [],
};

export default function UserFormDialog({ open, onClose, onSubmit, initialData, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              firstName: initialData.first_name || '',
              lastName: initialData.last_name || '',
              email: initialData.email || '',
              phone: initialData.phone || '',
              userName: initialData.user_name || '',
              employeeId: initialData.employee_id || '',
              companyName: initialData.company_name || '',
              designation: initialData.designation || '',
              role: initialData.role === ROLES.Campaign ? ROLES.User : initialData.role || ROLES.User,
              pageAccess: [
                ...new Set([
                  ...parsePageAccess(initialData.page_access),
                  ...(initialData.role === ROLES.Campaign ? ['campaign'] : []),
                ]),
              ],
            }
          : EMPTY_FORM
      );
    }
  }, [open, initialData]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  let submitLabel = 'Create';
  if (saving) submitLabel = 'Saving…';
  else if (initialData) submitLabel = 'Update';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={form.firstName}
                onChange={handleChange('firstName')}
              />
              <TextField
                required
                fullWidth
                label="Last Name"
                value={form.lastName}
                onChange={handleChange('lastName')}
              />
            </Stack>
            <TextField
              required
              fullWidth
              type="email"
              label="Email"
              value={form.email}
              onChange={handleChange('email')}
            />
            {!initialData && (
              <TextField
                fullWidth
                type="password"
                label="Password (optional)"
                helperText="Leave blank to auto-generate; the password is emailed when the user is activated"
                value={form.password}
                onChange={handleChange('password')}
                inputProps={{ minLength: 6 }}
              />
            )}
            <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} />
            <TextField
              fullWidth
              label="Username"
              value={form.userName}
              onChange={handleChange('userName')}
            />
            <TextField
              fullWidth
              label="Employee ID"
              value={form.employeeId}
              onChange={handleChange('employeeId')}
            />
            <TextField
              fullWidth
              label="Company"
              value={form.companyName}
              onChange={handleChange('companyName')}
            />
            <TextField
              fullWidth
              label="Designation"
              value={form.designation}
              onChange={handleChange('designation')}
            />
            <TextField select fullWidth label="Role" value={form.role} onChange={handleChange('role')}>
              <MenuItem value={ROLES.User}>User</MenuItem>
              <MenuItem value={ROLES.Admin}>Admin</MenuItem>
              <MenuItem value={ROLES.SuperAdmin}>SuperAdmin</MenuItem>
            </TextField>
            {form.role === ROLES.User ? (
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Page access</Typography>
                <Typography variant="caption" color="text.secondary">
                  QR Code is included for every user. Select any extra pages this user can open.
                </Typography>
                <FormGroup>
                  <FormControlLabel control={<Checkbox checked disabled />} label="QR Code" />
                  {OPTIONAL_PAGES.map((page) => (
                    <FormControlLabel
                      key={page.id}
                      label={page.label}
                      control={
                        <Checkbox
                          checked={form.pageAccess.includes(page.id)}
                          onChange={(event) => {
                            setForm((prev) => ({
                              ...prev,
                              pageAccess: event.target.checked
                                ? [...new Set([...prev.pageAccess, page.id])]
                                : prev.pageAccess.filter((id) => id !== page.id),
                            }));
                          }}
                        />
                      }
                    />
                  ))}
                </FormGroup>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Admins can open every page.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

UserFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  saving: PropTypes.bool,
};
