import { Helmet } from 'react-helmet-async';

import { BrochureDownload } from 'src/sections/brochure-form';

// ----------------------------------------------------------------------

export default function FormPage() {
  return (
    <>
      <Helmet>
        <title> Brochure Download Form | 3i MedTech </title>
      </Helmet>

      <BrochureDownload />
    </>
  );
}
