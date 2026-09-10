import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Stack, Divider, Chip, IconButton, Tooltip,
} from '@mui/material';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import VisibilityIcon      from '@mui/icons-material/Visibility';
import FileDownloadIcon    from '@mui/icons-material/FileDownload';
import WhatsAppIcon        from '@mui/icons-material/WhatsApp';
import EditNoteIcon        from '@mui/icons-material/EditNote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptIcon         from '@mui/icons-material/Receipt';
import DescriptionIcon     from '@mui/icons-material/Description';
import ArticleIcon         from '@mui/icons-material/Article';
import PointOfSaleIcon     from '@mui/icons-material/PointOfSale';

import CotizacionPdfPreviewDialog from './CotizacionPdfPreviewDialog';
import {
  descargarPresupuestoPdf,
  descargarPresupuestoProformaPdf,
  descargarPresupuestoBoletaPdf,
  descargarPresupuestoReciboPdf,
} from '../../../api/cotizacion.api';
import { handleErrorMessages } from '../../../components/notify-messages';

// ─── Config de cada tipo de documento ────────────────────────────────────────
const DOCS = [
  {
    key:      'cotizacion',
    label:    'Cotización',
    desc:     'Detalle de servicios y precio',
    icon:     <DescriptionIcon sx={{ fontSize: 20 }} />,
    color:    '#004A99',
    bgColor:  '#eff6ff',
    download: descargarPresupuestoPdf,
  },
  {
    key:      'proforma',
    label:    'Proforma',
    desc:     'Resumen ejecutivo con alcance',
    icon:     <ArticleIcon sx={{ fontSize: 20 }} />,
    color:    '#7c3aed',
    bgColor:  '#f5f3ff',
    download: descargarPresupuestoProformaPdf,
  },
  {
    key:      'boleta',
    label:    'Boleta sin IGV',
    desc:     'Documento de cobro referencial',
    icon:     <ReceiptIcon sx={{ fontSize: 20 }} />,
    color:    '#ea580c',
    bgColor:  '#fff7ed',
    download: descargarPresupuestoBoletaPdf,
  },
  {
    key:      'recibo',
    label:    'Recibo Térmico',
    desc:     'Comprobante tipo ticket 80 mm',
    icon:     <PointOfSaleIcon sx={{ fontSize: 20 }} />,
    color:    '#0f766e',
    bgColor:  '#f0fdfa',
    download: descargarPresupuestoReciboPdf,
  },
];

// ─── Helper: WhatsApp URL + abrir siempre en misma pestaña ───────────────────
function whatsappUrl(presupuesto, docLabel) {
  const raw   = presupuesto?.cliente_whatsapp || presupuesto?.whatsapp || '51970048451';
  const phone = String(raw).replace(/\D/g, '');
  const cod   = presupuesto?.codigo ?? '';
  const tot   = presupuesto?.total != null
    ? `S/ ${Math.round(Number(presupuesto.total)).toLocaleString('es-PE')}`
    : '';
  const msg = `Hola, te comparto la ${docLabel} *${cod}* de royalsensorymassage.${tot ? ` Total referencial: ${tot}.` : ''} ¿Podemos coordinar el siguiente paso?`;
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
}

function openWhatsApp(url) {
  window.open(url, 'royalsensorymassage_wa');
}

// ─── Fila de un documento ─────────────────────────────────────────────────────
function DocRow({ doc, presupuesto, onPreview }) {
  const [downloading, setDownloading] = useState(false);
  const id = presupuesto?.id_presupuesto;

  const handleDownload = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      await doc.download(id, presupuesto.codigo);
    } catch (e) {
      handleErrorMessages('Error al descargar', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 1.5, borderRadius: '10px',
      background: doc.bgColor,
      border: `1px solid ${doc.color}22`,
    }}>
      {/* Ícono + texto */}
      <Box sx={{
        width: 38, height: 38, borderRadius: '8px',
        bgcolor: doc.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {doc.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.2 }}>
          {doc.label}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.2 }}>
          {doc.desc}
        </Typography>
      </Box>

      {/* Acciones */}
      <Stack direction="row" spacing={0.5} flexShrink={0}>
        <Tooltip title="Ver PDF">
          <IconButton
            size="small"
            onClick={() => onPreview(doc.key)}
            disabled={!id}
            sx={{
              bgcolor: '#fff', border: `1px solid ${doc.color}55`,
              color: doc.color, borderRadius: '8px', width: 34, height: 34,
              '&:hover': { bgcolor: doc.color, color: '#fff' },
            }}
          >
            <VisibilityIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Descargar PDF">
          <IconButton
            size="small"
            onClick={handleDownload}
            disabled={!id || downloading}
            sx={{
              bgcolor: '#fff', border: `1px solid ${doc.color}55`,
              color: doc.color, borderRadius: '8px', width: 34, height: 34,
              '&:hover': { bgcolor: doc.color, color: '#fff' },
            }}
          >
            <FileDownloadIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Enviar por WhatsApp`}>
          <IconButton
            size="small"
            onClick={() => openWhatsApp(whatsappUrl(presupuesto, doc.label))}
            disabled={!id}
            sx={{
              bgcolor: '#fff', border: '1px solid #25d36655',
              color: '#25d366', borderRadius: '8px', width: 34, height: 34,
              '&:hover': { bgcolor: '#25d366', color: '#fff' },
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function CotizacionWizardSuccessPanel({ presupuesto, onNuevaCotizacion, onEditProforma }) {
  const [preview, setPreview] = useState({ open: false, docType: 'cotizacion' });

  const id     = presupuesto?.id_presupuesto;
  const codigo = presupuesto?.codigo ?? '';
  const total  = presupuesto?.total != null
    ? `S/ ${Number(presupuesto.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
    : '';

  return (
    <>
      <Paper elevation={0} sx={{
        bgcolor: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {/* ── Banda verde de éxito ── */}
        <Box sx={{
          bgcolor: '#16a34a', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', lineHeight: 1.2 }}>
              ¡Cotización generada con éxito!
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.82)', mt: 0.3 }}>
              Tu presupuesto fue registrado correctamente
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* ── Código + total ── */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            p: 1.5, bgcolor: '#f8fafc', borderRadius: '10px', mb: 2.5,
            border: '1px solid #e2e8f0',
          }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                N.° Cotización
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#004A99', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                {codigo}
              </Typography>
            </Box>
            {total && (
              <Chip
                label={total}
                sx={{
                  fontWeight: 800, fontSize: '0.95rem', color: '#fff',
                  bgcolor: '#16a34a', px: 0.5, height: 36,
                  borderRadius: '8px',
                }}
              />
            )}
          </Box>

          {/* ── Documentos disponibles ── */}
          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
            Documentos disponibles
          </Typography>

          <Stack spacing={1} sx={{ mb: 2.5 }}>
            {DOCS.map((doc) => (
              <DocRow
                key={doc.key}
                doc={doc}
                presupuesto={presupuesto}
                onPreview={(type) => setPreview({ open: true, docType: type })}
              />
            ))}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* ── Botones de acción ── */}
          <Stack spacing={1.2}>
            {onEditProforma && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<EditNoteIcon />}
                onClick={onEditProforma}
                sx={{
                  bgcolor: '#7c3aed', fontWeight: 700, py: 1.2,
                  borderRadius: '10px', fontSize: '0.88rem',
                  '&:hover': { bgcolor: '#6d28d9' },
                }}
              >
                Editar proforma (canvas)
              </Button>
            )}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={onNuevaCotizacion}
              sx={{
                borderColor: '#004A99', color: '#004A99',
                fontWeight: 700, py: 1.2, borderRadius: '10px', fontSize: '0.88rem',
                '&:hover': { bgcolor: 'rgba(0,74,153,0.06)' },
              }}
            >
              Crear otra cotización
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Dialog de vista previa */}
      <CotizacionPdfPreviewDialog
        open={preview.open}
        docType={preview.docType}
        presupuesto={presupuesto}
        onClose={() => setPreview({ open: false, docType: 'cotizacion' })}
      />
    </>
  );
}
