import {
  Box, Typography, Divider, IconButton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { CotizacionIconBox } from './CotizacionIcon';

/** Unifica forma admin (listarTipos) y catálogo público (catalogoPublico). */
export function normalizeTipo(t) {
  if (!t) return {};
  if (t.titulo != null || t.precio_base != null) {
    return {
      ...t,
      caracteristicas: t.caracteristicas ?? t.includes ?? [],
      icono: t.icono ?? t.icon,
      tiempo_entrega: t.tiempo_entrega ?? t.dias_entrega,
    };
  }
  return {
    id: t.id,
    slug: t.id,
    titulo: t.title,
    descripcion: t.desc,
    subtexto_emocional: t.subtexto ?? t.subtexto_emocional,
    frase_destacada: t.fraseDestacada ?? t.frase_destacada,
    badge_etiqueta: t.badge ?? t.badge_etiqueta,
    texto_boton: t.buttonText ?? t.texto_boton,
    precio_base: t.price,
    tiempo_entrega: t.delivery,
    nota_custom: t.customNote,
    icono: t.icon,
    caracteristicas: t.includes ?? [],
    requiere_modulos: t.needsModules ? 'S' : 'N',
  };
}

const blockShellSx = (active, editable) => ({
  position: 'relative',
  borderRadius: '10px',
  border: active ? '2px solid #004A99' : '2px solid transparent',
  bgcolor: active ? 'rgba(0,74,153,0.04)' : 'transparent',
  transition: 'border-color 0.2s, background 0.2s',
  ...(editable && { '&:hover .block-edit-fab': { opacity: 1 } }),
});

const BlockEditFab = ({ onClick, active }) => (
  <Tooltip title="Editar bloque">
    <IconButton
      className="block-edit-fab"
      size="small"
      onClick={onClick}
      sx={{
        opacity: active ? 1 : 0,
        bgcolor: '#004A99',
        color: '#fff',
        width: 28,
        height: 28,
        boxShadow: '0 2px 8px rgba(0,74,153,0.35)',
        transition: 'opacity 0.2s',
        '&:hover': { bgcolor: '#003580' },
      }}
    >
      <EditIcon sx={{ fontSize: 15 }} />
    </IconButton>
  </Tooltip>
);

/**
 * Tarjeta de tipo de proyecto (catálogo admin o wizard nueva cotización).
 * Sin drag: el orden solo se gestiona en Catálogo con CotizacionCatalogoOrdenCanvas.
 */
export default function CotizacionTipoCard({
  tipo: rawTipo,
  selected = false,
  onSelect,
  onEditBlock,
  activeBlock = null,
  panelData,
}) {
  const tipo = normalizeTipo(rawTipo);
  const editable = Boolean(onEditBlock);
  const datosActive = editable && activeBlock === 'datos';
  const carActive = editable && activeBlock === 'caracteristicas';

  const src = (field) => {
    if (editable && panelData?.[field] !== undefined && panelData?.[field] !== null) {
      return panelData[field];
    }
    return tipo[field];
  };

  const rawCar = editable && carActive && panelData?.caracteristicas != null
    ? panelData.caracteristicas
    : (tipo.caracteristicas ?? tipo.includes);
  const car = Array.isArray(rawCar)
    ? rawCar
    : (() => { try { return JSON.parse(rawCar || '[]'); } catch { return []; } })();

  const handleSelect = () => onSelect?.(tipo);

  return (
    <Box
      onClick={editable ? undefined : handleSelect}
      sx={{
        border: selected ? '2px solid #004A99' : '1px solid #e5e7eb',
        borderRadius: '16px',
        p: 2.5,
        background: '#fff',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: selected ? '0 8px 28px rgba(0,74,153,0.18)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.22s ease',
        cursor: editable ? 'default' : 'pointer',
        ...(!editable && {
          '&:hover': {
            boxShadow: '0 10px 32px rgba(0,0,0,0.13)',
            transform: 'translateY(-3px)',
          },
        }),
      }}
    >
      <Box sx={{ ...blockShellSx(datosActive, editable), p: 1, mb: 1, pr: editable ? 5 : 0 }}>
        {editable && (
          <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
            <BlockEditFab
              onClick={(e) => { e.stopPropagation(); onEditBlock(rawTipo, 'datos'); }}
              active={datosActive}
            />
          </Box>
        )}

        <CotizacionIconBox icon={src('icono') || src('icon')} sx={{ mb: 1.5 }} />

        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.6, color: '#1e293b', lineHeight: 1.25 }}>
          {src('titulo')}
        </Typography>

        <Typography variant="body2" sx={{ mb: 0.8, fontSize: '0.80rem', color: '#64748b', lineHeight: 1.5 }}>
          {src('descripcion')}
        </Typography>
        {src('subtexto_emocional') && (
          <Typography variant="body2" sx={{ mb: 1.2, fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45, fontStyle: 'italic' }}>
            {src('subtexto_emocional')}
          </Typography>
        )}
        {src('badge_etiqueta') && (
          <Box sx={{
            display: 'inline-block', mb: 1, px: 1.2, py: 0.35,
            bgcolor: '#1e293b', color: '#f8fafc', borderRadius: '20px',
            fontSize: '0.68rem', fontWeight: 700,
          }}>
            {src('badge_etiqueta')}
          </Box>
        )}

        <Typography sx={{ fontSize: '2.4rem', fontWeight: 900, color: '#f97316', lineHeight: 1, mb: 0.3 }}>
          S/ {parseFloat(src('precio_base') || 0).toFixed(0)}
        </Typography>
        {(src('tiempo_entrega') || src('dias_entrega')) && (
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
            {src('tiempo_entrega') || src('dias_entrega')}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 0.5 }} />

      <Box sx={{ ...blockShellSx(carActive, editable), p: 1, flex: 1, pr: editable ? 5 : 0 }}>
        {editable && (
          <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
            <BlockEditFab
              onClick={(e) => { e.stopPropagation(); onEditBlock(rawTipo, 'caracteristicas'); }}
              active={carActive}
            />
          </Box>
        )}

        {car.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#1e293b', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flex: 1, fontSize: '0.80rem', color: '#374151', lineHeight: 1.45 }}>
              {item}
            </Typography>
          </Box>
        ))}
        {car.length === 0 && editable && (
          <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
            Sin características — usa el lápiz para agregar
          </Typography>
        )}
      </Box>

      {src('frase_destacada') && (
        <Box sx={{
          mt: 1, px: 1.2, py: 0.8, bgcolor: '#1e293b', color: '#e2e8f0',
          borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center',
        }}>
          {src('frase_destacada')}
        </Box>
      )}

      {tipo.nota_custom && (
        <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block', lineHeight: 1.4 }}>
          {tipo.nota_custom}
        </Typography>
      )}

      <Box
        component="button"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSelect();
        }}
        sx={{
          mt: 2,
          width: '100%',
          border: 'none',
          bgcolor: selected ? '#003580' : '#004A99',
          color: '#fff',
          borderRadius: '10px',
          py: 1.2,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.88rem',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.2s',
          '&:hover': { bgcolor: '#003580' },
        }}
      >
        {selected ? 'Seleccionado' : (src('texto_boton') || 'Seleccionar')}
      </Box>
    </Box>
  );
}
