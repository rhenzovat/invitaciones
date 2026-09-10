import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CollectionsIcon from '@mui/icons-material/Collections';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from '@mui/material/Link';
import CmsStorageImage from 'app/components/cms/CmsStorageImage';
import useCmsPanelLayout from 'app/hooks/useCmsPanelLayout';
import { useCmsPanelPush } from 'app/contexts/CmsContentPushContext';
import { toastSuccess, handleErrorMessages } from 'app/components/notify-messages';
import {
  listar, crear, actualizar, eliminar, actualizarSeccion,
} from 'app/api/web_ejemplares.api';
import EjemplaresCmsPanel from './EjemplaresCmsPanel';

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
  background: 'linear-gradient(135deg, #004A99 0%, #0066cc 55%, #F15A24 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 6px 28px rgba(0,74,153,0.28)',
}));

const CardBox = ({ item, onEdit, onDelete, isEditing, preview }) => (
  <Paper elevation={0} sx={{
    borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative',
    outline: isEditing ? '2px solid #F15A24' : 'none',
  }}>
    <Box sx={{ aspectRatio: '16/10', bgcolor: '#f1f5f9', position: 'relative' }}>
      <CmsStorageImage
        storagePath={item.url_imagen}
        absoluteUrl={item.url_imagen_publica}
        previewSrc={preview}
        alt={item.nombre}
        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Chip label={`#${item.numero_badge}`} size="small" sx={{
        position: 'absolute', top: 8, left: 8, fontWeight: 700, fontSize: '0.65rem',
      }} />
      <Box sx={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 0.5 }}>
        <IconButton size="small" onClick={() => onEdit(item)}
          sx={{ bgcolor: '#004A99', color: '#fff', width: 28, height: 28 }}>
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(item)}
          sx={{ bgcolor: '#ef4444', color: '#fff', width: 28, height: 28 }}>
          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
    <Box sx={{ p: 1.5 }}>
      <Typography fontWeight={700} fontSize="0.85rem">{item.nombre}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.descripcion}
      </Typography>
      {item.url_demo_publica && (
        <Link
          href={item.url_demo_publica}
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{
            mt: 0.75,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            fontWeight: 700,
            color: '#F15A24',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          Ver demo <OpenInNewIcon sx={{ fontSize: 12 }} />
        </Link>
      )}
    </Box>
  </Paper>
);

export default function EjemplaresIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [secciones, setSecciones] = useState([]);
  const [items, setItems] = useState([]);
  const [tabIdx, setTabIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelMode, setPanelMode] = useState('item');
  const [editSeccion, setEditSeccion] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const activeSeccion = secciones[tabIdx] || null;
  const isNew = !editItem?.id;

  const filteredItems = useMemo(() => {
    if (!activeSeccion) return [];
    return items.filter((i) => i.id_seccion === activeSeccion.id && i.Activo !== 'N');
  }, [items, activeSeccion]);

  const canvasItems = useMemo(() => {
    if (!panelOpen || panelMode !== 'item' || !editItem?.id) return filteredItems;
    return filteredItems.map((it) => (
      it.id === editItem.id ? { ...it, ...editItem, _preview: preview } : it
    ));
  }, [filteredItems, panelOpen, panelMode, editItem, preview]);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSecciones(data?.secciones || []);
      setItems(data?.items || []);
    } catch (err) {
      handleErrorMessages('Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const closePanel = () => {
    setPanelOpen(false);
    setFile(null);
    setPreview(null);
  };

  const openSeccionPanel = () => {
    if (!activeSeccion) return;
    setPanelMode('seccion');
    setEditSeccion({ ...activeSeccion });
    setEditItem(null);
    setPanelOpen(true);
  };

  const openItemPanel = (item = null) => {
    setPanelMode('item');
    setEditSeccion(null);
    setEditItem(item ? { ...item } : {
      id_seccion: activeSeccion?.id,
      nombre: '',
      descripcion: '',
      overlay_texto: '',
      numero_badge: '',
      url_demo: '',
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
      if (panelMode === 'seccion' && editSeccion) {
        await actualizarSeccion({
          id: editSeccion.id,
          etiqueta: editSeccion.etiqueta,
          titulo: editSeccion.titulo,
          titulo_destacado: editSeccion.titulo_destacado,
          subtitulo: editSeccion.subtitulo,
        });
        toastSuccess('Sección actualizada');
      } else if (editItem) {
        const fd = new FormData();
        fd.append('nombre', editItem.nombre || '');
        fd.append('descripcion', editItem.descripcion || '');
        fd.append('overlay_texto', editItem.overlay_texto || '');
        fd.append('numero_badge', editItem.numero_badge || '');
        fd.append('url_demo', editItem.url_demo || '');
        fd.append('id_seccion', editItem.id_seccion || activeSeccion?.id);
        if (file) fd.append('image', file);
        if (!isNew) fd.append('id', editItem.id);
        if (isNew) await crear(fd);
        else await actualizar(fd);
        toastSuccess(isNew ? 'Ejemplar creado' : 'Ejemplar actualizado');
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
      toastSuccess('Ejemplar eliminado');
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
        <DialogTitle>Eliminar ejemplar</DialogTitle>
        <DialogContent>
          <Typography variant="body2">¿Eliminar «{confirmItem?.nombre}»?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmItem(null)} disabled={deleting}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <EjemplaresCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        mode={panelMode}
        seccion={editSeccion}
        item={editItem}
        secciones={secciones}
        preview={preview}
        onSeccionChange={setEditSeccion}
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
            <CollectionsIcon />
            <Typography fontWeight={700}>Ejemplares · royalsensorymassage</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => openItemPanel()}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}>
              Agregar
            </Button>
            <Tooltip title="Editar encabezado de sección">
              <IconButton size="small" onClick={openSeccionPanel} sx={{ color: '#fff' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </HeaderCard>

        <Paper sx={{ mb: 2, borderRadius: 2 }}>
          <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} variant="scrollable">
            {secciones.map((s, i) => (
              <Tab key={s.id} label={`${s.titulo} (${s.conteo_nav})`} />
            ))}
          </Tabs>
          {activeSeccion && (
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="caption" color="text.secondary">{activeSeccion.etiqueta}</Typography>
              <Typography fontWeight={700}>
                {activeSeccion.titulo} <em>{activeSeccion.titulo_destacado}</em>
              </Typography>
              <Typography variant="body2" color="text.secondary">{activeSeccion.subtitulo}</Typography>
            </Box>
          )}
        </Paper>

        <Grid container spacing={2}>
          {canvasItems.map((it) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={it.id}>
              <CardBox
                item={it}
                onEdit={openItemPanel}
                onDelete={setConfirmItem}
                isEditing={editingId === it.id}
                preview={editingId === it.id ? preview : null}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Box onClick={() => openItemPanel()} sx={{
              border: '2px dashed #cbd5e1', borderRadius: 2, minHeight: 220,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              '&:hover': { borderColor: '#004A99' },
            }}>
              <AddIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </Box>
          </Grid>
        </Grid>
      </PageBox>
    </>
  );
}
