/**
 * ContratoPdfCanvasEditor — CMS completo del contrato
 * CADA sección, título, párrafo y lista es editable con ✏️
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, IconButton, Divider,
  CircularProgress, Chip, Tooltip, TextField,
} from '@mui/material';
import EditIcon          from '@mui/icons-material/Edit';
import CloseIcon         from '@mui/icons-material/Close';
import SaveOutlinedIcon  from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon     from '@mui/icons-material/ArrowBack';
import FileDownloadIcon  from '@mui/icons-material/FileDownload';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import AddIcon           from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArticleIcon       from '@mui/icons-material/ArticleOutlined';

import {
  verPresupuesto, actualizarPresupuesto,
  fetchPresupuestoContratoPdf, descargarPresupuestoContratoPdf,
} from '../../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';

// ─── Estilos PDF ──────────────────────────────────────────────────────────────
const C = {
  page:  { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 10, color: '#111', lineHeight: 1.55, background: '#fff', padding: '44px 48px', width: '100%', boxSizing: 'border-box' },
  h1:    { fontSize: 17, fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  h1sub: { fontSize: 10, textAlign: 'center', fontStyle: 'italic', color: '#444', marginBottom: 16 },
  clauseTitle: { fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.3, color: '#1a1a1a', borderBottom: '1.5px solid #1a1a1a', paddingBottom: 4, marginBottom: 8, marginTop: 20 },
  p:     { textAlign: 'justify', marginBottom: 6, fontSize: 10 },
  bullet: { display: 'flex', gap: 6, marginBottom: 3, fontSize: 10 },
  subTitle: { fontWeight: 700, textTransform: 'uppercase', fontSize: 10, marginTop: 10, marginBottom: 4 },
  thCell: { background: '#1a3a6b', color: '#fff', fontWeight: 700, padding: '6px 8px', textAlign: 'left', border: '1px solid #ccc', fontSize: 9.5 },
  tdCell: { padding: '5px 8px', border: '1px solid #ddd', verticalAlign: 'top', fontSize: 9.5 },
  tdAlt:  { padding: '5px 8px', border: '1px solid #ddd', verticalAlign: 'top', fontSize: 9.5, background: '#f9f9f9' },
  tdTotal:{ padding: '5px 8px', border: '1px solid #ccc', fontWeight: 900, background: '#1a3a6b', color: '#fff', fontSize: 9.5, textAlign: 'right' },
  tableWrap: { width: '100%', borderCollapse: 'collapse', fontSize: 9.5, marginBottom: 12 },
  sigBox: { border: '1px dashed #aaa', padding: '12px 16px', minHeight: 100, background: '#fafafa' },
  sigName: { fontWeight: 900, textTransform: 'uppercase', fontSize: 10, marginTop: 8 },
  sigSub: { fontSize: 9, color: '#555' },
  footerLine: { textAlign: 'center', fontSize: 8.5, color: '#555', borderTop: '1px solid #ccc', paddingTop: 6, marginTop: 24 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Math.round(Number(n ?? 0)).toLocaleString('es-PE');

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}_ de __${String(d.getMonth()+1).padStart(2,'0')}__________ del ${d.getFullYear()}.`;
};

function splitCuotas(total, n) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const count = Math.max(1, n);
  const base  = Math.floor(t / count);
  const extra = t - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0));
}

const DEF_PLAN = {
  default: [
    { cuota: 'Inicio del proyecto',  nota: 'Al contratar' },
    { cuota: 'Avance del proyecto',  nota: 'Al presentar el diseño aprobado' },
    { cuota: 'Entrega del proyecto', nota: 'Al entregar el proyecto terminado' },
  ],
  landing: [
    { cuota: 'Inicio del proyecto',  nota: 'Al contratar' },
    { cuota: 'Entrega del proyecto', nota: 'Al entregar el proyecto terminado' },
  ],
};

function derivarEtapas(d) {
  const key    = (d.tipoSlug || '') === 'landing' ? 'landing' : 'default';
  const config = d.planPagosConfig;
  const cuotas = (config?.[key]?.length > 0 ? config[key] : null) ?? DEF_PLAN[key];
  const montos = splitCuotas(d.total, cuotas.length);
  return cuotas.map((c, i) => ({ n: i+1, etapa: c.cuota || `Etapa ${i+1}`, incluye: c.nota || '', cuando: c.nota || 'Al contratar', monto: montos[i] }));
}

function derivarObjeto(d) {
  const items = [];
  (d.includes || []).forEach(it => items.push(typeof it === 'string' ? it : (it.texto || it.label || '')));
  (d.funcionalidades || []).filter(f => f.incluido !== false)
    .forEach(f => items.push(typeof f === 'string' ? f : (f.nombre || f.label || f.funcionalidad || '')));
  return items.filter(Boolean).length > 0 ? items.filter(Boolean) : ['Servicio de desarrollo web profesional.'];
}

// ─── DEFAULTS texto de cláusulas ──────────────────────────────────────────────
const DEF = {
  titulo_doc: 'CONTRATO DE PRESTACIÓN DE SERVICIOS',
  titulo_primero: 'PRIMERO — OBJETO DEL CONTRATO',
  titulo_segundo: 'SEGUNDO — ETAPAS Y PLAZOS',
  titulo_tercero: 'TERCERO — PRECIO Y FORMA DE PAGO',
  titulo_cuarto:  'CUARTO — OBLIGACIONES DE LAS PARTES',
  titulo_cuarto_dev: 'A. Obligaciones de EL DESARROLLADOR:',
  titulo_cuarto_cli: 'B. Obligaciones de EL CLIENTE:',
  titulo_quinto:  'QUINTO — CLÁUSULA DE SUSPENSIÓN POR FALTA DE INFORMACIÓN',
  titulo_sexto:   'SEXTO — TECNOLOGÍAS UTILIZADAS',
  titulo_septimo: 'SÉPTIMO — ENTREGABLES',
  titulo_octavo:  'OCTAVO — PROPIEDAD INTELECTUAL',
  titulo_noveno:  'NOVENO — CONFIDENCIALIDAD',
  titulo_decimo:  'DÉCIMO — RESOLUCIÓN DEL CONTRATO',
  titulo_decimo1: 'DÉCIMO PRIMERO — SOLUCIÓN DE CONTROVERSIAS',
  titulo_decimo2: 'DÉCIMO SEGUNDO — DISPOSICIONES FINALES',
  objeto_intro: 'El objeto del presente contrato es que EL DESARROLLADOR realice, en favor de EL CLIENTE, los siguientes servicios:',
  objeto_anexo: 'El alcance detallado y las especificaciones técnicas están contenidos en el documento COTIZACIÓN N.º {codigo} que forma parte integrante del presente contrato como Anexo I.',
  segundo_intro: 'El proyecto se desarrollará en {n} etapas de entrega, con el siguiente detalle:',
  tercero_intro: 'EL CLIENTE se obliga a pagar a EL DESARROLLADOR la suma total de {total}, cancelada de la siguiente manera:',
  tercero_cuotas_label: 'Pago en {n} cuota(s) sin intereses:',
  tercero_footer: 'Los pagos podrán realizarse mediante transferencia bancaria, Yape, Plin u otro medio acordado por las Partes. EL DESARROLLADOR emitirá el comprobante de pago correspondiente conforme a la normativa tributaria vigente.',
  tercero_igv: 'Los precios indicados no incluyen IGV. En caso de requerirse factura con IGV, el monto total se ajustará en consecuencia. Desde el segundo año, la renovación anual del hosting y dominio tiene un costo de S/ 140.00, a cargo de EL CLIENTE.',
  quinto_p1: 'Si transcurridos quince (15) días calendario desde la firma del presente contrato EL CLIENTE no entrega la totalidad de la información, contenidos o insumos necesarios para el avance del proyecto, EL DESARROLLADOR podrá dar por archivado el proyecto, sin obligación de devolver los pagos ya realizados.',
  quinto_p2: 'En caso de que EL CLIENTE solicite la reactivación del proyecto en una fecha posterior, las partes reconocen que podrán existir ajustes en los plazos, condiciones y precios inicialmente acordados, los cuales deberán ser establecidos nuevamente por acuerdo mutuo y en documento escrito.',
  sexto_intro: 'El desarrollo del proyecto empleará las siguientes tecnologías, de uso libre, open source o bajo licencia incluida en el precio acordado:',
  septimo_intro: 'Al término del proyecto, EL DESARROLLADOR entregará a EL CLIENTE:',
  octavo_p1: 'Una vez efectuado el pago total del precio acordado, EL CLIENTE adquirirá la titularidad del código fuente y los activos digitales desarrollados específicamente para su proyecto. EL DESARROLLADOR podrá conservar en su portafolio profesional una referencia general al proyecto, sin revelar información confidencial.',
  octavo_p2: 'EL DESARROLLADOR se reserva el derecho de reutilizar componentes genéricos y librerías de su autoría que no sean exclusivos del negocio de EL CLIENTE.',
  noveno_p1: 'EL DESARROLLADOR se obliga a mantener en estricta reserva toda la información que reciba de EL CLIENTE con motivo del presente contrato, a no divulgarla total ni parcialmente a terceros y a no utilizarla para fines distintos a los aquí previstos.',
  noveno_p2: 'Al término o resolución del contrato, EL DESARROLLADOR devolverá o eliminará toda documentación física o digital de carácter confidencial que haya recibido de EL CLIENTE.',
  decimo_intro: 'El presente contrato podrá resolverse por cualquiera de las siguientes causas:',
  decimo_bullets: [
    'Por mutuo acuerdo de las partes, mediante documento escrito.',
    'Por incumplimiento grave de cualquiera de las obligaciones establecidas, conforme a lo previsto en el Código Civil peruano.',
    'Por imposibilidad sobreviniente debidamente acreditada.',
  ],
  decimo_final: 'En caso de resolución imputable a EL CLIENTE antes de la entrega final, los montos ya pagados no serán reembolsados. En caso de resolución imputable a EL DESARROLLADOR, este devolverá los montos proporcionales al trabajo no ejecutado.',
  decimo1_p: 'Toda controversia derivada o relacionada con el presente contrato que no pueda resolverse mediante trato directo entre las partes en un plazo de quince (15) días calendario, será sometida a mediación y, de no llegarse a acuerdo, a arbitraje ante el Centro de Arbitraje de la Cámara de Comercio de Lima, a cuyas normas, administración y decisiones las partes se someten de manera expresa e incondicional.',
  decimo2_p: 'El presente contrato se rige por las leyes de la República del Perú. Cualquier modificación deberá constar por escrito y ser suscrita por ambas partes. Este documento, junto con el Anexo I (Cotización N.º {codigo}), constituye el acuerdo íntegro entre las partes respecto al objeto aquí descrito.',
  firma_texto: 'En señal de conformidad, las Partes suscriben el presente contrato.',
  clausula_adicional: '',
  nota_plazos: 'Los plazos indicados son estimados bajo el supuesto de que EL CLIENTE colabora activamente, entregando la información requerida en tiempo oportuno.',
  dev_nombre: 'Jorge Jhovani Valverde León',
  dev_dni: '42774713', dev_ruc: '10427747137', dev_tel: '+51 970 048 451',
  dev_marca: 'royalsensorymassage Software Solutions & Innovation',
  obligaciones_dev: [
    'Ejecutar los servicios descritos de manera diligente y profesional.',
    'Mantener comunicación constante con EL CLIENTE sobre el avance del proyecto.',
    'Cumplir los plazos acordados, siempre que EL CLIENTE cumpla sus obligaciones.',
    'Guardar confidencialidad sobre la información proporcionada por EL CLIENTE.',
    'Entregar el código fuente, credenciales y archivos del proyecto al finalizarlo.',
    'Brindar soporte técnico por corrección de errores sin costo adicional, dentro del ciclo de desarrollo establecido.',
  ],
  obligaciones_cli: [
    'Pagar el precio acordado en los montos y plazos estipulados.',
    'Proveer oportunamente: logo en PNG o vectorial, textos e imágenes, colores aprobados y preferencias de diseño.',
    'Mantener comunicación activa y responder en un plazo razonable (máximo 3 días hábiles) a las consultas o solicitudes de aprobación.',
    'Aprobar de manera diligente los avances presentados por EL DESARROLLADOR.',
  ],
  tecnologias: [
    { label: 'Frontend Web', valor: 'React 18+ y Laravel 10+ superior SEO Básico' },
    { label: 'Servidor web', valor: 'LiteSpeed + LSCache (máxima velocidad de carga)' },
    { label: 'Seguridad',    valor: 'Imunify360 + SSL gratuito' },
    { label: 'Base de datos',valor: 'MySQL 8.2 (2 bases incluidas)' },
    { label: 'Hosting',      valor: 'SSD NVMe 10 GB, 2 CPU dedicados, 4 GB RAM' },
    { label: 'Dominio',      valor: 'Incluido y registrado por 1 año' },
  ],
  entregables: [
    'Sitio web funcional publicado en el dominio acordado.',
    'Código fuente completo del proyecto (frontend y backend).',
    'Acceso al panel administrador con usuario y contraseña propios del CLIENTE.',
    '10 cuentas de correo corporativo configuradas.',
    'Certificado SSL activo (HTTPS).',
    'Manual de uso básico del panel de administración.',
    'Credenciales de acceso al hosting, dominio y sistema.',
  ],
};

// ─── Resolución de valores (contrato guardado > default) ──────────────────────
const r = (cl, key, fallback) => cl[key] !== undefined ? cl[key] : (fallback !== undefined ? fallback : DEF[key] || '');

// ─── EditZone ──────────────────────────────────────────────────────────────────
function EditZone({ id, active, onEdit, children, style = {}, inline = false }) {
  const isA = active === id;
  const Tag = inline ? 'span' : Box;
  return (
    <Tag data-zone-id={id} sx={{
      position: 'relative', display: inline ? 'inline' : 'block',
      outline: isA ? '2px solid #1a3a6b' : '2px solid transparent',
      outlineOffset: 3, borderRadius: 1, transition: 'outline 0.15s',
      '&:hover .ez': { opacity: 1 }, ...style,
    }}>
      {children}
      <Box className="ez" onClick={e => { e.stopPropagation(); onEdit(id); }}
        sx={{
          position: 'absolute', top: -11, right: -11,
          opacity: isA ? 1 : 0, transition: 'opacity 0.15s', zIndex: 10, cursor: 'pointer',
          bgcolor: isA ? '#0a2a55' : '#1a3a6b', color: '#fff',
          borderRadius: '50%', width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(26,58,107,0.5)',
          '&:hover': { bgcolor: '#0a2a55', transform: 'scale(1.12)' },
        }}>
        <EditIcon sx={{ fontSize: 13 }} />
      </Box>
    </Tag>
  );
}

// ─── CANVAS del contrato ───────────────────────────────────────────────────────
function ContratoCanvas({ d, active, onEdit, draft = {} }) {
  // draft sobreescribe en tiempo real lo que hay en contrato guardado
  const cl = { ...(d.contrato || {}), ...draft };
  const t  = (key, fallback) => r(cl, key, fallback);

  const etapas   = cl.etapas   || derivarEtapas(d);
  const objeto   = cl.objeto   || derivarObjeto(d);
  const tecno    = t('tecnologias', DEF.tecnologias);
  const entrega  = t('entregables', DEF.entregables);
  const oblDev   = t('obligaciones_dev', DEF.obligaciones_dev);
  const oblCli   = t('obligaciones_cli', DEF.obligaciones_cli);
  const decBulls = t('decimo_bullets', DEF.decimo_bullets);

  const cli = {
    nombre:  t('cli_nombre',  d.cliente_nombre || d.cliente || ''),
    dni:     t('cli_dni',     d.cliente_dni    || ''),
    ruc:     t('cli_ruc',     d.cliente_ruc    || ''),
    tel:     t('cli_tel',     d.cliente_telefono || ''),
    empresa: t('cli_empresa', d.cliente_empresa  || ''),
  };

  const Bullet = ({ text }) => (
    <div style={C.bullet}><span style={{ flexShrink: 0, marginTop: 2 }}>•</span><span>{text}</span></div>
  );

  const ClauseTitle = ({ id, children }) => (
    <EditZone id={id} active={active} onEdit={onEdit}>
      <div style={C.clauseTitle}>{children}</div>
    </EditZone>
  );

  return (
    <Box style={C.page}>

      {/* ENCABEZADO */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 8.5, color: '#555', marginBottom: 6 }}>
          www.royalsensorymassage.com | ghiovani666@gmail.com | Lima, Perú
        </div>
        <EditZone id="titulo_doc" active={active} onEdit={onEdit}>
          <div style={C.h1}>{t('titulo_doc')}</div>
        </EditZone>
        <EditZone id="subtitulo" active={active} onEdit={onEdit}>
          <div style={C.h1sub}>{t('subtitulo', d.proyecto ? `Desarrollo de ${d.proyecto} — ${cli.empresa || cli.nombre}` : '')}</div>
        </EditZone>
      </div>

      {/* PARTES */}
      <EditZone id="partes" active={active} onEdit={onEdit}>
        <div style={C.p}>
          Conste por el presente documento el <strong>Contrato de Prestación de Servicios</strong> que
          suscriben, de una parte, <strong>{t('dev_nombre')}</strong>, persona natural con RUC {t('dev_ruc')},
          identificado con DNI {t('dev_dni')}, con número de contacto <strong>{t('dev_tel')}</strong>, que
          actúa en calidad de desarrollador independiente bajo la marca comercial{' '}
          <strong><u>{t('dev_marca')}</u></strong> (en adelante, <strong>"EL DESARROLLADOR"</strong>); y de la
          otra parte, <strong>{cli.nombre}</strong>
          {cli.dni     && <>, identificada con DNI {cli.dni}</>}
          {cli.ruc     && <>, RUC {cli.ruc}</>}
          {cli.empresa && <>, representante de <strong>{cli.empresa}</strong></>}
          {cli.tel     && <>, con número de contacto <strong>{cli.tel}</strong></>}
          {' '}(en adelante, <strong>"EL CLIENTE"</strong>), en los términos y condiciones que a
          continuación se detallan.
        </div>
        <div style={C.p}>
          Cuando en el texto del presente instrumento se utilice el término <strong>"Partes"</strong>, se
          entenderá referido a EL DESARROLLADOR y EL CLIENTE en conjunto; y cuando se utilice el
          término <strong>"Parte"</strong>, se entenderá referido a cualquiera de ellas individualmente.
        </div>
      </EditZone>

      {/* PRIMERO */}
      <ClauseTitle id="titulo_primero">{t('titulo_primero')}</ClauseTitle>
      <EditZone id="objeto_intro" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('objeto_intro')}</div>
      </EditZone>
      <EditZone id="objeto" active={active} onEdit={onEdit}>
        {objeto.map((item, i) => <Bullet key={i} text={item} />)}
      </EditZone>
      <EditZone id="objeto_anexo" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, marginTop: 6 }}>
          {t('objeto_anexo').replace('{codigo}', d.codigo)}
        </div>
      </EditZone>

      {/* SEGUNDO */}
      <ClauseTitle id="titulo_segundo">{t('titulo_segundo')}</ClauseTitle>
      <EditZone id="segundo_intro" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('segundo_intro').replace('{n}', etapas.length > 2 ? 'varias' : etapas.length === 1 ? 'una' : 'dos')}</div>
      </EditZone>
      <EditZone id="etapas" active={active} onEdit={onEdit}>
        <table style={C.tableWrap}>
          <thead>
            <tr>
              <th style={{ ...C.thCell, width: '4%' }}>#</th>
              <th style={{ ...C.thCell, width: '22%' }}>Etapa</th>
              <th style={{ ...C.thCell, width: '42%' }}>¿Qué incluye?</th>
              <th style={{ ...C.thCell, width: '16%' }}>Cuándo pagar</th>
              <th style={{ ...C.thCell, width: '16%', textAlign: 'right' }}>Monto (S/)</th>
            </tr>
          </thead>
          <tbody>
            {etapas.map((e, i) => (
              <tr key={i}>
                <td style={{ ...(i%2===0?C.tdCell:C.tdAlt), textAlign:'center', fontWeight:900, fontSize:13 }}>{e.n||i+1}</td>
                <td style={i%2===0?C.tdCell:C.tdAlt}>{e.etapa}</td>
                <td style={i%2===0?C.tdCell:C.tdAlt}>{e.incluye}</td>
                <td style={i%2===0?C.tdCell:C.tdAlt}>{e.cuando}</td>
                <td style={{ ...(i%2===0?C.tdCell:C.tdAlt), textAlign:'right', fontWeight:700 }}>S/ {fmt(e.monto)}.00</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} style={{ ...C.tdTotal, textAlign:'right' }}>TOTAL DEL PROYECTO:</td>
              <td style={{ ...C.tdTotal, textAlign:'right' }}>S/ {fmt(d.total)}.00</td>
            </tr>
          </tbody>
        </table>
      </EditZone>
      <EditZone id="nota_plazos" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, fontSize: 8.5, fontStyle: 'italic', color: '#444' }}>
          <strong>Nota:</strong> {t('nota_plazos')}
        </div>
      </EditZone>

      {/* TERCERO */}
      <ClauseTitle id="titulo_tercero">{t('titulo_tercero')}</ClauseTitle>
      <EditZone id="tercero_intro" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('tercero_intro').replace('{total}', `S/ ${fmt(d.total)}.00`)}</div>
      </EditZone>
      <EditZone id="tercero_cuotas_label" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, color: '#1a3a6b', fontWeight: 700 }}>
          {t('tercero_cuotas_label').replace('{n}', etapas.length)}
        </div>
      </EditZone>
      <EditZone id="etapas_cuotas_texto" active={active} onEdit={onEdit}>
        {etapas.map((e, i) => (
          <Bullet key={i} text={`Cuota ${i+1} — Al ${e.cuando}: S/ ${fmt(e.monto)}.00 — ${e.incluye}`} />
        ))}
      </EditZone>
      <EditZone id="tercero_footer" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, marginTop: 6 }}>{t('tercero_footer')}</div>
      </EditZone>
      <EditZone id="tercero_igv" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, fontSize: 8.5, color: '#555' }}>{t('tercero_igv')}</div>
      </EditZone>

      {/* CUARTO */}
      <ClauseTitle id="titulo_cuarto">{t('titulo_cuarto')}</ClauseTitle>
      <EditZone id="titulo_cuarto_dev" active={active} onEdit={onEdit}>
        <div style={C.subTitle}>{t('titulo_cuarto_dev')}</div>
      </EditZone>
      <EditZone id="obligaciones_dev" active={active} onEdit={onEdit}>
        {oblDev.map((o, i) => <Bullet key={i} text={o} />)}
      </EditZone>
      <EditZone id="titulo_cuarto_cli" active={active} onEdit={onEdit} style={{ marginTop: 10 }}>
        <div style={C.subTitle}>{t('titulo_cuarto_cli')}</div>
      </EditZone>
      <EditZone id="obligaciones_cli" active={active} onEdit={onEdit}>
        {oblCli.map((o, i) => <Bullet key={i} text={o} />)}
      </EditZone>

      {/* QUINTO */}
      <ClauseTitle id="titulo_quinto">{t('titulo_quinto')}</ClauseTitle>
      <EditZone id="quinto_p1" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('quinto_p1')}</div>
      </EditZone>
      <EditZone id="quinto_p2" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('quinto_p2')}</div>
      </EditZone>

      {/* SEXTO */}
      <ClauseTitle id="titulo_sexto">{t('titulo_sexto')}</ClauseTitle>
      <EditZone id="sexto_intro" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('sexto_intro')}</div>
      </EditZone>
      <EditZone id="tecnologias" active={active} onEdit={onEdit}>
        {tecno.map((tec, i) => <Bullet key={i} text={<><strong>{tec.label}:</strong> {tec.valor}</>} />)}
      </EditZone>

      {/* SÉPTIMO */}
      <ClauseTitle id="titulo_septimo">{t('titulo_septimo')}</ClauseTitle>
      <EditZone id="septimo_intro" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('septimo_intro')}</div>
      </EditZone>
      <EditZone id="entregables" active={active} onEdit={onEdit}>
        {entrega.map((e, i) => <Bullet key={i} text={e} />)}
      </EditZone>

      {/* OCTAVO */}
      <ClauseTitle id="titulo_octavo">{t('titulo_octavo')}</ClauseTitle>
      <EditZone id="octavo_p1" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('octavo_p1')}</div>
      </EditZone>
      <EditZone id="octavo_p2" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('octavo_p2')}</div>
      </EditZone>

      {/* NOVENO */}
      <ClauseTitle id="titulo_noveno">{t('titulo_noveno')}</ClauseTitle>
      <EditZone id="noveno_p1" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('noveno_p1')}</div>
      </EditZone>
      <EditZone id="noveno_p2" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('noveno_p2')}</div>
      </EditZone>

      {/* DÉCIMO */}
      <ClauseTitle id="titulo_decimo">{t('titulo_decimo')}</ClauseTitle>
      <EditZone id="decimo_intro" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('decimo_intro')}</div>
      </EditZone>
      <EditZone id="decimo_bullets" active={active} onEdit={onEdit}>
        {decBulls.map((b, i) => <Bullet key={i} text={b} />)}
      </EditZone>
      <EditZone id="decimo_final" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, marginTop: 6 }}>{t('decimo_final')}</div>
      </EditZone>

      {/* DÉCIMO PRIMERO */}
      <ClauseTitle id="titulo_decimo1">{t('titulo_decimo1')}</ClauseTitle>
      <EditZone id="decimo1_p" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('decimo1_p')}</div>
      </EditZone>

      {/* DÉCIMO SEGUNDO */}
      <ClauseTitle id="titulo_decimo2">{t('titulo_decimo2')}</ClauseTitle>
      <EditZone id="decimo2_p" active={active} onEdit={onEdit}>
        <div style={C.p}>{t('decimo2_p').replace('{codigo}', d.codigo)}</div>
      </EditZone>

      {/* CLÁUSULA ADICIONAL */}
      {t('clausula_adicional') && (
        <EditZone id="clausula_adicional" active={active} onEdit={onEdit}>
          <div style={{ ...C.p, borderLeft: '3px solid #1a3a6b', paddingLeft: 10, background: '#f5f8ff', marginTop: 16 }}>
            {t('clausula_adicional')}
          </div>
        </EditZone>
      )}
      {/* Botón para añadir cláusula adicional si no existe */}
      {!t('clausula_adicional') && (
        <Box onClick={() => onEdit('clausula_adicional')}
          sx={{ mt: 2, p: 1, border: '1.5px dashed #c7d8f5', borderRadius: 1, cursor: 'pointer',
            textAlign: 'center', color: '#94afd4', fontSize: 9,
            '&:hover': { borderColor: '#1a3a6b', color: '#1a3a6b' } }}>
          + Añadir cláusula adicional
        </Box>
      )}

      {/* FIRMA */}
      <EditZone id="firma_texto" active={active} onEdit={onEdit}>
        <div style={{ ...C.p, textAlign: 'center', fontStyle: 'italic', marginTop: 24 }}>
          {t('firma_texto')}
        </div>
      </EditZone>
      <EditZone id="fecha_firma" active={active} onEdit={onEdit}>
        <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 20 }}>
          {t('ciudad', 'Lima, Perú')}, __{t('fecha_firma', todayStr())}
        </div>
      </EditZone>

      <div style={{ display: 'flex', gap: 32, marginTop: 16 }}>
        <EditZone id="firma_dev" active={active} onEdit={onEdit} style={{ flex: 1 }}>
          <div style={C.sigBox}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#1a3a6b' }}>EL DESARROLLADOR</div>
            <div style={{ height: 50 }} />
            <div style={{ borderTop: '1.5px solid #333', paddingTop: 6 }}>
              <div style={C.sigName}>{t('dev_nombre')}</div>
              <div style={C.sigSub}>DNI: {t('dev_dni')}</div>
              <div style={C.sigSub}>RUC: {t('dev_ruc')}</div>
            </div>
          </div>
        </EditZone>
        <EditZone id="firma_cli" active={active} onEdit={onEdit} style={{ flex: 1 }}>
          <div style={{ ...C.sigBox, borderColor: '#c084fc' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#6d28d9' }}>EL CLIENTE</div>
            <div style={{ height: 50 }} />
            <div style={{ borderTop: '1.5px solid #6d28d9', paddingTop: 6 }}>
              <div style={{ ...C.sigName, color: '#6d28d9' }}>{cli.nombre}</div>
              {cli.dni     && <div style={C.sigSub}>DNI: {cli.dni}</div>}
              {cli.empresa && <div style={C.sigSub}>{cli.empresa}</div>}
              {cli.ruc     && <div style={C.sigSub}>RUC: {cli.ruc}</div>}
            </div>
          </div>
        </EditZone>
      </div>

      <div style={C.footerLine}>
        <strong>royalsensorymassage</strong> · SOFTWARE SOLUTIONS &amp; INNOVATION<br />
        www.royalsensorymassage.com · ghiovani666@gmail.com · {t('dev_tel')}
      </div>
    </Box>
  );
}

// ─── DEFINICIÓN de zonas para el drawer ───────────────────────────────────────
const ZONE_META = {
  // Títulos
  titulo_doc:        { label: 'Título principal del documento', type: 'text' },
  subtitulo:         { label: 'Subtítulo / descripción del proyecto', type: 'text' },
  titulo_primero:    { label: 'Título — PRIMERO', type: 'text' },
  titulo_segundo:    { label: 'Título — SEGUNDO', type: 'text' },
  titulo_tercero:    { label: 'Título — TERCERO', type: 'text' },
  titulo_cuarto:     { label: 'Título — CUARTO', type: 'text' },
  titulo_cuarto_dev: { label: 'Subtítulo obligaciones Desarrollador', type: 'text' },
  titulo_cuarto_cli: { label: 'Subtítulo obligaciones Cliente', type: 'text' },
  titulo_quinto:     { label: 'Título — QUINTO', type: 'text' },
  titulo_sexto:      { label: 'Título — SEXTO', type: 'text' },
  titulo_septimo:    { label: 'Título — SÉPTIMO', type: 'text' },
  titulo_octavo:     { label: 'Título — OCTAVO', type: 'text' },
  titulo_noveno:     { label: 'Título — NOVENO', type: 'text' },
  titulo_decimo:     { label: 'Título — DÉCIMO', type: 'text' },
  titulo_decimo1:    { label: 'Título — DÉCIMO PRIMERO', type: 'text' },
  titulo_decimo2:    { label: 'Título — DÉCIMO SEGUNDO', type: 'text' },
  // Párrafos simples
  objeto_intro:      { label: 'Intro — Objeto del contrato', type: 'textarea' },
  objeto_anexo:      { label: 'Referencia al Anexo I (cotización)', type: 'textarea' },
  segundo_intro:     { label: 'Intro — Etapas y plazos', type: 'textarea' },
  nota_plazos:       { label: 'Nota sobre plazos estimados', type: 'textarea' },
  tercero_intro:     { label: 'Intro — Precio total', type: 'textarea' },
  tercero_cuotas_label: { label: 'Encabezado cuotas de pago', type: 'text' },
  tercero_footer:    { label: 'Nota sobre medios de pago', type: 'textarea' },
  tercero_igv:       { label: 'Nota sobre IGV y renovación', type: 'textarea' },
  quinto_p1:         { label: 'QUINTO — Párrafo 1 (suspensión)', type: 'textarea' },
  quinto_p2:         { label: 'QUINTO — Párrafo 2 (reactivación)', type: 'textarea' },
  sexto_intro:       { label: 'Intro — Tecnologías', type: 'textarea' },
  septimo_intro:     { label: 'Intro — Entregables', type: 'textarea' },
  octavo_p1:         { label: 'OCTAVO — Párrafo 1 (propiedad)', type: 'textarea' },
  octavo_p2:         { label: 'OCTAVO — Párrafo 2 (componentes)', type: 'textarea' },
  noveno_p1:         { label: 'NOVENO — Párrafo 1 (reserva)', type: 'textarea' },
  noveno_p2:         { label: 'NOVENO — Párrafo 2 (devolución)', type: 'textarea' },
  decimo_intro:      { label: 'DÉCIMO — Intro (resolución)', type: 'textarea' },
  decimo_final:      { label: 'DÉCIMO — Párrafo final', type: 'textarea' },
  decimo1_p:         { label: 'DÉCIMO PRIMERO — Controversias', type: 'textarea' },
  decimo2_p:         { label: 'DÉCIMO SEGUNDO — Disposiciones finales', type: 'textarea' },
  clausula_adicional:{ label: 'Cláusula adicional (opcional)', type: 'textarea' },
  firma_texto:       { label: 'Texto de cierre / conformidad', type: 'textarea' },
  fecha_firma:       { label: 'Fecha de firma', type: 'text' },
  ciudad:            { label: 'Ciudad de firma', type: 'text' },
  // Listas
  objeto:            { label: 'Servicios incluidos en el objeto', type: 'list' },
  obligaciones_dev:  { label: 'Obligaciones del Desarrollador', type: 'list' },
  obligaciones_cli:  { label: 'Obligaciones del Cliente', type: 'list' },
  entregables:       { label: 'Entregables al cliente', type: 'list' },
  decimo_bullets:    { label: 'Causas de resolución', type: 'list' },
  etapas_cuotas_texto: { label: 'Texto cuotas en cláusula TERCERO', type: 'info' },
  // Objetos estructurados
  partes:            { label: 'Datos de las partes', type: 'partes' },
  etapas:            { label: 'Etapas y plazos del proyecto', type: 'etapas' },
  tecnologias:       { label: 'Tecnologías utilizadas', type: 'tecnologias' },
  firma_dev:         { label: 'Datos del Desarrollador (firma)', type: 'firma_dev' },
  firma_cli:         { label: 'Datos del Cliente (firma)', type: 'firma_cli' },
};

// ─── Campo input reutilizable ─────────────────────────────────────────────────
const FField = ({ label, value, onChange, multiline, rows: minRows = 1, placeholder }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#475569', mb: 0.4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" value={value || ''} onChange={e => onChange(e.target.value)}
      multiline={multiline} minRows={minRows} placeholder={placeholder}
      sx={{ '& .MuiInputBase-root': { fontSize: '0.82rem', bgcolor: '#f8fafc' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a3a6b' } }} />
  </Box>
);

// ─── DRAWER ───────────────────────────────────────────────────────────────────
function ZoneDrawer({ zone, d, onClose, onSave, onDraftChange }) {
  const cl   = d.contrato || {};
  const meta = ZONE_META[zone] || { label: zone, type: 'textarea' };
  const t    = (key, fallback) => r(cl, key, fallback);

  const [val,    setVal]    = useState('');
  const [rows,   setRows]   = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [tecno,  setTecno]  = useState([]);
  const [campos, setCampos] = useState({});
  const setC = (k) => (v) => setCampos(p => {
    const next = { ...p, [k]: v };
    emit({ campos: next });
    return next;
  });

  // ── Valor actual del canvas (mismo cálculo que ContratoCanvas) ──────────────
  const canvasVal = (key) => {
    const etapasActuales = cl.etapas || derivarEtapas(d);
    const cliNombre = t('cli_nombre', d.cliente_nombre || d.cliente || '');
    const cliEmpresa = t('cli_empresa', d.cliente_empresa || '');
    const computedFallbacks = {
      subtitulo:     d.proyecto ? `Desarrollo de ${d.proyecto} — ${cliEmpresa || cliNombre}` : '',
      tercero_intro: DEF.tercero_intro.replace('{total}', `S/ ${fmt(d.total)}.00`),
      tercero_cuotas_label: DEF.tercero_cuotas_label.replace('{n}', etapasActuales.length),
      segundo_intro: DEF.segundo_intro.replace('{n}', etapasActuales.length > 2 ? 'varias' : etapasActuales.length === 1 ? 'una' : 'dos'),
      decimo2_p:     DEF.decimo2_p.replace('{codigo}', d.codigo),
      objeto_anexo:  DEF.objeto_anexo.replace('{codigo}', d.codigo),
      ciudad:        'Lima, Perú',
      fecha_firma:   todayStr(),
    };
    // Primero el valor guardado en contrato, luego fallback computado, luego DEF
    if (cl[key] !== undefined && cl[key] !== null) return cl[key];
    if (computedFallbacks[key] !== undefined) return computedFallbacks[key];
    return DEF[key] || '';
  };

  useEffect(() => {
    if (!zone) return;
    const { type } = meta;

    if (type === 'text' || type === 'textarea') {
      setVal(canvasVal(zone));
    }
    if (type === 'list') {
      const listFallbacks = {
        objeto:           derivarObjeto(d),
        obligaciones_dev: DEF.obligaciones_dev,
        obligaciones_cli: DEF.obligaciones_cli,
        entregables:      DEF.entregables,
        decimo_bullets:   DEF.decimo_bullets,
      };
      setRows(cl[zone] !== undefined ? cl[zone] : (listFallbacks[zone] || []));
    }
    if (type === 'etapas')     setEtapas(cl.etapas || derivarEtapas(d));
    if (type === 'tecnologias') setTecno(cl.tecnologias || DEF.tecnologias);
    if (type === 'partes') {
      setCampos({
        dev_nombre:  cl.dev_nombre  || DEF.dev_nombre,
        dev_dni:     cl.dev_dni     || DEF.dev_dni,
        dev_ruc:     cl.dev_ruc     || DEF.dev_ruc,
        dev_tel:     cl.dev_tel     || DEF.dev_tel,
        dev_marca:   cl.dev_marca   || DEF.dev_marca,
        cli_nombre:  cl.cli_nombre  || d.cliente_nombre || d.cliente || '',
        cli_dni:     cl.cli_dni     || d.cliente_dni    || '',
        cli_ruc:     cl.cli_ruc     || d.cliente_ruc    || '',
        cli_tel:     cl.cli_tel     || d.cliente_telefono || '',
        cli_empresa: cl.cli_empresa || d.cliente_empresa  || '',
      });
    }
    if (type === 'firma_dev') {
      setCampos({
        dev_nombre: cl.dev_nombre || DEF.dev_nombre,
        dev_dni:    cl.dev_dni    || DEF.dev_dni,
        dev_ruc:    cl.dev_ruc    || DEF.dev_ruc,
        dev_tel:    cl.dev_tel    || DEF.dev_tel,
        dev_marca:  cl.dev_marca  || DEF.dev_marca,
      });
    }
    if (type === 'firma_cli') {
      setCampos({
        cli_nombre:  cl.cli_nombre  || d.cliente_nombre  || d.cliente || '',
        cli_dni:     cl.cli_dni     || d.cliente_dni     || '',
        cli_ruc:     cl.cli_ruc     || d.cliente_ruc     || '',
        cli_empresa: cl.cli_empresa || d.cliente_empresa  || '',
      });
    }
  }, [zone]);

  const buildPayload = (overrides = {}) => {
    const { type } = meta;
    const currentVal    = overrides.val    !== undefined ? overrides.val    : val;
    const currentRows   = overrides.rows   !== undefined ? overrides.rows   : rows;
    const currentEtapas = overrides.etapas !== undefined ? overrides.etapas : etapas;
    const currentTecno  = overrides.tecno  !== undefined ? overrides.tecno  : tecno;
    const currentCampos = overrides.campos !== undefined ? overrides.campos  : campos;
    if (type === 'text' || type === 'textarea') return { [zone]: currentVal };
    if (type === 'list')        return { [zone]: currentRows.filter(r => String(r).trim()) };
    if (type === 'etapas')      return { etapas: currentEtapas };
    if (type === 'tecnologias') return { tecnologias: currentTecno };
    if (type === 'partes')      return currentCampos;
    if (type === 'firma_dev')   return { dev_nombre: currentCampos.dev_nombre, dev_dni: currentCampos.dev_dni, dev_ruc: currentCampos.dev_ruc, dev_tel: currentCampos.dev_tel, dev_marca: currentCampos.dev_marca };
    if (type === 'firma_cli')   return { cli_nombre: currentCampos.cli_nombre, cli_dni: currentCampos.cli_dni, cli_ruc: currentCampos.cli_ruc, cli_empresa: currentCampos.cli_empresa };
    return {};
  };

  // Emite el draft al canvas en tiempo real
  const emit = (overrides = {}) => {
    onDraftChange?.(buildPayload(overrides));
  };

  const isText   = meta.type === 'text';
  const isArea   = meta.type === 'textarea';
  const isList   = meta.type === 'list';
  const isEtapas = meta.type === 'etapas';
  const isTecno  = meta.type === 'tecnologias';
  const isPartes = meta.type === 'partes';
  const isFDev   = meta.type === 'firma_dev';
  const isFCli   = meta.type === 'firma_cli';
  const isInfo   = meta.type === 'info';

  return (
    <Box sx={{ width: 370, p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={1.5}>
        <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: '#eef3ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.2, flexShrink: 0 }}>
          <EditIcon sx={{ fontSize: 15, color: '#1a3a6b' }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', flex: 1, color: '#0f172a', lineHeight: 1.3 }}>
          {meta.label}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box flex={1} overflow="auto" pr={0.5}>

        {/* Texto simple / textarea */}
        {(isText || isArea) && (
          <FField
            label={meta.label}
            value={val}
            onChange={v => { setVal(v); emit({ val: v }); }}
            multiline={isArea}
            rows={isArea ? 4 : 1}
          />
        )}

        {/* Info (solo lectura generada) */}
        {isInfo && (
          <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#0369a1' }}>
              Este contenido se genera automáticamente a partir de las etapas configuradas en SEGUNDO.
              Para editarlo, modifica la sección SEGUNDO — ETAPAS Y PLAZOS.
            </Typography>
          </Box>
        )}

        {/* Lista */}
        {isList && (
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 1.2 }}>
              Un punto por entrada. Usa el botón para añadir más.
            </Typography>
            {rows.map((row, i) => (
              <Box key={i} display="flex" gap={0.5} alignItems="flex-start" mb={1}>
                <Typography sx={{ pt: 0.9, color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, width: 18 }}>
                  {i+1}.
                </Typography>
                <TextField multiline size="small" fullWidth value={row}
                  onChange={e => {
                    const v = e.target.value;
                    setRows(p => { const n=[...p]; n[i]=v; emit({ rows: n }); return n; });
                  }}
                  sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem', bgcolor: '#f8fafc' } }} />
                <IconButton size="small" sx={{ mt: 0.3 }}
                  onClick={() => setRows(p => { const n=p.filter((_,j)=>j!==i); emit({ rows: n }); return n; })}>
                  <DeleteOutlineIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setRows(p => { const n=[...p,'']; emit({ rows: n }); return n; })}
              sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#1a3a6b', mt: 0.5 }}>
              Añadir punto
            </Button>
          </Box>
        )}

        {/* Etapas */}
        {isEtapas && (
          <Box>
            {etapas.map((e, i) => (
              <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#1a3a6b' }}>Etapa {i+1}</Typography>
                  <IconButton size="small" onClick={() => setEtapas(p => p.filter((_,j)=>j!==i))}>
                    <DeleteOutlineIcon sx={{ fontSize: 15, color: '#ef4444' }} />
                  </IconButton>
                </Box>
                <FField label="Nombre de la etapa" value={e.etapa}
                  onChange={v => setEtapas(p => { const n=[...p]; n[i]={...n[i],etapa:v}; emit({ etapas: n }); return n; })} />
                <FField label="¿Qué incluye?" value={e.incluye} multiline rows={3}
                  onChange={v => setEtapas(p => { const n=[...p]; n[i]={...n[i],incluye:v}; emit({ etapas: n }); return n; })} />
                <Box display="flex" gap={1}>
                  <Box flex={1}>
                    <FField label="Cuándo pagar" value={e.cuando} placeholder="Al contratar"
                      onChange={v => setEtapas(p => { const n=[...p]; n[i]={...n[i],cuando:v}; emit({ etapas: n }); return n; })} />
                  </Box>
                  <Box flex={1}>
                    <FField label="Monto (S/)" value={String(e.monto || 0)}
                      onChange={v => setEtapas(p => { const n=[...p]; n[i]={...n[i],monto:Number(v)||0}; emit({ etapas: n }); return n; })} />
                  </Box>
                </Box>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setEtapas(p => [...p, { n: p.length+1, etapa:'', incluye:'', cuando:'Al contratar', monto:0 }])}
              sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#1a3a6b' }}>
              Añadir etapa
            </Button>
          </Box>
        )}

        {/* Tecnologías */}
        {isTecno && (
          <Box>
            {tecno.map((tec, i) => (
              <Box key={i} sx={{ mb: 1.2, p: 1.2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <Box flex={1}>
                    <FField label="Tecnología" value={tec.label} placeholder="Ej: Frontend Web"
                      onChange={v => setTecno(p => { const n=[...p]; n[i]={...n[i],label:v}; emit({ tecno: n }); return n; })} />
                    <FField label="Descripción" value={tec.valor}
                      onChange={v => setTecno(p => { const n=[...p]; n[i]={...n[i],valor:v}; emit({ tecno: n }); return n; })} />
                  </Box>
                  <IconButton size="small" sx={{ mt: 0.5 }}
                    onClick={() => setTecno(p => p.filter((_,j)=>j!==i))}>
                    <DeleteOutlineIcon sx={{ fontSize: 15, color: '#ef4444' }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setTecno(p => [...p, { label:'', valor:'' }])}
              sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#1a3a6b' }}>
              Añadir tecnología
            </Button>
          </Box>
        )}

        {/* Partes (Desarrollador + Cliente) */}
        {isPartes && (
          <Box>
            <Box sx={{ p: 1.2, bgcolor: '#eef3ff', borderRadius: '8px', mb: 2, border: '1px solid #c7d8f5' }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#1a3a6b', mb: 1 }}>EL DESARROLLADOR</Typography>
              <FField label="Nombre completo" value={campos.dev_nombre} onChange={setC('dev_nombre')} />
              <FField label="DNI"             value={campos.dev_dni}    onChange={setC('dev_dni')} />
              <FField label="RUC"             value={campos.dev_ruc}    onChange={setC('dev_ruc')} />
              <FField label="Teléfono"        value={campos.dev_tel}    onChange={setC('dev_tel')} />
              <FField label="Marca comercial" value={campos.dev_marca}  onChange={setC('dev_marca')} multiline rows={2} />
            </Box>
            <Box sx={{ p: 1.2, bgcolor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9', mb: 1 }}>EL CLIENTE</Typography>
              <FField label="Nombre completo"       value={campos.cli_nombre}  onChange={setC('cli_nombre')} />
              <FField label="DNI"                   value={campos.cli_dni}     onChange={setC('cli_dni')} />
              <FField label="RUC"                   value={campos.cli_ruc}     onChange={setC('cli_ruc')} />
              <FField label="Teléfono"              value={campos.cli_tel}     onChange={setC('cli_tel')} />
              <FField label="Empresa / razón social" value={campos.cli_empresa} onChange={setC('cli_empresa')} />
            </Box>
          </Box>
        )}

        {/* Firma Desarrollador */}
        {isFDev && (
          <Box sx={{ p: 1.2, bgcolor: '#eef3ff', borderRadius: '8px', border: '1px solid #c7d8f5' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#1a3a6b', mb: 1 }}>EL DESARROLLADOR</Typography>
            <FField label="Nombre completo" value={campos.dev_nombre} onChange={setC('dev_nombre')} />
            <FField label="DNI"             value={campos.dev_dni}    onChange={setC('dev_dni')} />
            <FField label="RUC"             value={campos.dev_ruc}    onChange={setC('dev_ruc')} />
            <FField label="Teléfono"        value={campos.dev_tel}    onChange={setC('dev_tel')} />
            <FField label="Marca comercial" value={campos.dev_marca}  onChange={setC('dev_marca')} multiline rows={2} />
          </Box>
        )}

        {/* Firma Cliente */}
        {isFCli && (
          <Box sx={{ p: 1.2, bgcolor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9', mb: 1 }}>EL CLIENTE</Typography>
            <FField label="Nombre completo"       value={campos.cli_nombre}  onChange={setC('cli_nombre')} />
            <FField label="DNI"                   value={campos.cli_dni}     onChange={setC('cli_dni')} />
            <FField label="RUC"                   value={campos.cli_ruc}     onChange={setC('cli_ruc')} />
            <FField label="Empresa / razón social" value={campos.cli_empresa} onChange={setC('cli_empresa')} />
          </Box>
        )}
      </Box>

      {/* Footer */}
      {!isInfo && (
        <Box mt={2} pt={1.5} sx={{ borderTop: '1px solid #f1f5f9' }}>
          <Button variant="contained" fullWidth onClick={() => onSave(buildPayload())}
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#1a3a6b', borderRadius: '9px',
              py: 1.1, fontSize: '0.85rem',
              '&:hover': { bgcolor: '#0a2a55', boxShadow: '0 4px 14px rgba(26,58,107,0.35)' } }}>
            Aplicar cambios
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ContratoPdfCanvasEditor({ presupuesto, onBack, onUpdated }) {
  const [d,          setD]          = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [pdfUrl,     setPdfUrl]     = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdf,    setShowPdf]    = useState(false);
  const [draft,      setDraft]      = useState({});  // preview en tiempo real
  const panelRef = useRef(null);

  const id = presupuesto?.id_presupuesto || presupuesto?.id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    verPresupuesto(id)
      .then(res => setD({ ...res, contrato: res.contrato_data || res.contrato || {} }))
      .catch(e  => handleErrorMessages('Error al cargar el contrato', e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = useCallback((zone) => {
    setActiveZone(prev => prev === zone ? null : zone);
    setDraft({});
    setShowPdf(false);

    setTimeout(() => {
      // Scroll del panel al inicio
      if (panelRef.current) panelRef.current.scrollTop = 0;

      // Scroll del canvas para que la zona quede visible junto al panel
      const el = document.querySelector(`[data-zone-id="${zone}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  }, []);

  const handleSave = useCallback(async (payload) => {
    setSaving(true);
    try {
      const newContrato = { ...(d.contrato || {}), ...payload };
      await actualizarPresupuesto(id, { contrato_data: newContrato });
      setD(prev => ({ ...prev, contrato: newContrato }));
      setDraft({});       // limpia draft tras guardar
      setActiveZone(null);
      toastSuccess('Guardado correctamente');
      onUpdated?.();
    } catch (e) {
      handleErrorMessages('Error al guardar', e);
    } finally {
      setSaving(false);
    }
  }, [d, id, onUpdated]);

  const handleVerPdf = async () => {
    if (pdfUrl) { setShowPdf(true); return; }
    setPdfLoading(true);
    try {
      const blob = await fetchPresupuestoContratoPdf(id, true);
      setPdfUrl(window.URL.createObjectURL(blob));
      setShowPdf(true);
    } catch (e) {
      handleErrorMessages('Error al generar el PDF', e);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight={400}>
      <CircularProgress /><Typography ml={2} color="text.secondary">Cargando contrato...</Typography>
    </Box>
  );
  if (!d) return null;

  const totalZones = Object.keys(ZONE_META).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f4f8' }}>

      {/* TOOLBAR */}
      <Box sx={{ bgcolor: '#1a3a6b', color: '#fff', px: 3, py: 1.2,
        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
        boxShadow: '0 2px 10px rgba(26,58,107,0.3)' }}>
        <Tooltip title="Volver">
          <IconButton size="small" onClick={onBack} sx={{ color: '#fff', mr: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <ArticleIcon sx={{ fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1 }}>
            Editar Contrato — CMS
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)' }}>
            {d.codigo} · {d.cliente_nombre || d.cliente || 'Sin cliente'} · S/ {fmt(d.total)} · {totalZones} zonas editables
          </Typography>
        </Box>
        <Chip label="Haz clic en ✏️ para editar cualquier sección" size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.65rem', height: 22 }} />
        <Button variant="outlined" size="small" onClick={handleVerPdf} disabled={pdfLoading}
          startIcon={pdfLoading ? <CircularProgress size={13} color="inherit" /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.4)',
            borderRadius: '8px', fontSize: '0.78rem',
            '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          {pdfLoading ? 'Generando...' : 'Ver PDF'}
        </Button>
        <Button variant="outlined" size="small" onClick={() => descargarPresupuestoContratoPdf(id, d?.codigo)}
          startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.4)',
            borderRadius: '8px', fontSize: '0.78rem',
            '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          Descargar
        </Button>
        {saving && <CircularProgress size={18} sx={{ color: '#fff' }} />}
      </Box>

      {/* BODY: canvas izquierdo + panel derecho */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Canvas del documento ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', justifyContent: 'center', bgcolor: '#f0f4f8' }}
          onClick={() => activeZone && setActiveZone(null)}>
          {showPdf && pdfUrl ? (
            <Box sx={{ width: '100%', maxWidth: 860, height: '80vh', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box display="flex" justifyContent="flex-end">
                <Button size="small" onClick={() => setShowPdf(false)}
                  startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontSize: '0.78rem' }}>
                  Cerrar PDF
                </Button>
              </Box>
              <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <iframe src={pdfUrl} title="Contrato PDF" width="100%" height="100%"
                  style={{ border: 0, background: '#525659' }} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: '100%', maxWidth: 860, boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              bgcolor: '#fff', borderRadius: 2, overflow: 'hidden' }}>
              <ContratoCanvas d={d} active={activeZone} onEdit={handleEdit} draft={draft} />
            </Box>
          )}
        </Box>

        {/* ── Panel editor derecho (acoplado, siempre visible) ── */}
        {activeZone && (
          <Box ref={panelRef} sx={{
            width: 370, flexShrink: 0,
            bgcolor: '#fff',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            <ZoneDrawer zone={activeZone} d={d} onClose={() => setActiveZone(null)} onSave={handleSave}
              onDraftChange={setDraft} />
          </Box>
        )}

      </Box>
    </Box>
  );
}
