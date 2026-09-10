import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Form, { Item, GroupItem, RequiredRule } from "devextreme-react/form";
import { Button as ButtonDev } from "devextreme-react";
import {
  HourglassEmptyRounded as HourglassIcon,
  AutorenewRounded as InProgressIcon,
  CheckCircleRounded as CheckIcon,
  CancelRounded as CancelIcon,
  DescriptionRounded as DescriptionIcon,
  AttachFileRounded as AttachFileIcon,
  PictureAsPdfRounded as PdfIcon,
  ImageRounded as ImageIcon,
  ArticleRounded as DocIcon,
  BarChartRounded as SheetIcon,
  EmailRounded as EmailIcon,
  PhoneRounded as PhoneIcon,
  HomeRounded as HomeIcon,
  BusinessRounded as BusinessIcon,
  PersonRounded as PersonIcon,
  CalendarTodayRounded as CalendarIcon,
  ManageAccountsRounded as ManageIcon,
  SettingsRounded as SettingsIcon,
  BuildRounded as ToolsIcon,
  LocationOnRounded as LocationIcon,
} from "@mui/icons-material";
import { authJWTConfig } from "app/authJWTConfig";

export const DomainBackend = authJWTConfig.domain;

// ─── TOKENS ────────────────────────────────────────────────────────────────
const COLOR = {
  primary:   '#1976d2',
  primaryBg: '#e3f0fb',
  orange:    '#f57c00',
  orangeBg:  '#fff3e0',
  green:     '#2e7d32',
  greenBg:   '#e8f5e9',
  red:       '#c62828',
  redBg:     '#ffebee',
  purple:    '#6a1b9a',
  purpleBg:  '#f3e5f5',
  gray:      '#546e7a',
  grayBg:    '#f5f7f9',
  border:    '#e0e0e0',
  text:      '#1a1a2e',
  muted:     '#78909c',
  white:     '#ffffff',
};

// ─── ESTADO CONFIG ─────────────────────────────────────────────────────────
const ESTADO_CFG = {
  pendiente:  { label: 'Pendiente',   bg: COLOR.orangeBg,  color: COLOR.orange, step: 0 },
  en_proceso: { label: 'En Proceso',  bg: COLOR.primaryBg, color: COLOR.primary, step: 1 },
  resuelto:   { label: 'Resuelto',    bg: COLOR.greenBg,   color: COLOR.green,  step: 2 },
  rechazado:  { label: 'Rechazado',   bg: COLOR.redBg,     color: COLOR.red,    step: -1 },
};

const ESTADOS_OPCIONES = [
  { value: 'pendiente',  text: 'Pendiente' },
  { value: 'en_proceso', text: 'En Proceso' },
  { value: 'resuelto',   text: 'Resuelto' },
  { value: 'rechazado',  text: 'Rechazado' },
];

// ─── STYLED ────────────────────────────────────────────────────────────────
const PageWrap = styled('div')(({ theme }) => ({
  padding: '24px',
  background: '#f0f4f8',
  minHeight: '100vh',
  [theme.breakpoints.down('sm')]: { padding: '12px' },
}));

const Card = styled('div')(({ accent }) => ({
  background: COLOR.white,
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
  overflow: 'hidden',
  borderTop: accent ? `3px solid ${accent}` : undefined,
  marginBottom: '16px',
}));

const CardHeader = styled('div')(({ bg }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  background: bg || COLOR.grayBg,
  borderBottom: `1px solid ${COLOR.border}`,
}));

const CardBody = styled('div')({
  padding: '20px',
});

const SectionIcon = styled('div')(({ color }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: color || COLOR.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: COLOR.white,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  flexShrink: 0,
}));

const SectionTitle = styled('span')({
  fontWeight: 700,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: COLOR.text,
});

// ─── MINI COMPONENTS ───────────────────────────────────────────────────────
const Badge = ({ text, bg, color, size = 'sm', startIcon }) => (
  <span style={{
    background: bg,
    color,
    padding: size === 'lg' ? '6px 18px' : '3px 10px',
    borderRadius: '20px',
    fontSize: size === 'lg' ? '14px' : '12px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  }}>
    {startIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{startIcon}</span>}
    {text}
  </span>
);

const Field = ({ label, value, icon }) => (
    <div style={{ marginBottom: '12px' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.7px', color: COLOR.muted, marginBottom: '3px',
    }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {label}
    </div>
    <div style={{
      fontSize: '14px', color: value ? COLOR.text : COLOR.muted,
      fontStyle: value ? 'normal' : 'italic',
      padding: '6px 0', borderBottom: `1px solid ${COLOR.border}`,
    }}>
      {value || 'No especificado'}
    </div>
  </div>
);

// Barra de progreso de estado
const StatusProgress = ({ estado }) => {
  const steps = [
    { key: 'pendiente',  label: 'Pendiente',  Icon: HourglassIcon },
    { key: 'en_proceso', label: 'En Proceso', Icon: InProgressIcon },
    { key: 'resuelto',   label: 'Resuelto',   Icon: CheckIcon },
  ];
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.pendiente;
  const isRechazado = estado === 'rechazado';

  if (isRechazado) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px', background: COLOR.redBg,
        borderRadius: '8px', border: `1px solid ${COLOR.red}20`,
      }}>
        <CancelIcon fontSize="small" style={{ color: COLOR.red }} />
        <span style={{ fontWeight: 700, color: COLOR.red, fontSize: '14px' }}>Reclamo Rechazado</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
      {steps.map((s, i) => {
        const active   = s.key === estado;
        const done     = cfg.step > i;
        const stepCfg  = ESTADO_CFG[s.key];
        const StepIcon = s.Icon;
        return (
          <React.Fragment key={s.key}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              minWidth: '80px',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? COLOR.green : active ? stepCfg.color : COLOR.border,
                color: done || active ? COLOR.white : COLOR.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700,
                boxShadow: active ? `0 0 0 4px ${stepCfg.color}30` : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? <CheckIcon fontSize="small" /> : <StepIcon fontSize="small" />}
              </div>
              <span style={{
                fontSize: '10px', fontWeight: active ? 700 : 500,
                color: active ? stepCfg.color : done ? COLOR.green : COLOR.muted,
              }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '2px', marginBottom: '14px',
                background: done ? COLOR.green : COLOR.border,
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── FILE PREVIEW ──────────────────────────────────────────────────────────
const getFileExt = (nombre) => (nombre || '').split('.').pop().toLowerCase();
const isImageExt = (ext) => ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
const isPdfExt   = (ext) => ext === 'pdf';

const fileIconChar = (ext) => {
  if (isImageExt(ext)) return <ImageIcon fontSize="small" />;
  if (isPdfExt(ext))   return <PdfIcon fontSize="small" />;
  if (['doc','docx'].includes(ext)) return <DocIcon fontSize="small" />;
  if (['xls','xlsx'].includes(ext)) return <SheetIcon fontSize="small" />;
  return <AttachFileIcon fontSize="small" />;
};

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const FileCard = ({ archivo, url, index, previewsOpen, setPreviewsOpen }) => {
  const ext        = getFileExt(archivo.nombre_original);
  const canPreview = isImageExt(ext) || isPdfExt(ext);
  const open       = !!previewsOpen[index];
  const toggle     = () => setPreviewsOpen(p => ({ ...p, [index]: !p[index] }));

  return (
    <div style={{
      borderRadius: '10px',
      border: `1px solid ${open ? COLOR.primary : COLOR.border}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: open ? `0 0 0 3px ${COLOR.primary}20` : 'none',
    }}>
      {/* File row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px',
        background: open ? COLOR.primaryBg : COLOR.grayBg,
        transition: 'background 0.2s',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '8px',
          background: COLOR.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          flexShrink: 0,
        }}>
          {fileIconChar(ext)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: 600, color: COLOR.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {archivo.nombre_original}
          </div>
          {archivo.tamanio && (
            <div style={{ fontSize: '11px', color: COLOR.muted, marginTop: '1px' }}>
              {formatBytes(archivo.tamanio)} · {ext.toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {canPreview && (
            <button onClick={toggle} style={{
              padding: '5px 12px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: `1.5px solid ${COLOR.primary}`,
              borderRadius: '6px',
              background: open ? COLOR.primary : COLOR.white,
              color: open ? COLOR.white : COLOR.primary,
              transition: 'all 0.2s',
              lineHeight: 1.4,
            }}>
              {open ? '▲ Cerrar' : '▼ Ver'}
            </button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en nueva pestaña"
            style={{
              padding: '5px 10px', fontSize: '12px', fontWeight: 600,
              border: `1.5px solid ${COLOR.border}`, borderRadius: '6px',
              background: COLOR.white, color: COLOR.gray,
              textDecoration: 'none', display: 'inline-flex',
              alignItems: 'center', gap: '3px', lineHeight: 1.4,
              transition: 'all 0.2s',
            }}
          >
            ↗ Abrir
          </a>
        </div>
      </div>

      {/* Inline preview panel */}
      {open && (
        <div style={{ background: '#fff', borderTop: `1px solid ${COLOR.border}` }}>
          {isPdfExt(ext) ? (
            <iframe
              src={url}
              title={archivo.nombre_original}
              width="100%"
              height="550px"
              style={{ display: 'block', border: 'none' }}
            />
          ) : (
            <div style={{
              display: 'flex', justifyContent: 'center',
              padding: '16px', background: '#fafafa',
            }}>
              <img
                src={url}
                alt={archivo.nombre_original}
                style={{
                  maxWidth: '100%', maxHeight: '500px',
                  objectFit: 'contain', borderRadius: '6px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const LibroReclamoEditPage = props => {
  const { accessButton, dataRowEditNew } = props;

  const [gestionData, setGestionData] = useState({
    estado: '',
    comentario_atencion: '',
    usuario_atencion: '',
  });
  const [archivos, setArchivos]         = useState([]);
  const [previewsOpen, setPreviewsOpen] = useState({});

  useEffect(() => {
    if (dataRowEditNew?.id_web_reclamos) {
      setGestionData({
        id_web_reclamos:     dataRowEditNew.id_web_reclamos,
        estado:              dataRowEditNew.estado || 'pendiente',
        comentario_atencion: dataRowEditNew.comentario_atencion || '',
        usuario_atencion:    dataRowEditNew.usuario_atencion || '',
      });

      if (dataRowEditNew.archivos_adjuntos) {
        try {
          const parsed = typeof dataRowEditNew.archivos_adjuntos === 'string'
            ? JSON.parse(dataRowEditNew.archivos_adjuntos)
            : dataRowEditNew.archivos_adjuntos;
          setArchivos(Array.isArray(parsed) ? parsed : []);
        } catch {
          setArchivos([]);
        }
      } else {
        setArchivos([]);
      }
    }
  }, [dataRowEditNew]);

  function grabar(e) {
    const result = e.validationGroup.validate();
    if (result.isValid) {
      props.actualizarReclamo({
        ...gestionData,
        id_web_reclamos: dataRowEditNew.id_web_reclamos,
      });
    }
  }

  const tipoLabel   = dataRowEditNew.tipo_solicitud === 'complaint' ? 'Queja' : 'Reclamo';
  const tipoIsQueja = dataRowEditNew.tipo_solicitud === 'complaint';
  const numReclamo  = `REC-${String(dataRowEditNew.id_web_reclamos).padStart(4, '0')}`;
  const estadoCfg   = ESTADO_CFG[dataRowEditNew.estado] || ESTADO_CFG.pendiente;

  const nombreCompleto = [
    dataRowEditNew.nombres,
    dataRowEditNew.apellido_paterno,
    dataRowEditNew.apellido_materno,
  ].filter(Boolean).join(' ');

  return (
    <PageWrap>

      {/* ── BANNER HEADER ── */}
      <div style={{
        background: `linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%)`,
        borderRadius: '14px',
        padding: '24px 28px',
        marginBottom: '20px',
        color: COLOR.white,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(21,101,192,0.3)',
      }}>
        {/* Left: number + type */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '1px', opacity: 0.75, marginBottom: '4px',
          }}>
            Libro de Reclamaciones
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {numReclamo}
            </span>
            <span style={{
              background: tipoIsQueja ? 'rgba(255,193,7,0.9)' : 'rgba(255,255,255,0.2)',
              color: tipoIsQueja ? '#212529' : COLOR.white,
              padding: '4px 14px', borderRadius: '20px',
              fontSize: '13px', fontWeight: 700,
            }}>
              {tipoLabel}
            </span>
            <span style={{
              background: estadoCfg.bg,
              color: estadoCfg.color,
              padding: '4px 14px', borderRadius: '20px',
              fontSize: '13px', fontWeight: 700,
            }}>
              {estadoCfg.icon} {estadoCfg.label}
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
            {nombreCompleto && (
              <>
                <PersonIcon fontSize="small" />
                <span>{nombreCompleto}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: status progress */}
        <div style={{
          flex: 2, minWidth: 260,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '10px', padding: '12px 20px',
        }}>
          <StatusProgress estado={dataRowEditNew.estado} />
        </div>

        {/* Right: date + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <CalendarIcon fontSize="small" />
              <span>Registrado</span>
            </div>
            <div style={{ fontWeight: 700 }}>
              {dataRowEditNew.fecha_registro
                ? new Date(dataRowEditNew.fecha_registro).toLocaleString('es-PE')
                : '—'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {accessButton.editar && (
              <ButtonDev
                icon="save"
                text="Guardar"
                type="default"
                stylingMode="contained"
                hint="Guardar gestión"
                onClick={grabar}
                useSubmitBehavior={true}
                validationGroup="FormGestion"
              />
            )}
            <ButtonDev
              icon="close"
              text="Cancelar"
              type="normal"
              stylingMode="outlined"
              hint="Cancelar"
              onClick={props.cancelarEdicion}
            />
          </div>
        </div>
      </div>

      {/* ── BODY GRID ── */}
      <Grid container spacing={2}>

        {/* ─ COLUMNA IZQUIERDA ─ */}
        <Grid item xs={12} md={7}>

          {/* 1. Datos Personales */}
          <Card accent={COLOR.primary}>
            <CardHeader bg={COLOR.primaryBg}>
              <SectionIcon color={COLOR.primary}>👤</SectionIcon>
              <SectionTitle>1. Datos Personales</SectionTitle>
            </CardHeader>
            <CardBody>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field icon={<PersonIcon fontSize="small" />} label="Tipo de Documento" value={dataRowEditNew.tipo_documento} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field icon="#" label="Número de Documento" value={dataRowEditNew.numero_documento} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Field label="Nombres" value={dataRowEditNew.nombres} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Field label="Apellido Paterno" value={dataRowEditNew.apellido_paterno} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Field label="Apellido Materno" value={dataRowEditNew.apellido_materno} />
                </Grid>
                {dataRowEditNew.razon_social && (
                  <Grid item xs={12}>
                  <Field icon={<BusinessIcon fontSize="small" />} label="Razón Social" value={dataRowEditNew.razon_social} />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Field icon={<PhoneIcon fontSize="small" />} label="Teléfono" value={dataRowEditNew.telefono} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field icon={<EmailIcon fontSize="small" />} label="Email" value={dataRowEditNew.email} />
                </Grid>
              </Grid>
            </CardBody>
          </Card>

          {/* 2. Domicilio */}
          <Card accent={COLOR.orange}>
            <CardHeader bg={COLOR.orangeBg}>
              <SectionIcon color={COLOR.orange}>
                <LocationIcon fontSize="small" />
              </SectionIcon>
              <SectionTitle>2. Domicilio</SectionTitle>
            </CardHeader>
            <CardBody>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Field label="Departamento" value={dataRowEditNew.departamento} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Field label="Provincia" value={dataRowEditNew.provincia} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Field label="Distrito" value={dataRowEditNew.distrito} />
                </Grid>
                <Grid item xs={12}>
                  <Field icon={<HomeIcon fontSize="small" />} label="Dirección" value={dataRowEditNew.direccion} />
                </Grid>
              </Grid>
            </CardBody>
          </Card>

          {/* 3. Detalles de la solicitud */}
          <Card accent={COLOR.purple}>
            <CardHeader bg={COLOR.purpleBg}>
              <SectionIcon color={COLOR.purple}>
                <DescriptionIcon fontSize="small" />
              </SectionIcon>
              <SectionTitle>3. Detalles de la Solicitud</SectionTitle>
              <span style={{ marginLeft: 'auto' }}>
                <Badge
                  text={tipoLabel}
                  bg={tipoIsQueja ? '#fff3cd' : COLOR.purpleBg}
                  color={tipoIsQueja ? '#856404' : COLOR.purple}
                />
              </span>
            </CardHeader>
            <CardBody>
              {/* Bien reclamado */}
              {dataRowEditNew.bien_contratado && (
                <div style={{ marginBottom: '12px' }}>
                  <Field icon={<DocIcon fontSize="small" />} label="Bien / Servicio contratado" value={dataRowEditNew.bien_contratado} />
                </div>
              )}
              {dataRowEditNew.monto_reclamado && (
                <div style={{ marginBottom: '12px' }}>
                  <Field icon={<SheetIcon fontSize="small" />} label="Monto reclamado (S/.)" value={dataRowEditNew.monto_reclamado} />
                </div>
              )}
              <div style={{ marginBottom: '6px' }}>
                <div style={{
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.7px', color: COLOR.muted, marginBottom: '6px',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <DescriptionIcon fontSize="small" />
                    Descripción / Detalle
                  </span>
                </div>
                <div style={{
                  background: '#fafafa',
                  border: `1px solid ${COLOR.border}`,
                  borderLeft: `4px solid ${COLOR.purple}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '14px 16px',
                  fontSize: '14px', lineHeight: '1.7',
                  color: dataRowEditNew.detalles_solicitud ? COLOR.text : COLOR.muted,
                  fontStyle: dataRowEditNew.detalles_solicitud ? 'normal' : 'italic',
                  whiteSpace: 'pre-wrap', minHeight: '80px',
                }}>
                  {dataRowEditNew.detalles_solicitud || 'Sin detalles'}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 4. Archivos adjuntos */}
          {archivos.length > 0 && (
            <Card accent={COLOR.gray}>
              <CardHeader>
                <SectionIcon color={COLOR.gray}>
                  <AttachFileIcon fontSize="small" />
                </SectionIcon>
                <SectionTitle>Archivos Adjuntos</SectionTitle>
                <span style={{ marginLeft: 'auto' }}>
                  <Badge
                    text={`${archivos.length} archivo${archivos.length > 1 ? 's' : ''}`}
                    bg={COLOR.grayBg}
                    color={COLOR.gray}
                  />
                </span>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {archivos.map((archivo, idx) => {
                    // La ruta guardada es "/storage/reclamos/filename.ext"
                    // Usamos la ruta API igual que pedidos: /api/storage_reclamo/{filename}
                    const filename = archivo.ruta ? archivo.ruta.split('/').pop() : '';
                    const url = `${DomainBackend}/api/storage_reclamo/${filename}`;
                    return (
                      <FileCard
                        key={idx}
                        archivo={archivo}
                        url={url}
                        index={idx}
                        previewsOpen={previewsOpen}
                        setPreviewsOpen={setPreviewsOpen}
                      />
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

        </Grid>

        {/* ─ COLUMNA DERECHA ─ */}
        <Grid item xs={12} md={5}>

          {/* Gestión */}
          <Card accent={COLOR.green}>
            <CardHeader bg={COLOR.greenBg}>
              <SectionIcon color={COLOR.green}>
                <ManageIcon fontSize="small" />
              </SectionIcon>
              <SectionTitle>4. Gestión del Reclamo</SectionTitle>
            </CardHeader>
            <CardBody>
              <Form
                formData={gestionData}
                id="formGestion"
                validationGroup="FormGestion"
              >
                <GroupItem itemType="group" colCount={1} colSpan={1}>
                  <Item
                    dataField="estado"
                    label={{ text: "Estado del reclamo" }}
                    isRequired={true}
                    editorType="dxSelectBox"
                    editorOptions={{
                      items: ESTADOS_OPCIONES,
                      valueExpr: "value",
                      displayExpr: "text",
                      stylingMode: "outlined",
                    }}
                  >
                    <RequiredRule message="El estado es obligatorio" />
                  </Item>
                  <Item
                    dataField="usuario_atencion"
                    label={{ text: "Responsable de atención" }}
                    editorOptions={{
                      stylingMode: "outlined",
                      placeholder: "Nombre del responsable",
                    }}
                  />
                  <Item
                    dataField="comentario_atencion"
                    label={{ text: "Respuesta / Comentario" }}
                    editorType="dxTextArea"
                    editorOptions={{
                      height: 160,
                      stylingMode: "outlined",
                      placeholder: "Escribe aquí la respuesta o acción tomada...",
                    }}
                  />
                </GroupItem>
              </Form>

              {/* Guardar button */}
              {accessButton.editar && (
                <div style={{ marginTop: '16px' }}>
                  <ButtonDev
                    icon="save"
                    text="Guardar Gestión"
                    type="success"
                    stylingMode="contained"
                    width="100%"
                    height="40px"
                    onClick={grabar}
                    useSubmitBehavior={true}
                    validationGroup="FormGestion"
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Historial de atención */}
          {dataRowEditNew.fecha_atencion && (
            <Card accent={COLOR.green}>
              <CardHeader bg={COLOR.greenBg}>
                <SectionIcon color={COLOR.green}>
                  <CalendarIcon fontSize="small" />
                </SectionIcon>
                <SectionTitle>Última Atención</SectionTitle>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: COLOR.greenBg, border: `2px solid ${COLOR.green}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>
                    <CheckIcon fontSize="small" style={{ color: COLOR.green }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: COLOR.green }}>
                      {dataRowEditNew.usuario_atencion || 'Sin especificar'}
                    </div>
                    <div style={{ fontSize: '12px', color: COLOR.muted, marginTop: '2px' }}>
                      {new Date(dataRowEditNew.fecha_atencion).toLocaleString('es-PE')}
                    </div>
                    {dataRowEditNew.comentario_atencion && (
                      <div style={{
                        marginTop: '8px', padding: '8px 12px',
                        background: COLOR.grayBg, borderRadius: '6px',
                        fontSize: '13px', color: COLOR.text,
                        borderLeft: `3px solid ${COLOR.green}`,
                      }}>
                        {dataRowEditNew.comentario_atencion}
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Datos técnicos */}
          <Card>
            <CardHeader>
              <SectionIcon color={COLOR.gray}>
                <ToolsIcon fontSize="small" />
              </SectionIcon>
              <SectionTitle>Datos Técnicos</SectionTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', background: COLOR.grayBg, borderRadius: '8px',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase' }}>
                    IP Cliente
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, color: COLOR.text,
                    fontFamily: 'monospace', background: COLOR.white,
                    padding: '2px 8px', borderRadius: '4px',
                    border: `1px solid ${COLOR.border}`,
                  }}>
                    {dataRowEditNew.ip_cliente || '—'}
                  </span>
                </div>
                {dataRowEditNew.user_agent && (
                  <div style={{
                    padding: '8px 12px', background: COLOR.grayBg, borderRadius: '8px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', marginBottom: '4px' }}>
                      User Agent
                    </div>
                    <div style={{
                      fontSize: '11px', color: COLOR.text, fontFamily: 'monospace',
                      wordBreak: 'break-all', lineHeight: '1.5',
                    }}>
                      {dataRowEditNew.user_agent.substring(0, 120)}
                      {dataRowEditNew.user_agent.length > 120 ? '…' : ''}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

        </Grid>
      </Grid>

    </PageWrap>
  );
};

export default LibroReclamoEditPage;
