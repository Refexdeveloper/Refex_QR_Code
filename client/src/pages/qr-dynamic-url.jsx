import { Helmet } from 'react-helmet-async';

import DynamicUrlList from 'src/sections/qr/dynamic-url/view/dynamic-url-list';

export default function QrDynamicUrlPage() {
  return (
    <>
      <Helmet>
        <title>Dynamic URL | QR Code | Refex</title>
      </Helmet>
      <DynamicUrlList />
    </>
  );
}
