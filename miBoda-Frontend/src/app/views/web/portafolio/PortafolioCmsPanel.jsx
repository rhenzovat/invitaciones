import React, { useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, Divider, Stack, TextField, Button, MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CmsPanelRoot from 'app/components/cms/CmsPanelRoot';
import CmsStorageImage from 'app/components/cms/CmsStorageImage';

const DarkField = styled(TextField)(() => ({
  '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.07)', color: '#f1f5f9', borderRadius: 6 },
  '& .MuiInputBase-input': { color: '#f1f5f9' },
  '& .MuiInputLabel-root': { color: '#94a3b8' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(241,90,36,0.6)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F15A24' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#F15A24' },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: '0.60rem', fontWeight: 700, letterSpacing: '0.10em',
  textTransform: 'uppercase', color: '#F15A24', marginBottom: 6,
}));

const Sep = () => <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5 }} />;

const CATEGORIAS = [
  { value: 'sistemas', label: 'Sistemas a medida' },
  { value: 'sitios', label: 'Sitios web' },
  { value: 'desarrollo', label: 'En desarrollo' },
];

const TIPOS = ['Sistema', 'App móvil', 'Sitio web'];

export default function PortafolioCmsPanel({
  open, panelLeft, mode, seccion, item, preview,
  onSeccionChange, onItemChange, onFile, onSave, onClose, onDelete, saving, isNew,
}) {
  const ref = useRef(null);
  useEffect(() => { if (!open && ref.current) ref.current.value = ''; }, [open]);

  return (
    <CmsPanelRoot open={open} left={panelLeft}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>
          {mode === 'seccion' ? 'Encabezado portafolio' : (isNew ? 'Nuevo proyecto' : 'Editar proyecto')}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {mode === 'seccion' && seccion && (
        <>
          <SectionTag>Sección</SectionTag>
          <DarkField fullWidth size="small" label="Etiqueta" value={seccion.etiqueta || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onSeccionChange({ ...seccion, etiqueta: e.target.value })} />
          <DarkField fullWidth size="small" label="Título (HTML)" value={seccion.titulo || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onSeccionChange({ ...seccion, titulo: e.target.value })} />
          <DarkField fullWidth size="small" label="Subtítulo" multiline minRows={2} value={seccion.subtitulo || ''}
            onChange={(e) => onSeccionChange({ ...seccion, subtitulo: e.target.value })} />
        </>
      )}

      {mode === 'item' && item && (
        <>
          <SectionTag>Proyecto</SectionTag>
          <input type="file" ref={ref} accept="image/*" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          <Box onClick={() => ref.current?.click()} sx={{
            mb: 2, aspectRatio: '16/9', borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
            border: '2px dashed rgba(241,90,36,0.4)',
          }}>
            <CmsStorageImage storagePath={item.url_imagen} absoluteUrl={item.url_imagen_publica}
              previewSrc={preview} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <DarkField select fullWidth size="small" label="Categoría" value={item.categoria || 'sitios'} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, categoria: e.target.value })}>
            {CATEGORIAS.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
          </DarkField>
          <DarkField select fullWidth size="small" label="Tipo" value={item.tipo || 'Sitio web'} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, tipo: e.target.value })}>
            {TIPOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </DarkField>
          <DarkField fullWidth size="small" label="Título" value={item.titulo || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, titulo: e.target.value })} />
          <DarkField fullWidth size="small" label="Descripción" multiline minRows={3} value={item.descripcion || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, descripcion: e.target.value })} />
          <DarkField fullWidth size="small" label="Tecnologías" value={item.tecnologias || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, tecnologias: e.target.value })} />
          <DarkField fullWidth size="small" label="URL proyecto" value={item.url_proyecto || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, url_proyecto: e.target.value })} />
          <DarkField fullWidth size="small" label="Texto enlace" value={item.texto_enlace || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, texto_enlace: e.target.value })} />
        </>
      )}

      <Sep />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave} disabled={saving}
          sx={{ flex: 1, bgcolor: '#F15A24', fontWeight: 700, '&:hover': { bgcolor: '#d94e1a' } }}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
        {onDelete && (
          <Button variant="outlined" onClick={onDelete}
            sx={{ borderColor: 'rgba(239,68,68,0.5)', color: '#f87171', minWidth: 44 }}>
            <DeleteOutlineIcon fontSize="small" />
          </Button>
        )}
      </Stack>
    </CmsPanelRoot>
  );
}
