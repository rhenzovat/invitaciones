import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import {
  Box, Typography, Paper, Avatar, Chip, LinearProgress, Tooltip,
  CircularProgress, Button, Stack, IconButton, Drawer, TextField, MenuItem, Select,
  FormControl, InputLabel, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Collapse, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import FolderIcon          from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon            from '@mui/icons-material/Link';
import ReceiptIcon         from '@mui/icons-material/Receipt';
import AddIcon             from '@mui/icons-material/Add';
import EditIcon            from '@mui/icons-material/Edit';
import SecurityIcon        from '@mui/icons-material/Security';
import PictureAsPdfIcon    from '@mui/icons-material/PictureAsPdf';
import StorageIcon         from '@mui/icons-material/Storage';
import VideoLibraryIcon    from '@mui/icons-material/VideoLibrary';
import CalendarTodayIcon   from '@mui/icons-material/CalendarToday';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon  from '@mui/icons-material/HourglassEmpty';
import PauseCircleIcon     from '@mui/icons-material/PauseCircle';
import RateReviewIcon      from '@mui/icons-material/RateReview';
import CloseIcon           from '@mui/icons-material/Close';
import SaveIcon            from '@mui/icons-material/Save';
import OpenInNewIcon       from '@mui/icons-material/OpenInNew';
import PersonIcon            from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp';
import PersonAddIcon         from '@mui/icons-material/PersonAdd';

import useAuth from '../../hooks/useAuth';
import CampusClientesAdminSection from './CampusClientesAdminSection';
import {
  dashboardStats, proyectosListar,
  proyectosCrear, proyectosActualizar,
} from '../../api/campus.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';

// ─── Animaciones ─────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageRoot = styled(Box)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f0f4f8',
  animation: `${fadeIn} 0.3s ease`,
  overflow: 'hidden',
});

// Header compacto — tira delgada
const CompactBanner = styled(Paper)(() => ({
  borderRadius: 6,
  background: 'linear-gradient(120deg, #1565c0 0%, #1976d2 55%, #1e88e5 100%)',
  color: '#fff',
  padding: '8px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  boxShadow: '0 2px 10px rgba(21,101,192,0.22)',
  position: 'relative',
  overflow: 'hidden',
  flexShrink: 0,
  '&::after': {
    content: '""', position: 'absolute',
    top: -30, right: -30, width: 100, height: 100,
    borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  borderRadius: 6,
  padding: theme.spacing(1.5, 2),
  boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  transition: 'transform 0.18s, box-shadow 0.18s',
  height: '100%',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.11)' },
}));

const StatIcon = styled(Box)(({ bg }) => ({
  width: 40, height: 40, borderRadius: 10,
  backgroundColor: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}));

const ProjectCard = styled(Paper)(({ theme }) => ({
  borderRadius: 6,
  padding: theme.spacing(1.5, 2),
  boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  cursor: 'pointer',
  transition: 'transform 0.18s, box-shadow 0.18s',
  position: 'relative',
  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 22px rgba(0,0,0,0.12)' },
  '&:hover .edit-pen': { opacity: 1 },
}));

const SideCard = styled(Paper)(({ theme }) => ({
  borderRadius: 6,
  padding: theme.spacing(1.5, 2),
  boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
  marginBottom: theme.spacing(1.5),
}));

// Zona editable — borde dashed al hover para el admin
const EditZone = ({ children, onEdit, label, active = false }) => {
  const [hover, setHover] = useState(false);
  return (
    <Box
      sx={{
        position: 'relative', borderRadius: '6px',
        border: hover || active ? '2px dashed rgba(25,118,210,0.55)' : '2px dashed transparent',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      {(hover || active) && onEdit && (
        <Tooltip title={label || 'Editar'} placement="top" arrow>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="edit-pen"
            sx={{
              position: 'absolute', top: 6, right: 6, zIndex: 10,
              width: 24, height: 24,
              bgcolor: active ? '#1976d2' : 'rgba(25,118,210,0.85)',
              color: '#fff',
              opacity: 1,
              transition: 'all 0.15s',
              '&:hover': { bgcolor: '#1976d2', transform: 'scale(1.15)' },
            }}
          >
            <EditIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO_CFG = {
  en_progreso: { label: 'En progreso', color: '#1976d2', bg: '#e3f2fd', icon: HourglassEmptyIcon },
  en_revision: { label: 'En revisión', color: '#ed6c02', bg: '#fff3e0', icon: RateReviewIcon    },
  completado:  { label: 'Completado',  color: '#2e7d32', bg: '#e8f5e9', icon: CheckCircleIcon   },
  pausado:     { label: 'Pausado',     color: '#757575', bg: '#f5f5f5', icon: PauseCircleIcon   },
};

const ICONO_CFG = {
  web:       { bg: '#e3f2fd', color: '#1976d2' },
  erp:       { bg: '#fce4ec', color: '#c62828' },
  ecommerce: { bg: '#e8f5e9', color: '#2e7d32' },
  education: { bg: '#ede7f6', color: '#4527a0' },
  landing:   { bg: '#fff3e0', color: '#e65100' },
  api:       { bg: '#e0f7fa', color: '#006064' },
};

const QUICK_LINKS = [
  { icon: PictureAsPdfIcon, label: 'Documentos PDF',    color: '#c62828', bg: '#fdecea', tab: 0 },
  { icon: LinkIcon,         label: 'Repositorios',       color: '#1565c0', bg: '#e3f2fd', tab: 1 },
  { icon: ReceiptIcon,      label: 'Boletas y Facturas', color: '#e65100', bg: '#fff3e0', tab: 2 },
  { icon: VideoLibraryIcon, label: 'Videos',             color: '#4527a0', bg: '#ede7f6', tab: 4 },
];

const ESTADO_OPTS = ['en_progreso', 'en_revision', 'completado', 'pausado'];
const ICONO_OPTS  = ['web', 'erp', 'ecommerce', 'education', 'landing', 'api'];

const hoyISO = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM = {
  nombre: '', descripcion: '', estado: 'en_progreso', icono: 'web', color: '#2196f3',
  fecha_inicio: hoyISO(), fecha_entrega: '', progreso: 0,
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}
function timeAgo(d) {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return 'hace unos seg.';
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CampusDashboard = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isAdmin   = user?.es_administrador_principal == 1;

  const [stats,     setStats]     = useState({ proyectos: 0, archivos: 0, enlaces: 0, boletas: 0 });
  const [proyectos, setProyectos] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Drawer edición
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [editProyecto,  setEditProyecto]  = useState(null); // null = crear nuevo
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const st = await dashboardStats();
        setStats(st || { proyectos: 0, archivos: 0, enlaces: 0, boletas: 0 });
      } else {
        const [st, pr] = await Promise.all([
          dashboardStats(), proyectosListar(),
        ]);
        setStats(st  || { proyectos: 0, archivos: 0, enlaces: 0, boletas: 0 });
        setProyectos(pr || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Drawer helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditProyecto(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (p) => {
    setEditProyecto(p);
    setForm({
      nombre: p.nombre || '', descripcion: p.descripcion || '',
      estado: p.estado || 'en_progreso', icono: p.icono || 'web',
      color: p.color || '#2196f3',
      fecha_inicio: p.fecha_inicio ? String(p.fecha_inicio).slice(0, 10)
        : (p.created_at ? String(p.created_at).slice(0, 10) : ''),
      fecha_entrega: p.fecha_entrega ? String(p.fecha_entrega).slice(0, 10) : '',
      progreso: p.progreso || 0,
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    if (!form.fecha_inicio || !form.fecha_entrega) {
      handleErrorMessages('Proyecto', 'Indica fecha de inicio y de entrega.', true);
      return;
    }
    if (form.fecha_entrega < form.fecha_inicio) {
      handleErrorMessages('Proyecto', 'La entrega debe ser igual o posterior al inicio.', true);
      return;
    }
    setSaving(true);
    try {
      if (editProyecto) {
        await proyectosActualizar({ id_proyecto: editProyecto.id_proyecto, ...form });
        toastSuccess('Proyecto actualizado');
      } else {
        await proyectosCrear(form);
        toastSuccess('Proyecto creado');
      }
      setDrawerOpen(false);
      loadData();
    } catch (e) { handleErrorMessages('Error al guardar', e); }
    finally { setSaving(false); }
  };

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const firstId = proyectos[0]?.id_proyecto;

  const statCards = [
    { label: 'Proyectos activos',    value: stats.proyectos,    icon: FolderIcon,          color: '#1976d2', bg: '#e3f2fd',
      onClick: () => document.getElementById(isAdmin ? 'clientes-proyectos' : 'mis-proyectos')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Archivos disponibles', value: stats.archivos,     icon: InsertDriveFileIcon, color: '#0097a7', bg: '#e0f7fa',
      onClick: () => firstId && navigate(`/campus/proyecto/${firstId}`, { state: { tab: 0 } }) },
    { label: 'Repositorios',         value: stats.enlaces,      icon: LinkIcon,            color: '#388e3c', bg: '#e8f5e9',
      onClick: () => firstId && navigate(`/campus/proyecto/${firstId}`, { state: { tab: 1 } }) },
    { label: 'Facturas / Boletas',   value: stats.boletas ?? 0, icon: ReceiptIcon,         color: '#f57c00', bg: '#fff3e0',
      onClick: () => firstId && navigate(`/campus/proyecto/${firstId}`, { state: { tab: 2 } }) },
  ];

  return (
    <PageRoot>
      {/* ══ CONTENIDO PRINCIPAL ══════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

        {/* ── Header compacto ─────────────────────────────────────────────── */}
        <CompactBanner elevation={0}>
          <Avatar
            src={user?.avatar || undefined}
            sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.55)', fontSize: 14, flexShrink: 0 }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.1, fontSize: 15 }}>
              Bienvenido de vuelta, {user?.name?.split(' ')[0] || 'Usuario'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: 11 }}>
              Portal de Documentos &nbsp;·&nbsp;
              <span style={{ textTransform: 'capitalize' }}>{today}</span>
            </Typography>
          </Box>

          {isAdmin && (
            <Tooltip title="Gestionar clientes">
              <IconButton size="small" onClick={() => document.getElementById('clientes-proyectos')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mr: 0.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>
                <PersonAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Chip
            icon={<SecurityIcon sx={{ fontSize: 13, color: '#90caf9 !important' }} />}
            label="Seguro"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.14)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 11, height: 22, flexShrink: 0,
            }}
          />
        </CompactBanner>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            {/* ── 4 Stat Cards — fila horizontal compacta ─────────────────── */}
            <Grid container spacing={1.5}>
              {statCards.map((sc, i) => {
                const Icon = sc.icon;
                return (
                  <Grid size={{ xs: 6, md: 3 }} key={i}>
                    <StatCard onClick={sc.onClick}
                      sx={{ cursor: sc.onClick ? 'pointer' : 'default', p: '10px 14px', gap: 1.2 }}>
                      {/* Icono */}
                      <Box sx={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        bgcolor: sc.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 3px 8px ${sc.color}22`,
                      }}>
                        <Icon sx={{ color: sc.color, fontSize: 20 }} />
                      </Box>
                      {/* Número + etiqueta */}
                      <Box>
                        <Typography fontWeight={700} lineHeight={1} sx={{ fontSize: 20, color: 'text.primary' }}>
                          {sc.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.3, display: 'block' }}>
                          {sc.label}
                        </Typography>
                      </Box>
                    </StatCard>
                  </Grid>
                );
              })}
            </Grid>

            {/* ── Cuerpo principal ─────────────────────────────────────────── */}
            <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0, alignItems: 'flex-start' }}>

              {/* Proyectos / Clientes — ancho completo para admin */}
              <Grid size={{ xs: 12, md: isAdmin ? 12 : 8 }} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {isAdmin ? (
                  <CampusClientesAdminSection onGestionar={() => navigate('/campus/admin')} />
                ) : (
                  /* ── Vista Cliente: tarjetas de proyectos ── */
                  <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography id="mis-proyectos" variant="subtitle1" fontWeight={700} sx={{ fontSize: 14 }}>
                    Mis Proyectos
                  </Typography>
                </Box>

                {proyectos.length === 0 ? (
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: '6px',
                      bgcolor: '#fff',
                      border: '1px solid #e3eaf3',
                      p: 3,
                      textAlign: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 40, color: '#b0bec5', mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">No hay proyectos asignados aún.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1.5}>
                    {proyectos.map((p) => {
                      const est   = ESTADO_CFG[p.estado] || ESTADO_CFG.en_progreso;
                      const ico   = ICONO_CFG[p.icono]   || ICONO_CFG.web;
                      const EstIco = est.icon;
                      return (
                        <Grid size={{ xs: 12, sm: 6 }} key={p.id_proyecto}>
                          <EditZone
                            onEdit={isAdmin ? () => openEdit(p) : null}
                            label="Editar proyecto"
                          >
                            <ProjectCard onClick={() => navigate(`/campus/proyecto/${p.id_proyecto}`)}>
                              {/* Cabecera */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                                <Box sx={{
                                  width: 36, height: 36, borderRadius: 9,
                                  bgcolor: ico.bg, display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <FolderIcon sx={{ color: ico.color, fontSize: 18 }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: 13 }}>
                                    {p.nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                    {timeAgo(p.updated_at)}
                                  </Typography>
                                </Box>
                                <Chip
                                  icon={<EstIco sx={{ fontSize: '11px !important', color: `${est.color} !important` }} />}
                                  label={est.label}
                                  size="small"
                                  sx={{ bgcolor: est.bg, color: est.color, fontWeight: 600, fontSize: 10, height: 20, flexShrink: 0 }}
                                />
                              </Box>

                              {/* Descripción */}
                              <Typography variant="caption" color="text.secondary"
                                sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, fontSize: 12 }}>
                                {p.descripcion || 'Sin descripción'}
                              </Typography>

                              {/* Progreso */}
                              <Box sx={{ mb: 0.8 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Progreso</Typography>
                                  <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: 11 }}>
                                    {p.progreso || 0}%
                                  </Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={p.progreso || 0}
                                  sx={{
                                    height: 5, borderRadius: 3, bgcolor: '#e3eaf3',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      bgcolor: p.progreso >= 100 ? '#2e7d32' : '#1976d2',
                                    },
                                  }}
                                />
                              </Box>

                              {/* Footer */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                  <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                    {p.fecha_inicio && p.fecha_entrega
                                      ? `${fmtDate(p.fecha_inicio)} → ${fmtDate(p.fecha_entrega)}`
                                      : fmtDate(p.fecha_entrega || p.fecha_inicio)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                  <InsertDriveFileIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                    {p.archivos_count || 0} archivos
                                  </Typography>
                                </Box>
                              </Box>
                            </ProjectCard>
                          </EditZone>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
                  </>
                )}
              </Grid>

              {/* Sidebar derecho — solo vista cliente (almacenamiento) */}
              {!isAdmin && (
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>


                {/* Almacenamiento */}
                <SideCard sx={{ mb: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 13 }}>Almacenamiento</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                      {stats.archivos} / 100
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <StorageIcon sx={{ color: '#1976d2', fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                      {stats.archivos} archivo{stats.archivos !== 1 ? 's' : ''} subidos
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate"
                    value={Math.min((stats.archivos / 100) * 100, 100)}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#e3eaf3',
                          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#1976d2' } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1.2, mt: 0.8 }}>
                    {[{ label: 'Docs', color: '#1976d2' }, { label: 'Videos', color: '#0097a7' }, { label: 'Otros', color: '#388e3c' }].map(l => (
                      <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: l.color }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{l.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </SideCard>

              </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>

      {/* ══ DRAWER — Panel lateral de edición ══════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 340, p: 0 } }}
      >
        {/* Header del drawer */}
        <Box sx={{
          background: 'linear-gradient(120deg, #1565c0 0%, #1976d2 100%)',
          color: '#fff', px: 2.5, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15 }}>
              {editProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: 11 }}>
              {editProyecto ? editProyecto.nombre : 'Completa los campos y guarda'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Formulario */}
        <Box sx={{ p: 2.5, overflow: 'auto', flex: 1 }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre del proyecto *"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              fullWidth size="small" multiline rows={2}
            />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select value={form.estado} label="Estado"
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {ESTADO_OPTS.map(e => (
                      <MenuItem key={e} value={e}>{ESTADO_CFG[e]?.label || e}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ícono</InputLabel>
                  <Select value={form.icono} label="Ícono"
                    onChange={e => setForm(f => ({ ...f, icono: e.target.value }))}>
                    {ICONO_OPTS.map(ic => (
                      <MenuItem key={ic} value={ic}>{ic.charAt(0).toUpperCase() + ic.slice(1)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Fecha inicio *" type="date" required
                  value={form.fecha_inicio}
                  onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                  fullWidth size="small" InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Fecha entrega *" type="date" required
                  value={form.fecha_entrega}
                  inputProps={{ min: form.fecha_inicio || undefined }}
                  onChange={e => setForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                  fullWidth size="small" InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Progreso (%)" type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={form.progreso}
                  onChange={e => setForm(f => ({ ...f, progreso: parseInt(e.target.value, 10) || 0 }))}
                  fullWidth size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Color:</Typography>
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    style={{ width: 40, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary">{form.color}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Box>

        <Divider />

        {/* Acciones */}
        <Box sx={{ px: 2.5, py: 2, display: 'flex', gap: 1.5 }}>
          <Button fullWidth variant="outlined" onClick={() => setDrawerOpen(false)}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" startIcon={<SaveIcon />}
            onClick={handleSave} disabled={saving || !form.nombre.trim()}
            sx={{ borderRadius: 8, textTransform: 'none' }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </Box>
      </Drawer>
    </PageRoot>
  );
};

export default CampusDashboard;
