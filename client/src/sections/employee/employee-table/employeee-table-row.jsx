import axios from 'axios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, ListItemText } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function EmployeeTableRow({
  employeeId,
  name,
  email,
  designation,
  photo,
  mobileNumber,
  landline,
  company,
  branch,
  status,
  selected,
  handleClick,
  setRefresh,
}) {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [open, setOpen] = useState(null);
  const [statusChange, setStatusChange] = useState({ id: null, is_active: null });

  const handleOpenMenu = (event, id, is_active) => {
    setStatusChange({ id, is_active });
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleClickView = () => {
    router.push(`/employees/view/${statusChange.id}`);
  };

  const handleClickEdit = () => {
    router.push(`/employees/edit/${statusChange.id}`);
  };

  const handleClickActiveChange = () => {
    try {
      axios
        .patch(`/api/employees/${statusChange.id}?active=${statusChange.is_active ? '0' : '1'}`)
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'success', action });
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

  const handleClickDelete = () => {
    try {
      axios
        .delete(`/api/employees/${statusChange.id}`)
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'warning', action });
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

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {employeeId}
          </Typography>
        </TableCell>

        {/* <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={photo} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell> */}
        <TableCell>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Avatar alt={name} src={photo} sx={{ mr: 2 }} />
            <ListItemText sx={{ m: 0 }} primary={name} secondary={email} />
          </Box>
        </TableCell>

        <TableCell>{mobileNumber}</TableCell>

        <TableCell>{landline}</TableCell>

        <TableCell>{designation}</TableCell>

        <TableCell>{company}</TableCell>

        <TableCell>{branch}</TableCell>

        <TableCell>
          <Label color={status ? 'success' : 'error'}>{status ? 'Active' : 'Inactive'}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton
            onClick={(event) => {
              handleOpenMenu(event, employeeId, status);
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClickView();
            handleCloseMenu();
          }}
        >
          <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 2 }} />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClickEdit();
            handleCloseMenu();
          }}
        >
          <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClickActiveChange();
            handleCloseMenu();
          }}
          sx={{ color: statusChange.is_active ? 'error.main' : 'success.main' }}
        >
          <Iconify icon="solar:power-bold-duotone" sx={{ mr: 2 }} />
          {statusChange.is_active ? 'Deactivate' : 'Activate'}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClickDelete();
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

EmployeeTableRow.propTypes = {
  employeeId: PropTypes.any,
  email: PropTypes.any,
  designation: PropTypes.any,
  branch: PropTypes.any,
  landline: PropTypes.any,
  mobileNumber: PropTypes.any,
  photo: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  name: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.any,
  setRefresh: PropTypes.any,
};
