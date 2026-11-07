import { Helmet } from 'react-helmet-async';

import { AssetsCreate } from 'src/sections/assets/view';

export default function AssetsCreatePage() {
  return (
    <>
      <Helmet>
        <title>Create Asset | Refex</title>
      </Helmet>
      <AssetsCreate />
    </>
  );
}

