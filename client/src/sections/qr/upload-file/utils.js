import axios from 'axios';

export async function fetchAndOpenFile(row, mode) {
  const res = await axios.get(`/api/upload-file-qr/${row.id}/file`, {
    params: { mode },
    responseType: 'blob',
  });

  const contentType = row.mime_type || res.headers['content-type'] || 'application/octet-stream';
  const blob = new Blob([res.data], { type: contentType });
  const url = URL.createObjectURL(blob);

  if (mode === 'download') {
    const link = document.createElement('a');
    link.href = url;
    link.download = row.original_name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
