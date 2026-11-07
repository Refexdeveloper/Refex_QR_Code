import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useRef, useState, useEffect, forwardRef } from 'react';

import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import {
  Box,
  Card,
  Stack,
  Button,
  styled,
  Tooltip,
  Container,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/context/AuthContext';

import Iconify from 'src/components/iconify';

const PhotoBox = styled(Box)(({ theme }) => ({
  width: 200,
  height: 200,
  cursor: 'pointer',
  overflow: 'hidden',
  borderRadius: '50%',
  border: '1px dashed rgba(145, 158, 171, 0.2)',
  '&:hover': {
    '.upload-placeholder': {
      opacity: 1,
      // backgroundColor:theme.palette.action.hover,
    },
  },
}));

const PhotoStack = styled(Stack)(({ theme, isError, selectedPhoto }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 9,
  borderRadius: '50%',
  position: 'absolute',
  transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  opacity: selectedPhoto ? 0 : 0.8,
  backgroundColor: isError ? theme.palette.error.light : theme.palette.action.hover,
}));

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function EmployeeCreate() {
  const { user } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [employeeData, setEmployeeData] = useState({
    employeeId: '',
    employeeName: '',
    designation: null,
    mobileNumber: null,
    landline: null,
    email: '',
    photo: null,
    companyId: '',
    branchId: '',
    createdBy: user.user_id,
  });
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [changeMade, setChangeMade] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        await axios.get('/api/companies').then((response) => {
          setCompanies(response.data.results);
        });
      } catch (error) {
        setCompanies([]);
      }
    };
    fetchCompanies();
  });

  useEffect(() => {
    setEmployeeData((prev) => {
      if (branches.length > 0) {
        return { ...prev, branchId: branches[0].branch_id };
      }
      return prev;
    });
  }, [branches]);

  const handleInputChange = (field, value) => {
    const updatedEmployeeData = { ...employeeData };
    updatedEmployeeData[field] = value;
    setEmployeeData(updatedEmployeeData);
    setValidationErrors({});
    setChangeMade(true);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedPhoto(file);
    console.log(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      handleInputChange('photo', e.target.result);
      // setEmployeeData((prev) => {
      //   return { ...prev, photo: e.target.result };
      // });
      // setPhotoB64(e.target.result);
      // console.log(e.target.result)
    };
  };

  const handleClickAlert = () => {
    setOpenAlert(!openAlert);
  };

  const validate = () => {
    const errors = {};

    if (!employeeData.companyId) errors.companyId = 'Company Name is required.';
    if (!employeeData.branchId) errors.branchId = 'Branch Name is required.';
    if (!employeeData.employeeId) errors.employeeId = 'Employeee ID is required.';
    if (!employeeData.employeeName) errors.employeeName = 'Employee Name is required.';
    if (!employeeData.designation) errors.designation = 'Designation is required';
    if (!employeeData.mobileNumber) errors.mobileNumber = 'Mobile Number is required';
    if (!employeeData.email) errors.email = 'Email is required.';
    if (!employeeData.photo) errors.photo = 'Photo is required.';

    return errors;
  };

  const action = (snackbarId) => (
    <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
      <Iconify icon="eva:close-outline" />
    </IconButton>
  );

  const handleSubmitAircraft = async (event) => {
    // console.log('It worked');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      await axios
        .post(`/api/employees`, employeeData)
        .then((response) => {
          console.log(response);
          if (response.data.status) {
            // setEmployeeData({
            //   employeeId: '',
            //   employeeName: '',
            //   designation: '',
            //   mobileNumber: '',
            //   landline: '',
            //   email: '',
            //   photo: null,
            //   companyId: '',
            //   branchId: '',
            //   createdBy: user.user_id,
            // });
            // setSelectedPhoto(null);
            // setBranches([]);
            router.push('/employees/list');
            enqueueSnackbar(response.data.message, {
              variant: response.data.status ? 'success' : 'error',
              action,
            });
          }
        })
        .catch((error) => {
          console.log(error);
          // if(error.response.data.message==="Validation Failed"){
          //   const {errors=[]} = error.response.data.results;
          //   errors.map((_er)=>{

          //   })
          // }
          enqueueSnackbar(error.response.data.message, { variant: 'error', action });
        });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Create a new Employee</Typography>

        <Stack direction="row" alignItems="center" gap={3}>
          <Button
            onClick={() => {
              if (changeMade) {
                handleClickAlert();
              } else {
                router.back();
              }
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

      <Box flexGrow={1}>
        <Card>
          <Box p={5} sx={{ flexGrow: 1 }}>
            <Grid container spacing={5} columns={{ xs: 4, sm: 12, md: 12 }}>
              <Grid xs={4} sm={6} md={6}>
                <Stack direction="row" alignItems="center" justifyContent="space-evenly">
                  <PhotoBox onClick={handleClick} role="presentation" tabIndex={0} component="div">
                    <input
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      type="file"
                      tabIndex={-1}
                      style={{ display: 'none' }}
                    />
                    <Box
                      sx={{
                        top: 10,
                        left: 10,
                        width: '90%',
                        height: '90%',
                        overflow: 'hidden',
                        borderRadius: '50%',
                        position: 'relative',
                      }}
                    >
                      {selectedPhoto && (
                        <Box
                          component="img"
                          // alt="Crew Photo"
                          src={employeeData.photo}
                          sx={{
                            overflow: 'hidden',
                            position: 'relative',
                            verticalAlign: 'bottom',
                            display: 'inline-block',
                            borderRadius: '50%',
                            height: '100%',
                            width: '100%',
                          }}
                        />
                      )}
                      <PhotoStack
                        gap={1}
                        className="upload-placeholder"
                        selectedPhoto={selectedPhoto}
                        isError={Boolean(validationErrors.photo)}
                      >
                        <Iconify icon="solar:camera-add-bold" width={42} />
                        <Typography display="block" textAlign="center" variant="caption">
                          Update photo *
                        </Typography>
                      </PhotoStack>
                    </Box>
                  </PhotoBox>
                  <Box>
                    <Stack>
                      {selectedPhoto && (
                        <Box display="flex" alignItems="center" justifyContent="space-evenly">
                          <Typography display="block" textAlign="center" variant="body1">
                            {selectedPhoto.name}
                          </Typography>
                          <Tooltip title="Remove Photo" placement="right">
                            <IconButton
                              aria-label="delete"
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedPhoto(null);
                                handleInputChange('photo', null);
                              }}
                            >
                              <Iconify icon="solar:gallery-remove-bold" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      <Typography display="block" textAlign="center" variant="caption">
                        Allowed *.jpeg, *.jpg, *.png, *.gif
                        <br />
                        max size of 3.1 MB
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Stack gap={5} width="100%">
                    <Autocomplete
                      id="companies"
                      fullWidth
                      value={
                        companies.find((_cp) => _cp.company_id === employeeData.companyId) || null
                      }
                      onChange={(event, newValue) => {
                        if (newValue) {
                          console.log(newValue.company_id);
                          handleInputChange('companyId', newValue.company_id);
                          // handleInputChange('branchId', newValue.branches[0].branch_id);
                          setBranches(newValue.branches);
                        } else {
                          setBranches([]);
                          handleInputChange('companyId', '');
                          // handleInputChange('branchId', '');
                        }
                      }}
                      options={companies}
                      getOptionLabel={(option) => option.company_name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="Company Name"
                          placeholder="Select Company....."
                          error={Boolean(validationErrors.companyId)}
                          helperText={validationErrors.companyId}
                        />
                      )}
                    />
                    <Autocomplete
                      id="company_branches"
                      fullWidth
                      value={
                        branches.find((_br) => _br.branch_id === employeeData.branchId) || null
                      }
                      onChange={(event, newValue) => {
                        if (newValue) {
                          handleInputChange('branchId', newValue.branch_id);
                        } else {
                          handleInputChange('branchId', '');
                        }
                      }}
                      options={branches}
                      getOptionLabel={(option) => option.branch_name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="Branch Name"
                          placeholder="Select Branch....."
                          error={Boolean(validationErrors.branchId)}
                          helperText={validationErrors.branchId}
                        />
                      )}
                    />
                  </Stack>
                </Box>
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <TextField
                  id="employee_id"
                  fullWidth
                  required
                  label="Employee ID"
                  value={employeeData.employeeId}
                  onChange={(event) => {
                    handleInputChange('employeeId', event.target.value);
                  }}
                  error={Boolean(validationErrors.employeeId)}
                  helperText={validationErrors.employeeId}
                />
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <TextField
                  id="employee_name"
                  fullWidth
                  required
                  label="Employee Name"
                  value={employeeData.employeeName}
                  onChange={(event) => {
                    handleInputChange('employeeName', event.target.value);
                  }}
                  error={Boolean(validationErrors.employeeName)}
                  helperText={validationErrors.employeeName}
                />
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <TextField
                  id="designation"
                  fullWidth
                  required
                  label="Designation"
                  value={employeeData.designation}
                  onChange={(event) => {
                    handleInputChange('designation', event.target.value);
                  }}
                  error={Boolean(validationErrors.designation)}
                  helperText={validationErrors.designation}
                />
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <TextField
                  id="mobile_number"
                  fullWidth
                  required
                  label="Mobile Number"
                  value={employeeData.mobileNumber}
                  onChange={(event) => {
                    handleInputChange('mobileNumber', event.target.value);
                  }}
                  error={Boolean(validationErrors.mobileNumber)}
                  helperText={validationErrors.mobileNumber}
                />
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <TextField
                  id="landline"
                  fullWidth
                  label="Landline"
                  value={employeeData.landline}
                  onChange={(event) => {
                    handleInputChange('landline', event.target.value);
                  }}
                  error={Boolean(validationErrors.landline)}
                  helperText={validationErrors.landline}
                />
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <TextField
                  id="email"
                  fullWidth
                  required
                  label="Email"
                  value={employeeData.email}
                  onChange={(event) => {
                    handleInputChange('email', event.target.value);
                  }}
                  error={Boolean(validationErrors.email)}
                  helperText={validationErrors.email}
                />
              </Grid>
              <Grid xs={4} sm={6} md={6} />
              <Grid xs={4} sm={6} md={6}>
                <Grid container spacing={5} columns={{ xs: 4, sm: 6, md: 6 }}>
                  <Grid xs={2} sm={3} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={handleSubmitAircraft}
                    >
                      Create Employee
                    </Button>
                  </Grid>
                  <Grid xs={2} sm={3} md={3}>
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        onClick={() => {
                          if (changeMade) {
                            handleClickAlert();
                          } else {
                            router.back();
                          }
                        }}
                      >
                        Close
                      </Button>
                      <Dialog
                        open={openAlert}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClickAlert}
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle>Are you sure ?</DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-slide-description">
                            Created data and Changes you where made can&apos;t be save..!
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            color="error"
                            onClick={() => {
                              router.back();
                              handleClickAlert();
                            }}
                          >
                            Yes, Close!
                          </Button>
                          <Button onClick={handleClickAlert}>Cancel</Button>
                        </DialogActions>
                      </Dialog>
                    </>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}
