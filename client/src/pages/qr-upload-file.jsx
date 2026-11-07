import { Helmet } from 'react-helmet-async';

import UploadFileList from 'src/sections/qr/upload-file/view/upload-file-list';

export default function QrUploadFilePage() {
  return (
    <>
      <Helmet>
        <title>Upload File | QR Code | Refex</title>
      </Helmet>
      <UploadFileList />
    </>
  );
}
