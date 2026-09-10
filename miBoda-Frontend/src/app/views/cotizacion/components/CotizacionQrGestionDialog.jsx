import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, TextField, Stack, Chip, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import {
  renovarQrPresupuesto, revocarQrPresupuesto, regenerarQrPresupuesto,
} from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

const ESTADO_STYLE = {
  vigente: { bg: '#dcfce7', color: '#15803d', label: 'Vigente' },
  renovado: { bg: '#dbeafe', color: '#1d4ed8', label: 'Renovado' },
  vencido: { bg: '#fef3c7', color: '#b45309', label: 'Vencido' },
  revocado: { bg: '#fee2e2', color: '#b91c1c', label: 'Revocado' },
  perdido: { bg: '#f1f5f9', color: '#64748b', label: 'Perdido' },
};

export default function CotizacionQrGestionDialog({ open, row, onClose, onUpdated }) {
  const [dias, setDias] = useState(5);
  const [busy, setBusy] = useState(false);
  const meta = row?.qr_meta ?? {};
  const est = ESTADO_STYLE[meta.qr_estado_efectivo] ?? ESTADO_STYLE.vigente;

  const copyUrl = async () => {
    if (!meta.qr_public_url) return;
    try {
      await navigator.clipboard.writeText(meta.qr_public_url);
      toastSuccess('Enlace copiado');
    } catch {
      handleErrorMessages('Copiar', new Error('No se pudo copiar el enlace'));
    }
  };

  const run = async (fn) => {
    if (!row?.id_presupuesto) return;
    setBusy(true);
    try {
      const result = await fn();
      toastSuccess('QR actualizado');
      onUpdated?.(result);
    } catch (e) {
      handleErrorMessages('QR', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Gestión QR — {row?.codigo}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Chip
              label={est.label}
              size="small"
              sx={{ bgcolor: est.bg, color: est.color, fontWeight: 700, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              El cliente escanea el QR del PDF y abre la cotización en la web <strong>sin login</strong>.
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="text.secondary" display="block">Vence el</Typography>
            <Typography variant="body2" fontWeight={700}>{meta.vigencia_fin_fmt || '—'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {meta.dias_restantes != null ? `${meta.dias_restantes} día(s) restante(s)` : ''}
              · {meta.qr_escaneos ?? 0} escaneo(s)
            </Typography>
          </Box>

          <TextField
            size="small"
            type="number"
            label="Renovar vigencia (días)"
            value={dias}
            onChange={(e) => setDias(Math.max(1, parseInt(e.target.value, 10) || 5))}
            inputProps={{ min: 1, max: 365 }}
            fullWidth
          />

          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={copyUrl}
              disabled={!meta.qr_public_url}
            >
              Copiar enlace
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              href={meta.qr_public_url}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!meta.qr_public_url}
            >
              Ver página pública
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          color="success"
          variant="contained"
          startIcon={<AutorenewIcon />}
          disabled={busy}
          onClick={() => run(() => renovarQrPresupuesto(row.id_presupuesto, { dias }))}
          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
        >
          Renovar
        </Button>
        <Button
          color="warning"
          variant="outlined"
          startIcon={<RefreshIcon />}
          disabled={busy}
          onClick={() => {
            if (!window.confirm('¿Regenerar token? Los PDFs antiguos dejarán de funcionar.')) return;
            run(() => regenerarQrPresupuesto(row.id_presupuesto));
          }}
        >
          Regenerar token
        </Button>
        <Button
          color="error"
          variant="outlined"
          startIcon={<BlockIcon />}
          disabled={busy}
          onClick={() => {
            if (!window.confirm('¿Revocar acceso QR? El cliente no podrá ver la cotización.')) return;
            run(() => revocarQrPresupuesto(row.id_presupuesto));
          }}
        >
          Revocar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
