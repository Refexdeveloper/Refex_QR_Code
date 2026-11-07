import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';
import { useAuth } from 'src/context/AuthContext';
import { getDefaultRoute } from 'src/utils/roles';

// ----------------------------------------------------------------------

export default function SsoCallbackPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userDataStr = searchParams.get('user_data');

  useEffect(() => {
    if (!token || !userDataStr) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userDataStr));
      login(token, userData);
      router.push(getDefaultRoute(userData));
    } catch {
      navigate('/login', { replace: true });
    }
  }, [token, userDataStr, login, navigate, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Signing you in…
      </Typography>
    </Box>
  );
}
