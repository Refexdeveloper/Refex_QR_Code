import { Helmet } from 'react-helmet-async';

import { ContestFormView } from 'src/sections/contest-form';

// ----------------------------------------------------------------------

export default function FormPage() {
  return (
    <>
      <Helmet>
        <title> FLY BUY SUMMER </title>
      </Helmet>

      <ContestFormView />
    </>
  );
}
