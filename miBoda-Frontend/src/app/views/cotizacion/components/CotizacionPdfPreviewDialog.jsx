import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
  fetchPresupuestoPdf,
  fetchPresupuestoProformaPdf,
  fetchPresupuestoBoletaPdf,
  fetchPresupuestoReciboPdf,
  fetchPresupuestoContratoPdf,
  descargarPresupuestoPdf,
  descargarPresupuestoProformaPdf,
  descargarPresupuestoBoletaPdf,
  descargarPresupuestoReciboPdf,
  descargarPresupuestoContratoPdf,
} from '../../../api/cotizacion.api';
import { handleErrorMessages } from '../../../components/notify-messages';

const DOC_CONFIG = {
  cotizacion: {
    title: 'Cotización',
    fetch: fetchPresupuestoPdf,
    download: descargarPresupuestoPdf,
    filePrefix: 'cotizacion',
  },
  proforma: {
    title: 'Proforma',
    fetch: fetchPresupuestoProformaPdf,
    download: descargarPresupuestoProformaPdf,
    filePrefix: 'proforma',
  },
  boleta: {
    title: 'Boleta de pago (sin IGV)',
    fetch: fetchPresupuestoBoletaPdf,
    download: descargarPresupuestoBoletaPdf,
    filePrefix: 'boleta',
  },
  recibo: {
    title: 'Recibo Térmico',
    fetch: fetchPresupuestoReciboPdf,
    download: descargarPresupuestoReciboPdf,
    filePrefix: 'recibo',
  },
  contrato: {
    title: 'Contrato',
    fetch: fetchPresupuestoContratoPdf,
    download: descargarPresupuestoContratoPdf,
    filePrefix: 'contrato',
  },
};

function whatsappShareUrl(presupuesto, docTitle) {
  const raw = presupuesto?.cliente_whatsapp || presupuesto?.whatsapp || '51970048451';
  const phone = String(raw).replace(/\D/g, '');
  const codigo = presupuesto?.codigo ?? '';
  const total = presupuesto?.total != null
    ? `S/ ${Math.round(Number(presupuesto.total)).toLocaleString('es-PE')}`
    : '';
  const text = `Hola, te comparto la ${docTitle} ${codigo} de royalsensorymassage.${total ? ` Total referencial: ${total}.` : ''} ¿Podemos coordinar el siguiente paso?`;
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
}

/** Abre WhatsApp Web siempre en la misma pestaña del navegador (nombre fijo). */
function openWhatsApp(url) {
  window.open(url, 'royalsensorymassage_wa');
}

export default function CotizacionPdfPreviewDialog({
  open,
  presupuesto,
  docType = 'cotizacion',
  onClose,
}) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const config = DOC_CONFIG[docType] || DOC_CONFIG.cotizacion;

  useEffect(() => {
    if (!open || !presupuesto?.id_presupuesto) {
      setPdfUrl(null);
      return undefined;
    }

    const cfg = DOC_CONFIG[docType] || DOC_CONFIG.cotizacion;
    let active = true;
    let objectUrl = null;

    const load = async () => {
      setLoading(true);
      setPdfUrl(null);
      try {
        const blob = await cfg.fetch(presupuesto.id_presupuesto, true);
        if (!active) return;
        objectUrl = window.URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (e) {
        if (active) {
          handleErrorMessages('Ver PDF', e);
          onClose?.();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [open, presupuesto?.id_presupuesto, docType, onClose]);

  const handleDownload = async () => {
    if (!presupuesto?.id_presupuesto) return;
    try {
      await config.download(presupuesto.id_presupuesto, presupuesto.codigo);
    } catch (e) {
      handleErrorMessages('Descargar PDF', e);
    }
  };

  const handleWhatsapp = () => {
    openWhatsApp(whatsappShareUrl(presupuesto, config.title));
  };

  const codigo = presupuesto?.codigo ?? '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Typography variant="h6" component="span" sx={{ flex: 1, fontWeight: 700 }}>
          {config.title} — {codigo}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, minHeight: 480, bgcolor: '#525659' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        )}
        {!loading && pdfUrl && (
          <Box
            component="iframe"
            title={`PDF ${codigo}`}
            src={pdfUrl}
            sx={{
              width: '100%',
              height: { xs: '70vh', md: '75vh' },
              border: 0,
              display: 'block',
              bgcolor: '#fff',
            }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          variant="outlined"
          startIcon={<WhatsAppIcon />}
          onClick={handleWhatsapp}
          disabled={!pdfUrl}
          sx={{ borderColor: '#25D366', color: '#128C7E', fontWeight: 600 }}
        >
          Enviar por WhatsApp
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!pdfUrl}
          sx={{ bgcolor: '#004A99', '&:hover': { bgcolor: '#003580' } }}
        >
          Descargar PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
