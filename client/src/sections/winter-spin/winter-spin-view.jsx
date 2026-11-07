import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, keyframes } from '@mui/material/styles';

import Footer from 'src/layouts/dashboard/footer';

import SpinWheel from './spin-wheel';
import PrizeResult from './prize-result';
import { celebratePrize } from './celebrate-prize';
import { BRAND, CAMPAIGN_TAGLINE, CAMPAIGN_TITLE, segmentIndexForCode } from './constants';

// ----------------------------------------------------------------------

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(1.06); }
`;

function ResultPlaceholder() {
  return (
    <Box
      sx={{
        height: 1,
        minHeight: { xs: 200, sm: 260, md: 440 },
        p: { xs: 2.25, sm: 3 },
        borderRadius: { xs: 2.5, md: 3 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha('#04101D', 0.5),
        border: `1px dashed ${alpha(BRAND.gold, 0.42)}`,
        backgroundImage: `radial-gradient(circle at 50% 20%, ${alpha(BRAND.gold, 0.12)}, transparent 55%)`,
      }}
    >
      <Box
        sx={{
          width: { xs: 76, sm: 92 },
          height: { xs: 76, sm: 92 },
          mb: 2,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(BRAND.gold, 0.14),
          border: `1px solid ${alpha(BRAND.gold, 0.4)}`,
          boxShadow: `0 0 0 10px ${alpha(BRAND.gold, 0.06)}`,
          animation: `${float} 4.5s ease-in-out infinite`,
        }}
      >
        <Typography sx={{ fontSize: { xs: 34, sm: 42 } }}>🎁</Typography>
      </Box>
      <Typography
        variant="h6"
        sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
      >
        Your prize appears here
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 1, color: alpha('#fff', 0.72), maxWidth: 300, lineHeight: 1.55 }}
      >
        Spin the wheel to reveal your Winter Carnival reward.
      </Typography>
    </Box>
  );
}

export default function WinterSpinView() {
  const wheelBoxRef = useRef(null);
  const [wheelSize, setWheelSize] = useState(320);

  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [campaignActive, setCampaignActive] = useState(true);
  const [entry, setEntry] = useState(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [spinToken, setSpinToken] = useState(0);
  const [pendingEntry, setPendingEntry] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const autoSpinStarted = useRef(false);

  const canSpin = Boolean(ready && campaignActive && !alreadySpun && !spinning && !entry);

  useEffect(() => {
    const el = wheelBoxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      const width = el.clientWidth || 320;
      // Keep wheel readable on phones, roomy on desktops
      const next = Math.max(250, Math.min(430, Math.floor(width - 4)));
      setWheelSize(next);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (window.location.search) {
        window.history.replaceState({}, '', '/winter-carnival/spin');
      }

      try {
        const res = await axios.get('/api/winter-spin/status', { withCredentials: true });
        if (cancelled) return;
        const data = res.data?.results;
        setCampaignActive(Boolean(data?.campaignActive));
        if (data?.alreadySpun && data?.entry) {
          setAlreadySpun(true);
          setEntry(data.entry);
          setShowResult(true);
        }
        if (!data?.campaignActive) {
          setError('The Refex Winter Carnival contest is over.');
        }
        if (!cancelled) {
          setReady(true);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        const statusCode = err.response?.status;
        // Invalid / unknown / expired / mismatched token → 404 page
        if (statusCode === 403 || statusCode === 401) {
          setBlocked(true);
          return;
        }
        setError(err.response?.data?.message || 'Unable to load your spin status.');
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    if (pendingEntry) {
      setEntry(pendingEntry);
      setAlreadySpun(true);
      setShowResult(true);

      const cashCodes = ['win_2000', 'win_5000', 'win_7000', 'win_10000'];
      if (cashCodes.includes(pendingEntry.prizeCode)) {
        celebratePrize('cash');
      } else if (pendingEntry.prizeCode === 'bumper') {
        celebratePrize('bumper');
      } else {
        celebratePrize('default');
      }
      setPendingEntry(null);
    }
  }, [pendingEntry]);

  const handleSpin = useCallback(async () => {
    if (!canSpin) return;
    setError('');
    setShowResult(false);

    try {
      setSpinning(true);
      const res = await axios.post('/api/winter-spin/spin', {}, { withCredentials: true });
      const data = res.data?.results;
      const nextEntry = data?.entry;

      if (!nextEntry?.prizeCode) {
        setSpinning(false);
        setError('Spin failed. Please try again.');
        return;
      }

      if (data.alreadySpun) {
        setAlreadySpun(true);
        setEntry(nextEntry);
        setShowResult(true);
        setSpinning(false);
        return;
      }

      setPendingEntry(nextEntry);
      setTargetIndex(segmentIndexForCode(nextEntry.prizeCode));
      setSpinToken((t) => t + 1);
    } catch (err) {
      setSpinning(false);
      const statusCode = err.response?.status;
      if (statusCode === 403 || statusCode === 401) {
        setBlocked(true);
        return;
      }
      setError(err.response?.data?.message || 'Unable to spin right now. Please try again.');
    }
  }, [canSpin]);

  useEffect(() => {
    if (loading || blocked || !canSpin || autoSpinStarted.current) return;
    autoSpinStarted.current = true;
    handleSpin();
  }, [loading, blocked, canSpin, handleSpin]);

  if (blocked) {
    return <Navigate to="/404" replace />;
  }

  // Do not paint the campaign page until the token is verified
  if (loading) {
    return null;
  }

  const cardContent = (
    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3.5 }} alignItems="stretch">
      <Grid xs={12} md={6}>
        <Stack
          spacing={{ xs: 2, sm: 2.25 }}
          alignItems="center"
          justifyContent="center"
          sx={{ height: 1 }}
        >
          <Box
            ref={wheelBoxRef}
            sx={{
              width: 1,
              maxWidth: { xs: 340, sm: 400, md: 460 },
              display: 'flex',
              justifyContent: 'center',
              pt: 1,
            }}
          >
            <SpinWheel
              size={wheelSize}
              spinning={spinning}
              targetIndex={targetIndex}
              spinToken={spinToken}
              onSpinComplete={handleSpinComplete}
            />
          </Box>

          {error ? (
            <Alert
              severity="warning"
              sx={{
                width: 1,
                maxWidth: 460,
                bgcolor: alpha(BRAND.gold, 0.12),
                color: '#fff',
                border: `1px solid ${alpha(BRAND.gold, 0.35)}`,
                '& .MuiAlert-icon': { color: BRAND.gold },
              }}
            >
              {error}
            </Alert>
          ) : null}
        </Stack>
      </Grid>

      <Grid xs={12} md={6}>
        {showResult && entry ? (
          <PrizeResult entry={entry} alreadySpun={alreadySpun && !spinning} />
        ) : (
          <ResultPlaceholder />
        )}
      </Grid>
    </Grid>
  );

  return (
    <Box
      sx={{
        minHeight: { xs: '100dvh', sm: '100vh' },
        position: 'relative',
        overflowX: 'hidden',
        background: `
          radial-gradient(900px 480px at 8% -8%, ${alpha(BRAND.blue, 0.5)} 0%, transparent 55%),
          radial-gradient(800px 420px at 100% 0%, ${alpha(BRAND.orange, 0.32)} 0%, transparent 50%),
          radial-gradient(700px 360px at 50% 110%, ${alpha(BRAND.gold, 0.14)} 0%, transparent 55%),
          linear-gradient(165deg, ${BRAND.navy} 0%, #0B2744 45%, #13415F 100%)
        `,
        color: '#fff',
      }}
    >
      {/* Atmosphere */}
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${alpha('#fff', 0.5)} 1px, transparent 1px)`,
          backgroundSize: '42px 42px',
          opacity: 0.14,
        }}
      />
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          width: { xs: 180, md: 280 },
          height: { xs: 180, md: 280 },
          top: { xs: 40, md: 60 },
          left: { xs: -60, md: -40 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(BRAND.blue, 0.45)} 0%, transparent 70%)`,
          animation: `${pulseGlow} 7s ease-in-out infinite`,
          filter: 'blur(8px)',
        }}
      />
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          width: { xs: 160, md: 260 },
          height: { xs: 160, md: 260 },
          bottom: { xs: 80, md: 40 },
          right: { xs: -50, md: -30 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(BRAND.orange, 0.35)} 0%, transparent 70%)`,
          animation: `${pulseGlow} 8s ease-in-out infinite`,
          filter: 'blur(10px)',
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 1.5, sm: 2.5, md: 3 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack alignItems="center" spacing={{ xs: 1, sm: 1.25 }} sx={{ mb: { xs: 2, md: 3 } }}>
          <Box
            component="img"
            alt="Refex"
            src="/assets/refex-logo.png"
            sx={{
              height: { xs: 38, sm: 48, md: 54 },
              width: 'auto',
              maxWidth: { xs: 200, sm: 240 },
              objectFit: 'contain',
              filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.35))',
            }}
          />

          <Typography
            component="h1"
            textAlign="center"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.28rem', sm: '1.75rem', md: '2.1rem' },
              lineHeight: 1.2,
              letterSpacing: 0.2,
              px: 1,
              background: `linear-gradient(90deg, ${BRAND.ice}, ${BRAND.gold}, ${BRAND.coral}, ${BRAND.ice})`,
              backgroundSize: '220% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${shimmer} 6s linear infinite`,
            }}
          >
            {CAMPAIGN_TITLE}
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              color: alpha('#fff', 0.8),
              maxWidth: 520,
              px: 1,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            {CAMPAIGN_TAGLINE}
          </Typography>

        </Stack>

        <Card
          sx={{
            p: { xs: 1.5, sm: 2.25, md: 3 },
            borderRadius: { xs: 2.5, md: 3.5 },
            bgcolor: alpha('#04101D', 0.58),
            border: `1px solid ${alpha(BRAND.gold, 0.32)}`,
            backdropFilter: 'blur(14px)',
            boxShadow: `0 28px 80px ${alpha('#000', 0.45)}`,
            overflow: 'visible',
          }}
        >
          {cardContent}
        </Card>

        <Footer
          sx={{
            mt: { xs: 2.5, md: 3.5 },
            color: alpha('#fff', 0.55),
            '& a': { color: alpha('#fff', 0.75) },
            '& .MuiTypography-root': { color: alpha('#fff', 0.55) },
          }}
        />
      </Container>
    </Box>
  );
}
