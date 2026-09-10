import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Chip, Avatar, LinearProgress,
  CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip,
  Alert, Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import EventNoteIcon          from '@mui/icons-material/EventNote';
import InsertDriveFileIcon    from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon       from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon        from '@mui/icons-material/Description';
import TableChartIcon         from '@mui/icons-material/TableChart';
import SlideshowIcon          from '@mui/icons-material/Slideshow';
import FolderZipIcon          from '@mui/icons-material/FolderZip';
import ImageIcon              from '@mui/icons-material/Image';
import GitHubIcon             from '@mui/icons-material/GitHub';
import LinkIcon               from '@mui/icons-material/Link';
import StorageIcon            from '@mui/icons-material/Storage';
import CloudIcon              from '@mui/icons-material/Cloud';
import FigmaIcon              from '@mui/icons-material/PanTool';
import ApiIcon                from '@mui/icons-material/Api';
import DownloadIcon           from '@mui/icons-material/Download';
import VisibilityIcon         from '@mui/icons-material/Visibility';
import DeleteIcon             from '@mui/icons-material/Delete';
import AddIcon                from '@mui/icons-material/Add';
import EditIcon               from '@mui/icons-material/Edit';
import OpenInNewIcon          from '@mui/icons-material/OpenInNew';
import UploadFileIcon         from '@mui/icons-material/UploadFile';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon     from '@mui/icons-material/HourglassEmpty';
import PauseCircleIcon        from '@mui/icons-material/PauseCircle';
import RateReviewIcon         from '@mui/icons-material/RateReview';

import useAuth from '../../hooks/useAuth';
import { apiClient } from '../../contexts/JWTAuthContext';
import {
  proyectosListar, archivosListar, archivosSubir, archivosEliminar,
  enlacesListar, enlacesCrear, enlacesActualizar, enlacesEliminar,
} from '../../api/campus.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';

// ─── Animación ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

// Raíz panorámica — sin scroll de página
const PageRoot = styled(Box)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f0f4f8',
  overflow: 'hidden',
  animation: `${fadeIn} 0.3s ease`,
});

// Header delgado — igual de compacto que el dashboard
const CompactHeader = styled(Paper)({
  borderRadius: 12,
  background: 'linear-gradient(120deg, #1565c0 0%, #1976d2 55%, #1e88e5 100%)',
  color: '#fff',
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  boxShadow: '0 2px 10px rgba(21,101,192,0.22)',
  position: 'relative',
  overflow: 'hidden',
  flexShrink: 0,
  '&::after': {
    content: '""', position: 'absolute',
    top: -24, right: -24, width: 80, height: 80,
    borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
  },
});

// Tabs compactos
const StyledTabs = styled(Tabs)({
  backgroundColor: '#fff',
  borderBottom: '1px solid #e3eaf3',
  minHeight: 40,
  flexShrink: 0,
  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#1976d2' },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 13,
  minHeight: 40,
  padding: '6px 14px',
});

// Tarjeta de archivo — compacta
const FileCard = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  transition: 'transform 0.18s, box-shadow 0.18s',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.11)' },
}));

// Tarjeta de enlace — compacta
const LinkCard = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  transition: 'transform 0.18s, box-shadow 0.18s',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.11)' },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  en_progreso: { label: 'En progreso', color: '#1976d2', bg: '#e3f2fd', icon: HourglassEmptyIcon },
  en_revision: { label: 'En revisión', color: '#ed6c02', bg: '#fff3e0', icon: RateReviewIcon    },
  completado:  { label: 'Completado',  color: '#2e7d32', bg: '#e8f5e9', icon: CheckCircleIcon   },
  pausado:     { label: 'Pausado',     color: '#757575', bg: '#f5f5f5', icon: PauseCircleIcon   },
};

const CATEGORIA_ICONO = {
  github:    { icon: GitHubIcon,    color: '#24292e', bg: '#f5f5f5'  },
  gitlab:    { icon: LinkIcon,      color: '#fc6d26', bg: '#fff3e0'  },
  hosting:   { icon: CloudIcon,     color: '#1976d2', bg: '#e3f2fd'  },
  dominio:   { icon: LinkIcon,      color: '#7b1fa2', bg: '#f3e5f5'  },
  figma:     { icon: FigmaIcon,     color: '#f24e1e', bg: '#fce4ec'  },
  drive:     { icon: StorageIcon,   color: '#4caf50', bg: '#e8f5e9'  },
  api:       { icon: ApiIcon,       color: '#0097a7', bg: '#e0f7fa'  },
  servidor:  { icon: StorageIcon,   color: '#455a64', bg: '#eceff1'  },
  panel:     { icon: LinkIcon,      color: '#e65100', bg: '#fff3e0'  },
  otro:      { icon: LinkIcon,      color: '#616161', bg: '#f5f5f5'  },
};

function getFileIcon(ext) {
  const e = (ext || '').toLowerCase();
  if (e === 'pdf')                               return { icon: PictureAsPdfIcon,   color: '#c62828', bg: '#ffebee' };
  if (['doc','docx'].includes(e))                return { icon: DescriptionIcon,    color: '#1565c0', bg: '#e3f2fd' };
  if (['xls','xlsx'].includes(e))                return { icon: TableChartIcon,     color: '#2e7d32', bg: '#e8f5e9' };
  if (['ppt','pptx'].includes(e))                return { icon: SlideshowIcon,      color: '#e65100', bg: '#fff3e0' };
  if (['zip','rar','7z'].includes(e))            return { icon: FolderZipIcon,      color: '#f57f17', bg: '#fffde7' };
  if (['jpg','jpeg','png','gif','webp'].includes(e)) return { icon: ImageIcon,      color: '#7b1fa2', bg: '#f3e5f5' };
  return { icon: InsertDriveFileIcon, color: '#455a64', bg: '#eceff1' };
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TABS = [
  { key: 'documentos',     label: 'Documentos',     modulo: 'documentos'     },
  { key: 'repositorios',   label: 'Repositorios',   modulo: null              },
  { key: 'boletas',        label: 'Boletas',        modulo: 'boletas'        },
  { key: 'presentaciones', label: 'Presentaciones', modulo: 'presentaciones' },
  { key: 'manuales',       label: 'Manuales',       modulo: 'manuales'       },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ProyectoDetalle = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const isAdmin   = user?.es_administrador_principal == 1;
  const fileRef   = useRef(null);

  const [proyecto, setProyecto] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [enlaces,  setEnlaces]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  // Upload dialog
  const [uploadOpen,   setUploadOpen]   = useState(false);
  const [uploadFile,   setUploadFile]   = useState(null);
  const [uploadNombre, setUploadNombre] = useState('');
  const [uploadDesc,   setUploadDesc]   = useState('');
  const [uploadModulo, setUploadModulo] = useState('documentos');
  const [uploading,    setUploading]    = useState(false);

  // Link dialog
  const [linkOpen,   setLinkOpen]   = useState(false);
  const [linkEdit,   setLinkEdit]   = useState(null);
  const [linkNombre, setLinkNombre] = useState('');
  const [linkUrl,    setLinkUrl]    = useState('');
  const [linkCat,    setLinkCat]    = useState('otro');
  const [linkDesc,   setLinkDesc]   = useState('');
  const [linkSaving, setLinkSaving] = useState(false);

  const [dlgDeleteArchivo, setDlgDeleteArchivo] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState(null);
  const [dlgDeleteEnlace, setDlgDeleteEnlace] = useState(false);
  const [enlaceAEliminar, setEnlaceAEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // PDF Preview
  const [pdfUrl,  setPdfUrl]  = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  // ── Descarga autenticada (blob) ──────────────────────────────────────────────
  const handleDownload = async (idArchivo, nombreOriginal) => {
    try {
      const resp = await apiClient.get('/campus/archivos/descargar', {
        params: { id_archivo: idArchivo },
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', nombreOriginal || `archivo_${idArchivo}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { handleErrorMessages('Error al descargar archivo', e); }
  };

  const handlePreview = async (idArchivo) => {
    try {
      const resp = await apiClient.get('/campus/archivos/descargar', {
        params: { id_archivo: idArchivo },
        responseType: 'blob',
      });
      const blob    = new Blob([resp.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(blobUrl);
      setPdfOpen(true);
    } catch (e) { handleErrorMessages('Error al cargar vista previa', e); }
  };

  const handleClosePdf = () => {
    setPdfOpen(false);
    if (pdfUrl) { window.URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
  };

  // Abrir tab indicado desde el dashboard (navigate state)
  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTabIndex(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pr, ar, en] = await Promise.all([
        proyectosListar(),
        archivosListar({ id_proyecto: id }),
        enlacesListar({ id_proyecto: id }),
      ]);
      setProyecto((pr || []).find(p => String(p.id_proyecto) === String(id)) || null);
      setArchivos(ar || []);
      setEnlaces(en  || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Upload ────────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile || !uploadNombre) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo',     uploadFile);
      fd.append('id_proyecto', id);
      fd.append('modulo',      uploadModulo);
      fd.append('nombre',      uploadNombre);
      fd.append('descripcion', uploadDesc);
      await archivosSubir(fd);
      toastSuccess('Archivo subido correctamente');
      setUploadOpen(false); setUploadFile(null); setUploadNombre(''); setUploadDesc('');
      setArchivos(await archivosListar({ id_proyecto: id }) || []);
    } catch (e) { handleErrorMessages('Error al subir archivo', e); }
    finally { setUploading(false); }
  };

  const openDeleteArchivo = (archivo) => {
    setArchivoAEliminar(archivo);
    setDlgDeleteArchivo(true);
  };

  const cancelDeleteArchivo = () => {
    setDlgDeleteArchivo(false);
    setArchivoAEliminar(null);
  };

  const confirmDeleteArchivo = async () => {
    if (!archivoAEliminar?.id_archivo) return;
    setDeleting(true);
    try {
      await archivosEliminar({ id_archivo: archivoAEliminar.id_archivo });
      toastSuccess('Archivo eliminado');
      setArchivos(prev => prev.filter(a => a.id_archivo !== archivoAEliminar.id_archivo));
      cancelDeleteArchivo();
    } catch (e) { handleErrorMessages('Error al eliminar', e); }
    finally { setDeleting(false); }
  };

  // ── Links ────────────────────────────────────────────────────────────────────
  const openLinkDialog = (enlace = null) => {
    setLinkEdit(enlace);
    setLinkNombre(enlace?.nombre || '');
    setLinkUrl(enlace?.url || '');
    setLinkCat(enlace?.categoria || 'otro');
    setLinkDesc(enlace?.descripcion || '');
    setLinkOpen(true);
  };

  const handleSaveLink = async () => {
    if (!linkNombre || !linkUrl) return;
    setLinkSaving(true);
    try {
      if (linkEdit) {
        await enlacesActualizar({ id_enlace: linkEdit.id_enlace, nombre: linkNombre, url: linkUrl, categoria: linkCat, descripcion: linkDesc });
        toastSuccess('Enlace actualizado');
      } else {
        await enlacesCrear({ id_proyecto: id, nombre: linkNombre, url: linkUrl, categoria: linkCat, descripcion: linkDesc });
        toastSuccess('Enlace creado');
      }
      setLinkOpen(false);
      setEnlaces(await enlacesListar({ id_proyecto: id }) || []);
    } catch (e) { handleErrorMessages('Error al guardar enlace', e); }
    finally { setLinkSaving(false); }
  };

  const openDeleteEnlace = (enlace) => {
    setEnlaceAEliminar(enlace);
    setDlgDeleteEnlace(true);
  };

  const cancelDeleteEnlace = () => {
    setDlgDeleteEnlace(false);
    setEnlaceAEliminar(null);
  };

  const confirmDeleteEnlace = async () => {
    if (!enlaceAEliminar?.id_enlace) return;
    setDeleting(true);
    try {
      await enlacesEliminar({ id_enlace: enlaceAEliminar.id_enlace });
      toastSuccess('Enlace eliminado');
      setEnlaces(prev => prev.filter(e => e.id_enlace !== enlaceAEliminar.id_enlace));
      cancelDeleteEnlace();
    } catch (e) { handleErrorMessages('Error al eliminar', e); }
    finally { setDeleting(false); }
  };

  // ─── Datos computados ────────────────────────────────────────────────────────
  const currentTab        = TABS[tabIndex];
  const archivosFiltrados = currentTab.modulo ? archivos.filter(a => a.modulo === currentTab.modulo) : [];
  const estado            = proyecto ? (ESTADO_CONFIG[proyecto.estado] || ESTADO_CONFIG.en_progreso) : null;

  // ─── Estados de carga ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!proyecto) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Proyecto no encontrado o sin acceso.</Alert>
        <Button onClick={() => navigate('/campus/dashboard')} sx={{ mt: 2 }}>Volver</Button>
      </Box>
    );
  }

  return (
    <PageRoot>

      {/* ══ HEADER COMPACTO ══════════════════════════════════════════════════════ */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, pb: 0, flexShrink: 0 }}>
        <CompactHeader elevation={0}>
          {/* Botón volver */}
          <IconButton
            size="small"
            onClick={() => navigate('/campus/dashboard')}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Nombre + estado + fecha */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ lineHeight: 1.1, fontSize: 15 }}>
              {proyecto.nombre}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3, flexWrap: 'nowrap' }}>
              {estado && (
                <Chip
                  label={estado.label}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 600, fontSize: 10, height: 18 }}
                />
              )}
              {(proyecto.fecha_inicio || proyecto.fecha_entrega) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <CalendarTodayIcon sx={{ fontSize: 11, opacity: 0.8 }} />
                  <Typography variant="caption" sx={{ opacity: 0.85, fontSize: 11 }}>
                    {proyecto.fecha_inicio && proyecto.fecha_entrega
                      ? `${formatDate(proyecto.fecha_inicio)} → ${formatDate(proyecto.fecha_entrega)}`
                      : proyecto.fecha_entrega
                        ? `Entrega: ${formatDate(proyecto.fecha_entrega)}`
                        : `Inicio: ${formatDate(proyecto.fecha_inicio)}`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Barra de progreso */}
          <Box sx={{ minWidth: 130, display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 10 }}>Progreso</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>
                {proyecto.progreso || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={proyecto.progreso || 0}
              sx={{
                height: 5, borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.25)',
                '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: '#fff' },
              }}
            />
          </Box>

          {/* Botón Agenda */}
          <Tooltip title="Agenda / Gantt">
            <IconButton
              size="small"
              onClick={() => navigate(`/campus/proyecto/${id}/agenda`)}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', flexShrink: 0,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}
            >
              <EventNoteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Botón admin subir / agregar enlace (contextual) */}
          {isAdmin && (
            <Tooltip title={currentTab.key === 'repositorios' ? 'Agregar enlace' : 'Subir archivo'}>
              <IconButton
                size="small"
                onClick={() => {
                  if (currentTab.key === 'repositorios') openLinkDialog();
                  else { setUploadModulo(currentTab.modulo || 'documentos'); setUploadOpen(true); }
                }}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', flexShrink: 0,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </CompactHeader>

        {/* Tabs pegados al header */}
        <StyledTabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((t, i) => (
            <StyledTab
              key={i}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  {t.label}
                  {t.modulo && (
                    <Chip
                      label={archivos.filter(a => a.modulo === t.modulo).length}
                      size="small"
                      sx={{ height: 16, fontSize: 10, bgcolor: tabIndex === i ? '#e3f2fd' : '#f0f4f8',
                            color: tabIndex === i ? '#1976d2' : '#607d8b', fontWeight: 700 }}
                    />
                  )}
                  {t.key === 'repositorios' && (
                    <Chip
                      label={enlaces.length}
                      size="small"
                      sx={{ height: 16, fontSize: 10, bgcolor: tabIndex === i ? '#e3f2fd' : '#f0f4f8',
                            color: tabIndex === i ? '#1976d2' : '#607d8b', fontWeight: 700 }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </StyledTabs>
      </Box>

      {/* ══ CONTENIDO CON SCROLL INTERNO ════════════════════════════════════════ */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, md: 2 }, pt: { xs: 1.5, md: 1.5 } }}>

        {currentTab.key === 'repositorios' ? (
          /* ── Repositorios ──────────────────────────────────────────────────── */
          <>
            {/* Barra de acción siempre visible para admin */}
            {isAdmin && (
              <Paper sx={{
                borderRadius: 1, px: 2, py: 1, mb: 1.5, display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'none', border: '1px dashed #bbdefb', bgcolor: '#f0f7ff',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                  <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 600, fontSize: 12 }}>
                    {enlaces.length} enlace{enlaces.length !== 1 ? 's' : ''} agregado{enlaces.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Button
                  size="small" variant="contained" startIcon={<AddIcon />}
                  onClick={() => openLinkDialog()}
                  sx={{ borderRadius: 7, textTransform: 'none', fontSize: 12, py: 0.4 }}
                >
                  Agregar enlace
                </Button>
              </Paper>
            )}

            {enlaces.length === 0 ? (
              <Paper sx={{ borderRadius: 1, p: 4, textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                <LinkIcon sx={{ fontSize: 40, color: '#b0bec5', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">No hay repositorios ni enlaces agregados.</Typography>
                {!isAdmin && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                    Contacta al administrador para agregar enlaces.
                  </Typography>
                )}
              </Paper>
            ) : (
              <Grid container spacing={1.5}>
                {enlaces.map((en) => {
                  const catCfg = CATEGORIA_ICONO[en.categoria] || CATEGORIA_ICONO.otro;
                  const CatIcon = catCfg.icon;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={en.id_enlace}>
                      <LinkCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 9, bgcolor: catCfg.bg,
                                     display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CatIcon sx={{ color: catCfg.color, fontSize: 18 }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: 13 }}>
                              {en.nombre}
                            </Typography>
                            <Chip label={en.categoria} size="small"
                              sx={{ height: 16, fontSize: 10, mt: 0.2 }} />
                          </Box>
                          {isAdmin && (
                            <Box sx={{ display: 'flex', flexShrink: 0 }}>
                              <IconButton size="small" onClick={() => openLinkDialog(en)}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => openDeleteEnlace(en)}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                        {en.descripcion && (
                          <Typography variant="caption" color="text.secondary"
                            sx={{ display: 'block', mb: 0.8, fontSize: 12 }}>
                            {en.descripcion}
                          </Typography>
                        )}
                        <Typography variant="caption"
                          sx={{ display: 'block', bgcolor: '#f5f7fa', borderRadius: 6, px: 1, py: 0.5,
                                fontFamily: 'monospace', wordBreak: 'break-all', fontSize: 11, color: '#1976d2', mb: 1 }}>
                          {en.url}
                        </Typography>
                        <Button
                          size="small" variant="contained" startIcon={<OpenInNewIcon />}
                          href={en.url} target="_blank" rel="noopener noreferrer"
                          sx={{ borderRadius: 7, textTransform: 'none', fontSize: 11, py: 0.3 }}
                        >
                          Abrir
                        </Button>
                      </LinkCard>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        ) : (
          /* ── Archivos ──────────────────────────────────────────────────────── */
          <>
            {/* Barra de acción siempre visible para admin */}
            {isAdmin && (
              <Paper sx={{
                borderRadius: 1, px: 2, py: 1, mb: 1.5, display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'none', border: '1px dashed #bbdefb', bgcolor: '#f0f7ff',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsertDriveFileIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                  <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 600, fontSize: 12 }}>
                    {archivosFiltrados.length} archivo{archivosFiltrados.length !== 1 ? 's' : ''} en {currentTab.label}
                  </Typography>
                </Box>
                <Button
                  size="small" variant="contained" startIcon={<UploadFileIcon />}
                  onClick={() => { setUploadModulo(currentTab.modulo); setUploadOpen(true); }}
                  sx={{ borderRadius: 7, textTransform: 'none', fontSize: 12, py: 0.4 }}
                >
                  Subir archivo
                </Button>
              </Paper>
            )}

            {archivosFiltrados.length === 0 ? (
              <Paper sx={{ borderRadius: 1, p: 4, textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
                <InsertDriveFileIcon sx={{ fontSize: 40, color: '#b0bec5', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">No hay archivos en este módulo.</Typography>
                {!isAdmin && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                    Contacta al administrador para subir archivos.
                  </Typography>
                )}
              </Paper>
            ) : (
              <Grid container spacing={1.5}>
                {archivosFiltrados.map((a) => {
                  const fc      = getFileIcon(a.extension);
                  const FileIco = fc.icon;
                  const isPdf   = a.extension?.toLowerCase() === 'pdf';
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={a.id_archivo}>
                      <FileCard>
                        {/* Cabecera de la tarjeta */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 0.8 }}>
                          <Box sx={{ width: 38, height: 38, borderRadius: 10, bgcolor: fc.bg,
                                     display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileIco sx={{ color: fc.color, fontSize: 20 }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Tooltip title={a.nombre}>
                              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: 13 }}>
                                {a.nombre}
                              </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                              {a.extension?.toUpperCase()} · {formatSize(a.tamano)}
                            </Typography>
                          </Box>
                          {isAdmin && (
                            <IconButton size="small" color="error" onClick={() => openDeleteArchivo(a)}>
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>

                        {/* Descripción */}
                        {a.descripcion && (
                          <Typography variant="caption" color="text.secondary"
                            sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden', fontSize: 12, mb: 0.8 }}>
                            {a.descripcion}
                          </Typography>
                        )}

                        {/* Meta */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                            {formatDate(a.created_at)}
                          </Typography>
                          {a.subido_por && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                              Por: {a.subido_por}
                            </Typography>
                          )}
                        </Box>

                        {/* Acciones */}
                        <Box sx={{ display: 'flex', gap: 0.8, mt: 0.5 }}>
                          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(a.id_archivo, a.nombre_original || a.nombre)}
                            sx={{ borderRadius: 7, textTransform: 'none', fontSize: 11, py: 0.3, px: 1.5 }}>
                            Descargar
                          </Button>
                          {isPdf && (
                            <Button size="small" variant="text" startIcon={<VisibilityIcon />}
                              onClick={() => handlePreview(a.id_archivo)}
                              sx={{ borderRadius: 7, textTransform: 'none', fontSize: 11, py: 0.3, px: 1.5 }}>
                              Ver
                            </Button>
                          )}
                        </Box>
                      </FileCard>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* ══ DIALOGS ═══════════════════════════════════════════════════════════════ */}

      {/* Upload */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Subir archivo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Módulo</InputLabel>
              <Select value={uploadModulo} label="Módulo" onChange={e => setUploadModulo(e.target.value)}>
                <MenuItem value="documentos">Documentos</MenuItem>
                <MenuItem value="boletas">Boletas</MenuItem>
                <MenuItem value="presentaciones">Presentaciones</MenuItem>
                <MenuItem value="manuales">Manuales</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Nombre del archivo" value={uploadNombre}
              onChange={e => setUploadNombre(e.target.value)} fullWidth size="small" required />
            <TextField label="Descripción (opcional)" value={uploadDesc}
              onChange={e => setUploadDesc(e.target.value)} fullWidth size="small" multiline rows={2} />
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}
              sx={{ borderRadius: 8, textTransform: 'none', borderStyle: 'dashed', py: 2 }}>
              {uploadFile ? uploadFile.name : 'Seleccionar archivo (máx. 50MB)'}
              <input type="file" hidden onChange={e => setUploadFile(e.target.files[0])} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadOpen(false)} sx={{ borderRadius: 8, textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload}
            disabled={uploading || !uploadFile || !uploadNombre}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            {uploading ? <CircularProgress size={18} color="inherit" /> : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link */}
      <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{linkEdit ? 'Editar enlace' : 'Agregar enlace'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre" value={linkNombre} onChange={e => setLinkNombre(e.target.value)} fullWidth size="small" required />
            <TextField label="URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} fullWidth size="small" required placeholder="https://..." />
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select value={linkCat} label="Categoría" onChange={e => setLinkCat(e.target.value)}>
                {['github','gitlab','hosting','dominio','figma','drive','api','servidor','panel','otro'].map(c => (
                  <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Descripción (opcional)" value={linkDesc} onChange={e => setLinkDesc(e.target.value)} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLinkOpen(false)} sx={{ borderRadius: 8, textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveLink}
            disabled={linkSaving || !linkNombre || !linkUrl}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            {linkSaving ? <CircularProgress size={18} color="inherit" /> : (linkEdit ? 'Guardar' : 'Agregar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar eliminar archivo */}
      <Dialog open={dlgDeleteArchivo} onClose={cancelDeleteArchivo} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
          <DeleteIcon />
          Eliminar archivo
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Eliminar el archivo <strong>{archivoAEliminar?.nombre}</strong>?
          </Typography>
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1.5 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDeleteArchivo} disabled={deleting} sx={{ borderRadius: 8, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmDeleteArchivo} disabled={deleting}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar eliminar enlace */}
      <Dialog open={dlgDeleteEnlace} onClose={cancelDeleteEnlace} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
          <DeleteIcon />
          Eliminar enlace
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Eliminar el enlace <strong>{enlaceAEliminar?.nombre}</strong>?
          </Typography>
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1.5 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDeleteEnlace} disabled={deleting} sx={{ borderRadius: 8, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={confirmDeleteEnlace} disabled={deleting}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Preview */}
      <Dialog open={pdfOpen} onClose={handleClosePdf} maxWidth="lg" fullWidth
        PaperProps={{ sx: { height: '90vh', m: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, py: 1.5, borderBottom: '1px solid #e3eaf3' }}>
          Vista previa del documento
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden', flex: 1 }}>
          {pdfUrl && (
            <iframe src={pdfUrl} width="100%" height="100%"
              style={{ border: 'none', display: 'block', minHeight: '70vh' }}
              title="PDF preview" />
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e3eaf3' }}>
          <Button onClick={handleClosePdf} sx={{ borderRadius: 8, textTransform: 'none' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </PageRoot>
  );
};

export default ProyectoDetalle;
