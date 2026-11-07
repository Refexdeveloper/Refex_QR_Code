import { Helmet } from 'react-helmet-async';

import { WinterCampaignView } from 'src/sections/winter-campaign';

// ----------------------------------------------------------------------

export default function WinterCampaignPage() {
  return (
    <>
      <Helmet>
        <title> Refex Winter Carnival </title>
      </Helmet>

      <WinterCampaignView />
    </>
  );
}
