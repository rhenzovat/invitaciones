import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import NotificacionAdminPanel from './NotificacionAdminPanel';

const PageRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f0f4f8',
});

const HeroCard = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(0),
  borderRadius: 0,
  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 55%, #0d47a1 100%)',
  color: '#fff',
  padding: theme.spacing(2.5, 3),
  boxShadow: '0 4px 24px rgba(21,101,192,0.25)',
}));

export default function NotificacionAdminPage() {
  return (
    <PageRoot>
      <HeroCard elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsActiveIcon sx={{ fontSize: 32, opacity: 0.95 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Alertas y semáforos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.3 }}>
              Configura intervalos, estados operativos y colores del semáforo del campus
            </Typography>
          </Box>
        </Box>
      </HeroCard>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <NotificacionAdminPanel embedded />
        </Paper>
      </Box>
    </PageRoot>
  );
}
