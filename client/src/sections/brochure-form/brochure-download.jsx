import axios from 'axios';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Stack, TextField, Typography, IconButton } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';
import Footer from 'src/layouts/dashboard/footer';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function BrochureFormView() {
  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const action = (snackbarId) => (
    <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
      <Iconify icon="eva:close-outline" />
    </IconButton>
  );
  const { file } = useParams();

  const allowedFiles = [
    'All Product Brochure',
    'Anamaya Brochure',
    'Mini 90 Brochure',
    'Drive Link',
  ];

  const [BDForm, setBDForm] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    company: '',
    downloaded_file: file,
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!allowedFiles.includes(file)) {
      router.push('/404'); // Redirect to home or a valid page
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleInputChange = (field, value) => {
    setBDForm((pre) => ({ ...pre, ...{ [field]: value } }));
    setValidationErrors({});
  };

  const validateData = () => {
    const errors = {};

    if (!BDForm.name) errors.name = 'Name is required';
    if (!BDForm.designation) errors.designation = 'Designation is required';
    if (BDForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(BDForm.email))
      errors.email = 'Please enter a valid email';
    if (!BDForm.email) errors.email = 'Email is required';
    if (!BDForm.phone) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(BDForm.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    if (!BDForm.company) errors.company = 'Company is required';

    return errors;
  };

  //   const handleSubmit = async (event) => {
  //     setLoading(true);
  //     const errors = validateData();
  //     if (Object.keys(errors).length > 0) {
  //       setValidationErrors(errors);
  //       setLoading(false);
  //       return;
  //     }
  //     try {
  //       console.log(BDForm);
  //       await axios
  //         .post('/api/brochure_download', BDForm)
  //         .then((response) => {
  //           console.log(response);
  //           setLoading(false);
  //         })
  //         .catch((error) => {
  //           console.log(error);
  //           setTimeout(() => {
  //             setLoading(false);
  //             enqueueSnackbar(error.response.data.message, { variant: 'error', action });
  //           }, 3000);
  //         });
  //     } catch (error) {
  //       setTimeout(() => {
  //         setLoading(false);
  //         enqueueSnackbar(error.message, { variant: 'error', action });
  //       }, 3000);
  //     }
  //   };

  const handleSubmit = async (event) => {
    setLoading(true);
    const errors = validateData();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }
    try {
      if (BDForm.downloaded_file === 'Drive Link') {
        await axios
          .post('/api/brochure_download', BDForm)
          .then((response) => {
            console.log(response);
            if (response.data.status) {
              setTimeout(() => {
                setLoading(false);
                enqueueSnackbar(response.data.message, { variant: 'success', action });
              }, 3000);
            }
          })
          .catch((error) => {
            console.log(error);
            setTimeout(() => {
              setLoading(false);
              enqueueSnackbar(error.response.data.message, { variant: 'error', action });
            }, 3000);
          });
      } else {
        await axios
          .post('/api/brochure_download', BDForm, { responseType: 'blob' }) // Make sure to set responseType for Blob
          .then((response) => {
            if (response.data) {
              setTimeout(() => {
                setLoading(false);
                enqueueSnackbar(
                  'Thank you for your submission! The brochure PDF will start downloading shortly.',
                  { variant: 'success', action }
                );
              }, 2000);
              setTimeout(() => {
                saveAs(response.data, `${file}.pdf`);
              }, 5000);
            } else {
              setTimeout(() => {
                setLoading(false);
                enqueueSnackbar('Unexpected response from the server', {
                  variant: 'error',
                  action,
                });
              }, 3000);
            }
          })
          .catch((error) => {
            console.log(error);
            setTimeout(() => {
              setLoading(false);
              enqueueSnackbar(error.response.data.message, { variant: 'error', action });
            }, 3000);
          });
      }
      setBDForm({
        name: '',
        designation: '',
        email: '',
        phone: '',
        company: '',
        downloaded_file: file,
      });
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
        enqueueSnackbar(error.message, { variant: 'error', action });
      }, 3000);
    }
  };

  const renderForm = (
    <Box>
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <TextField
          required
          fullWidth
          label="Name"
          size="small"
          value={BDForm.name}
          error={Boolean(validationErrors.name)}
          helperText={validationErrors.name}
          onChange={(event, value) => handleInputChange('name', event.target.value)}
        />

        <TextField
          required
          fullWidth
          label="Designation"
          size="small"
          value={BDForm.designation}
          error={Boolean(validationErrors.designation)}
          helperText={validationErrors.designation}
          onChange={(event, value) => handleInputChange('designation', event.target.value)}
        />

        <TextField
          required
          fullWidth
          label="Phone"
          size="small"
          value={BDForm.phone}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          error={Boolean(validationErrors.phone)}
          helperText={validationErrors.phone}
          onChange={(event) => {
            const { value } = event.target;
            if (/^\d{0,10}$/.test(value)) {
              handleInputChange('phone', value);
            }
          }}
        />

        <TextField
          required
          fullWidth
          label="Email"
          size="small"
          value={BDForm.email}
          error={Boolean(validationErrors.email)}
          helperText={validationErrors.email}
          onChange={(event, value) => handleInputChange('email', event.target.value)}
        />

        <TextField
          required
          fullWidth
          label="Company"
          size="small"
          value={BDForm.company}
          error={Boolean(validationErrors.company)}
          helperText={validationErrors.company}
          onChange={(event, value) => handleInputChange('company', event.target.value)}
        />

        <LoadingButton
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          size="large"
          variant="contained"
          sx={{ mb: 1 }}
        >
          Submit
        </LoadingButton>
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.7),
          imgUrl: '/assets/images/covers/MRI.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
          display: { xs: 'none', sm: 'block' },
        }}
      />

      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={{ xs: 2, sm: 3 }}
        sx={{ height: 1 }}
      >
        <Card
          sx={{
            p: { xs: 2, sm: 3 },
            width: 1,
            maxWidth: 420,
          }}
        >
          <Stack alignItems="center" justifyContent="center" mb={1}>
            <Logo
              sx={{
                height: 100,
                width: 100,
                display: { xs: 'block', sm: 'none' },
              }}
            />

            <Typography variant="h4" component="div" mb={{ xs: 2, sm: 3 }}>
              Please fill out this form..!
            </Typography>
          </Stack>

          {renderForm}
        </Card>
        <Footer />
      </Stack>
    </Box>
  );
}
