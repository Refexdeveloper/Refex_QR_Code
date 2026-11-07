import { Helmet } from 'react-helmet-async';

import { EmployeeCreate } from 'src/sections/employee/view';
// --------------------------------------------------------------

export default function EmployeeCreatePage() {
  return (
    <>
      <Helmet>
        <title>Employees | Refex Contacts</title>
      </Helmet>
      
      <EmployeeCreate/>
    </>
  );
}
