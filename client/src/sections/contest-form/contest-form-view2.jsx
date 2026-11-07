/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import { useState } from 'react';

import Link from '@mui/material/Link';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Input,
  Stack,
  Alert,
  Button,
  Checkbox,
  Snackbar,
  Typography,
  CardContent,
  FormHelperText,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { bgBlur } from 'src/theme/css';

import Scrollbar from 'src/components/scrollbar';

export default function ContestFormView() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    email: '',
    residency: '',
    is_participate: false,
    is_acknowledge: false,
    invoice: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const logo = (
    <Box
      component="img"
      src="/assets/refex_airports_logo.png"
      sx={{ height: 70, cursor: 'pointer', mb: 2 }}
    />
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      invoice: e.target.files[0],
    }));
    if (errors.invoice) {
      setErrors((prev) => ({ ...prev, invoice: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'This is a required question';
    if (!formData.mobile_number.trim()) newErrors.mobile_number = 'This is a required question';
    else if (!/^\d{10}$/.test(formData.mobile_number))
      newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
    if (!formData.email.trim()) newErrors.email = 'This is a required question';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (!formData.residency.trim()) newErrors.residency = 'This is a required question';
    if (!formData.is_participate) newErrors.is_participate = 'This is a required question';
    if (!formData.is_acknowledge) newErrors.is_acknowledge = 'This is a required question';
    if (!formData.invoice) newErrors.invoice = 'This is a required question';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('mobile_number', formData.mobile_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('residency', formData.residency);
      formDataToSend.append('is_participate', formData.is_participate.toString());
      formDataToSend.append('is_acknowledge', formData.is_acknowledge.toString());
      formDataToSend.append('invoice', formData.invoice);

      await axios.post('/api/contest_form', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSnackbar({
        open: true,
        message: 'Your response has been recorded!',
        severity: 'success',
      });

      // Reset form after successful submission
      setFormData({
        name: '',
        mobile_number: '',
        email: '',
        residency: '',
        is_participate: false,
        is_acknowledge: false,
        invoice: null,
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit form. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      style={{
        ...bgBlur({
          imgUrl: '/assets/images/covers/cover_14.jpg',
        }),
      }}
    >
      <Scrollbar
        sx={{
          height: '100vh',
          position: 'relative',
          zIndex: 10,
          '& .simplebar-content': {
            height: 'auto',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          component="form"
          onSubmit={handleSubmit}
          gap={2}
          margin="auto"
          maxWidth="90vw"
          width="640px"
          py={4}
        >
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent>
              <Link
                component={RouterLink}
                href="https://refexairports.com/"
                sx={{ display: 'contents' }}
              >
                {logo}
              </Link>
              <Typography variant="h4" gutterBottom sx={{ fontSize: 18 }}>
                FLY BUY SUMMER - PUNE NITB
              </Typography>
              <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                * Indicates required question
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 500 }}>
                Full Name <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                disableUnderline
                sx={{
                  my: 1,
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  p: '8px',
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                  },
                  '&.Mui-focused': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    p: '7px', // Adjust padding to account for thicker border
                  },
                }}
              />
              {errors.name && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.name}
                </FormHelperText>
              )}

              <Typography sx={{ mb: 1, mt: 3, fontSize: 14, fontWeight: 500 }}>
                Mobile Number <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                fullWidth
                disableUnderline
                sx={{
                  my: 1,
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  p: '8px',
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                  },
                  '&.Mui-focused': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    p: '7px',
                  },
                }}
              />
              {errors.mobile_number && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.mobile_number}
                </FormHelperText>
              )}

              <Typography sx={{ mb: 1, mt: 3, fontSize: 14, fontWeight: 500 }}>
                Email <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                disableUnderline
                sx={{
                  my: 1,
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  p: '8px',
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                  },
                  '&.Mui-focused': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    p: '7px',
                  },
                }}
              />
              {errors.email && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.email}
                </FormHelperText>
              )}

              <Typography sx={{ mb: 1, mt: 3, fontSize: 14, fontWeight: 500 }}>
                Residency <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="residency"
                value={formData.residency}
                onChange={handleChange}
                fullWidth
                disableUnderline
                sx={{
                  my: 1,
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  p: '8px',
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                  },
                  '&.Mui-focused': {
                    border: `2px solid ${theme.palette.primary.main}`,
                    p: '7px',
                  },
                }}
              />
              {errors.residency && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.residency}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontSize: 14, fontWeight: 500 }}>
                Upload Invoice <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="invoice-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="invoice-upload">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{
                    my: 1,
                    textTransform: 'none',
                    borderColor: '#dadce0',
                    color: theme.palette.text.primary,
                    '&:hover': {
                      borderColor: theme.palette.text.primary,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Add file
                </Button>
              </label>
              {formData.invoice && (
                <Typography sx={{ ml: 1, mt: 1, fontSize: 14 }}>{formData.invoice.name}</Typography>
              )}
              {errors.invoice && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.invoice}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_participate"
                    checked={formData.is_participate}
                    onChange={handleChange}
                    color="primary"
                    sx={{
                      color: errors.is_participate ? '#d93025' : theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: errors.is_participate ? '#d93025' : theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14 }}>
                    I confirm my participation in the contest{' '}
                    <span style={{ color: '#d93025' }}>*</span>
                  </Typography>
                }
                sx={{ display: 'flex', alignItems: 'flex-start', ml: 0 }}
              />
              {errors.is_participate && (
                <FormHelperText error sx={{ ml: 0, mt: -1, mb: 1 }}>
                  {errors.is_participate}
                </FormHelperText>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    name="is_acknowledge"
                    checked={formData.is_acknowledge}
                    onChange={handleChange}
                    color="primary"
                    sx={{
                      color: errors.is_acknowledge ? '#d93025' : theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: errors.is_acknowledge ? '#d93025' : theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14 }}>
                    I acknowledge the terms and conditions{' '}
                    <span style={{ color: '#d93025' }}>*</span>
                  </Typography>
                }
                sx={{ display: 'flex', alignItems: 'flex-start', ml: 0 }}
              />
              {errors.is_acknowledge && (
                <FormHelperText error sx={{ ml: 0, mt: -1 }}>
                  {errors.is_acknowledge}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{
                textTransform: 'none',
                fontSize: 14,
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: '4px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>

            <Typography
              sx={{
                color: '#5f6368',
                fontSize: 12,
                alignSelf: 'center',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Never submit passwords through Google Forms.
            </Typography>
          </Box>
        </Stack>
      </Scrollbar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
