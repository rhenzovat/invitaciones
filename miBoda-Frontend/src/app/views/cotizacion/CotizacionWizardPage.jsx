import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box, Typography, Paper, Grid, Button, TextField,
  CircularProgress, InputAdornment, Chip,
} from '@mui/material';
import PersonOutlineIcon   from '@mui/icons-material/PersonOutline';
import BusinessIcon        from '@mui/icons-material/Business';
import WhatsAppIcon        from '@mui/icons-material/WhatsApp';
import EmailOutlinedIcon   from '@mui/icons-material/EmailOutlined';
import NotesIcon           from '@mui/icons-material/Notes';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon    from '@mui/icons-material/ArrowForward';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

import { catalogoPublico, crearPresupuesto } from '../../api/cotizacion.api';
import CotizacionTipoCard              from './components/CotizacionTipoCard';
import CotizacionWizardBuilderStep     from './components/CotizacionWizardBuilderStep';
import CotizacionWizardExtrasStep      from './components/CotizacionWizardExtrasStep';
import CotizacionWizardResumen         from './components/CotizacionWizardResumen';
import CotizacionWizardSuccessPanel    from './components/CotizacionWizardSuccessPanel';
import { toastSuccess, toastInfo, handleErrorMessages, handleWarningMessages } from '../../components/notify-messages';
import { validateWhatsapp, WHATSAPP_MAX } from './utils/cotizacionCliente';

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = ['Tipo de proyecto', 'Módulos (lienzo)', 'Extras', 'Resumen'];
const EMPTY_FORM = { nombre: '', empresa: '', whatsapp: '', correo: '', descripcion: '' };

// ─── Custom step indicator ────────────────────────────────────────────────────
const StepIndicator = ({ steps, activeStep, success }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: { xs: 0, sm: 2 } }}>
    {steps.map((label, i) => {
      const done    = success || i < activeStep;
      const current = !success && i === activeStep;
      return (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.82rem',
              transition: 'all 0.3s ease',
              ...(done ? {
                bgcolor: '#004A99', color: '#fff',
                boxShadow: '0 2px 10px rgba(0,74,153,0.35)',
              } : current ? {
                bgcolor: '#fff', color: '#004A99',
                border: '2.5px solid #004A99',
                boxShadow: '0 0 0 4px rgba(0,74,153,0.12)',
              } : {
                bgcolor: '#f1f5f9', color: '#94a3b8',
                border: '2px solid #e2e8f0',
              }),
            }}>
              {done ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : i + 1}
            </Box>
            <Typography variant="caption" sx={{
              fontSize: '0.65rem', fontWeight: current || done ? 700 : 500,
              color: current ? '#004A99' : done ? '#1e293b' : '#94a3b8',
              whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' },
            }}>
              {label}
            </Typography>
          </Box>

          {i < steps.length - 1 && (
            <Box sx={{
              flex: 1, height: 2, mx: 1, borderRadius: 2,
              bgcolor: done ? '#004A99' : '#e2e8f0',
              transition: 'background 0.3s ease',
              mb: { xs: 0, sm: 2.5 },
            }} />
          )}
        </Box>
      );
    })}
  </Box>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="h6" fontWeight={800} sx={{ color: '#1e293b', lineHeight: 1.3 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: '#64748b', mt: 0.4, fontSize: '0.84rem' }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

// ─── Form field ───────────────────────────────────────────────────────────────
const FormField = ({
  label, value, onChange, required, icon, type = 'text', multiline, rows, placeholder,
  inputProps, helperText,
}) => (
  <TextField
    fullWidth
    size="small"
    label={label}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    multiline={multiline}
    rows={rows}
    placeholder={placeholder}
    helperText={helperText}
    inputProps={inputProps}
    InputProps={icon ? { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> } : undefined}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        '&:hover fieldset': { borderColor: '#004A99' },
        '&.Mui-focused fieldset': { borderColor: '#004A99', borderWidth: 2 },
      },
      '& .MuiInputLabel-root.Mui-focused': { color: '#004A99' },
      '& .MuiInputAdornment-root svg': { fontSize: 18, color: '#94a3b8' },
    }}
  />
);

// ─── Loading screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
    <Box sx={{
      width: 64, height: 64, borderRadius: '16px',
      bgcolor: 'rgba(0,74,153,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CircularProgress size={32} sx={{ color: '#004A99' }} />
    </Box>
    <Typography variant="body2" sx={{ color: '#64748b' }}>Cargando catálogo…</Typography>
  </Box>
);

// ─── Frases de recomendación por tipo de proyecto ────────────────────────────
const FRASES_POR_TIPO = {
  landing: [
    'Necesito una landing page atractiva para captar leads de mi campaña en Google Ads, con formulario de contacto y botón de WhatsApp visible desde cualquier dispositivo.',
    'Quiero una página de ventas persuasiva para lanzar mi producto, con secciones de beneficios, testimonios reales de clientes y una llamada a la acción clara.',
    'Busco una landing profesional para mi servicio de consultoría que transmita confianza, cargue rápido en móviles y convierta visitantes en prospectos.',
    'Necesito una landing para mi campaña de redes sociales con diseño moderno, animaciones sutiles, formulario integrado y pixel de seguimiento.',
    'Quiero captar suscriptores para mi evento o webinar con una página de registro impactante, contador regresivo y confirmación automática por email.',
    'Necesito una página específica para promocionar un servicio nuevo, con video de presentación, preguntas frecuentes y sección de garantía o respaldo.',
    'Busco una landing con integración a WhatsApp Business, formulario de cotización express y sección de casos de éxito o clientes referentes.',
    'Requiero una página de aterrizaje para campaña estacional con diseño acorde a mi marca, enfocada en conversión y con métricas de rendimiento.',
    'Quiero una landing elegante para mi negocio inmobiliario con galería de propiedades destacadas, mapa de ubicación y formulario de contacto directo.',
    'Necesito una página de captación para mi academia o curso online con temario, presentación del instructor y botón de inscripción bien destacado.',
  ],
  web: [
    'Necesito una página web corporativa completa con inicio, servicios, nosotros, portafolio de trabajos realizados y formulario de contacto profesional.',
    'Busco una web moderna para mi empresa que transmita confianza, sea responsiva en todos los dispositivos y esté optimizada para aparecer en Google.',
    'Quiero rediseñar mi sitio web actual con una imagen más profesional, mejor experiencia de usuario, carga más rápida y diseño acorde a mi marca.',
    'Necesito un sitio web para mi empresa de construcción con galería de proyectos ejecutados, detalle de servicios, mapa de ubicación y contacto directo.',
    'Requiero una web para mi consultora con blog integrado, sección de equipo profesional, casos de éxito destacados y formulario de solicitud de cotización.',
    'Quiero una página web para mi restaurante con menú interactivo, galería de platos, sistema de reservas en línea y ubicación integrada en Google Maps.',
    'Necesito presencia digital profesional con dominio propio, correos corporativos, SSL incluido y diseño coherente con mi identidad de marca.',
    'Busco un sitio web multipage con panel de administración sencillo para actualizar contenido, imágenes y noticias sin conocimientos técnicos.',
    'Quiero una web para mi clínica con presentación de especialidades médicas, perfil del equipo, horarios de atención y sistema de solicitud de citas.',
    'Necesito un sitio corporativo con portafolio de clientes, sección de aliados estratégicos, blog de posicionamiento SEO y formulario de contacto.',
  ],
  tienda: [
    'Quiero una tienda online completa con catálogo de productos, carrito de compras, pagos con tarjeta o transferencia y gestión de envíos a todo el país.',
    'Necesito un ecommerce para vender mis productos artesanales con galería detallada, descripciones, pasarela de pago segura y control de inventario.',
    'Busco una tienda virtual integrada con mis redes sociales, panel para gestionar pedidos, notificaciones automáticas al cliente y reportes de ventas.',
    'Requiero un ecommerce con múltiples categorías, filtros de búsqueda avanzada, sistema de descuentos por volumen y cupones de promoción.',
    'Necesito una tienda online con integración a Izipay o Culqi, seguimiento de pedidos en tiempo real y emisión de comprobantes electrónicos.',
    'Quiero vender mis servicios o paquetes en línea con sistema de reservas, pagos anticipados, confirmación automática y recordatorios por WhatsApp.',
    'Busco una tienda virtual B2B con listas de precios diferenciadas por tipo de cliente, gestión de pedidos al por mayor y créditos comerciales.',
    'Necesito un ecommerce para mi marca de ropa con variantes de talla y color, lista de deseos, comparador de productos y sistema de reseñas.',
    'Quiero una tienda online rápida y segura con SSL, optimizada para móviles, soporte por chat en vivo y recuperación automática de carritos abandonados.',
    'Necesito migrar mi tienda física al canal digital con catálogo completo, múltiples métodos de pago y panel de administración sencillo para mi equipo.',
  ],
  sistema: [
    'Necesito un sistema web a medida para gestionar clientes, cotizaciones, facturas y el seguimiento de mis proyectos, todo integrado en una sola plataforma.',
    'Requiero un software personalizado para automatizar los procesos internos de mi empresa, con módulos por área, roles de usuario y reportes en tiempo real.',
    'Busco un sistema de control de inventario y ventas con alertas de stock mínimo, historial de movimientos, caja diaria y reportes para toma de decisiones.',
    'Necesito una plataforma web para gestionar empleados, registrar asistencias, aprobar permisos y calcular planilla de sueldos de forma automatizada.',
    'Quiero un sistema CRM personalizado para mi equipo comercial con seguimiento de leads, etapas del pipeline, recordatorios de seguimiento y métricas.',
    'Requiero un sistema integral para mi clínica: gestión de citas, historial clínico, recetas médicas, facturación y estadísticas de atención.',
    'Necesito un sistema de pedidos en línea para mi negocio de comida con módulo de cocina, caja, seguimiento de delivery y reportes de ventas diarias.',
    'Busco un sistema de gestión académica con módulos de matrícula, registro de notas, control de asistencias, comunicados y portal para padres o alumnos.',
    'Quiero una plataforma para gestionar proyectos de construcción con cronograma, presupuesto detallado, avance por etapas y gestión documental.',
    'Necesito un sistema logístico para registrar envíos, asignar transportistas, generar guías de remisión y notificar al cliente en cada punto del proceso.',
  ],
  aula: [
    'Quiero una plataforma de cursos online donde pueda subir videos, materiales PDF, evaluaciones interactivas y emitir certificados automáticos al finalizar.',
    'Necesito un aula virtual para mi institución con acceso diferenciado para alumnos, docentes y administradores, con reportes de progreso académico.',
    'Busco una plataforma e-learning para vender mis cursos grabados con pasarela de pago, acceso controlado por suscripción y seguimiento del avance.',
    'Requiero un sistema de capacitación corporativa para mis empleados con módulos por área, evaluaciones de competencias y reporte de cumplimiento.',
    'Quiero una plataforma con clases en vivo integradas a Zoom o Meet, calendario de sesiones, grabaciones disponibles y material descargable por clase.',
    'Necesito un aula virtual para mi academia de idiomas con ejercicios interactivos, seguimiento de nivel, pronunciación asistida y certificación oficial.',
    'Busco una plataforma educativa con foros de debate, entrega y calificación de tareas, notas automáticas y mensajería interna entre docente y alumno.',
    'Requiero un sistema de membresías para acceso a contenido educativo exclusivo con pagos recurrentes, control de suscripciones y acceso por niveles.',
    'Quiero una plataforma de evaluaciones con banco de preguntas aleatorias, temporizador por examen, restricción de ventanas y resultados inmediatos.',
    'Necesito un aula virtual institucional accesible desde móviles, con notificaciones push para nuevas clases, tareas pendientes y materiales actualizados.',
  ],
};

// Mezcla aleatoria y devuelve las frases del tipo dado
function getFrases(slug) {
  const lista = FRASES_POR_TIPO[slug] ?? [];
  return [...lista].sort(() => Math.random() - 0.5);
}

// ─── Chips de frases rápidas ──────────────────────────────────────────────────
function DescripcionChips({ projectId, onSelect }) {
  const frases = useMemo(() => getFrases(projectId), [projectId]);
  if (!projectId || frases.length === 0) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
        <LightbulbOutlinedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
        <Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Frases rápidas — clic para usar
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
        {frases.map((frase, i) => (
          <Chip
            key={i}
            label={frase.length > 72 ? frase.slice(0, 72) + '…' : frase}
            size="small"
            clickable
            onClick={() => onSelect(frase)}
            title={frase}
            sx={{
              fontSize: '0.71rem',
              fontWeight: 500,
              height: 'auto',
              py: 0.6,
              px: 0.2,
              maxWidth: '100%',
              whiteSpace: 'normal',
              lineHeight: 1.35,
              cursor: 'pointer',
              bgcolor: 'rgba(0,74,153,0.06)',
              color: '#1e40af',
              border: '1px solid rgba(0,74,153,0.18)',
              borderRadius: '8px',
              transition: 'all 0.18s',
              '& .MuiChip-label': { whiteSpace: 'normal', px: 1.2 },
              '&:hover': {
                bgcolor: 'rgba(0,74,153,0.14)',
                borderColor: '#004A99',
                boxShadow: '0 2px 8px rgba(0,74,153,0.18)',
                transform: 'translateY(-1px)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CotizacionWizardPage({ onCreated, onEditProforma }) {
  const canvasRef = useRef(null);
  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [data,             setData]             = useState(null);
  const [step,             setStep]             = useState(0);
  const [projectId,        setProjectId]        = useState(null);
  const [modules,          setModules]          = useState([]);
  const [hasHosting,       setHasHosting]       = useState(null);
  const [hostingError,     setHostingError]     = useState(false);
  const [form,             setForm]             = useState({ ...EMPTY_FORM });
  const [savedPresupuesto, setSavedPresupuesto] = useState(null);

  const reloadCatalogo = useCallback(() => {
    catalogoPublico()
      .then(setData)
      .catch((e) => handleErrorMessages('Cotizador', e));
  }, []);

  useEffect(() => {
    catalogoPublico()
      .then(setData)
      .catch((e) => handleErrorMessages('Cotizador', e))
      .finally(() => setLoading(false));
  }, []);

  const project         = useMemo(() => data?.projectTypes?.find((p) => p.id === projectId), [data, projectId]);
  const hasModulesCatalog = (data?.modules?.length ?? 0) > 0;
  const showCanvasStep  = hasModulesCatalog;
  const requiresModules = project && (project.needsModules || project.id === 'sistema' || project.id === 'aula');

  useEffect(() => { if (step === 1 && !showCanvasStep) setStep(2); }, [step, showCanvasStep]);
  useEffect(() => {
    if (step !== 1 || !showCanvasStep) return;
    const t = setTimeout(() => { if (modules.length) canvasRef.current?.restoreModules(modules); }, 50);
    return () => clearTimeout(t);
  }, [step, showCanvasStep]);

  const modulesTotal = modules.reduce((s, m) => s + (m.price || 0), 0);
  const discount     = hasHosting === true ? (data?.discountHosting ?? 50) : 0;
  const subtotal     = (project?.price ?? 0) + modulesTotal;
  const total        = Math.max(0, subtotal - discount);
  const currency     = data?.currency ?? 'S/';

  const handleCanvasChange = useCallback((mods) => setModules(mods), []);

  // Elimina un módulo desde el Resumen — removeByModuleId ya llama draw()+emitChange()
  // que dispara onChange → handleCanvasChange → setModules automáticamente
  const handleRemoveModule = useCallback((mod) => {
    canvasRef.current?.removeByModuleId?.(mod.id);
  }, []);

  const resetWizard = useCallback(() => {
    setStep(0); setProjectId(null); setModules([]); setHasHosting(null);
    setHostingError(false); setForm({ ...EMPTY_FORM }); setSavedPresupuesto(null);
    canvasRef.current?.clear?.();
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.nombre.trim() || !project) return;
    const whatsappError = validateWhatsapp(form.whatsapp, { required: true });
    if (whatsappError) {
      handleWarningMessages('Datos del cliente', whatsappError);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre, empresa: form.empresa, whatsapp: form.whatsapp,
        correo: form.correo, descripcion: form.descripcion,
        projectType: project.title, projectTypeSlug: project.id,
        modules, hasHosting: hasHosting === true, discount, subtotal, total,
        delivery: project.delivery, canvas_layout: modules, origen: 'admin',
      };
      const pres = await crearPresupuesto(payload);
      toastSuccess(`Cotización ${pres.codigo} registrada`);
      onCreated?.(pres);
      // Siempre mostrar el panel de éxito — el padre puede ofrecer "Editar proforma" desde ahí
      setSavedPresupuesto(pres);
      setForm({ ...EMPTY_FORM }); setProjectId(null); setModules([]); setHasHosting(null);
      canvasRef.current?.clear?.();
    } catch (e) {
      handleErrorMessages('Error', e);
    } finally {
      setSaving(false);
    }
  }, [form, project, modules, hasHosting, discount, subtotal, total, onCreated]);

  const isSuccess      = !!savedPresupuesto;
  const resumenProject = isSuccess ? null : project;
  const resumenModules = isSuccess ? [] : modules;
  const resumenDiscount = isSuccess ? 0 : discount;
  const resumenTotal   = isSuccess ? 0 : total;

  const footerAction = useMemo(() => {
    if (isSuccess) return null;
    if (step === 0) return { continueLabel: 'Continuar', onContinue: () => setStep(showCanvasStep ? 1 : 2), continueDisabled: !projectId };
    if (step === 1 && showCanvasStep) return {
      showBack: true, onBack: () => setStep(0), continueLabel: 'Continuar', continueVariant: 'orange',
      onContinue: () => {
        if (requiresModules && modules.length === 0) { toastInfo('Agrega al menos un módulo en el lienzo para continuar.'); return; }
        setStep(2);
      },
    };
    if (step === 2) return {
      showBack: true, onBack: () => setStep(showCanvasStep ? 1 : 0),
      continueLabel: 'Ver resumen y enviar', continueVariant: 'orange',
      continueDisabled: hasHosting === null,
      onContinue: () => { if (hasHosting === null) { setHostingError(true); return; } setStep(3); },
    };
    if (step === 3) return {
      showBack: true, onBack: () => setStep(2),
      continueLabel: 'Guardar y generar cotización', continueVariant: 'orange',
      continueDisabled: saving || !form.nombre.trim(), continueLoading: saving,
      onContinue: handleSave,
    };
    return null;
  }, [isSuccess, step, showCanvasStep, projectId, requiresModules, modules.length, hasHosting, saving, form.nombre, handleSave]);

  if (loading) return <LoadingScreen />;

  return (
    <Box sx={{ pt: 2 }}>
      {/* ── Step indicator ───────────────────────────────────────────────── */}
      <StepIndicator steps={STEPS} activeStep={isSuccess ? STEPS.length : step} success={isSuccess} />

      <Grid container spacing={2.5} alignItems="flex-start">
        {/* ── Main content ─────────────────────────────────────────────── */}
        <Grid item xs={12} md={9}>
          {isSuccess ? (
            <CotizacionWizardSuccessPanel
              presupuesto={savedPresupuesto}
              onNuevaCotizacion={resetWizard}
              onEditProforma={onEditProforma ? () => onEditProforma(savedPresupuesto) : null}
            />
          ) : (
            <>
              {/* Step 0 — Tipo de proyecto */}
              {step === 0 && (
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <SectionHeader
                    title="¿Qué estás buscando?"
                    subtitle="Elige el tipo de proyecto. Cada opción incluye beneficios y un precio base transparente."
                  />
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}>
                    {data?.projectTypes?.map((p) => (
                      <CotizacionTipoCard
                        key={p.id}
                        tipo={p}
                        selected={projectId === p.id}
                        onSelect={(t) => setProjectId(t.id ?? t.slug)}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Step 1 — Módulos lienzo */}
              {step === 1 && showCanvasStep && (
                <CotizacionWizardBuilderStep
                  canvasRef={canvasRef}
                  modules={data?.modules ?? []}
                  selectedModules={modules}
                  currency={currency}
                  optional={!requiresModules}
                  onModulesChange={handleCanvasChange}
                  onModuleCreated={reloadCatalogo}
                />
              )}

              {/* Step 2 — Extras */}
              {step === 2 && (
                <CotizacionWizardExtrasStep
                  hasHosting={hasHosting}
                  hostingError={hostingError}
                  discountHosting={data?.discountHosting ?? 50}
                  currency={currency}
                  infoBlocks={data?.infoBlocks ?? []}
                  onHostingChange={(v) => { setHasHosting(v); setHostingError(false); }}
                  editable
                  onBlockSaved={reloadCatalogo}
                />
              )}

              {/* Step 3 — Datos del cliente */}
              {step === 3 && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <SectionHeader
                    title="Datos del cliente"
                    subtitle="Ingresa la información para generar la cotización personalizada."
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="Nombre *" value={form.nombre} required
                        icon={<PersonOutlineIcon />}
                        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="Empresa" value={form.empresa}
                        icon={<BusinessIcon />}
                        onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="WhatsApp *" value={form.whatsapp} required
                        type="tel"
                        icon={<WhatsAppIcon sx={{ color: '#25d366 !important' }} />}
                        placeholder="Ej: +51 999 888 777"
                        helperText="Solo número de teléfono (máx. 40 caracteres)"
                        inputProps={{ maxLength: WHATSAPP_MAX, inputMode: 'tel', autoComplete: 'tel' }}
                        onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="Correo electrónico" value={form.correo}
                        icon={<EmailOutlinedIcon />}
                        type="email"
                        onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        label="Descripción del proyecto" value={form.descripcion}
                        icon={<NotesIcon />}
                        multiline rows={4}
                        placeholder="Describe brevemente el proyecto, requerimientos especiales, plazo, etc."
                        onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                      />
                      <DescripcionChips
                        projectId={projectId}
                        onSelect={(frase) => setForm((f) => ({ ...f, descripcion: frase }))}
                      />
                    </Grid>
                  </Grid>

                  {/* Inline save button (visible on mobile below form) */}
                  <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
                    <Button
                      fullWidth variant="contained"
                      disabled={saving || !form.nombre.trim()}
                      onClick={handleSave}
                      endIcon={!saving && <ArrowForwardIcon />}
                      sx={{
                        py: 1.3, fontWeight: 700, borderRadius: '10px', fontSize: '0.9rem',
                        bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' },
                        '&.Mui-disabled': { bgcolor: '#e2e8f0' },
                      }}
                    >
                      {saving ? 'Guardando…' : 'Guardar y generar cotización'}
                    </Button>
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Grid>

        {/* ── Resumen sidebar ───────────────────────────────────────────── */}
        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <CotizacionWizardResumen
            currency={currency}
            project={resumenProject}
            modules={resumenModules}
            discount={resumenDiscount}
            total={resumenTotal}
            delivery={resumenProject?.delivery}
            footerAction={footerAction}
            onRemoveModule={handleRemoveModule}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
