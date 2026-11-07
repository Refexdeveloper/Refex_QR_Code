import { Helmet } from 'react-helmet-async';

import AssetsApiAccess from 'src/sections/assets/view/assets-api-access';

export default function AssetsApiAccessPage() {
  return (
    <>
      <Helmet>
        <title>Assets API Access | Refex</title>
      </Helmet>
      <AssetsApiAccess />
    </>
  );
}

