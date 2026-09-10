import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Chip, Select, MenuItem } from '@mui/material';
import ZoomInIcon   from '@mui/icons-material/ZoomIn';
import ZoomOutIcon  from '@mui/icons-material/ZoomOut';
import TodayIcon    from '@mui/icons-material/Today';
import ArrowLeftIcon  from '@mui/icons-material/ChevronLeft';
import ArrowRightIcon from '@mui/icons-material/ChevronRight';
import { tareasMover } from '../../../api/agenda.api';
import { handleErrorMessages, toastSuccess } from '../../../components/notify-messages';

// ─── Constantes de dibujo ─────────────────────────────────────────────────────
const ROW_H      = 36;       // altura por fila
const LABEL_W    = 200;      // ancho del panel de nombres
const HEADER_H   = 56;       // altura del header (fecha)
const MIN_COL_W  = 28;       // ancho mínimo de columna día
const DAY_MS     = 86400000;

const ESTADO_COLORS = {
  pendiente:   { bar: '#90caf9', text: '#0d47a1' },
  en_progreso: { bar: '#42a5f5', text: '#0d47a1' },
  en_revision: { bar: '#ffb74d', text: '#e65100' },
  completado:  { bar: '#66bb6a', text: '#1b5e20' },
  bloqueado:   { bar: '#ef5350', text: '#b71c1c' },
};

const PRIORIDAD_BADGE = {
  baja:    '#4caf50',
  media:   '#ff9800',
  alta:    '#f44336',
  critica: '#880e4f',
};

function dateToMs(d) { return new Date(d).getTime(); }
function addDays(ms, n) { return ms + n * DAY_MS; }
function msToDate(ms) { return new Date(ms).toISOString().split('T')[0]; }
function formatHeaderDate(ms, mode) {
  const d = new Date(ms);
  if (mode === 'day')   return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  if (mode === 'week')  return `S${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('es-PE', { month: 'short' })}`;
  return d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────
const GanttCanvas = ({ tareas, fases, isAdmin, idProyecto, onTareaClick, onTareaMove }) => {
  const canvasRef    = useRef(null);
  const [mode, setMode]       = useState('week');  // day | week | month
  const [colW, setColW]       = useState(44);
  const [offset, setOffset]   = useState(0);       // días desplazados
  const [dragging, setDragging] = useState(null);  // { tarea, startX, origStart, origEnd }
  const [hoverId, setHoverId]   = useState(null);
  const todayMs = new Date().setHours(0,0,0,0);

  // Rango global de fechas
  const { minMs, maxMs, totalDays } = useCallback(() => {
    if (!tareas.length) {
      const t = todayMs;
      return { minMs: addDays(t, -7), maxMs: addDays(t, 30), totalDays: 37 };
    }
    const starts = tareas.map(t => dateToMs(t.fecha_inicio));
    const ends   = tareas.map(t => dateToMs(t.fecha_fin));
    const mn = Math.min(...starts) - 3 * DAY_MS;
    const mx = Math.max(...ends)   + 3 * DAY_MS;
    return { minMs: mn, maxMs: mx, totalDays: Math.ceil((mx - mn) / DAY_MS) };
  }, [tareas, todayMs])();

  // Número de columnas visibles
  const visibleCols = mode === 'day' ? 30 : mode === 'week' ? 12 : 6;
  const colUnit     = mode === 'day' ? 1  : mode === 'week' ? 7  : 30;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // ── Fondo ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // ── Panel izquierdo (sombra) ───────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, LABEL_W, H);
    ctx.strokeStyle = '#e3eaf3';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(LABEL_W, 0); ctx.lineTo(LABEL_W, H); ctx.stroke();

    // ── Header ────────────────────────────────────────────────────────────
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, W, HEADER_H);

    // Nombre proyecto label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter,sans-serif';
    ctx.fillText('TAREA', 16, 32);

    // Columnas de fecha
    for (let c = 0; c < visibleCols; c++) {
      const msCol = addDays(minMs, (offset + c) * colUnit);
      const x = LABEL_W + c * colW;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter,sans-serif';
      ctx.fillText(formatHeaderDate(msCol, mode), x + 4, 22);

      // Sub-label: día de semana
      if (mode !== 'month') {
        const sub = new Date(msCol).toLocaleDateString('es-PE', { weekday: 'short' });
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter,sans-serif';
        ctx.fillText(sub, x + 4, 38);
      }

      // Separador columna
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEADER_H); ctx.stroke();
    }

    // ── Filas de tareas ────────────────────────────────────────────────────
    tareas.forEach((tarea, rowIdx) => {
      const y    = HEADER_H + rowIdx * ROW_H;
      const isHov = tarea.id_tarea === hoverId;

      // Fondo de fila alterno
      ctx.fillStyle = isHov ? '#f0f7ff' : rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(0, y, W, ROW_H);

      // Líneas horizontales
      ctx.strokeStyle = '#e8eef5';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, y + ROW_H); ctx.lineTo(W, y + ROW_H); ctx.stroke();

      // Nombre de tarea (panel izquierdo)
      ctx.save();
      ctx.rect(0, y, LABEL_W - 8, ROW_H);
      ctx.clip();
      const stColor = ESTADO_COLORS[tarea.estado] || ESTADO_COLORS.pendiente;
      ctx.fillStyle = stColor.text;
      ctx.font = `${tarea.es_hito ? 'bold ' : ''}12px Inter,sans-serif`;
      ctx.fillText(tarea.nombre, 12, y + 23);
      ctx.restore();

      // Badge de prioridad
      const priColor = PRIORIDAD_BADGE[tarea.prioridad] || '#607d8b';
      ctx.fillStyle = priColor;
      ctx.beginPath();
      ctx.arc(LABEL_W - 12, y + ROW_H / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // ── Grilla vertical (columnas) ─────────────────────────────────────
      for (let c = 0; c < visibleCols; c++) {
        const x = LABEL_W + c * colW;
        ctx.strokeStyle = '#edf2f7';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + ROW_H); ctx.stroke();
      }

      // ── Barra de tarea ─────────────────────────────────────────────────
      const startMs = dateToMs(tarea.fecha_inicio);
      const endMs   = dateToMs(tarea.fecha_fin) + DAY_MS;
      const visStart = addDays(minMs, offset * colUnit);
      const visEnd   = addDays(visStart, visibleCols * colUnit);

      if (endMs < visStart || startMs > visEnd) return; // fuera de vista

      const barX = LABEL_W + ((startMs - visStart) / DAY_MS) * (colW / colUnit);
      const barW = Math.max(((endMs - startMs) / DAY_MS) * (colW / colUnit), tarea.es_hito ? 12 : 6);
      const barY = y + 7;
      const barH = ROW_H - 14;
      const barR = 5;

      // Sombra suave
      ctx.shadowColor = 'rgba(25,118,210,0.18)';
      ctx.shadowBlur  = isHov ? 8 : 4;

      if (tarea.es_hito) {
        // Diamante para hito
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        const cx = barX + 6; const cy = y + ROW_H / 2;
        ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 8, cy);
        ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - 8, cy); ctx.closePath();
        ctx.fill();
      } else {
        // Barra con borde redondeado
        ctx.fillStyle = stColor.bar;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barR);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Barra de progreso interna
        const progW = (barW * (tarea.porcentaje_avance || 0)) / 100;
        if (progW > 0) {
          ctx.fillStyle = stColor.text.replace('1c', '3c') || 'rgba(0,0,0,0.25)';
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.roundRect(barX, barY, progW, barH, barR);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Texto % dentro de barra si hay espacio
        if (barW > 36) {
          ctx.fillStyle = stColor.text;
          ctx.font = 'bold 10px Inter,sans-serif';
          ctx.fillText(`${tarea.porcentaje_avance || 0}%`, barX + barW / 2 - 10, barY + barH / 2 + 4);
        }

        // Handle de resize derecha (solo admin)
        if (isAdmin) {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(barX + barW - 5, barY + 2, 3, barH - 4);
        }
      }
      ctx.shadowBlur = 0;
    });

    // ── Línea TODAY ────────────────────────────────────────────────────────
    const visStartMs = addDays(minMs, offset * colUnit);
    const todayX = LABEL_W + ((todayMs - visStartMs) / DAY_MS) * (colW / colUnit);
    if (todayX > LABEL_W && todayX < W) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(todayX, HEADER_H); ctx.lineTo(todayX, H); ctx.stroke();
      ctx.setLineDash([]);

      // Label "HOY"
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px Inter,sans-serif';
      ctx.fillRect(todayX - 14, HEADER_H - 16, 28, 14);
      ctx.fillStyle = '#fff';
      ctx.fillText('HOY', todayX - 10, HEADER_H - 5);
    }

    // ── Dependencias ──────────────────────────────────────────────────────
    const visStartMs2 = addDays(minMs, offset * colUnit);
    tareas.forEach((tarea, rowIdx) => {
      if (!tarea.predecesoras?.length) return;
      tarea.predecesoras.forEach(pred => {
        const predIdx = tareas.findIndex(t => t.id_tarea === pred.id_tarea);
        if (predIdx < 0) return;
        const predEndMs = dateToMs(pred.fecha_fin || tareas[predIdx]?.fecha_fin) + DAY_MS;
        const sucStartMs = dateToMs(tarea.fecha_inicio);
        const x1 = LABEL_W + ((predEndMs - visStartMs2) / DAY_MS) * (colW / colUnit);
        const y1 = HEADER_H + predIdx * ROW_H + ROW_H / 2;
        const x2 = LABEL_W + ((sucStartMs - visStartMs2) / DAY_MS) * (colW / colUnit);
        const y2 = HEADER_H + rowIdx * ROW_H + ROW_H / 2;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 + 20, y1, x2 - 20, y2, x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Flecha
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
      });
    });

  }, [tareas, mode, colW, offset, hoverId, visibleCols, colUnit, minMs, todayMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width  = parent.clientWidth;
    canvas.height = Math.max(HEADER_H + tareas.length * ROW_H + 20, 300);
    draw();
  }, [draw, tareas]);

  // ── Scroll horizontal ──────────────────────────────────────────────────────
  const handleWheel = (e) => {
    e.preventDefault();
    setOffset(o => Math.max(0, o + (e.deltaY > 0 ? 1 : -1)));
  };

  // ── Mouse events para hover y drag ────────────────────────────────────────
  const getHitTarea = (x, y) => {
    const rowIdx = Math.floor((y - HEADER_H) / ROW_H);
    if (rowIdx < 0 || rowIdx >= tareas.length) return null;
    const tarea = tareas[rowIdx];
    const visStartMs = addDays(minMs, offset * colUnit);
    const barX = LABEL_W + ((dateToMs(tarea.fecha_inicio) - visStartMs) / DAY_MS) * (colW / colUnit);
    const barW = Math.max(((dateToMs(tarea.fecha_fin) + DAY_MS - dateToMs(tarea.fecha_inicio)) / DAY_MS) * (colW / colUnit), 6);
    if (x >= barX && x <= barX + barW) return { tarea, rowIdx, barX, barW };
    return null;
  };

  const handleMouseMove = (e) => {
    const rect  = canvasRef.current.getBoundingClientRect();
    const mx    = e.clientX - rect.left;
    const my    = e.clientY - rect.top;
    const hit   = getHitTarea(mx, my);
    setHoverId(hit?.tarea?.id_tarea || null);
    canvasRef.current.style.cursor = hit ? 'pointer' : 'default';

    if (dragging) {
      const dx   = mx - dragging.startX;
      const dDays = Math.round(dx / (colW / colUnit));
      const newStart = msToDate(addDays(dragging.origStart, dDays * DAY_MS));
      const newEnd   = msToDate(addDays(dragging.origEnd,   dDays * DAY_MS));
      // Preview local
      setDragging(d => ({ ...d, previewStart: newStart, previewEnd: newEnd }));
    }
  };

  const handleMouseDown = (e) => {
    if (!isAdmin) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const hit  = getHitTarea(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) {
      setDragging({
        tarea:      hit.tarea,
        startX:     e.clientX - rect.left,
        origStart:  dateToMs(hit.tarea.fecha_inicio),
        origEnd:    dateToMs(hit.tarea.fecha_fin),
      });
    }
  };

  const handleMouseUp = async (e) => {
    if (!dragging || !isAdmin) { setDragging(null); return; }
    const { tarea, previewStart, previewEnd } = dragging;
    setDragging(null);
    if (!previewStart || previewStart === msToDate(dateToMs(tarea.fecha_inicio))) return;
    try {
      await tareasMover({ id_tarea: tarea.id_tarea, fecha_inicio: previewStart, fecha_fin: previewEnd });
      toastSuccess('Tarea movida');
      onTareaMove?.();
    } catch (er) { handleErrorMessages('Error al mover tarea', er); }
  };

  // ── Clic en barra ─────────────────────────────────────────────────────────
  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const hit  = getHitTarea(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) onTareaClick?.(hit.tarea);
  };

  // ── Ir a hoy ──────────────────────────────────────────────────────────────
  const goToToday = () => {
    const daysFromStart = Math.floor((todayMs - minMs) / DAY_MS);
    setOffset(Math.max(0, Math.floor(daysFromStart / colUnit) - Math.floor(visibleCols / 2)));
  };

  return (
    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: { xs: 1, md: 1.5 }, pt: 1 }}>

      {/* Toolbar Gantt */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexShrink: 0 }}>
        <Select size="small" value={mode} onChange={e => setMode(e.target.value)}
          sx={{ fontSize: 12, height: 30, '.MuiSelect-select': { py: '4px', px: 1 } }}>
          <MenuItem value="day"   sx={{ fontSize: 12 }}>Día</MenuItem>
          <MenuItem value="week"  sx={{ fontSize: 12 }}>Semana</MenuItem>
          <MenuItem value="month" sx={{ fontSize: 12 }}>Mes</MenuItem>
        </Select>
        <Tooltip title="Zoom in"><IconButton size="small" onClick={() => setColW(w => Math.min(w + 8, 100))}><ZoomInIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Zoom out"><IconButton size="small" onClick={() => setColW(w => Math.max(w - 8, MIN_COL_W))}><ZoomOutIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Ir a hoy"><IconButton size="small" onClick={goToToday}><TodayIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Anterior"><IconButton size="small" onClick={() => setOffset(o => Math.max(0, o - 1))}><ArrowLeftIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Siguiente"><IconButton size="small" onClick={() => setOffset(o => o + 1)}><ArrowRightIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Box sx={{ flex: 1 }} />
        {/* Leyenda */}
        {['pendiente','en_progreso','completado','bloqueado'].map(est => (
          <Chip key={est} size="small" label={est.replace('_',' ')}
            sx={{ height: 18, fontSize: 10,
                  bgcolor: ESTADO_COLORS[est]?.bar, color: ESTADO_COLORS[est]?.text, fontWeight: 600 }} />
        ))}
      </Box>

      {/* Canvas scrollable */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          overflow: 'auto',
          borderRadius: 0,
          border: '1px solid #e3eaf3',
          boxShadow: 'none',
          p: 0,
        }}
      >
        <canvas
          id="gantt-canvas"
          ref={canvasRef}
          style={{ display: 'block', cursor: 'default' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setHoverId(null); setDragging(null); }}
          onClick={handleClick}
          onWheel={handleWheel}
        />
        {tareas.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary">No hay tareas aún.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GanttCanvas;
