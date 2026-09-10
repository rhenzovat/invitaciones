import { useEffect, useState, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import {
  Box, Typography, Paper, Tabs, Tab, Button, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel, Stack,
  Autocomplete, Avatar, Alert, Tooltip, LinearProgress,
  Collapse,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp';
import Grid from '@mui/material/Grid2';
import AddIcon          from '@mui/icons-material/Add';
import EditIcon         from '@mui/icons-material/Edit';
import DeleteIcon       from '@mui/icons-material/Delete';
import PersonAddIcon    from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import FolderIcon       from '@mui/icons-material/Folder';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import VisibilityIcon   from '@mui/icons-material/Visibility';

import useAuth from '../../hooks/useAuth';
import {
  proyectosListar, proyectosCrear, proyectosActualizar, proyectosEliminar,
  clientesDelProyecto, asignarCliente, desasignarCliente, usuariosListar,
  actividadListar, clientesConProyectos,
} from '../../api/campus.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';
import CampusClientesAdminSection from './CampusClientesAdminSection';

// ─── Animaciones ─────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageRoot = styled(Box)({ minHeight: '100vh', backgroundColor: '#f0f4f8', animation: `${fadeIn} 0.35s ease` });

const HeaderBand = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
  color: '#fff',
  padding: theme.spacing(2.5, 3),
  boxShadow: '0 4px 20px rgba(21,101,192,0.25)',
}));

const StyledTabs = styled(Tabs)({
  backgroundColor: '#fff',
  borderBottom: '1px solid #e3eaf3',
  borderRadius: '0 0 12px 12px',
  overflow: 'hidden',
  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#1976d2' },
});

const StyledTab = styled(Tab)({ textTransform: 'none', fontWeight: 500, fontSize: 14, minHeight: 48 });

const ContentCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  marginTop: theme.spacing(3),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADO_OPTS = ['en_progreso','en_revision','completado','pausado'];
const ICONO_OPTS  = ['web','erp','ecommerce','education','landing','api'];

const ESTADO_CONFIG = {
  en_progreso: { label: 'En progreso', color: '#1976d2', bg: '#e3f2fd' },
  en_revision: { label: 'En revisión', color: '#ed6c02', bg: '#fff3e0' },
  completado:  { label: 'Completado',  color: '#2e7d32', bg: '#e8f5e9' },
  pausado:     { label: 'Pausado',     color: '#757575', bg: '#f5f5f5' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d   = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)    return 'hace unos segundos';
  if (diff < 3600)  return `hace ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)} h`;
  return `hace ${Math.floor(diff/86400)} d`;
}

const hoyISO = () => new Date().toISOString().slice(0, 10);
const ORDEN_PRIORIDAD_OPCIONES = Array.from({ length: 20 }, (_, i) => i + 1);
const snapOrdenPrioridad = (v) => Math.min(20, Math.max(1, Number(v) || 5));

const etiquetaProyectoConCliente = (nombreCliente, nombreProyecto) => {
  const cliente = (nombreCliente || '').trim() || 'Sin cliente';
  const proyecto = (nombreProyecto || '').trim() || 'Proyecto';
  return `${cliente} - ${proyecto}`;
};

const buildProyectosConCliente = (clientes = []) => {
  const items = [];
  clientes.forEach((c) => {
    const nombreCliente = (c.nombre_completo || c.nombre || 'Cliente').trim();
    (c.proyectos || []).forEach((p) => {
      items.push({
        ...p,
        cliente_nombre: nombreCliente,
        cliente_empresa: c.empresa || null,
        etiqueta: etiquetaProyectoConCliente(nombreCliente, p.nombre),
      });
    });
  });
  return items.sort((a, b) => {
    const oa = snapOrdenPrioridad(a.orden_prioridad);
    const ob = snapOrdenPrioridad(b.orden_prioridad);
    if (oa !== ob) return oa - ob;
    return a.etiqueta.localeCompare(b.etiqueta, 'es');
  });
};

/** Lista unificada: proyectos con nombre de cliente para la tabla del tab Proyectos. */
const mergeProyectosConClientes = (proyectos = [], clientes = []) => {
  const porId = new Map();
  buildProyectosConCliente(clientes).forEach((p) => porId.set(p.id_proyecto, p));
  proyectos.forEach((p) => {
    if (!porId.has(p.id_proyecto)) {
      porId.set(p.id_proyecto, {
        ...p,
        cliente_nombre: null,
        etiqueta: etiquetaProyectoConCliente(null, p.nombre),
      });
    }
  });
  return [...porId.values()].sort((a, b) => {
    const oa = snapOrdenPrioridad(a.orden_prioridad);
    const ob = snapOrdenPrioridad(b.orden_prioridad);
    if (oa !== ob) return oa - ob;
    return (a.etiqueta || '').localeCompare(b.etiqueta || '', 'es');
  });
};

const EMPTY_FORM = {
  nombre: '', descripcion: '', estado: 'en_progreso',
  fecha_inicio: hoyISO(), fecha_entrega: '', progreso: 0, orden_prioridad: 5,
  icono: 'web', color: '#2196f3',
};

// ─── Component ───────────────────────────────────────────────────────────────

const CampusAdminPanel = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const isAdmin   = user?.es_administrador_principal == 1;

  const [tabIndex,    setTabIndex]    = useState(0);
  const [proyectos,   setProyectos]   = useState([]);
  const [clientesCRM, setClientesCRM] = useState([]);
  const [actividad,   setActividad]   = useState([]);
  const [usuarios,    setUsuarios]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Project dialog
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editData,    setEditData]    = useState(null);
  const [createForUser,setCreateForUser]= useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);

  // Assignment tab
  const [selProyecto, setSelProyecto] = useState(null);
  const [clientes,    setClientes]    = useState([]);
  const [selUser,     setSelUser]     = useState(null);
  const [assigning,   setAssigning]   = useState(false);
  const [loadingCli,  setLoadingCli]  = useState(false);

  const proyectosAsignacion = useMemo(
    () => buildProyectosConCliente(clientesCRM),
    [clientesCRM]
  );

  const proyectosTabla = useMemo(
    () => mergeProyectosConClientes(proyectos, clientesCRM),
    [proyectos, clientesCRM]
  );

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pr, ac, us, crm] = await Promise.all([
        proyectosListar(),
        actividadListar(),
        usuariosListar(),
        clientesConProyectos(),
      ]);
      setProyectos(pr || []);
      setClientesCRM(crm || []);
      setActividad(ac || []);
      setUsuarios(us || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Project CRUD ─────────────────────────────────────────────────────────────

  const openCreate = (user = null) => {
    setEditData(null);
    setCreateForUser(user);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setCreateForUser(null);
    setEditData(p);
    setForm({
      nombre:        p.nombre,
      descripcion:   p.descripcion || '',
      estado:        p.estado || 'en_progreso',
      fecha_inicio:  p.fecha_inicio ? String(p.fecha_inicio).slice(0, 10)
        : (p.created_at ? String(p.created_at).slice(0, 10) : ''),
      fecha_entrega: p.fecha_entrega ? String(p.fecha_entrega).slice(0, 10) : '',
      progreso:      p.progreso || 0,
      orden_prioridad: snapOrdenPrioridad(p.orden_prioridad),
      icono:         p.icono || 'web',
      color:         p.color || '#2196f3',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre) return;
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
      if (editData) {
        await proyectosActualizar({ ...form, id_proyecto: editData.id_proyecto });
        toastSuccess('Proyecto actualizado');
      } else {
        await proyectosCrear({ ...form, id_user: createForUser?.id || undefined });
        toastSuccess(createForUser ? `Proyecto creado para ${createForUser.name}` : 'Proyecto creado');
      }
      setDialogOpen(false);
      setCreateForUser(null);
      const [pr, crm] = await Promise.all([proyectosListar(), clientesConProyectos()]);
      setProyectos(pr || []);
      setClientesCRM(crm || []);
    } catch (e) {
      handleErrorMessages('Error al guardar proyecto', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id_proyecto) => {
    if (!window.confirm('¿Eliminar este proyecto y todos sus archivos?')) return;
    try {
      await proyectosEliminar({ id_proyecto });
      toastSuccess('Proyecto eliminado');
      setProyectos(prev => prev.filter(p => p.id_proyecto !== id_proyecto));
    } catch (e) {
      handleErrorMessages('Error al eliminar', e);
    }
  };

  // ── Assignment ───────────────────────────────────────────────────────────────

  const loadClientes = async (proyecto) => {
    setSelProyecto(proyecto);
    setLoadingCli(true);
    try {
      const cl = await clientesDelProyecto({ id_proyecto: proyecto.id_proyecto });
      setClientes(cl || []);
    } catch (e) {
      setClientes([]);
    } finally {
      setLoadingCli(false);
    }
  };

  const handleAsignar = async () => {
    if (!selUser || !selProyecto) return;
    setAssigning(true);
    try {
      await asignarCliente({ id_user: selUser.id, id_proyecto: selProyecto.id_proyecto });
      toastSuccess('Cliente asignado');
      setSelUser(null);
      await loadClientes(selProyecto);
    } catch (e) {
      handleErrorMessages('Error al asignar', e);
    } finally {
      setAssigning(false);
    }
  };

  const handleDesasignar = async (userId) => {
    if (!selProyecto) return;
    try {
      await desasignarCliente({ id_user: userId, id_proyecto: selProyecto.id_proyecto });
      toastSuccess('Cliente desasignado');
      await loadClientes(selProyecto);
    } catch (e) {
      handleErrorMessages('Error al desasignar', e);
    }
  };

  // ─── Guard ───────────────────────────────────────────────────────────────────

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Acceso restringido. Solo administradores.</Alert>
        <Button onClick={() => navigate('/campus/dashboard')} sx={{ mt: 2 }}>Volver</Button>
      </Box>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <PageRoot>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
        <HeaderBand elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/campus/dashboard')} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={700}>Panel de Administración</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Campus DeliverBox — Gestión completa</Typography>
            </Box>
          </Box>
        </HeaderBand>

        <StyledTabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
          <StyledTab label="Clientes con Proyectos" />
          <StyledTab label="Proyectos" />
          <StyledTab label="Asignación de Clientes" />
          <StyledTab label="Registro de Actividad" />
        </StyledTabs>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <>
            {tabIndex === 0 && (
              <ContentCard>
                <CampusClientesAdminSection />
              </ContentCard>
            )}

            {/* ── TAB 1: Proyectos ── */}
            {tabIndex === 1 && (
              <ContentCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="h6" fontWeight={700}>Proyectos ({proyectosTabla.length})</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 8, textTransform: 'none' }}>
                    Nuevo proyecto
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, color: '#455a64', borderBottom: '2px solid #e3eaf3' } }}>
                        <TableCell sx={{ minWidth: 280 }}>Nombre</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Progreso</TableCell>
                        <TableCell align="center">Prioridad</TableCell>
                        <TableCell>Inicio → Entrega</TableCell>
                        <TableCell>Archivos</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proyectosTabla.map(p => {
                        const est = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.en_progreso;
                        return (
                          <TableRow key={p.id_proyecto} hover>
                            <TableCell sx={{ minWidth: 280, maxWidth: 420 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <FolderIcon sx={{ fontSize: 18, color: p.color || '#1976d2', mt: 0.2, flexShrink: 0 }} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ fontSize: '0.84rem', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'normal' }}
                                  >
                                    {p.etiqueta}
                                  </Typography>
                                  {p.cliente_empresa && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                                      {p.cliente_empresa}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={est.label} size="small" sx={{ backgroundColor: est.bg, color: est.color, fontWeight: 600, fontSize: 11 }} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 120 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={p.progreso || 0}
                                  sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e3eaf3', '& .MuiLinearProgress-bar': { borderRadius: 3 } }}
                                />
                                <Typography variant="caption" fontWeight={700} sx={{ minWidth: 32 }}>{p.progreso || 0}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={snapOrdenPrioridad(p.orden_prioridad)}
                                size="small"
                                title="Orden de prioridad"
                                sx={{
                                  minWidth: 28,
                                  fontWeight: 700,
                                  bgcolor: snapOrdenPrioridad(p.orden_prioridad) === 1 ? '#ffebee' : '#eceff1',
                                  color: snapOrdenPrioridad(p.orden_prioridad) === 1 ? '#c62828' : '#546e7a',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: 12 }}>
                                {p.fecha_inicio && p.fecha_entrega
                                  ? `${formatDate(p.fecha_inicio)} → ${formatDate(p.fecha_entrega)}`
                                  : formatDate(p.fecha_entrega || p.fecha_inicio)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{p.archivos_count || 0}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <Tooltip title="Ver proyecto">
                                  <IconButton size="small" onClick={() => navigate(`/campus/proyecto/${p.id_proyecto}`)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                  <IconButton size="small" onClick={() => openEdit(p)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <IconButton size="small" color="error" onClick={() => handleDelete(p.id_proyecto)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {proyectosTabla.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No hay proyectos creados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ContentCard>
            )}

            {/* ── TAB 2: Asignación ── */}
            {tabIndex === 2 && (
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <ContentCard sx={{ mt: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Seleccionar Proyecto</Typography>
                    <Stack spacing={1}>
                      {proyectosAsignacion.map(p => (
                        <Tooltip key={p.id_proyecto} title={p.etiqueta} placement="right" arrow>
                          <Button
                            variant={selProyecto?.id_proyecto === p.id_proyecto ? 'contained' : 'outlined'}
                            onClick={() => loadClientes(p)}
                            sx={{
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              borderRadius: 8,
                              borderColor: '#e3eaf3',
                              maxWidth: '100%',
                              overflow: 'hidden',
                            }}
                            startIcon={<FolderIcon sx={{ color: p.color || '#1976d2', flexShrink: 0 }} />}
                          >
                            <Box
                              component="span"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'left',
                              }}
                            >
                              {p.etiqueta}
                            </Box>
                          </Button>
                        </Tooltip>
                      ))}
                      {proyectosAsignacion.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No hay proyectos con clientes CRM.
                        </Typography>
                      )}
                    </Stack>
                  </ContentCard>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <ContentCard sx={{ mt: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      {selProyecto
                        ? `Clientes asignados: ${selProyecto.cliente_nombre || 'Cliente'} · ${selProyecto.nombre}`
                        : 'Selecciona un proyecto'}
                    </Typography>
                    {selProyecto && (
                      <>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                          <Autocomplete
                            options={usuarios}
                            getOptionLabel={u => `${u.name} (${u.email})`}
                            value={selUser}
                            onChange={(_, v) => setSelUser(v)}
                            renderInput={params => <TextField {...params} label="Buscar usuario" size="small" />}
                            renderOption={(props, u) => (
                              <li {...props}>
                                <Avatar src={u.avatar} sx={{ width: 28, height: 28, mr: 1, fontSize: 12 }}>{u.name?.charAt(0)}</Avatar>
                                <Box><Typography variant="body2">{u.name}</Typography><Typography variant="caption" color="text.secondary">{u.email}</Typography></Box>
                              </li>
                            )}
                            sx={{ flex: 1 }}
                            size="small"
                          />
                          <Button
                            variant="contained"
                            startIcon={assigning ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
                            onClick={handleAsignar}
                            disabled={!selUser || assigning}
                            sx={{ borderRadius: 8, textTransform: 'none', whiteSpace: 'nowrap' }}
                          >
                            Asignar
                          </Button>
                        </Box>
                        {loadingCli ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={28} /></Box>
                        ) : clientes.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No hay clientes asignados.</Typography>
                        ) : (
                          <Stack spacing={1}>
                            {clientes.map(c => (
                              <Box
                                key={c.id}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 10, backgroundColor: '#f8faff', border: '1px solid #e3eaf3' }}
                              >
                                <Avatar src={c.avatar} sx={{ width: 36, height: 36, fontSize: 14 }}>{c.name?.charAt(0)}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                                </Box>
                                <Tooltip title="Desasignar">
                                  <IconButton size="small" color="error" onClick={() => handleDesasignar(c.id)}>
                                    <PersonRemoveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </>
                    )}
                  </ContentCard>
                </Grid>
              </Grid>
            )}

            {/* ── TAB 3: Actividad ── */}
            {tabIndex === 3 && (
              <ContentCard>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Registro de Actividad</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, color: '#455a64', borderBottom: '2px solid #e3eaf3' } }}>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Proyecto</TableCell>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Hace</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actividad.map(a => (
                        <TableRow key={a.id_actividad} hover>
                          <TableCell>
                            <Typography variant="body2">{a.descripcion}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={a.tipo} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{a.proyecto?.nombre || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Avatar src={a.user?.avatar} sx={{ width: 24, height: 24, fontSize: 11 }}>{a.user?.name?.charAt(0)}</Avatar>
                              <Typography variant="body2" color="text.secondary">{a.user?.name || '—'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">{timeAgo(a.created_at)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {actividad.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            Sin actividad registrada.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ContentCard>
            )}
          </>
        )}
      </Box>

      {/* ── Project Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setCreateForUser(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editData ? 'Editar proyecto' : createForUser ? `Nuevo proyecto — ${createForUser.name}` : 'Nuevo proyecto'}
        </DialogTitle>
        <DialogContent>
          {createForUser && !editData && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Este proyecto se asignará automáticamente a <strong>{createForUser.name}</strong> ({createForUser.email}).
            </Alert>
          )}
          {!createForUser && !editData && (
            <Autocomplete
              options={usuarios}
              getOptionLabel={u => `${u.name} (${u.email})`}
              onChange={(_, v) => setCreateForUser(v)}
              renderInput={params => <TextField {...params} label="Asignar a cliente (opcional)" size="small" />}
              sx={{ mb: 2 }}
              size="small"
            />
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del proyecto"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              fullWidth size="small" required
            />
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              fullWidth size="small" multiline rows={2}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select value={form.estado} label="Estado" onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {ESTADO_OPTS.map(e => (
                      <MenuItem key={e} value={e}>{ESTADO_CONFIG[e]?.label || e}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Icono</InputLabel>
                  <Select value={form.icono} label="Icono" onChange={e => setForm(f => ({ ...f, icono: e.target.value }))}>
                    {ICONO_OPTS.map(ic => (
                      <MenuItem key={ic} value={ic}>{ic.toUpperCase()}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Fecha inicio *"
                  type="date"
                  required
                  value={form.fecha_inicio}
                  onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                  fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Fecha entrega *"
                  type="date"
                  required
                  value={form.fecha_entrega}
                  inputProps={{ min: form.fecha_inicio || undefined }}
                  onChange={e => setForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                  fullWidth size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Progreso (%)"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={form.progreso}
                  onChange={e => setForm(f => ({ ...f, progreso: parseInt(e.target.value, 10) || 0 }))}
                  fullWidth size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="orden-prioridad-label">Orden de prioridad</InputLabel>
                  <Select
                    labelId="orden-prioridad-label"
                    label="Orden de prioridad"
                    value={form.orden_prioridad ?? 5}
                    onChange={e => setForm(f => ({ ...f, orden_prioridad: e.target.value }))}
                  >
                    {ORDEN_PRIORIDAD_OPCIONES.map(n => (
                      <MenuItem key={n} value={n}>
                        {n}{n === 1 ? ' — máxima prioridad' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Color"
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  fullWidth size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 8, textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.nombre} sx={{ borderRadius: 8, textTransform: 'none' }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editData ? 'Guardar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageRoot>
  );
};

export default CampusAdminPanel;
