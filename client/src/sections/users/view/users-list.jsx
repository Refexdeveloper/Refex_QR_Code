import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Collapse from '@mui/material/Collapse';
import Backdrop from '@mui/material/Backdrop';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { pageAccessLabels } from 'src/utils/pageAccess';
import ListPageHeader from 'src/components/list-page-header';

import { EMPTY_FILTER } from '../filter-config';
import UserFormDialog from './user-form-dialog';
import UsersFilterBar from './users-filter-bar';

// ----------------------------------------------------------------------

const TABLE_COLUMNS = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'employee_id', label: 'Employee ID' },
  { id: 'role', label: 'Role' },
  { id: 'pages', label: 'Pages' },
  { id: 'designation', label: 'Designation' },
  { id: 'company_name', label: 'Company' },
  { id: 'status', label: 'Status' },
  { id: 'source', label: 'Source' },
  { id: 'actions', label: '' },
];

export default function UsersList() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [users, setUsers] = useState([]);
  const [info, setInfo] = useState({ page: 1, limit: 10, total: 0, totalPage: 1 });
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState(EMPTY_FILTER);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const hasAdvancedFilter = Boolean(appliedFilter.field && appliedFilter.value.trim());

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search.trim()) params.set('search', search.trim());
        if (appliedFilter.field && appliedFilter.value.trim()) {
          params.set('filterField', appliedFilter.field);
          params.set('filterOperator', appliedFilter.operator);
          params.set('filterValue', appliedFilter.value.trim());
        }
        const res = await axios.get(`/api/users?${params.toString()}`);
        if (res.data.status) {
          setUsers(res.data.results || []);
          setInfo(res.data.info || { page: 1, limit: 10, total: 0, totalPage: 1 });
        } else {
          setUsers([]);
          setInfo({ page: 1, limit: 10, total: 0, totalPage: 1 });
        }
      } catch (error) {
        setUsers([]);
        setInfo({ page: 1, limit: 10, total: 0, totalPage: 1 });
        enqueueSnackbar(error?.response?.data?.message || error.message, {
          variant: 'error',
          action,
        });
      }
    };

    fetchUsers();
  }, [search, refresh, page, limit, appliedFilter, enqueueSnackbar, action]);

  const filtered = useMemo(() => users, [users]);

  const handleApplyFilter = () => {
    setAppliedFilter({
      field: filterDraft.field,
      operator: filterDraft.operator,
      value: filterDraft.value.trim(),
    });
    setPage(1);
  };

  const handleClearFilter = () => {
    setFilterDraft(EMPTY_FILTER);
    setAppliedFilter(EMPTY_FILTER);
    setPage(1);
  };

  const handleHrmsSync = async () => {
    try {
      setSyncing(true);
      const res = await axios.post('/api/hrms-sync');
      const result = res.data.results || {};
      enqueueSnackbar(
        res.data.message ||
          `Sync done. Created: ${result.created || 0}, Updated: ${result.updated || 0}, Skipped: ${result.skipped || 0}`,
        { variant: res.data.status ? 'success' : 'error', action }
      );
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, {
        variant: 'error',
        action,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateOrUpdate = async (form) => {
    try {
      setSaving(true);
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        userName: form.userName,
        employeeId: form.employeeId,
        companyName: form.companyName,
        designation: form.designation,
        role: form.role,
        pageAccess: form.role === 'User' ? form.pageAccess || [] : [],
      };

      if (!editUser && form.password?.trim()) {
        payload.password = form.password.trim();
      }

      const res = editUser
        ? await axios.put(`/api/users/${editUser.id}`, payload)
        : await axios.post('/api/users', payload);

      enqueueSnackbar(res.data.message || 'Saved', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setFormOpen(false);
      setEditUser(null);
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, {
        variant: 'error',
        action,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const res = await axios.delete(`/api/users/${userId}`);
      enqueueSnackbar(res.data.message || 'Deleted', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setDeleteId(null);
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, {
        variant: 'error',
        action,
      });
    }
  };

  const handleActivate = async (userId) => {
    try {
      const res = await axios.patch(`/api/users/${userId}/activate`);
      enqueueSnackbar(res.data.message || 'User activated', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, {
        variant: 'error',
        action,
      });
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      const res = await axios.patch(`/api/users/${userId}/deactivate`);
      enqueueSnackbar(res.data.message || 'User deactivated', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, {
        variant: 'error',
        action,
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <ListPageHeader
        title="User Management"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users…"
              sx={{
                width: { xs: '100%', sm: 220 },
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
              }}
            />

            <IconButton
              title={advancedFilterOpen ? 'Hide filters' : 'Show filters'}
              color={advancedFilterOpen || hasAdvancedFilter ? 'primary' : 'default'}
              onClick={() => setAdvancedFilterOpen((open) => !open)}
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                width: 40,
                height: 40,
              }}
            >
              <Iconify icon="eva:funnel-fill" />
            </IconButton>

            <Button
              variant="outlined"
              onClick={handleHrmsSync}
              disabled={syncing}
              startIcon={<Iconify icon="eva:refresh-fill" />}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              Sync HRMS
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                setEditUser(null);
                setFormOpen(true);
              }}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              New User
            </Button>
          </>
        }
      />

      <Card>
        <Collapse in={advancedFilterOpen}>
          <UsersFilterBar
            filter={filterDraft}
            onFilterChange={setFilterDraft}
            onApply={handleApplyFilter}
            onClear={handleClearFilter}
          />
        </Collapse>
        <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  {TABLE_COLUMNS.map((c) => (
                    <TableCell key={c.id}>{c.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      {row.first_name} {row.last_name}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone || '—'}</TableCell>
                    <TableCell>{row.employee_id || '—'}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{pageAccessLabels(row)}</TableCell>
                    <TableCell>{row.designation || '—'}</TableCell>
                    <TableCell>{row.company_name || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.is_verified ? 'Active' : 'Inactive'}
                        color={row.is_verified ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={row.is_hrms_synced ? 'HRMS' : 'Manual'}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditUser(row);
                            setFormOpen(true);
                          }}
                          title="Edit"
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        {row.is_verified ? (
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleDeactivate(row.id)}
                            title="Deactivate"
                          >
                            <Iconify icon="eva:slash-outline" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleActivate(row.id)}
                            title="Activate & email password"
                          >
                            <Iconify icon="eva:checkmark-circle-2-fill" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(row.id)}
                          title="Delete"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLUMNS.length} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
      </Card>

      <Stack direction="row" alignItems="center" justifyContent="center" my={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ width: '100%' }}
        >
          <Typography variant="body2" color="text.secondary">
            Total: <b>{info.total || 0}</b>
            {info.total ? (
              <>
                {' '}
                • Showing{' '}
                <b>
                  {Math.min((page - 1) * limit + 1, info.total)}-
                  {Math.min(page * limit, info.total)}
                </b>
              </>
            ) : null}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="users-limit-label">Rows / page</InputLabel>
              <Select
                labelId="users-limit-label"
                value={limit}
                label="Rows / page"
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Pagination
              showFirstButton
              showLastButton
              count={info.totalPage || 1}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              variant="outlined"
              shape="rounded"
            />
          </Stack>
        </Stack>
      </Stack>

      <UserFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editUser}
        saving={saving}
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => handleDelete(deleteId)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop open={syncing} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography variant="body2">Syncing with HRMS… Please wait</Typography>
        </Stack>
      </Backdrop>
    </Container>
  );
}
