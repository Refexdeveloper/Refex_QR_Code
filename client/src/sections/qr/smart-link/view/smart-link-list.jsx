import axios from 'axios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { QRCode } from 'react-qrcode-logo';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { isAdmin } from 'src/utils/roles';
import { useAuth } from 'src/context/AuthContext';

import Iconify from 'src/components/iconify';
import ListPageHeader from 'src/components/list-page-header';

import { EMPTY_FILTER } from '../filter-config';
import { QrFeatureGuide, QR_GUIDES } from '../../common';
import { RESPONSIVE_DIALOG_ACTIONS_SX } from '../../common/responsive-dialog';
import { formatQrDate, downloadQrFromCanvas } from '../../fixed-url/utils';
import SmartLinkFilterBar from './smart-link-filter-bar';
import SmartLinkViewDialog from './smart-link-view-dialog';
import SmartLinkEditDialog from './smart-link-edit-dialog';
import SmartLinkCreateDialog from './smart-link-create-dialog';

// ----------------------------------------------------------------------

const USER_COLUMNS = [
  { id: 'code', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'static_url', label: 'Static URL' },
  { id: 'android_url', label: 'Android Link' },
  { id: 'ios_url', label: 'iOS / macOS Link' },
  { id: 'fallback_url', label: 'Fallback Link' },
  { id: 'created_at', label: 'Created At' },
  { id: 'actions', label: '' },
];

const ADMIN_COLUMNS = [
  { id: 'code', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'static_url', label: 'Static URL' },
  { id: 'android_url', label: 'Android Link' },
  { id: 'ios_url', label: 'iOS / macOS Link' },
  { id: 'fallback_url', label: 'Fallback Link' },
  { id: 'created_by', label: 'Created By' },
  { id: 'created_at', label: 'Created At' },
  { id: 'actions', label: '' },
];

const clampSx = {
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
};

function MobileQrCard({ row, admin, onView, onDownload, onEdit, onDelete }) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
              {row.code}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 600, wordBreak: 'break-word' }}>
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              title={row.static_url}
              sx={{ ...clampSx, mt: 0.5, WebkitLineClamp: 2 }}
            >
              {row.static_url}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
            <IconButton size="small" title="View" onClick={() => onView(row)}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
            <IconButton size="small" title="Download" onClick={() => onDownload(row)}>
              <Iconify icon="eva:download-outline" />
            </IconButton>
            <IconButton size="small" title="Edit" onClick={() => onEdit(row)}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
            <IconButton size="small" color="error" title="Delete" onClick={() => onDelete(row)}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack spacing={0.35}>
          <Typography variant="caption" color="text.secondary" title={row.android_url} sx={clampSx}>
            Android: {row.android_url}
          </Typography>
          <Typography variant="caption" color="text.secondary" title={row.ios_url} sx={clampSx}>
            iOS: {row.ios_url}
          </Typography>
          <Typography variant="caption" color="text.secondary" title={row.fallback_url} sx={clampSx}>
            Fallback: {row.fallback_url}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          useFlexGap
          sx={{ color: 'text.secondary' }}
        >
          {admin && (
            <Typography variant="caption">
              By: <strong>{row.created_by || '—'}</strong>
            </Typography>
          )}
          <Typography variant="caption">
            Created: <strong>{formatQrDate(row.created_at)}</strong>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

MobileQrCard.propTypes = {
  row: PropTypes.object,
  admin: PropTypes.bool,
  onView: PropTypes.func,
  onDownload: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default function SmartLinkList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [items, setItems] = useState([]);
  const [info, setInfo] = useState({ page: 1, limit: 10, total: 0, totalPage: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState(EMPTY_FILTER);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [downloadItem, setDownloadItem] = useState(null);

  const columns = useMemo(() => (admin ? ADMIN_COLUMNS : USER_COLUMNS), [admin]);
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
    const fetchItems = async () => {
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

        const res = await axios.get(`/api/smart-qr?${params.toString()}`);
        if (res.data.status) {
          setItems(res.data.results || []);
          setInfo(res.data.info || { page: 1, limit: 10, total: 0, totalPage: 1 });
        } else {
          setItems([]);
          setInfo({ page: 1, limit: 10, total: 0, totalPage: 1 });
        }
      } catch (error) {
        setItems([]);
        setInfo({ page: 1, limit: 10, total: 0, totalPage: 1 });
        enqueueSnackbar(error?.response?.data?.message || error.message, {
          variant: 'error',
          action,
        });
      }
    };

    fetchItems();
  }, [page, limit, refresh, search, appliedFilter, enqueueSnackbar, action]);

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

  const handleCreate = async (payload) => {
    try {
      setSaving(true);
      const res = await axios.post('/api/smart-qr', payload);
      enqueueSnackbar(res.data.message || 'QR code created', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setCreateOpen(false);
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

  const handleEdit = async (payload) => {
    if (!editItem) return;
    try {
      setSaving(true);
      const res = await axios.put(`/api/smart-qr/${editItem.id}`, payload);
      enqueueSnackbar(res.data.message || 'Updated', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setEditItem(null);
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

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await axios.delete(`/api/smart-qr/${deleteItem.id}`);
      enqueueSnackbar(res.data.message || 'Deleted', {
        variant: res.data.status ? 'success' : 'error',
        action,
      });
      setDeleteItem(null);
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, {
        variant: 'error',
        action,
      });
    }
  };

  const handleDownload = (row) => {
    setDownloadItem(row);
    setTimeout(() => {
      const ok = downloadQrFromCanvas(`smart-qr-dl-${row.id}`, row.code);
      if (!ok) {
        enqueueSnackbar('Could not download QR code', { variant: 'error', action });
      }
      setDownloadItem(null);
    }, 150);
  };

  return (
    <Container maxWidth="xl" disableGutters={false} sx={{ px: { xs: 0, sm: 0 } }}>
      <ListPageHeader
        title="Smart Link QR Codes"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, name, or links…"
              sx={{
                width: { xs: '100%', sm: 240, md: 280 },
                minWidth: { sm: 200 },
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
              }}
            />

            <IconButton
              title={advancedFilterOpen ? 'Hide filters' : 'Show filters'}
              color={advancedFilterOpen || hasAdvancedFilter ? 'primary' : 'default'}
              onClick={() => setAdvancedFilterOpen((open) => !open)}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 1,
                width: 40,
                height: 40,
              }}
            >
              <Iconify icon="eva:funnel-fill" />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setCreateOpen(true)}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              {isMobile ? 'Create' : 'Create QR Code'}
            </Button>
          </>
        }
      />

      <Card>
        <Collapse in={advancedFilterOpen}>
          <SmartLinkFilterBar
            admin={admin}
            filter={filterDraft}
            onFilterChange={setFilterDraft}
            onApply={handleApplyFilter}
            onClear={handleClearFilter}
          />
        </Collapse>

        {isMobile ? (
          <Box>
            {items.length === 0 ? (
              <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No QR codes found
                </Typography>
              </Box>
            ) : (
              items.map((row) => (
                <MobileQrCard
                  key={row.id}
                  row={row}
                  admin={admin}
                  onView={setViewItem}
                  onDownload={handleDownload}
                  onEdit={setEditItem}
                  onDelete={setDeleteItem}
                />
              ))
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: admin ? 1280 : 1160 }}>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell key={col.id}>{col.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          No QR codes found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell sx={{ maxWidth: 180 }}>
                          <Typography variant="body2" noWrap title={row.static_url}>
                            {row.static_url}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="body2" noWrap title={row.android_url}>
                            {row.android_url}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="body2" noWrap title={row.ios_url}>
                            {row.ios_url}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant="body2" noWrap title={row.fallback_url}>
                            {row.fallback_url}
                          </Typography>
                        </TableCell>
                        {admin && <TableCell>{row.created_by || '—'}</TableCell>}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatQrDate(row.created_at)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" title="View" onClick={() => setViewItem(row)}>
                              <Iconify icon="solar:eye-bold" />
                            </IconButton>
                            <IconButton size="small" title="Download" onClick={() => handleDownload(row)}>
                              <Iconify icon="eva:download-outline" />
                            </IconButton>
                            <IconButton size="small" title="Edit links" onClick={() => setEditItem(row)}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Delete"
                              onClick={() => setDeleteItem(row)}
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
        )}

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ p: { xs: 1.5, sm: 2 } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'space-between', sm: 'flex-start' }}
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              Total: {info.total || 0}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 88 }}>
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} / page
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Pagination
            count={info.totalPage || 1}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            siblingCount={isMobile ? 0 : 1}
            sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}
          />
        </Stack>
      </Card>

      <QrFeatureGuide guide={QR_GUIDES.smartLink} />

      <SmartLinkCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        saving={saving}
      />

      <SmartLinkViewDialog open={Boolean(viewItem)} onClose={() => setViewItem(null)} item={viewItem} />

      <SmartLinkEditDialog
        open={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        onSubmit={handleEdit}
        item={editItem}
        saving={saving}
      />

      <Dialog
        open={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        fullScreen={fullScreenDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { m: { xs: 0, sm: 2 } },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>Delete QR Code</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Delete <strong>{deleteItem?.code}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={RESPONSIVE_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setDeleteItem(null)} fullWidth={fullScreenDialog}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            fullWidth={fullScreenDialog}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {downloadItem && (
        <Box sx={{ position: 'fixed', left: -9999, top: -9999, opacity: 0, pointerEvents: 'none' }}>
          <QRCode
            id={`smart-qr-dl-${downloadItem.id}`}
            value={downloadItem.static_url}
            size={512}
            quietZone={16}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </Box>
      )}
    </Container>
  );
}
