/**
 * CotizacionPdfCanvasEditor
 * Canvas visual del PDF con zonas editables (✏️ on hover) + drawer lateral derecho.
 * Edición en tiempo real — el canvas se actualiza mientras escribes.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Stack, TextField, Button,
  IconButton, Divider, CircularProgress, Chip, Switch,
} from '@mui/material';
import EditIcon            from '@mui/icons-material/Edit';
import CloseIcon           from '@mui/icons-material/Close';
import SaveOutlinedIcon    from '@mui/icons-material/SaveOutlined';
import AddIcon             from '@mui/icons-material/Add';
import DeleteOutlineIcon   from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon       from '@mui/icons-material/ArrowBack';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import FileDownloadIcon    from '@mui/icons-material/FileDownload';

import {
  verPresupuesto, actualizarPresupuesto, listarConfig, guardarConfig, listarPresupuestos, descargarPresupuestoPdf,
  actualizarFuncionalidades, actualizarIncludes,
} from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

// ─── Defaults para config ─────────────────────────────────────────────────────
const DEF_HOSTING = [
  { label: 'Hosting',          valor: 'Plan profesional — 10 GB SSD' },
  { label: 'Dominio',          valor: '1 año gratis (.com o .pe)' },
  { label: 'SSL / HTTPS',      valor: 'Certificado gratuito incluido' },
  { label: 'Correos corp.',    valor: '10 cuentas incluidas' },
  { label: 'Renovación anual', valor: 'S/ 130 / año (referencial)' },
];
const DEF_TECNOLOGIAS = [
  { label: 'Frontend',        valor: 'React 18+ · HTML5 · CSS3 · Bootstrap' },
  { label: 'Backend',         valor: 'PHP 8 · Laravel 10+' },
  { label: 'Base de datos',   valor: 'MySQL 8 / MariaDB' },
  { label: 'Servidor web',    valor: 'LiteSpeed + LSCache' },
  { label: 'SEO & Analytics', valor: 'GA4 + Search Console' },
  { label: 'Seguridad',       valor: 'Imunify360 + SSL gratuito' },
];
const DEF_CONDICIONES = [
  { label: 'Validez',             valor: '5 días desde la fecha de emisión' },
  { label: 'Revisiones',          valor: '2 rondas sin costo adicional' },
  { label: 'Cambios extra',       valor: 'S/ 30 / hora' },
  { label: 'Soporte post-entrega',valor: '15 días por bugs del sistema' },
  { label: 'Contenido',           valor: 'Textos, imágenes y logo — a cargo del cliente' },
  { label: 'Privacidad',          valor: 'Datos confidenciales, solo uso interno' },
];
const DEF_PLAN_PAGOS = {
  default: [
    { cuota: 'Cuota 1 (inicio)',  nota: 'Al aprobar la cotización y firmar contrato' },
    { cuota: 'Cuota 2 (avance)',  nota: 'Al presentar el diseño y estructura aprobados' },
    { cuota: 'Cuota 3 (entrega)', nota: 'Al entregar el proyecto terminado' },
  ],
  landing: [
    { cuota: 'Cuota 1 (inicio)',  nota: 'Al aprobar la cotización y firmar contrato' },
    { cuota: 'Cuota 2 (entrega)', nota: 'Al entregar el proyecto terminado' },
  ],
};
const DEF_WEB_PAGINAS = [
  'Home / Inicio: presentación, banner principal y llamado a la acción',
  'Servicios: detalle con imágenes, descripciones y precios',
  'Nosotros: historia, misión, visión y valores de la empresa',
  'Contacto: formulario, mapa de ubicación y redes sociales',
  'Botón WhatsApp flotante: acceso directo desde cualquier sección',
];
const DEF_WEB_PANEL = [
  'Gestión de contenido sin conocimientos técnicos',
  'Actualización de textos, imágenes y servicios',
  'Control desde cualquier dispositivo con conexión a internet',
  'Acceso con usuario y contraseña propios del cliente',
];
const DEF_DOC_ACERCA_ITEMS = [
  { label: 'Tipo', valor: 'Cotización comercial' },
  { label: 'Número', valor: '' },
  { label: 'Moneda', valor: 'Soles (PEN)' },
  { label: 'Vigencia', valor: '5 días desde la emisión' },
  { label: 'Elaborado por', valor: 'Jorge Jhovani Valverde León' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Math.round(Number(n ?? 0)).toLocaleString('es-PE');

function sanitizePlanPagosConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return cfg;
  const out = { ...cfg };
  for (const k of ['default', 'landing']) {
    if (Array.isArray(out[k])) {
      out[k] = out[k].map(({ cuota, nota }) => ({ cuota: cuota ?? '', nota: nota ?? '' }));
    }
  }
  return out;
}

/** Divide el total en partes iguales; el redondeo extra va a las primeras cuotas (mayor → menor). */
function splitTotalEnCuotasDesc(total, n) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const count = Math.max(1, n);
  const base = Math.floor(t / count);
  const extra = t - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0));
}

function computePlanPagos(total, moneda, slug, planConfig) {
  const key = slug === 'landing' ? 'landing' : 'default';
  const cuotas = (planConfig?.[key]?.length > 0 ? planConfig[key] : null) ?? DEF_PLAN_PAGOS[key];
  const montos = splitTotalEnCuotasDesc(total, cuotas.length);

  return cuotas.map((c, i) => ({
    cuota: c.cuota,
    monto: `${moneda} ${fmt(montos[i])}`,
    nota: c.nota,
  }));
}

// ─── PDF styles ───────────────────────────────────────────────────────────────
const PDF = {
  root: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 10,
    color: '#1a1a1a',
    lineHeight: 1.4,
    background: '#fff',
    padding: '40px 44px',
    width: '100%',
  },
  header: { borderBottom: '2px solid #1a1a1a', paddingBottom: 8, marginBottom: 10 },
  brandName: { fontSize: 15, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase' },
  brandSub: { fontSize: 8.5, color: '#666', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 1 },
  docTitle: { fontSize: 20, fontWeight: 900, letterSpacing: -0.5, textAlign: 'right' },
  docCode: { fontSize: 9, color: '#444', fontFamily: 'Courier New, monospace', textAlign: 'right', marginTop: 2 },
  sectionTitle: {
    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6,
    borderBottom: '1.5px solid #1a1a1a', paddingBottom: 3, marginBottom: 6, marginTop: 4,
  },
  subSectionTitle: {
    fontSize: 7.5, fontWeight: 700, color: '#444', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 3, marginTop: 6,
  },
  rowGap: { marginTop: 4 },
  colGap: { gap: 24 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 9.5 },
  td: { padding: '4px 6px', borderBottom: '1px solid #e8e8e8', verticalAlign: 'top', fontSize: 9 },
  tdLbl: { background: '#f0f0f0', fontWeight: 700, width: '36%', color: '#333', padding: '4px 6px', fontSize: 9, borderBottom: '1px solid #e8e8e8' },
  tdAlt: { background: '#f8f8f8', padding: '4px 6px', borderBottom: '1px solid #e8e8e8', fontSize: 9, verticalAlign: 'top' },
  tdLblAlt: { background: '#e6e6e6', fontWeight: 700, width: '36%', color: '#333', padding: '4px 6px', fontSize: 9, borderBottom: '1px solid #e8e8e8' },
};

// ─── EditZone ─────────────────────────────────────────────────────────────────
function EditZone({ id, activeZone, onEdit, children, style = {}, disabled = false }) {
  const isActive = !disabled && activeZone === id;
  return (
    <Box
      sx={{
        position: 'relative',
        outline: isActive ? '2px solid #004A99' : '2px solid transparent',
        outlineOffset: 2,
        borderRadius: 1,
        transition: 'outline 0.15s',
        cursor: disabled ? 'default' : undefined,
        '&:hover .ez-btn': { opacity: disabled ? 0 : 1 },
        ...style,
      }}
    >
      {children}
      {!disabled && (
        <Box
          className="ez-btn"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(id); }}
          sx={{
            position: 'absolute', top: -10, right: -10,
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.15s',
            zIndex: 10,
            cursor: 'pointer',
            bgcolor: isActive ? '#003580' : '#004A99',
            color: '#fff',
            borderRadius: '50%',
            width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,74,153,0.45)',
            '&:hover': { bgcolor: '#003580', transform: 'scale(1.1)' },
          }}
        >
          <EditIcon sx={{ fontSize: 13 }} />
        </Box>
      )}
    </Box>
  );
}

// ─── PDF Canvas ───────────────────────────────────────────────────────────────
function PdfCanvas({ d, activeZone, onEdit, configOnly = false }) {
  const planPagos = computePlanPagos(d.total, d.moneda, d.tipoSlug, d.planPagosConfig);
  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const TblRow = ({ label, value, alt }) => (
    <tr>
      <td style={alt ? PDF.tdLblAlt : PDF.tdLbl}>{label}</td>
      <td style={alt ? PDF.tdAlt : PDF.td}>{value}</td>
    </tr>
  );

  const KvTable = ({ rows }) => (
    <table style={PDF.table}>
      <tbody>
        {(rows || []).map((r, i) => <TblRow key={i} label={r.label} value={r.valor} alt={i % 2 !== 0} />)}
      </tbody>
    </table>
  );

  return (
    <Box style={PDF.root}>
      {/* ── HEADER ── */}
      <div style={PDF.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={PDF.brandName}>royalsensorymassage</div>
            <div style={PDF.brandSub}>SOFTWARE SOLUTIONS &amp; INNOVATION · LIMA, PERÚ</div>
          </div>
          <EditZone id="titulo_documento" activeZone={activeZone} onEdit={onEdit}>
            <div>
              <div style={PDF.docTitle}>{d.doc_titulo || 'COTIZACIÓN'}</div>
              <div style={PDF.docCode}>N.º {d.codigo}</div>
            </div>
          </EditZone>
        </div>
      </div>

      {/* ── FILA 1: CLIENTE + DOCUMENTO ── */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, marginBottom: 12 }}>
        {/* DATOS DEL CLIENTE */}
        <div style={{ flex: 1 }}>
          <EditZone id="cliente" activeZone={activeZone} onEdit={onEdit}>
            <div style={PDF.sectionTitle}>Datos del cliente</div>
            <table style={PDF.table}>
              <tbody>
                <TblRow label="Nombre"   value={<strong>{d.cliente_nombre}</strong>} />
                <TblRow label="Empresa"  value={d.cliente_empresa} alt />
                <TblRow label="WhatsApp" value={d.cliente_whatsapp} />
                <TblRow label="Correo"   value={d.cliente_email} alt />
                <TblRow label="Fecha"    value={`${today} · Válida 5 días`} />
                <TblRow label="Entrega"  value={d.dias_entrega || '5 a 10 días hábiles'} alt />
                <TblRow label="Proyecto" value={<strong>{d.tipo_titulo}</strong>} />
              </tbody>
            </table>
          </EditZone>
        </div>

        {/* ACERCA DE ESTE DOCUMENTO */}
        <div style={{ flex: 1 }}>
          <EditZone id="acerca_documento" activeZone={activeZone} onEdit={onEdit}>
            <div style={PDF.sectionTitle}>{d.doc_acerca_titulo || 'Acerca de este documento'}</div>
            <table style={PDF.table}>
              <tbody>
                {(d.doc_acerca_items || []).map((row, i) => (
                  <TblRow
                    key={`doc-acerca-${i}`}
                    label={row.label || 'Etiqueta'}
                    value={row.valor || '—'}
                    alt={i % 2 !== 0}
                  />
                ))}
              </tbody>
            </table>
          </EditZone>
        </div>
      </div>

      {/* ── FILA 2: ALCANCE + HOSTING ── */}
      <div style={{ display: 'flex', ...PDF.colGap, marginTop: 4, alignItems: 'flex-start' }}>
        {/* ALCANCE */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {(d.includes?.length > 0) && (
            <EditZone id="alcance" activeZone={activeZone} onEdit={onEdit}>
              <div style={{ ...PDF.sectionTitle, marginTop: 4 }}>Alcance del proyecto</div>
              <ul style={{ paddingLeft: 14, fontSize: 9, lineHeight: 1.5, margin: '0 0 4px 0' }}>
                {d.includes.map((it, i) => <li key={i} style={{ marginBottom: 2 }}>{it}</li>)}
              </ul>
            </EditZone>
          )}
          {d.funcionalidades?.length > 0 && (
            <EditZone id="funcionalidades" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 4 }}>
              <div style={{ ...PDF.sectionTitle, color: '#0f766e' }}>Funcionalidades del proyecto</div>
              <table style={PDF.table}>
                <thead>
                  <tr>
                    <th style={{ ...PDF.tdLbl, textAlign: 'left', fontSize: 8.5 }}>Funcionalidad</th>
                    <th style={{ ...PDF.tdLbl, width: 46, textAlign: 'center', fontSize: 8.5 }}>Inc.</th>
                  </tr>
                </thead>
                <tbody>
                  {d.funcionalidades.map((f, i) => (
                    <tr key={i}>
                      <td style={i % 2 !== 0 ? { ...PDF.tdAlt, color: f.incluido ? '#1a1a1a' : '#9ca3af' } : { ...PDF.td, color: f.incluido ? '#1a1a1a' : '#9ca3af' }}>
                        {f.nombre ?? ''}
                      </td>
                      <td style={{ ...(i % 2 !== 0 ? PDF.tdAlt : PDF.td), textAlign: 'center', color: f.incluido ? '#16a34a' : '#9ca3af', fontWeight: 700, width: 46 }}>
                        {f.incluido ? 'Sí' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </EditZone>
          )}
          {d.tipoSlug === 'web' && (
            <>
              <EditZone id="web_panel" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 4 }}>
                <div style={PDF.subSectionTitle}>Panel Administrador Personalizado</div>
                <ul style={{ paddingLeft: 14, fontSize: 9, lineHeight: 1.45, margin: 0 }}>
                  {(d.webPanelAdmin || []).map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </EditZone>
              <EditZone id="web_paginas" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 4 }}>
                <div style={PDF.subSectionTitle}>Páginas incluidas</div>
                <ul style={{ paddingLeft: 14, fontSize: 9, lineHeight: 1.45, margin: 0 }}>
                  {(d.webPaginasIncluidas || []).map((it, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
                  ))}
                </ul>
              </EditZone>
            </>
          )}
          <EditZone id="tecnologias" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 6 }}>
            <div style={PDF.sectionTitle}>Tecnologías utilizadas</div>
            <KvTable rows={d.tecnologiasDetalles} />
          </EditZone>
        </div>

        {/* HOSTING + PLAN DE PAGOS + CONDICIONES */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditZone id="hosting" activeZone={activeZone} onEdit={onEdit}>
            <div style={{ ...PDF.sectionTitle, marginTop: 0 }}>{d.hosting_titulo || 'Hosting incluido (1.er año gratis)'}</div>
            <KvTable rows={d.hostingDetalles} />
          </EditZone>

          <EditZone id="plan_pagos" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 4 }}>
            <div style={PDF.sectionTitle}>Plan de pagos</div>
            {planPagos.map((p, i) => (
              <div key={i} style={{ display: 'table', width: '100%', borderBottom: '1px solid #e8e8e8', padding: '3px 0' }}>
                <span style={{ display: 'table-cell', width: '32%', fontWeight: 700, fontSize: 9 }}>{p.cuota}</span>
                <span style={{ display: 'table-cell', width: '22%', fontWeight: 700, textAlign: 'right', fontSize: 9.5, whiteSpace: 'nowrap' }}>{p.monto}</span>
                <span style={{ display: 'table-cell', color: '#555', fontSize: 9, paddingLeft: 8 }}>{p.nota}</span>
              </div>
            ))}
            <div style={{ fontSize: 8.5, color: '#777', fontStyle: 'italic', marginTop: 4 }}>
              {d.planPagosFooter || 'Pagos sin intereses ni recargos.'}
            </div>
          </EditZone>

          <EditZone id="condiciones" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 6 }}>
            <div style={PDF.sectionTitle}>Condiciones y términos</div>
            <KvTable rows={d.condicionesDetalles} />
          </EditZone>
        </div>
      </div>

      {/* ── RESUMEN ── */}
      <EditZone id="resumen" activeZone={activeZone} onEdit={onEdit} style={{ marginTop: 4 }}>
        <div style={{ ...PDF.sectionTitle, marginTop: 0 }}>Resumen de inversión</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            {(d.detalles || []).map((det, i) => (
              <div key={det.id_detalle ?? i} style={{ display: 'table', width: '100%', borderBottom: '1px solid #eee', padding: '4px 0' }}>
                <span style={{ display: 'table-cell', fontSize: 9.5, color: '#444' }}>{det.etiqueta || det.descripcion}</span>
                <span style={{ display: 'table-cell', textAlign: 'right', fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap', color: det.precio < 0 ? '#e53e3e' : '#1a1a1a' }}>
                  {det.precio < 0 ? '−' : '+'}S/ {fmt(Math.abs(det.precio))}
                </span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ background: '#1a1a1a', color: '#fff', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5 }}>TOTAL</span>
              <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>S/ {fmt(d.total)}</span>
            </div>
          </div>
        </div>
      </EditZone>
    </Box>
  );
}

// ─── Líneas del resumen de inversión ───────────────────────────────────────────
function DetallesResumenEditor({ detalles, onPatch }) {
  const rows = detalles ?? [];
  const set = (i, key, val) =>
    onPatch({ detalles: rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)) });
  const add = () => onPatch({ detalles: [...rows, { etiqueta: '', precio: 0, tipo_linea: 'manual' }] });
  const remove = (i) => onPatch({ detalles: rows.filter((_, idx) => idx !== i) });
  const recalcTotal = () => {
    const sum = rows.reduce((s, r) => s + Number(r.precio || 0), 0);
    const t = Math.max(0, Math.round(sum));
    onPatch({ detalles: rows, total: t, subtotal: t });
  };

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Líneas del resumen
      </Typography>
      {rows.length === 0 && (
        <Typography sx={{ fontSize: '0.80rem', color: '#94a3b8', fontStyle: 'italic' }}>
          Sin líneas — agrega una abajo
        </Typography>
      )}
      {rows.map((det, i) => (
        <Box key={det.id_detalle ?? `line-${i}`} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#f8fafc' }}>
          <Stack spacing={1} direction="row" alignItems="flex-start">
            <TextField
              size="small" value={det.etiqueta ?? det.descripcion ?? ''} placeholder="Concepto"
              onChange={(e) => set(i, 'etiqueta', e.target.value)}
              sx={{ flex: 1 }} InputProps={{ sx: { fontSize: '0.82rem' } }}
            />
            <TextField
              size="small" type="number" value={det.precio ?? 0} placeholder="Monto"
              onChange={(e) => set(i, 'precio', Number(e.target.value))}
              inputProps={{ step: 1 }}
              sx={{ width: 100, flexShrink: 0 }} InputProps={{ sx: { fontSize: '0.82rem' } }}
            />
            <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#ef4444', flexShrink: 0, mt: 0.3 }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>
      ))}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button size="small" startIcon={<AddIcon />} onClick={add}
          sx={{ color: '#004A99', fontWeight: 600, fontSize: '0.78rem' }}>
          Agregar línea
        </Button>
        {rows.length > 0 && (
          <Button size="small" variant="outlined" onClick={recalcTotal}
            sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.78rem', borderColor: '#cbd5e1' }}>
            Total = suma de líneas
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// ─── KV Row Editor (para hosting, tecnologias, condiciones) ──────────────────
function KvRowsEditor({ rows, onChange }) {
  const set = (i, key, val) =>
    onChange(rows.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const add    = () => onChange([...rows, { label: '', valor: '' }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <Stack spacing={1}>
      {rows.map((row, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small" value={row.label} placeholder="Etiqueta"
            onChange={(e) => set(i, 'label', e.target.value)}
            sx={{ width: 130, flexShrink: 0 }}
            InputProps={{ sx: { fontSize: '0.8rem' } }}
          />
          <TextField
            size="small" value={row.valor} placeholder="Valor"
            onChange={(e) => set(i, 'valor', e.target.value)}
            fullWidth InputProps={{ sx: { fontSize: '0.8rem' } }}
          />
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#ef4444', flexShrink: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={add}
        sx={{ alignSelf: 'flex-start', color: '#004A99', fontWeight: 600, fontSize: '0.78rem' }}>
        Agregar fila
      </Button>
    </Stack>
  );
}

// ─── Lista Editor (para web_paginas, web_panel) ───────────────────────────────
function ListEditor({ items, onChange }) {
  const set    = (i, val) => onChange(items.map((r, idx) => idx === i ? val : r));
  const add    = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <Stack spacing={1}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small" value={item} placeholder="Texto del ítem"
            onChange={(e) => set(i, e.target.value)}
            fullWidth multiline maxRows={3}
            InputProps={{ sx: { fontSize: '0.8rem' } }}
          />
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#ef4444', flexShrink: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={add}
        sx={{ alignSelf: 'flex-start', color: '#004A99', fontWeight: 600, fontSize: '0.78rem' }}>
        Agregar ítem
      </Button>
    </Stack>
  );
}

// ─── Funcionalidades Editor ───────────────────────────────────────────────────
function FuncionalidadesEditor({ funcs, onChange }) {
  const set    = (i, field, val) => { const a = [...funcs]; a[i] = { ...a[i], [field]: val }; onChange(a); };
  const add    = () => onChange([...funcs, { nombre: '', incluido: true, descripcion: '' }]);
  const remove = (i) => onChange(funcs.filter((_, idx) => idx !== i));

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Tabla de funcionalidades (PDF)
      </Typography>
      <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', mt: -1 }}>
        Se guarda en el tipo de proyecto — aplica a todas sus cotizaciones.
      </Typography>
      {funcs.length === 0 && (
        <Typography sx={{ fontSize: '0.80rem', color: '#94a3b8', fontStyle: 'italic' }}>
          Sin funcionalidades — agrega filas abajo
        </Typography>
      )}
      {funcs.map((f, i) => (
        <Box key={i} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#f8fafc' }}>
          <Stack spacing={0.8}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small" value={f.nombre ?? ''} placeholder="Nombre funcionalidad"
                onChange={(e) => set(i, 'nombre', e.target.value)}
                InputProps={{ sx: { fontSize: '0.80rem' } }} sx={{ flex: 1 }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <Switch
                  size="small"
                  checked={!!f.incluido}
                  onChange={(e) => set(i, 'incluido', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-thumb': { bgcolor: f.incluido ? '#16a34a' : '#9ca3af' },
                    '& .MuiSwitch-track': { bgcolor: f.incluido ? '#16a34a55' : '#9ca3af55' },
                  }}
                />
                <Typography sx={{ fontSize: '0.58rem', color: f.incluido ? '#16a34a' : '#9ca3af', lineHeight: 1 }}>
                  {f.incluido ? 'Sí' : 'No'}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#ef4444', flexShrink: 0 }}>
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <TextField
              size="small" value={f.descripcion ?? ''} placeholder="Descripción (opcional)"
              onChange={(e) => set(i, 'descripcion', e.target.value)}
              InputProps={{ sx: { fontSize: '0.78rem' } }} fullWidth
            />
          </Stack>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={add}
        sx={{ alignSelf: 'flex-start', color: '#0f766e', fontWeight: 600, fontSize: '0.78rem' }}>
        Agregar funcionalidad
      </Button>
    </Stack>
  );
}

// ─── Drawer content per zone ──────────────────────────────────────────────────
const ZONE_META = {
  cliente:         { label: 'Datos del cliente',            color: '#004A99' },
  titulo_documento:{ label: 'Título del documento',         color: '#1f2937' },
  acerca_documento:{ label: 'Acerca de este documento',     color: '#334155' },
  alcance:         { label: 'Alcance del proyecto',         color: '#1e40af' },
  hosting:         { label: 'Hosting incluido',             color: '#0d9488' },
  plan_pagos:      { label: 'Plan de pagos',                color: '#059669' },
  tecnologias:     { label: 'Tecnologías utilizadas',       color: '#7c3aed' },
  condiciones:     { label: 'Condiciones y términos',       color: '#d97706' },
  web_paginas:     { label: 'Páginas incluidas (Web)',      color: '#1d4ed8' },
  web_panel:       { label: 'Panel Administrador (Web)',    color: '#6d28d9' },
  funcionalidades: { label: 'Funcionalidades del proyecto', color: '#0f766e' },
  resumen:         { label: 'Resumen de inversión',         color: '#1a1a1a' },
};

/** Campo estable (fuera de DrawerContent) para no perder foco al escribir. */
function DrawerField({ label, value, onChange, multiline, rows, type, helperText }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField
        fullWidth size="small" type={type ?? 'text'}
        value={value ?? ''}
        helperText={helperText}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        multiline={multiline} rows={rows}
        InputProps={{ sx: { fontSize: '0.84rem' } }}
      />
    </Box>
  );
}

function DrawerContent({ zone, data, onChange }) {
  if (!zone) return null;
  const set = (key) => (val) => onChange({ [key]: val });

  if (zone === 'cliente') {
    return (
      <Stack spacing={2}>
        <DrawerField label="Nombre" value={data.cliente_nombre} onChange={set('cliente_nombre')} />
        <DrawerField label="Empresa" value={data.cliente_empresa} onChange={set('cliente_empresa')} />
        <DrawerField label="WhatsApp" value={data.cliente_whatsapp} onChange={set('cliente_whatsapp')} />
        <DrawerField label="Correo" value={data.cliente_email} onChange={set('cliente_email')} />
        <DrawerField label="Descripción / Nota" value={data.cliente_descripcion} onChange={set('cliente_descripcion')} multiline rows={2} />
        <DrawerField label="Días de entrega" value={data.dias_entrega} onChange={set('dias_entrega')} />
      </Stack>
    );
  }

  if (zone === 'titulo_documento') {
    return (
      <Stack spacing={2}>
        <DrawerField label="Título principal" value={data.doc_titulo} onChange={set('doc_titulo')} />
      </Stack>
    );
  }

  if (zone === 'acerca_documento') {
    return (
      <Stack spacing={2}>
        <DrawerField label="Título de sección" value={data.doc_acerca_titulo} onChange={set('doc_acerca_titulo')} />
        <KvRowsEditor
          rows={data.doc_acerca_items || []}
          onChange={(rows) => onChange({ doc_acerca_items: rows })}
        />
      </Stack>
    );
  }

  if (zone === 'resumen') {
    return (
      <Stack spacing={2.5}>
        <DetallesResumenEditor detalles={data.detalles} onPatch={onChange} />
        <Divider />
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
          Monto en la barra negra. El plan de pagos usa este total (puede diferir de la suma de líneas).
        </Typography>
        <DrawerField
          label="Total (S/)"
          type="number"
          value={data.total ?? 0}
          onChange={(val) => {
            const n = Math.max(0, Number(val) || 0);
            onChange({ total: n, subtotal: n });
          }}
          helperText="Ej. 610 si hay cargos no listados arriba"
        />
      </Stack>
    );
  }

  if (zone === 'plan_pagos') {
    const slug = data.tipoSlug || 'web';
    const key  = slug === 'landing' ? 'landing' : 'default';
    const cfg  = data.planPagosConfig ?? {};
    const cuotas = cfg[key] ?? DEF_PLAN_PAGOS[key];
    const montos = computePlanPagos(data.total, data.moneda, slug, cfg);
    const stripPct = (arr) => arr.map(({ cuota, nota }) => ({ cuota, nota }));
    const setKey = (newCuotas) => onChange({ planPagosConfig: { ...cfg, [key]: stripPct(newCuotas) } });

    return (
      <Stack spacing={2}>
        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
          {slug === 'landing' ? 'Cuotas para Landing Page' : 'Cuotas para proyectos estándar'}
        </Typography>
        <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', mt: -1 }}>
          El total ({data.moneda} {fmt(data.total)}) se reparte en {cuotas.length} cuota{cuotas.length !== 1 ? 's' : ''} (mayor monto en la 1.ª). Solo edita nombres y notas.
        </Typography>
        {cuotas.map((c, i) => (
          <Box key={i} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#f8fafc' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField size="small" label="Nombre cuota" value={c.cuota}
                  onChange={(e) => { const n = [...cuotas]; n[i] = { ...n[i], cuota: e.target.value }; setKey(n); }}
                  sx={{ flex: 1 }} InputProps={{ sx: { fontSize: '0.82rem' } }} />
                <Chip
                  label={montos[i]?.monto ?? '—'}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669', flexShrink: 0 }}
                />
                <IconButton size="small" onClick={() => setKey(cuotas.filter((_, idx) => idx !== i))}
                  sx={{ color: '#ef4444' }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
              <TextField size="small" label="Nota" value={c.nota}
                onChange={(e) => { const n = [...cuotas]; n[i] = { ...n[i], nota: e.target.value }; setKey(n); }}
                fullWidth InputProps={{ sx: { fontSize: '0.82rem' } }} />
            </Stack>
          </Box>
        ))}
        <Button size="small" startIcon={<AddIcon />}
          onClick={() => setKey([...cuotas, { cuota: `Cuota ${cuotas.length + 1}`, nota: '' }])}
          sx={{ alignSelf: 'flex-start', color: '#059669', fontWeight: 600, fontSize: '0.78rem' }}>
          Agregar cuota
        </Button>
        <Divider />
        <Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, mb: 0.5 }}>
            TEXTO AL PIE DEL PLAN
          </Typography>
          <TextField fullWidth size="small"
            value={data.planPagosFooter ?? 'Pagos sin intereses ni recargos.'}
            onChange={(e) => onChange({ planPagosFooter: e.target.value })}
            InputProps={{ sx: { fontSize: '0.82rem' } }} />
        </Box>
      </Stack>
    );
  }

  const kvZones = { hosting: 'hostingDetalles', tecnologias: 'tecnologiasDetalles', condiciones: 'condicionesDetalles' };
  if (kvZones[zone]) {
    const field = kvZones[zone];
    if (zone === 'hosting') {
      return (
        <Stack spacing={2}>
          <DrawerField label="Título de sección" value={data.hosting_titulo} onChange={set('hosting_titulo')} />
          <KvRowsEditor
            rows={data[field] || []}
            onChange={(rows) => onChange({ [field]: rows })}
          />
        </Stack>
      );
    }
    return (
      <KvRowsEditor
        rows={data[field] || []}
        onChange={(rows) => onChange({ [field]: rows })}
      />
    );
  }

  if (zone === 'web_paginas') {
    return (
      <ListEditor
        items={data.webPaginasIncluidas || []}
        onChange={(items) => onChange({ webPaginasIncluidas: items })}
      />
    );
  }

  if (zone === 'web_panel') {
    return (
      <ListEditor
        items={data.webPanelAdmin || []}
        onChange={(items) => onChange({ webPanelAdmin: items })}
      />
    );
  }

  if (zone === 'alcance') {
    return (
      <Stack spacing={1.5}>
        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Características del alcance
        </Typography>
        <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', mt: -1 }}>
          Lista de bullet points — se guarda en el tipo de proyecto.
        </Typography>
        <ListEditor
          items={data.includes || []}
          onChange={(items) => onChange({ includes: items })}
        />
      </Stack>
    );
  }

  if (zone === 'funcionalidades') {
    return (
      <FuncionalidadesEditor
        funcs={data.funcionalidades || []}
        onChange={(arr) => onChange({ funcionalidades: arr })}
      />
    );
  }

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CotizacionPdfCanvasEditor({ presupuesto: rowData, onBack, onUpdated, isNew = false, configOnly = false }) {
  const id = rowData?.id_presupuesto;

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [downloadingPdf,setDownloadingPdf]= useState(false);
  const [saved,         setSaved]         = useState(false);
  const [activeZone,    setActiveZone]    = useState(null);
  const [noPresupuesto, setNoPresupuesto] = useState(false);
  // En configOnly almacenamos el ID del presupuesto demo para poder guardar datos del cliente
  const presIdRef = useRef(null);
  const drawerOpen = Boolean(activeZone);

  // Live data (canvas + drawer)
  const [d, setD] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNoPresupuesto(false);
    try {
      // En configOnly sin presupuesto → usa el último presupuesto como muestra
      let presId = id;
      if (configOnly && !presId) {
        const lista = await listarPresupuestos();
        presId = lista?.[0]?.id_presupuesto ?? null;
        if (!presId) { setNoPresupuesto(true); return; }
      }
      presIdRef.current = presId;

      const [pres, cfg] = await Promise.all([verPresupuesto(presId), listarConfig()]);
      const monedaTexto = (cfg?.moneda ?? 'S/') === 'S/' ? 'Soles (PEN)' : 'Dólares (USD)';
      const acercaItemsCfg = Array.isArray(cfg?.doc_acerca_items) && cfg.doc_acerca_items.length > 0
        ? cfg.doc_acerca_items
        : null;
      const acercaItems = acercaItemsCfg ?? [
        { label: 'Tipo', valor: cfg?.doc_tipo ?? 'Cotización comercial' },
        { label: 'Número', valor: cfg?.doc_numero ?? (pres.codigo ?? '') },
        { label: 'Moneda', valor: cfg?.doc_moneda ?? monedaTexto },
        { label: 'Vigencia', valor: cfg?.doc_vigencia ?? '5 días desde la emisión' },
        { label: 'Elaborado por', valor: cfg?.doc_elaborado_por ?? 'Jorge Jhovani Valverde León' },
      ];
      setD({
        // presupuesto
        cliente_nombre:      pres.cliente_nombre      ?? '',
        cliente_empresa:     pres.cliente_empresa      ?? '',
        cliente_whatsapp:    pres.cliente_whatsapp     ?? '',
        cliente_email:       pres.cliente_email        ?? '',
        cliente_descripcion: pres.cliente_descripcion  ?? '',
        dias_entrega:        pres.dias_entrega         ?? '5 a 10 días hábiles',
        estado:              pres.estado               ?? 'pendiente',
        codigo:              pres.codigo               ?? '',
        doc_titulo:          cfg?.doc_titulo           ?? 'COTIZACIÓN',
        doc_acerca_titulo:   cfg?.doc_acerca_titulo    ?? 'Acerca de este documento',
        doc_acerca_items:    acercaItems.length > 0 ? acercaItems : DEF_DOC_ACERCA_ITEMS,
        tipo_titulo:         pres.tipo_titulo          ?? '',
        tipoSlug:            pres.tipo?.slug           ?? '',
        tipoId:              pres.tipo?.id_tipo        ?? null,
        includes:            pres.tipo?.includes       ?? [],
        funcionalidades:     Array.isArray(pres.tipo?.funcionalidades) ? pres.tipo.funcionalidades : [],
        detalles:            pres.detalles             ?? [],
        total:               pres.total                ?? 0,
        subtotal:            pres.subtotal             ?? 0,
        descuento_monto:     pres.descuento_monto      ?? 0,
        // config
        moneda:              cfg?.moneda               ?? 'S/',
        hosting_titulo:      cfg?.hosting_titulo       ?? 'Hosting incluido (1.er año gratis)',
        hostingDetalles:     Array.isArray(cfg?.hosting_detalles)     && cfg.hosting_detalles.length     > 0 ? cfg.hosting_detalles     : DEF_HOSTING,
        tecnologiasDetalles: Array.isArray(cfg?.tecnologias_detalles) && cfg.tecnologias_detalles.length > 0 ? cfg.tecnologias_detalles : DEF_TECNOLOGIAS,
        condicionesDetalles: Array.isArray(cfg?.condiciones_detalles) && cfg.condiciones_detalles.length > 0 ? cfg.condiciones_detalles : DEF_CONDICIONES,
        webPaginasIncluidas: Array.isArray(cfg?.web_paginas_incluidas) && cfg.web_paginas_incluidas.length > 0 ? cfg.web_paginas_incluidas : DEF_WEB_PAGINAS,
        webPanelAdmin:       Array.isArray(cfg?.web_panel_admin)       && cfg.web_panel_admin.length       > 0 ? cfg.web_panel_admin       : DEF_WEB_PANEL,
        planPagosConfig:     sanitizePlanPagosConfig(cfg?.plan_pagos_config ?? null),
        planPagosFooter:     cfg?.plan_pagos_footer ?? 'Pagos sin intereses ni recargos.',
      });
    } catch (e) { handleErrorMessages('Error', e); }
    finally { setLoading(false); }
  }, [id, configOnly]);

  useEffect(() => { load(); }, [load]);

  // Merge partial updates from drawer into live data
  const handleChange = useCallback((partial) => {
    setD((prev) => prev ? { ...prev, ...partial } : prev);
  }, []);

  const handleSave = async () => {
    if (!d) return;
    setSaving(true);
    try {
      // Guardar datos del cliente (presupuesto normal o presupuesto demo en configOnly)
      const targetPresId = configOnly ? presIdRef.current : id;
      if (targetPresId) {
        await actualizarPresupuesto(targetPresId, {
          cliente_nombre:      d.cliente_nombre,
          cliente_empresa:     d.cliente_empresa,
          cliente_whatsapp:    d.cliente_whatsapp,
          cliente_email:       d.cliente_email,
          cliente_descripcion: d.cliente_descripcion,
          dias_entrega:        d.dias_entrega,
          estado:              d.estado,
          total:               Number(d.total) || 0,
          subtotal:            Number(d.subtotal ?? d.total) || 0,
          detalles: (d.detalles ?? []).map((det, i) => ({
            tipo_linea: det.tipo_linea ?? 'manual',
            ref_slug:   det.ref_slug ?? null,
            etiqueta:   det.etiqueta || det.descripcion || 'Ítem',
            precio:     Number(det.precio) || 0,
            orden:      i,
          })),
        });
      }
      // Guardar secciones visuales del PDF (siempre)
      const savePromises = [
        (() => {
          const items = d.doc_acerca_items || [];
          const getByLabel = (lbl) => items.find((it) => (it?.label || '').trim().toLowerCase() === lbl)?.valor || '';
          return guardarConfig({
            hosting_titulo:        d.hosting_titulo,
            hosting_detalles:      d.hostingDetalles,
            tecnologias_detalles:  d.tecnologiasDetalles,
            condiciones_detalles:  d.condicionesDetalles,
            web_paginas_incluidas: d.webPaginasIncluidas,
            web_panel_admin:       d.webPanelAdmin,
            plan_pagos_config:     sanitizePlanPagosConfig(d.planPagosConfig),
            plan_pagos_footer:     d.planPagosFooter,
            doc_titulo:            d.doc_titulo,
            doc_acerca_titulo:     d.doc_acerca_titulo,
            doc_acerca_items:      items,
            doc_tipo:              getByLabel('tipo'),
            doc_numero:            getByLabel('número') || getByLabel('numero'),
            doc_moneda:            getByLabel('moneda'),
            doc_vigencia:          getByLabel('vigencia'),
            doc_elaborado_por:     getByLabel('elaborado por'),
          });
        })(),
      ];
      // Guardar includes y funcionalidades en el tipo de proyecto (endpoints dedicados)
      if (d.tipoId) {
        savePromises.push(actualizarIncludes(d.tipoId, d.includes ?? []));
        savePromises.push(actualizarFuncionalidades(d.tipoId, d.funcionalidades ?? []));
      }
      await Promise.all(savePromises);
      toastSuccess(configOnly ? 'Plantilla PDF guardada' : 'Cotización actualizada');
      setSaved(true);
      if (!configOnly) {
        onUpdated?.({
          ...rowData,
          ...d,
          id_presupuesto: targetPresId ?? id,
          total: Number(d.total) || 0,
          subtotal: Number(d.subtotal ?? d.total) || 0,
        });
      }

      setTimeout(() => setSaved(false), 3000);
    } catch (e) { handleErrorMessages('Error al guardar', e); }
    finally { setSaving(false); }
  };

  const handleDownloadPdf = async () => {
    const targetPresId = configOnly ? presIdRef.current : id;
    if (!targetPresId) return;
    setDownloadingPdf(true);
    try {
      await descargarPresupuestoPdf(targetPresId, d?.codigo);
    } catch (e) {
      handleErrorMessages('Error al descargar PDF', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: configOnly ? 300 : 500 }}>
        <CircularProgress sx={{ color: '#004A99' }} />
      </Box>
    );
  }

  // configOnly sin presupuestos aún
  if (configOnly && noPresupuesto) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>
        <Typography variant="body2" fontWeight={600} sx={{ color: '#64748b', mb: 0.5 }}>
          Sin cotizaciones para previsualizar
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.80rem' }}>
          Crea al menos una cotización en la tab "Nueva cotización" y luego vuelve aquí para ver la plantilla PDF editable.
        </Typography>
      </Box>
    );
  }

  const zoneMeta = activeZone ? ZONE_META[activeZone] : null;

  return (
    /* Columna raíz — NO usa position:fixed para no romper el layout del admin */
    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f0f4f8', ...(!configOnly && { minHeight: '100vh' }) }}>
      {/* ── BARRA SUPERIOR sticky (dentro del flujo normal) ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 50,
        bgcolor: '#fff', borderBottom: '1px solid #e2e8f0',
        px: 2.5, py: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* En configOnly no hay botón volver */}
          {!configOnly && (
            <>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
                onClick={onBack} size="small"
                sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none', fontSize: '0.82rem' }}
              >
                {isNew ? 'Volver a cotizaciones' : 'Volver al listado'}
              </Button>
              <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
            </>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {configOnly ? (
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                🎨 Plantilla visual del PDF
              </Typography>
            ) : (
              <Chip label={d?.codigo} size="small"
                sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(0,74,153,0.08)', color: '#004A99', fontSize: '0.72rem' }} />
            )}
            {isNew && !configOnly ? (
              <Chip
                label="✨ Cotización recién creada — personaliza el PDF"
                size="small"
                sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: '0.70rem', display: { xs: 'none', md: 'flex' } }}
              />
            ) : (
              <Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', display: { xs: 'none', md: 'block' } }}>
                {configOnly
                  ? 'Los cambios aplican a todas las cotizaciones futuras · Haz clic en ✏️ para editar'
                  : 'Haz clic en el ✏️ de cualquier sección para editarla'}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {!configOnly && (
            <Button
              variant="outlined"
              startIcon={downloadingPdf ? <CircularProgress size={14} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf || saving}
              sx={{
                color: '#004A99', borderColor: '#bcd2ee', fontWeight: 700,
                borderRadius: '10px', px: 2, fontSize: '0.82rem',
                '&:hover': { borderColor: '#89b6e8', bgcolor: '#f2f7ff' },
              }}
            >
              {downloadingPdf ? 'Descargando…' : 'Descargar PDF'}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : saved ? <CheckCircleIcon /> : <SaveOutlinedIcon />}
            onClick={handleSave} disabled={saving || downloadingPdf}
            sx={{
              bgcolor: saved ? '#10b981' : '#004A99', fontWeight: 700,
              borderRadius: '10px', px: 2.5, fontSize: '0.84rem',
              '&:hover': { bgcolor: saved ? '#059669' : '#003580' },
            }}
          >
            {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
          </Button>
        </Stack>
      </Box>

      {/* ── FILA PRINCIPAL: CANVAS + PANEL DERECHO ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* CANVAS */}
        <Box sx={{
          flex: 1, overflowY: 'auto',
          p: { xs: 1.5, md: 3 },
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        }}>
          <Box sx={{
            width: '100%', maxWidth: 860,
            bgcolor: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 4,
          }}>
            {d && <PdfCanvas d={d} activeZone={activeZone} onEdit={setActiveZone} configOnly={configOnly} />}
          </Box>
        </Box>

        {/* PANEL LATERAL DERECHO — en el flujo normal, sin position:fixed */}
        <Box sx={{
          width: drawerOpen ? 390 : 0,
          minWidth: drawerOpen ? 390 : 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          display: 'flex', flexDirection: 'column',
          borderLeft: drawerOpen ? '1px solid #e2e8f0' : 'none',
          bgcolor: '#fff',
          boxShadow: drawerOpen ? '-4px 0 20px rgba(0,0,0,0.07)' : 'none',
        }}>
          {drawerOpen && (
            <>
              {/* Panel header */}
              <Box sx={{
                px: 2.5, py: 1.8, flexShrink: 0,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: zoneMeta?.color ?? '#004A99',
                color: '#fff',
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.90rem', lineHeight: 1.2 }}>
                    ✏️ {zoneMeta?.label ?? ''}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', opacity: 0.8, mt: 0.3 }}>
                    Los cambios se ven en tiempo real
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setActiveZone(null)}
                  sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Panel body — stopPropagation evita clics que cierren o cambien zona al escribir */}
              <Box
                sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {d && activeZone && (
                  <DrawerContent zone={activeZone} data={d} onChange={handleChange} />
                )}
              </Box>

              {/* Panel footer */}
              <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{ bgcolor: '#004A99', fontWeight: 700, borderRadius: '10px', '&:hover': { bgcolor: '#003580' } }}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
