import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const GRID_STEP = 24;

/**
 * Lienzo con rejilla (canvas) para ordenar tarjetas del catálogo con drag and drop.
 * El orden se asigna automáticamente según la posición (0, 1, 2…).
 */
export default function CotizacionCatalogoOrdenCanvas({
  items = [],
  idKey = 'id',
  onReorder,
  renderCard,
  hint = 'Arrastra las tarjetas para cambiar el orden de visualización',
  saving = false,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dragFromIdx, setDragFromIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [ordered, setOrdered] = useState([]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [items],
  );

  useEffect(() => {
    setOrdered(sorted);
  }, [sorted]);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = containerRef.current;
    if (!canvas || !parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = Math.max(parent.clientHeight, 120);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,74,153,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += GRID_STEP) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += GRID_STEP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    drawGrid();
    const ro = new ResizeObserver(() => drawGrid());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [drawGrid, ordered.length]);

  const persistOrder = async (list) => {
    const payload = list.map((row, i) => ({
      [idKey]: row[idKey],
      orden: i,
    }));
    if (onReorder) await onReorder(payload);
  };

  const handleDragStart = (idx) => {
    setDragFromIdx(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragFromIdx !== null && dragFromIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = async (e, dropIdx) => {
    e.preventDefault();
    const fromIdx = dragFromIdx;
    setDragFromIdx(null);
    setDragOverIdx(null);
    if (fromIdx === null || fromIdx === dropIdx || saving) return;

    const next = [...ordered];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(dropIdx, 0, moved);
    setOrdered(next);
    try {
      await persistOrder(next);
    } catch {
      setOrdered(sorted);
    }
  };

  const handleDragEnd = () => {
    setDragFromIdx(null);
    setDragOverIdx(null);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#f8fafc',
        overflow: 'hidden',
        mb: 2,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, p: 2 }}>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
          {hint}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {ordered.map((item, idx) => {
            const key = item[idKey] ?? idx;
            const isDragging = dragFromIdx === idx;
            const isOver = dragOverIdx === idx;

            return (
              <Box
                key={key}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                sx={{
                  position: 'relative',
                  opacity: isDragging ? 0.45 : 1,
                  outline: isOver ? '2px dashed #004A99' : 'none',
                  outlineOffset: 4,
                  borderRadius: 3,
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Box
                  draggable={!saving}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.effectAllowed = 'move';
                    handleDragStart(idx);
                  }}
                  onDragEnd={handleDragEnd}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 8,
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    cursor: saving ? 'default' : 'grab',
                    '&:active': { cursor: 'grabbing' },
                  }}
                  title="Arrastrar para reordenar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem' }}>
                    {idx + 1}
                  </Typography>
                  <DragIndicatorIcon sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                {renderCard(item, idx)}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
