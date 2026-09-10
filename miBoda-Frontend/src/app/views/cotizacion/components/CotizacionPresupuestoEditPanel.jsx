import { useEffect, useState, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Paper, Button, Stack, TextField, MenuItem,
  Divider, CircularProgress, Chip, Table, TableHead, TableRow,
  TableCell, TableBody, Alert,
} from '@mui/material';

// Icons
import ArrowBackIcon            from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon        from '@mui/icons-material/PersonOutline';
import CategoryOutlinedIcon     from '@mui/icons-material/CategoryOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import AssignmentOutlinedIcon   from '@mui/icons-material/AssignmentOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import QrCode2Icon              from '@mui/icons-material/QrCode2';
import SaveOutlinedIcon         from '@mui/icons-material/SaveOutlined';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import VisibilityOutlinedIcon   from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongOutlinedIcon  from '@mui/icons-material/ReceiptLongOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import DescriptionOutlinedIcon  from '@mui/icons-material/DescriptionOutlined';

import {
  verPresupuesto, actualizarPresupuesto,
  fetchPresupuestoPdf, descargarPresupuestoPdf,
  fetchPresupuestoProformaPdf, descargarPresupuestoProformaPdf,
  fetchPresupuestoBoletaPdf, descargarPresupuestoBoletaPdf,
  fetchPresupuestoReciboPdf, descargarPresupuestoReciboPdf,
} from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';
import CotizacionPdfPreviewDialog from './CotizacionPdfPreviewDialog';
import CotizacionQrGestionDialog  from './CotizacionQrGestionDialog';

// ─── Styled ────────────────────────────────────────────────────────────────────
const Root = styled(Box)({
  display: 'flex',
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: '#f0f4f8',
});

const Sidebar = styled(Box)(({ theme }) => ({
  width: 220,
  minWidth: 220,
  backgroundColor: '#fff',
  borderRight: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(1.5),
  flexShrink: 0,
}));

const NavItem = styled(Box, { shouldForwardProp: (p) => p !== 'active' })(({ active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 16px',
  cursor: 'pointer',
  borderRadius: '0 10px 10px 0',
  marginRight: 12,
  marginBottom: 2,
  fontWeight: active ? 700 : 500,
  fontSize: '0.84rem',
  color: active ? '#004A99' : '#475569',
  backgroundColor: active ? 'rgba(0,74,153,0.08)' : 'transparent',
  borderLeft: active ? '3px solid #004A99' : '3px solid transparent',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: active ? 'rgba(0,74,153,0.08)' : '#f8fafc',
    color: active ? '#004A99' : '#1e293b',
  },
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2.5),
  overflowY: 'auto',
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
}));

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.88rem',
  color: '#1e293b',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

// ─── Config ────────────────────────────────────────────────────────────────────
const ESTADOS = [
  { value: 'pendiente',  label: 'Pendiente',  color: '#f59e0b' },
  { value: 'aprobada',   label: 'Aprobada',   color: '#10b981' },
  { value: 'rechazada',  label: 'Rechazada',  color: '#ef4444' },
  { value: 'pagada',     label: 'Pagada',     color: '#6366f1' },
  { value: 'cancelada',  label: 'Cancelada',  color: '#94a3b8' },
];

const SECTIONS = [
  { key: 'cliente',     label: 'Datos del cliente',   icon: PersonOutlineIcon },
  { key: 'proyecto',    label: 'Proyecto y módulos',  icon: CategoryOutlinedIcon },
  { key: 'financiero',  label: 'Financiero',          icon: MonetizationOnOutlinedIcon },
  { key: 'estado',      label: 'Estado',              icon: AssignmentOutlinedIcon },
  { key: 'documentos',  label: 'Documentos PDF',      icon: PictureAsPdfOutlinedIcon },
  { key: 'qr',          label: 'Acceso QR',           icon: QrCode2Icon },
];

const DOC_TYPES = [
  { key: 'cotizacion', label: 'Cotización',     icon: DescriptionOutlinedIcon,   color: '#004A99',
    fetch: fetchPresupuestoPdf,        download: descargarPresupuestoPdf,        prefix: 'cotizacion' },
  { key: 'proforma',   label: 'Proforma',       icon: RequestQuoteOutlinedIcon,  color: '#1d4ed8',
    fetch: fetchPresupuestoProformaPdf, download: descargarPresupuestoProformaPdf, prefix: 'proforma' },
  { key: 'boleta',     label: 'Boleta sin IGV', icon: ReceiptLongOutlinedIcon,   color: '#f97316',
    fetch: fetchPresupuestoBoletaPdf,  download: descargarPresupuestoBoletaPdf,  prefix: 'boleta' },
  { key: 'recibo',     label: 'Recibo térmico', icon: ReceiptLongOutlinedIcon,   color: '#7c3aed',
    fetch: fetchPresupuestoReciboPdf,  download: descargarPresupuestoReciboPdf,  prefix: 'recibo' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

function estadoChip(estado) {
  const e = ESTADOS.find((s) => s.value === estado) ?? { color: '#94a3b8', label: estado ?? '—' };
  return (
    <Chip
      label={e.label}
      size="small"
      sx={{ bgcolor: e.color + '1a', color: e.color, fontWeight: 700, fontSize: '0.75rem', borderRadius: '6px' }}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CotizacionPresupuestoEditPanel({ presupuesto: rowData, onBack, onUpdated }) {
  const id     = rowData?.id_presupuesto;
  const codigo = rowData?.codigo ?? '';

  const [section, setSection]   = useState('cliente');
  const [pres,    setPres]       = useState(null);
  const [loading, setLoading]    = useState(true);
  const [saving,  setSaving]     = useState(false);
  const [saved,   setSaved]      = useState(false);

  // form fields
  const [form, setForm] = useState({
    cliente_nombre: '',
    cliente_empresa: '',
    cliente_whatsapp: '',
    cliente_email: '',
    cliente_descripcion: '',
    estado: 'pendiente',
    descuento_monto: '',
    dias_entrega: '',
  });

  const [pdfPreview, setPdfPreview] = useState({ open: false, docType: 'cotizacion' });
  const [qrDialog,   setQrDialog]   = useState({ open: false });

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await verPresupuesto(id);
      setPres(data);
      setForm({
        cliente_nombre:      data.cliente_nombre      ?? '',
        cliente_empresa:     data.cliente_empresa      ?? '',
        cliente_whatsapp:    data.cliente_whatsapp     ?? '',
        cliente_email:       data.cliente_email        ?? '',
        cliente_descripcion: data.cliente_descripcion  ?? '',
        estado:              data.estado               ?? 'pendiente',
        descuento_monto:     data.descuento_monto != null ? String(data.descuento_monto) : '',
        dias_entrega:        data.dias_entrega         ?? '',
      });
    } catch (e) { handleErrorMessages('Error', e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        descuento_monto: form.descuento_monto !== '' ? Number(form.descuento_monto) : null,
      };
      const updated = await actualizarPresupuesto(id, payload);
      setPres(updated);
      setSaved(true);
      toastSuccess('Cambios guardados');
      onUpdated?.(updated);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { handleErrorMessages('Error al guardar', e); }
    finally { setSaving(false); }
  };

  const handleQrUpdated = (meta) => {
    setPres((prev) => prev ? { ...prev, qr_meta: meta } : prev);
    onUpdated?.({ ...pres, qr_meta: meta });
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress size={36} sx={{ color: '#004A99' }} />
      </Box>
    );
  }

  return (
    <Root>
      {/* ── SIDEBAR ── */}
      <Sidebar>
        {/* Header sidebar */}
        <Box sx={{ px: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={onBack}
            size="small"
            sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', px: 0 }}
          >
            Volver al listado
          </Button>
          <Box sx={{ mt: 1.5, p: 1.2, bgcolor: 'rgba(0,74,153,0.06)', borderRadius: 2 }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.2 }}>
              Cotización
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#004A99', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
              {codigo}
            </Typography>
            <Box sx={{ mt: 0.5 }}>{estadoChip(pres?.estado ?? form.estado)}</Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Nav items */}
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <NavItem key={s.key} active={section === s.key} onClick={() => setSection(s.key)}>
              <Icon sx={{ fontSize: 17, flexShrink: 0 }} />
              {s.label}
            </NavItem>
          );
        })}

        {/* Save button */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : saved ? <CheckCircleOutlineIcon /> : <SaveOutlinedIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: saved ? '#10b981' : '#004A99',
              fontWeight: 700,
              borderRadius: '10px',
              py: 1.2,
              fontSize: '0.82rem',
              boxShadow: '0 2px 8px rgba(0,74,153,0.25)',
              '&:hover': { bgcolor: saved ? '#059669' : '#003580' },
            }}
          >
            {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
          </Button>
        </Box>
      </Sidebar>

      {/* ── CONTENT ── */}
      <Content>
        {/* ── Sección: Datos del cliente ─────────────────────────────────── */}
        {section === 'cliente' && (
          <SectionCard>
            <SectionTitle>
              <PersonOutlineIcon sx={{ fontSize: 18, color: '#004A99' }} />
              Datos del cliente
            </SectionTitle>
            <Stack spacing={2}>
              <TextField
                label="Nombre completo"
                value={form.cliente_nombre}
                onChange={set('cliente_nombre')}
                fullWidth size="small"
                InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
              />
              <TextField
                label="Empresa / Organización"
                value={form.cliente_empresa}
                onChange={set('cliente_empresa')}
                fullWidth size="small"
                InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="WhatsApp"
                  value={form.cliente_whatsapp}
                  onChange={set('cliente_whatsapp')}
                  fullWidth size="small"
                  placeholder="+51 999 000 000"
                  InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
                />
                <TextField
                  label="Correo electrónico"
                  value={form.cliente_email}
                  onChange={set('cliente_email')}
                  fullWidth size="small"
                  type="email"
                  InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
                />
              </Stack>
              <TextField
                label="Descripción / Notas del cliente"
                value={form.cliente_descripcion}
                onChange={set('cliente_descripcion')}
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Información adicional del proyecto o requisitos especiales…"
                InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
              />
            </Stack>
          </SectionCard>
        )}

        {/* ── Sección: Proyecto & módulos ────────────────────────────────── */}
        {section === 'proyecto' && (
          <SectionCard>
            <SectionTitle>
              <CategoryOutlinedIcon sx={{ fontSize: 18, color: '#004A99' }} />
              Proyecto y módulos
            </SectionTitle>

            {/* Info del tipo */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mb: 0.3 }}>Tipo de proyecto</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>{pres?.tipo_titulo ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mb: 0.3 }}>Código</Typography>
                <Typography sx={{ fontWeight: 700, color: '#004A99', fontSize: '0.88rem', fontFamily: 'monospace' }}>{pres?.codigo ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mb: 0.3 }}>Origen</Typography>
                <Chip label={pres?.origen ?? '—'} size="small"
                  sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.70rem', borderRadius: '6px', textTransform: 'uppercase' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mb: 0.3 }}>Fecha registro</Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#475569' }}>{pres?.created_at?.slice?.(0, 10) ?? '—'}</Typography>
              </Box>
            </Box>

            {/* Días entrega editable */}
            <TextField
              label="Días de entrega"
              value={form.dias_entrega}
              onChange={set('dias_entrega')}
              size="small"
              sx={{ mb: 3, maxWidth: 260 }}
              placeholder="5 a 10 días hábiles"
              InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
            />

            {/* Módulos / Detalles */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.80rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
              Módulos incluidos
            </Typography>
            {pres?.detalles?.length > 0 ? (
              <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#f8fafc', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', py: '8px', px: '14px', borderBottom: '2px solid #e2e8f0' } }}>
                      <TableCell>Módulo / Descripción</TableCell>
                      <TableCell align="right">Precio unit.</TableCell>
                      <TableCell align="right">Cant.</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pres.detalles.map((d, i) => (
                      <TableRow key={i} sx={{ '&:last-child td': { border: 0 }, '& td': { py: '8px', px: '14px', fontSize: '0.83rem', color: '#334155' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{d.descripcion}</TableCell>
                        <TableCell align="right">S/ {fmt(d.precio_unitario)}</TableCell>
                        <TableCell align="right">{d.cantidad ?? 1}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>S/ {fmt(d.precio_total ?? d.precio_unitario)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Alert severity="info" sx={{ fontSize: '0.82rem' }}>Sin módulos registrados en este presupuesto.</Alert>
            )}
          </SectionCard>
        )}

        {/* ── Sección: Financiero ────────────────────────────────────────── */}
        {section === 'financiero' && (
          <SectionCard>
            <SectionTitle>
              <MonetizationOnOutlinedIcon sx={{ fontSize: 18, color: '#004A99' }} />
              Financiero
            </SectionTitle>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Subtotal</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e293b' }}>
                  S/ {fmt(pres?.subtotal)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #fed7aa' }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Descuento</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#f97316' }}>
                  S/ {fmt(pres?.descuento_monto)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, background: 'linear-gradient(135deg, #004A99, #0062cc)', borderRadius: 2 }}>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>Total</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>
                  S/ {fmt(pres?.total)}
                </Typography>
              </Box>
            </Stack>

            <TextField
              label="Descuento (monto S/)"
              value={form.descuento_monto}
              onChange={set('descuento_monto')}
              type="number"
              size="small"
              sx={{ maxWidth: 260 }}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="El total se recalcula automáticamente en el PDF"
              InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
            />
          </SectionCard>
        )}

        {/* ── Sección: Estado ────────────────────────────────────────────── */}
        {section === 'estado' && (
          <SectionCard>
            <SectionTitle>
              <AssignmentOutlinedIcon sx={{ fontSize: 18, color: '#004A99' }} />
              Estado de la cotización
            </SectionTitle>

            <TextField
              select
              label="Estado"
              value={form.estado}
              onChange={set('estado')}
              size="small"
              sx={{ minWidth: 240, mb: 3 }}
              InputLabelProps={{ sx: { fontSize: '0.84rem' } }}
            >
              {ESTADOS.map((e) => (
                <MenuItem key={e.value} value={e.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: e.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>{e.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Resumen info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Código',      value: pres?.codigo },
                { label: 'Tipo',        value: pres?.tipo_titulo },
                { label: 'Cliente',     value: pres?.cliente_nombre },
                { label: 'Empresa',     value: pres?.cliente_empresa || '—' },
                { label: 'Total',       value: `S/ ${fmt(pres?.total)}` },
                { label: 'Origen',      value: pres?.origen },
                { label: 'Registrado',  value: pres?.created_at?.slice?.(0, 10) },
              ].map((row) => (
                <Box key={row.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 0.75, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography sx={{ fontSize: '0.80rem', color: '#94a3b8', fontWeight: 600, minWidth: 110, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {row.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 500 }}>
                    {row.value ?? '—'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </SectionCard>
        )}

        {/* ── Sección: Documentos PDF ────────────────────────────────────── */}
        {section === 'documentos' && (
          <SectionCard>
            <SectionTitle>
              <PictureAsPdfOutlinedIcon sx={{ fontSize: 18, color: '#004A99' }} />
              Documentos PDF
            </SectionTitle>

            <Stack spacing={2}>
              {DOC_TYPES.map((doc) => {
                const Icon = doc.icon;
                return (
                  <Box
                    key={doc.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: doc.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon sx={{ fontSize: 20, color: doc.color }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{doc.label}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {doc.key === 'recibo' ? 'Formato térmico 100mm' : 'Formato A4'}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                        onClick={() => setPdfPreview({ open: true, docType: doc.key })}
                        sx={{ borderColor: doc.color, color: doc.color, fontWeight: 600, fontSize: '0.76rem',
                          '&:hover': { borderColor: doc.color, bgcolor: doc.color + '0d' } }}
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
                        onClick={() => doc.download(id, pres?.codigo)}
                        sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.76rem' }}
                      >
                        Descargar
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>
        )}

        {/* ── Sección: Acceso QR ─────────────────────────────────────────── */}
        {section === 'qr' && (
          <SectionCard>
            <SectionTitle>
              <QrCode2Icon sx={{ fontSize: 18, color: '#004A99' }} />
              Acceso QR
            </SectionTitle>

            {pres?.qr_meta ? (
              <>
                {/* Estado QR */}
                {(() => {
                  const qr = pres.qr_meta;
                  const estadoMap = {
                    vigente:  { bg: '#dcfce7', color: '#15803d', label: 'Vigente' },
                    renovado: { bg: '#dbeafe', color: '#1d4ed8', label: 'Renovado' },
                    vencido:  { bg: '#fef3c7', color: '#b45309', label: 'Vencido' },
                    revocado: { bg: '#fee2e2', color: '#b91c1c', label: 'Revocado' },
                    perdido:  { bg: '#f1f5f9', color: '#64748b', label: 'Perdido' },
                  };
                  const est = estadoMap[qr.qr_estado_efectivo] ?? estadoMap.vigente;
                  return (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                          label={est.label}
                          size="small"
                          sx={{ bgcolor: est.bg, color: est.color, fontWeight: 700, fontSize: '0.80rem', borderRadius: '8px' }}
                        />
                        {qr.dias_restantes != null && (
                          <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {qr.dias_restantes > 0 ? `${qr.dias_restantes} días restantes` : 'Vencido'}
                          </Typography>
                        )}
                      </Box>
                      {[
                        { label: 'Vence el',      value: qr.vigencia_fin_fmt?.slice?.(0, 10) ?? '—' },
                        { label: 'Escaneos',      value: qr.qr_escaneos ?? 0 },
                        { label: 'Último acceso', value: qr.qr_ultimo_escaneo_at?.slice?.(0, 16)?.replace('T', ' ') ?? '—' },
                      ].map((row) => (
                        <Box key={row.label} sx={{ display: 'flex', gap: 2, py: 0.75, borderBottom: '1px solid #f1f5f9' }}>
                          <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, minWidth: 120, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {row.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.84rem', color: '#1e293b' }}>{row.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })()}

                <Button
                  variant="contained"
                  startIcon={<QrCode2Icon />}
                  onClick={() => setQrDialog({ open: true })}
                  sx={{ bgcolor: '#0d9488', fontWeight: 700, borderRadius: '10px',
                    '&:hover': { bgcolor: '#0f766e' } }}
                >
                  Gestionar QR (renovar / revocar)
                </Button>
              </>
            ) : (
              <Alert severity="warning">No hay datos QR disponibles para este presupuesto.</Alert>
            )}
          </SectionCard>
        )}
      </Content>

      {/* ── Dialogs ── */}
      <CotizacionPdfPreviewDialog
        open={pdfPreview.open}
        docType={pdfPreview.docType}
        presupuesto={pres}
        onClose={() => setPdfPreview({ open: false, docType: 'cotizacion' })}
      />

      <CotizacionQrGestionDialog
        open={qrDialog.open}
        row={pres}
        onClose={() => setQrDialog({ open: false })}
        onUpdated={handleQrUpdated}
      />
    </Root>
  );
}
