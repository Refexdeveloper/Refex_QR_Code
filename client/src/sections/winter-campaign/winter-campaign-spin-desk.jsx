import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function shiftIso(iso, days) {
  const [year, month, day] = String(iso || '').split('-').map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export default function WinterCampaignSpinDesk({ canManage }) {
  const [desk, setDesk] = useState(null);
  const [week, setWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estSpinsPerDay, setEstSpinsPerDay] = useState('50');
  const [defaultCaps, setDefaultCaps] = useState({});
  const [weekCaps, setWeekCaps] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const applyDesk = (data) => {
    setDesk(data);
    setWeek(data.weekKey || '');
    setStartDate(data.startDate || '');
    setEndDate(data.endDate || '');
    setEstSpinsPerDay(String(data.estSpinsPerDay ?? 50));
    setDefaultCaps(data.defaultCaps || {});
    const caps = {};
    (data.prizes || []).forEach((prize) => {
      if (prize.limited) caps[prize.code] = String(prize.cap ?? 0);
    });
    setWeekCaps(caps);
  };

  const load = useCallback(async (weekKey) => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await axios.get('/api/winter-campaign/spin-desk', {
        params: weekKey ? { week: weekKey } : {},
      });
      applyDesk(res.data?.results || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the prize settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const saveSettings = async () => {
    setSaving('settings');
    setError('');
    setNotice('');
    try {
      const res = await axios.put('/api/winter-campaign/spin-settings', {
        startDate,
        endDate,
        estSpinsPerDay: Number(estSpinsPerDay),
        defaultCaps: Object.fromEntries(
          Object.entries(defaultCaps).map(([code, value]) => [code, Number(value)])
        ),
        weekKey: week,
      });
      applyDesk(res.data?.results || {});
      setNotice(res.data?.message || 'Contest settings saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save the contest settings.');
    } finally {
      setSaving('');
    }
  };

  const saveWeek = async () => {
    setSaving('week');
    setError('');
    setNotice('');
    try {
      const res = await axios.put('/api/winter-campaign/spin-stock', {
        weekKey: week,
        caps: Object.fromEntries(Object.entries(weekCaps).map(([code, value]) => [code, Number(value)])),
      });
      applyDesk(res.data?.results || {});
      setNotice(res.data?.message || "This week's prize counts are saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save this week's prize counts.");
    } finally {
      setSaving('');
    }
  };

  const limited = (desk?.prizes || []).filter((prize) => prize.limited);
  const openEnded = (desk?.prizes || []).filter((prize) => !prize.limited);

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {!canManage ? (
        <Alert severity="info">Only an administrator can change these settings.</Alert>
      ) : null}

      <Card>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="overline" color="text.secondary">
                Contest
              </Typography>
              <Typography variant="h6">Period and pace</Typography>
            </Box>
            {desk ? (
              <Chip
                size="small"
                color={desk.campaignActive ? 'success' : 'default'}
                label={desk.campaignActive ? 'Open' : 'Contest over'}
              />
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Entries and spins stay open through the end date. The start date is the contest period shown on the public form. Expected spins per day spreads the weekly gifts until the week has its own pace.
          </Typography>
          {loading && !desk ? (
            <CircularProgress size={28} />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
              }}
            >
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                disabled={!canManage || Boolean(saving)}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <TextField
                label="End date"
                type="date"
                value={endDate}
                disabled={!canManage || Boolean(saving)}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => setEndDate(event.target.value)}
              />
              <TextField
                label="Expected spins per day"
                type="number"
                value={estSpinsPerDay}
                disabled={!canManage || Boolean(saving)}
                inputProps={{ min: 1, max: 500 }}
                onChange={(event) => setEstSpinsPerDay(event.target.value)}
              />
            </Box>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              New weeks
            </Typography>
            <Typography variant="h6">Default weekly gift counts</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            A new week starts with these counts. A week that already has stock keeps its own counts until you edit that week.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}
          >
            {limited.map((prize) => (
              <TextField
                key={prize.code}
                label={prize.label}
                type="number"
                value={defaultCaps[prize.code] ?? ''}
                disabled={!canManage || Boolean(saving)}
                inputProps={{ min: 0, max: 500 }}
                onChange={(event) =>
                  setDefaultCaps((prev) => ({ ...prev, [prize.code]: event.target.value }))
                }
              />
            ))}
          </Box>
          {canManage ? (
            <Box>
              <Button variant="contained" disabled={Boolean(saving) || loading} onClick={saveSettings}>
                {saving === 'settings' ? 'Saving…' : 'Save contest settings'}
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Selected week
              </Typography>
              <Typography variant="h6">{desk?.weekLabel || 'Prize counts'}</Typography>
              {desk?.isCurrentWeek ? (
                <Typography variant="caption" color="text.secondary">
                  This week
                </Typography>
              ) : null}
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton aria-label="Previous week" disabled={loading || !week} onClick={() => load(shiftIso(week, -7))}>
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>
              <Button size="small" disabled={loading || desk?.isCurrentWeek} onClick={() => load(desk?.currentWeek)}>
                This week
              </Button>
              <IconButton aria-label="Next week" disabled={loading || !week} onClick={() => load(shiftIso(week, 7))}>
                <Iconify icon="eva:arrow-ios-forward-fill" />
              </IconButton>
            </Stack>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Prize</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Given</TableCell>
                  <TableCell>Left</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {limited.map((prize) => (
                  <TableRow key={prize.code}>
                    <TableCell>{prize.label}</TableCell>
                    <TableCell sx={{ width: 140 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={weekCaps[prize.code] ?? ''}
                        disabled={!canManage || Boolean(saving)}
                        inputProps={{ min: prize.used || 0, max: 500 }}
                        onChange={(event) =>
                          setWeekCaps((prev) => ({ ...prev, [prize.code]: event.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell>{prize.used}</TableCell>
                    <TableCell>{prize.remaining}</TableCell>
                  </TableRow>
                ))}
                {openEnded.map((prize) => (
                  <TableRow key={prize.code}>
                    <TableCell>{prize.label}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        No weekly limit
                      </Typography>
                    </TableCell>
                    <TableCell>{prize.used}</TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary">
            Better Luck Next Time and the bumper lucky draw stay an even chance. Their count cannot be capped. A gift count cannot be set below the number already given this week.
          </Typography>
          {canManage ? (
            <Box>
              <Button variant="contained" disabled={Boolean(saving) || loading} onClick={saveWeek}>
                {saving === 'week' ? 'Saving…' : 'Save this week'}
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}

WinterCampaignSpinDesk.propTypes = {
  canManage: PropTypes.bool,
};
