import { Helmet } from 'react-helmet-async';

import { BrochureFormView } from 'src/sections/brochure-form';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Brochure Form | 3i MedTech </title>
      </Helmet>

      <BrochureFormView />
    </>
  );
}
