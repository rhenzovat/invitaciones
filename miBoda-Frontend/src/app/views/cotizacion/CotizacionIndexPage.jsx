import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Stack, Avatar, Checkbox, Tooltip, CircularProgress,
} from '@mui/material';
import AddIcon            from '@mui/icons-material/Add';
import ReceiptLongIcon    from '@mui/icons-material/ReceiptLong';
import RequestQuoteIcon   from '@mui/icons-material/RequestQuote';
import CategoryIcon       from '@mui/icons-material/Category';
import OpenInNewIcon      from '@mui/icons-material/OpenInNew';
import TrendingUpIcon     from '@mui/icons-material/TrendingUp';
import AssignmentIcon     from '@mui/icons-material/Assignment';
import DeleteSweepIcon    from '@mui/icons-material/DeleteSweep';
import CloseIcon          from '@mui/icons-material/Close';

import { listarPresupuestos, eliminarPresupuesto } from '../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';
import CotizacionWizardPage      from './CotizacionWizardPage';
import CotizacionCatalogoPage    from './CotizacionCatalogoPage';
import CotizacionPdfPreviewDialog from './components/CotizacionPdfPreviewDialog';
import CotizacionPresupuestoAcciones from './components/CotizacionPresupuestoAcciones';
import CotizacionQrGestionDialog from './components/CotizacionQrGestionDialog';
import CotizacionPdfCanvasEditor from './components/CotizacionPdfCanvasEditor';
import ProformaPdfCanvasEditor   from './components/ProformaPdfCanvasEditor';
import ContratoPdfCanvasEditor   from './components/ContratoPdfCanvasEditor';

// ─── Styled ───────────────────────────────────────────────────────────────────
const PageRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f0f4f8',
});

const HeroCard = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(0),
  borderRadius: 0,
  background: 'linear-gradient(135deg, #004A99 0%, #0062cc 60%, #003580 100%)',
  color: '#fff',
  padding: theme.spacing(2.5, 3),
  boxShadow: '0 4px 24px rgba(0,74,153,0.25)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -40,
    right: 120,
    width: 130,
    height: 130,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
  },
}));

const KpiBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '12px',
  padding: theme.spacing(1.2, 2),
  minWidth: 120,
  backdropFilter: 'blur(4px)',
}));

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-root': { minHeight: 44 },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: '#004A99',
  },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.88rem',
  minHeight: 48,
  color: '#64748b',
  gap: 6,
  '&.Mui-selected': { color: '#004A99' },
});

const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-root': {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e2e8f0',
    padding: '10px 14px',
  },
});

const StyledTableRow = styled(TableRow)({
  '&:last-child td': { border: 0 },
  '& td': { padding: '10px 14px', fontSize: '0.84rem', color: '#334155' },
  '&:hover': { backgroundColor: '#f8faff' },
  transition: 'background 0.15s',
});

const CodigoChip = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  background: 'rgba(0,74,153,0.07)',
  color: '#004A99',
  borderRadius: '6px',
  padding: '2px 8px',
  fontSize: '0.78rem',
  fontWeight: 700,
  fontFamily: 'monospace',
  letterSpacing: '0.02em',
});

const EmptyState = () => (
  <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
    <AssignmentIcon sx={{ fontSize: 56, mb: 1.5, opacity: 0.35 }} />
    <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5, color: '#64748b' }}>
      Sin cotizaciones aún
    </Typography>
    <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
      Crea la primera con el botón "Nueva cotización"
    </Typography>
  </Box>
);

const origenColor = (o = '') => {
  const m = { admin: { bg: '#dbeafe', color: '#1d4ed8' }, web: { bg: '#dcfce7', color: '#15803d' }, api: { bg: '#fef9c3', color: '#854d0e' } };
  return m[o.toLowerCase()] ?? { bg: '#f1f5f9', color: '#475569' };
};

// ─────────────────────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { label: 'Presupuestos', icon: <ReceiptLongIcon sx={{ fontSize: 16 }} /> },
  { label: 'Nueva cotización', icon: <RequestQuoteIcon sx={{ fontSize: 16 }} /> },
  { label: 'Catálogo y precios', icon: <CategoryIcon sx={{ fontSize: 16 }} /> },
];

export default function CotizacionIndexPage() {
  const [tab,        setTab]        = useState(0);
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pdfPreview, setPdfPreview] = useState({ open: false, row: null });
  const [qrDialog,   setQrDialog]   = useState({ open: false, row: null });
  const [editRow,         setEditRow]         = useState(null);  // canvas cotización
  const [editIsNew,       setEditIsNew]       = useState(false);
  const [editProformaRow, setEditProformaRow] = useState(null); // canvas proforma
  const [editContratoRow, setEditContratoRow] = useState(null); // canvas contrato

  // ── Selección múltiple ───────────────────────────────────────────────────
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const allIds       = rows.map((r) => r.id_presupuesto);
  const allChecked   = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someChecked  = allIds.some((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`¿Eliminar ${count} cotización${count !== 1 ? 'es' : ''} seleccionada${count !== 1 ? 's' : ''}?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => eliminarPresupuesto(id)));
      toastSuccess(`${count} cotización${count !== 1 ? 'es eliminadas' : ' eliminada'}`);
      clearSelection();
      load();
    } catch (e) {
      handleErrorMessages('Error al eliminar', e);
    } finally {
      setBulkDeleting(false);
    }
  };

  const QR_ESTADO_STYLE = {
    vigente: { bg: '#dcfce7', color: '#15803d', label: 'Vigente' },
    renovado: { bg: '#dbeafe', color: '#1d4ed8', label: 'Renovado' },
    vencido: { bg: '#fef3c7', color: '#b45309', label: 'Vencido' },
    revocado: { bg: '#fee2e2', color: '#b91c1c', label: 'Revocado' },
    perdido: { bg: '#f1f5f9', color: '#64748b', label: 'Perdido' },
  };

  const load = async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try { setRows(await listarPresupuestos()); }
    catch (e) { handleErrorMessages('Cotizaciones', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tab === 0) load(); }, [tab]);

  const openPreview = (row, docType) => setPdfPreview({ open: true, row, docType });

  const openWhatsApp = (url) => {
    window.open(url, 'royalsensorymassage_wa');
  };

  const handleSendActividades = (row) => {
    const raw = row?.cliente_whatsapp || row?.whatsapp || '51970048451';
    const phone = String(raw).replace(/\D/g, '');
    const pdfUrl = `${window.location.origin}/template/${encodeURIComponent('Gantt_Cronograma.pdf')}`;
    const codigo = row?.codigo ?? '';
    const text = `Hola, te comparto el cronograma de actividades para iniciar el proyecto (${codigo}).\n\nDescargar PDF: ${pdfUrl}`;
    openWhatsApp(`https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`);
  };

  const handleEditUpdated = (updated) => {
    setRows((prev) => prev.map((r) =>
      r.id_presupuesto === updated.id_presupuesto ? { ...r, ...updated } : r
    ));
  };

  const handleQrUpdated = (meta) => {
    if (!qrDialog.row) return;
    setRows((prev) => prev.map((r) => (
      r.id_presupuesto === qrDialog.row.id_presupuesto ? { ...r, qr_meta: meta } : r
    )));
    setQrDialog((d) => ({ ...d, row: d.row ? { ...d.row, qr_meta: meta } : null }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta cotización?')) return;
    try { await eliminarPresupuesto(id); toastSuccess('Eliminado'); load(); }
    catch (e) { handleErrorMessages('Error', e); }
  };

  const valorTotal = rows.reduce((s, r) => s + Number(r.total || 0), 0);
  const esteMes   = rows.filter((r) => r.created_at?.slice?.(0, 7) === new Date().toISOString().slice(0, 7)).length;

  // ── Panel canvas cotización ───────────────────────────────────────────────
  if (editRow) {
    return (
      <PageRoot>
        <CotizacionPdfCanvasEditor
          presupuesto={editRow}
          isNew={editIsNew}
          onBack={() => { setEditRow(null); setEditIsNew(false); setTab(0); load(); }}
          onUpdated={handleEditUpdated}
        />
      </PageRoot>
    );
  }

  // ── Panel canvas proforma ─────────────────────────────────────────────────
  if (editProformaRow) {
    return (
      <PageRoot>
        <ProformaPdfCanvasEditor
          presupuesto={editProformaRow}
          onBack={() => { setEditProformaRow(null); setTab(0); load(); }}
          onUpdated={handleEditUpdated}
        />
      </PageRoot>
    );
  }

  // ── Panel canvas contrato ─────────────────────────────────────────────────
  if (editContratoRow) {
    return (
      <PageRoot>
        <ContratoPdfCanvasEditor
          presupuesto={editContratoRow}
          onBack={() => { setEditContratoRow(null); setTab(0); load(); }}
          onUpdated={handleEditUpdated}
        />
      </PageRoot>
    );
  }

  return (
    <PageRoot>
      {/* ══ Hero ══════════════════════════════════════════════════════════════ */}
      <HeroCard elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 50, height: 50, bgcolor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}>
              <RequestQuoteIcon sx={{ fontSize: 26 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Cotizador Web Inteligente
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.78rem' }}>
                Presupuestos · Catálogo · Lienzo interactivo · PDF profesional
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <KpiBox>
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', display: 'block', mb: 0.2 }}>TOTAL COTIZACIONES</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{rows.length}</Typography>
            </KpiBox>
            <KpiBox>
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', display: 'block', mb: 0.2 }}>ESTE MES</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{esteMes}</Typography>
                <TrendingUpIcon sx={{ fontSize: 14, opacity: 0.7 }} />
              </Box>
            </KpiBox>
            <KpiBox>
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', display: 'block', mb: 0.2 }}>VALOR TOTAL</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
                S/ {Math.round(valorTotal).toLocaleString('es-PE')}
              </Typography>
            </KpiBox>
            <Button
              variant="outlined"
              size="small"
              href="/cotizador"
              target="_blank"
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', fontWeight: 600, fontSize: '0.78rem',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Ver público
            </Button>
          </Stack>
        </Box>
      </HeroCard>

      {/* ══ Tabs ══════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ borderRadius: 0, borderBottom: '1px solid #e2e8f0', bgcolor: '#fff' }}>
        <Box sx={{ px: 2 }}>
          <StyledTabs value={tab} onChange={(_, v) => setTab(v)}>
            {TAB_CONFIG.map((t, i) => (
              <StyledTab key={i} label={t.label} icon={t.icon} iconPosition="start" />
            ))}
          </StyledTabs>
        </Box>
      </Paper>

      {/* ══ Content ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ p: 2 }}>

        {/* Tab 0 — Presupuestos */}
        {tab === 0 && (
          <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* ── Barra superior ── */}
            <Box sx={{ px: 2.5, py: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9', minHeight: 60, gap: 1.5 }}>

              {/* Izquierda: contador o barra de selección */}
              {selectedIds.size > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    bgcolor: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)',
                    borderRadius: '8px', px: 1.5, py: 0.6,
                  }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#dc2626', fontSize: '0.82rem' }}>
                      {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={bulkDeleting
                      ? <CircularProgress size={14} color="inherit" />
                      : <DeleteSweepIcon sx={{ fontSize: 17 }} />}
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    sx={{
                      bgcolor: '#dc2626', fontWeight: 700, fontSize: '0.80rem', borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                      '&:hover': { bgcolor: '#b91c1c' },
                    }}
                  >
                    {bulkDeleting ? 'Eliminando…' : `Eliminar ${selectedIds.size}`}
                  </Button>
                  <Tooltip title="Cancelar selección">
                    <Button size="small" onClick={clearSelection}
                      sx={{ minWidth: 32, p: 0.5, color: '#64748b', '&:hover': { color: '#dc2626' } }}>
                      <CloseIcon sx={{ fontSize: 17 }} />
                    </Button>
                  </Tooltip>
                </Box>
              ) : (
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1e293b' }}>
                  {loading ? 'Cargando…' : `${rows.length} cotización${rows.length !== 1 ? 'es' : ''} registrada${rows.length !== 1 ? 's' : ''}`}
                </Typography>
              )}

              {/* Derecha: botón nueva cotización */}
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setTab(1)}
                sx={{ bgcolor: '#004A99', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,74,153,0.3)', '&:hover': { bgcolor: '#003580' } }}
              >
                Nueva cotización
              </Button>
            </Box>

            {!loading && rows.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 44 }}>
                      <Checkbox
                        size="small"
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={toggleAll}
                        sx={{
                          color: 'rgba(0,74,153,0.35)',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#004A99' },
                        }}
                      />
                    </TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Proyecto</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>QR</TableCell>
                    <TableCell>Vence</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {loading && (
                    <TableRow><TableCell colSpan={10} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>Cargando cotizaciones…</TableCell></TableRow>
                  )}
                  {rows.map((r) => {
                    const oc  = origenColor(r.origen);
                    const qr  = r.qr_meta ?? {};
                    const qst = QR_ESTADO_STYLE[qr.qr_estado_efectivo] ?? QR_ESTADO_STYLE.vigente;
                    const sel = selectedIds.has(r.id_presupuesto);
                    return (
                      <StyledTableRow
                        key={r.id_presupuesto}
                        sx={{
                          bgcolor: sel ? 'rgba(239,68,68,0.04) !important' : undefined,
                          '& td': { borderLeft: sel ? '3px solid #dc2626' : '3px solid transparent' },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={sel}
                            onChange={() => toggleRow(r.id_presupuesto)}
                            sx={{
                              color: 'rgba(100,116,139,0.4)',
                              '&.Mui-checked': { color: '#dc2626' },
                            }}
                          />
                        </TableCell>
                        <TableCell><CodigoChip>{r.codigo}</CodigoChip></TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b', fontSize: '0.84rem' }}>
                            {r.cliente_nombre}
                          </Typography>
                          {r.cliente_empresa && (
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>{r.cliente_empresa}</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.tipo_titulo}
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#f97316' }}>
                            S/ {Number(r.total).toLocaleString('es-PE')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', px: 1, py: 0.3, borderRadius: '6px',
                            bgcolor: qst.bg, color: qst.color, fontSize: '0.68rem', fontWeight: 700 }}>
                            {qst.label}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {qr.vigencia_fin_fmt?.slice?.(0, 10) ?? '—'}
                          {qr.dias_restantes != null && qr.dias_restantes > 0 && (
                            <Typography component="span" variant="caption" sx={{ display: 'block', color: '#94a3b8' }}>
                              {qr.dias_restantes}d
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', px: 1, py: 0.3, borderRadius: '6px',
                            bgcolor: oc.bg, color: oc.color, fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {r.origen}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', fontSize: '0.80rem' }}>
                          {r.created_at?.slice?.(0, 10) ?? ''}
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 120 }}>
                          <CotizacionPresupuestoAcciones
                            row={r}
                            onPreview={openPreview}
                            onDelete={handleDelete}
                            onQrManage={(row) => setQrDialog({ open: true, row })}
                            onEdit={(row) => { setEditIsNew(false); setEditRow(row); }}
                            onEditProforma={(row) => setEditProformaRow(row)}
                            onEditContrato={(row) => setEditContratoRow(row)}
                            onSendActividades={handleSendActividades}
                          />
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}

        {tab === 1 && (
          <CotizacionWizardPage
            onCreated={() => load()}
            onEditProforma={(pres) => {
              load();             // refresca el listado en background
              setEditIsNew(true); // banner "recién creada"
              setEditRow(pres);   // abre canvas editor de proforma
            }}
          />
        )}
        {tab === 2 && <CotizacionCatalogoPage />}
      </Box>

      <CotizacionPdfPreviewDialog
        open={pdfPreview.open}
        presupuesto={pdfPreview.row}
        docType={pdfPreview.docType || 'cotizacion'}
        onClose={() => setPdfPreview({ open: false, row: null, docType: 'cotizacion' })}
      />

      <CotizacionQrGestionDialog
        open={qrDialog.open}
        row={qrDialog.row}
        onClose={() => setQrDialog({ open: false, row: null })}
        onUpdated={handleQrUpdated}
      />
    </PageRoot>
  );
}
