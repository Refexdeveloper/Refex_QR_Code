import axios from 'axios';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';
import Footer from 'src/layouts/dashboard/footer';

import Logo from 'src/components/logo';

// ----------------------------------------------------------------------

export default function BrochureFormView() {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatusMessage(null);
    setLoading(true);
    if (
      name === '' ||
      name === null ||
      email === '' ||
      email === null ||
      institutionName === '' ||
      institutionName === null
    ) {
      setTimeout(() => {
        setStatus(false);
        setStatusMessage("Name, Email and Institution/Hospital is required and can't be empty");
        setLoading(false);
      }, 1000);
    } else {
      axios
        .post(`/api/brochure_distribution_list`, {
          name,
          email,
          contact_number: contactNumber,
          institution_name: institutionName,
        })
        .then((response) => {
          // console.log(response);
          setStatus(response.data.status);
          if (response.data.status) {
            setStatusMessage(response.data.message);
            setLoading(false);
            setName('');
            setEmail('');
            setContactNumber('');
            setInstitutionName('');
            setTimeout(() => {
              setStatusMessage('');
              setStatus(false);
            }, 5000);
          }
        })
        .catch((error) => {
          console.error('Login error:', error);
          setTimeout(() => {
            if (error.response.data.status_code === 400) {
              setStatusMessage(error.response.data.results.errors[0].msg);
            } else {
              setStatusMessage(error.response.data.message);
            }
            setLoading(false);
          }, 1000);
        });
    }
  };

  const renderForm = (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <TextField
          required
          fullWidth
          autoFocus
          id="name"
          name="name"
          label="Name"
          margin="normal"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          required
          fullWidth
          id="email"
          name="email"
          label="Email"
          margin="normal"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          // required
          fullWidth
          id="contact-number"
          name="contact-number"
          label="Contact Number"
          margin="normal"
          autoComplete="phone"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />

        <TextField
          fullWidth
          multiline
          required
          rows={2}
          id="institution-name"
          name="institution-name"
          label="Institution/Hospital"
          margin="normal"
          // autoComplete="email"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
        />

        <LoadingButton
          fullWidth
          loading={loading}
          size="large"
          type="submit"
          variant="contained"
          sx={{ mb: 1 }}
        >
          Submit
        </LoadingButton>
      </Stack>

      {/* <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        <Link
          href="forgot_password"
          variant="subtitle2"
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          Forgot password?
        </Link>
      </Stack> */}

      <Typography
        variant="body2"
        sx={{ fontWeight: 600 }}
        color={status ? 'green' : 'error'}
        align="center"
        mt={1}
      >
        {statusMessage}
      </Typography>
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
