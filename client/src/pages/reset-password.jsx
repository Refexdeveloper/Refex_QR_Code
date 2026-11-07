import axios from 'axios';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link as RouterLink } from 'react-router-dom';

import { LoadingButton } from '@mui/lab';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Link,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { bgGradient } from 'src/theme/css';
import Footer from 'src/layouts/dashboard/footer';

import Logo from 'src/components/logo';

import Iconify from '../components/iconify';

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 'auto',
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

function renderCheckingState() {
  return (
    <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
      <Typography variant="h5">Verifying reset link...</Typography>
    </StyledContent>
  );
}

function renderInvalidTokenState({ message }) {
  return (
    <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
      <Typography variant="h3" paragraph>
        {message || 'Invalid reset link'}
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        This password reset link is invalid or has expired. Request a new link from the login page.
      </Typography>

      <Button to="/forgot_password" size="large" variant="contained" component={RouterLink}>
        Request new link
      </Button>
    </StyledContent>
  );
}

function renderResetForm({
  theme,
  user,
  status,
  message,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  loading,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
}) {
  return (
    <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
      <Card sx={{ p: 3, width: 1, maxWidth: 480 }}>
        <Typography variant="h3" color={status ? 'success.main' : 'inherit'} paragraph>
          {status ? 'Password updated' : 'Reset your password'}
        </Typography>

        {!status ? (
          <>
            <Typography sx={{ color: 'text.secondary' }}>
              Choose a new password for{' '}
              <Typography component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {user.email}
              </Typography>
            </Typography>

            <Box component="form" noValidate onSubmit={onSubmit} sx={{ my: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onPasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={onTogglePassword} edge="end">
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirm_password"
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={onToggleConfirmPassword} edge="end">
                        <Iconify
                          icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <LoadingButton
                fullWidth
                loading={loading}
                size="large"
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 1 }}
              >
                Reset password
              </LoadingButton>

              {message && (
                <Typography
                  mt={1}
                  variant="subtitle1"
                  color={theme.palette.error.main}
                  align="center"
                >
                  {message}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>{message}</Typography>
        )}

        <Typography variant="subtitle1" display="inline-block" color="info" sx={{ fontWeight: 900 }}>
          <Link component={RouterLink} to="/login" underline="hover">
            Go to login page
          </Link>
        </Typography>
      </Card>
    </StyledContent>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const theme = useTheme();

  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [user, setUser] = useState({ email: '' });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      setCheckingToken(true);
      try {
        const response = await axios.post(`/auth/verify_token/${token}`);
        if (response.data.status) {
          setIsValidToken(true);
          setUser(response.data.results?.user || { email: '' });
        } else {
          setIsValidToken(false);
          setMessage(response.data.message || 'Invalid or expired reset link.');
        }
      } catch (error) {
        setIsValidToken(false);
        setMessage(error.response?.data?.message || 'Invalid or expired reset link.');
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (!password) {
      setMessage('Password is required.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must contain at least 6 characters.');
      setLoading(false);
      return;
    }

    if (!confirmPassword) {
      setMessage('Confirm password is required.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`/auth/reset_password/${token}`, {
        password,
        confirm_password: confirmPassword,
      });

      if (response.data.status) {
        setStatus(true);
        setMessage(response.data.message);
      } else {
        setMessage(response.data.message || 'Unable to reset password.');
      }
    } catch (error) {
      const validationError = error.response?.data?.results?.errors?.[0]?.msg;
      setMessage(
        validationError ||
          error.response?.data?.message ||
          'Unable to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  let pageContent = null;
  if (checkingToken) {
    pageContent = renderCheckingState();
  } else if (isValidToken) {
    pageContent = renderResetForm({
      theme,
      user,
      status,
      message,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loading,
      onPasswordChange: (e) => setPassword(e.target.value),
      onConfirmPasswordChange: (e) => setConfirmPassword(e.target.value),
      onTogglePassword: () => setShowPassword((prev) => !prev),
      onToggleConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
      onSubmit: handleSubmit,
    });
  } else {
    pageContent = renderInvalidTokenState({ message });
  }

  return (
    <>
      <Helmet>
        <title> Reset Password | Refex QR Code </title>
      </Helmet>

      <Box
        sx={{
          ...bgGradient({
            color: alpha(theme.palette.background.default, 0.9),
            imgUrl: '/assets/background/overlay_4.jpg',
          }),
          height: 1,
        }}
      >
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, md: 24 },
            left: { xs: 16, md: 24 },
          }}
        />

        {pageContent}
        <Footer />
      </Box>
    </>
  );
}
