import {
  Box, Typography, IconButton, Divider, TextField, Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CmsPanelRoot from 'app/components/cms/CmsPanelRoot';
import CotizacionSortableCaracteristicas from './components/CotizacionSortableCaracteristicas';
import CotizacionCmsIconField from './components/CotizacionCmsIconField';

const DarkField = styled(TextField)(() => ({
  '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.07)', color: '#f1f5f9', borderRadius: 6 },
  '& .MuiInputBase-input': { color: '#f1f5f9' },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,74,153,0.6)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#004A99' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' },
}));

const Tag = styled(Typography)(() => ({
  fontSize: '0.60rem', fontWeight: 700, letterSpacing: '0.10em',
  textTransform: 'uppercase', color: '#60a5fa', marginBottom: 5,
}));

export default function CotizacionInfoBloqueCmsPanel({
  open, panelLeft = 0, datos, onChange, onSave, onClose,
}) {
  const items = Array.isArray(datos?.items) ? datos.items : [];
  const setItems = (arr) => onChange('items', arr);
  const updateItem = (i, v) => {
    const a = [...items];
    a[i] = v;
    setItems(a);
  };
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const addItem = () => setItems([...items, '']);

  const F = (label, key, ph = '') => (
    <DarkField key={key} size="small" fullWidth label={label}
      value={datos?.[key] ?? ''} placeholder={ph}
      onChange={(e) => onChange(key, e.target.value)} sx={{ mb: 1.5 }} />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.25)',
        position: 'sticky', top: 0, zIndex: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f1f5f9' }}>
            Editar bloque informativo
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.60rem' }}>
            {datos?.titulo || ''}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
        <Tag>Bloque</Tag>
        {F('Título', 'titulo', 'Todos los proyectos incluyen')}
        <CotizacionCmsIconField
          Field={DarkField}
          label="Ícono Bootstrap (ej. bi-gift)"
          fieldKey="icon"
          value={datos?.icon}
          onChange={onChange}
          placeholder="bi-gift"
        />
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
          En ítems puedes usar {'{renovacion_dominio}'} o {'{soporte_hora}'} para valores dinámicos.
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5 }} />
        <Tag>Ítems de la lista</Tag>
        <CotizacionSortableCaracteristicas
          items={items}
          onChange={setItems}
          onRemove={removeItem}
          emptyHint="Sin ítems — agrega uno abajo"
          hint="Arrastra ⋮⋮ para cambiar el orden (se refleja en la columna)"
          renderField={(item, i) => (
            <DarkField
              size="small"
              fullWidth
              value={item}
              placeholder={`Ítem ${i + 1}`}
              onChange={(e) => updateItem(i, e.target.value)}
              sx={{ mb: 0 }}
            />
          )}
        />
        <Button size="small" startIcon={<AddIcon />} onClick={addItem}
          sx={{ color: '#60a5fa', textTransform: 'none', fontSize: '0.72rem' }}>
          Agregar ítem
        </Button>
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)', position: 'sticky', bottom: 0 }}>
        <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}
          sx={{ bgcolor: '#004A99', fontWeight: 700, '&:hover': { bgcolor: '#003580' } }}>
          Guardar bloque
        </Button>
      </Box>
    </CmsPanelRoot>
  );
}
