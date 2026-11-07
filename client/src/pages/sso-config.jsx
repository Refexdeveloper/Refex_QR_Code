import { Helmet } from 'react-helmet-async';

import { SsoConfigView } from 'src/sections/administration/view';

export default function SsoConfigPage() {
  return (
    <>
      <Helmet>
        <title>SSO Configuration | Refex</title>
      </Helmet>
      <SsoConfigView />
    </>
  );
}
