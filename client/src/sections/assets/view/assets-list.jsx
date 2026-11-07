import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Backdrop from '@mui/material/Backdrop';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { RouterLink } from 'src/routes/components';

import Iconify from 'src/components/iconify';
import ListPageHeader from 'src/components/list-page-header';

const TABLE_COLUMNS = [
  { id: 'qr', label: 'QR' },
  { id: 'asset_id', label: 'Asset ID' },
  { id: 'asset_name', label: 'Asset Name' },
  { id: 'category', label: 'Category' },
  { id: 'asset_subcategory', label: 'Sub Category' },
  { id: 'entity', label: 'Entity' },
  { id: 'brand', label: 'Brand' },
  { id: 'model', label: 'Model' },
  { id: 'asset_status', label: 'Asset Status' },
  { id: 'assigned_employee_name', label: 'Assigned Employee' },
  { id: 'assigned_employee_email', label: 'Assigned Email' },
  { id: 'location', label: 'Location' },
  { id: 'actions', label: '' },
];

export default function AssetsList() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);

  const [assets, setAssets] = useState([]);
  const [info, setInfo] = useState({ page: 1, limit: 10, total: 0, totalPage: 1 });
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [openImportReport, setOpenImportReport] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        const res = await axios.get(`/api/assets?${params.toString()}`);
        if (res.data.status) {
          setAssets(res.data.results || []);
          setInfo(res.data.info || { page: 1, limit: 10, total: 0, totalPage: 1 });
        } else {
          setAssets([]);
          setInfo({ page: 1, limit: 10, total: 0, totalPage: 1 });
        }
      } catch (error) {
        setAssets([]);
        setInfo({ page: 1, limit: 10, total: 0, totalPage: 1 });
        enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
      }
    };

    fetchAssets();
  }, [search, refresh, page, limit, enqueueSnackbar, action]);

  const filtered = useMemo(() => assets, [assets]);

  const downloadQr = async (assetId) => {
    try {
      const qrUrl = `/uploads/assets/laptops/${encodeURIComponent(assetId)}.png`;
      const res = await axios.get(qrUrl, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assetId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    }
  };

  const handleDelete = async (assetId) => {
    try {
      const res = await axios.delete(`/api/assets/${encodeURIComponent(assetId)}`);
      enqueueSnackbar(res.data.message || 'Deleted', { variant: res.data.status ? 'success' : 'error', action });
      setDeleteId(null);
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/assets/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'assets_export.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImporting(true);
      setImportReport(null);
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('/api/assets/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const counts = res.data?.results || {};
      const created = counts.created ?? 0;
      const updated = counts.updated ?? 0;
      const failed = counts.failed ?? 0;
      const total = counts.total ?? created + updated + failed;
      const failures = counts.failures ?? [];

      setImportReport({ total, created, updated, failed, failures });
      if (failed > 0) setOpenImportReport(true);
      enqueueSnackbar(
        `Import completed. Total: ${total}, Created: ${created}, Updated: ${updated}, Failed: ${failed}`,
        {
        variant: res.data.status ? 'success' : 'error',
        action,
        }
      );
      setRefresh((p) => p + 1);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error', action });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <Container maxWidth="xl">
      <ListPageHeader
        title="Assets List"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search assets…"
              sx={{
                width: { xs: '100%', sm: 220 },
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />

            <Button
              variant="outlined"
              onClick={handleImportClick}
              startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              onClick={handleExport}
              startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              Export
            </Button>

            <Button
              href="/assets/create"
              variant="contained"
              component={RouterLink}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              New Asset
            </Button>
          </>
        }
      />

      <Card>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  {TABLE_COLUMNS.map((c) => (
                    <TableCell key={c.id}>{c.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.asset_id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          component="img"
                          src={`/uploads/assets/laptops/${encodeURIComponent(row.asset_id)}.png`}
                          alt="QR"
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.08)',
                            bgcolor: '#fff',
                          }}
                        />
                        <Stack direction="column" spacing={0.5}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => downloadQr(row.asset_id)}
                            title="Download QR"
                          >
                            <Iconify icon="solar:download-minimalistic-bold" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.asset_id}</TableCell>
                    <TableCell>{row.asset_name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.asset_subcategory}</TableCell>
                    <TableCell>{row.entity}</TableCell>
                    <TableCell>{row.brand}</TableCell>
                    <TableCell>{row.model}</TableCell>
                    <TableCell>{row.asset_status}</TableCell>
                    <TableCell>{row.assigned_employee_name}</TableCell>
                    <TableCell>{row.assigned_employee_email}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          color="info"
                          component="a"
                          href={`/asset/${encodeURIComponent(row.asset_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View public page"
                        >
                          <Iconify icon="solar:link-bold-duotone" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          component={RouterLink}
                          href={`/assets/edit/${encodeURIComponent(row.asset_id)}`}
                        >
                          <Iconify icon="solar:pen-bold-duotone" />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteId(row.asset_id)}>
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
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
              <InputLabel id="assets-limit-label">Rows / page</InputLabel>
              <Select
                labelId="assets-limit-label"
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

      <Backdrop open={importing} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography variant="body2">Importing… Please wait</Typography>
        </Stack>
      </Backdrop>

      <Dialog open={openImportReport} onClose={() => setOpenImportReport(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import report</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Total: <b>{importReport?.total ?? 0}</b> • Created: <b>{importReport?.created ?? 0}</b> • Updated:{' '}
              <b>{importReport?.updated ?? 0}</b> • Failed: <b>{importReport?.failed ?? 0}</b>
            </Typography>

            <Divider />

            <Typography variant="subtitle2">Failed rows (showing up to 50)</Typography>
            <Box
              sx={{
                border: '1px solid rgba(145,158,171,0.24)',
                borderRadius: 1.5,
                p: 1,
                maxHeight: 360,
                overflow: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 12,
                bgcolor: 'rgba(145,158,171,0.06)',
                whiteSpace: 'pre',
              }}
            >
              {(importReport?.failures || [])
                .map((f) => `row=${f.row} asset_id=${f.asset_id ?? '-'} reason=${f.reason}`)
                .join('\n') || 'No failures'}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              const data = importReport || {};
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'assets_import_report.json';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }}
          >
            Download report
          </Button>
          <Button variant="contained" onClick={() => setOpenImportReport(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <Stack sx={{ p: 3 }} gap={2} minWidth={360}>
          <Typography variant="h6">Delete asset?</Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete Asset ID <b>{deleteId}</b>.
          </Typography>
          <Stack direction="row" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={() => handleDelete(deleteId)}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Dialog>
    </Container>
  );
}

