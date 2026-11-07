import { Helmet } from 'react-helmet-async';

import FixedUrlList from 'src/sections/qr/fixed-url/view/fixed-url-list';

export default function QrFixedUrlPage() {
  return (
    <>
      <Helmet>
        <title>Fixed URL | QR Code | Refex</title>
      </Helmet>
      <FixedUrlList />
    </>
  );
}
