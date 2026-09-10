import { useEffect, useMemo, useRef, useState } from 'react';
import { styled } from "@mui/material/styles";
import {
  Box, Paper, Grid, Typography, Button, Alert, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Divider, IconButton, CircularProgress, Chip,
} from '@mui/material';
import AddCircleIcon      from "@mui/icons-material/AddCircle";
import EditIcon            from "@mui/icons-material/Edit";
import CloseIcon           from "@mui/icons-material/Close";
import CategoryIcon        from "@mui/icons-material/Category";
import ExtensionIcon       from "@mui/icons-material/Extension";
import SaveIcon            from "@mui/icons-material/Save";
import PictureAsPdfIcon    from "@mui/icons-material/PictureAsPdf";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import ExpandMoreIcon      from "@mui/icons-material/ExpandMore";
import ExpandLessIcon      from "@mui/icons-material/ExpandLess";
import CotizacionPdfCanvasEditor from './components/CotizacionPdfCanvasEditor';

import {
  listarConfig, guardarConfig, listarTipos, guardarTipo,
  listarModulosCatalogo, guardarModuloCatalogo,
  reordenarTipos, reordenarModulosCatalogo,
  eliminarTipo, eliminarModuloCatalogo,
} from '../../api/cotizacion.api';
import CotizacionCatalogoOrdenCanvas from './components/CotizacionCatalogoOrdenCanvas';
import CotizacionTipoCard from './components/CotizacionTipoCard';
import { CotizacionIcon } from './components/CotizacionIcon';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';
import { WithLoandingPanel } from '../../utils/withLoandingPanel';
import CotizacionTipoCmsPanel   from './CotizacionTipoCmsPanel';
import CotizacionModuloCmsPanel from './CotizacionModuloCmsPanel';
import CotizacionInfoBloqueCmsPanel from './CotizacionInfoBloqueCmsPanel';
import CotizacionExtrasInfoGrid from './components/CotizacionExtrasInfoGrid';
import { buildPreviewInfoBloques } from './utils/cotizacionInfoBloques';
import { normalizeCotizacionIconInput } from '../../utils/cotizacionIcon';
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
// eslint-disable-next-line no-unused-vars
const _unusedHostingCard = null; // HostingDetallesCard, FilasKvEditor, FilasListaEditor eliminados

// ─── Layout ──────────────────────────────────────────────────────────────────
const PageBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  marginBottom: theme.spacing(2),
  borderRadius: "12px",
  background: "linear-gradient(135deg, #004A99 0%, #003580 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  boxShadow: "0 6px 25px rgba(0,74,153,0.30)",
}));

const SectionLabel = styled(Typography)({
  fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#64748b", marginBottom: 8,
});

const ConfigCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
}));

// ─── Modulo card ──────────────────────────────────────────────────────────────
const ModuloCardPreview = ({ modulo, onEdit, isActive }) => (
  <Box
    onClick={() => onEdit(modulo)}
    sx={{
      border: isActive ? "2px solid #004A99" : "1px solid #e5e7eb",
      borderRadius: 3, p: 2,
      background: "#fff",
      height: "100%", cursor: "pointer", position: "relative",
      transition: "all 0.2s ease",
      "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.10)", transform: "translateY(-2px)" },
      "&:hover .edit-fab": { opacity: 1 },
    }}
  >
    <Box className="edit-fab" sx={{
      position: "absolute", top: 8, left: 8,
      opacity: isActive ? 1 : 0, transition: "opacity 0.2s",
      bgcolor: "#004A99", color: "#fff",
      width: 24, height: 24, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 1,
    }}>
      <EditIcon sx={{ fontSize: 13 }} />
    </Box>

    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, pl: 4, pr: 5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <CotizacionIcon icon={modulo.icono || modulo.icon} fontSize="1.1rem" color="#004A99" />
      {modulo.nombre}
    </Typography>

    {modulo.categoria && (
      <Typography variant="caption" sx={{
        display: "inline-block", mb: 0.8, px: 1, py: 0.2,
        bgcolor: "rgba(0,74,153,0.08)", color: "#004A99",
        borderRadius: 4, fontSize: "0.65rem", fontWeight: 600,
      }}>
        {modulo.categoria}
      </Typography>
    )}

    {modulo.descripcion && (
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", lineHeight: 1.4, mb: 1 }}>
        {modulo.descripcion}
      </Typography>
    )}

    <Typography component="span" sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#004A99" }}>
      S/ {parseFloat(modulo.precio || 0).toFixed(0)}
    </Typography>
  </Box>
);

// ─── Add card ─────────────────────────────────────────────────────────────────
const AddCard = ({ onClick, label }) => (
  <Box onClick={onClick} sx={{
    border: "2px dashed #cbd5e1", borderRadius: 3, p: 2.5,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    minHeight: 150, cursor: "pointer", transition: "all 0.2s",
    "&:hover": { borderColor: "#004A99", bgcolor: "rgba(0,74,153,0.04)" },
  }}>
    <AddCircleIcon sx={{ fontSize: 32, color: "#cbd5e1", mb: 0.8 }} />
    <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
  </Box>
);

// ─── ModulosAgrupados ─────────────────────────────────────────────────────────
function GrupoModulos({ grupo, panelOpen, panelMode, panelData, isNew, reorderBusy, onReorder, onEdit }) {
  const [open, setOpen] = useState(false);
  const { key, mods, tipo } = grupo;
  const label = key === '__sin_categoria__' ? 'Sin categoría' : key;
  const activeCount = mods.filter((m) =>
    panelOpen && panelMode === "modulo" && !isNew && panelData?.id_modulo === m.id_modulo
  ).length;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Header del grupo */}
      <Box onClick={() => setOpen((v) => !v)} sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.5, py: 0.8,
        bgcolor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0',
        cursor: 'pointer', userSelect: 'none', mb: open ? 1.5 : 0,
        '&:hover': { bgcolor: '#e8edf5' },
      }}>
        {tipo?.icon && <CotizacionIcon icon={tipo.icon} fontSize="1rem" color="#004A99" />}
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#004A99', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
          {label}
        </Typography>
        <Chip label={mods.length} size="small"
          sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(0,74,153,0.1)', color: '#004A99' }} />
        {activeCount > 0 && (
          <Chip label={activeCount + ' editando'} size="small"
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(249,115,22,0.12)', color: '#f97316' }} />
        )}
        {open ? <ExpandLessIcon sx={{ fontSize: 16, color: '#94a3b8' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#94a3b8' }} />}
      </Box>

      <Collapse in={open}>
        <CotizacionCatalogoOrdenCanvas
          items={mods}
          idKey="id_modulo"
          saving={reorderBusy}
          onReorder={onReorder}
          hint={`Arrastra los módulos de "${label}" para reordenarlos`}
          renderCard={(m) => (
            <ModuloCardPreview
              modulo={m}
              onEdit={onEdit}
              isActive={panelOpen && panelMode === "modulo" && !isNew && panelData?.id_modulo === m.id_modulo}
            />
          )}
        />
      </Collapse>
    </Box>
  );
}

function ModulosAgrupados({ grupos, panelOpen, panelMode, panelData, isNew, reorderBusy, onReorder, onEdit, onNew }) {
  return (
    <>
      <SectionLabel>
        Módulos adicionales — agrupados por tipo de proyecto · Arrastra para reordenar · Clic para editar
      </SectionLabel>
      {grupos.map((grupo) => (
        <GrupoModulos
          key={grupo.key}
          grupo={grupo}
          panelOpen={panelOpen}
          panelMode={panelMode}
          panelData={panelData}
          isNew={isNew}
          reorderBusy={reorderBusy}
          onReorder={onReorder}
          onEdit={onEdit}
        />
      ))}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AddCard onClick={onNew} label="Nuevo módulo" />
        </Grid>
      </Grid>
    </>
  );
}

// ─── Empty tipos & modulos defaults ──────────────────────────────────────────
const EMPTY_TIPO = {
  icono: "", slug: "", titulo: "", descripcion: "",
  subtexto_emocional: "", frase_destacada: "", badge_etiqueta: "", texto_boton: "",
  precio_base: "", tiempo_entrega: "", requiere_modulos: "N",
  caracteristicas: [],
};

const EMPTY_MODULO = {
  icono: "", slug: "", nombre: "", descripcion: "",
  precio: "", categoria: "",
};

const upsertCatalogItem = (list, item, idKey) => {
  if (!item?.[idKey]) {
    return [...list, item];
  }
  const idx = list.findIndex((row) => row[idKey] === item[idKey]);
  if (idx < 0) {
    return [...list, item];
  }
  const next = [...list];
  next[idx] = { ...next[idx], ...item };
  return next;
};

const buildModuloPayload = (datos) => ({
  id_modulo: datos.id_modulo || null,
  slug: String(datos.slug ?? '').trim(),
  nombre: String(datos.nombre ?? '').trim(),
  icono: normalizeCotizacionIconInput(datos.icono ?? datos.icon),
  descripcion: datos.descripcion ?? '',
  precio: parseFloat(datos.precio) || 0,
  categoria: String(datos.categoria ?? '').trim(),
  orden: datos.orden,
  Activo: datos.Activo ?? 'S',
});

const buildTipoPayload = (datos) => {
  const car = Array.isArray(datos.caracteristicas) ? datos.caracteristicas : [];
  const funcs = Array.isArray(datos.funcionalidades) ? datos.funcionalidades : [];
  const icono = normalizeCotizacionIconInput(datos.icono ?? datos.icon);
  const tiempoEntrega = String(datos.tiempo_entrega ?? datos.dias_entrega ?? '').trim();

  return {
    id_tipo: datos.id_tipo ?? null,
    slug: datos.slug ?? '',
    titulo: datos.titulo ?? '',
    descripcion: datos.descripcion ?? '',
    subtexto_emocional: datos.subtexto_emocional ?? '',
    frase_destacada: datos.frase_destacada ?? '',
    badge_etiqueta: datos.badge_etiqueta ?? '',
    texto_boton: datos.texto_boton ?? '',
    nota_custom: datos.nota_custom ?? '',
    precio_base: parseFloat(datos.precio_base) || 0,
    tiempo_entrega: tiempoEntrega,
    icono,
    requiere_modulos: datos.requiere_modulos ?? 'N',
    orden: datos.orden,
    Activo: datos.Activo ?? 'S',
    caracteristicas: car.map((s) => String(s).trim()).filter(Boolean),
    funcionalidades: funcs,
  };
};

// ─── HostingDetallesCard ──────────────────────────────────────────────────────
const DEFAULT_HOSTING = [
  { label: 'Hosting',          valor: 'Plan profesional — 10 GB SSD' },
  { label: 'Dominio',          valor: '1 año gratis (.com o .pe)' },
  { label: 'SSL / HTTPS',      valor: 'Certificado gratuito incluido' },
  { label: 'Correos corp.',    valor: '10 cuentas incluidas' },
  { label: 'Renovación anual', valor: 'S/ 130 / año (referencial)' },
];

function HostingDetallesCard({ detalles, onSave }) {
  const [rows, setRows] = useState(() =>
    Array.isArray(detalles) && detalles.length > 0 ? detalles : DEFAULT_HOSTING
  );
  const [saving, setSaving] = useState(false);

  // Sync si llega del servidor después de load
  useEffect(() => {
    if (Array.isArray(detalles) && detalles.length > 0) setRows(detalles);
  }, [detalles]);

  const setField = (i, key, val) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));

  const addRow = () => setRows((prev) => [...prev, { label: '', valor: '' }]);

  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(rows.filter((r) => r.label.trim())); }
    finally { setSaving(false); }
  };

  return (
    <ConfigCard elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#334155' }}>
            🏠 Hosting incluido — filas del PDF
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Estas filas aparecen en la sección "HOSTING INCLUIDO" de la cotización PDF. Edita, agrega o elimina.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<AddCircleIcon />} onClick={addRow}
            sx={{ color: '#004A99', fontWeight: 600, fontSize: '0.78rem' }}>
            Agregar fila
          </Button>
          <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#004A99', fontWeight: 700, fontSize: '0.78rem', '&:hover': { bgcolor: '#003580' } }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </Stack>
      </Box>

      <Stack spacing={1}>
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Etiqueta (ej: Hosting)"
              value={row.label}
              onChange={(e) => setField(i, 'label', e.target.value)}
              sx={{ width: 200, flexShrink: 0 }}
              InputProps={{ sx: { fontSize: '0.83rem' } }}
            />
            <TextField
              size="small"
              placeholder="Valor (ej: Plan profesional — 10 GB SSD)"
              value={row.valor}
              onChange={(e) => setField(i, 'valor', e.target.value)}
              fullWidth
              InputProps={{ sx: { fontSize: '0.83rem' } }}
            />
            <IconButton size="small" onClick={() => removeRow(i)}
              sx={{ color: '#ef4444', flexShrink: 0, '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </ConfigCard>
  );
}

// ─── Reutilizable: editor de filas clave→valor ────────────────────────────────
const DEFAULT_TECNOLOGIAS = [
  { label: 'Frontend',        valor: 'React 18+ · HTML5 · CSS3 · Bootstrap' },
  { label: 'Backend',         valor: 'PHP 8 · Laravel 10+' },
  { label: 'Base de datos',   valor: 'MySQL 8 / MariaDB' },
  { label: 'Servidor web',    valor: 'LiteSpeed + LSCache' },
  { label: 'SEO & Analytics', valor: 'GA4 + Search Console' },
  { label: 'Seguridad',       valor: 'Imunify360 + SSL gratuito' },
];

const DEFAULT_CONDICIONES = [
  { label: 'Validez',             valor: '5 días desde la fecha de emisión' },
  { label: 'Revisiones',          valor: '2 rondas sin costo adicional' },
  { label: 'Cambios extra',       valor: 'S/ 30 / hora' },
  { label: 'Soporte post-entrega',valor: '15 días por bugs del sistema' },
  { label: 'Contenido',           valor: 'Textos, imágenes y logo — a cargo del cliente' },
  { label: 'Privacidad',          valor: 'Datos confidenciales, solo uso interno' },
];

const DEFAULT_WEB_PAGINAS = [
  'Home / Inicio: presentación, banner principal y llamado a la acción',
  'Servicios: detalle con imágenes, descripciones y precios',
  'Nosotros: historia, misión, visión y valores de la empresa',
  'Contacto: formulario, mapa de ubicación y redes sociales',
  'Botón WhatsApp flotante: acceso directo desde cualquier sección',
];

const DEFAULT_WEB_PANEL = [
  'Gestión de contenido sin conocimientos técnicos',
  'Actualización de textos, imágenes y servicios',
  'Control desde cualquier dispositivo con conexión a internet',
  'Acceso con usuario y contraseña propios del cliente',
];

/** Editor de tabla clave → valor (para Tecnologías, Condiciones, Hosting) */
function FilasKvEditor({ titulo, subtitulo, campo, configValue, defaults, onSave }) {
  const [rows, setRows] = useState(() =>
    Array.isArray(configValue) && configValue.length > 0 ? configValue : defaults
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(configValue) && configValue.length > 0) setRows(configValue);
  }, [configValue]);

  const setField = (i, key, val) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const addRow  = () => setRows((prev) => [...prev, { label: '', valor: '' }]);
  const remove  = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try { await onSave(campo, rows.filter((r) => r.label.trim())); }
    finally { setSaving(false); }
  };

  return (
    <ConfigCard elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#334155' }}>{titulo}</Typography>
          {subtitulo && <Typography variant="caption" color="text.secondary">{subtitulo}</Typography>}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<AddCircleIcon />} onClick={addRow}
            sx={{ color: '#004A99', fontWeight: 600, fontSize: '0.78rem' }}>
            Agregar fila
          </Button>
          <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <SaveIcon />}
            onClick={save} disabled={saving}
            sx={{ bgcolor: '#004A99', fontWeight: 700, fontSize: '0.78rem', '&:hover': { bgcolor: '#003580' } }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </Stack>
      </Box>
      <Stack spacing={1}>
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField size="small" placeholder="Etiqueta" value={row.label}
              onChange={(e) => setField(i, 'label', e.target.value)}
              sx={{ width: 200, flexShrink: 0 }} InputProps={{ sx: { fontSize: '0.83rem' } }} />
            <TextField size="small" placeholder="Valor" value={row.valor}
              onChange={(e) => setField(i, 'valor', e.target.value)}
              fullWidth InputProps={{ sx: { fontSize: '0.83rem' } }} />
            <IconButton size="small" onClick={() => remove(i)}
              sx={{ color: '#ef4444', flexShrink: 0 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </ConfigCard>
  );
}

/** Editor de lista de texto plano (para Páginas incluidas, Panel admin) */
function FilasListaEditor({ titulo, subtitulo, campo, configValue, defaults, onSave }) {
  const [rows, setRows] = useState(() =>
    Array.isArray(configValue) && configValue.length > 0 ? configValue : defaults
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(configValue) && configValue.length > 0) setRows(configValue);
  }, [configValue]);

  const setVal  = (i, val) => setRows((prev) => prev.map((r, idx) => idx === i ? val : r));
  const addRow  = () => setRows((prev) => [...prev, '']);
  const remove  = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try { await onSave(campo, rows.filter((r) => String(r).trim())); }
    finally { setSaving(false); }
  };

  return (
    <ConfigCard elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#334155' }}>{titulo}</Typography>
          {subtitulo && <Typography variant="caption" color="text.secondary">{subtitulo}</Typography>}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<AddCircleIcon />} onClick={addRow}
            sx={{ color: '#004A99', fontWeight: 600, fontSize: '0.78rem' }}>
            Agregar ítem
          </Button>
          <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <SaveIcon />}
            onClick={save} disabled={saving}
            sx={{ bgcolor: '#004A99', fontWeight: 700, fontSize: '0.78rem', '&:hover': { bgcolor: '#003580' } }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </Stack>
      </Box>
      <Stack spacing={1}>
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField size="small" placeholder="Texto del ítem" value={row}
              onChange={(e) => setVal(i, e.target.value)}
              fullWidth InputProps={{ sx: { fontSize: '0.83rem' } }} />
            <IconButton size="small" onClick={() => remove(i)}
              sx={{ color: '#ef4444', flexShrink: 0 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </ConfigCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// Persiste el tab activo fuera del componente para no perderlo en re-renders del padre
let _persistedCatalogTab = 0;

function CotizacionCatalogoPage({ setLoading }) {
  const { panelLeft } = useCmsPanelLayout();

  const [config,      setConfig]      = useState({ moneda: "S/", descuento_hosting: 50 });
  const [tipos,       setTipos]       = useState([]);
  const [modulos,     setModulos]     = useState([]);
  const [catalogTab,  setCatalogTabS] = useState(_persistedCatalogTab);

  // wrapper que persiste fuera del ciclo de vida
  const setCatalogTab = (v) => { _persistedCatalogTab = v; setCatalogTabS(v); };

  // Panel state — single panel open at a time, mode = "tipo" | "modulo"
  const [panelMode,   setPanelMode]   = useState("tipo");
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [panelData,   setPanelData]   = useState({});
  const [isNew,       setIsNew]       = useState(false);
  const [confirmElim, setConfirmElim] = useState(false);
  const [reorderBusy, setReorderBusy] = useState(false);
  /** 'datos' | 'caracteristicas' | 'all' (nuevo tipo) */
  const [tipoEditBlock, setTipoEditBlock] = useState("all");
  const [activeInfoBloqueId, setActiveInfoBloqueId] = useState(null);
  const [infoBloquesReorderBusy, setInfoBloquesReorderBusy] = useState(false);

  useCmsPanelPush(panelOpen);

  const previewInfoBloques = useMemo(
    () => buildPreviewInfoBloques({
      bloques: config.info_bloques || [],
      config,
      editingBlock: panelOpen && panelMode === 'info_bloque' ? panelData : null,
    }),
    [config, panelOpen, panelMode, panelData],
  );

  // Agrupa módulos por categoría respetando el orden de tipos
  const modulosPorGrupo = useMemo(() => {
    const tipoTitulos = tipos.map((t) => t.titulo);
    const map = {};
    modulos.forEach((m) => {
      const cat = (m.categoria || '').trim() || '__sin_categoria__';
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
    });
    // Primero los grupos que coinciden con tipos (en orden), luego el resto
    const ordenados = [];
    tipoTitulos.forEach((titulo) => {
      if (map[titulo]) ordenados.push({ key: titulo, mods: map[titulo], tipo: tipos.find((t) => t.titulo === titulo) });
    });
    Object.keys(map).forEach((k) => {
      if (!tipoTitulos.includes(k)) {
        ordenados.push({ key: k, mods: map[k], tipo: null });
      }
    });
    return ordenados;
  }, [modulos, tipos]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [cfg, t, m] = await Promise.all([listarConfig(), listarTipos(), listarModulosCatalogo()]);
      if (cfg) setConfig(cfg);
      setTipos(t || []);
      setModulos(m || []);
    } catch (e) {
      handleErrorMessages("Catálogo", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Panel helpers ─────────────────────────────────────────────────────────
  const openPanel = (mode, item = null, block = "all") => {
    const empty = mode === "tipo" ? EMPTY_TIPO : EMPTY_MODULO;
    setPanelMode(mode);
    setPanelData(item ? { ...item } : { ...empty });
    setIsNew(!item);
    if (mode === "tipo") {
      setTipoEditBlock(item ? block : "all");
    } else {
      setTipoEditBlock("all");
    }
    setPanelOpen(true);
  };

  const openInfoBloque = (bloque, index) => {
    setPanelMode("info_bloque");
    setPanelData({ ...bloque, _index: index });
    setActiveInfoBloqueId(bloque.id);
    setIsNew(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setPanelData({});
    setIsNew(false);
    setTipoEditBlock("all");
    setActiveInfoBloqueId(null);
  };

  const handleChange = (field, value) => setPanelData((p) => {
    const next = { ...p, [field]: value };
    if (field === 'tiempo_entrega') next.dias_entrega = value;
    if (field === 'icono') next.icon = value;
    return next;
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    try {
      if (panelMode === "info_bloque") {
        const blocks = [...(config.info_bloques || [])];
        const idx = panelData._index ?? 0;
        const items = (panelData.items || []).map((s) => String(s).trim()).filter(Boolean);
        blocks[idx] = {
          id: panelData.id,
          variant: panelData.variant,
          titulo: panelData.titulo,
          icon: panelData.icon,
          items,
        };
        await guardarConfig({
          ...config,
          descuento_hosting: parseFloat(config.descuento_hosting) || 50,
          renovacion_dominio: parseFloat(config.renovacion_dominio) || 130,
          soporte_hora: parseFloat(config.soporte_hora) || 30,
          info_bloques: blocks,
        });
        toastSuccess("Bloque guardado");
      } else if (panelMode === "tipo") {
        const saved = await guardarTipo(buildTipoPayload(panelData));
        setTipos((prev) => upsertCatalogItem(prev, saved, 'id_tipo'));
        toastSuccess("Tipo guardado");
      } else {
        const saved = await guardarModuloCatalogo(buildModuloPayload(panelData));
        setModulos((prev) => upsertCatalogItem(prev, saved, 'id_modulo'));
        toastSuccess("Módulo guardado");
      }
      closePanel();
    } catch (e) {
      handleErrorMessages("Error", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const idTipo = panelData?.id_tipo;
    const idModulo = panelData?.id_modulo;
    setConfirmElim(false);
    setLoading(true);
    try {
      if (panelMode === "tipo") {
        if (!idTipo) throw new Error('No se encontró el tipo a eliminar');
        await eliminarTipo(idTipo);
        setTipos((prev) => prev.filter((t) => t.id_tipo !== idTipo));
        toastSuccess("Tipo eliminado");
      } else {
        if (!idModulo) throw new Error('No se encontró el módulo a eliminar');
        await eliminarModuloCatalogo(idModulo);
        setModulos((prev) => prev.filter((m) => m.id_modulo !== idModulo));
        toastSuccess("Módulo eliminado");
      }
      closePanel();
    } catch (e) {
      handleErrorMessages("Error al eliminar", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Config save ───────────────────────────────────────────────────────────
  const handleReorderTipos = async (items) => {
    setReorderBusy(true);
    try {
      await reordenarTipos(items);
      toastSuccess("Orden de tipos actualizado");
      setTipos(await listarTipos());
    } catch (e) {
      handleErrorMessages("Orden", e);
      throw e;
    } finally {
      setReorderBusy(false);
    }
  };

  const handleReorderModulos = async (items) => {
    setReorderBusy(true);
    try {
      await reordenarModulosCatalogo(items);
      toastSuccess("Orden de módulos actualizado");
      setModulos(await listarModulosCatalogo());
    } catch (e) {
      handleErrorMessages("Orden", e);
      throw e;
    } finally {
      setReorderBusy(false);
    }
  };

  /** Guarda un campo JSON específico del config (hosting_detalles, tecnologias_detalles, etc.) */
  const saveConfigField = async (campo, valor) => {
    const next = { ...config, [campo]: valor };
    setConfig(next);
    await persistConfig(next);
    toastSuccess('Guardado');
  };

  const persistConfig = async (nextConfig) => {
    await guardarConfig({
      ...nextConfig,
      descuento_hosting: parseFloat(nextConfig.descuento_hosting) || 50,
      renovacion_dominio: parseFloat(nextConfig.renovacion_dominio) || 130,
      soporte_hora: parseFloat(nextConfig.soporte_hora) || 30,
      dias_vigencia_qr: parseInt(nextConfig.dias_vigencia_qr, 10) || 5,
    });
    const cfg = await listarConfig();
    if (cfg) setConfig(cfg);
  };

  const handleReorderInfoBloques = async (fromIdx, toIdx) => {
    const blocks = [...(config.info_bloques || [])];
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const [moved] = blocks.splice(fromIdx, 1);
    blocks.splice(toIdx, 0, moved);

    setConfig((c) => ({ ...c, info_bloques: blocks }));
    if (panelMode === 'info_bloque' && panelData?.id != null) {
      const newIdx = blocks.findIndex((b) => b.id === panelData.id);
      if (newIdx >= 0) {
        setPanelData((p) => ({ ...p, _index: newIdx }));
      }
    }

    const nextConfig = { ...config, info_bloques: blocks };

    setInfoBloquesReorderBusy(true);
    try {
      await persistConfig(nextConfig);
      toastSuccess('Orden de bloques actualizado');
    } catch (e) {
      handleErrorMessages('Orden', e);
      const cfg = await listarConfig();
      if (cfg) setConfig(cfg);
    } finally {
      setInfoBloquesReorderBusy(false);
    }
  };

  const saveConfig = async () => {
    try {
      await persistConfig(config);
      toastSuccess("Configuración guardada");
    } catch (e) {
      handleErrorMessages("Error", e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 0, label: 'Plantilla PDF',      icon: <PictureAsPdfIcon sx={{ fontSize: 17 }} />,       color: '#7c3aed' },
    { id: 1, label: 'Tipos de proyecto',  icon: <CategoryIcon sx={{ fontSize: 17 }} />,            color: '#004A99' },
    { id: 2, label: 'Módulos',            icon: <DashboardCustomizeIcon sx={{ fontSize: 17 }} />,  color: '#059669' },
  ];

  return (
    <>
      {/* ══ Panels (siempre montados) ══════════════════════════════════════ */}
      <CotizacionTipoCmsPanel
        open={panelOpen && panelMode === "tipo"}
        panelLeft={panelLeft}
        isNew={isNew}
        editBlock={tipoEditBlock}
        datos={panelData}
        onChange={handleChange}
        onSave={handleSave}
        onClose={closePanel}
        onDelete={() => setConfirmElim(true)}
      />
      <CotizacionInfoBloqueCmsPanel
        open={panelOpen && panelMode === "info_bloque"}
        panelLeft={panelLeft}
        datos={panelData}
        onChange={handleChange}
        onSave={handleSave}
        onClose={closePanel}
      />
      <CotizacionModuloCmsPanel
        open={panelOpen && panelMode === "modulo"}
        panelLeft={panelLeft}
        isNew={isNew}
        datos={panelData}
        tipos={tipos}
        onChange={handleChange}
        onSave={handleSave}
        onClose={closePanel}
        onDelete={() => setConfirmElim(true)}
      />

      <PageBox>
        {/* ── Header compacto + Config inline ─────────────────────────────── */}
        <Box sx={{
          bgcolor: '#fff', borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          mb: 1.5, overflow: 'hidden',
        }}>
          {/* Barra superior */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: 1.2,
            background: 'linear-gradient(135deg, #004A99 0%, #003580 100%)',
          }}>
            <CategoryIcon sx={{ fontSize: 20, color: '#fff', opacity: 0.9 }} />
            <Box flex={1}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', lineHeight: 1 }}>
                Catálogo de Cotización
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                {tipos.length} tipos · {modulos.length} módulos
              </Typography>
            </Box>
            {/* Botón contextual */}
            {catalogTab === 1 && (
              <Button size="small" variant="contained" startIcon={<AddCircleIcon sx={{ fontSize: 15 }} />}
                onClick={() => openPanel("tipo")}
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700,
                  fontSize: '0.78rem', borderRadius: '8px', textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.25)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>
                Nuevo tipo
              </Button>
            )}
            {catalogTab === 2 && (
              <Button size="small" variant="contained" startIcon={<ExtensionIcon sx={{ fontSize: 15 }} />}
                onClick={() => openPanel("modulo")}
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700,
                  fontSize: '0.78rem', borderRadius: '8px', textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.25)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>
                Nuevo módulo
              </Button>
            )}
            {/* Toggle config */}
            <IconButton size="small"
              onClick={() => setConfig(c => ({ ...c, _showCfg: !c._showCfg }))}
              sx={{ color: 'rgba(255,255,255,0.75)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
              title="Configuración de precios">
              {config._showCfg ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>

          {/* Config colapsable */}
          <Collapse in={!!config._showCfg}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                Configuración de precios y vigencias
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'Moneda', key: 'moneda', width: 80, type: 'text' },
                  { label: 'Host. desc. (S/.)', key: 'descuento_hosting', width: 130, type: 'number' },
                  { label: 'Renov. dominio (S/.)', key: 'renovacion_dominio', width: 145, type: 'number' },
                  { label: 'Soporte/hora (S/.)', key: 'soporte_hora', width: 130, type: 'number' },
                  { label: 'Vigencia QR (días)', key: 'dias_vigencia_qr', width: 130, type: 'number' },
                ].map(({ label, key, width, type }) => (
                  <TextField key={key} size="small" label={label} type={type}
                    value={config[key] ?? ''}
                    onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
                    sx={{ width,
                      '& .MuiInputBase-root': { fontSize: '0.8rem', height: 34 },
                      '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                    }} />
                ))}
                <Button size="small" variant="contained"
                  startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
                  onClick={saveConfig}
                  sx={{ bgcolor: '#004A99', fontSize: '0.78rem', fontWeight: 700,
                    borderRadius: '8px', textTransform: 'none', height: 34,
                    '&:hover': { bgcolor: '#003580' } }}>
                  Guardar
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Tab bar integrada */}
          <Box sx={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
            {TABS.map((t) => {
              const active = catalogTab === t.id;
              return (
                <Box key={t.id} onClick={() => setCatalogTab(t.id)}
                  sx={{
                    flex: 1, py: 1, px: 1.5, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7,
                    borderBottom: active ? `3px solid ${t.color}` : '3px solid transparent',
                    bgcolor: active ? `${t.color}0d` : 'transparent',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: `${t.color}12` },
                    '&:not(:last-child)': { borderRight: '1px solid #f1f5f9' },
                  }}>
                  <Box sx={{ color: active ? t.color : '#94a3b8', display: 'flex' }}>{t.icon}</Box>
                  <Typography sx={{
                    fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                    color: active ? t.color : '#64748b',
                  }}>
                    {t.label}
                  </Typography>
                  {t.id === 1 && tipos.length > 0 && (
                    <Chip label={tipos.length} size="small"
                      sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700,
                        bgcolor: active ? `${t.color}18` : '#f1f5f9',
                        color: active ? t.color : '#94a3b8' }} />
                  )}
                  {t.id === 2 && modulos.length > 0 && (
                    <Chip label={modulos.length} size="small"
                      sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700,
                        bgcolor: active ? `${t.color}18` : '#f1f5f9',
                        color: active ? t.color : '#94a3b8' }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ══ TAB 0 — PLANTILLA PDF ══════════════════════════════════════════
            Siempre montado, solo oculto con display:none para no re-cargar   */}
        <Box sx={{ display: catalogTab === 0 ? 'block' : 'none' }}>
          <Paper elevation={0} sx={{ borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <CotizacionPdfCanvasEditor configOnly />
          </Paper>
        </Box>

        {/* ══ TAB 1 — TIPOS DE PROYECTO ═════════════════════════════════════ */}
        <Box sx={{ display: catalogTab === 1 ? 'block' : 'none' }}>
          <SectionLabel>
            Tipos de proyecto ({tipos.length}) — Arrastra para ordenar · Lápiz en cada bloque para editar
          </SectionLabel>
          {tipos.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
              No hay tipos de proyecto. Crea el primero con "Nuevo tipo".
            </Alert>
          ) : (
            <>
              <CotizacionCatalogoOrdenCanvas
                items={tipos}
                idKey="id_tipo"
                saving={reorderBusy}
                onReorder={handleReorderTipos}
                hint="Arrastra los tipos de proyecto para definir el orden en el cotizador público"
                renderCard={(t) => {
                  const isEditing = panelOpen && panelMode === "tipo" && !isNew && panelData?.id_tipo === t.id_tipo;
                  return (
                    <CotizacionTipoCard
                      tipo={t}
                      onEditBlock={(item, block) => openPanel("tipo", item, block)}
                      activeBlock={isEditing ? tipoEditBlock : null}
                      panelData={isEditing ? panelData : undefined}
                    />
                  );
                }}
              />
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <AddCard onClick={() => openPanel("tipo")} label="Nuevo tipo" />
                </Grid>
              </Grid>
            </>
          )}
        </Box>

        {/* ══ TAB 2 — MÓDULOS agrupados por tipo ════════════════════════════ */}
        <Box sx={{ display: catalogTab === 2 ? 'block' : 'none' }}>
          {modulos.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No hay módulos. Crea el primero con "Nuevo módulo".
            </Alert>
          ) : (
            <ModulosAgrupados
              grupos={modulosPorGrupo}
              panelOpen={panelOpen}
              panelMode={panelMode}
              panelData={panelData}
              isNew={isNew}
              reorderBusy={reorderBusy}
              onReorder={handleReorderModulos}
              onEdit={(item) => openPanel("modulo", item)}
              onNew={() => openPanel("modulo")}
            />
          )}
        </Box>

      </PageBox>

      {/* ── Confirm delete ──────────────────────────────────────────────────── */}
      <Dialog open={confirmElim} onClose={() => setConfirmElim(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {panelMode === "tipo" ? "¿Eliminar tipo?" : "¿Eliminar módulo?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Esta acción eliminará permanentemente{" "}
            <strong>{panelMode === "tipo" ? panelData?.titulo : panelData?.nombre}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmElim(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default WithLoandingPanel(CotizacionCatalogoPage);
