import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Button, TextField,
  IconButton, Collapse, Alert, Snackbar, CircularProgress,
  Divider, InputAdornment, Tooltip,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { PortletHeader } from '../../../partials/content/Portlet';
import * as pasarelaApi from '../../../api/pasarela.api';

// ─── Colores de marca por pasarela ──────────────────────────────────────────
const GATEWAY_THEME = {
  culqi: {
    primary:    '#0066CC',
    light:      '#e8f2ff',
    border:     '#99c4f5',
    gradient:   'linear-gradient(135deg, #0066CC 0%, #0084ff 100%)',
    logoText:   'CULQI',
  },
  izipay: {
    primary:    '#E31C25',
    light:      '#fff0f1',
    border:     '#f5a0a4',
    gradient:   'linear-gradient(135deg, #E31C25 0%, #ff4d55 100%)',
    logoText:   'IZIPAY',
  },
  stripe: {
  primary:  '#635BFF',
  light:    '#f0efff',
  border:   '#b8b4ff',
  gradient: 'linear-gradient(135deg, #635BFF 0%, #8b85ff 100%)',
  logoText: 'STRIPE',
  },
  paypal: {
    primary:    '#003087',
    light:      '#e6ebf3',
    border:     '#99accf',
    gradient:   'linear-gradient(135deg, #003087 0%, #0070ba 100%)',
    logoText:   'PAYPAL',
  },
};

const DEFAULT_THEME = {
  primary: '#555', light: '#f5f5f5', border: '#ccc',
  gradient: 'linear-gradient(135deg, #555 0%, #888 100%)',
  logoText: '?',
};

/** BD / JSON pueden devolver 1, "1" o true según entorno; no usar === 1 solo */
function esPasarelaActiva(val) {
  return val === true || val === 1 || val === '1';
}

// ─── Logo de pasarela (texto estilizado) ────────────────────────────────────
const GatewayLogo = ({ codigo, nombre, size = 'md' }) => {
  const theme  = GATEWAY_THEME[codigo] || DEFAULT_THEME;
  const sz     = size === 'sm' ? { px: 1.5, py: 0.4, fontSize: '0.7rem' } : { px: 2, py: 0.6, fontSize: '0.95rem' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      background: theme.gradient,
      borderRadius: 1.5,
      px: sz.px, py: sz.py,
    }}>
      <Typography sx={{ color: 'white', fontWeight: 900, fontSize: sz.fontSize, letterSpacing: '0.05em' }}>
        {theme.logoText}
      </Typography>
    </Box>
  );
};

// ─── Encabezado de sección ──────────────────────────────────────────────────
const SectionLabel = ({ children, color = '#666' }) => (
  <Typography sx={{
    fontSize: '0.62rem', fontWeight: 700, color,
    textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1,
  }}>
    {children}
  </Typography>
);

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
const PasarelaIndexPage = () => {
  const [pasarelas,      setPasarelas]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activating,     setActivating]     = useState(null);   // id en proceso
  const [saving,         setSaving]         = useState(null);   // codigo en proceso
  const [expandedConfig, setExpandedConfig] = useState(null);   // codigo expandido
  const [editConfigs,    setEditConfigs]    = useState({});     // { codigo: { clave: valor } }
  const [showSecret,     setShowSecret]     = useState({});     // { uniqueKey: bool }
  const [snack,          setSnack]          = useState({ open: false, msg: '', severity: 'success' });

  // ── Carga de datos ────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pasarelaApi.listar();
      setPasarelas(data);

      // Inicializar estado local de edición para cada pasarela
      const ec = {};
      data.forEach(p => {
        ec[p.codigo] = {};
        p.configs.forEach(c => { ec[p.codigo][c.clave] = c.valor || ''; });
      });
      setEditConfigs(ec);
    } catch {
      notify('Error al cargar las pasarelas de pago', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const notify = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  const toggleSecret = (key) =>
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }));

  const handleConfigChange = (codigo, clave, valor) =>
    setEditConfigs(prev => ({ ...prev, [codigo]: { ...prev[codigo], [clave]: valor } }));

  // ── Activar pasarela ──────────────────────────────────────────────────────
  const handleActivar = async (id, nombre) => {
    setActivating(id);
    try {
      await pasarelaApi.activar({ id_pago_pasarela: id });
      notify(`✓ ${nombre} activada como pasarela de pago`);
      await cargar();
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error('[Pasarelas] activar', { status, body, message: err?.message });
      notify(
        body?.message || err?.message || 'Error al activar la pasarela',
        'error',
      );
    } finally {
      setActivating(null);
    }
  };

  // ── Guardar configuración ─────────────────────────────────────────────────
  const handleGuardarConfig = async (pasarela) => {
    setSaving(pasarela.codigo);
    try {
      const configs = pasarela.configs.map(c => ({
        clave: c.clave,
        valor: editConfigs[pasarela.codigo]?.[c.clave] ?? '',
      }));
      await pasarelaApi.actualizarConfig({ id_pago_pasarela: pasarela.id_pago_pasarela, configs });
      notify('Configuración guardada correctamente');
    } catch (error) {
      console.error('[Pasarelas] guardar config', error?.response?.data || error);
      notify('Error al guardar la configuración', 'error');
    } finally {
      setSaving(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <PortletHeader title="Administrador de Pasarelas de Pago" />

      {/* ── Alerta informativa ─────────────────────────────────────────── */}
      <Alert
        severity="info"
        icon={<CreditCardIcon />}
        sx={{ mb: 3, borderRadius: 2, border: '1px solid #bee3f8' }}
      >
        <Typography variant="body2">
          <strong>Solo puede haber una pasarela activa a la vez.</strong>{' '}
          Al activar una pasarela, las demás se desactivan automáticamente.
          La pasarela activa es la que procesará todos los cobros de la tienda.
        </Typography>
      </Alert>

      {/* ── Cards de pasarelas ─────────────────────────────────────────── */}
      <Grid container spacing={3}>
        {pasarelas.map(pasarela => {
          const theme       = GATEWAY_THEME[pasarela.codigo] || DEFAULT_THEME;
          const isActive = esPasarelaActiva(pasarela.is_activo);
          const isExpanded  = expandedConfig === pasarela.codigo;
          const isActivating = activating === pasarela.id_pago_pasarela;
          const isSaving    = saving === pasarela.codigo;

          return (
            <Grid item xs={12} md={6} key={pasarela.id_pago_pasarela}>
              <Paper
                elevation={0}
                sx={{
                  border      : isActive ? `2px solid ${theme.primary}` : '1.5px solid #e0e6ed',
                  borderRadius: 3,
                  overflow    : 'hidden',
                  transition  : 'all 0.25s ease',
                  boxShadow   : isActive ? `0 6px 28px ${theme.primary}20` : '0 2px 8px #0000000a',
                }}
              >
                {/* ── Barra de color superior (solo si activa) ── */}
                {isActive && (
                  <Box sx={{ height: 4, background: theme.gradient }} />
                )}

                {/* ── Cabecera de la card ─────────────────────── */}
                <Box sx={{
                  px: 3, py: 2.5,
                  bgcolor: isActive ? theme.light : '#fafbfc',
                  borderBottom: '1px solid #eaecf0',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
                }}>
                  {/* Logo + nombre + estado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Indicador de selección */}
                    {isActive
                      ? <CheckCircleRoundedIcon sx={{ color: theme.primary, fontSize: 26 }} />
                      : <RadioButtonUncheckedRoundedIcon sx={{ color: '#c0c8d2', fontSize: 26 }} />
                    }
                    <Box>
                      <GatewayLogo codigo={pasarela.codigo} nombre={pasarela.nombre} />
                      <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {isActive && (
                          <Chip
                            label="ACTIVA"
                            size="small"
                            icon={<CheckIcon sx={{ fontSize: '11px !important', color: 'white !important' }} />}
                            sx={{
                              bgcolor: theme.primary, color: 'white',
                              height: 18, fontSize: '0.58rem', fontWeight: 700,
                              letterSpacing: '0.08em',
                              '& .MuiChip-label': { px: 0.8 },
                            }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {pasarela.nombre}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Acción: Activar o badge "En uso" */}
                  {!isActive ? (
                    <Tooltip title={`Cambiar a ${pasarela.nombre}`}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={isActivating
                          ? <CircularProgress size={13} color="inherit" />
                          : <PowerSettingsNewIcon fontSize="small" />
                        }
                        onClick={() => handleActivar(pasarela.id_pago_pasarela, pasarela.nombre)}
                        disabled={!!activating}
                        sx={{
                          bgcolor: theme.primary, color: 'white',
                          '&:hover': { bgcolor: theme.primary, filter: 'brightness(0.88)' },
                          borderRadius: 2, textTransform: 'none', fontWeight: 600,
                          minWidth: 110, whiteSpace: 'nowrap',
                        }}
                      >
                        {isActivating ? 'Activando...' : 'Activar'}
                      </Button>
                    </Tooltip>
                  ) : (
                    <Chip
                      label="En uso"
                      size="small"
                      icon={<CheckIcon sx={{ fontSize: '12px !important' }} />}
                      sx={{
                        bgcolor: `${theme.primary}12`,
                        color  : theme.primary,
                        border : `1px solid ${theme.border}`,
                        fontWeight: 600, fontSize: '0.72rem',
                      }}
                    />
                  )}
                </Box>

                {/* ── Descripción ─────────────────────────────── */}
                <Box sx={{ px: 3, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {pasarela.descripcion}
                  </Typography>
                </Box>

                {/* ── Footer: contador + botón de config ──────── */}
                <Divider />
                <Box sx={{ px: 3, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <KeyOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">
                      {pasarela.configs?.length ?? 0} claves de configuración
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<SettingsOutlinedIcon fontSize="small" />}
                    onClick={() => setExpandedConfig(isExpanded ? null : pasarela.codigo)}
                    sx={{
                      textTransform: 'none', color: theme.primary, fontWeight: 600,
                      fontSize: '0.78rem',
                    }}
                  >
                    {isExpanded ? 'Ocultar configuración' : 'Configurar claves'}
                  </Button>
                </Box>

                {/* ── Panel de configuración expandible ──────── */}
                <Collapse in={isExpanded}>
                  <Box sx={{ px: 3, pb: 3, bgcolor: '#fafbfc', borderTop: '1px solid #eaecf0' }}>

                    {/* Aviso sobre secretos */}
                    <Alert
                      severity="warning"
                      icon={<LockOutlinedIcon fontSize="small" />}
                      sx={{ mt: 2, mb: 2, py: 0.5, fontSize: '0.75rem', borderRadius: 1.5 }}
                    >
                      Los campos son secretos. Si los dejas vacíos, el valor almacenado no se modifica.
                    </Alert>

                    <SectionLabel color={theme.primary}>
                      Claves API — {pasarela.nombre}
                    </SectionLabel>

                    <Grid container spacing={2}>
                      {pasarela.configs?.map(cfg => {
                        const secretKey = `${pasarela.codigo}_${cfg.clave}`;
                        const isVisible = !!showSecret[secretKey];

                        // Etiqueta y ayuda más claras para Culqi / Izipay
                        const isIzipay = pasarela.codigo === 'izipay';
                        const isCulqi  = pasarela.codigo === 'culqi';
                        const isPaypal = pasarela.codigo === 'paypal';
                        const baseLabel = cfg.etiqueta || cfg.clave;
                        const varName   = cfg.clave;
                        const friendlyLabel = (isIzipay || isCulqi || isPaypal)
                          ? `${baseLabel}  ·  ${varName}`
                          : baseLabel;

                        return (
                          <Grid item xs={12} sm={6} key={cfg.clave}>
                            <TextField
                              fullWidth
                              size="small"
                              label={`${cfg.es_secreto ? '🔒 ' : ''}${friendlyLabel}`}
                              type={cfg.es_secreto && !isVisible ? 'password' : 'text'}
                              value={editConfigs[pasarela.codigo]?.[cfg.clave] ?? ''}
                              onChange={e => handleConfigChange(pasarela.codigo, cfg.clave, e.target.value)}
                              placeholder={
                                cfg.es_secreto
                                  ? 'Dejar vacío para conservar valor actual'
                                  : (isIzipay || isCulqi || isPaypal)
                                    ? `${varName} (se usa en el backend/.env)`
                                    : ''
                              }
                              InputProps={{
                                endAdornment: cfg.es_secreto ? (
                                  <InputAdornment position="end">
                                    <Tooltip title={isVisible ? 'Ocultar' : 'Mostrar'}>
                                      <IconButton size="small" onClick={() => toggleSecret(secretKey)}>
                                        {isVisible
                                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 17 }} />
                                          : <VisibilityOutlinedIcon   sx={{ fontSize: 17 }} />
                                        }
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                ) : undefined,
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: theme.primary },
                              }}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>

                    {/* Botón guardar */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        startIcon={isSaving
                          ? <CircularProgress size={14} color="inherit" />
                          : <SaveOutlinedIcon />
                        }
                        onClick={() => handleGuardarConfig(pasarela)}
                        disabled={isSaving}
                        sx={{
                          bgcolor: theme.primary, color: 'white',
                          '&:hover': { bgcolor: theme.primary, filter: 'brightness(0.88)' },
                          '&.Mui-disabled': { bgcolor: `${theme.primary}70`, color: 'white' },
                          borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3,
                        }}
                      >
                        {isSaving ? 'Guardando...' : 'Guardar configuración'}
                      </Button>
                    </Box>
                  </Box>
                </Collapse>

              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Nota adicional: PaymentGatewayManager ──────────────────────── */}
      <Paper
        elevation={0}
        sx={{ mt: 4, p: 2.5, border: '1px solid #e0e6ed', borderRadius: 2, bgcolor: '#fafbfc' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8 }}>
          <strong>¿Cómo funciona en el backend?</strong> El servicio{' '}
          <code style={{ background: '#e8ecf0', padding: '1px 5px', borderRadius: 4 }}>
            PaymentGatewayManager
          </code>{' '}
          lee la pasarela activa desde la base de datos y expone métodos como{' '}
          <code style={{ background: '#e8ecf0', padding: '1px 5px', borderRadius: 4 }}>
            isCulqi()
          </code>{' '}
          e{' '}
          <code style={{ background: '#e8ecf0', padding: '1px 5px', borderRadius: 4 }}>
            isIzipay()
          </code>{' '}
          <code style={{ background: '#e8ecf0', padding: '1px 5px', borderRadius: 4 }}>
            stripe()
          </code>{' '}
          o{' '}
          <code style={{ background: '#e8ecf0', padding: '1px 5px', borderRadius: 4 }}>
            isPaypal()
          </code>{' '}
          para que el <code style={{ background: '#e8ecf0', padding: '1px 5px', borderRadius: 4 }}>
            CheckoutController
          </code>{' '}
          sepa qué pasarela usar en cada cobro.
        </Typography>
      </Paper>

      {/* ── Snackbar de notificaciones ─────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={closeSnack}
          sx={{ borderRadius: 2, minWidth: 260 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PasarelaIndexPage;
