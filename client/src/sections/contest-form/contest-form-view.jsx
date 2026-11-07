/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import { useState } from 'react';
import { useSnackbar } from 'notistack';

import Link from '@mui/material/Link';
import { LoadingButton } from '@mui/lab';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Input,
  Stack,
  Radio,
  Button,
  Typography,
  IconButton,
  RadioGroup,
  CardContent,
  CardActions,
  FormControl,
  FormHelperText,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { bgBlur } from 'src/theme/css';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

export default function ContestFormView() {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const action = (snackbarId) => (
    <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
      <Iconify icon="eva:close-outline" />
    </IconButton>
  );

  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    email: '',
    has_residential_address: '',
    is_participate: '',
    is_acknowledge: '',
    invoice: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'radio') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === 'true',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear errors when user interacts
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

    if (!formData.has_residential_address.toString())
      newErrors.has_residential_address = 'This is a required question';
    if (!formData.is_participate.toString())
      newErrors.is_participate = 'This is a required question';
    if (!formData.is_acknowledge.toString())
      newErrors.is_acknowledge = 'This is a required question';
    if (!formData.invoice) newErrors.invoice = 'This is a required question';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('mobile_number', formData.mobile_number);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('has_residential_address', formData.has_residential_address.toString());
      formDataToSend.append('is_participate', formData.is_participate.toString());
      formDataToSend.append('is_acknowledge', formData.is_acknowledge.toString());
      formDataToSend.append('invoice', formData.invoice);

      const response = await axios.post('/api/contest_form', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTimeout(() => {
        enqueueSnackbar(response.data.message || 'Form submitted successfully!', {
          variant: 'success',
          action,
        });

        // Reset form
        setFormData({
          name: '',
          mobile_number: '',
          email: '',
          has_residential_address: '',
          is_participate: '',
          is_acknowledge: '',
          invoice: null,
        });
      }, 3000);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to submit form. Please try again.', {
        variant: 'error',
        action,
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <Box style={{ ...bgBlur({ imgUrl: '/assets/images/covers/cover_26.jpg' }) }}>
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
          {/* Header Card */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent>
              <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontSize: 18 }}>
                FLY BUY SUMMER
              </Typography>
              <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                <span style={{ color: '#d93025' }}>* Indicates required question</span>
              </Typography>
            </CardContent>
          </Card>

          {/* Name Field */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Please provide your full name. <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ my: 2 }}
                placeholder="Full Name"
                fullWidth
                inputProps={{ 'aria-label': 'description' }}
              />
              {errors.name && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.name}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Mobile Number Field */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Please provide your mobile number. <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                sx={{ my: 2 }}
                placeholder="Mobile Number"
                fullWidth
                inputProps={{ 'aria-label': 'description' }}
              />
              {errors.mobile_number && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.mobile_number}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Email Field */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Please provide your email ID. <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ my: 2 }}
                placeholder="Email"
                fullWidth
                inputProps={{ 'aria-label': 'description' }}
              />
              {errors.email && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.email}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Residential Address in India */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Do you have a valid residential address in India for product delivery?{' '}
                <span style={{ color: '#d93025' }}>*</span>
              </Typography>

              <FormControl>
                <RadioGroup
                  name="has_residential_address"
                  value={formData.has_residential_address.toString()}
                  onChange={handleChange}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              {errors.has_residential_address && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.has_residential_address}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Participation Consent */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Do you consent to participate in the FLY BUY SUMMER promotion?{' '}
                <span style={{ color: '#d93025' }}>*</span>
              </Typography>

              <FormControl>
                <RadioGroup
                  name="is_participate"
                  value={formData.is_participate.toString()}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Yes, I consent to participate."
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="No, I do not consent to participate."
                  />
                </RadioGroup>
              </FormControl>
              {errors.is_participate && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.is_participate}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Terms Acknowledgement */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Do you acknowledge and accept the{' '}
                <Link
                  component={RouterLink}
                  href="/uploads/pdf/terms_and_condition.pdf"
                  target="_blank"
                  sx={{ display: 'contents' }}
                >
                  Terms & Conditions
                </Link>{' '}
                of the promotion? <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <FormControl>
                <RadioGroup
                  name="is_acknowledge"
                  value={formData.is_acknowledge.toString()}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Yes, I acknowledge and accept the Terms & Conditions."
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="No, I do not acknowledge the Terms & Conditions"
                  />
                </RadioGroup>
              </FormControl>
              {errors.is_acknowledge && (
                <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                  {errors.is_acknowledge}
                </FormHelperText>
              )}
            </CardContent>
          </Card>

          {/* Invoice Upload */}
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              boxShadow: theme.customShadows.z16,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Please upload a full and clear image of your invoice.{' '}
                <span style={{ color: '#d93025' }}>*</span>
              </Typography>
              <Typography component="span" gutterBottom sx={{ color: 'text.secondary' }}>
                Select upto one file: image. Max 20 MB per file.
                <br />
                <br />
              </Typography>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="invoice-upload"
                type="file"
                onChange={handleFileChange}
              />
              <CardActions sx={{ p: 0 }}>
                <label htmlFor="invoice-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Iconify icon="solar:upload-minimalistic-bold-duotone" />}
                  >
                    Add file
                  </Button>
                </label>
              </CardActions>
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

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <LoadingButton
              type="submit"
              loading={loading}
              variant="contained"
              disabled={loading}
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
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </LoadingButton>
          </Box>
        </Stack>
      </Scrollbar>
    </Box>
  );
}
