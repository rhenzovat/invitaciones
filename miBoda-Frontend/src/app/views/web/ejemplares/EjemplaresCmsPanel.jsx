import React, { useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, Divider, Stack, TextField, Button, MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CmsPanelRoot from 'app/components/cms/CmsPanelRoot';
import CmsStorageImage from 'app/components/cms/CmsStorageImage';
import { royalsensorymassageDemoUrl } from 'app/utils/lucdesoftDemoUrl';

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
  textTransform: 'uppercase', color: '#F15A24', marginBottom: 6, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5 }} />;

const ImgUpload = ({ item, preview, onFile, open }) => {
  const ref = useRef(null);
  useEffect(() => { if (!open && ref.current) ref.current.value = ''; }, [open]);

  return (
    <Box sx={{ mb: 2 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width: '100%', aspectRatio: '16/10', borderRadius: 2,
        border: '2px dashed rgba(241,90,36,0.45)', cursor: 'pointer', overflow: 'hidden',
        bgcolor: 'rgba(255,255,255,0.04)',
      }}>
        <CmsStorageImage
          storagePath={item?.url_imagen}
          absoluteUrl={item?.url_imagen_publica}
          previewSrc={preview}
          alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
    </Box>
  );
};

export default function EjemplaresCmsPanel({
  open, panelLeft, mode, seccion, item, secciones, preview,
  onSeccionChange, onItemChange, onFile, onSave, onClose, onDelete, saving, isNew,
}) {
  const title = mode === 'seccion' ? 'Encabezado de sección' : (isNew ? 'Nuevo ejemplar' : 'Editar ejemplar');
  const demoPreviewUrl = item
    ? royalsensorymassageDemoUrl(item.url_demo, item.url_demo_publica)
    : null;

  return (
    <CmsPanelRoot open={open} left={panelLeft}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>{title}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {mode === 'seccion' && seccion && (
        <>
          <SectionTag>Sección</SectionTag>
          <DarkField fullWidth size="small" label="Etiqueta" value={seccion.etiqueta || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onSeccionChange({ ...seccion, etiqueta: e.target.value })} />
          <DarkField fullWidth size="small" label="Título" value={seccion.titulo || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onSeccionChange({ ...seccion, titulo: e.target.value })} />
          <DarkField fullWidth size="small" label="Título destacado (em)" value={seccion.titulo_destacado || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onSeccionChange({ ...seccion, titulo_destacado: e.target.value })} />
          <DarkField fullWidth size="small" label="Subtítulo" multiline minRows={2} value={seccion.subtitulo || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onSeccionChange({ ...seccion, subtitulo: e.target.value })} />
        </>
      )}

      {mode === 'item' && item && (
        <>
          <SectionTag>Card</SectionTag>
          <DarkField select fullWidth size="small" label="Sección" value={item.id_seccion || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, id_seccion: Number(e.target.value) })}>
            {(secciones || []).map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.titulo} {s.titulo_destacado}</MenuItem>
            ))}
          </DarkField>
          <ImgUpload item={item} preview={preview} onFile={onFile} open={open} />
          <DarkField fullWidth size="small" label="Nombre" value={item.nombre || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, nombre: e.target.value })} />
          <DarkField fullWidth size="small" label="Descripción" multiline minRows={3} value={item.descripcion || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, descripcion: e.target.value })} />
          <DarkField fullWidth size="small" label="Overlay" value={item.overlay_texto || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, overlay_texto: e.target.value })} />
          <DarkField fullWidth size="small" label="Badge #" value={item.numero_badge || ''} sx={{ mb: 1.5 }}
            onChange={(e) => onItemChange({ ...item, numero_badge: e.target.value })} />
          <DarkField
            fullWidth
            size="small"
            label="URL demo (Ver demo →)"
            value={item.url_demo || ''}
            placeholder="sites/pagina_web/1-arkitektur/index.html"
            helperText="Ruta bajo temp02/ (ej. sites/...) o URL https completa"
            sx={{ mb: 1 }}
            onChange={(e) => onItemChange({ ...item, url_demo: e.target.value })}
          />
          {demoPreviewUrl && (
            <Button
              component="a"
              href={demoPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              startIcon={<OpenInNewIcon />}
              sx={{
                mb: 1.5,
                color: '#4ade80',
                textTransform: 'none',
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: 'rgba(74,222,128,0.1)' },
              }}
            >
              Abrir demo en el sitio
            </Button>
          )}
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
