import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

const EMPTY_CONFIG = {
  host: '',
  port: '',
  secure: true,
  user: '',
  password: '',
  fromEmail: '',
  fromName: '',
};

export default function SmtpConfigView() {
  const { enqueueSnackbar } = useSnackbar();
  const [smtpConfig, setSmtpConfig] = useState(EMPTY_CONFIG);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await axios.get('/api/smtp-config');
        const cfg = res.data.results;
        if (cfg) {
          setSmtpConfig({
            host: cfg.host || '',
            port: cfg.port ?? '',
            secure: cfg.secure !== false,
            user: cfg.user || '',
            password: cfg.password || '',
            fromEmail: cfg.fromEmail || '',
            fromName: cfg.fromName || '',
          });
        }
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
      const payload = {
        host: smtpConfig.host.trim(),
        port: smtpConfig.port === '' ? null : Number(smtpConfig.port),
        secure: smtpConfig.secure,
        user: smtpConfig.user.trim(),
        fromEmail: smtpConfig.fromEmail.trim(),
        fromName: smtpConfig.fromName.trim(),
      };
      if (smtpConfig.password && smtpConfig.password !== '••••••') {
        payload.password = smtpConfig.password;
      }
      const res = await axios.put('/api/smtp-config', payload);
      const cfg = res.data.results;
      if (cfg) {
        setSmtpConfig({
          host: cfg.host || '',
          port: cfg.port ?? '',
          secure: cfg.secure !== false,
          user: cfg.user || '',
          password: cfg.password || '',
          fromEmail: cfg.fromEmail || '',
          fromName: cfg.fromName || '',
        });
      }
      enqueueSnackbar(res.data.message || 'SMTP configuration saved', {
        variant: res.data.status ? 'success' : 'error',
      });
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) {
      setTestMessage({ type: 'error', text: 'Enter a test email address' });
      return;
    }
    try {
      setTestLoading(true);
      setTestMessage(null);
      const res = await axios.post('/api/smtp-config/test', { testEmail: testEmail.trim() });
      setTestMessage({
        type: 'success',
        text: res.data.message || 'Test email sent successfully. Check the inbox (and spam).',
      });
    } catch (error) {
      setTestMessage({
        type: 'error',
        text: error?.response?.data?.message || error.message || 'Failed to send test email',
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" mb={3}>
        SMTP Configuration
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Configure outgoing email for user activation and notifications. Save the configuration first,
          then use Test SMTP to verify settings.
        </Typography>

        <Stack component="form" spacing={2.5} onSubmit={handleSave}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              required
              fullWidth
              label="SMTP Host"
              value={smtpConfig.host}
              onChange={(e) => setSmtpConfig((p) => ({ ...p, host: e.target.value }))}
              placeholder="smtp.gmail.com"
            />
            <TextField
              fullWidth
              label="Port"
              type="number"
              value={smtpConfig.port}
              onChange={(e) => setSmtpConfig((p) => ({ ...p, port: e.target.value }))}
              placeholder="465"
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={smtpConfig.secure}
                onChange={(e) => setSmtpConfig((p) => ({ ...p, secure: e.target.checked }))}
              />
            }
            label="Use SSL/TLS (secure)"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              required
              fullWidth
              label="SMTP User"
              value={smtpConfig.user}
              onChange={(e) => setSmtpConfig((p) => ({ ...p, user: e.target.value }))}
            />
            <TextField
              fullWidth
              type="password"
              label="SMTP Password"
              value={smtpConfig.password}
              onChange={(e) => setSmtpConfig((p) => ({ ...p, password: e.target.value }))}
              placeholder="Leave blank to keep existing"
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="From Email"
              value={smtpConfig.fromEmail}
              onChange={(e) => setSmtpConfig((p) => ({ ...p, fromEmail: e.target.value }))}
            />
            <TextField
              fullWidth
              label="From Name"
              value={smtpConfig.fromName}
              onChange={(e) => setSmtpConfig((p) => ({ ...p, fromName: e.target.value }))}
              placeholder="Refex QR Code"
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <LoadingButton type="submit" variant="contained" loading={saving}>
              Save SMTP Configuration
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" mb={1}>
          Test SMTP
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Send a test email to verify your SMTP settings. Save the configuration above first.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            fullWidth
            type="email"
            label="Test email address"
            value={testEmail}
            onChange={(e) => {
              setTestEmail(e.target.value);
              setTestMessage(null);
            }}
            placeholder="you@example.com"
          />
          <LoadingButton
            variant="outlined"
            loading={testLoading}
            onClick={handleTest}
            sx={{ flexShrink: 0, minWidth: 140 }}
          >
            Test SMTP
          </LoadingButton>
        </Stack>

        {testMessage && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="body2"
              color={testMessage.type === 'success' ? 'success.main' : 'error.main'}
            >
              {testMessage.text}
            </Typography>
          </>
        )}
      </Card>
    </Container>
  );
}
