import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Typography, Alert, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  notificacionAlertaDescartar,
  notificacionAlertasPendientes,
} from '../../api/notificacion.api';
import { subscribeWebPush } from '../../hooks/useCampusWebPush';

const POLL_UI_MS = 45_000;
const fmtHora = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
};

const NOTIF_ICON = `${import.meta.env.BASE_URL || '/'}icon/favicon.svg`;
const TOAST_WIDTH = 360;
const TOAST_GAP = 12;
const ROJO_ALERTA = '#d32f2f';
const SNOOZE_STORAGE_KEY = 'campus-notif-snooze';

const readSnoozeMap = () => {
  try {
    const raw = localStorage.getItem(SNOOZE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    const clean = {};
    Object.entries(parsed).forEach(([k, until]) => {
      if (until > now) clean[k] = until;
    });
    if (Object.keys(clean).length !== Object.keys(parsed || {}).length) {
      localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(clean));
    }
    return clean;
  } catch {
    return {};
  }
};

const snoozeProyecto = (idProyecto, minutos = 10) => {
  if (!idProyecto) return;
  const map = readSnoozeMap();
  map[String(idProyecto)] = Date.now() + minutos * 60 * 1000;
  localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(map));
};

const proyectoSnoozed = (idProyecto) => {
  if (!idProyecto) return false;
  const map = readSnoozeMap();
  return (map[String(idProyecto)] ?? 0) > Date.now();
};

const etiquetaToast = (alerta, esTop) => {
  const nombre = (alerta.cliente || '').trim() || 'Cliente';
  return esTop ? `${nombre} · Prioridad #1` : `${nombre} · Por vencer`;
};

const rutaDesdeAlerta = (alerta) => {
  if (alerta?.id_proyecto) return `/campus/proyecto/${alerta.id_proyecto}`;
  return '/campus/dashboard';
};

async function ensureNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

function ToastCard({ alerta, onDescartar, onAbrir }) {
  const orden = alerta.orden_prioridad ?? 5;
  const esTop = orden === 1 || alerta.tipo === 'prioridad_top';
  const encabezado = etiquetaToast(alerta, esTop);
  const puedeAbrir = Boolean(alerta?.id_proyecto);

  const abrir = (e) => {
    e?.stopPropagation?.();
    if (puedeAbrir) onAbrir?.(alerta);
  };

  return (
    <Box
      sx={{
        width: TOAST_WIDTH,
        flexShrink: 0,
        borderRadius: '10px',
        bgcolor: 'rgba(255, 245, 245, 0.98)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(211,47,47,0.18), 0 0 0 1px rgba(211,47,47,0.25)',
        overflow: 'hidden',
        borderLeft: `4px solid ${ROJO_ALERTA}`,
        animation: 'notifSlideIn 0.35s ease',
        '@keyframes notifSlideIn': {
          from: { opacity: 0, transform: 'translateY(16px) scale(0.96)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        '@keyframes notifSlideOut': {
          from: { opacity: 1, transform: 'translateY(0) scale(1)' },
          to: { opacity: 0, transform: 'translateX(24px) scale(0.95)' },
        },
      }}
    >
      <Box
        onClick={puedeAbrir ? abrir : undefined}
        sx={{
          cursor: puedeAbrir ? 'pointer' : 'default',
          '&:hover': puedeAbrir ? { bgcolor: 'rgba(211,47,47,0.05)' } : {},
        }}
      >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, pt: 1.2, pb: 0.5 }}>
        <NotificationsActiveIcon sx={{ fontSize: 16, color: ROJO_ALERTA }} />
        <Typography
          sx={{
            flex: 1,
            fontSize: '0.72rem',
            fontWeight: 600,
            color: ROJO_ALERTA,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={encabezado}
        >
          {encabezado}
        </Typography>
        <Box
          sx={{
            minWidth: 22,
            height: 22,
            px: 0.6,
            borderRadius: '6px',
            bgcolor: esTop ? ROJO_ALERTA : 'rgba(211,47,47,0.12)',
            color: esTop ? '#fff' : ROJO_ALERTA,
            fontSize: '0.68rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Orden de prioridad del proyecto"
        >
          {orden}
        </Box>
        <IconButton size="small" sx={{ p: 0.3, color: '#666' }} onClick={(e) => e.stopPropagation()}><MoreHorizIcon sx={{ fontSize: 16 }} /></IconButton>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onDescartar(alerta); }}
          sx={{ p: 0.3, color: '#666' }}
          aria-label="Cerrar notificación"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ px: 1.5, pb: 1 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#b71c1c', mb: 0.4 }}>
          {alerta.titulo}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#5d1a1a', lineHeight: 1.45, mb: 0.6 }}>
          {alerta.mensaje}
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#a94444' }}>
          {fmtHora(alerta.created_at)}
          {alerta.proyecto ? ` · ${alerta.proyecto}` : ''}
        </Typography>
        {puedeAbrir && (
          <Typography
            sx={{
              mt: 0.8,
              fontSize: '0.72rem',
              fontWeight: 600,
              color: ROJO_ALERTA,
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 14 }} />
            Clic para abrir el proyecto
          </Typography>
        )}
      </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ px: 1.5, pb: 1.2 }}>
        {puedeAbrir && (
          <Button
            fullWidth
            onClick={abrir}
            startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              bgcolor: ROJO_ALERTA,
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.78rem',
              py: 0.7,
              '&:hover': { bgcolor: '#b71c1c' },
            }}
          >
            Ver proyecto
          </Button>
        )}
        <Button
          fullWidth
          onClick={() => onDescartar(alerta)}
          disableRipple
          sx={{
            textTransform: 'none',
            bgcolor: '#fff',
            color: ROJO_ALERTA,
            border: `1px solid ${ROJO_ALERTA}44`,
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.78rem',
            py: 0.7,
            '&:hover': { bgcolor: '#fff5f5' },
          }}
        >
          Descartar
        </Button>
      </Stack>
    </Box>
  );
}

export default function NotificacionToastHost({ webPushActive = false }) {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [config, setConfig] = useState({
    intervalo_minutos: 10,
    toast_navegador: true,
    notificacion_sistema: true,
    web_push_habilitado: false,
  });
  const [permiso, setPermiso] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef(null);
  const nativeShownRef = useRef(new Set());
  const descartadasRef = useRef(new Set());
  const webPushActiveRef = useRef(webPushActive);
  const configRef = useRef(config);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    webPushActiveRef.current = webPushActive;
  }, [webPushActive]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => { setMounted(true); }, []);

  const usarPushServidor = () =>
    webPushActiveRef.current && configRef.current.web_push_habilitado;

  const mostrarSistema = useCallback(async (alerta) => {
    const cfg = configRef.current;
    if (!cfg.notificacion_sistema || typeof Notification === 'undefined') return;
    if (usarPushServidor()) return;
    if (nativeShownRef.current.has(alerta.id_alerta)) return;

    const status = await ensureNotificationPermission();
    setPermiso(status);
    if (status !== 'granted') return;

    try {
      nativeShownRef.current.add(alerta.id_alerta);
      const tituloNativo = alerta.cliente
        ? `${alerta.cliente} — ${alerta.titulo}`
        : alerta.titulo;
      const n = new Notification(tituloNativo, {
        body: alerta.mensaje,
        tag: `campus-notif-${alerta.id_alerta}`,
        icon: NOTIF_ICON,
        requireInteraction: false,
      });
      n.onclick = () => {
        window.focus();
        n.close();
        navigateRef.current(rutaDesdeAlerta(alerta));
      };
    } catch {
      nativeShownRef.current.delete(alerta.id_alerta);
    }
  }, []);

  const aplicarResultado = useCallback((res) => {
    if (res?.config) {
      setConfig(res.config);
      configRef.current = res.config;
    }
    const nuevas = (res?.alertas || [])
      .filter((a) => !a.descartada && !a.leida)
      .filter((a) => !descartadasRef.current.has(a.id_alerta))
      .filter((a) => !proyectoSnoozed(a.id_proyecto));
    setAlertas(nuevas);

    if (res?.config?.notificacion_sistema && !usarPushServidor()) {
      nuevas.forEach((a) => mostrarSistema(a));
    }
  }, [mostrarSistema]);

  const poll = useCallback(async () => {
    try {
      const res = await notificacionAlertasPendientes();
      aplicarResultado(res);
    } catch {
      /* API no disponible o sin permiso admin */
    }
  }, [aplicarResultado]);

  useEffect(() => {
    poll();
    timerRef.current = setInterval(poll, POLL_UI_MS);
    return () => clearInterval(timerRef.current);
  }, [poll]);

  useEffect(() => {
    const onRefresh = () => poll();
    window.addEventListener('campus-notificaciones-poll', onRefresh);
    return () => window.removeEventListener('campus-notificaciones-poll', onRefresh);
  }, [poll]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [poll]);

  const solicitarPermisoWindows = async () => {
    const r = await subscribeWebPush();
    setPermiso(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
    if (r.ok) webPushActiveRef.current = true;
    poll();
  };

  const abrirAlerta = useCallback((alerta) => {
    navigate(rutaDesdeAlerta(alerta));
  }, [navigate]);

  const dismissAlertaInterno = useCallback((alerta) => {
    const idAlerta = alerta?.id_alerta;
    if (!idAlerta || descartadasRef.current.has(idAlerta)) return false;
    descartadasRef.current.add(idAlerta);
    nativeShownRef.current.delete(idAlerta);
    snoozeProyecto(alerta.id_proyecto, configRef.current.intervalo_minutos ?? 10);
    notificacionAlertaDescartar(idAlerta).catch(() => {});
    return true;
  }, []);

  const descartar = useCallback((alerta) => {
    if (dismissAlertaInterno(alerta)) {
      setAlertas((prev) => prev.filter((a) => a.id_alerta !== alerta.id_alerta));
    }
  }, [dismissAlertaInterno]);

  const descartarTodas = useCallback(() => {
    setAlertas((prev) => {
      prev.forEach((a) => dismissAlertaInterno(a));
      return [];
    });
  }, [dismissAlertaInterno]);

  const showPermisoBanner = config.notificacion_sistema
    && !usarPushServidor()
    && permiso !== 'granted'
    && permiso !== 'unsupported';

  const toastsVisibles = config.toast_navegador ? alertas : [];

  if (!mounted || (toastsVisibles.length === 0 && !showPermisoBanner)) return null;

  const content = (
    <>
      {showPermisoBanner && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99998, width: TOAST_WIDTH }}>
          <Alert
            severity="warning"
            action={
              permiso === 'denied' ? null : (
                <Button color="inherit" size="small" onClick={solicitarPermisoWindows} sx={{ textTransform: 'none' }}>
                  Activar
                </Button>
              )
            }
          >
            {permiso === 'denied'
              ? 'Windows bloqueó las notificaciones. Actívalas en Configuración → Sistema → Notificaciones → tu navegador.'
              : 'Permite notificaciones para ver alertas en Windows (Web Push o nativas).'}
          </Alert>
        </Box>
      )}

      {toastsVisibles.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: showPermisoBanner ? 120 : 24,
            right: 24,
            zIndex: 99999,
            width: TOAST_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: `${TOAST_GAP}px`,
            pointerEvents: 'none',
            '& > *': { pointerEvents: 'auto' },
          }}
        >
          <Button
            size="small"
            onClick={descartarTodas}
            disableRipple
            startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
            sx={{
              alignSelf: 'flex-end',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.72rem',
              color: '#fff',
              bgcolor: ROJO_ALERTA,
              borderRadius: '8px',
              px: 1.5,
              py: 0.6,
              boxShadow: '0 4px 14px rgba(211,47,47,0.35)',
              '&:hover': { bgcolor: '#b71c1c' },
            }}
          >
            Cerrar todas ({toastsVisibles.length})
          </Button>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: `${TOAST_GAP}px`,
              maxHeight: 'calc(100vh - 96px)',
              overflowY: 'auto',
            }}
          >
            {toastsVisibles.map((alerta) => (
              <ToastCard key={alerta.id_alerta} alerta={alerta} onDescartar={descartar} onAbrir={abrirAlerta} />
            ))}
          </Box>
        </Box>
      )}
    </>
  );

  return createPortal(content, document.body);
}
