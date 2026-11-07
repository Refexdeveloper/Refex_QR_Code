import { Helmet } from 'react-helmet-async';

import AssetPublicView from 'src/sections/assets/public/asset-public-view';

export default function AssetPublicPage() {
  return (
    <>
      <Helmet>
        <title>Asset Details | Refex</title>
      </Helmet>
      <AssetPublicView />
    </>
  );
}

