import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Stack, Chip, IconButton, TextField, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Collapse, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Grid, Autocomplete, Alert, ToggleButton, ToggleButtonGroup,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Menu, FormHelperText, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import LinkIcon from '@mui/icons-material/Link';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotesIcon from '@mui/icons-material/Notes';
import CodeIcon from '@mui/icons-material/Code';

import useAuth from '../../hooks/useAuth';
import ClienteNotasDialog from './ClienteNotasDialog';
import ClienteCodeEditorDialog from './ClienteCodeEditorDialog';
import ClienteProyectoEditModal from './ClienteProyectoEditModal';
import ProyectoNombreSelector from './ProyectoNombreSelectorFields';

import {
  clientesConProyectos, crmClienteCrear, crmClienteActualizar,
  crmClienteVincularUsuario, crmClienteEliminar, usuariosPendientesActivacion, crmBuscarClientes,
  proyectosCrear, proyectosActualizar, proyectosEliminar, proyectoObtener,
} from '../../api/campus.api';
import OnboardingModal from '../clientes/OnboardingModal';
import { onboardingListar, fetchOnboardingPdf } from '../../api/onboarding.api';
import { listarTipos } from '../../api/cotizacion.api';
import { toastSuccess, handleErrorMessages } from '../../components/notify-messages';
import { triggerCampusNotificacionPoll } from '../../utils/campusNotificacionPoll';
import NotificacionAdminPanel, { SemaforoDot, ProgresoBarra, EstadoNotificacionChip } from './NotificacionAdminPanel';
import { notificacionEstadosListar } from '../../api/notificacion.api';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const ESTADO_CHIP = {
  prospecto:            { bg: '#fff3e0', color: '#e65100' },
  pendiente_email:      { bg: '#e3f2fd', color: '#1565c0' },
  pendiente_activacion: { bg: '#fce4ec', color: '#c62828' },
  activo:               { bg: '#e8f5e9', color: '#2e7d32' },
  vinculado:            { bg: '#e8f5e9', color: '#2e7d32' },
  usuario:              { bg: '#ede7f6', color: '#4527a0' },
};

const EMPTY_CLIENTE = {
  nombre: '', apellido: '', empresa: '', ruc: '', dni: '',
  email: '', telefono: '', whatsapp: '', notas: '',
  id_notificacion_estado: null,
};

const hoyISO = () => new Date().toISOString().slice(0, 10);

const EMPTY_PROYECTO = {
  nombre: '', descripcion: '', estado: 'en_progreso', icono: 'web',
  color: '#2196f3', fecha_inicio: hoyISO(), fecha_entrega: '', progreso: 0,
  orden_prioridad: 5,
  id_notificacion_estado: null,
};

const validarFechasProyecto = (f) => {
  if (!f.fecha_inicio || !f.fecha_entrega) {
    return 'Indica la fecha de inicio y la fecha de entrega del proyecto.';
  }
  if (f.fecha_entrega < f.fecha_inicio) {
    return 'La fecha de entrega debe ser igual o posterior a la de inicio.';
  }
  return null;
};

const PROGRESO_OPCIONES = Array.from({ length: 11 }, (_, i) => i * 10);
const ORDEN_PRIORIDAD_MAX = 20;
const ORDEN_PRIORIDAD_OPCIONES = Array.from({ length: ORDEN_PRIORIDAD_MAX }, (_, i) => i + 1);

const snapOrdenPrioridad = (v) => Math.min(ORDEN_PRIORIDAD_MAX, Math.max(1, Number(v) || 5));

function CeldaNombreCliente({ nombre, empresa }) {
  const etiqueta = nombre || '—';
  const tooltipTitle = empresa ? `${etiqueta} — ${empresa}` : etiqueta;

  return (
    <Tooltip title={tooltipTitle} arrow placement="top-start" enterDelay={400}>
      <Box sx={{ minWidth: 0, maxWidth: 158, overflow: 'hidden', cursor: 'default' }}>
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          sx={{ fontSize: '0.78rem', lineHeight: 1.2, display: 'block' }}
        >
          {etiqueta}
        </Typography>
        {empresa && (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: 'block', fontSize: '0.68rem', lineHeight: 1.15, mt: 0.1 }}
          >
            {empresa}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

function OrdenPrioridadChip({ orden = 5 }) {
  const n = snapOrdenPrioridad(orden);
  return (
    <Chip
      label={n}
      size="small"
      title={`Orden de prioridad ${n}`}
      sx={{
        minWidth: 26,
        height: 22,
        fontWeight: 700,
        fontSize: 11,
        bgcolor: n === 1 ? '#ffebee' : '#eceff1',
        color: n === 1 ? '#c62828' : '#546e7a',
      }}
    />
  );
}

const mejorOrdenCliente = (c) => {
  const proys = c?.proyectos || [];
  if (!proys.length) return c?.mejor_orden_prioridad ?? 99;
  return Math.min(...proys.map((p) => snapOrdenPrioridad(p.orden_prioridad)));
};

const ordenarProyectosLista = (proys = []) =>
  [...proys].sort((a, b) => {
    const oa = snapOrdenPrioridad(a.orden_prioridad);
    const ob = snapOrdenPrioridad(b.orden_prioridad);
    if (oa !== ob) return oa - ob;
    return String(a.fecha_entrega || '9999').localeCompare(String(b.fecha_entrega || '9999'));
  });

const ordenarClientesPorPrioridad = (lista = []) =>
  [...lista]
    .map((c) => ({
      ...c,
      proyectos: ordenarProyectosLista(c.proyectos),
      mejor_orden_prioridad: mejorOrdenCliente(c),
    }))
    .sort((a, b) => {
      const pa = mejorOrdenCliente(a);
      const pb = mejorOrdenCliente(b);
      if (pa !== pb) return pa - pb;
      const sa = a.semaforo?.orden ?? 99;
      const sb = b.semaforo?.orden ?? 99;
      if (sa !== sb) return sa - sb;
      return (a.nombre_completo || a.nombre || '').localeCompare(b.nombre_completo || b.nombre || '');
    });

const snapProgreso = (v) => Math.min(100, Math.max(0, Math.round((Number(v) || 0) / 10) * 10));

const formatFechaInput = (v) => {
  if (!v) return '';
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const fmtFechaTabla = (v) => {
  const iso = formatFechaInput(v);
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '—';
  return `${d}/${m}/${y}`;
};

const diasTranscurridos = (fechaInicio) => {
  const iso = formatFechaInput(fechaInicio);
  if (!iso) return null;
  const inicio = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(inicio.getTime())) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((hoy - inicio) / 86_400_000));
};

const proyectoPrincipalCliente = (c) => {
  const proys = ordenarProyectosLista(c?.proyectos || []);
  return proys[0] || null;
};

/** Proyecto más reciente (por updated_at) para estado visible en la fila del cliente. */
const ultimoProyectoCliente = (c) => {
  const proys = c?.proyectos || [];
  if (!proys.length) return null;
  return [...proys].sort((a, b) => {
    const ta = a.updated_at || a.created_at || '';
    const tb = b.updated_at || b.created_at || '';
    return String(tb).localeCompare(String(ta));
  })[0];
};

const TABLA_CLIENTE_NOMBRE_SX = {
  minWidth: 132,
  width: 168,
  maxWidth: 180,
  verticalAlign: 'middle',
  py: 0.6,
  px: 0.75,
};

const TABLA_CLIENTES_COLS = 14;

function CeldaFecha({ value, title }) {
  const label = fmtFechaTabla(value);
  return (
    <Tooltip title={title || (value ? formatFechaInput(value) : 'Sin fecha')} arrow placement="top">
      <Typography variant="caption" sx={{ whiteSpace: 'nowrap', cursor: 'default' }}>
        {label}
      </Typography>
    </Tooltip>
  );
}

function CeldaDiasTranscurridos({ fechaInicio, fechaFin }) {
  const dias = diasTranscurridos(fechaInicio);
  if (dias == null) {
    return <Typography variant="caption" color="text.disabled">—</Typography>;
  }
  const finIso = formatFechaInput(fechaFin);
  const hoy = hoyISO();
  const vencido = finIso && hoy > finIso;
  const enPlazo = finIso && hoy <= finIso;
  return (
    <Tooltip
      title={
        finIso
          ? `Desde ${fmtFechaTabla(fechaInicio)} · Entrega ${fmtFechaTabla(fechaFin)}`
          : `Desde ${fmtFechaTabla(fechaInicio)}`
      }
      arrow
      placement="top"
    >
      <Chip
        label={`${dias} d`}
        size="small"
        sx={{
          height: 20,
          fontSize: 10,
          fontWeight: 700,
          minWidth: 36,
          bgcolor: vencido ? '#ffebee' : enPlazo ? '#e8f5e9' : '#eceff1',
          color: vencido ? '#c62828' : enPlazo ? '#2e7d32' : '#546e7a',
        }}
      />
    </Tooltip>
  );
}

const proyectoToForm = (p) => ({
  nombre: p?.nombre ?? '',
  descripcion: p?.descripcion ?? '',
  estado: p?.estado || 'en_progreso',
  icono: p?.icono || 'web',
  color: p?.color || '#2196f3',
  fecha_inicio: formatFechaInput(p?.fecha_inicio) || formatFechaInput(p?.created_at) || hoyISO(),
  fecha_entrega: formatFechaInput(p?.fecha_entrega),
  progreso: snapProgreso(p?.progreso),
  orden_prioridad: snapOrdenPrioridad(p?.orden_prioridad),
  id_notificacion_estado: p?.id_notificacion_estado ?? null,
});

export default function CampusClientesAdminSection({ onGestionar }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.es_administrador_principal == 1;
  const [tab, setTab] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const toggleExpanded = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const [dlgCliente, setDlgCliente] = useState(false);
  const [dlgEditCombo, setDlgEditCombo] = useState(false);
  const [loadingEditCombo, setLoadingEditCombo] = useState(false);
  const [editClienteNombre, setEditClienteNombre] = useState('');
  const [editTieneProyecto, setEditTieneProyecto] = useState(false);
  const [dlgProyecto, setDlgProyecto] = useState(false);
  const [dlgVincular, setDlgVincular] = useState(false);
  const [dlgConfirmProyecto, setDlgConfirmProyecto] = useState(false);
  const [clienteRecienCreado, setClienteRecienCreado] = useState(null);
  const [dlgEditProyecto, setDlgEditProyecto] = useState(false);
  const [editProyectoId, setEditProyectoId] = useState(null);
  const [formEditProyecto, setFormEditProyecto] = useState(EMPTY_PROYECTO);
  const [formCliente, setFormCliente] = useState(EMPTY_CLIENTE);
  const [formProyecto, setFormProyecto] = useState(EMPTY_PROYECTO);
  const [editClienteId, setEditClienteId] = useState(null);
  const [createForCliente, setCreateForCliente] = useState(null);
  const [vincularUser, setVincularUser] = useState(null);
  const [vincularCliente, setVincularCliente] = useState(null);
  const [buscarVinculo, setBuscarVinculo] = useState('');
  const [opcionesVinculo, setOpcionesVinculo] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tiposCatalogo, setTiposCatalogo] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [modoNombreProyecto, setModoNombreProyecto] = useState('catalogo');
  const [tipoProyectoSel, setTipoProyectoSel] = useState(null);
  const [modoNombreEdit, setModoNombreEdit] = useState('catalogo');
  const [tipoProyectoEditSel, setTipoProyectoEditSel] = useState(null);
  const [dlgEliminarProyecto, setDlgEliminarProyecto] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);
  const [loadingEditProyecto, setLoadingEditProyecto] = useState(false);
  const [dlgEliminarCliente, setDlgEliminarCliente] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [estadosNotif, setEstadosNotif] = useState([]);
  const [dlgNotifAdmin, setDlgNotifAdmin] = useState(false);
  const [dlgBuscarProyecto, setDlgBuscarProyecto] = useState(false);
  const [buscarProyectoQ, setBuscarProyectoQ] = useState('');
  const [buscarProyectoResults, setBuscarProyectoResults] = useState([]);
  const [buscarProyectoLoading, setBuscarProyectoLoading] = useState(false);
  const [clienteSelBusqueda, setClienteSelBusqueda] = useState(null);

  // ── Onboarding Modal ──
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingCliente, setOnboardingCliente] = useState(null);
  const abrirOnboarding = (c) => { setOnboardingCliente(c); setOnboardingOpen(true); };

  // ── Menú ⋮ (notas / editor) ──
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuCliente, setMenuCliente] = useState(null);
  const [notasOpen, setNotasOpen] = useState(false);
  const [notasCliente, setNotasCliente] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeCliente, setCodeCliente] = useState(null);

  const abrirMenuAcciones = (e, c) => {
    setMenuAnchor(e.currentTarget);
    setMenuCliente(c);
  };
  const cerrarMenuAcciones = () => {
    setMenuAnchor(null);
    setMenuCliente(null);
  };
  const abrirNotas = (c) => {
    setNotasCliente(c);
    setNotasOpen(true);
    cerrarMenuAcciones();
  };
  const abrirEditor = (c) => {
    setCodeCliente(c);
    setCodeOpen(true);
    cerrarMenuAcciones();
  };

  // ── Reporte PDF Modal ──
  const [reporteUrl, setReporteUrl]         = useState(null); // blob URL
  const [reporteToken, setReporteToken]     = useState(null);
  const [reporteNombre, setReporteNombre]   = useState('');
  const [reporteLoadingId, setReporteLoadingId] = useState(null);

  const cerrarReporte = () => {
    if (reporteUrl) window.URL.revokeObjectURL(reporteUrl);
    setReporteUrl(null);
    setReporteToken(null);
  };

  const abrirReporte = async (c) => {
    if (!c?.id_cliente) return;
    setReporteLoadingId(c.id_cliente);
    setReporteNombre(`${c.nombre || ''} ${c.apellido || ''}`.trim() || c.empresa || 'Cliente');
    try {
      const links = await onboardingListar({ id_cliente: c.id_cliente });
      const activo = (links || []).find(l => l.estado === 'activo') || (links || [])[0];
      if (!activo) {
        handleErrorMessages('Sin enlace de onboarding', new Error('Este cliente no tiene enlace. Créelo desde el botón de enlace (🔗).'));
        return;
      }
      const blob = await fetchOnboardingPdf(activo.token, true);
      const url  = window.URL.createObjectURL(blob);
      setReporteToken(activo.token);
      setReporteUrl(url);
    } catch (e) {
      handleErrorMessages('No se pudo generar el reporte PDF', e);
    } finally {
      setReporteLoadingId(null);
    }
  };

  const loadClientes = async (q = busqueda) => {
    try {
      const data = await clientesConProyectos({ q: q || undefined });
      setClientes(ordenarClientesPorPrioridad(data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const loadPendientes = async (q = busqueda) => {
    try {
      const data = await usuariosPendientesActivacion({ q: q || undefined });
      setPendientes(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadClientes(),
      loadPendientes(),
      notificacionEstadosListar().then((r) => setEstadosNotif((r || []).filter((e) => e.activo))).catch(() => {}),
    ]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const loadTiposCatalogo = async () => {
    if (tiposCatalogo.length) return tiposCatalogo;
    setLoadingTipos(true);
    try {
      const rows = await listarTipos();
      const activos = (rows || []).filter((t) => t.Activo !== 'N');
      setTiposCatalogo(activos);
      return activos;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoadingTipos(false);
    }
  };

  const aplicarTipoProyecto = (tipo, setter) => {
    if (!tipo) return;
    setter((f) => ({
      ...f,
      nombre: tipo.titulo,
      descripcion: tipo.descripcion || f.descripcion,
      icono: tipo.slug || f.icono,
    }));
  };

  const nombreProyectoValido = modoNombreProyecto === 'catalogo'
    ? !!tipoProyectoSel
    : !!formProyecto.nombre.trim();

  const nombreEditProyectoValido = modoNombreEdit === 'catalogo'
    ? !!tipoProyectoEditSel
    : !!formEditProyecto.nombre.trim();

  const handleBuscar = () => {
    setLoading(true);
    Promise.all([
      tab === 0 ? loadClientes() : loadPendientes(),
      tab === 0 ? loadPendientes() : loadClientes(),
    ]).finally(() => setLoading(false));
  };

  const openNuevoCliente = () => {
    setEditClienteId(null);
    setFormCliente(EMPTY_CLIENTE);
    setDlgCliente(true);
  };

  const openEditarCliente = async (c) => {
    setEditClienteId(c.id_cliente);
    setEditClienteNombre(c.nombre_completo || c.nombre || '');
    setFormCliente({
      nombre: c.nombre || '', apellido: c.apellido || '', empresa: c.empresa || '',
      ruc: c.ruc || '', dni: c.dni || '', email: c.email || '',
      telefono: c.telefono || '', whatsapp: c.whatsapp || '', notas: c.notas || '',
      id_notificacion_estado: c.id_notificacion_estado ?? null,
    });
    setDlgEditCombo(true);
    setLoadingEditCombo(true);
    setEditProyectoId(null);
    setFormEditProyecto(EMPTY_PROYECTO);
    setTipoProyectoEditSel(null);
    setModoNombreEdit('catalogo');

    const principal = proyectoPrincipalCliente(c);
    setEditTieneProyecto(Boolean(principal?.id_proyecto));

    try {
      if (principal?.id_proyecto) {
        setEditProyectoId(principal.id_proyecto);
        const full = await proyectoObtener({ id_proyecto: principal.id_proyecto });
        const form = proyectoToForm(full);
        setFormEditProyecto(form);
        const tipos = await loadTiposCatalogo();
        const match = tipos.find((t) => t.titulo === form.nombre);
        setModoNombreEdit(match ? 'catalogo' : 'personalizado');
        setTipoProyectoEditSel(match || null);
      } else {
        await loadTiposCatalogo();
      }
    } catch (e) {
      handleErrorMessages('Error al cargar datos', e);
      setDlgEditCombo(false);
      setEditClienteId(null);
    } finally {
      setLoadingEditCombo(false);
    }
  };

  const cerrarEditCombo = () => {
    if (saving) return;
    setDlgEditCombo(false);
    setEditClienteId(null);
    setEditProyectoId(null);
    setEditClienteNombre('');
    setEditTieneProyecto(false);
  };

  const guardarClienteCombo = async () => {
    if (!formCliente.nombre.trim() || !editClienteId) return;
    if (editTieneProyecto && editProyectoId) {
      if (!formEditProyecto.nombre.trim()) {
        handleErrorMessages('Proyecto', 'Indica el nombre del proyecto.', true);
        return;
      }
      const errFechas = validarFechasProyecto(formEditProyecto);
      if (errFechas) {
        handleErrorMessages('Proyecto', errFechas, true);
        return;
      }
    }
    setSaving(true);
    try {
      await crmClienteActualizar({ id_cliente: editClienteId, ...formCliente });
      if (editTieneProyecto && editProyectoId) {
        await proyectosActualizar({ id_proyecto: editProyectoId, ...formEditProyecto });
        triggerCampusNotificacionPoll();
      }
      toastSuccess(editTieneProyecto ? 'Cliente y proyecto actualizados' : 'Cliente actualizado');
      cerrarEditCombo();
      await loadClientes();
    } catch (e) {
      handleErrorMessages('Error al guardar', e);
    } finally {
      setSaving(false);
    }
  };

  const openNuevoProyecto = (c) => {
    setCreateForCliente(c);
    setFormProyecto(EMPTY_PROYECTO);
    setModoNombreProyecto('catalogo');
    setTipoProyectoSel(null);
    setDlgProyecto(true);
    loadTiposCatalogo();
  };

  const openBuscarClienteProyecto = () => {
    setBuscarProyectoQ('');
    setClienteSelBusqueda(null);
    setDlgBuscarProyecto(true);
    ejecutarBuscarClienteProyecto('');
  };

  const ejecutarBuscarClienteProyecto = async (qOverride) => {
    const q = qOverride !== undefined ? String(qOverride).trim() : buscarProyectoQ.trim();
    setBuscarProyectoLoading(true);
    setClienteSelBusqueda(null);
    try {
      const res = await crmBuscarClientes(q ? { q } : {});
      setBuscarProyectoResults(res || []);
    } catch (e) {
      handleErrorMessages('Error al buscar clientes', e);
      setBuscarProyectoResults([]);
    } finally {
      setBuscarProyectoLoading(false);
    }
  };

  const confirmarClienteParaProyecto = () => {
    if (!clienteSelBusqueda) return;
    setDlgBuscarProyecto(false);
    openNuevoProyecto(clienteSelBusqueda);
    setClienteSelBusqueda(null);
    setBuscarProyectoResults([]);
    setBuscarProyectoQ('');
  };

  const handleTipoProyectoChange = (tipo) => {
    setTipoProyectoSel(tipo);
    if (tipo) aplicarTipoProyecto(tipo, setFormProyecto);
    else setFormProyecto((f) => ({ ...f, nombre: '' }));
  };

  const handleTipoEditProyectoChange = (tipo) => {
    setTipoProyectoEditSel(tipo);
    if (tipo) {
      setFormEditProyecto((f) => ({
        ...f,
        nombre: tipo.titulo,
        icono: tipo.slug || f.icono,
      }));
    } else {
      setFormEditProyecto((f) => ({ ...f, nombre: '' }));
    }
  };

  const openVincular = (user) => {
    setVincularUser(user);
    setVincularCliente(null);
    setBuscarVinculo('');
    setOpcionesVinculo([]);
    setDlgVincular(true);
  };

  const buscarParaVincular = async (q) => {
    setBuscarVinculo(q);
    if (!q || q.length < 2) { setOpcionesVinculo([]); return; }
    try {
      const res = await crmBuscarClientes({ q });
      setOpcionesVinculo(res || []);
    } catch (e) {
      setOpcionesVinculo([]);
    }
  };

  const guardarCliente = async () => {
    if (!formCliente.nombre.trim() || editClienteId) return;
    setSaving(true);
    try {
      const created = await crmClienteCrear(formCliente);
      toastSuccess('Cliente registrado');
      setDlgCliente(false);
      await loadClientes();
      setClienteRecienCreado(created);
      setDlgConfirmProyecto(true);
    } catch (e) {
      handleErrorMessages('Error al guardar cliente', e);
    } finally {
      setSaving(false);
    }
  };

  const guardarProyecto = async () => {
    if (!formProyecto.nombre.trim() || !createForCliente) return;
    const errFechas = validarFechasProyecto(formProyecto);
    if (errFechas) {
      handleErrorMessages('Proyecto', errFechas, true);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formProyecto };
      if (modoNombreProyecto === 'catalogo' && tipoProyectoSel?.id_tipo) {
        payload.id_tipo = tipoProyectoSel.id_tipo;
      }
      if (createForCliente.id_cliente) {
        payload.id_cliente = createForCliente.id_cliente;
      } else if (createForCliente.id_user) {
        payload.id_user = createForCliente.id_user;
      }
      await proyectosCrear(payload);
      toastSuccess('Proyecto creado');
      setDlgProyecto(false);
      setCreateForCliente(null);
      await loadClientes();
    } catch (e) {
      handleErrorMessages('Error al crear proyecto', e);
    } finally {
      setSaving(false);
    }
  };

  const openEditarProyecto = async (p) => {
    setEditProyectoId(p.id_proyecto);
    setDlgEditProyecto(true);
    setLoadingEditProyecto(true);
    setFormEditProyecto(EMPTY_PROYECTO);
    setTipoProyectoEditSel(null);
    try {
      const full = await proyectoObtener({ id_proyecto: p.id_proyecto });
      const form = proyectoToForm(full);
      setFormEditProyecto(form);

      const tipos = await loadTiposCatalogo();
      const match = tipos.find((t) => t.titulo === form.nombre);
      setModoNombreEdit(match ? 'catalogo' : 'personalizado');
      setTipoProyectoEditSel(match || null);
    } catch (e) {
      handleErrorMessages('Error al cargar proyecto', e);
      setDlgEditProyecto(false);
      setEditProyectoId(null);
    } finally {
      setLoadingEditProyecto(false);
    }
  };

  const guardarEditProyecto = async () => {
    if (!formEditProyecto.nombre.trim() || !editProyectoId) return;
    const errFechas = validarFechasProyecto(formEditProyecto);
    if (errFechas) {
      handleErrorMessages('Proyecto', errFechas, true);
      return;
    }
    setSaving(true);
    try {
      await proyectosActualizar({ id_proyecto: editProyectoId, ...formEditProyecto });
      toastSuccess('Proyecto actualizado');
      triggerCampusNotificacionPoll();
      setDlgEditProyecto(false);
      setEditProyectoId(null);
      await loadClientes();
    } catch (e) {
      handleErrorMessages('Error al actualizar proyecto', e);
    } finally {
      setSaving(false);
    }
  };

  const confirmarCrearProyectoAhora = () => {
    setDlgConfirmProyecto(false);
    if (clienteRecienCreado) openNuevoProyecto(clienteRecienCreado);
    setClienteRecienCreado(null);
  };

  const cancelarCrearProyectoAhora = () => {
    setDlgConfirmProyecto(false);
    setClienteRecienCreado(null);
    loadClientes();
  };

  const openEliminarProyecto = (p) => {
    setProyectoAEliminar(p);
    setDlgEliminarProyecto(true);
  };

  const cancelarEliminarProyecto = () => {
    setDlgEliminarProyecto(false);
    setProyectoAEliminar(null);
  };

  const confirmarEliminarProyecto = async () => {
    if (!proyectoAEliminar?.id_proyecto) return;
    setSaving(true);
    try {
      await proyectosEliminar({ id_proyecto: proyectoAEliminar.id_proyecto });
      toastSuccess('Proyecto eliminado');
      cancelarEliminarProyecto();
      await loadClientes();
    } catch (e) {
      handleErrorMessages('Error al eliminar proyecto', e);
    } finally {
      setSaving(false);
    }
  };

  const openEliminarCliente = (c) => {
    setClienteAEliminar(c);
    setDlgEliminarCliente(true);
  };

  const cancelarEliminarCliente = () => {
    setDlgEliminarCliente(false);
    setClienteAEliminar(null);
  };

  const confirmarEliminarCliente = async () => {
    if (!clienteAEliminar?.id_cliente) return;
    setSaving(true);
    try {
      await crmClienteEliminar({ id_cliente: clienteAEliminar.id_cliente });
      toastSuccess('Cliente eliminado');
      cancelarEliminarCliente();
      await loadClientes();
    } catch (e) {
      handleErrorMessages('Eliminar cliente', e);
    } finally {
      setSaving(false);
    }
  };

  const confirmarVincular = async () => {
    if (!vincularUser || !vincularCliente?.id_cliente) return;
    setSaving(true);
    try {
      await crmClienteVincularUsuario({
        id_cliente: vincularCliente.id_cliente,
        id_user: vincularUser.id,
        activar_usuario: true,
      });
      toastSuccess('Usuario vinculado y activado');
      setDlgVincular(false);
      await loadAll();
    } catch (e) {
      handleErrorMessages('Error al vincular', e);
    } finally {
      setSaving(false);
    }
  };

  const rowKey = (c) => c.id_cliente ? `c-${c.id_cliente}` : `u-${c.id_user}`;

  const docLabel = (c) => {
    const parts = [];
    if (c.ruc) parts.push(`RUC ${c.ruc}`);
    if (c.dni) parts.push(`DNI ${c.dni}`);
    return parts.join(' · ') || '—';
  };

  const estadoChip = (c) => {
    if (c.estado_notificacion?.nombre) {
      return <EstadoNotificacionChip estado={c.estado_notificacion} />;
    }
    const key = c.tipo === 'usuario' ? 'usuario' : (c.estado || c.tipo);
    const cfg = ESTADO_CHIP[key] || ESTADO_CHIP.prospecto;
    return (
      <Chip label={c.estado_label || key} size="small"
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 10, height: 20 }} />
    );
  };

  const estadosPara = (aplica) => estadosNotif.filter((e) => e.aplica_a === aplica || e.aplica_a === 'ambos');

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography id="clientes-proyectos" variant="subtitle1" fontWeight={700} sx={{ fontSize: 14 }}>
          Gestión de clientes y proyectos
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          <Button size="small" variant="outlined" startIcon={<PersonSearchIcon />}
            onClick={openBuscarClienteProyecto}
            sx={{ borderRadius: 4, textTransform: 'none', fontSize: 12, borderColor: '#1976d2', color: '#1976d2' }}>
            Proyecto a cliente
          </Button>
          <Button size="small" variant="contained" startIcon={<PersonAddIcon />}
            onClick={openNuevoCliente} sx={{ borderRadius: 4, textTransform: 'none', fontSize: 12 }}>
            Nuevo cliente
          </Button>
          <Button size="small" variant="outlined" startIcon={<NotificationsActiveIcon />}
            onClick={() => setDlgNotifAdmin(true)}
            sx={{ borderRadius: 4, textTransform: 'none', fontSize: 12, borderColor: '#f59e0b', color: '#d97706' }}>
            Alertas
          </Button>
          {onGestionar && (
            <Button size="small" variant="outlined" startIcon={<OpenInNewIcon />}
              onClick={onGestionar} sx={{ borderRadius: 4, textTransform: 'none', fontSize: 12 }}>
              Gestionar
            </Button>
          )}
        </Stack>
      </Box>

      <Paper sx={{ mb: 1.5, borderRadius: 1, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth"
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: 12, fontWeight: 600 } }}>
          <Tab label={`Todos los clientes (${clientes.length})`} />
          <Tab label={`Pendientes de activación (${pendientes.length})`} icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>
      </Paper>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <TextField size="small" fullWidth placeholder="Buscar por RUC, DNI, nombre, empresa o proyecto…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} /> }}
        />
        <Button variant="contained" onClick={handleBuscar} sx={{ textTransform: 'none', borderRadius: 2, px: 2 }}>
          Buscar
        </Button>
      </Stack>

      {tab === 0 && (
        <Paper sx={{ borderRadius: 1, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', width: '100%' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 1180, tableLayout: 'auto' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8faff', '& th': { fontWeight: 700, color: '#455a64', fontSize: 11 } }}>
                  <TableCell width={36} />
                  <TableCell sx={TABLA_CLIENTE_NOMBRE_SX}>Cliente / Empresa</TableCell>
                  <TableCell align="center" width={44}>N°</TableCell>
                  <TableCell sx={{ width: 100, maxWidth: 120, whiteSpace: 'nowrap' }}>RUC / DNI</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell align="center">Días</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Estado cliente</TableCell>
                  <TableCell align="center">Est. proyecto</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell align="center">Prior.</TableCell>
                  <TableCell align="center">Proy.</TableCell>
                  <TableCell align="right" sx={{ width: 52 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((c, index) => {
                  const key = rowKey(c);
                  const isOpen = expandedKeys.has(key);
                  const proyRef = proyectoPrincipalCliente(c);
                  const ultimoProy = ultimoProyectoCliente(c);
                  return (
                    <Fragment key={key}>
                      <TableRow hover sx={{ '& > td': { py: 0.65 } }}>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleExpanded(key)}>
                            {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={TABLA_CLIENTE_NOMBRE_SX}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                            <SemaforoDot semaforo={c.semaforo} size={9} title={c.semaforo?.nombre} />
                            <CeldaNombreCliente
                              nombre={c.nombre_completo || c.nombre}
                              empresa={c.empresa}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: '#546e7a', fontSize: 12 }}
                          >
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell><Typography variant="caption">{docLabel(c)}</Typography></TableCell>
                        <TableCell>
                          <CeldaFecha
                            value={proyRef?.fecha_inicio}
                            title={proyRef ? `Proyecto principal: ${proyRef.nombre}` : 'Sin proyectos'}
                          />
                        </TableCell>
                        <TableCell>
                          <CeldaFecha
                            value={proyRef?.fecha_entrega}
                            title={proyRef ? `Entrega — ${proyRef.nombre}` : 'Sin proyectos'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <CeldaDiasTranscurridos
                            fechaInicio={proyRef?.fecha_inicio}
                            fechaFin={proyRef?.fecha_entrega}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color={c.email ? 'text.secondary' : 'warning.main'}>
                            {c.email || 'Sin correo'}
                          </Typography>
                        </TableCell>
                        <TableCell>{estadoChip(c)}</TableCell>
                        <TableCell align="center">
                          {ultimoProy?.estado_notificacion?.nombre ? (
                            <Tooltip
                              title={
                                ultimoProy.nombre
                                  ? `Último proyecto: ${ultimoProy.nombre}`
                                  : 'Estado del último proyecto'
                              }
                              arrow
                              placement="top"
                            >
                              <Box component="span" sx={{ display: 'inline-flex' }}>
                                <EstadoNotificacionChip estado={ultimoProy.estado_notificacion} />
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <ProgresoBarra
                            valor={c.progreso_promedio ?? 0}
                            color={c.semaforo?.color_hex || '#1976d2'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {(c.proyectos || []).length > 0 ? (
                            <Tooltip title="Mejor orden de prioridad entre sus proyectos (1 = máxima)">
                              <Box component="span">
                                <OrdenPrioridadChip orden={mejorOrdenCliente(c)} />
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={c.proyectos_count || 0} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700, minWidth: 24, height: 20 }} />
                        </TableCell>
                        <TableCell align="right" sx={{ width: 52, px: 0.5 }}>
                          <Tooltip title="Acciones">
                            <IconButton
                              size="small"
                              onClick={(e) => abrirMenuAcciones(e, c)}
                              sx={{ color: '#546e7a', bgcolor: '#eceff1', '&:hover': { bgcolor: '#cfd8dc' }, borderRadius: 1.5, p: 0.7 }}
                            >
                              <MoreVertIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={TABLA_CLIENTES_COLS} sx={{ py: 0 }}>
                          <Collapse in={isOpen} unmountOnExit>
                            <Box sx={{ py: 1.5, px: 2, bgcolor: '#fafbfc' }}>
                              {(c.proyectos || []).length === 0 ? (
                                <Typography variant="caption" color="text.secondary">Sin proyectos.</Typography>
                              ) : (
                                c.proyectos.map((p) => {
                                  const diasProy = diasTranscurridos(p.fecha_inicio);
                                  return (
                                  <Box key={p.id_proyecto}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 0.5, borderRadius: 1,
                                      bgcolor: '#fff', border: '1px solid #e3eaf3',
                                      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } }}>
                                    <SemaforoDot semaforo={p.semaforo} size={10} />
                                    <FolderIcon sx={{ fontSize: 18, color: p.color || '#1976d2' }} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Tooltip title={p.nombre} arrow placement="top-start">
                                        <Typography variant="body2" fontWeight={600} noWrap sx={{ cursor: 'default' }}>
                                          {p.nombre}
                                        </Typography>
                                      </Tooltip>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3, flexWrap: 'wrap' }}>
                                        <ProgresoBarra valor={p.progreso} color={p.semaforo?.color_hex || p.color} width={60} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                          Inicio {fmtFechaTabla(p.fecha_inicio)}
                                          {' · '}
                                          Fin {fmtFechaTabla(p.fecha_entrega)}
                                          {' · '}
                                          <Box component="span" sx={{ fontWeight: 700, color: '#37474f' }}>
                                            {diasProy != null ? `${diasProy} días` : '—'}
                                          </Box>
                                        </Typography>
                                        <Tooltip title="Orden de prioridad (1 = máxima)">
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Ord.</Typography>
                                            <OrdenPrioridadChip orden={p.orden_prioridad} />
                                          </Box>
                                        </Tooltip>
                                        {p.estado_notificacion && <EstadoNotificacionChip estado={p.estado_notificacion} />}
                                        <Typography variant="caption" color="text.secondary">
                                          {p.archivos_count || 0} archivos
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Stack direction="row" spacing={0.25} flexShrink={0}>
                                      <IconButton size="small" title="Editar proyecto"
                                        onClick={(e) => { e.stopPropagation(); openEditarProyecto(p); }}
                                        sx={{ color: '#1976d2' }}>
                                        <EditIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                      <IconButton size="small" title="Abrir proyecto"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/campus/proyecto/${p.id_proyecto}`); }}
                                        sx={{ color: '#455a64' }}>
                                        <VisibilityIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                      <IconButton size="small" title="Eliminar proyecto"
                                        onClick={(e) => { e.stopPropagation(); openEliminarProyecto(p); }}
                                        sx={{ color: '#d32f2f' }}>
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Stack>
                                  </Box>
                                  );
                                })
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
                {!loading && clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TABLA_CLIENTES_COLS} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        No hay clientes con proyectos. Registre un cliente (sin correo) y cree su proyecto.
                      </Typography>
                      <Button size="small" variant="contained" startIcon={<PersonAddIcon />}
                        onClick={openNuevoCliente} sx={{ borderRadius: 4, textTransform: 'none' }}>
                        Registrar primer cliente
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ borderRadius: 1, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>
          <Alert severity="info" sx={{ borderRadius: 0, fontSize: 12 }}>
            Usuarios registrados en el sistema pero aún no activados. Búsquelos y vincúlelos al cliente/proyecto por RUC, DNI o nombre.
          </Alert>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#fff8e1', '& th': { fontWeight: 700, color: '#455a64', fontSize: 11 } }}>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Registro</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendientes.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{u.name}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{u.email}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {u.id_cliente ? (
                        <Chip label="Ya vinculado" size="small" color="success" sx={{ fontSize: 10 }} />
                      ) : (
                        <Button size="small" variant="contained" color="warning" startIcon={<LinkIcon />}
                          onClick={() => openVincular(u)} sx={{ textTransform: 'none', fontSize: 11, borderRadius: 3 }}>
                          Vincular a cliente
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && pendientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">No hay usuarios pendientes de activación.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog: buscar cliente y agregar proyecto */}
      <Dialog
        open={dlgBuscarProyecto}
        onClose={() => setDlgBuscarProyecto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon color="primary" />
          Buscar cliente y agregar proyecto
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se listan todos los clientes del CRM. Use el buscador para filtrar por RUC, DNI, nombre, empresa, teléfono o WhatsApp.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Filtrar clientes… (vacío = mostrar todos)"
              value={buscarProyectoQ}
              onChange={(e) => setBuscarProyectoQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ejecutarBuscarClienteProyecto()}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} /> }}
            />
            <Button
              variant="contained"
              onClick={() => ejecutarBuscarClienteProyecto()}
              disabled={buscarProyectoLoading}
              sx={{ textTransform: 'none', borderRadius: 2, px: 2, whiteSpace: 'nowrap' }}
            >
              {buscarProyectoLoading ? <CircularProgress size={20} color="inherit" /> : 'Buscar'}
            </Button>
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 11, bgcolor: '#f8faff' } }}>
                  <TableCell>Cliente / Empresa</TableCell>
                  <TableCell>RUC / DNI</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Proy.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buscarProyectoLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                )}
                {!buscarProyectoLoading && buscarProyectoResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      {buscarProyectoQ.trim()
                        ? 'No se encontraron clientes con ese criterio.'
                        : 'No hay clientes registrados en el CRM.'}
                    </TableCell>
                  </TableRow>
                )}
                {!buscarProyectoLoading && buscarProyectoResults.map((c) => {
                  const selected = clienteSelBusqueda?.id_cliente === c.id_cliente;
                  return (
                    <TableRow
                      key={c.id_cliente}
                      hover
                      selected={selected}
                      onClick={() => setClienteSelBusqueda(c)}
                      sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: '#e3f2fd !important' } }}
                    >
                      <TableCell>
                        <CeldaNombreCliente
                          nombre={c.nombre_completo || c.nombre}
                          empresa={c.empresa}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{docLabel(c)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {c.email || 'Sin correo'}
                        </Typography>
                        {(c.whatsapp || c.telefono) && (
                          <Typography variant="caption" color="text.secondary">
                            {[c.whatsapp && `WA ${c.whatsapp}`, c.telefono && `Tel ${c.telefono}`].filter(Boolean).join(' · ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{estadoChip(c)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={c.proyectos_count ?? 0}
                          size="small"
                          sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700, minWidth: 24, height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {clienteSelBusqueda && (
            <Alert severity="success" sx={{ mt: 2, fontSize: 12 }}>
              Seleccionado: <strong>{clienteSelBusqueda.nombre_completo || clienteSelBusqueda.nombre}</strong>
              {clienteSelBusqueda.empresa ? ` — ${clienteSelBusqueda.empresa}` : ''}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgBuscarProyecto(false)} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={confirmarClienteParaProyecto}
            disabled={!clienteSelBusqueda}
            sx={{ textTransform: 'none' }}
          >
            Agregar proyecto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: registrar cliente (solo alta) */}
      <Dialog open={dlgCliente} onClose={() => setDlgCliente(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Registrar cliente (sin correo obligatorio)
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
            Puede registrar nombre, empresa y RUC/DNI ahora. El correo se vinculará cuando el usuario se registre o sea activado.
          </Alert>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField label="Nombre *" size="small" fullWidth value={formCliente.nombre}
              onChange={(e) => setFormCliente((f) => ({ ...f, nombre: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Apellido" size="small" fullWidth value={formCliente.apellido}
              onChange={(e) => setFormCliente((f) => ({ ...f, apellido: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Empresa / Razón social" size="small" fullWidth value={formCliente.empresa}
              onChange={(e) => setFormCliente((f) => ({ ...f, empresa: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="RUC" size="small" fullWidth value={formCliente.ruc}
              onChange={(e) => setFormCliente((f) => ({ ...f, ruc: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="DNI" size="small" fullWidth value={formCliente.dni}
              onChange={(e) => setFormCliente((f) => ({ ...f, dni: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Teléfono" size="small" fullWidth value={formCliente.telefono}
              onChange={(e) => setFormCliente((f) => ({ ...f, telefono: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="WhatsApp" size="small" fullWidth value={formCliente.whatsapp}
              onChange={(e) => setFormCliente((f) => ({ ...f, whatsapp: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Correo (opcional)" size="small" fullWidth type="email" value={formCliente.email}
              onChange={(e) => setFormCliente((f) => ({ ...f, email: e.target.value }))} /></Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <InputLabel>Estado operativo</InputLabel>
                <Select
                  label="Estado operativo"
                  value={formCliente.id_notificacion_estado ?? ''}
                  onChange={(e) => setFormCliente((f) => ({ ...f, id_notificacion_estado: e.target.value || null }))}
                >
                  <MenuItem value=""><em>— Sin asignar —</em></MenuItem>
                  {estadosPara('cliente').map((e) => (
                    <MenuItem key={e.id_estado} value={e.id_estado}>{e.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField label="Notas" size="small" fullWidth multiline rows={2} value={formCliente.notas}
              onChange={(e) => setFormCliente((f) => ({ ...f, notas: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgCliente(false)} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={guardarCliente} disabled={saving || !formCliente.nombre.trim()}
            sx={{ textTransform: 'none' }}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>

      <ClienteProyectoEditModal
        open={dlgEditCombo}
        onClose={cerrarEditCombo}
        saving={saving}
        loadingProject={loadingEditCombo}
        clienteNombre={editClienteNombre}
        tieneProyecto={editTieneProyecto}
        nombreProyecto={formEditProyecto.nombre}
        formCliente={formCliente}
        setFormCliente={setFormCliente}
        formProyecto={formEditProyecto}
        setFormProyecto={setFormEditProyecto}
        modoNombreEdit={modoNombreEdit}
        setModoNombreEdit={setModoNombreEdit}
        tiposCatalogo={tiposCatalogo}
        loadingTipos={loadingTipos}
        tipoProyectoEditSel={tipoProyectoEditSel}
        onTipoEditChange={handleTipoEditProyectoChange}
        estadosCliente={estadosPara('cliente')}
        estadosProyecto={estadosPara('proyecto')}
        progresoOpciones={PROGRESO_OPCIONES}
        ordenPrioridadOpciones={ORDEN_PRIORIDAD_OPCIONES}
        nombreProyectoValido={nombreEditProyectoValido}
        onSave={guardarClienteCombo}
      />

      {/* Dialog: nuevo proyecto */}
      <Dialog open={dlgProyecto} onClose={() => setDlgProyecto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Nuevo proyecto — {createForCliente?.nombre_completo || createForCliente?.nombre}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <ProyectoNombreSelector
              modo={modoNombreProyecto}
              onModoChange={setModoNombreProyecto}
              tipos={tiposCatalogo}
              loadingTipos={loadingTipos}
              tipoSel={tipoProyectoSel}
              onTipoChange={handleTipoProyectoChange}
              nombrePersonalizado={formProyecto.nombre}
              onNombrePersonalizadoChange={(v) => setFormProyecto((f) => ({ ...f, nombre: v }))}
            />
            <TextField label="Descripción" size="small" fullWidth multiline rows={2} value={formProyecto.descripcion}
              onChange={(e) => setFormProyecto((f) => ({ ...f, descripcion: e.target.value }))} />
            <TextField label="Fecha inicio *" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }}
              value={formProyecto.fecha_inicio}
              onChange={(e) => setFormProyecto((f) => ({ ...f, fecha_inicio: e.target.value }))} />
            <TextField label="Fecha entrega *" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }}
              value={formProyecto.fecha_entrega}
              inputProps={{ min: formProyecto.fecha_inicio || undefined }}
              onChange={(e) => setFormProyecto((f) => ({ ...f, fecha_entrega: e.target.value }))} />
            <FormControl size="small" fullWidth>
              <InputLabel>Estado operativo</InputLabel>
              <Select label="Estado operativo" value={formProyecto.id_notificacion_estado ?? ''}
                onChange={(e) => setFormProyecto((f) => ({ ...f, id_notificacion_estado: e.target.value || null }))}>
                <MenuItem value=""><em>Activo (default)</em></MenuItem>
                {estadosPara('proyecto').map((e) => (
                  <MenuItem key={e.id_estado} value={e.id_estado}>{e.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="nuevo-orden-label">Orden de prioridad</InputLabel>
              <Select
                labelId="nuevo-orden-label"
                label="Orden de prioridad"
                value={formProyecto.orden_prioridad ?? 5}
                onChange={(e) => setFormProyecto((f) => ({ ...f, orden_prioridad: e.target.value }))}
              >
                {ORDEN_PRIORIDAD_OPCIONES.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}{n === 1 ? ' — máxima prioridad' : ''}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>1 = máxima prioridad para alertas en rojo</FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgProyecto(false)} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={guardarProyecto}
            disabled={saving || !nombreProyectoValido || !formProyecto.fecha_inicio || !formProyecto.fecha_entrega}
            sx={{ textTransform: 'none' }}>Crear proyecto</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: confirmar crear proyecto tras registrar cliente */}
      <Dialog open={dlgConfirmProyecto} onClose={cancelarCrearProyectoAhora} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderOpenIcon color="primary" />
          Cliente registrado
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{clienteRecienCreado?.nombre_completo || clienteRecienCreado?.nombre}</strong> fue registrado correctamente.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            ¿Desea crear un proyecto para este cliente ahora?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelarCrearProyectoAhora} sx={{ textTransform: 'none' }}>Ahora no</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={confirmarCrearProyectoAhora}
            sx={{ textTransform: 'none' }}>
            Sí, crear proyecto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: editar proyecto */}
      <Dialog open={dlgEditProyecto} onClose={() => !loadingEditProyecto && setDlgEditProyecto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar proyecto</DialogTitle>
        <DialogContent>
          {loadingEditProyecto ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Cargando datos del proyecto…
            </Typography>
          ) : (
          <Stack key={editProyectoId} spacing={1.5} sx={{ mt: 1 }}>
            <ProyectoNombreSelector
              modo={modoNombreEdit}
              onModoChange={setModoNombreEdit}
              tipos={tiposCatalogo}
              loadingTipos={loadingTipos}
              tipoSel={tipoProyectoEditSel}
              onTipoChange={handleTipoEditProyectoChange}
              nombrePersonalizado={formEditProyecto.nombre}
              onNombrePersonalizadoChange={(v) => setFormEditProyecto((f) => ({ ...f, nombre: v }))}
            />
            <TextField label="Descripción" size="small" fullWidth multiline rows={2}
              value={formEditProyecto.descripcion}
              onChange={(e) => setFormEditProyecto((f) => ({ ...f, descripcion: e.target.value }))} />
            <TextField label="Fecha inicio *" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }}
              value={formEditProyecto.fecha_inicio}
              onChange={(e) => setFormEditProyecto((f) => ({ ...f, fecha_inicio: e.target.value }))} />
            <TextField label="Fecha entrega *" type="date" size="small" fullWidth required InputLabelProps={{ shrink: true }}
              value={formEditProyecto.fecha_entrega}
              inputProps={{ min: formEditProyecto.fecha_inicio || undefined }}
              onChange={(e) => setFormEditProyecto((f) => ({ ...f, fecha_entrega: e.target.value }))} />
            <FormControl size="small" fullWidth>
              <InputLabel id="edit-progreso-label">Progreso (%)</InputLabel>
              <Select
                labelId="edit-progreso-label"
                label="Progreso (%)"
                value={formEditProyecto.progreso}
                onChange={(e) => setFormEditProyecto((f) => ({ ...f, progreso: e.target.value }))}
              >
                {PROGRESO_OPCIONES.map((pct) => (
                  <MenuItem key={pct} value={pct}>{pct}%</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Estado operativo</InputLabel>
              <Select label="Estado operativo" value={formEditProyecto.id_notificacion_estado ?? ''}
                onChange={(e) => setFormEditProyecto((f) => ({ ...f, id_notificacion_estado: e.target.value || null }))}>
                <MenuItem value=""><em>— Sin asignar —</em></MenuItem>
                {estadosPara('proyecto').map((e) => (
                  <MenuItem key={e.id_estado} value={e.id_estado}>{e.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="edit-orden-label">Orden de prioridad</InputLabel>
              <Select
                labelId="edit-orden-label"
                label="Orden de prioridad"
                value={formEditProyecto.orden_prioridad ?? 5}
                onChange={(e) => setFormEditProyecto((f) => ({ ...f, orden_prioridad: e.target.value }))}
              >
                {ORDEN_PRIORIDAD_OPCIONES.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}{n === 1 ? ' — máxima prioridad' : ''}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>1 = máxima prioridad. Orden 1 en rojo: recordatorio cada 10 min.</FormHelperText>
            </FormControl>
          </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgEditProyecto(false)} disabled={loadingEditProyecto} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEditProyecto}
            disabled={saving || loadingEditProyecto || !nombreEditProyectoValido
              || !formEditProyecto.fecha_inicio || !formEditProyecto.fecha_entrega}
            sx={{ textTransform: 'none' }}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: confirmar eliminar proyecto */}
      <Dialog open={dlgEliminarProyecto} onClose={cancelarEliminarProyecto} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
          <DeleteIcon />
          Eliminar proyecto
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Eliminar el proyecto <strong>{proyectoAEliminar?.nombre}</strong> y todos sus archivos asociados?
          </Typography>
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1.5 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelarEliminarProyecto} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarEliminarProyecto}
            disabled={saving} sx={{ textTransform: 'none' }}>
            {saving ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: confirmar eliminar cliente */}
      <Dialog open={dlgEliminarCliente} onClose={cancelarEliminarCliente} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
          <DeleteIcon />
          Eliminar cliente
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Eliminar el cliente <strong>{clienteAEliminar?.nombre_completo || clienteAEliminar?.nombre || ''}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Solo se permite si el cliente no tiene proyectos asignados.
          </Typography>
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1.5 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelarEliminarCliente} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarEliminarCliente}
            disabled={saving} sx={{ textTransform: 'none' }}>
            {saving ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={cerrarMenuAcciones}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 260, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}
      >
        {menuCliente && (() => {
          const ultimoMenuProy = ultimoProyectoCliente(menuCliente);
          const puedeEliminarCliente = Number(menuCliente.proyectos_count || 0) === 0;
          const cerrarY = (fn) => () => {
            fn(menuCliente);
            cerrarMenuAcciones();
          };
          return (
            <>
              {menuCliente.id_cliente && (
                <MenuItem onClick={cerrarY(openEditarCliente)}>
                  <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#1565c0' }} />
                  Editar cliente
                </MenuItem>
              )}
              <MenuItem
                disabled={!ultimoMenuProy?.id_proyecto}
                onClick={() => {
                  if (ultimoMenuProy?.id_proyecto) {
                    navigate(`/campus/proyecto/${ultimoMenuProy.id_proyecto}`);
                    cerrarMenuAcciones();
                  }
                }}
              >
                <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: '#455a64' }} />
                {ultimoMenuProy ? `Abrir: ${ultimoMenuProy.nombre}` : 'Abrir proyecto'}
              </MenuItem>
              <MenuItem
                disabled={!ultimoMenuProy?.id_proyecto}
                onClick={() => {
                  if (ultimoMenuProy?.id_proyecto) {
                    navigate(`/campus/proyecto/${ultimoMenuProy.id_proyecto}/agenda`);
                    cerrarMenuAcciones();
                  }
                }}
              >
                <EventNoteIcon fontSize="small" sx={{ mr: 1.5, color: '#00695c' }} />
                Agenda / Gantt
              </MenuItem>
              {menuCliente.id_cliente && (
                <MenuItem onClick={cerrarY(abrirOnboarding)}>
                  <LinkIcon fontSize="small" sx={{ mr: 1.5, color: '#7b1fa2' }} />
                  Onboarding — enviar enlace
                </MenuItem>
              )}
              {menuCliente.id_cliente && (
                <MenuItem
                  disabled={reporteLoadingId === menuCliente.id_cliente}
                  onClick={() => {
                    abrirReporte(menuCliente);
                    cerrarMenuAcciones();
                  }}
                >
                  {reporteLoadingId === menuCliente.id_cliente ? (
                    <CircularProgress size={16} sx={{ mr: 1.5 }} color="error" />
                  ) : (
                    <PictureAsPdfIcon fontSize="small" sx={{ mr: 1.5, color: '#b71c1c' }} />
                  )}
                  Ver reporte PDF
                </MenuItem>
              )}
              <MenuItem onClick={cerrarY(openNuevoProyecto)}>
                <AddIcon fontSize="small" sx={{ mr: 1.5, color: '#1976d2' }} />
                Nuevo proyecto
              </MenuItem>
              {menuCliente.id_cliente && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={() => abrirNotas(menuCliente)}>
                    <NotesIcon fontSize="small" sx={{ mr: 1.5, color: '#1976d2' }} />
                    Sistema de notas
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem onClick={() => abrirEditor(menuCliente)}>
                      <CodeIcon fontSize="small" sx={{ mr: 1.5, color: '#4ec9b0' }} />
                      Editor de código
                    </MenuItem>
                  )}
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    disabled={!puedeEliminarCliente}
                    onClick={() => {
                      if (puedeEliminarCliente) {
                        openEliminarCliente(menuCliente);
                        cerrarMenuAcciones();
                      }
                    }}
                    sx={puedeEliminarCliente ? { color: '#d32f2f' } : undefined}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: puedeEliminarCliente ? '#d32f2f' : 'inherit' }} />
                    {puedeEliminarCliente ? 'Eliminar cliente' : 'Eliminar (tiene proyectos)'}
                  </MenuItem>
                </>
              )}
            </>
          );
        })()}
      </Menu>

      <ClienteNotasDialog
        open={notasOpen}
        onClose={() => { setNotasOpen(false); setNotasCliente(null); }}
        cliente={notasCliente}
      />

      {isAdmin && (
        <ClienteCodeEditorDialog
          open={codeOpen}
          onClose={() => { setCodeOpen(false); setCodeCliente(null); }}
          cliente={codeCliente}
        />
      )}

      {/* Modal: Onboarding */}
      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        cliente={onboardingCliente}
      />

      {/* ── Modal: Reporte PDF del cliente (blob — visor nativo) ── */}
      <Dialog open={!!reporteUrl} onClose={cerrarReporte} fullWidth maxWidth="lg"
        sx={{ zIndex: 1400 }}
        PaperProps={{ sx: { height: '92vh', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, px: 2.5, bgcolor: '#1565c0', color: '#fff', flexShrink: 0 }}>
          <PictureAsPdfIcon />
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={700}>Reporte de Onboarding</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{reporteNombre}</Typography>
          </Box>
          <IconButton onClick={cerrarReporte} size="small" sx={{ color: '#fff' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box flex={1} sx={{ overflow: 'hidden', minHeight: 0, bgcolor: '#525659' }}>
          {reporteUrl && (
            <iframe
              src={reporteUrl}
              title="Reporte de cliente"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}
        </Box>

        <Box sx={{ px: 2, py: 1, borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Button onClick={cerrarReporte} color="inherit">Cerrar</Button>
          <Box flex={1} />
          <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />}
            component="a"
            href={reporteUrl}
            download={`reporte-onboarding-${reporteToken}.pdf`}
          >
            Descargar PDF
          </Button>
        </Box>
      </Dialog>

      {/* Dialog: vincular pendiente */}
      <Dialog open={dlgVincular} onClose={() => setDlgVincular(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Vincular usuario a cliente</DialogTitle>
        <DialogContent>
          {vincularUser && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: 12 }}>
              Usuario: <strong>{vincularUser.name}</strong> ({vincularUser.email}) — se activará al vincular.
            </Alert>
          )}
          <Autocomplete
            options={opcionesVinculo}
            getOptionLabel={(o) => `${o.nombre_completo}${o.empresa ? ` — ${o.empresa}` : ''}${o.ruc ? ` [RUC ${o.ruc}]` : ''}`}
            value={vincularCliente}
            onChange={(_, v) => setVincularCliente(v)}
            onInputChange={(_, v) => buscarParaVincular(v)}
            renderInput={(params) => (
              <TextField {...params} label="Buscar cliente por RUC, DNI, nombre o proyecto" size="small" />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgVincular(false)} sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" startIcon={<LinkIcon />} onClick={confirmarVincular}
            disabled={saving || !vincularCliente} sx={{ textTransform: 'none' }}>
            Vincular y activar
          </Button>
        </DialogActions>
      </Dialog>

      <NotificacionAdminPanel open={dlgNotifAdmin} onClose={() => setDlgNotifAdmin(false)} />
    </Box>
  );
}
