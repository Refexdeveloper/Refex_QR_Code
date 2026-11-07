import axios from 'axios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

const EMPTY_CONFIG = {
  baseUrl: '',
  accessToken: '',
  apiKey: '',
  username: '',
  password: '',
  headersJson: '',
  cronTime: '22:00',
  cronEnabled: true,
  cronRunning: false,
  cronTimezone: 'Asia/Kolkata',
  cronScheduleLabel: '22:00 IST daily',
};

function toTimeValue(hour, minute) {
  return `${String(hour ?? 22).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}`;
}

function fromTimeValue(time) {
  const [hour, minute] = (time || '22:00').split(':');
  return {
    cronHour: parseInt(hour, 10),
    cronMinute: parseInt(minute, 10),
  };
}

function mapConfigFromApi(cfg) {
  if (!cfg) {
    return EMPTY_CONFIG;
  }

  return {
    baseUrl: cfg.baseUrl || '',
    accessToken: cfg.accessToken || '',
    apiKey: cfg.apiKey || '',
    username: cfg.username || '',
    password: cfg.password || '',
    headersJson: cfg.headersJson || '',
    cronTime: toTimeValue(cfg.cronHour, cfg.cronMinute),
    cronEnabled: Boolean(cfg.cronEnabled),
    cronRunning: Boolean(cfg.cronRunning),
    cronTimezone: cfg.cronTimezone || 'Asia/Kolkata',
    cronScheduleLabel: cfg.cronScheduleLabel || toTimeValue(cfg.cronHour, cfg.cronMinute),
  };
}

export default function HrmsConfigView() {
  const { enqueueSnackbar } = useSnackbar();
  const [apiConfig, setApiConfig] = useState(EMPTY_CONFIG);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cronSaving, setCronSaving] = useState(false);

  const applyConfigResponse = (cfg) => {
    if (cfg) {
      setApiConfig(mapConfigFromApi(cfg));
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await axios.get('/api/hrms-config');
        applyConfigResponse(res.data.results);
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
      }
    };
    loadConfig();
  }, [enqueueSnackbar]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const { cronHour, cronMinute } = fromTimeValue(apiConfig.cronTime);
      const payload = {
        baseUrl: apiConfig.baseUrl,
        accessToken: apiConfig.accessToken,
        apiKey: apiConfig.apiKey,
        username: apiConfig.username,
        headersJson: apiConfig.headersJson,
        cronEnabled: apiConfig.cronEnabled,
        cronHour,
        cronMinute,
      };
      if (apiConfig.password && apiConfig.password !== '••••••') {
        payload.password = apiConfig.password;
      }
      const res = await axios.put('/api/hrms-config', payload);
      applyConfigResponse(res.data.results);
      enqueueSnackbar(res.data.message || 'API configuration saved', {
        variant: res.data.status ? 'success' : 'error',
      });
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCronAction = async (enabled) => {
    try {
      setCronSaving(true);
      const { cronHour, cronMinute } = fromTimeValue(apiConfig.cronTime);
      const res = await axios.patch('/api/hrms-config/cron', {
        enabled,
        cronHour,
        cronMinute,
      });
      applyConfigResponse(res.data.results);
      enqueueSnackbar(res.data.message || 'Scheduler updated', {
        variant: res.data.status ? 'success' : 'error',
      });
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setCronSaving(false);
    }
  };

  const handleApplySchedule = async () => {
    try {
      setCronSaving(true);
      const { cronHour, cronMinute } = fromTimeValue(apiConfig.cronTime);
      const res = await axios.patch('/api/hrms-config/cron', {
        enabled: apiConfig.cronRunning,
        cronHour,
        cronMinute,
      });
      applyConfigResponse(res.data.results);
      enqueueSnackbar(res.data.message || 'Sync schedule updated', {
        variant: res.data.status ? 'success' : 'error',
      });
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setCronSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await axios.post('/api/hrms-sync');
      const result = res.data.results || {};
      enqueueSnackbar(
        res.data.message ||
          `Sync done. Created: ${result.created || 0}, Updated: ${result.updated || 0}, Skipped: ${result.skipped || 0}`,
        { variant: res.data.status ? 'success' : 'error' }
      );
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4">HRMS API Configuration</Typography>
        <Button variant="contained" onClick={handleSync} disabled={syncing}>
          Sync Users from HRMS
        </Button>
      </Stack>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Configure the HRMS API used to sync employees into User Management. Synced users are
          created as inactive until an admin activates them.
        </Typography>

        <Stack component="form" spacing={2.5} onSubmit={handleSave}>
          <TextField
            required
            fullWidth
            type="url"
            label="Base URL"
            value={apiConfig.baseUrl}
            onChange={(e) => setApiConfig((p) => ({ ...p, baseUrl: e.target.value }))}
            placeholder="https://hrms.example.com"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Access Token"
              value={apiConfig.accessToken}
              onChange={(e) => setApiConfig((p) => ({ ...p, accessToken: e.target.value }))}
            />
            <TextField
              fullWidth
              label="API Key"
              value={apiConfig.apiKey}
              onChange={(e) => setApiConfig((p) => ({ ...p, apiKey: e.target.value }))}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Username"
              value={apiConfig.username}
              onChange={(e) => setApiConfig((p) => ({ ...p, username: e.target.value }))}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={apiConfig.password}
              onChange={(e) => setApiConfig((p) => ({ ...p, password: e.target.value }))}
              placeholder="Leave blank to keep existing"
            />
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Custom Headers (JSON)"
            value={apiConfig.headersJson}
            onChange={(e) => setApiConfig((p) => ({ ...p, headersJson: e.target.value }))}
            placeholder='{"Authorization":"Bearer ..."}'
          />

          <Stack direction="row" justifyContent="flex-end">
            <LoadingButton type="submit" variant="contained" loading={saving}>
              Save Configuration
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <BoxSectionTitle
            title="Daily HRMS Sync Scheduler"
            subtitle="Automatically sync users from HRMS once per day at the configured time (IST)."
          />
          <Chip
            label={apiConfig.cronRunning ? 'Running' : 'Stopped'}
            color={apiConfig.cronRunning ? 'success' : 'default'}
            size="small"
          />
        </Stack>

        <Stack spacing={2.5}>
          <TextField
            fullWidth
            type="time"
            label="Sync Time (IST)"
            value={apiConfig.cronTime}
            onChange={(e) => setApiConfig((p) => ({ ...p, cronTime: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            helperText={`Timezone: ${apiConfig.cronTimezone}. Current schedule: ${apiConfig.cronScheduleLabel}`}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
            <LoadingButton
              variant="contained"
              color="success"
              loading={cronSaving}
              disabled={apiConfig.cronRunning}
              onClick={() => handleCronAction(true)}
            >
              Start Scheduler
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              color="error"
              loading={cronSaving}
              disabled={!apiConfig.cronRunning}
              onClick={() => handleCronAction(false)}
            >
              Stop Scheduler
            </LoadingButton>
            <LoadingButton variant="outlined" loading={cronSaving} onClick={handleApplySchedule}>
              Apply Schedule
            </LoadingButton>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Start/Stop controls the daily auto-sync. Apply Schedule updates the sync time without
            changing whether the scheduler is running.
          </Typography>
        </Stack>
      </Card>

      <Backdrop open={syncing} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography variant="body2">Syncing with HRMS… Please wait</Typography>
        </Stack>
      </Backdrop>
    </Container>
  );
}

function BoxSectionTitle({ title, subtitle }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  );
}

BoxSectionTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};
