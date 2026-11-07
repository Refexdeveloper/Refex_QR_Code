import { Helmet } from 'react-helmet-async';

import SmartLinkList from 'src/sections/qr/smart-link/view/smart-link-list';

export default function QrSmartLinkPage() {
  return (
    <>
      <Helmet>
        <title>Smart Link | QR Code | Refex</title>
      </Helmet>
      <SmartLinkList />
    </>
  );
}
