/**
 * ProformaPdfCanvasEditor
 * Canvas visual de la PROFORMA con zonas editables (✏️ on hover) + drawer lateral.
 * Layout fiel a la imagen de proforma: header con logo+brand, tabla de items,
 * totales, plan de pagos, datos de pago, firma y QR.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Stack, TextField, Button,
  IconButton, Divider, CircularProgress, Chip, Select, MenuItem as MuiMenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import EditIcon            from '@mui/icons-material/Edit';
import CloseIcon           from '@mui/icons-material/Close';
import SaveOutlinedIcon    from '@mui/icons-material/SaveOutlined';
import AddIcon             from '@mui/icons-material/Add';
import DeleteOutlineIcon   from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon       from '@mui/icons-material/ArrowBack';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';

import {
  verPresupuesto, actualizarPresupuesto, listarConfig, guardarConfig,
} from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEF_EMPRESA = {
  nombre:    'royalsensorymassage',
  subtitulo: 'Software Solutions & Innovation',
  ciudad:    'Lima, Perú',
  email:     'ghiovani666@gmail.com',
  web:       'www.royalsensorymassage.com',
  telefono:  '+51 970 048 451',
};
const DEF_ELABORADO = {
  nombre:  'Jorge Jhovani Valverde León',
  cargo:   'Desarrollador Web & Consultor TI',
  empresa: 'royalsensorymassage',
};
const DEF_DATOS_PAGO = [
  'BBVA — Jorge Jhovani Valverde León',
  'Cta. Soles: 0011-0814-0269706304  ·  CCI: 011-814-000269706304-14',
  'BCP — Jorge Jhovani Valverde León · DNI: 42774713',
  'Cta. Ahorro: 191-28227720-0-47  ·  CCI: 002-191-128227720047-56',
  'YAPE: 970 048 451 — Jorge Jhovani Valverde León',
];
const DEF_NOTA_ENTREGA = 'El tiempo de entrega inicia una vez recibido todo el material solicitado. El saldo restante se realiza contra entrega del proyecto final.';
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
const DEF_CONDICION_TEXTO = 'CUOTAS SIN INTERESES NI RECARGOS';

const DEF_ALCANCE = [
  'Diseño responsive (celular, tablet y PC)',
  'Integración con WhatsApp y formulario de contacto',
  'Panel de administración incluido',
  'SEO básico optimizado para buscadores',
  'Publicación en su servidor/hosting',
  'Capacitación básica de uso (1 sesión)',
];
const DEF_HOSTING = [
  { label: 'Hosting',          valor: 'Plan profesional — 10 GB SSD' },
  { label: 'Dominio',          valor: '1 año gratis (.com o .pe)' },
  { label: 'SSL / HTTPS',      valor: 'Certificado gratuito incluido' },
  { label: 'Correos corp.',    valor: '10 cuentas incluidas' },
  { label: 'Renovación anual', valor: 'S/ 130 / año (referencial)' },
];
const DEF_TECNOLOGIAS = [
  { label: 'Frontend',      valor: 'React 18+ · HTML5 · CSS3 · Bootstrap / WordPress' },
  { label: 'Backend',       valor: 'PHP 8 · Laravel 10+ / WordPress' },
  { label: 'Base de datos', valor: 'MySQL 8.2 / MariaDB' },
  { label: 'Servidor web',  valor: 'LiteSpeed + LSCache' },
  { label: 'SEO',           valor: 'Google Search Console + Analytics' },
  { label: 'Seguridad',     valor: 'Imunify360 + SSL gratuito' },
];
const DEF_CONDICIONES_TERMINOS = [
  { label: 'Validez',             valor: '5 días desde la fecha de emisión' },
  { label: 'Revisiones',          valor: '2 rondas sin costo adicional' },
  { label: 'Cambios extra',       valor: 'S/ 30 / hora adicional' },
  { label: 'Soporte post-entrega',valor: '15 días por bugs del sistema' },
  { label: 'Contenido',           valor: 'Textos, imágenes y logo — a cargo del cliente' },
  { label: 'Privacidad',          valor: 'Datos confidenciales, solo uso interno' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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

// ─── Estilos PDF — 1 hoja única ──────────────────────────────────────────────
const S = {
  root: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 8,
    color: '#1a1a1a',
    lineHeight: 1.25,
    background: '#fff',
    padding: '12px 18px',
    width: '100%',
  },
  th: {
    background: '#1a1a1a',
    color: '#fff',
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '3px 6px',
    textAlign: 'left',
    borderBottom: '2px solid #1a1a1a',
  },
  td: {
    padding: '2.5px 6px',
    borderBottom: '1px solid #ebebeb',
    fontSize: 8,
    verticalAlign: 'middle',
  },
  tdRight: {
    padding: '2.5px 6px',
    borderBottom: '1px solid #ebebeb',
    fontSize: 8,
    textAlign: 'right',
    verticalAlign: 'middle',
    fontVariantNumeric: 'tabular-nums',
  },
  infoLbl: {
    fontWeight: 700,
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#333',
    padding: '2.5px 6px',
    background: '#f0f0f0',
    borderBottom: '1px solid #e0e0e0',
    width: '36%',
    whiteSpace: 'nowrap',
  },
  infoVal: {
    fontSize: 7.5,
    padding: '2.5px 6px',
    borderBottom: '1px solid #ebebeb',
    color: '#1a1a1a',
  },
  secHdr: (bg) => ({
    background: bg,
    color: '#fff',
    padding: '3px 8px',
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }),
  dot: (color) => ({
    display: 'inline-block',
    width: 6, height: 6,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
  amtLbl: {
    padding: '2.5px 10px 2.5px 0',
    fontSize: 7.5,
    color: '#555',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  amtVal: {
    padding: '2.5px 0',
    fontSize: 7.5,
    textAlign: 'right',
    minWidth: 75,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
};

// ─── EditZone ────────────────────────────────────────────────────────────────
function EditZone({ id, activeZone, onEdit, children, style = {} }) {
  const isActive = activeZone === id;
  return (
    <Box sx={{
      position: 'relative',
      outline: isActive ? '2px solid #1d4ed8' : '2px solid transparent',
      outlineOffset: 2,
      borderRadius: 1,
      transition: 'outline 0.15s',
      '&:hover .ez-pen': { opacity: 1 },
      ...style,
    }}>
      {children}
      <Box
        className="ez-pen"
        onClick={() => onEdit(id)}
        sx={{
          position: 'absolute', top: -10, right: -10,
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.15s',
          zIndex: 10, cursor: 'pointer',
          bgcolor: isActive ? '#1e3a8a' : '#1d4ed8',
          color: '#fff', borderRadius: '50%',
          width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(29,78,216,0.45)',
          '&:hover': { bgcolor: '#1e3a8a', transform: 'scale(1.1)' },
        }}
      >
        <EditIcon sx={{ fontSize: 13 }} />
      </Box>
    </Box>
  );
}

// ─── Canvas PDF — 1 sola hoja ─────────────────────────────────────────────────
function ProformaCanvas({ d, activeZone, onEdit }) {
  const today       = new Date();
  const vencimiento = addDays(today, d.vigencia_dias ?? 5);
  const planPagos   = computePlanPagos(d.total, d.moneda, d.tipoSlug, d.planPagosConfig);
  const igvMonto    = Math.round(Number(d.total) * (Number(d.igv_pct ?? 0) / 100));
  const subtotal    = Number(d.total);
  const lineasVacias = Math.max(0, (d.lineas_vacias ?? 0) - (d.detalles?.length ?? 0));

  const KvTable = ({ rows, borderColor = '#ddd', lblBg1 = '#f0f0f0', lblBg2 = '#e8e8e8', lblColor = '#333', valBg1 = '#fff', valBg2 = '#fafafa', borderColorCell, topBorder = false }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${borderColor}`, borderTop: topBorder ? `1px solid ${borderColor}` : 'none' }}>
      <tbody>
        {rows.map(([lbl, val], i) => (
          <tr key={i}>
            <td style={{ ...S.infoLbl, background: i % 2 === 0 ? lblBg1 : lblBg2, color: lblColor, borderBottom: `1px solid ${borderColorCell ?? borderColor}` }}>
              {lbl}
            </td>
            <td style={{ ...S.infoVal, background: i % 2 === 0 ? valBg1 : valBg2, borderBottom: `1px solid ${borderColorCell ?? '#ebebeb'}` }}>
              {val}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <Box style={S.root}>

      {/* ══ BARRA SUPERIOR + HEADER ═════════════════════════════════════════ */}
      <div style={{ height: 4, background: 'linear-gradient(90deg,#1d4ed8 0%,#0f172a 100%)', marginBottom: 8 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7, borderBottom: '2px solid #1a1a1a', paddingBottom: 7 }}>

        <EditZone id="empresa" activeZone={activeZone} onEdit={onEdit}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 44, height: 44, background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, flexShrink: 0, borderBottom: '3px solid #1d4ed8' }}>
              {(d.empresa?.nombre ?? 'L')[0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: 0.5 }}>{d.empresa?.nombre ?? 'royalsensorymassage'}</div>
              <div style={{ fontSize: 7.5, color: '#1d4ed8', fontWeight: 600 }}>{d.empresa?.subtitulo ?? 'Software Solutions & Innovation'}</div>
              <div style={{ fontSize: 7, color: '#555', marginTop: 1 }}>{d.empresa?.ciudad ?? 'Lima, Perú'}</div>
              <div style={{ fontSize: 7, color: '#555', marginTop: 2 }}>{d.empresa?.email} · {d.empresa?.web} · {d.empresa?.telefono}</div>
            </div>
          </div>
        </EditZone>

        <EditZone id="elaborado" activeZone={activeZone} onEdit={onEdit}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 7.5, color: '#555', marginBottom: 4 }}>{d.elaborado?.nombre ?? 'Jorge Jhovani Valverde León'}</div>
            <div style={{ background: '#0f172a', color: '#fff', padding: '6px 22px', display: 'inline-block', borderBottom: '3px solid #1d4ed8' }}>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>PROFORMA</div>
            </div>
            <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 700, marginTop: 3 }}>{d.codigo}</div>
          </div>
        </EditZone>
      </div>

      {/* ══ DATOS CLIENTE + DOC INFO ════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
        <EditZone id="cliente" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1 }}>
          <KvTable topBorder rows={[
            ['CLIENTE',  d.cliente_nombre],
            ['EMPRESA',  d.cliente_empresa],
            ['WHATSAPP', d.cliente_whatsapp],
            ['CORREO',   d.cliente_email],
            ['PROYECTO', <strong key="p">{d.tipo_titulo}</strong>],
          ]} />
        </EditZone>
        <EditZone id="doc_info" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1 }}>
          <KvTable topBorder rows={[
            ['EMISIÓN',      fmtDate(today)],
            ['VENCIMIENTO',  fmtDate(vencimiento)],
            ['MONEDA',       d.moneda === 'S/' ? 'SOLES' : 'DÓLARES'],
            ['CONDICIÓN',    d.condicion_doc ?? 'CRÉDITO / CUOTAS'],
            ['ENTREGA',      d.dias_entrega ?? '5 a 10 días hábiles'],
          ]} />
        </EditZone>
      </div>

      {/* ══ TABLA DE ITEMS ══════════════════════════════════════════════════ */}
      <EditZone id="lineas" activeZone={activeZone} onEdit={onEdit} style={{ marginBottom: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: '44%' }}>Descripción</th>
              <th style={{ ...S.th, width: '12%' }}>Unidad</th>
              <th style={{ ...S.th, width: '7%', textAlign: 'right' }}>Cant.</th>
              <th style={{ ...S.th, width: '13%', textAlign: 'right' }}>V. Unit.</th>
              <th style={{ ...S.th, width: '10%', textAlign: 'right' }}>Descto.</th>
              <th style={{ ...S.th, width: '14%', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(d.detalles || []).map((det, i) => {
              const precio = Number(det.precio ?? 0);
              const isDesc = precio < 0;
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={S.td}><strong style={{ textTransform: 'uppercase', fontSize: 8 }}>{det.etiqueta || det.descripcion}</strong></td>
                  <td style={S.td}>{isDesc ? '—' : 'SERVICIO'}</td>
                  <td style={S.tdRight}>{isDesc ? '—' : '1.00'}</td>
                  <td style={S.tdRight}>{isDesc ? '—' : `${d.moneda} ${fmt(Math.abs(precio))}`}</td>
                  <td style={S.tdRight}>{isDesc ? `- ${d.moneda} ${fmt(Math.abs(precio))}` : '—'}</td>
                  <td style={{ ...S.tdRight, fontWeight: 700 }}>{isDesc ? `- ${d.moneda} ${fmt(Math.abs(precio))}` : `${d.moneda} ${fmt(Math.abs(precio))}`}</td>
                </tr>
              );
            })}
            {Array.from({ length: lineasVacias }).map((_, i) => (
              <tr key={`e-${i}`} style={{ background: ((d.detalles?.length ?? 0) + i) % 2 === 0 ? '#fff' : '#fafafa' }}>
                {[...Array(6)].map((__, j) => <td key={j} style={{ ...S.td, height: 18 }} />)}
              </tr>
            ))}
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', fontSize: 7, color: '#888', fontStyle: 'italic', padding: '4px 7px', borderTop: '1px solid #ccc', borderBottom: '2px solid #1a1a1a', letterSpacing: '0.04em' }}>
                SIN VALIDEZ TRIBUTARIA — DOCUMENTO REFERENCIAL DE PRESUPUESTO
              </td>
            </tr>
          </tbody>
        </table>
      </EditZone>

      {/* ══ TOTALES — alineados a la derecha con columnas fijas ═════════════ */}
      <EditZone id="igv" activeZone={activeZone} onEdit={onEdit} style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {[['SUBTOTAL', fmt(subtotal)], [`I.G.V. ${d.igv_pct ?? 0}%`, fmt(igvMonto)]].map(([l, v], i) => (
                <tr key={i}>
                  <td style={S.amtLbl}>{l}</td>
                  <td style={S.amtVal}>{d.moneda} {v}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} style={{ paddingTop: 3 }}>
                  <div style={{
                    background: 'linear-gradient(90deg,#0f172a 0%,#1d4ed8 100%)',
                    color: '#fff', padding: '5px 10px', borderRadius: 2,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: 32,
                  }}>
                    <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>TOTAL A PAGAR</span>
                    <span style={{ fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {d.moneda} {fmt(subtotal + igvMonto)}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </EditZone>

      {/* ══ ALCANCE + HOSTING (2 columnas) ══════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>

        {/* ALCANCE DEL PROYECTO */}
        <EditZone id="alcance" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1, minWidth: 0 }}>
          <div style={S.secHdr('#0f172a')}>
            <span style={S.dot('#3b82f6')} />ALCANCE DEL PROYECTO
          </div>
          <div style={{ background: '#f8fafc', padding: '5px 10px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 12px' }}>
              {(d.alcance ?? DEF_ALCANCE).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, padding: '1.5px 0', fontSize: 7.5 }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 900, flexShrink: 0, fontSize: 10, lineHeight: '10px' }}>·</span>
                  <span style={{ color: '#1e293b' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </EditZone>

        {/* HOSTING INCLUIDO */}
        <EditZone id="hosting" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1, minWidth: 0 }}>
          <div style={S.secHdr('#1d4ed8')}>
            <span style={S.dot('#93c5fd')} />HOSTING — 1.ER AÑO GRATIS
          </div>
          <KvTable
            rows={(d.hosting ?? DEF_HOSTING).map((r) => [r.label, r.valor])}
            borderColor="#bfdbfe"
            lblBg1="#eff6ff" lblBg2="#dbeafe" lblColor="#1e40af"
            valBg1="#fff" valBg2="#f0f7ff" borderColorCell="#bfdbfe"
          />
        </EditZone>
      </div>

      {/* ══ TECNOLOGÍAS + CONDICIONES (2 columnas) ══════════════════════════ */}
      <EditZone id="tecnologias" activeZone={activeZone} onEdit={onEdit} style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.secHdr('#374151')}><span style={S.dot('#9ca3af')} />TECNOLOGÍAS UTILIZADAS</div>
            <KvTable
              rows={(d.tecnologias ?? DEF_TECNOLOGIAS).map((r) => [r.label, r.valor])}
              borderColor="#e2e8f0" lblBg1="#f1f5f9" lblBg2="#e8ecf0" lblColor="#374151"
              valBg1="#fff" valBg2="#fafafa"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.secHdr('#065f46')}><span style={S.dot('#6ee7b7')} />CONDICIONES Y TÉRMINOS</div>
            <KvTable
              rows={(d.condiciones_terminos ?? DEF_CONDICIONES_TERMINOS).map((r) => [r.label, r.valor])}
              borderColor="#d1fae5" lblBg1="#f0fdf4" lblBg2="#dcfce7" lblColor="#065f46"
              valBg1="#fff" valBg2="#f7fef9" borderColorCell="#d1fae5"
            />
          </div>
        </div>
      </EditZone>

      {/* ══ FOOTER — 3 zonas en barra compacta ══════════════════════════════ */}
      <div style={{ borderTop: '1.5px solid #1a1a1a', paddingTop: 5, marginTop: 4 }}>

        {/* Fila 1: Elaborado + Condición (una línea) */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 4, alignItems: 'center',
          background: '#f8fafc', borderRadius: 2, padding: '3px 8px',
          border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1, fontSize: 7 }}>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: '#555', letterSpacing: '0.04em', marginRight: 5 }}>ELABORADO POR</span>
            <span style={{ color: '#c07000', fontWeight: 600 }}>{d.elaborado?.nombre ?? DEF_ELABORADO.nombre}</span>
            <span style={{ color: '#888' }}> · {fmtDate(today)}</span>
          </div>
          <div style={{ width: 1, background: '#e2e8f0', alignSelf: 'stretch' }} />
          <EditZone id="condicion_pago" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1 }}>
            <div style={{ fontSize: 7 }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', color: '#555', letterSpacing: '0.04em', marginRight: 5 }}>CONDICIÓN</span>
              <span style={{ fontWeight: 600 }}>{d.condicion_texto ?? DEF_CONDICION_TEXTO}</span>
            </div>
          </EditZone>
        </div>

        {/* Fila 2: Plan de pagos (col izq) + Datos de pago (col der) */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 5 }}>

          {/* Plan de pagos */}
          <EditZone id="plan_pagos" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 2, padding: '4px 8px' }}>
              <div style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', color: '#9a3412', letterSpacing: '0.05em', marginBottom: 3 }}>
                📋 PLAN DE PAGOS
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Cuota', 'Monto', 'Nota'].map((h) => (
                      <th key={h} style={{ fontSize: 6.5, fontWeight: 700, color: '#555', textTransform: 'uppercase', padding: '1px 4px', textAlign: h === 'Monto' ? 'right' : 'left', borderBottom: '1px solid #fed7aa', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planPagos.map((p, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fff7ed' }}>
                      <td style={{ fontSize: 7, padding: '1.5px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.cuota}</td>
                      <td style={{ fontSize: 7, padding: '1.5px 4px', fontWeight: 700, color: '#c07000', textAlign: 'right', whiteSpace: 'nowrap' }}>{p.monto}</td>
                      <td style={{ fontSize: 6.5, padding: '1.5px 4px', color: '#444' }}>{p.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EditZone>

          {/* Datos de pago */}
          <EditZone id="datos_pago" activeZone={activeZone} onEdit={onEdit} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2, padding: '4px 8px' }}>
              <div style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', color: '#075985', letterSpacing: '0.05em', marginBottom: 3 }}>
                🏦 DATOS DE PAGO
              </div>
              {(d.datos_pago_lineas ?? DEF_DATOS_PAGO).map((linea, i) => (
                <div key={i} style={{ fontSize: 7, fontWeight: i % 2 === 0 ? 700 : 400, color: i % 2 === 0 ? '#0c4a6e' : '#1a1a1a', marginBottom: i % 2 === 0 ? 0 : 3, lineHeight: 1.3 }}>
                  {linea}
                </div>
              ))}
              {(d.nota_entrega ?? DEF_NOTA_ENTREGA) && (
                <div style={{ marginTop: 3, fontSize: 6.5, color: '#666', fontStyle: 'italic', borderTop: '1px dashed #bae6fd', paddingTop: 2, lineHeight: 1.3 }}>
                  {d.nota_entrega ?? DEF_NOTA_ENTREGA}
                </div>
              )}
            </div>
          </EditZone>
        </div>
      </div>

      {/* ══ FIRMA + QR — fila final compacta ════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 6, borderTop: '1px solid #e0e0e0' }}>
        {/* QR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 40, height: 40, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6.5, color: '#bbb', textAlign: 'center', background: '#f8f8f8', flexShrink: 0 }}>
            QR<br/>CODE
          </div>
          <div>
            <div style={{ fontSize: 6.5, color: '#3b82f6', fontWeight: 600 }}>Ver proforma en línea</div>
            <div style={{ fontSize: 6, color: '#aaa' }}>Válido hasta {fmtDate(vencimiento)}</div>
          </div>
        </div>

        {/* Pie centrado */}
        <div style={{ textAlign: 'center', fontSize: 6.5, color: '#999' }}>
          <strong style={{ color: '#555' }}>{d.empresa?.nombre ?? 'royalsensorymassage'}™</strong>
          {' — '}{d.empresa?.web ?? 'www.royalsensorymassage.com'}{' · '}{d.codigo}
        </div>

        {/* Firma */}
        <EditZone id="firma" activeZone={activeZone} onEdit={onEdit}>
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div style={{ borderBottom: '1.5px solid #1a1a1a', marginBottom: 4, width: '100%' }} />
            <div style={{ fontSize: 8, fontWeight: 700 }}>{d.elaborado?.nombre ?? DEF_ELABORADO.nombre}</div>
            <div style={{ fontSize: 6.5, color: '#555' }}>{d.elaborado?.cargo ?? DEF_ELABORADO.cargo}</div>
            <div style={{ fontSize: 6.5, color: '#1d4ed8', fontWeight: 700 }}>{d.elaborado?.empresa ?? DEF_ELABORADO.empresa}</div>
          </div>
        </EditZone>
      </div>

    </Box>
  );
}

// ─── Editors por zona ────────────────────────────────────────────────────────
function KvRowsEditor({ rows, onChange }) {
  const set    = (i, key, val) => onChange(rows.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const add    = () => onChange([...rows, { label: '', valor: '' }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  return (
    <Stack spacing={1}>
      {rows.map((row, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" value={row.label} placeholder="Etiqueta"
            onChange={(e) => set(i, 'label', e.target.value)}
            sx={{ width: 120, flexShrink: 0 }} InputProps={{ sx: { fontSize: '0.8rem' } }} />
          <TextField size="small" value={row.valor} placeholder="Valor"
            onChange={(e) => set(i, 'valor', e.target.value)}
            fullWidth InputProps={{ sx: { fontSize: '0.8rem' } }} />
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#ef4444', flexShrink: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={add}
        sx={{ alignSelf: 'flex-start', color: '#1d4ed8', fontWeight: 600, fontSize: '0.78rem' }}>
        Agregar fila
      </Button>
    </Stack>
  );
}

function ListaLineasEditor({ lineas, onChange }) {
  const set    = (i, val) => onChange(lineas.map((r, idx) => idx === i ? val : r));
  const add    = () => onChange([...lineas, '']);
  const remove = (i) => onChange(lineas.filter((_, idx) => idx !== i));
  return (
    <Stack spacing={1}>
      {lineas.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" value={item} placeholder="Línea de texto"
            onChange={(e) => set(i, e.target.value)}
            fullWidth multiline maxRows={2}
            InputProps={{ sx: { fontSize: '0.8rem' } }} />
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#ef4444', flexShrink: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={add}
        sx={{ alignSelf: 'flex-start', color: '#1d4ed8', fontWeight: 600, fontSize: '0.78rem' }}>
        Agregar línea
      </Button>
    </Stack>
  );
}

const ZONE_META = {
  empresa:             { label: 'Datos de la empresa',          color: '#1d4ed8' },
  elaborado:           { label: 'Elaborado por / firma',        color: '#7c3aed' },
  cliente:             { label: 'Datos del cliente',            color: '#0891b2' },
  doc_info:            { label: 'Info del documento',           color: '#0d9488' },
  lineas:              { label: 'Ítems / tabla de servicios',   color: '#b45309' },
  igv:                 { label: 'IGV y totales',                color: '#374151' },
  alcance:             { label: 'Alcance del proyecto',         color: '#0f172a' },
  hosting:             { label: 'Hosting incluido',             color: '#1d4ed8' },
  tecnologias:         { label: 'Tecnologías y condiciones',    color: '#374151' },
  condicion_pago:      { label: 'Condición de pago',            color: '#059669' },
  plan_pagos:          { label: 'Plan de pagos',                color: '#059669' },
  datos_pago:          { label: 'Datos de pago / cuenta',       color: '#7c3aed' },
  firma:               { label: 'Firma y cargo',                color: '#1d4ed8' },
};

function DrawerContent({ zone, data, onChange }) {
  if (!zone) return null;
  const c = (key) => (e) => onChange({ [key]: e.target.value });
  const Field = ({ label, field, multiline, rows: r, helperText }) => (
    <Box>
      <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField fullWidth size="small" value={data[field] ?? ''} helperText={helperText}
        onChange={c(field)} multiline={multiline} rows={r}
        InputProps={{ sx: { fontSize: '0.84rem' } }} />
    </Box>
  );

  // ── empresa ──────────────────────────────────────────────────────────────
  if (zone === 'empresa') {
    const emp = data.empresa ?? DEF_EMPRESA;
    const setEmp = (key, val) => onChange({ empresa: { ...emp, [key]: val } });
    const EmpField = ({ label, k }) => (
      <Box>
        <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>{label}</Typography>
        <TextField fullWidth size="small" value={emp[k] ?? ''} onChange={(e) => setEmp(k, e.target.value)} InputProps={{ sx: { fontSize: '0.84rem' } }} />
      </Box>
    );
    return (
      <Stack spacing={2}>
        <EmpField label="Nombre empresa" k="nombre" />
        <EmpField label="Subtítulo / Slogan" k="subtitulo" />
        <EmpField label="Ciudad / País" k="ciudad" />
        <EmpField label="Correo" k="email" />
        <EmpField label="Web" k="web" />
        <EmpField label="Teléfono" k="telefono" />
      </Stack>
    );
  }

  // ── elaborado / firma ─────────────────────────────────────────────────────
  if (zone === 'elaborado' || zone === 'firma') {
    const el = data.elaborado ?? DEF_ELABORADO;
    const setEl = (key, val) => onChange({ elaborado: { ...el, [key]: val } });
    const ElField = ({ label, k }) => (
      <Box>
        <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>{label}</Typography>
        <TextField fullWidth size="small" value={el[k] ?? ''} onChange={(e) => setEl(k, e.target.value)} InputProps={{ sx: { fontSize: '0.84rem' } }} />
      </Box>
    );
    return (
      <Stack spacing={2}>
        <ElField label="Nombre completo" k="nombre" />
        <ElField label="Cargo / Profesión" k="cargo" />
        <ElField label="Empresa" k="empresa" />
      </Stack>
    );
  }

  // ── cliente ───────────────────────────────────────────────────────────────
  if (zone === 'cliente') {
    return (
      <Stack spacing={2}>
        <Field label="Nombre" field="cliente_nombre" />
        <Field label="Empresa" field="cliente_empresa" />
        <Field label="WhatsApp" field="cliente_whatsapp" />
        <Field label="Correo" field="cliente_email" />
        <Field label="Tiempo de entrega" field="dias_entrega" helperText="Ej: 5 a 10 días hábiles" />
      </Stack>
    );
  }

  // ── doc_info ──────────────────────────────────────────────────────────────
  if (zone === 'doc_info') {
    return (
      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Condición del documento
          </Typography>
          <TextField fullWidth size="small" value={data.condicion_doc ?? 'CRÉDITO / CUOTAS'}
            onChange={(e) => onChange({ condicion_doc: e.target.value })}
            InputProps={{ sx: { fontSize: '0.84rem' } }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Días de vigencia (vencimiento)
          </Typography>
          <TextField fullWidth size="small" type="number"
            value={data.vigencia_dias ?? 5}
            onChange={(e) => onChange({ vigencia_dias: Number(e.target.value) })}
            inputProps={{ min: 1, max: 365 }}
            helperText="Por defecto 5 días desde la fecha de emisión"
            InputProps={{ sx: { fontSize: '0.84rem' } }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Moneda
          </Typography>
          <FormControl fullWidth size="small">
            <Select value={data.moneda ?? 'S/'} onChange={(e) => onChange({ moneda: e.target.value })}
              sx={{ fontSize: '0.84rem' }}>
              <MuiMenuItem value="S/">Soles (S/)</MuiMenuItem>
              <MuiMenuItem value="$">Dólares ($)</MuiMenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
    );
  }

  // ── lineas (ítems tabla) ──────────────────────────────────────────────────
  if (zone === 'lineas') {
    return (
      <Stack spacing={2}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
          Los ítems reflejan los detalles de la cotización. Puedes ajustar la cantidad de filas vacías de relleno.
        </Typography>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Filas vacías de relleno
          </Typography>
          <TextField fullWidth size="small" type="number"
            value={data.lineas_vacias ?? 0}
            onChange={(e) => onChange({ lineas_vacias: Number(e.target.value) })}
            inputProps={{ min: 0, max: 15 }}
            helperText="Filas en blanco para completar el aspecto del documento"
            InputProps={{ sx: { fontSize: '0.84rem' } }} />
        </Box>
      </Stack>
    );
  }

  // ── igv ───────────────────────────────────────────────────────────────────
  if (zone === 'igv') {
    return (
      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Porcentaje IGV (%)
          </Typography>
          <TextField fullWidth size="small" type="number"
            value={data.igv_pct ?? 0}
            onChange={(e) => onChange({ igv_pct: Number(e.target.value) })}
            inputProps={{ min: 0, max: 100, step: 1 }}
            helperText="0 para exonerado, 18 para IGV estándar"
            InputProps={{ sx: { fontSize: '0.84rem' } }} />
        </Box>
      </Stack>
    );
  }

  // ── alcance ───────────────────────────────────────────────────────────────
  if (zone === 'alcance') {
    return (
      <Stack spacing={2}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
          Lista de funcionalidades / entregables incluidos en el proyecto. Cada línea aparece como un bullet.
        </Typography>
        <ListaLineasEditor
          lineas={data.alcance ?? DEF_ALCANCE}
          onChange={(lineas) => onChange({ alcance: lineas })}
        />
      </Stack>
    );
  }

  // ── hosting ───────────────────────────────────────────────────────────────
  if (zone === 'hosting') {
    return (
      <Stack spacing={2}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
          Tabla de hosting incluido. Puedes modificar o agregar filas según el plan ofrecido.
        </Typography>
        <KvRowsEditor
          rows={data.hosting ?? DEF_HOSTING}
          onChange={(rows) => onChange({ hosting: rows })}
        />
      </Stack>
    );
  }

  // ── tecnologias ───────────────────────────────────────────────────────────
  if (zone === 'tecnologias') {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
            Tecnologías utilizadas
          </Typography>
          <KvRowsEditor
            rows={data.tecnologias ?? DEF_TECNOLOGIAS}
            onChange={(rows) => onChange({ tecnologias: rows })}
          />
        </Box>
        <Divider />
        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
            Condiciones y términos
          </Typography>
          <KvRowsEditor
            rows={data.condiciones_terminos ?? DEF_CONDICIONES_TERMINOS}
            onChange={(rows) => onChange({ condiciones_terminos: rows })}
          />
        </Box>
      </Stack>
    );
  }

  // ── condicion_pago ────────────────────────────────────────────────────────
  if (zone === 'condicion_pago') {
    return (
      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Texto condición de pago
          </Typography>
          <TextField fullWidth size="small"
            value={data.condicion_texto ?? DEF_CONDICION_TEXTO}
            onChange={(e) => onChange({ condicion_texto: e.target.value })}
            InputProps={{ sx: { fontSize: '0.84rem' } }} />
        </Box>
      </Stack>
    );
  }

  // ── plan_pagos ────────────────────────────────────────────────────────────
  if (zone === 'plan_pagos') {
    const slug    = data.tipoSlug || 'web';
    const key     = slug === 'landing' ? 'landing' : 'default';
    const cfg     = data.planPagosConfig ?? {};
    const cuotas  = cfg[key] ?? DEF_PLAN_PAGOS[key];
    const montos  = computePlanPagos(data.total, data.moneda, slug, cfg);
    const stripPct = (arr) => arr.map(({ cuota, nota }) => ({ cuota, nota }));
    const setKey  = (nc) => onChange({ planPagosConfig: { ...cfg, [key]: stripPct(nc) } });
    return (
      <Stack spacing={2}>
        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
          {slug === 'landing' ? 'Cuotas — Landing Page' : 'Cuotas — Proyectos estándar'}
        </Typography>
        <Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic', mt: -1 }}>
          Total {data.moneda} {fmt(data.total)} ÷ {cuotas.length} cuota{cuotas.length !== 1 ? 's' : ''} (mayor monto en la 1.ª).
        </Typography>
        {cuotas.map((cu, i) => (
          <Box key={i} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: '8px', bgcolor: '#f8fafc' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField size="small" label="Nombre" value={cu.cuota}
                  onChange={(e) => { const n = [...cuotas]; n[i] = { ...n[i], cuota: e.target.value }; setKey(n); }}
                  sx={{ flex: 1 }} InputProps={{ sx: { fontSize: '0.82rem' } }} />
                <Chip label={montos[i]?.monto ?? '—'} size="small"
                  sx={{ fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669', flexShrink: 0 }} />
                <IconButton size="small" onClick={() => setKey(cuotas.filter((_, idx) => idx !== i))}
                  sx={{ color: '#ef4444' }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
              <TextField size="small" label="Nota" value={cu.nota}
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
      </Stack>
    );
  }

  // ── datos_pago ────────────────────────────────────────────────────────────
  if (zone === 'datos_pago') {
    return (
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Cuentas bancarias / Medios de pago
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mb: 1 }}>
            Líneas con nombre de banco se muestran en negrita. Las que siguen (CCI, N.° cuenta) en texto normal.
          </Typography>
          <ListaLineasEditor
            lineas={data.datos_pago_lineas ?? DEF_DATOS_PAGO}
            onChange={(lineas) => onChange({ datos_pago_lineas: lineas })}
          />
        </Box>
        <Divider />
        <Box>
          <Typography sx={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
            Nota de entrega / condición adicional
          </Typography>
          <TextField
            fullWidth multiline rows={3} size="small"
            value={data.nota_entrega ?? DEF_NOTA_ENTREGA}
            onChange={(e) => onChange({ nota_entrega: e.target.value })}
            InputProps={{ sx: { fontSize: '0.82rem' } }}
            helperText="Aparece en cursiva debajo de los datos de pago"
          />
        </Box>
      </Stack>
    );
  }

  return null;
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ProformaPdfCanvasEditor({ presupuesto: rowData, onBack, onUpdated, isNew = false }) {
  const id = rowData?.id_presupuesto;

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [d,          setD]          = useState(null);

  const drawerOpen = Boolean(activeZone);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pres, cfg] = await Promise.all([verPresupuesto(id), listarConfig()]);
      const pc = cfg?.proforma_config ?? {};
      setD({
        // presupuesto
        codigo:           pres.codigo            ?? '',
        cliente_nombre:   pres.cliente_nombre    ?? '',
        cliente_empresa:  pres.cliente_empresa   ?? '',
        cliente_whatsapp: pres.cliente_whatsapp  ?? '',
        cliente_email:    pres.cliente_email     ?? '',
        dias_entrega:     pres.dias_entrega      ?? '5 a 10 días hábiles',
        tipo_titulo:      pres.tipo_titulo       ?? '',
        tipoSlug:         pres.tipo?.slug        ?? '',
        detalles:         pres.detalles          ?? [],
        total:            pres.total             ?? 0,
        subtotal:         pres.subtotal          ?? 0,
        // config global (reutiliza plan_pagos de cotización)
        moneda:           cfg?.moneda            ?? 'S/',
        planPagosConfig:  sanitizePlanPagosConfig(cfg?.plan_pagos_config ?? null),
        // config proforma
        empresa:              pc.empresa              ?? DEF_EMPRESA,
        elaborado:            pc.elaborado            ?? DEF_ELABORADO,
        datos_pago_lineas:    pc.datos_pago_lineas    ?? DEF_DATOS_PAGO,
        nota_entrega:         pc.nota_entrega         ?? DEF_NOTA_ENTREGA,
        condicion_texto:      pc.condicion_texto      ?? DEF_CONDICION_TEXTO,
        condicion_doc:        pc.condicion_doc        ?? 'CRÉDITO / CUOTAS',
        vigencia_dias:        pc.vigencia_dias        ?? 5,
        igv_pct:              pc.igv_pct              ?? 0,
        lineas_vacias:        pc.lineas_vacias        ?? 0,
        alcance:              pc.alcance              ?? DEF_ALCANCE,
        hosting:              pc.hosting              ?? DEF_HOSTING,
        tecnologias:          pc.tecnologias          ?? DEF_TECNOLOGIAS,
        condiciones_terminos: pc.condiciones_terminos ?? DEF_CONDICIONES_TERMINOS,
      });
    } catch (e) { handleErrorMessages('Error', e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleChange = useCallback((partial) => {
    setD((prev) => prev ? { ...prev, ...partial } : prev);
  }, []);

  const handleSave = async () => {
    if (!d) return;
    setSaving(true);
    try {
      // Guardar datos del cliente en presupuesto
      await actualizarPresupuesto(id, {
        cliente_nombre:   d.cliente_nombre,
        cliente_empresa:  d.cliente_empresa,
        cliente_whatsapp: d.cliente_whatsapp,
        cliente_email:    d.cliente_email,
        dias_entrega:     d.dias_entrega,
      });
      // Guardar config proforma en el config global
      await guardarConfig({
        plan_pagos_config: sanitizePlanPagosConfig(d.planPagosConfig),
        proforma_config: {
          empresa:              d.empresa,
          elaborado:            d.elaborado,
          datos_pago_lineas:    d.datos_pago_lineas,
          nota_entrega:         d.nota_entrega,
          condicion_texto:      d.condicion_texto,
          condicion_doc:        d.condicion_doc,
          vigencia_dias:        d.vigencia_dias,
          igv_pct:              d.igv_pct,
          lineas_vacias:        d.lineas_vacias,
          alcance:              d.alcance,
          hosting:              d.hosting,
          tecnologias:          d.tecnologias,
          condiciones_terminos: d.condiciones_terminos,
        },
      });
      toastSuccess('Proforma actualizada');
      setSaved(true);
      onUpdated?.(d);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { handleErrorMessages('Error al guardar', e); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <CircularProgress sx={{ color: '#1d4ed8' }} />
      </Box>
    );
  }

  const zoneMeta = activeZone ? ZONE_META[activeZone] : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f0f4f8', minHeight: '100vh' }}>

      {/* ── BARRA SUPERIOR ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 50,
        bgcolor: '#fff', borderBottom: '1px solid #e2e8f0',
        px: 2.5, py: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
            onClick={onBack} size="small"
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none', fontSize: '0.82rem' }}
          >
            Volver al listado
          </Button>
          <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={d?.codigo} size="small"
              sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(29,78,216,0.08)', color: '#1d4ed8', fontSize: '0.72rem' }} />
            <Chip label="PROFORMA" size="small"
              sx={{ fontWeight: 700, bgcolor: 'rgba(29,78,216,0.12)', color: '#1d4ed8', fontSize: '0.70rem' }} />
            {isNew && (
              <Chip label="✨ Recién creada — personaliza el PDF"
                size="small"
                sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: '0.70rem', display: { xs: 'none', md: 'flex' } }} />
            )}
            <Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', display: { xs: 'none', md: 'block' } }}>
              Haz clic en el ✏️ de cualquier sección para editarla
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : saved ? <CheckCircleIcon /> : <SaveOutlinedIcon />}
          onClick={handleSave} disabled={saving}
          sx={{
            bgcolor: saved ? '#10b981' : '#1d4ed8', fontWeight: 700,
            borderRadius: '10px', px: 2.5, fontSize: '0.84rem',
            '&:hover': { bgcolor: saved ? '#059669' : '#1e3a8a' },
          }}
        >
          {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar cambios'}
        </Button>
      </Box>

      {/* ── CANVAS + PANEL DERECHO ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* CANVAS */}
        <Box sx={{
          flex: 1, overflowY: 'auto',
          p: { xs: 1.5, md: 3 },
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        }}>
          <Box sx={{
            width: '100%', maxWidth: 794,
            bgcolor: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
            borderRadius: 1, overflow: 'hidden', mb: 4,
          }}>
            {d && <ProformaCanvas d={d} activeZone={activeZone} onEdit={setActiveZone} />}
          </Box>
        </Box>

        {/* PANEL LATERAL DERECHO */}
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
              {/* Header panel */}
              <Box sx={{
                px: 2.5, py: 1.8, flexShrink: 0,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: zoneMeta?.color ?? '#1d4ed8',
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

              {/* Body panel */}
              <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
                {d && activeZone && (
                  <DrawerContent zone={activeZone} data={d} onChange={handleChange} />
                )}
              </Box>

              {/* Footer panel */}
              <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{ bgcolor: '#1d4ed8', fontWeight: 700, borderRadius: '10px', '&:hover': { bgcolor: '#1e3a8a' } }}>
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
