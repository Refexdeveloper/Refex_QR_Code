import React, { useEffect } from 'react';

import { Box, Stack, LinearProgress } from '@mui/material';

function QRCodeLink() {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.refex.eveelz';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.location.href = 'https://apps.apple.com/in/app/refex-eveelz/id6499511515 ';
    } else {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.refex.eveelz'; // fallback or desktop site
    }
  }, []);

  return (
    <Stack sx={{ height: '100vh' }} alignItems="center" justifyContent="center">
      <Box width="30%">
        <LinearProgress />
      </Box>
    </Stack>
  );
}

export default QRCodeLink;
