import { Helmet } from 'react-helmet-async';

import { WinterSpinView } from 'src/sections/winter-spin';

// ----------------------------------------------------------------------

export default function WinterSpinPage() {
  return (
    <>
      <Helmet>
        <title> Refex Winter Carnival | Spin the Wheel </title>
      </Helmet>

      <WinterSpinView />
    </>
  );
}
