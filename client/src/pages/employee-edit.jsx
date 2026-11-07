import { Helmet } from 'react-helmet-async';

import { EmployeeEdit } from 'src/sections/employee/view';
// --------------------------------------------------------------

export default function EmployeeEditPage() {
  return (
    <>
      <Helmet>
        <title>Employees | Refex Contacts</title>
      </Helmet>
      
      <EmployeeEdit/>
    </>
  );
}
