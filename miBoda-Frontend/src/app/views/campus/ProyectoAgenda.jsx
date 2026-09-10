import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Chip, IconButton, Tooltip,
  CircularProgress, Alert, Drawer, Stack, Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import TimelineIcon     from '@mui/icons-material/Timeline';
import DrawIcon         from '@mui/icons-material/Draw';
import ListAltIcon      from '@mui/icons-material/ListAlt';
import HistoryIcon      from '@mui/icons-material/History';
import DownloadIcon     from '@mui/icons-material/Download';
import AddIcon          from '@mui/icons-material/Add';
import TuneIcon         from '@mui/icons-material/Tune';
import RefreshIcon      from '@mui/icons-material/Refresh';

import useAuth from '../../hooks/useAuth';
import { proyectosListar } from '../../api/campus.api';
import { fasesListar, tareasListar, agendaProgreso, agendaHistorial } from '../../api/agenda.api';
import GanttCanvas    from './agenda/GanttCanvas';
import ExcalidrawEditor from './agenda/excalidraw/ExcalidrawEditor';
import TareaPanel     from './agenda/TareaPanel';
import AgendaListView from './agenda/AgendaListView';

// ─── Animación ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;

// ─── Styled ───────────────────────────────────────────────────────────────────
const PageRoot = styled(Box)({
  height: '100vh', display: 'flex', flexDirection: 'column',
  backgroundColor: '#f0f4f8', overflow: 'hidden',
  animation: `${fadeIn} 0.3s ease`,
});

const CompactHeader = styled(Paper)({
  borderRadius: 0,
  background: 'linear-gradient(120deg,#1565c0 0%,#1976d2 55%,#1e88e5 100%)',
  color: '#fff', padding: '8px 16px',
  display: 'flex', alignItems: 'center', gap: 10,
  boxShadow: '0 2px 10px rgba(21,101,192,.22)',
  position: 'relative', overflow: 'hidden', flexShrink: 0,
});

const ViewTabs = styled(Tabs)({
  backgroundColor: '#fff', borderBottom: '1px solid #e3eaf3',
  minHeight: 40, flexShrink: 0,
  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#1976d2' },
});

const ViewTab = styled(Tab)({
  textTransform: 'none', fontWeight: 500, fontSize: 13,
  minHeight: 40, padding: '6px 16px',
});

// ─── Estado / prioridad ───────────────────────────────────────────────────────
export const ESTADO_COLOR = {
  pendiente:    { label: 'Pendiente',    color: '#757575', bg: '#f5f5f5' },
  en_progreso:  { label: 'En progreso',  color: '#1976d2', bg: '#e3f2fd' },
  en_revision:  { label: 'En revisión',  color: '#ed6c02', bg: '#fff3e0' },
  completado:   { label: 'Completado',   color: '#2e7d32', bg: '#e8f5e9' },
  bloqueado:    { label: 'Bloqueado',    color: '#c62828', bg: '#ffebee' },
};

export const PRIORIDAD_COLOR = {
  baja:    { label: 'Baja',    color: '#388e3c', bg: '#e8f5e9' },
  media:   { label: 'Media',   color: '#f57c00', bg: '#fff3e0' },
  alta:    { label: 'Alta',    color: '#d32f2f', bg: '#ffebee' },
  critica: { label: 'Crítica', color: '#880e4f', bg: '#fce4ec' },
};

const TABS_VIEW = [
  { key: 'gantt',   label: 'Gantt',   icon: <TimelineIcon sx={{ fontSize: 16 }} /> },
  { key: 'lista',   label: 'Lista',   icon: <ListAltIcon  sx={{ fontSize: 16 }} /> },
  { key: 'excalidraw', label: 'Excalidraw', icon: <DrawIcon sx={{ fontSize: 16 }} /> },
  { key: 'history', label: 'Historial', icon: <HistoryIcon sx={{ fontSize: 16 }} /> },
];

// ─── Component ────────────────────────────────────────────────────────────────
const ProyectoAgenda = () => {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin  = user?.es_administrador_principal == 1;

  const [proyecto,  setProyecto]  = useState(null);
  const [fases,     setFases]     = useState([]);
  const [tareas,    setTareas]    = useState([]);
  const [historial, setHistorial] = useState([]);
  const [progreso,  setProgreso]  = useState({ progreso: 0, total: 0, completadas: 0, bloqueadas: 0, retrasadas: 0 });
  const [loading,   setLoading]   = useState(true);
  const [tabView,   setTabView]   = useState(0);

  // Panel de tarea
  const [tareaOpen,  setTareaOpen]  = useState(false);
  const [tareaEdit,  setTareaEdit]  = useState(null); // null = nueva

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, fs, tr, hst, pg] = await Promise.all([
        proyectosListar(),
        fasesListar({ id_proyecto: id }),
        tareasListar({ id_proyecto: id }),
        agendaHistorial({ id_proyecto: id }),
        agendaProgreso({ id_proyecto: id }),
      ]);
      setProyecto((pr || []).find(p => String(p.id_proyecto) === String(id)) || null);
      setFases(fs || []);
      setTareas(tr || []);
      setHistorial(hst || []);
      setProgreso(pg || { progreso: 0, total: 0, completadas: 0, bloqueadas: 0, retrasadas: 0 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openTarea = (tarea = null) => {
    setTareaEdit(tarea);
    setTareaOpen(true);
  };

  // Exportar Gantt como PNG
  const handleExportPng = () => {
    const canvas = document.getElementById('gantt-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `gantt_${proyecto?.nombre || 'proyecto'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={32} />
    </Box>
  );

  if (!proyecto) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning">Proyecto no encontrado.</Alert>
      <Button onClick={() => navigate('/campus/dashboard')} sx={{ mt: 2 }}>Volver</Button>
    </Box>
  );

  const progPct = Math.round(progreso.progreso || 0);

  return (
    <PageRoot>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, pb: 0, flexShrink: 0 }}>
        <CompactHeader elevation={0}>
          <IconButton size="small" onClick={() => navigate(`/campus/proyecto/${id}`)}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} noWrap sx={{ fontSize: 15, lineHeight: 1.1 }}>
              📅 Agenda — {proyecto.nombre}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75, fontSize: 11 }}>
              {progreso.total} tareas · {progreso.completadas} completadas
              {progreso.retrasadas > 0 && ` · ⚠ ${progreso.retrasadas} retrasadas`}
            </Typography>
          </Box>

          {/* Barra de progreso global */}
          <Box sx={{ minWidth: 140, display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', gap: 0.3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 10 }}>Avance global</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>{progPct}%</Typography>
            </Box>
            <Box sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <Box sx={{
                height: '100%', borderRadius: 3, bgcolor: '#fff',
                width: `${progPct}%`, transition: 'width 0.4s ease',
              }} />
            </Box>
          </Box>

          {/* Acciones */}
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            {isAdmin && (
              <Tooltip title="Nueva tarea">
                <IconButton size="small" onClick={() => openTarea()}
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Exportar PNG">
              <IconButton size="small" onClick={handleExportPng}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>
                <DownloadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Recargar">
              <IconButton size="small" onClick={loadAll}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </CompactHeader>

        {/* Tabs de vista */}
        <ViewTabs value={tabView} onChange={(_, v) => setTabView(v)} variant="scrollable" scrollButtons="auto">
          {TABS_VIEW.map((t, i) => (
            <ViewTab key={i} label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                {t.icon}{t.label}
              </Box>
            } />
          ))}
        </ViewTabs>
      </Box>

      {/* ── CONTENIDO ──────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* GANTT */}
        {tabView === 0 && (
          <GanttCanvas
            tareas={tareas}
            fases={fases}
            isAdmin={isAdmin}
            idProyecto={id}
            onTareaClick={openTarea}
            onTareaMove={loadAll}
            onTareaCreate={() => openTarea()}
          />
        )}

        {/* LISTA */}
        {tabView === 1 && (
          <AgendaListView
            tareas={tareas}
            fases={fases}
            isAdmin={isAdmin}
            onTareaClick={openTarea}
            onRefresh={loadAll}
          />
        )}

        {/* EXCALIDRAW */}
        {tabView === 2 && (
          <ExcalidrawEditor
            idProyecto={id}
            isAdmin={isAdmin}
          />
        )}

        {/* HISTORIAL */}
        {tabView === 3 && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, fontSize: 13 }}>
              Historial de cambios
            </Typography>
            {historial.length === 0 ? (
              <Paper sx={{ borderRadius: 0, p: 4, textAlign: 'center', border: '1px solid #e3eaf3', boxShadow: 'none' }}>
                <HistoryIcon sx={{ fontSize: 40, color: '#b0bec5', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">Sin historial aún.</Typography>
              </Paper>
            ) : (
              <Stack spacing={1}>
                {historial.map((h, i) => (
                  <Paper key={i} sx={{ borderRadius: 0, p: '10px 16px', border: '1px solid #e3eaf3', boxShadow: 'none', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2', mt: 0.7, flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: 12 }}>
                        {h.descripcion || h.accion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>
                        {new Date(h.created_at).toLocaleString('es-PE')}
                      </Typography>
                    </Box>
                    <Chip label={h.accion} size="small"
                      sx={{ height: 18, fontSize: 10, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>

      {/* ── DRAWER: panel de tarea ─────────────────────────────────────────── */}
      <TareaPanel
        open={tareaOpen}
        onClose={() => setTareaOpen(false)}
        tarea={tareaEdit}
        fases={fases}
        idProyecto={id}
        isAdmin={isAdmin}
        onSaved={loadAll}
      />

    </PageRoot>
  );
};

export default ProyectoAgenda;
