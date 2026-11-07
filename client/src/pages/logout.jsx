import { Helmet } from 'react-helmet-async';

import { LogoutView } from 'src/sections/logout';

// ----------------------------------------------------------------------

export default function LogoutPage() {
  return (
    <>
      <Helmet>
        <title> Logging out..! | Refex Contacts </title>
      </Helmet>

      <LogoutView />
    </>
  );
}