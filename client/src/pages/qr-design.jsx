import { Helmet } from 'react-helmet-async';

import DesignQrPage from 'src/sections/qr/design/view/design-qr-page';

export default function QrDesignPage() {
  return (
    <>
      <Helmet>
        <title>Design QR | QR Code | Refex</title>
      </Helmet>
      <DesignQrPage />
    </>
  );
}
