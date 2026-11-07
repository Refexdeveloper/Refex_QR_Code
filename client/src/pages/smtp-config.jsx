import { Helmet } from 'react-helmet-async';

import { SmtpConfigView } from 'src/sections/administration/view';

export default function SmtpConfigPage() {
  return (
    <>
      <Helmet>
        <title>SMTP Configuration | Refex</title>
      </Helmet>
      <SmtpConfigView />
    </>
  );
}
