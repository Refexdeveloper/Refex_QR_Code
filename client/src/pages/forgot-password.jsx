import axios from 'axios';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

import { LoadingButton } from '@mui/lab';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Card, Link, TextField, Typography } from '@mui/material';

import { bgGradient } from 'src/theme/css';
import Footer from 'src/layouts/dashboard/footer';

import Logo from 'src/components/logo';

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 700,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

export default function ForgotPasswordPage() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email.trim()) {
      setMessage('Email is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/forgot_password', { email: email.trim() });
      if (response.data.status) {
        setStatus(true);
        setMessage(response.data.message);
      } else {
        setMessage(response.data.message || 'Unable to send reset link.');
      }
    } catch (error) {
      const validationError = error.response?.data?.results?.errors?.[0]?.msg;
      setMessage(
        validationError ||
          error.response?.data?.message ||
          'Unable to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title> Forgot Password | Refex QR Code </title>
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

        <StyledContent sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Card sx={{ p: 3, width: 1, maxWidth: 480 }}>
            <Typography variant="h3" paragraph>
              Forgot your password?
            </Typography>

            <Typography sx={{ color: 'text.secondary' }}>
              Enter your email address and we will send you a link to reset your password.
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ my: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                disabled={status}
                onChange={(e) => setEmail(e.target.value)}
              />
              {!status && (
                <LoadingButton
                  fullWidth
                  loading={loading}
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, mb: 1 }}
                >
                  Request reset link
                </LoadingButton>
              )}
              {message && (
                <Typography
                  mt={1}
                  variant="subtitle1"
                  color={status ? theme.palette.success.main : theme.palette.error.main}
                  align="center"
                >
                  {message}
                </Typography>
              )}
            </Box>
            <Typography
              variant="subtitle1"
              display="inline-block"
              color="info"
              sx={{ fontWeight: 900 }}
            >
              <Link component={RouterLink} to="/login" underline="hover">
                Go to login page
              </Link>
            </Typography>
          </Card>
        </StyledContent>
        <Footer />
      </Box>
    </>
  );
}
