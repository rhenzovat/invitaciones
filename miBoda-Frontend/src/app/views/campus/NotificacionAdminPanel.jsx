import { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, IconButton, Typography, Stack, Chip,
  Switch, TextField, Tooltip, Fade, Collapse,
} from '@mui/material';
import CloseIcon        from '@mui/icons-material/Close';
import SaveIcon         from '@mui/icons-material/Save';
import AddIcon          from '@mui/icons-material/Add';
import DeleteIcon       from '@mui/icons-material/Delete';
import EditIcon         from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon       from '@mui/icons-material/Circle';
import TrafficIcon      from '@mui/icons-material/Traffic';
import SettingsIcon     from '@mui/icons-material/Settings';
import FlashOnIcon      from '@mui/icons-material/FlashOn';
import CheckIcon        from '@mui/icons-material/Check';
import {
  notificacionConfigObtener, notificacionConfigGuardar,
  notificacionEstadosListar, notificacionEstadosGuardar, notificacionEstadosEliminar,
  notificacionSemaforosListar, notificacionSemaforosGuardar, notificacionSemaforosEliminar,
  notificacionEvaluarManual,
} from '../../api/notificacion.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';
import { triggerCampusNotificacionPoll } from '../../utils/campusNotificacionPoll';

const EMPTY_ESTADO   = { nombre: '', color_hex: '#64748b', aplica_a: 'ambos', orden: 0, activo: true };
const EMPTY_SEMAFORO = { nombre: '', color_hex: '#22c55e', dias_restantes_min: null, dias_restantes_max: null, orden: 0, activo: true };

// ── Paleta de tabs ────────────────────────────────────────────────────────────
const TABS = [
  { id: 0, label: 'Configuración', icon: SettingsIcon,     color: '#6366f1', bg: '#eef2ff' },
  { id: 1, label: 'Estados',       icon: CircleIcon,       color: '#0891b2', bg: '#ecfeff' },
  { id: 2, label: 'Semáforos',     icon: TrafficIcon,      color: '#16a34a', bg: '#f0fdf4' },
];

// ── Config Card ───────────────────────────────────────────────────────────────
function ConfigCard({ icon: Icon, label, hint, value, onChange, type = 'number', color = '#6366f1' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(String(value ?? ''));

  useEffect(() => { setDraft(String(value ?? '')); }, [value]);

  const confirm = () => {
    onChange(type === 'number' ? (parseInt(draft, 10) || 0) : draft);
    setEditing(false);
  };

  return (
    <Box sx={{
      p: 1.8, borderRadius: '14px', bgcolor: '#fff',
      border: `1.5px solid ${editing ? color : '#e2e8f0'}`,
      boxShadow: editing ? `0 0 0 3px ${color}20` : '0 1px 6px rgba(0,0,0,0.05)',
      transition: 'all 0.2s', cursor: editing ? 'default' : 'pointer',
      '&:hover': editing ? {} : { borderColor: color, boxShadow: `0 0 0 3px ${color}15` },
    }}
      onClick={() => !editing && setEditing(true)}
    >
      <Box display="flex" alignItems="center" gap={1.2} mb={editing ? 1 : 0}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon sx={{ fontSize: 18, color }} />
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          {!editing && (
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1.1 }}>
              {value}<span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: 4 }}>min</span>
            </Typography>
          )}
        </Box>
        {!editing && (
          <EditIcon sx={{ fontSize: 14, color: '#94a3b8', opacity: 0.6 }} />
        )}
      </Box>
      <Collapse in={editing}>
        <TextField fullWidth size="small" type={type} value={draft} autoFocus
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setEditing(false); }}
          sx={{ '& .MuiInputBase-root': { borderRadius: '8px', bgcolor: `${color}08` },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: color } }} />
        {hint && <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', mt: 0.5 }}>{hint}</Typography>}
        <Stack direction="row" spacing={0.8} mt={1} justifyContent="flex-end">
          <Button size="small" onClick={() => setEditing(false)}
            sx={{ textTransform: 'none', color: '#94a3b8', fontSize: '0.75rem' }}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={confirm}
            startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', bgcolor: color, borderRadius: '8px', fontSize: '0.75rem',
              '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}>
            Aplicar
          </Button>
        </Stack>
      </Collapse>
    </Box>
  );
}

// ── Toggle Card ───────────────────────────────────────────────────────────────
function ToggleCard({ icon: Icon, label, hint, checked, onChange, color = '#6366f1' }) {
  return (
    <Box sx={{
      p: 1.5, borderRadius: '14px', bgcolor: checked ? `${color}08` : '#fff',
      border: `1.5px solid ${checked ? color : '#e2e8f0'}`,
      display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': { borderColor: color, boxShadow: `0 0 0 3px ${color}12` },
    }} onClick={() => onChange(!checked)}>
      <Box sx={{ width: 34, height: 34, borderRadius: '9px',
        bgcolor: checked ? `${color}20` : '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: 17, color: checked ? color : '#94a3b8' }} />
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: checked ? color : '#475569' }}>
          {label}
        </Typography>
        {hint && <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.3 }}>{hint}</Typography>}
      </Box>
      <Switch size="small" checked={checked} onChange={() => {}}
        sx={{ pointerEvents: 'none',
          '& .MuiSwitch-thumb': { bgcolor: checked ? color : '#cbd5e1' },
          '& .MuiSwitch-track': { bgcolor: checked ? `${color}60` : '#e2e8f0' } }} />
    </Box>
  );
}

// ── Estado / Semáforo Card ────────────────────────────────────────────────────
function ItemCard({ item, onEdit, onDelete, fields }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.2,
      p: 1.2, borderRadius: '10px', bgcolor: '#fff',
      border: '1.5px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'all 0.15s',
      '&:hover': { borderColor: item.color_hex, boxShadow: `0 0 0 2px ${item.color_hex}20` },
    }}>
      {/* Color dot */}
      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: item.color_hex,
        flexShrink: 0, boxShadow: `0 2px 8px ${item.color_hex}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
      </Box>
      {/* Info */}
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }} noWrap>
          {item.nombre}
        </Typography>
        {fields.map(f => (
          <Typography key={f.key} sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
            {f.label}: <span style={{ color: '#475569', fontWeight: 600 }}>{item[f.key] ?? '—'}</span>
          </Typography>
        ))}
      </Box>
      {/* Actions */}
      <Stack direction="row" spacing={0.3}>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(item)}
            sx={{ color: '#6366f1', '&:hover': { bgcolor: '#eef2ff' } }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        {!item.es_sistema && onDelete && (
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => onDelete(item)}
              sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}

// ── Mini Modal (para editar estado o semáforo) ────────────────────────────────
function MiniModal({ open, onClose, title, children, onSave, saving, color = '#6366f1' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: '16px', border: `2px solid ${color}`, overflow: 'hidden' } }}>
      <Box sx={{ bgcolor: `${color}12`, px: 2, py: 1.5,
        borderBottom: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', flex: 1 }}>{title}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </Box>
      <Box sx={{ px: 2.5, py: 2 }}>{children}</Box>
      <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${color}20`,
        bgcolor: `${color}06`, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button size="small" onClick={onClose}
          sx={{ textTransform: 'none', color: '#64748b', borderRadius: '8px' }}>
          Cancelar
        </Button>
        <Button size="small" variant="contained" onClick={onSave} disabled={saving}
          startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
          sx={{ textTransform: 'none', bgcolor: color, borderRadius: '8px',
            '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function NotificacionAdminPanel({ open = false, onClose, embedded = false }) {
  const [tab, setTab]             = useState(0);
  const [config, setConfig]       = useState({});
  const [estados, setEstados]     = useState([]);
  const [semaforos, setSemaforos] = useState([]);
  const [saving, setSaving]       = useState(false);

  // Mini-modal estado
  const [modalEstado, setModalEstado] = useState(false);
  const [formEstado, setFormEstado]   = useState(EMPTY_ESTADO);

  // Mini-modal semáforo
  const [modalSem, setModalSem]     = useState(false);
  const [formSem, setFormSem]       = useState(EMPTY_SEMAFORO);

  const load = async () => {
    try {
      const [cfg, est, sem] = await Promise.all([
        notificacionConfigObtener(),
        notificacionEstadosListar(),
        notificacionSemaforosListar(),
      ]);
      setConfig(cfg || {});
      setEstados(est || []);
      setSemaforos(sem || []);
    } catch (e) {
      handleErrorMessages('Error al cargar', e);
    }
  };

  useEffect(() => { if (open || embedded) load(); }, [open, embedded]);

  const guardarConfig = async () => {
    setSaving(true);
    try {
      await notificacionConfigGuardar(config);
      toastSuccess('Configuración guardada');
      triggerCampusNotificacionPoll();
    } catch (e) {
      handleErrorMessages('Error', e);
    } finally { setSaving(false); }
  };

  const guardarEstado = async () => {
    if (!formEstado.nombre?.trim()) return;
    setSaving(true);
    try {
      await notificacionEstadosGuardar(formEstado);
      toastSuccess('Estado guardado');
      setModalEstado(false);
      setFormEstado(EMPTY_ESTADO);
      setEstados(await notificacionEstadosListar());
    } catch (e) {
      handleErrorMessages('Error', e);
    } finally { setSaving(false); }
  };

  const eliminarEstado = async (e) => {
    if (!window.confirm(`¿Eliminar estado "${e.nombre}"?`)) return;
    await notificacionEstadosEliminar(e.id_estado);
    setEstados(await notificacionEstadosListar());
  };

  const guardarSemaforo = async () => {
    if (!formSem.nombre?.trim()) return;
    setSaving(true);
    try {
      await notificacionSemaforosGuardar({
        ...formSem,
        dias_restantes_min: formSem.dias_restantes_min === '' ? null : formSem.dias_restantes_min,
        dias_restantes_max: formSem.dias_restantes_max === '' ? null : formSem.dias_restantes_max,
      });
      toastSuccess('Semáforo guardado');
      setModalSem(false);
      setFormSem(EMPTY_SEMAFORO);
      setSemaforos(await notificacionSemaforosListar());
    } catch (e) {
      handleErrorMessages('Error', e);
    } finally { setSaving(false); }
  };

  const evaluarAhora = async () => {
    try {
      const r = await notificacionEvaluarManual();
      toastSuccess(r?.message || 'Evaluación completada');
      triggerCampusNotificacionPoll();
    } catch (e) {
      handleErrorMessages('Error', e);
    }
  };

  const activeTab = TABS[tab];

  // ── BODY ─────────────────────────────────────────────────────────────────────
  const body = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Tab bar */}
      <Box sx={{ display: 'flex', gap: 0.5, p: 1.5, pb: 0, borderBottom: '1px solid #f1f5f9' }}>
        {TABS.map(t => {
          const TIcon = t.icon;
          const act = tab === t.id;
          return (
            <Box key={t.id} onClick={() => setTab(t.id)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.7,
                px: 1.5, py: 0.8, borderRadius: '10px 10px 0 0',
                cursor: 'pointer', transition: 'all 0.15s',
                bgcolor: act ? t.bg : 'transparent',
                borderBottom: act ? `3px solid ${t.color}` : '3px solid transparent',
                '&:hover': { bgcolor: t.bg },
              }}>
              <TIcon sx={{ fontSize: 15, color: act ? t.color : '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: act ? 800 : 500,
                color: act ? t.color : '#64748b', whiteSpace: 'nowrap' }}>
                {t.label}
              </Typography>
              {t.id === 1 && <Chip label={estados.filter(e => e.activo).length} size="small"
                sx={{ height: 16, fontSize: '0.6rem', bgcolor: act ? t.color : '#e2e8f0',
                  color: act ? '#fff' : '#64748b', fontWeight: 700 }} />}
              {t.id === 2 && <Chip label={semaforos.filter(s => s.activo).length} size="small"
                sx={{ height: 16, fontSize: '0.6rem', bgcolor: act ? t.color : '#e2e8f0',
                  color: act ? '#fff' : '#64748b', fontWeight: 700 }} />}
            </Box>
          );
        })}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>

        {/* ── TAB 0: CONFIGURACIÓN ── */}
        {tab === 0 && (
          <Box>
            {/* Toggles */}
            <Stack spacing={1} mb={2}>
              <ToggleCard icon={NotificationsIcon} label="Alertas activas"
                hint="Activa el sistema de alertas automáticas para proyectos"
                checked={!!config.activo} color="#6366f1"
                onChange={v => setConfig(c => ({ ...c, activo: v }))} />
              <ToggleCard icon={FlashOnIcon} label="Toast en pantalla (estilo Windows)"
                hint="Muestra notificaciones flotantes en el navegador"
                checked={!!config.toast_navegador} color="#f59e0b"
                onChange={v => setConfig(c => ({ ...c, toast_navegador: v }))} />
              <ToggleCard icon={NotificationsIcon} label="Web Push del sistema"
                hint="Notificaciones cuando el navegador está minimizado"
                checked={!!config.notificacion_sistema} color="#10b981"
                onChange={v => setConfig(c => ({ ...c, notificacion_sistema: v }))} />
            </Stack>

            {/* Intervalos numéricos */}
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
              Intervalos de alerta
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
              <ConfigCard icon={NotificationsIcon} label="Prioridad #1" color="#ef4444"
                hint="Minutos entre alertas rojas de prioridad máxima (default: 10)"
                value={config.intervalo_minutos ?? 10}
                onChange={v => setConfig(c => ({ ...c, intervalo_minutos: v }))} />
              <ConfigCard icon={NotificationsIcon} label="Próximo a rojo" color="#f97316"
                hint="Proyectos en semáforo urgente, solo push interno (default: 30)"
                value={config.intervalo_proximo_rojo_min ?? 30}
                onChange={v => setConfig(c => ({ ...c, intervalo_proximo_rojo_min: v }))} />
              <ConfigCard icon={NotificationsIcon} label="Próximo a amarillo" color="#eab308"
                hint="Proyectos en atención, solo push interno (default: 120)"
                value={config.intervalo_proximo_amarillo_min ?? 120}
                onChange={v => setConfig(c => ({ ...c, intervalo_proximo_amarillo_min: v }))} />
              <ConfigCard icon={NotificationsIcon} label="Días anticipación" color="#6366f1"
                hint="Con cuántos días de anticipación se activa la alerta"
                value={config.dias_anticipacion_alerta ?? 14}
                onChange={v => setConfig(c => ({ ...c, dias_anticipacion_alerta: v }))} />
            </Box>

            {!config.web_push_habilitado && (
              <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', mb: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#92400e' }}>
                  ⚠️ Web Push no activo. Ejecuta <code>php artisan notificacion:vapid-generar</code> y agrega las claves al .env del backend.
                </Typography>
              </Box>
            )}

            {/* Evaluar ahora */}
            <Button variant="outlined" startIcon={<FlashOnIcon />} onClick={evaluarAhora}
              sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#6366f1', color: '#6366f1',
                fontWeight: 700, fontSize: '0.8rem',
                '&:hover': { bgcolor: '#eef2ff', borderColor: '#6366f1' } }}>
              Evaluar proyectos ahora
            </Button>
          </Box>
        )}

        {/* ── TAB 1: ESTADOS ── */}
        {tab === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {estados.filter(e => e.activo).length} estados configurados
              </Typography>
              <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={() => { setFormEstado(EMPTY_ESTADO); setModalEstado(true); }}
                sx={{ textTransform: 'none', bgcolor: '#0891b2', borderRadius: '9px',
                  fontSize: '0.75rem', '&:hover': { bgcolor: '#0e7490' } }}>
                Nuevo estado
              </Button>
            </Box>
            <Stack spacing={0.8}>
              {estados.filter(e => e.activo).map(e => (
                <ItemCard key={e.id_estado} item={e}
                  onEdit={item => { setFormEstado(item); setModalEstado(true); }}
                  onDelete={!e.es_sistema ? eliminarEstado : null}
                  fields={[{ key: 'aplica_a', label: 'Aplica a' }]} />
              ))}
            </Stack>
          </Box>
        )}

        {/* ── TAB 2: SEMÁFOROS ── */}
        {tab === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {semaforos.filter(s => s.activo).length} semáforos configurados
              </Typography>
              <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                onClick={() => { setFormSem(EMPTY_SEMAFORO); setModalSem(true); }}
                sx={{ textTransform: 'none', bgcolor: '#16a34a', borderRadius: '9px',
                  fontSize: '0.75rem', '&:hover': { bgcolor: '#15803d' } }}>
                Nuevo semáforo
              </Button>
            </Box>
            {/* Vista visual de semáforo */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, p: 1.5, bgcolor: '#f8fafc',
              borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              {[...semaforos].filter(s => s.activo).sort((a, b) => a.orden - b.orden).map((s, i) => (
                <Tooltip key={s.id_semaforo} title={`${s.nombre}: ${s.dias_restantes_min ?? '∞'}–${s.dias_restantes_max ?? '∞'} días`}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}
                    onClick={() => { setFormSem(s); setModalSem(true); }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: s.color_hex,
                      boxShadow: `0 0 8px ${s.color_hex}80, 0 2px 4px rgba(0,0,0,0.1)`,
                      transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.15)' } }} />
                    <Typography sx={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 600 }} noWrap>
                      {s.nombre}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
            <Stack spacing={0.8}>
              {semaforos.filter(s => s.activo).map(s => (
                <ItemCard key={s.id_semaforo} item={s}
                  onEdit={item => { setFormSem(item); setModalSem(true); }}
                  onDelete={null}
                  fields={[
                    { key: 'dias_restantes_min', label: 'Días mín' },
                    { key: 'dias_restantes_max', label: 'Días máx' },
                  ]} />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2, py: 1.2, borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1,
        bgcolor: activeTab.bg, flexShrink: 0 }}>
        {tab === 0 && (
          <Button variant="contained" startIcon={<SaveIcon sx={{ fontSize: 15 }} />}
            onClick={guardarConfig} disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: activeTab.color,
              borderRadius: '10px', fontSize: '0.82rem',
              boxShadow: `0 4px 14px ${activeTab.color}40`,
              '&:hover': { bgcolor: activeTab.color, filter: 'brightness(0.9)' } }}>
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        )}
        {!embedded && (
          <Button onClick={onClose}
            sx={{ textTransform: 'none', color: '#64748b', borderRadius: '9px',
              border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}>
            Cerrar
          </Button>
        )}
      </Box>
    </Box>
  );

  // ── Mini modals ───────────────────────────────────────────────────────────────
  const fsx = (color) => ({
    '& .MuiInputBase-root': { borderRadius: '8px', fontSize: '0.85rem' },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: color },
    '& .MuiInputLabel-root.Mui-focused': { color },
  });

  const miniModalEstado = (
    <MiniModal open={modalEstado} onClose={() => setModalEstado(false)}
      title={formEstado.id_estado ? 'Editar estado' : 'Nuevo estado'}
      onSave={guardarEstado} saving={saving} color="#0891b2">
      <Stack spacing={1.5}>
        <TextField fullWidth size="small" label="Nombre del estado *"
          value={formEstado.nombre || ''}
          onChange={e => setFormEstado(f => ({ ...f, nombre: e.target.value }))}
          sx={fsx('#0891b2')} />
        <Box display="flex" gap={1.5} alignItems="center">
          <Box>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Color</Typography>
            <input type="color" value={formEstado.color_hex || '#64748b'}
              onChange={e => setFormEstado(f => ({ ...f, color_hex: e.target.value }))}
              style={{ width: 56, height: 40, borderRadius: 8, border: '1px solid #e2e8f0',
                cursor: 'pointer', padding: 2 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Aplica a</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {['cliente', 'proyecto', 'ambos'].map(v => (
                <Box key={v} onClick={() => setFormEstado(f => ({ ...f, aplica_a: v }))}
                  sx={{
                    px: 1.2, py: 0.5, borderRadius: '7px', cursor: 'pointer', fontSize: '0.72rem',
                    fontWeight: 600, textTransform: 'capitalize',
                    bgcolor: formEstado.aplica_a === v ? '#0891b220' : '#f1f5f9',
                    border: `1.5px solid ${formEstado.aplica_a === v ? '#0891b2' : 'transparent'}`,
                    color: formEstado.aplica_a === v ? '#0891b2' : '#64748b',
                  }}>
                  {v}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        {/* Preview */}
        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: formEstado.color_hex,
            boxShadow: `0 2px 6px ${formEstado.color_hex}60` }} />
          <Chip label={formEstado.nombre || 'Vista previa'} size="small"
            sx={{ bgcolor: `${formEstado.color_hex}22`, color: formEstado.color_hex, fontWeight: 700 }} />
        </Box>
      </Stack>
    </MiniModal>
  );

  const miniModalSemaforo = (
    <MiniModal open={modalSem} onClose={() => setModalSem(false)}
      title={formSem.id_semaforo ? 'Editar semáforo' : 'Nuevo semáforo'}
      onSave={guardarSemaforo} saving={saving} color="#16a34a">
      <Stack spacing={1.5}>
        <TextField fullWidth size="small" label="Nombre del nivel *"
          value={formSem.nombre || ''}
          onChange={e => setFormSem(f => ({ ...f, nombre: e.target.value }))}
          sx={fsx('#16a34a')} />
        <Box display="flex" gap={1.5} alignItems="center">
          <Box>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Color</Typography>
            <input type="color" value={formSem.color_hex || '#22c55e'}
              onChange={e => setFormSem(f => ({ ...f, color_hex: e.target.value }))}
              style={{ width: 56, height: 40, borderRadius: 8, border: '1px solid #e2e8f0',
                cursor: 'pointer', padding: 2 }} />
          </Box>
          <Box flex={1}>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Rango de días restantes</Typography>
            <Box display="flex" gap={1}>
              <TextField size="small" label="Mín" type="number"
                value={formSem.dias_restantes_min ?? ''}
                onChange={e => setFormSem(f => ({ ...f, dias_restantes_min: e.target.value }))}
                sx={{ ...fsx('#16a34a'), width: '50%' }} />
              <TextField size="small" label="Máx" type="number"
                value={formSem.dias_restantes_max ?? ''}
                onChange={e => setFormSem(f => ({ ...f, dias_restantes_max: e.target.value }))}
                sx={{ ...fsx('#16a34a'), width: '50%' }} />
            </Box>
          </Box>
        </Box>
        {/* Preview */}
        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: formSem.color_hex,
            boxShadow: `0 0 8px ${formSem.color_hex}80` }} />
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
              {formSem.nombre || 'Vista previa'}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              {formSem.dias_restantes_min ?? '∞'} – {formSem.dias_restantes_max ?? '∞'} días
            </Typography>
          </Box>
        </Box>
      </Stack>
    </MiniModal>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  if (embedded) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {body}
        {miniModalEstado}
        {miniModalSemaforo}
      </Box>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: {
          borderRadius: '20px',
          border: `2px solid ${activeTab.color}30`,
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px ${activeTab.color}20`,
        }}}>
        {/* Header del dialog */}
        <Box sx={{
          px: 2.5, py: 1.5, flexShrink: 0,
          background: `linear-gradient(135deg, ${activeTab.color}15 0%, ${activeTab.bg} 100%)`,
          borderBottom: `1px solid ${activeTab.color}20`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${activeTab.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 18, color: activeTab.color }} />
          </Box>
          <Box flex={1}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', lineHeight: 1 }}>
              Alertas y semáforos del campus
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8' }}>
              Configuración del sistema de notificaciones
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}
            sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        {/* Body */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {body}
        </Box>
      </Dialog>
      {miniModalEstado}
      {miniModalSemaforo}
    </>
  );
}

// ── Exports de utilidad ────────────────────────────────────────────────────────
export function SemaforoDot({ semaforo, size = 12, title }) {
  const color = semaforo?.color_hex || '#94a3b8';
  return (
    <Box title={title || semaforo?.nombre || ''}
      sx={{ width: size, height: size, minWidth: size, borderRadius: '50%',
        bgcolor: color, boxShadow: `0 0 0 2px #fff, 0 0 0 3px ${color}55`, flexShrink: 0 }} />
  );
}

export function ProgresoBarra({ valor = 0, color = '#1976d2', width = 80 }) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: width + 28 }}>
      <Box sx={{ flex: 1, height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden', maxWidth: width }}>
        <Box sx={{ width: `${v}%`, height: '100%', bgcolor: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </Box>
      <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#64748b', minWidth: 28 }}>{v}%</Typography>
    </Box>
  );
}

export function EstadoNotificacionChip({ estado }) {
  if (!estado?.nombre) return null;
  return (
    <Chip label={estado.nombre} size="small"
      sx={{ bgcolor: `${estado.color_hex}22`, color: estado.color_hex, fontWeight: 600, fontSize: 10, height: 20 }} />
  );
}
