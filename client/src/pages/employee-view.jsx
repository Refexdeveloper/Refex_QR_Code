import { Helmet } from 'react-helmet-async';

import { EmployeeView } from 'src/sections/employee/view';
// --------------------------------------------------------------

export default function EmployeeViewPage() {
  return (
    <>
      <Helmet>
        <title>Employees | Refex Contacts</title>
      </Helmet>
      
      <EmployeeView/>
    </>
  );
}
