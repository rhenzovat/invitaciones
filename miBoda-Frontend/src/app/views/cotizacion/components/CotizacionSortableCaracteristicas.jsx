import { useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

/**
 * Lista reordenable de strings (características del tipo de proyecto).
 * Actualiza el array completo vía onChange al soltar.
 */
export default function CotizacionSortableCaracteristicas({
  items = [],
  onChange,
  renderField,
  onRemove,
  emptyHint = 'Sin características',
  hint = 'Arrastra ⋮⋮ para cambiar el orden (se refleja en la tarjeta)',
}) {
  const [dragFromIdx, setDragFromIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const reorder = (fromIdx, toIdx) => {
    if (fromIdx === null || fromIdx === toIdx) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  };

  const handleDragStart = (idx) => {
    setDragFromIdx(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragFromIdx !== null && dragFromIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    reorder(dragFromIdx, idx);
    setDragFromIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragFromIdx(null);
    setDragOverIdx(null);
  };

  if (!items.length) {
    return (
      <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', mb: 1 }}>
        {emptyHint}
      </Typography>
    );
  }

  return (
    <Stack spacing={0.6} sx={{ mb: 1 }}>
      {hint && (
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
          {hint}
        </Typography>
      )}
      {items.map((item, i) => {
        const isDragging = dragFromIdx === i;
        const isOver = dragOverIdx === i && dragFromIdx !== i;

        return (
          <Box
            key={`car-row-${i}`}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              borderRadius: 1,
              px: 0.25,
              py: 0.2,
              opacity: isDragging ? 0.45 : 1,
              bgcolor: isOver ? 'rgba(96,165,250,0.12)' : 'transparent',
              border: isOver ? '1px dashed #60a5fa' : '1px solid transparent',
              transition: 'background 0.15s, opacity 0.15s',
            }}
          >
            <Box
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnd={handleDragEnd}
              title="Arrastrar para reordenar"
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                color: '#64748b',
                flexShrink: 0,
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {renderField(item, i)}
            </Box>
            <IconButton
              size="small"
              onClick={() => onRemove(i)}
              sx={{ color: '#ef4444', flexShrink: 0 }}
              aria-label="Eliminar"
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
}
