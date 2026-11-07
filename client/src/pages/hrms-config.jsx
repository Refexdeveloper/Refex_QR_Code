import { Helmet } from 'react-helmet-async';

import { HrmsConfigView } from 'src/sections/administration/view';

export default function HrmsConfigPage() {
  return (
    <>
      <Helmet>
        <title>HRMS API Configuration | Refex</title>
      </Helmet>
      <HrmsConfigView />
    </>
  );
}
