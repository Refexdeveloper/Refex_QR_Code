import axios from 'axios';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';
import { QRCode } from 'react-qrcode-logo';
import { useParams } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Card, Link, Stack, Button, Container, IconButton, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

export default function EmployeeView() {
  const { employeeId } = useParams();
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const qrRef = useRef(null);

  const [employee, setEmployee] = useState({
    employee_id: 0,
    employee_name: '',
    designation: '',
    mobile_number: '',
    landline: '',
    email: '',
    photo: null,
    is_active: 0,
    company: {
      company_id: '',
      company_name: '',
      company_website: '',
      company_logo: null,
    },
    branch: {
      branch_id: '',
      branch_name: '',
      branch_address: '',
      google_map_link: '',
    },
  });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/employees/${employeeId}`);
        if (response.data.status) {
          setEmployee(response.data.results[0]);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setEmployee([]);
      }
    };

    fetchData();
  }, [employeeId, refresh]);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleClickActiveChange = () => {
    try {
      axios
        .patch(`/api/employees/${employeeId}?active=${employee.is_active ? '0' : '1'}`)
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'success', action });
            // router.push('/employees/list');
            setRefresh((prev) => prev + 1);
          }
        })
        .catch((error) => {
          enqueueSnackbar(error.response.data.message, { variant: 'error', action });
        });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    html2canvas(qrRef.current, { scale: 2 })
      .then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `QRCode_${employeeId}.png`;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating QR code image:', error);
      });
  };

  const renderLogo = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        // zIndex: 9,
        // top:8,
        verticalAlign: 'middle',
      }}
    >
      <Box
        component="img"
        alt="Company Logo"
        src={employee.company.company_logo}
        sx={{
          // top: 30,
          // left: 150,
          // overflow: 'hidden',
          // position: 'absolute',
          // verticalAlign: 'bottom',
          // display: 'inline-block',
          height: '80px',
        }}
        // sx={{

        //   // width: 150,
        //   // height: 150,
        //   position: 'absolute',
        // }}
      />
    </Box>
  );

  const renderAvatar = (
    <Box
      sx={{
        zIndex: 9,
        mt: 5,
        // top: 150,
        // left: 150,
        // position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // left: (theme) => theme.spacing(3),
        // bottom: (theme) => theme.spacing(-2),
        // ...((latestPostLarge || latestPost) && {
        //   zIndex: 9,
        //   top: 24,
        //   left: 24,
        //   width: 40,
        //   height: 40,
        // }),
      }}
    >
      <Avatar
        alt={employee.employee_name}
        src={employee.photo}
        sx={{
          width: 150,
          height: 150,
        }}
      />
    </Box>
  );

  const renderName = (
    <Box>
      <Typography
        variant="h4"
        // component="div"
        sx={{
          mt: 2,
          textAlign: 'center',
          color: 'comman.black',
          // ...((latestPostLarge || latestPost) && {
          //   // opacity: 0.48,
          //   color: 'common.black',
          // }),
        }}
      >
        {employee.employee_name}
      </Typography>

      <Typography
        variant="h5"
        // component="div"
        sx={{
          textAlign: 'center',
          color: 'comman.black',
          // ...((latestPostLarge || latestPost) && {
          //   // opacity: 0.48,
          //   color: 'common.black',
          // }),
        }}
      >
        {employee.designation}
      </Typography>
      <Typography
        variant="h5"
        // component="div"
        sx={{
          textAlign: 'center',
          color: 'comman.black',
          // ...((latestPostLarge || latestPost) && {
          //   // opacity: 0.48,
          //   color: 'common.black',
          // }),
        }}
      >
        {employee.company.company_name}
      </Typography>
    </Box>
  );

  const renderCover = (
    <Box
      component="img"
      alt="vcard-preview"
      src="/assets/images/covers/Abstract-BG.jpg" // cover_2/jpg
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderLinks = (
    <Stack
      spacing={2}
      sx={{
        mt: 5,
        color: 'common.black',
      }}
    >
      <Stack direction="row">
        <Iconify width={24} icon="ri:whatsapp-fill" sx={{ mr: 1.5 }} />
        <Link
          href={`https://api.whatsapp.com/send?phone=91${employee.mobile_number}`}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank" // Open in a new tab
          rel="noopener noreferrer"
          sx={{
            // height: 44,
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            typography: 'subtitle2',
            // height: 60,
            // ...(latestPostLarge && { typography: 'h5', height: 60 }),
            // ...((latestPostLarge || latestPost) && {
            // }),
          }}
        >
          WhatsApp me
        </Link>
      </Stack>

      <Stack direction="row">
        <Iconify width={24} icon="ic:round-email" sx={{ mr: 1.5 }} />
        <Link
          href={`mailto:${employee.email}`}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank" // Open in a new tab
          rel="noopener noreferrer"
          sx={{
            // height: 44,
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            typography: 'subtitle2',
            // height: 60,
            // ...(latestPostLarge && { typography: 'h5', height: 60 }),
            // ...((latestPostLarge || latestPost) && {
            color: 'common.black',
            // }),
          }}
        >
          Email me
        </Link>
      </Stack>

      <Stack direction="row">
        <Iconify width={24} icon="fluent:globe-search-24-filled" sx={{ mr: 1.5 }} />
        <Link
          href={employee.company.company_website}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank" // Open in a new tab
          rel="noopener noreferrer"
          sx={{
            // height: 44,
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            typography: 'subtitle2',
            // height: 60,
            // ...(latestPostLarge && { typography: 'h5', height: 60 }),
            // ...((latestPostLarge || latestPost) && {
            color: 'common.black',
            // }),
          }}
        >
          {employee.company.company_website.replace(/^https?:\/\//, '')}
        </Link>
      </Stack>

      <Stack direction="row">
        <Iconify width={24} icon="mdi:location" sx={{ mr: 1.5 }} />
        <Link
          href={employee.branch.google_map_link}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank" // Open in a new tab
          rel="noopener noreferrer"
          sx={{
            // height: 44,
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            typography: 'subtitle2',
            // height: 60,
            // ...(latestPostLarge && { typography: 'h5', height: 60 }),
            // ...((latestPostLarge || latestPost) && {
            color: 'common.black',
            // }),
          }}
        >
          {employee.branch.branch_address}
        </Link>
      </Stack>
    </Stack>
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Employee Preview</Typography>

        <Stack direction="row" alignItems="center" gap={3}>
          <Button
            onClick={() => {
              router.push('/employees/list');
            }}
            // href="/employees/list"
            variant="contained"
            color="error"
            // component={RouterLink}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to list
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} columns={{ xs: 4, sm: 12, md: 12 }} width="100%">
        <Grid xs={4} sm={6} md={6} display="flex" justifyContent="center" alignItems="center">
          <Card
            sx={{
              width: 1,
              maxWidth: 450,
              height: '100%',
            }}
          >
            <Box
              sx={{
                //   position: 'relative',
                // pt: 'calc(100% * 3 / 4)',
                // ...((latestPostLarge || latestPost) && {
                pt: 'calc(100% * 4 / 3)',
                '&:after': {
                  top: 0,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.grey[300], 0.1),
                },
                // }),
                // ...(latestPostLarge && {
                //   pt: {
                //     xs: 'calc(100% * 4 / 3)',
                //     sm: 'calc(100% * 3 / 4.66)',
                //   },
                // }),
              }}
            >
              {/* {renderLogo}
              {renderAvatar} */}
              {renderCover}
            </Box>

            <Box
              sx={{
                p: (theme) => theme.spacing(4),
                // ...((latestPostLarge || latestPost) && {
                width: 1,
                bottom: 0,
                position: 'absolute',
                // }),
              }}
            >
              {renderLogo}

              {renderAvatar}

              {renderName}

              {renderLinks}
            </Box>
          </Card>
        </Grid>
        <Grid xs={4} sm={6} md={6} display="flex" justifyContent="center" alignItems="center">
          <Card
            sx={{
              p: 6,
              width: 1,
              maxWidth: 450,
              height: '100%',
            }}
          >
            <Stack justifyContent="center" alignItems="center" gap={4}>
              <Box ref={qrRef} sx={{ p: 2 }}>
                <Box sx={{ border: '3px solid black', borderRadius: 3, p: 1 }}>
                  <QRCode
                    value={`https://contacts.dev.refex.group/vcard/${employeeId}`}
                    logoImage={employee.company.company_logo}
                    logoWidth={70}
                    logoHeight={40}
                    size={200}
                    qrStyle="dots"
                    eyeRadius={10}
                    removeQrCodeBehindLogo
                    // logoPadding={1}
                  />
                </Box>
              </Box>
              <Button
                fullWidth
                onClick={downloadQRCode}
                // href="/employees/list"
                variant="contained"
                color="info"
                // component={RouterLink}
                startIcon={<Iconify icon="solar:download-minimalistic-line-duotone" />}
              >
                Download
              </Button>

              <Button
                onClick={() => {
                  router.push(`/employees/edit/${employeeId}`);
                }}
                // href="/employees/list"
                variant="contained"
                color="info"
                fullWidth
                // component={RouterLink}
                startIcon={<Iconify icon="solar:pen-bold-duotone" />}
              >
                Edit
              </Button>

              <Button
                onClick={() => {
                  router.push(`/vcard/${employeeId}`);
                }}
                disabled={!employee.is_active}
                // href="/employees/list"
                variant="contained"
                color="info"
                fullWidth
                // component={RouterLink}
                startIcon={<Iconify icon="solar:link-bold-duotone" />}
              >
                Live Link
              </Button>

              <Button
                onClick={handleClickActiveChange}
                // href="/employees/list"
                variant="contained"
                color={employee.is_active ? 'error' : 'success'}
                fullWidth
                // component={RouterLink}
                startIcon={<Iconify icon="solar:power-bold-duotone" />}
              >
                {employee.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
