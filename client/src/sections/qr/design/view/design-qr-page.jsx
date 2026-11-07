import { useState } from 'react';

import Container from '@mui/material/Container';

import DesignQrList from './design-qr-list';
import DesignQrPlayground from './design-qr-playground';

// ----------------------------------------------------------------------

export default function DesignQrPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleCreate = () => {
    setEditItem(null);
    setPlaygroundOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setPlaygroundOpen(true);
  };

  const handleClosePlayground = () => {
    setPlaygroundOpen(false);
    setEditItem(null);
  };

  const handleSaved = () => {
    setRefreshToken((value) => value + 1);
  };

  const handleDeleted = () => {
    setRefreshToken((value) => value + 1);
    if (playgroundOpen && editItem) {
      handleClosePlayground();
    }
  };

  return (
    <Container maxWidth="xl">
      <DesignQrList
        refreshToken={refreshToken}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeleted={handleDeleted}
      />

      <DesignQrPlayground
        open={playgroundOpen}
        onClose={handleClosePlayground}
        initialItem={editItem}
        onSaved={handleSaved}
      />
    </Container>
  );
}
