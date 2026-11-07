import { Helmet } from 'react-helmet-async';

import { AssetsList } from 'src/sections/assets/view';

export default function AssetsListPage() {
  return (
    <>
      <Helmet>
        <title>Assets | Refex</title>
      </Helmet>
      <AssetsList />
    </>
  );
}

