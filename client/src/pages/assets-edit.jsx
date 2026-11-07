import { Helmet } from 'react-helmet-async';

import { AssetsEdit } from 'src/sections/assets/view';

export default function AssetsEditPage() {
  return (
    <>
      <Helmet>
        <title>Edit Asset | Refex</title>
      </Helmet>
      <AssetsEdit />
    </>
  );
}

