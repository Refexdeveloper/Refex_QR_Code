import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { isAdmin } from 'src/utils/roles';

import { useAuth } from 'src/context/AuthContext';

import Iconify from 'src/components/iconify';

import WinterCampaignSpinDesk from './winter-campaign-spin-desk';
import WinterCampaignFormDesign from './winter-campaign-form-design';

// ----------------------------------------------------------------------

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatPhone(value) {
  const digits = String(value || '');
  if (digits.length > 10) return `+${digits}`;
  return digits || '—';
}

function formatInvoice(value) {
  if (value == null || value === '') return '—';
  const amount = Number(value);
  if (Number.isNaN(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function billFileName(bill) {
  const name = String(bill?.originalName || 'bill').replace(/[\\/:*?"<>|]/g, '_').trim();
  return name.slice(0, 180) || 'bill';
}

function IconAction({ title, icon, color = 'default', onClick }) {
  return (
    <Tooltip title={title}>
      <IconButton
        size="small"
        color={color}
        aria-label={title}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <Iconify icon={icon} width={18} />
      </IconButton>
    </Tooltip>
  );
}

IconAction.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

function fileKindLabel(bill) {
  return bill?.kind === 'boarding_pass' ? 'Boarding pass' : 'Invoice';
}

function formatSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return '';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function canPreview(type) {
  return String(type || '').startsWith('image/') || type === 'application/pdf';
}

function FileLine({ bill, onView, onDownload }) {
  const kind = fileKindLabel(bill);
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Chip size="small" variant="outlined" label={kind} sx={{ flexShrink: 0 }} />
      <Typography variant="body2" noWrap title={bill.originalName} sx={{ flex: 1, minWidth: 0, maxWidth: 180 }}>
        {bill.originalName}
        {formatSize(bill.sizeBytes) ? ` · ${formatSize(bill.sizeBytes)}` : ''}
      </Typography>
      <IconAction title={`View ${kind}`} icon="solar:eye-bold" onClick={() => onView(bill)} />
      <IconAction title={`Download ${kind}`} icon="eva:download-outline" onClick={() => onDownload(bill)} />
    </Stack>
  );
}

FileLine.propTypes = {
  bill: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

function DetailField({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Stack>
  );
}

DetailField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function shortPrize(label) {
  if (!label) return 'Not spun';
  if (/better luck/i.test(label)) return 'Better luck';
  if (/bumper/i.test(label)) return 'Bumper draw';
  const amount = String(label).match(/₹[\d,]+/);
  if (amount) return `Gift ${amount[0]}`;
  return label;
}

function PrizeChip({ label, isWin }) {
  const text = shortPrize(label);
  return (
    <Tooltip title={label || 'Not spun'}>
      <Chip
        size="small"
        label={text}
        color={isWin ? 'success' : 'default'}
        variant={isWin ? 'filled' : 'outlined'}
        sx={{ maxWidth: 128, '& .MuiChip-label': { px: 1 } }}
      />
    </Tooltip>
  );
}

function billsOfKind(bills, kind) {
  return (bills || []).filter((bill) =>
    kind === 'boarding_pass' ? bill.kind === 'boarding_pass' : bill.kind !== 'boarding_pass'
  );
}

PrizeChip.propTypes = {
  label: PropTypes.string,
  isWin: PropTypes.bool,
};

export default function WinterCampaignReview() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const canManage = isAdmin(user);
  const [tab, setTab] = useState('entries');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [info, setInfo] = useState({ records: [], total: 0, totalPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const load = useCallback(async () => {
    if (tab === 'prizes' || tab === 'design') {
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    const path = tab === 'winners' ? '/api/winter-campaign/winners' : '/api/winter-campaign/submissions';
    try {
      const res = await axios.get(path, { params: { page, limit: 10, search: query } });
      setInfo(res.data?.results || { records: [], total: 0, totalPage: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load records.');
      setInfo({ records: [], total: 0, totalPage: 1 });
    } finally {
      setLoading(false);
    }
  }, [tab, page, query]);

  useEffect(() => {
    load();
  }, [load]);

  const readBlobError = async (err, fallback) => {
    const data = err.response?.data;
    if (data instanceof Blob) {
      try {
        const json = JSON.parse(await data.text());
        return json.message || fallback;
      } catch (parseError) {
        return fallback;
      }
    }
    return data?.message || fallback;
  };

  const fetchBill = async (bill) => {
    const res = await axios.get(`/api/winter-campaign/bills/${bill.id}`, { responseType: 'blob' });
    const type = res.headers['content-type'] || bill.mimeType || 'application/octet-stream';
    return new Blob([res.data], { type });
  };

  const closePreview = () => {
    setPreview((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const closeDetail = () => {
    closePreview();
    setDetailRow(null);
  };

  const showPreview = async (bill) => {
    setPreviewLoading(true);
    setError('');
    try {
      const file = await fetchBill(bill);
      const url = URL.createObjectURL(file);
      setPreview((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return { url, type: file.type, name: bill.originalName, id: bill.id };
      });
    } catch (err) {
      setError(await readBlobError(err, 'Unable to open the file.'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const openDetail = (row, bill) => {
    setDetailRow(row);
    setPreview((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
    if (bill) showPreview(bill);
  };

  const downloadBill = async (bill) => {
    try {
      const file = await fetchBill(bill);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = billFileName(bill);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(await readBlobError(err, 'Unable to download the file.'));
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/winter-campaign/submissions/${editRow.id}`, editForm);
      setEditRow(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update the entry.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError('');
    const path =
      deleteTarget.kind === 'winner'
        ? `/api/winter-campaign/winners/${deleteTarget.id}`
        : `/api/winter-campaign/submissions/${deleteTarget.id}`;
    try {
      await axios.delete(path);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove the record.');
    } finally {
      setSaving(false);
    }
  };

  const records = info.records || [];

  const exportExcel = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await axios.get('/api/winter-campaign/export', {
        params: { search: query },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'winter-carnival.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to export the list.');
    } finally {
      setExporting(false);
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({ name: row.name, email: row.email, phone: row.phone });
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 }, py: { xs: 1, sm: 3 } }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Refex Winter Carnival
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a row for the full entry and files. Prize counts are on Prizes. The public wording is on Form Design.
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Tabs
            value={tab}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            onChange={(_event, value) => {
              setTab(value);
              setPage(1);
            }}
            sx={{ maxWidth: 1 }}
          >
            <Tab value="entries" label="Entries" />
            <Tab value="winners" label="Winners" />
            <Tab value="prizes" label="Prizes" />
            <Tab value="design" label="Form Design" />
          </Tabs>
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
          {tab === 'entries' || tab === 'winners' ? (
            <>
          <TextField
            size="small"
            fullWidth={isMobile}
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setPage(1);
                setQuery(search.trim());
              }
            }}
            sx={{ width: { xs: 1, sm: 220 } }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setPage(1);
              setQuery(search.trim());
            }}
            sx={{ width: { xs: 1, sm: 'auto' } }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            disabled={exporting}
            startIcon={
              exporting ? <CircularProgress size={16} /> : <Iconify icon="mdi:microsoft-excel" width={18} />
            }
            onClick={exportExcel}
            sx={{ width: { xs: 1, sm: 'auto' } }}
          >
            Export
          </Button>
            </>
          ) : null}
        </Stack>

        {error && (tab === 'entries' || tab === 'winners') ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : null}

        {tab === 'prizes' ? <WinterCampaignSpinDesk canManage={canManage} /> : null}
        {tab === 'design' ? <WinterCampaignFormDesign canManage={canManage} /> : null}

        {tab === 'entries' || tab === 'winners' ? (
        <>
        <Card>
          {isMobile ? (
            <Box>
              {loading ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <CircularProgress size={28} />
                </Box>
              ) : null}
              {!loading && records.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                  No records found.
                </Typography>
              ) : null}
              {!loading && tab === 'entries'
                ? records.map((row, index) => (
                    <Box key={row.id}>
                      {index > 0 ? <Divider /> : null}
                      <Stack spacing={1} sx={{ p: 1.5, cursor: 'pointer' }} onClick={() => openDetail(row)}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                              {row.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                              {row.email}
                            </Typography>
                            <Typography variant="body2">{formatPhone(row.phone)}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {row.outlet || '—'}
                              {` · ${formatInvoice(row.invoiceValue)}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatWhen(row.createdAt)}
                            </Typography>
                          </Box>
                          {canManage ? (
                            <Stack direction="row" spacing={0.25}>
                              <IconAction title="Edit" icon="solar:pen-bold" onClick={() => openEdit(row)} />
                              <IconAction
                                title="Remove"
                                icon="solar:trash-bin-trash-bold"
                                color="error"
                                onClick={() => setDeleteTarget({ kind: 'entry', id: row.id, name: row.name })}
                              />
                            </Stack>
                          ) : null}
                        </Stack>
                        <PrizeChip label={row.prize?.prizeLabel} isWin={row.prize?.isWin} />
                      </Stack>
                    </Box>
                  ))
                : null}
              {!loading && tab === 'winners'
                ? records.map((row, index) => (
                    <Box key={row.id}>
                      {index > 0 ? <Divider /> : null}
                      <Stack spacing={1} sx={{ p: 1.5, cursor: 'pointer' }} onClick={() => openDetail(row)}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                              {row.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                              {row.email || '—'}
                            </Typography>
                            <Typography variant="body2">{formatPhone(row.phone)}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {row.outlet || '—'}
                              {` · ${formatInvoice(row.invoiceValue)}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatWhen(row.spunAt)}
                            </Typography>
                          </Box>
                          {canManage ? (
                            <IconAction
                              title="Remove"
                              icon="solar:trash-bin-trash-bold"
                              color="error"
                              onClick={() => setDeleteTarget({ kind: 'winner', id: row.id, name: row.name })}
                            />
                          ) : null}
                        </Stack>
                        <PrizeChip label={row.prizeLabel} isWin />
                      </Stack>
                    </Box>
                  ))
                : null}
            </Box>
          ) : (
            <TableContainer>
              <Table
                size="small"
                sx={{
                  '& .MuiTableCell-root': { py: 1, px: 1.5, borderColor: 'divider' },
                  '& .MuiTableCell-head': {
                    py: 1.25,
                    color: 'text.secondary',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Outlet</TableCell>
                    <TableCell>Invoice value</TableCell>
                    <TableCell>Prize</TableCell>
                    <TableCell>{tab === 'entries' ? 'Submitted' : 'Won'}</TableCell>
                    {canManage ? <TableCell align="right">Actions</TableCell> : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!loading && records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} align="center" sx={{ py: 6 }}>
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!loading && tab === 'entries'
                    ? records.map((row) => (
                        <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(row)}>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                              {row.name}
                            </Typography>
                            <Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>
                              {row.email || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatPhone(row.phone)}</TableCell>
                          <TableCell sx={{ maxWidth: 220 }} title={row.outlet || ''}>
                            <Typography variant="body2" noWrap>
                              {row.outlet || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatInvoice(row.invoiceValue)}</TableCell>
                          <TableCell>
                            <PrizeChip label={row.prize?.prizeLabel} isWin={row.prize?.isWin} />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                            {formatWhen(row.createdAt)}
                          </TableCell>
                          {canManage ? (
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <IconAction title="Edit" icon="solar:pen-bold" onClick={() => openEdit(row)} />
                                <IconAction
                                  title="Remove"
                                  icon="solar:trash-bin-trash-bold"
                                  color="error"
                                  onClick={() => setDeleteTarget({ kind: 'entry', id: row.id, name: row.name })}
                                />
                              </Stack>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ))
                    : null}
                  {!loading && tab === 'winners'
                    ? records.map((row) => (
                        <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(row)}>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                              {row.name}
                            </Typography>
                            <Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>
                              {row.email || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatPhone(row.phone)}</TableCell>
                          <TableCell sx={{ maxWidth: 220 }} title={row.outlet || ''}>
                            <Typography variant="body2" noWrap>
                              {row.outlet || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatInvoice(row.invoiceValue)}</TableCell>
                          <TableCell>
                            <PrizeChip label={row.prizeLabel} isWin />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                            {formatWhen(row.spunAt)}
                          </TableCell>
                          {canManage ? (
                            <TableCell align="right">
                              <IconAction
                                title="Remove"
                                icon="solar:trash-bin-trash-bold"
                                color="error"
                                onClick={() => setDeleteTarget({ kind: 'winner', id: row.id, name: row.name })}
                              />
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'center' }}
        >
          <Typography variant="body2" color="text.secondary">
            {info.total || 0} {info.total === 1 ? 'record' : 'records'}
          </Typography>
          <Pagination
            page={page}
            size={isMobile ? 'small' : 'medium'}
            siblingCount={isMobile ? 0 : 1}
            count={info.totalPage || 1}
            onChange={(_event, value) => setPage(value)}
          />
        </Stack>
        </>
        ) : null}
      </Stack>

      <Dialog open={Boolean(detailRow)} onClose={closeDetail} fullScreen={isMobile} fullWidth maxWidth="md">
        <DialogTitle>{detailRow?.name || 'Entry'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <DetailField label="Email" value={detailRow?.email} />
              <DetailField label="Phone" value={formatPhone(detailRow?.phone)} />
              <DetailField label="Outlet" value={detailRow?.outlet} />
              <DetailField
                label="Invoice value"
                value={
                  detailRow?.invoiceValue != null
                    ? `₹${Number(detailRow.invoiceValue).toLocaleString('en-IN')}`
                    : ''
                }
              />
              <DetailField label="Submitted" value={formatWhen(detailRow?.createdAt)} />
              <DetailField label="Prize" value={detailRow?.prize?.prizeLabel || detailRow?.prizeLabel || 'Not spun'} />
              {detailRow?.spunAt ? <DetailField label="Won" value={formatWhen(detailRow.spunAt)} /> : null}
              {detailRow?.address ? <DetailField label="Postal address" value={detailRow.address} /> : null}
            </Box>
            <Divider />
            {['invoice', 'boarding_pass'].map((kind) => {
              const files = billsOfKind(detailRow?.bills, kind);
              const title = kind === 'boarding_pass' ? 'Boarding pass' : 'Invoice';
              return (
                <Stack key={kind} spacing={1}>
                  <Typography variant="subtitle2">{title}</Typography>
                  {files.length ? (
                    files.map((bill) => (
                      <FileLine
                        key={bill.id}
                        bill={bill}
                        onView={() => showPreview(bill)}
                        onDownload={() => downloadBill(bill)}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No {title.toLowerCase()} uploaded.
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(preview) || previewLoading} fullScreen onClose={closePreview}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
            {preview?.name || 'File'}
          </Typography>
          <IconButton aria-label="Close file" onClick={closePreview}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 72px)',
            overflow: 'hidden',
            bgcolor: 'grey.900',
            p: { xs: 1, sm: 2 },
          }}
        >
          {previewLoading ? <CircularProgress sx={{ color: 'common.white' }} /> : null}
          {preview && String(preview.type).startsWith('image/') ? (
            <Box
              component="img"
              src={preview.url}
              alt={preview.name}
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : null}
          {preview && preview.type === 'application/pdf' ? (
            <Box
              component="iframe"
              src={preview.url}
              title={preview.name}
              sx={{ width: 1, height: 1, border: 0, bgcolor: 'common.white' }}
            />
          ) : null}
          {preview && !canPreview(preview.type) ? (
            <Stack spacing={2} alignItems="center">
              <Typography sx={{ color: 'common.white' }}>
                This file cannot be previewed here. Download it to open it.
              </Typography>
              <Button variant="contained" onClick={() => downloadBill({ id: preview.id, originalName: preview.name })}>
                Download
              </Button>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editRow)} onClose={() => setEditRow(null)} fullScreen={isMobile} fullWidth maxWidth="sm">
        <DialogTitle>Edit entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} />
            <TextField label="Email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} />
            <TextField
              label="Phone"
              value={editForm.phone}
              helperText="Include the country code, for example 919876543210."
              onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRow(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullScreen={isMobile} fullWidth maxWidth="xs">
        <DialogTitle>Remove record</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {deleteTarget?.kind === 'winner'
              ? `Remove ${deleteTarget?.name} from the winners list? The form entry stays.`
              : `Remove ${deleteTarget?.name}, the uploaded bills, and the spin result for this entry?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={saving}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={saving}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
