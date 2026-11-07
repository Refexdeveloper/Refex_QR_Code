import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';
import { useAuth } from 'src/context/AuthContext';
import { getDefaultRoute } from 'src/utils/roles';
import Footer from 'src/layouts/dashboard/footer';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const SSO_ERROR_MESSAGES = {
  no_code: 'SSO did not return an authorization code. Try again.',
  not_configured: 'SSO is not configured. Contact admin.',
  token_failed: 'SSO sign-in failed (token). Try again.',
  profile_failed: 'Could not load your SSO profile.',
  no_email: 'Your SSO account has no email.',
  user_not_found: 'Your email is not registered or account is inactive. Contact admin.',
  login_failed: 'SSO sign-in failed. Try again.',
};

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const [loginStatusMessage, setLoginStatusMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ssoProviders, setSsoProviders] = useState([]);

  useEffect(() => {
    axios
      .get('/auth/sso-providers')
      .then((res) => setSsoProviders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSsoProviders([]));
  }, []);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err && SSO_ERROR_MESSAGES[err]) {
      setLoginStatus(false);
      setLoginStatusMessage(SSO_ERROR_MESSAGES[err]);
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          next.delete('error');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoginStatusMessage(null);
    setLoading(true);
    if (email === '' || email === null || password === '' || password === null) {
      setTimeout(() => {
        setLoginStatusMessage('Email and Password is required.');
        setLoading(false);
      }, 1000);
    } else {
      axios
        .post(`/auth/login`, { email, password })
        .then((response) => {
          setLoginStatus(response.data.status);
          if (response.data.status) {
            login(response.data.token, response.data.user_data);
            setLoginStatusMessage(response.data.message);
            setLoading(false);
            router.push(getDefaultRoute(response.data.user_data));
          }
        })
        .catch((error) => {
          console.error('Login error:', error);
          setTimeout(() => {
            if (error.response?.data?.status_code === 400) {
              setLoginStatusMessage(error.response.data.results.errors[0].msg);
            } else {
              setLoginStatusMessage(error.response?.data?.message);
            }
            setLoading(false);
          }, 1000);
        });
    }
  };

  const renderForm = (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={{ xs: 2, sm: 2.5 }}>
        <TextField
          required
          fullWidth
          autoFocus
          id="email"
          name="email"
          label="Email address"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          id="password"
          required
          fullWidth
          name="password"
          label="Password"
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: { xs: 2, sm: 3 } }}>
        <Link
          component={RouterLink}
          to="/forgot_password"
          variant="subtitle2"
          underline="hover"
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        loading={loading}
        size="large"
        type="submit"
        variant="contained"
        sx={{ mb: 1, py: { xs: 1.25, sm: 1.5 } }}
      >
        Log in
      </LoadingButton>

      {ssoProviders.length > 0 && (
        <>
          <Divider sx={{ my: { xs: 1.5, sm: 2 } }}>
            <Typography variant="body2" color="text.secondary">
              Or sign in with
            </Typography>
          </Divider>
          <Stack spacing={1.5}>
            {ssoProviders.map((provider) => {
              const iconUrl = provider.iconUrl?.trim() || '';
              return (
                <Button
                  key={provider.provider}
                  fullWidth
                  variant="outlined"
                  size="large"
                  aria-label={provider.displayName?.trim() || provider.provider}
                  href={`/auth/sso/${encodeURIComponent(provider.provider)}?state=${encodeURIComponent(window.location.origin)}`}
                  sx={{
                    justifyContent: 'center',
                    py: 1.25,
                    minHeight: { xs: 48, sm: 52 },
                  }}
                >
                  {iconUrl ? (
                    <Box
                      component="img"
                      src={iconUrl}
                      alt={provider.displayName?.trim() || provider.provider}
                      sx={{ width: { xs: 100, sm: 120 }, height: 24, objectFit: 'contain' }}
                    />
                  ) : (
                    <Iconify icon="eva:shield-outline" width={24} />
                  )}
                </Button>
              );
            })}
          </Stack>
        </>
      )}

      {loginStatusMessage ? (
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, mt: 2 }}
          color={loginStatus ? 'text.success' : 'error'}
          align="center"
        >
          {loginStatusMessage}
        </Typography>
      ) : null}
    </Box>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.7),
          imgUrl: '/assets/images/covers/cover_2.jpg',
        }),
        minHeight: { xs: '100dvh', sm: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, sm: 3 },
        py: { xs: 2.5, sm: 4 },
      }}
    >
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        spacing={{ xs: 2, sm: 3 }}
        sx={{ width: 1, maxWidth: 440, mx: 'auto' }}
      >
        <Card
          sx={{
            p: { xs: 2.5, sm: 4, md: 5 },
            width: 1,
          }}
        >
          <Stack alignItems="center" spacing={1.25} sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <Logo
              disabledLink
              sx={{
                height: { xs: 40, sm: 48 },
                width: 'auto',
                maxWidth: { xs: 180, sm: 220 },
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="h4"
              component="div"
              textAlign="center"
              sx={{
                whiteSpace: 'nowrap',
                fontSize: { xs: '1.05rem', sm: '1.25rem', md: '1.5rem' },
                lineHeight: 1.3,
              }}
            >
              Log in to Refex QR Code
            </Typography>
          </Stack>

          {renderForm}
        </Card>
        <Footer />
      </Stack>
    </Box>
  );
}
