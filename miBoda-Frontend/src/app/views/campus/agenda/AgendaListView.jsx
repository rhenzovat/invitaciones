import { useState } from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, Tooltip, LinearProgress,
  Stack, Select, MenuItem, TextField, InputAdornment, Collapse,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon          from '@mui/icons-material/Edit';
import SearchIcon        from '@mui/icons-material/Search';
import ExpandMoreIcon    from '@mui/icons-material/ExpandMore';
import ExpandLessIcon    from '@mui/icons-material/ExpandLess';
import StarIcon          from '@mui/icons-material/Star';
import PersonIcon        from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon          from '@mui/icons-material/Flag';
import { ESTADO_COLOR, PRIORIDAD_COLOR } from '../ProyectoAgenda';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function diffDays(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function isLate(tarea) {
  return new Date(tarea.fecha_fin) < new Date() && tarea.porcentaje_avance < 100;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AgendaListView = ({ tareas, fases, isAdmin, onTareaClick, onRefresh }) => {
  const [search,    setSearch]    = useState('');
  const [filtEst,   setFiltEst]   = useState('');
  const [filtPrio,  setFiltPrio]  = useState('');
  const [filtFase,  setFiltFase]  = useState('');
  const [collapsed, setCollapsed] = useState({});

  // Aplicar filtros
  const filtered = tareas.filter(t => {
    if (search   && !t.nombre.toLowerCase().includes(search.toLowerCase()) &&
                    !t.responsable?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtEst  && t.estado    !== filtEst)    return false;
    if (filtPrio && t.prioridad !== filtPrio)   return false;
    if (filtFase && String(t.id_fase) !== String(filtFase)) return false;
    return true;
  });

  // Agrupar por fase
  const sinFase   = filtered.filter(t => !t.id_fase);
  const porFase   = fases.map(f => ({
    fase:   f,
    tareas: filtered.filter(t => String(t.id_fase) === String(f.id_fase)),
  })).filter(g => g.tareas.length > 0);

  const grupos = [
    ...porFase,
    ...(sinFase.length ? [{ fase: { id_fase: '__sin_fase', nombre: 'Sin fase', color: '#90a4ae' }, tareas: sinFase }] : []),
  ];

  const toggleFase = (id) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, md: 2 }, pt: 1 }}>

      {/* Filtros */}
      <Paper sx={{ borderRadius: 0, p: '10px 16px', mb: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', border: '1px solid #e3eaf3', boxShadow: 'none' }}>
        <TextField
          size="small" placeholder="Buscar tarea o responsable…"
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> }}
          sx={{ width: 240, '& .MuiInputBase-root': { height: 32, fontSize: 13 } }}
        />
        <Select size="small" value={filtEst} onChange={e => setFiltEst(e.target.value)} displayEmpty
          sx={{ height: 32, fontSize: 12, minWidth: 130 }}>
          <MenuItem value="" sx={{ fontSize: 12 }}><em>Todos los estados</em></MenuItem>
          {Object.entries(ESTADO_COLOR).map(([k, c]) => (
            <MenuItem key={k} value={k} sx={{ fontSize: 12 }}>
              <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 10, height: 18 }} />
            </MenuItem>
          ))}
        </Select>
        <Select size="small" value={filtPrio} onChange={e => setFiltPrio(e.target.value)} displayEmpty
          sx={{ height: 32, fontSize: 12, minWidth: 120 }}>
          <MenuItem value="" sx={{ fontSize: 12 }}><em>Todas las prio.</em></MenuItem>
          {Object.entries(PRIORIDAD_COLOR).map(([k, c]) => (
            <MenuItem key={k} value={k} sx={{ fontSize: 12 }}>
              <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 10, height: 18 }} />
            </MenuItem>
          ))}
        </Select>
        <Select size="small" value={filtFase} onChange={e => setFiltFase(e.target.value)} displayEmpty
          sx={{ height: 32, fontSize: 12, minWidth: 130 }}>
          <MenuItem value="" sx={{ fontSize: 12 }}><em>Todas las fases</em></MenuItem>
          {fases.map(f => <MenuItem key={f.id_fase} value={String(f.id_fase)} sx={{ fontSize: 12 }}>{f.nombre}</MenuItem>)}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: 11 }}>
          {filtered.length} de {tareas.length} tareas
        </Typography>
      </Paper>

      {/* Sin tareas */}
      {filtered.length === 0 && (
        <Paper sx={{ borderRadius: 0, p: 4, textAlign: 'center', border: '1px solid #e3eaf3', boxShadow: 'none' }}>
          <Typography variant="body2" color="text.secondary">No se encontraron tareas con esos filtros.</Typography>
        </Paper>
      )}

      {/* Grupos por fase */}
      <Stack spacing={1.5}>
        {grupos.map(({ fase, tareas: gTareas }) => {
          const isOpen  = !collapsed[fase.id_fase];
          const progPct = gTareas.length
            ? Math.round(gTareas.reduce((s, t) => s + (t.porcentaje_avance || 0), 0) / gTareas.length)
            : 0;

          return (
            <Box key={fase.id_fase}>
              {/* Cabecera de fase */}
              <Box
                onClick={() => toggleFase(fase.id_fase)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, mb: 0.8,
                  cursor: 'pointer', userSelect: 'none',
                  '&:hover .fase-title': { color: fase.color },
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: fase.color, flexShrink: 0 }} />
                <Typography className="fase-title" variant="subtitle2" fontWeight={700}
                  sx={{ fontSize: 13, transition: 'color .15s', flex: 1 }}>
                  {fase.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                  {gTareas.length} tarea{gTareas.length !== 1 ? 's' : ''} · {progPct}%
                </Typography>
                <Box sx={{ width: 60 }}>
                  <LinearProgress variant="determinate" value={progPct}
                    sx={{ height: 4, borderRadius: 2, bgcolor: '#e8eef5',
                          '& .MuiLinearProgress-bar': { bgcolor: fase.color, borderRadius: 2 } }} />
                </Box>
                {isOpen ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                         : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
              </Box>

              {/* Tareas de la fase */}
              <Collapse in={isOpen}>
                <Stack spacing={0.8}>
                  {gTareas.map(t => {
                    const estCfg  = ESTADO_COLOR[t.estado]    || ESTADO_COLOR.pendiente;
                    const prioCfg = PRIORIDAD_COLOR[t.prioridad] || PRIORIDAD_COLOR.media;
                    const late    = isLate(t);
                    const dur     = diffDays(t.fecha_inicio, t.fecha_fin);

                    return (
                      <Paper key={t.id_tarea}
                        onClick={() => onTareaClick?.(t)}
                        sx={{
                          borderRadius: 0, p: '10px 14px', cursor: 'pointer',
                          boxShadow: '0 1px 6px rgba(0,0,0,.06)',
                          borderLeft: `3px solid ${t.color || estCfg.color}`,
                          transition: 'transform .15s, box-shadow .15s',
                          '&:hover': { transform: 'translateX(3px)', boxShadow: '0 4px 16px rgba(0,0,0,.1)' },
                        }}
                      >
                        <Grid container spacing={1} alignItems="center">

                          {/* Nombre + hito + descripción */}
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              {t.es_hito && <StarIcon sx={{ fontSize: 14, color: '#7c3aed' }} />}
                              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: 13 }}>
                                {t.nombre}
                              </Typography>
                              {late && (
                                <Chip label="Retrasada" size="small"
                                  sx={{ height: 16, fontSize: 9, bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
                              )}
                            </Box>
                            {t.descripcion && (
                              <Typography variant="caption" color="text.secondary"
                                sx={{ fontSize: 11, display: '-webkit-box', WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {t.descripcion}
                              </Typography>
                            )}
                          </Grid>

                          {/* Fechas y duración */}
                          <Grid size={{ xs: 6, md: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                {fmtDate(t.fecha_inicio)} → {fmtDate(t.fecha_fin)}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                              {dur} día{dur !== 1 ? 's' : ''}
                            </Typography>
                          </Grid>

                          {/* Responsable */}
                          <Grid size={{ xs: 6, md: 2 }}>
                            {t.responsable && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
                                  {t.responsable}
                                </Typography>
                              </Box>
                            )}
                          </Grid>

                          {/* Estado + Prioridad */}
                          <Grid size={{ xs: 6, md: 2 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip label={estCfg.label} size="small"
                                sx={{ bgcolor: estCfg.bg, color: estCfg.color, fontWeight: 600, fontSize: 10, height: 18 }} />
                              <Chip label={prioCfg.label} size="small"
                                sx={{ bgcolor: prioCfg.bg, color: prioCfg.color, fontWeight: 600, fontSize: 10, height: 18 }} />
                            </Box>
                          </Grid>

                          {/* Progreso + botón editar */}
                          <Grid size={{ xs: 6, md: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>Avance</Typography>
                                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: 10 }}>{t.porcentaje_avance || 0}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={t.porcentaje_avance || 0}
                                  sx={{
                                    height: 4, borderRadius: 2, bgcolor: '#e8eef5',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 2,
                                      bgcolor: t.porcentaje_avance >= 100 ? '#2e7d32' : (t.color || '#1976d2'),
                                    },
                                  }}
                                />
                              </Box>
                              {isAdmin && (
                                <Tooltip title="Editar tarea">
                                  <IconButton size="small" onClick={e => { e.stopPropagation(); onTareaClick?.(t); }}
                                    sx={{ width: 24, height: 24, bgcolor: '#f0f7ff', '&:hover': { bgcolor: '#bbdefb' } }}>
                                    <EditIcon sx={{ fontSize: 13, color: '#1976d2' }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Grid>

                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default AgendaListView;
