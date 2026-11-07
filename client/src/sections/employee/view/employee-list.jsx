import axios from 'axios';
// import { useAuth } from 'src/context/AuthContext';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { RouterLink } from 'src/routes/components';
// import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';
import ListPageHeader from 'src/components/list-page-header';

import TableNoData from '../employee-table/table-no-data';
import EmployeeTableRow from '../employee-table/employeee-table-row';
import EmployeeTableHead from '../employee-table/employee-table-head';
import EmployeeTableToolbar from '../employee-table/employee-table-toolbar';

// ----------------------------------------------------------------------
const HEADER_LABEL = [
  { id: 'ep.employee_id', label: 'Employee ID' },
  { id: 'ep.employee_name', label: 'Name' },
  { id: 'ep.mobile_number', label: 'Mobile Number' },
  { id: 'ep.landline', label: 'Landline' },
  { id: 'ep.designation', label: 'designation' },
  { id: 'cp.company_name', label: 'Company' },
  { id: 'cpb.branch_name', label: 'Branch' },
  // { id: 'landline', label: 'Landline', align: 'center' },
  { id: 'ep.is_active', label: 'Status' },
  { id: '' },
];

export default function EmployeeList() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [employees, setEmployees] = useState([]);

  const [info, setInfo] = useState({});

  const [page, setPage] = useState(1);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [filterField, setFilterField] = useState('ep.employee_id');

  const [orderBy, setOrderBy] = useState('ep.id');

  const [filterName, setFilterName] = useState('');

  // const [rowsPerPage, setRowsPerPage] = useState(5);

  const [refresh, setRefresh] = useState(0);

  // console.log(selected);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios
          .get(
            `/api/employees?field=${filterField}&search=${filterName}&sort=${orderBy}&order=${order}&page=${page}`
          )
          .then((response) => {
            if (response.data.status) {
              setEmployees(response.data.results);
              setInfo(response.data.info);
              // console.log(response.data.results);
            }
          })
          .catch((error) => {
            setEmployees([]);
            setInfo({});
            // enqueueSnackbar(error.response.data.message, { variant: 'error', action });
          });
      } catch (error) {
        setEmployees([]);
        setInfo({});
        enqueueSnackbar(error.message, { variant: 'error', action });
      }
    };

    fetchData();
  }, [filterField, filterName, orderBy, order, page, refresh, action, enqueueSnackbar]);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = employees.map((n) => n.employee_id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setPage(0);
  //   setRowsPerPage(parseInt(event.target.value, 10));
  // };

  const handleFilterByName = (event) => {
    setFilterField('ep.employee_name');
    setPage(1);
    setFilterName(event.target.value);
  };

  const dataFiltered = employees;

  const notFound = !dataFiltered.length && !!filterName;

  // const dataFiltered = applyFilter({
  //   inputData: employees,
  //   comparator: getComparator(order, orderBy),
  //   filterName,
  // });

  // const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container maxWidth="xl">
      <ListPageHeader
        title="Employee List"
        actions={
          <>
            <Button
              href="/employees/create"
              variant="contained"
              component={RouterLink}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              New Employee
            </Button>

            <Button
              href="/employees/inactive"
              variant="contained"
              component={RouterLink}
              sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
            >
              View Inactive Employees
            </Button>
          </>
        }
      />

      <Card>
        <EmployeeTableToolbar
          selectedEmployees={selected}
          setSelectedEmployees={setSelected}
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
              <EmployeeTableHead
                order={order}
                orderBy={orderBy}
                rowCount={employees.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={HEADER_LABEL}
              />
              <TableBody>
                {dataFiltered
                  // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <EmployeeTableRow
                      key={row.id}
                      setRefresh={setRefresh}
                      employeeId={row.employee_id}
                      name={row.employee_name}
                      email={row.email}
                      photo={row.photo}
                      designation={row.designation}
                      mobileNumber={row.mobile_number}
                      landline={row.landline}
                      company={row.company.company_name}
                      branch={row.branch.branch_name}
                      status={row.is_active}
                      selected={selected.indexOf(row.employee_id) !== -1}
                      handleClick={(event) => handleClick(event, row.employee_id)}
                    />
                  ))}

                {/* <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, employees.length)}
                /> */}

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>

        {/* <TablePagination
          page={page}
          component="div"
          count={employees.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
        <Stack direction="row" alignItems="center" justifyContent="center" my={3} spacing={2}>
          <Pagination
            showFirstButton
            showLastButton
            count={info.totalPage}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
          />
        </Stack>
      </Card>
    </Container>
  );
}
