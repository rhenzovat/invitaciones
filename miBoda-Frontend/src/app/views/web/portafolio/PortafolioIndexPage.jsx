import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CmsStorageImage from 'app/components/cms/CmsStorageImage';
import useCmsPanelLayout from 'app/hooks/useCmsPanelLayout';
import { useCmsPanelPush } from 'app/contexts/CmsContentPushContext';
import { toastSuccess, handleErrorMessages } from 'app/components/notify-messages';
import {
  listar, crear, actualizar, eliminar, actualizarSeccion,
} from 'app/api/web_portafolio.api';
import PortafolioCmsPanel from './PortafolioCmsPanel';

const PageBox = styled(Box)({
  padding: 20,
  minHeight: '100vh',
  backgroundColor: '#f0f4f8',
  transition: 'margin-left 0.25s ease',
});

const HeaderCard = styled(Paper)(() => ({
  padding: '14px 22px',
  marginBottom: 16,
  borderRadius: 14,
  background: 'linear-gradient(135deg, #0f172a 0%, #004A99 60%, #F15A24 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CAT_LABELS = { all: 'Todos', sistemas: 'Sistemas', sitios: 'Sitios web', desarrollo: 'En desarrollo' };
const CAT_COLORS = { sistemas: '#004A99', sitios: '#0d9488', desarrollo: '#f59e0b' };

const ProjectCard = ({ item, onEdit, onDelete, isEditing, preview }) => (
  <Paper elevation={0} sx={{
    borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', height: '100%',
    outline: isEditing ? '2px solid #F15A24' : 'none',
  }}>
    {item.url_imagen || preview ? (
      <Box sx={{ height: 120, bgcolor: '#f1f5f9' }}>
        <CmsStorageImage storagePath={item.url_imagen} absoluteUrl={item.url_imagen_publica}
          previewSrc={preview} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
    ) : (
      <Box sx={{ height: 80, bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WorkIcon sx={{ color: '#94a3b8', opacity: 0.5 }} />
      </Box>
    )}
    <Box sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
        <Chip label={item.tipo} size="small" sx={{ height: 20, fontSize: '0.62rem' }} />
        <Chip label={CAT_LABELS[item.categoria] || item.categoria} size="small"
          sx={{ height: 20, fontSize: '0.62rem', bgcolor: CAT_COLORS[item.categoria] || '#64748b', color: '#fff' }} />
      </Stack>
      <Typography fontWeight={700} fontSize="0.82rem" sx={{ mb: 0.5 }}>{item.titulo}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{item.descripcion}</Typography>
      {item.tecnologias && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748b', fontSize: '0.65rem' }}>
          {item.tecnologias}
        </Typography>
      )}
    </Box>
    <Box sx={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 0.5 }}>
      {item.url_proyecto && (
        <IconButton size="small" component="a" href={item.url_proyecto} target="_blank" rel="noopener"
          sx={{ bgcolor: 'rgba(255,255,255,0.9)', width: 26, height: 26 }}>
          <OpenInNewIcon sx={{ fontSize: 13 }} />
        </IconButton>
      )}
      <IconButton size="small" onClick={() => onEdit(item)}
        sx={{ bgcolor: '#004A99', color: '#fff', width: 26, height: 26 }}>
        <EditIcon sx={{ fontSize: 13 }} />
      </IconButton>
      <IconButton size="small" onClick={() => onDelete(item)}
        sx={{ bgcolor: '#ef4444', color: '#fff', width: 26, height: 26 }}>
        <DeleteOutlineIcon sx={{ fontSize: 13 }} />
      </IconButton>
    </Box>
  </Paper>
);

export default function PortafolioIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [seccion, setSeccion] = useState(null);
  const [items, setItems] = useState([]);
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelMode, setPanelMode] = useState('item');
  const [editItem, setEditItem] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isNew = !editItem?.id;

  const counts = useMemo(() => ({
    all: items.filter((i) => i.Activo !== 'N').length,
    sistemas: items.filter((i) => i.categoria === 'sistemas' && i.Activo !== 'N').length,
    sitios: items.filter((i) => i.categoria === 'sitios' && i.Activo !== 'N').length,
    desarrollo: items.filter((i) => i.categoria === 'desarrollo' && i.Activo !== 'N').length,
  }), [items]);

  const filtered = useMemo(() => {
    const list = items.filter((i) => i.Activo !== 'N');
    if (catFilter === 'all') return list;
    return list.filter((i) => i.categoria === catFilter);
  }, [items, catFilter]);

  const canvasItems = useMemo(() => {
    if (!panelOpen || panelMode !== 'item' || !editItem?.id) return filtered;
    return filtered.map((it) => (it.id === editItem.id ? { ...it, ...editItem } : it));
  }, [filtered, panelOpen, panelMode, editItem]);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeccion(data?.seccion || null);
      setItems(data?.items || []);
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const closePanel = () => { setPanelOpen(false); setFile(null); setPreview(null); };

  const openHeaderPanel = () => {
    setPanelMode('seccion');
    setEditItem(null);
    setPanelOpen(true);
  };

  const openItemPanel = (item = null) => {
    setPanelMode('item');
    setEditItem(item ? { ...item } : {
      categoria: catFilter === 'all' ? 'sitios' : catFilter,
      tipo: 'Sitio web',
      titulo: '',
      descripcion: '',
      tecnologias: '',
      url_proyecto: '',
      texto_enlace: 'Sitio web',
    });
    setFile(null);
    setPreview(null);
    setPanelOpen(true);
  };

  const handleFile = (f) => {
    setFile(f);
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target.result);
    r.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (panelMode === 'seccion') {
        await actualizarSeccion({
          id: seccion?.id || 1,
          etiqueta: seccion?.etiqueta,
          titulo: seccion?.titulo,
          subtitulo: seccion?.subtitulo,
        });
        toastSuccess('Encabezado actualizado');
      } else if (editItem) {
        const fd = new FormData();
        fd.append('categoria', editItem.categoria || 'sitios');
        fd.append('tipo', editItem.tipo || 'Sitio web');
        fd.append('titulo', editItem.titulo || '');
        fd.append('descripcion', editItem.descripcion || '');
        fd.append('tecnologias', editItem.tecnologias || '');
        fd.append('url_proyecto', editItem.url_proyecto || '');
        fd.append('texto_enlace', editItem.texto_enlace || 'Sitio web');
        if (file) fd.append('image', file);
        if (!isNew) fd.append('id', editItem.id);
        if (isNew) await crear(fd);
        else await actualizar(fd);
        toastSuccess(isNew ? 'Proyecto creado' : 'Proyecto actualizado');
      }
      closePanel();
      await cargar();
    } catch (err) {
      handleErrorMessages('Error al guardar', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmItem?.id) return;
    setDeleting(true);
    try {
      await eliminar({ id: confirmItem.id });
      toastSuccess('Proyecto eliminado');
      setConfirmItem(null);
      if (editItem?.id === confirmItem.id) closePanel();
      await cargar();
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setDeleting(false);
    }
  };

  const editingId = editItem?.id;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Dialog open={!!confirmItem} onClose={() => !deleting && setConfirmItem(null)}>
        <DialogTitle>Eliminar proyecto</DialogTitle>
        <DialogContent>
          <Typography variant="body2">¿Eliminar «{confirmItem?.titulo}»?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmItem(null)} disabled={deleting}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <PortafolioCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        mode={panelMode}
        seccion={seccion}
        item={editItem}
        preview={preview}
        onSeccionChange={setSeccion}
        onItemChange={setEditItem}
        onFile={handleFile}
        onSave={handleSave}
        onClose={closePanel}
        onDelete={panelMode === 'item' && editItem?.id ? () => setConfirmItem(editItem) : undefined}
        saving={saving}
        isNew={isNew}
      />

      <PageBox>
        <HeaderCard elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon />
            <Typography fontWeight={700}>Portafolio de clientes</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => openItemPanel()}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              Agregar
            </Button>
            <Tooltip title="Editar encabezado">
              <IconButton size="small" onClick={openHeaderPanel} sx={{ color: '#fff' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </HeaderCard>

        {seccion && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">{seccion.etiqueta}</Typography>
            <Typography fontWeight={700} dangerouslySetInnerHTML={{ __html: seccion.titulo || '' }} />
            <Typography variant="body2" color="text.secondary">{seccion.subtitulo}</Typography>
          </Paper>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {Object.entries(CAT_LABELS).map(([key, label]) => (
            <Chip
              key={key}
              label={`${label} (${counts[key] ?? 0})`}
              onClick={() => setCatFilter(key)}
              color={catFilter === key ? 'primary' : 'default'}
              variant={catFilter === key ? 'filled' : 'outlined'}
              sx={catFilter === key ? { bgcolor: '#004A99' } : {}}
            />
          ))}
        </Stack>

        <Grid container spacing={2}>
          {canvasItems.map((it) => (
            <Grid item xs={12} sm={6} md={4} key={it.id}>
              <ProjectCard
                item={it}
                onEdit={openItemPanel}
                onDelete={setConfirmItem}
                isEditing={editingId === it.id}
                preview={editingId === it.id ? preview : null}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4}>
            <Box onClick={() => openItemPanel()} sx={{
              border: '2px dashed #cbd5e1', borderRadius: 2, minHeight: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <AddIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
          </Grid>
        </Grid>
      </PageBox>
    </>
  );
}
