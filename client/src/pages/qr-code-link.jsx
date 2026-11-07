import { Helmet } from 'react-helmet-async';

import { QRCodeLink } from 'src/sections/qr-eveelz';

// ----------------------------------------------------------------------

export default function QRCodeLinkPage() {
  return (
    <>
      <Helmet>
        <title> App | Refex eVeelz </title>
      </Helmet>

      <QRCodeLink />
    </>
  );
}
