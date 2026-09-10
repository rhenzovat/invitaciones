import { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { CotizacionIcon } from './CotizacionIcon';

/**
 * Tres columnas informativas del paso Extras (igual al cotizador público).
 */
export default function CotizacionExtrasInfoGrid({
  bloques = [],
  editable = false,
  sortable = false,
  activeBlockId = null,
  onEditBlock,
  onReorder,
  reorderBusy = false,
}) {
  const [dragFromIdx, setDragFromIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  if (!bloques.length) return null;

  const canSort = sortable && typeof onReorder === 'function' && bloques.length > 1;

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    const fromIdx = dragFromIdx;
    setDragFromIdx(null);
    setDragOverIdx(null);
    if (fromIdx === null || fromIdx === dropIdx || reorderBusy) return;
    onReorder(fromIdx, dropIdx);
  };

  const handleDragEnd = () => {
    setDragFromIdx(null);
    setDragOverIdx(null);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 1.5,
        mt: 2,
        mb: 2,
      }}
    >
      {bloques.map((bloque, idx) => {
        const isPromo = bloque.variant === 'promo';
        const isActive = editable && activeBlockId === bloque.id;
        const isDragging = dragFromIdx === idx;
        const isOver = dragOverIdx === idx && dragFromIdx !== idx;

        return (
          <Box
            key={bloque.id ?? idx}
            onDragOver={canSort ? (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragFromIdx !== null && dragFromIdx !== idx) setDragOverIdx(idx);
            } : undefined}
            onDrop={canSort ? (e) => handleDrop(e, idx) : undefined}
            sx={{
              position: 'relative',
              bgcolor: '#fff',
              borderRadius: '12px',
              p: 2,
              border: isActive ? '2px solid #004A99' : isOver ? '2px dashed #60a5fa' : '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderTop: isPromo ? '3px solid #f97316' : undefined,
              background: isPromo
                ? 'linear-gradient(180deg, rgba(241,90,36,0.04) 0%, #fff 50%)'
                : '#fff',
              transition: 'all 0.2s ease',
              opacity: isDragging ? 0.5 : 1,
              ...(editable && { '&:hover .bloque-edit-fab': { opacity: 1 } }),
            }}
          >
            {canSort && (
              <Box
                draggable={!reorderBusy}
                onDragStart={() => setDragFromIdx(idx)}
                onDragEnd={handleDragEnd}
                title="Arrastrar para reordenar columnas"
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: reorderBusy ? 'wait' : 'grab',
                  color: '#94a3b8',
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: 20 }} />
              </Box>
            )}
            {editable && onEditBlock && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                <Tooltip title="Editar bloque">
                  <IconButton
                    className="bloque-edit-fab"
                    size="small"
                    onClick={() => onEditBlock(bloque, idx)}
                    sx={{
                      opacity: isActive ? 1 : 0,
                      bgcolor: '#004A99',
                      color: '#fff',
                      width: 28,
                      height: 28,
                      '&:hover': { bgcolor: '#003580' },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                mb: 1.25,
                pr: editable ? 4 : 0,
                pl: canSort ? 3 : 0,
                fontSize: '0.78rem',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <CotizacionIcon
                icon={bloque.icon}
                fontSize="1rem"
                color={isPromo ? '#f97316' : '#004A99'}
              />
              {bloque.titulo}
            </Typography>

            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {(bloque.items || []).map((item, i) => (
                <Box
                  component="li"
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.75,
                    mb: 0.6,
                    fontSize: '0.72rem',
                    color: '#64748b',
                    lineHeight: 1.4,
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: isPromo ? '#f97316' : '#004A99',
                      flexShrink: 0,
                      mt: '5px',
                    }}
                  />
                  {item}
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
