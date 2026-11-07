import { Helmet } from 'react-helmet-async';

import { EmployeeList } from 'src/sections/employee/view';
// --------------------------------------------------------------

export default function EmployeeListPage() {
  return (
    <>
      <Helmet>
        <title>Employees | Refex Contacts</title>
      </Helmet>
      
      <EmployeeList/>
    </>
  );
}
