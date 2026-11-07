import { Helmet } from 'react-helmet-async';

import { QRCodeLink } from 'src/sections/qr-insta';

// ----------------------------------------------------------------------

export default function InstaLinkPage() {
  return (
    <>
      <Helmet>
        <title> App | Intagram Link </title>
      </Helmet>

      <QRCodeLink />
    </>
  );
}
