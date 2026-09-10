import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider, TextField, MenuItem,
  Select, FormControl, InputLabel, Button, Stack, Chip, Slider, CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon     from '@mui/icons-material/Close';
import SaveIcon      from '@mui/icons-material/Save';
import DeleteIcon    from '@mui/icons-material/Delete';
import FlagIcon      from '@mui/icons-material/Flag';
import StarIcon      from '@mui/icons-material/Star';
import { tareasCrear, tareasActualizar, tareasEliminar } from '../../../api/agenda.api';
import { toastSuccess, handleErrorMessages } from '../../../components/notify-messages';
import { ESTADO_COLOR, PRIORIDAD_COLOR } from '../ProyectoAgenda';

const EMPTY = {
  nombre: '', descripcion: '', responsable: '',
  fecha_inicio: '', fecha_fin: '',
  estado: 'pendiente', prioridad: 'media',
  porcentaje_avance: 0, es_hito: false,
  id_fase: '', color: '#42a5f5', predecesoras: [],
};

const TareaPanel = ({ open, onClose, tarea, fases, idProyecto, isAdmin, onSaved }) => {
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEdit = !!tarea?.id_tarea;

  useEffect(() => {
    if (tarea) {
      setForm({
        nombre:            tarea.nombre || '',
        descripcion:       tarea.descripcion || '',
        responsable:       tarea.responsable || '',
        fecha_inicio:      tarea.fecha_inicio ? String(tarea.fecha_inicio).slice(0,10) : '',
        fecha_fin:         tarea.fecha_fin    ? String(tarea.fecha_fin).slice(0,10)    : '',
        estado:            tarea.estado    || 'pendiente',
        prioridad:         tarea.prioridad || 'media',
        porcentaje_avance: tarea.porcentaje_avance || 0,
        es_hito:           tarea.es_hito || false,
        id_fase:           tarea.id_fase  || '',
        color:             tarea.color    || '#42a5f5',
        predecesoras:      (tarea.predecesoras || []).map(p => p.id_tarea),
      });
    } else {
      setForm(EMPTY);
    }
  }, [tarea, open]);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.fecha_inicio || !form.fecha_fin) return;
    setSaving(true);
    try {
      const payload = { ...form, id_proyecto: idProyecto };
      if (isEdit) {
        await tareasActualizar({ id_tarea: tarea.id_tarea, ...payload });
        toastSuccess('Tarea actualizada');
      } else {
        await tareasCrear(payload);
        toastSuccess('Tarea creada');
      }
      onSaved?.();
      onClose();
    } catch (e) { handleErrorMessages('Error al guardar', e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    setDeleting(true);
    try {
      await tareasEliminar({ id_tarea: tarea.id_tarea });
      toastSuccess('Tarea eliminada');
      onSaved?.();
      onClose();
    } catch (e) { handleErrorMessages('Error al eliminar', e); }
    finally { setDeleting(false); }
  };

  const estadoCfg    = ESTADO_COLOR[form.estado]    || ESTADO_COLOR.pendiente;
  const prioridadCfg = PRIORIDAD_COLOR[form.prioridad] || PRIORIDAD_COLOR.media;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 360, display: 'flex', flexDirection: 'column' } }}>

      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(120deg,#1565c0 0%,#1976d2 100%)',
        color: '#fff', px: 2.5, py: 1.8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography fontWeight={700} sx={{ fontSize: 15 }}>
            {isEdit ? 'Editar Tarea' : 'Nueva Tarea'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.75, fontSize: 11 }}>
            {isEdit ? tarea?.nombre : 'Completa los datos y guarda'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isEdit && isAdmin && (
            <Tooltip title="Eliminar tarea">
              <IconButton size="small" onClick={handleDelete} disabled={deleting}
                sx={{ color: '#ffcdd2', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                {deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose}
            sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Cuerpo */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {/* Modo solo lectura para clientes */}
        {!isAdmin && (
          <Box sx={{ mb: 2 }}>
            <Chip label="Solo lectura" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontSize: 11 }} />
          </Box>
        )}

        <Stack spacing={2}>

          {/* Nombre */}
          <TextField label="Nombre de la tarea *" value={form.nombre}
            onChange={e => f('nombre', e.target.value)}
            fullWidth size="small" disabled={!isAdmin} />

          {/* Descripción */}
          <TextField label="Descripción" value={form.descripcion}
            onChange={e => f('descripcion', e.target.value)}
            fullWidth size="small" multiline rows={2} disabled={!isAdmin} />

          {/* Responsable */}
          <TextField label="Responsable" value={form.responsable}
            onChange={e => f('responsable', e.target.value)}
            fullWidth size="small" disabled={!isAdmin} />

          {/* Fechas */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Inicio *" type="date" value={form.fecha_inicio}
              onChange={e => f('fecha_inicio', e.target.value)}
              fullWidth size="small" InputLabelProps={{ shrink: true }} disabled={!isAdmin} />
            <TextField label="Fin *" type="date" value={form.fecha_fin}
              onChange={e => f('fecha_fin', e.target.value)}
              fullWidth size="small" InputLabelProps={{ shrink: true }} disabled={!isAdmin} />
          </Box>

          {/* Estado / Prioridad */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select value={form.estado} label="Estado"
                onChange={e => f('estado', e.target.value)} disabled={!isAdmin}
                renderValue={v => (
                  <Chip label={ESTADO_COLOR[v]?.label || v} size="small"
                    sx={{ bgcolor: ESTADO_COLOR[v]?.bg, color: ESTADO_COLOR[v]?.color,
                          fontWeight: 600, fontSize: 11, height: 20 }} />
                )}>
                {Object.entries(ESTADO_COLOR).map(([k, c]) => (
                  <MenuItem key={k} value={k}>
                    <Chip label={c.label} size="small"
                      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 11, height: 18 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select value={form.prioridad} label="Prioridad"
                onChange={e => f('prioridad', e.target.value)} disabled={!isAdmin}
                renderValue={v => (
                  <Chip label={PRIORIDAD_COLOR[v]?.label || v} size="small"
                    sx={{ bgcolor: PRIORIDAD_COLOR[v]?.bg, color: PRIORIDAD_COLOR[v]?.color,
                          fontWeight: 600, fontSize: 11, height: 20 }} />
                )}>
                {Object.entries(PRIORIDAD_COLOR).map(([k, c]) => (
                  <MenuItem key={k} value={k}>
                    <Chip label={c.label} size="small"
                      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 11, height: 18 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Fase */}
          <FormControl fullWidth size="small">
            <InputLabel>Fase</InputLabel>
            <Select value={form.id_fase || ''} label="Fase"
              onChange={e => f('id_fase', e.target.value)} disabled={!isAdmin}>
              <MenuItem value=""><em>Sin fase</em></MenuItem>
              {fases.map(fs => (
                <MenuItem key={fs.id_fase} value={fs.id_fase}>{fs.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Progreso */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                Porcentaje de avance
              </Typography>
              <Typography variant="caption" fontWeight={700} color="primary" sx={{ fontSize: 13 }}>
                {form.porcentaje_avance}%
              </Typography>
            </Box>
            <Slider value={form.porcentaje_avance} min={0} max={100} step={5}
              onChange={(_, v) => f('porcentaje_avance', v)}
              disabled={!isAdmin}
              marks={[{value:0,label:'0'},{value:50,label:'50'},{value:100,label:'100'}]}
              sx={{ color: form.porcentaje_avance >= 100 ? '#2e7d32' : '#1976d2' }}
            />
          </Box>

          {/* Hito */}
          {isAdmin && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small"
                onClick={() => f('es_hito', !form.es_hito)}
                sx={{ color: form.es_hito ? '#7c3aed' : 'text.disabled' }}>
                <StarIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Typography variant="caption" color={form.es_hito ? '#7c3aed' : 'text.secondary'} sx={{ fontSize: 12 }}>
                {form.es_hito ? 'Es un hito (milestone)' : 'Marcar como hito'}
              </Typography>
            </Box>
          )}

          {/* Color */}
          {isAdmin && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>Color:</Typography>
              <input type="color" value={form.color}
                onChange={e => f('color', e.target.value)}
                style={{ width: 36, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{form.color}</Typography>
            </Box>
          )}

        </Stack>
      </Box>

      <Divider />

      {/* Acciones */}
      {isAdmin && (
        <Box sx={{ px: 2.5, py: 2, display: 'flex', gap: 1.5 }}>
          <Button fullWidth variant="outlined" onClick={onClose}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !form.nombre.trim() || !form.fecha_inicio || !form.fecha_fin}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            {saving ? <CircularProgress size={16} color="inherit" /> : (isEdit ? 'Guardar' : 'Crear')}
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default TareaPanel;
