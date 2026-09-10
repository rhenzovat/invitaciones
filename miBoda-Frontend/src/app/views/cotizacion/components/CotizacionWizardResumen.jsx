import { Box, Typography, Button, Divider, IconButton, Tooltip } from '@mui/material';
import AccessTimeIcon   from '@mui/icons-material/AccessTime';
import SummarizeIcon    from '@mui/icons-material/Summarize';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import CloseIcon        from '@mui/icons-material/Close';

export default function CotizacionWizardResumen({
  currency = 'S/',
  project,
  modules = [],
  discount = 0,
  total = 0,
  delivery,
  footerAction = null,
  onRemoveModule = null,   // (module) => void
}) {
  const fmt = (n) => `${currency} ${Math.round(n).toLocaleString('es-PE')}`;

  // Build lines: project + modules + discount
  // We keep modules separate to know which ones are removable
  const projectLine = project
    ? { label: project.title, price: project.price, positive: true, primary: true, removable: false }
    : null;
  const moduleLines = modules.map((m) => ({
    label: m.name, price: m.price, positive: true, primary: false,
    removable: true, mod: m,
  }));
  const discountLine = discount > 0
    ? { label: 'Descuento hosting y dominio', price: discount, positive: false, removable: false }
    : null;

  const lines = [
    ...(projectLine ? [projectLine] : []),
    ...moduleLines,
    ...(discountLine ? [discountLine] : []),
  ];

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 300,
      position: 'sticky',
      top: 16,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,74,153,0.10)',
      border: '1px solid #e2e8f0',
      bgcolor: '#fff',
    }}>
      {/* Header strip */}
      <Box sx={{
        bgcolor: '#004A99',
        px: 2, py: 1.4,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <SummarizeIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.85)' }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', fontSize: '0.82rem', letterSpacing: '0.02em' }}>
          Resumen de tu proyecto
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Lines */}
        {lines.length === 0 ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
              <SummarizeIcon sx={{ fontSize: 18, color: '#cbd5e1' }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>
              Selecciona un tipo de proyecto
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 1.5 }}>
            {lines.map((l, i) => (
              <Box key={i} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 0.5, py: 0.55,
                borderBottom: i < lines.length - 1 ? '1px solid #f1f5f9' : 'none',
                borderRadius: '6px',
                px: 0.5,
                transition: 'background 0.15s',
                ...(l.removable && {
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
                  '&:hover .remove-btn': { opacity: 1 },
                }),
              }}>
                {/* Icono estado */}
                <Box sx={{ flexShrink: 0, mt: '1px' }}>
                  {l.positive ? (
                    <CheckCircleIcon sx={{ fontSize: 13, color: l.primary ? '#004A99' : '#f97316' }} />
                  ) : (
                    <Box sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 5, height: 1.5, bgcolor: '#16a34a', borderRadius: 1 }} />
                    </Box>
                  )}
                </Box>

                {/* Label */}
                <Typography variant="body2" sx={{
                  flex: 1, minWidth: 0, fontSize: '0.78rem', lineHeight: 1.35, ml: 0.5,
                  color: l.primary ? '#1e293b' : '#475569',
                  fontWeight: l.primary ? 600 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {l.label}
                </Typography>

                {/* Precio */}
                <Typography variant="body2" sx={{
                  fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                  color: l.positive ? (l.primary ? '#004A99' : '#f97316') : '#16a34a',
                }}>
                  {l.positive ? '+' : '−'}{fmt(l.price)}
                </Typography>

                {/* Botón eliminar — solo en módulos */}
                {l.removable && onRemoveModule && (
                  <Tooltip title="Quitar módulo" placement="left" arrow>
                    <IconButton
                      className="remove-btn"
                      size="small"
                      onClick={() => onRemoveModule(l.mod)}
                      sx={{
                        opacity: 0,
                        flexShrink: 0,
                        ml: 0.25,
                        p: '2px',
                        color: '#ef4444',
                        bgcolor: 'rgba(239,68,68,0.08)',
                        borderRadius: '4px',
                        transition: 'opacity 0.15s, background 0.15s',
                        '&:hover': { bgcolor: 'rgba(239,68,68,0.18)', opacity: '1 !important' },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Total box */}
        <Box sx={{
          bgcolor: 'linear-gradient(135deg, #FFF9F0 0%, #FFF3E5 100%)',
          background: 'linear-gradient(135deg, #FFF9F0 0%, #FFF3E5 100%)',
          borderRadius: '10px',
          p: 1.8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid rgba(249,115,22,0.18)',
        }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#64748b', fontSize: '0.80rem' }}>
            Total estimado
          </Typography>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#f97316', lineHeight: 1 }}>
            {fmt(total)}
          </Typography>
        </Box>

        {/* Delivery */}
        {delivery && (
          <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 0.75,
            bgcolor: '#f8fafc', borderRadius: '8px', px: 1.2, py: 0.8 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#64748b' }}>
              Tiempo estimado: <strong>{delivery}</strong>
            </Typography>
          </Box>
        )}

        {/* Action buttons */}
        {footerAction?.onContinue && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
            {footerAction.showBack && footerAction.onBack && (
              <Button
                fullWidth size="small"
                startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
                onClick={footerAction.onBack}
                sx={{
                  color: '#64748b', mb: 1, textTransform: 'none',
                  fontWeight: 600, fontSize: '0.82rem',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#f8fafc' },
                }}
              >
                Atrás
              </Button>
            )}
            <Button
              fullWidth variant="contained"
              disabled={footerAction.continueDisabled}
              onClick={footerAction.onContinue}
              endIcon={footerAction.continueLoading ? null : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 1.3, fontWeight: 700, textTransform: 'none',
                fontSize: '0.86rem', borderRadius: '10px',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease',
                ...(footerAction.continueVariant === 'orange' ? {
                  bgcolor: '#f97316',
                  boxShadow: '0 3px 12px rgba(249,115,22,0.35)',
                  '&:hover': { bgcolor: '#ea580c', boxShadow: '0 4px 16px rgba(249,115,22,0.45)' },
                  '&.Mui-disabled': { bgcolor: '#e2e8f0', boxShadow: 'none' },
                } : {
                  bgcolor: '#004A99',
                  boxShadow: '0 3px 12px rgba(0,74,153,0.30)',
                  '&:hover': { bgcolor: '#003580', boxShadow: '0 4px 16px rgba(0,74,153,0.40)' },
                  '&.Mui-disabled': { bgcolor: '#e2e8f0', boxShadow: 'none' },
                }),
              }}
            >
              {footerAction.continueLoading ? 'Guardando…' : (footerAction.continueLabel || 'Continuar')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
