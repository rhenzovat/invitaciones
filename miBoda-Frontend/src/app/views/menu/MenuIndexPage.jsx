import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useIntl, injectIntl } from "react-intl";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import { alpha, styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ListIcon from "@mui/icons-material/List";
import FolderIcon from "@mui/icons-material/Folder";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import LinkIcon from "@mui/icons-material/Link";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import LabelIcon from "@mui/icons-material/Label";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import { listar, listarModulos, crearModulo, convertirSinModulo, actualizarModulo, eliminarModulo, reordenarModulos, listarOrdenSidebar, listarMiOrdenSidebar, reordenarSidebar, guardarEtiquetaSidebar, crear, actualizar, eliminar, reordenar, listarObjetosMenu, asignarObjeto, quitarObjeto, listarObjetosModulo, asignarObjetoModulo, quitarObjetoModulo } from "../../api/menu.api";
import MenuSidebarIcon from "./MenuSidebarIcon";
import { listar as listarRoles } from "../../api/roles.api";
import MenuSidebarOrderCanvas from "./MenuSidebarOrderCanvas";
import MenuSidebarNombrePanel from "./MenuSidebarNombrePanel";
import MenuUrlsTab from "./MenuUrlsTab";
import MenuEtiquetaSelect from "./MenuEtiquetaSelect";
import { filterModuloTree, collectMenuTreeExpandKeys } from "./filterMenuTree";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import { listar as listarObjetos } from "../../api/objetos.api";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import { isNotEmpty } from "../../utils/utils";
import { refreshAppSidebarMenu } from "app/utils/refreshAppSidebarMenu";

/* ─── Colores del árbol ─── */
const TREE_COLORS = {
  module: { bg: "#e3f2fd", border: "#1976d2", icon: "#1565c0", hoverBg: "#bbdefb" },
  folder: { bg: "#f1f8e9", border: "#66bb6a", icon: "#2e7d32", hoverBg: "#dcedc8" },
  leaf: { icon: "#78909c", dot: "#90a4ae" },
};

/** Construye árbol de menús por id_menu_padre (raíz = sin padre, luego hijos anidados). */
function buildMenuTree(menus) {
  const list = menus || [];
  const byParent = new Map();
  list.forEach((m) => {
    const p = m.id_menu_padre ?? "__root";
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(m);
  });
  byParent.forEach((arr) => arr.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
  function addChildren(parentKey) {
    return (byParent.get(parentKey) || []).map((m) => ({ ...m, children: addChildren(m.id_menu) }));
  }
  return addChildren("__root");
}

function EtiquetasChips({ etiquetas, max = 3 }) {
  if (!Array.isArray(etiquetas) || etiquetas.length === 0) return null;
  const visible = etiquetas.slice(0, max);
  const rest = etiquetas.length - visible.length;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.35, ml: 0.5 }}>
      {visible.map((t) => (
        <Chip
          key={t.id_etiqueta}
          label={t.nombre}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.62rem",
            fontWeight: 600,
            bgcolor: t.color || "#6366f1",
            color: "#fff",
          }}
        />
      ))}
      {rest > 0 && (
        <Chip label={`+${rest}`} size="small" sx={{ height: 18, fontSize: "0.62rem" }} />
      )}
    </Box>
  );
}

/** Construye árbol por MÓDULOS; bajo cada módulo, los menús son un árbol por id_menu_padre (multinivel). */
function buildTreeByModulo(items, modulosLista) {
  const lista = items || [];
  if (modulosLista && modulosLista.length > 0) {
    const modsSorted = [...modulosLista].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const mods = modsSorted.map((mod) => {
      const menusInModulo = lista.filter((m) => m.id_modulo === mod.id_modulo);
      return {
        type: "modulo",
        id_modulo: mod.id_modulo,
        nombre: mod.nombre || `Módulo ${mod.id_modulo}`,
        url: mod.url || "",
        Icon: mod.Icon || "",
        Activo: mod.Activo || "S",
        etiquetas: mod.etiquetas || [],
        children: buildMenuTree(menusInModulo),
      };
    });
    const sinModulo = lista.filter((m) => m.id_modulo == null);
    if (sinModulo.length > 0) {
      return [...mods, { type: "modulo", id_modulo: null, nombre: "Sin módulo", children: buildMenuTree(sinModulo) }];
    }
    return mods;
  }
  if (!lista.length) return [];
  const byModulo = new Map();
  lista.forEach((m) => {
    const id = m.id_modulo;
    const key = id == null ? "__null" : id;
    if (!byModulo.has(key)) byModulo.set(key, { type: "modulo", id_modulo: id, nombre: id == null ? "Sin módulo" : (m.modulo_nombre || `Módulo ${id}`), children: [] });
    byModulo.get(key).children.push(m);
  });
  byModulo.forEach((g) => {
    g.children = buildMenuTree(g.children);
  });
  return Array.from(byModulo.values()).sort((a, b) => {
    if (a.id_modulo == null) return 1;
    if (b.id_modulo == null) return -1;
    return (a.id_modulo ?? 0) - (b.id_modulo ?? 0);
  });
}

/** Ícono del nodo en el lienzo: etiqueta del rol, luego BD, luego primer hijo (módulos). */
function resolveTreeIcon(entity, { esModulo = false, etiquetasMap = {} } = {}) {
  const idModulo = entity?.id_modulo;
  const idMenu = entity?.id_menu;
  const key = esModulo || entity?.type === "modulo"
    ? (idModulo != null ? `m-${idModulo}` : null)
    : (idMenu != null ? `n-${idMenu}` : null);

  if (key && etiquetasMap[key]) {
    return etiquetasMap[key];
  }

  const direct = (entity?.icon ?? entity?.Icon ?? "").trim();
  if (direct) return direct;

  if (esModulo && entity?.children?.length) {
    const first = entity.children[0];
    return (first?.icon ?? first?.Icon ?? "").trim() || null;
  }

  return null;
}

function buildSidebarEtiquetasMap(items) {
  const map = {};
  (items || []).forEach((it) => {
    const key = it.tipo === "modulo" ? `m-${it.id_modulo}` : `n-${it.id_menu}`;
    const icon = (it.icon ?? it.Icon ?? "").trim();
    if (icon) map[key] = icon;
  });
  return map;
}

/** Cuenta total de descendientes recursivamente */
function countDescendants(children) {
  if (!children) return 0;
  return children.reduce((acc, c) => acc + 1 + countDescendants(c.children), 0);
}

/** Opciones para "Menú padre": Raíz + árbol con ruta visible */
function parentOptions(lista, excludeIdMenu) {
  const excludeSet = new Set();
  if (excludeIdMenu != null) {
    const addDescendants = (id) => {
      excludeSet.add(id);
      lista.filter((m) => m.id_menu_padre === id).forEach((m) => addDescendants(m.id_menu));
    };
    addDescendants(excludeIdMenu);
  }
  const byParent = new Map();
  (lista || []).forEach((m) => {
    const p = m.id_menu_padre ?? "__root";
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(m);
  });
  byParent.forEach((arr) => arr.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
  const out = [{ value: null, label: "Raíz (nivel superior)", path: "Raíz", level: 0 }];
  const walk = (parentKey, level, parentPath) => {
    const children = byParent.get(parentKey) || [];
    children.forEach((m) => {
      if (excludeSet.has(m.id_menu)) return;
      const path = parentPath ? `${parentPath} › ${m.nombre || `Menú ${m.id_menu}`}` : (m.nombre || `Menú ${m.id_menu}`);
      out.push({ value: m.id_menu, label: m.nombre || `(Menú ${m.id_menu})`, path, level });
      walk(m.id_menu, level + 1, path);
    });
  };
  walk("__root", 0, "");
  return out;
}

/* ─── Estilos reutilizables para nodos del árbol ─── */
const nodeActionsSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.25,
  flexShrink: 0,
};

const nodeRowSx = {
  display: "flex",
  alignItems: "center",
  px: 1.5,
  py: 0.75,
  borderRadius: 1.5,
  transition: "background-color 0.15s ease",
  "&:hover": { bgcolor: "action.hover" },
};

const PageWrap = styled(Box)({});

/** Tooltip cuando el módulo padre del árbol está desactivado (cabecera o subniveles). */
const TIP_ARBOL_MODULO_INACTIVO = "El módulo contenedor está desactivado: actívelo para usar esta acción.";
/** Tooltip cuando el propio menú (nodo) está inactivo. */
const TIP_MENU_ITEM_INACTIVO = "Menú desactivado: actívelo para usar esta acción.";

function MenuIndexPageInner(props) {
  const { setLoading, useAuth } = props;
  const { perfil } = useAuth();
  const { panelLeft } = useCmsPanelLayout();
  const intl = useIntl();
  const [lista, setLista] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    id_modulo: null,
    id_menu_padre: null,
    url: "",
    Icon: "",
    Activo: "S",
    id_etiquetas: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [objetosModalOpen, setObjetosModalOpen] = useState(false);
  const [menuParaObjetos, setMenuParaObjetos] = useState(null);
  const [objetosLista, setObjetosLista] = useState([]);
  const [objetosAsignados, setObjetosAsignados] = useState([]);
  const [objetosSeleccionados, setObjetosSeleccionados] = useState(new Set());
  const [objetosModalLoading, setObjetosModalLoading] = useState(false);
  const [objetosGuardando, setObjetosGuardando] = useState(false);
  const [fullListForForm, setFullListForForm] = useState(null);
  const [modulosLista, setModulosLista] = useState([]);
  const [dialogNuevoModuloOpen, setDialogNuevoModuloOpen] = useState(false);
  const [nuevoModuloNombre, setNuevoModuloNombre] = useState("");
  const [nuevoModuloUrl, setNuevoModuloUrl] = useState("");
  const [nuevoModuloIcon, setNuevoModuloIcon] = useState("");
  const [moduloEtiquetas, setModuloEtiquetas] = useState([]);
  const [nuevoModuloGuardando, setNuevoModuloGuardando] = useState(false);
  const etiquetasRolId = perfil?.id_roles != null ? Number(perfil.id_roles) : null;
  const [editingModulo, setEditingModulo] = useState(null);
  /** Convirtiendo el grupo virtual «Sin módulo» en módulo real de BD */
  const [convirtiendoSinModulo, setConvirtiendoSinModulo] = useState(false);
  const [sinModuloMenuCount, setSinModuloMenuCount] = useState(0);
  const [confirmEliminarModulo, setConfirmEliminarModulo] = useState(null);
  /** { mod, nextActivo: 'S' | 'N' } — confirmar activar/desactivar módulo */
  const [confirmToggleModulo, setConfirmToggleModulo] = useState(null);
  /** { node, nextActivo: 'S' | 'N' } — confirmar activar/desactivar menú (cualquier nivel) */
  const [confirmToggleMenu, setConfirmToggleMenu] = useState(null);
  /** Vista del lienzo de módulos: todos | activos | inactivos */
  const [moduloVista, setModuloVista] = useState("activos");
  /** Búsqueda en árbol de módulos/menús (nombre o URL) */
  const [arbolSearchQuery, setArbolSearchQuery] = useState("");
  const dragModRef = useRef(null);
  const [dragOverModIdx, setDragOverModIdx] = useState(null);
  const [sidebarOrdenItems, setSidebarOrdenItems] = useState([]);
  const [sidebarOrdenLoading, setSidebarOrdenLoading] = useState(false);
  const [sidebarOrdenSaving, setSidebarOrdenSaving] = useState(false);
  const [sidebarEtiquetasMap, setSidebarEtiquetasMap] = useState({});
  const [rolesLista, setRolesLista] = useState([]);
  const [ordenRolId, setOrdenRolId] = useState("");
  const ordenRolInitialized = useRef(false);
  const [sidebarEditPanelOpen, setSidebarEditPanelOpen] = useState(false);
  useCmsPanelPush(sidebarEditPanelOpen);
  const [sidebarEditingItem, setSidebarEditingItem] = useState(null);
  const [sidebarNombreDraft, setSidebarNombreDraft] = useState("");
  const [sidebarIconoDraft, setSidebarIconoDraft] = useState("");
  const [sidebarNombreSaving, setSidebarNombreSaving] = useState(false);
  const initialLoadDone = useRef(false);
  const [replicarDialogOpen, setReplicarDialogOpen] = useState(false);
  const [replicarTargetRolId, setReplicarTargetRolId] = useState("");
  const [replicarSaving, setReplicarSaving] = useState(false);

  const sidebarItemKey = (it) => (it?.tipo === "modulo" ? `m-${it.id_modulo}` : `n-${it.id_menu}`);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [menusData, modulosData] = await Promise.all([
        listar(undefined, etiquetasRolId),
        listarModulos(etiquetasRolId),
      ]);
      setLista(Array.isArray(menusData) ? menusData : []);
      setModulosLista(Array.isArray(modulosData) ? modulosData : []);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, intl, etiquetasRolId]);

  const loadFullListForForm = useCallback(async () => {
    try {
      const [menusData, modulosData] = await Promise.all([
        fullListForForm == null ? listar(undefined, etiquetasRolId) : Promise.resolve(fullListForForm),
        listarModulos(etiquetasRolId),
      ]);
      if (fullListForForm == null) setFullListForForm(Array.isArray(menusData) ? menusData : []);
      setModulosLista(Array.isArray(modulosData) ? modulosData : []);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }
  }, [fullListForForm, intl, etiquetasRolId]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadAll();
    listarRoles()
      .then((rows) => setRolesLista(Array.isArray(rows) ? rows : []))
      .catch(() => setRolesLista([]));
  }, [loadAll]);

  useEffect(() => {
    if (ordenRolInitialized.current) return;
    const sessionRol = perfil?.id_roles != null ? Number(perfil.id_roles) : null;
    if (!sessionRol || !rolesLista.length) return;
    const exists = rolesLista.some((r) => Number(r.id_roles) === sessionRol);
    if (exists) {
      setOrdenRolId(sessionRol);
      ordenRolInitialized.current = true;
    }
  }, [perfil?.id_roles, rolesLista]);

  const loadSidebarEtiquetas = useCallback(async (idRol) => {
    const rol = Number(idRol);
    if (!rol) {
      setSidebarEtiquetasMap({});
      return;
    }
    try {
      const data = await listarMiOrdenSidebar(rol);
      setSidebarEtiquetasMap(buildSidebarEtiquetasMap(data));
    } catch {
      setSidebarEtiquetasMap({});
    }
  }, []);

  const loadSidebarOrden = useCallback(async () => {
    const idRol = Number(ordenRolId);
    if (!idRol) return;
    setSidebarOrdenLoading(true);
    try {
      const data = await listarOrdenSidebar(idRol);
      const rows = Array.isArray(data) ? data : [];
      setSidebarOrdenItems(rows);
      setSidebarEtiquetasMap(buildSidebarEtiquetasMap(rows));
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSidebarOrdenLoading(false);
    }
  }, [intl, ordenRolId]);

  useEffect(() => {
    const sessionRol = perfil?.id_roles != null ? Number(perfil.id_roles) : null;
    if (sessionRol) loadSidebarEtiquetas(sessionRol);
  }, [perfil?.id_roles, loadSidebarEtiquetas]);

  useEffect(() => {
    if (moduloVista === "orden_sidebar" && ordenRolId) {
      loadSidebarOrden();
    }
  }, [moduloVista, ordenRolId, loadSidebarOrden]);

  const handleSidebarOrdenReorder = async (items) => {
    const idRol = Number(ordenRolId);
    if (!idRol) return;
    setSidebarOrdenSaving(true);
    try {
      await reordenarSidebar(idRol, items);
      await refreshAppSidebarMenu();
      toastSuccess("Orden del sidebar guardado para este rol");
      await loadSidebarOrden();
      setFullListForForm(null);
      loadAll();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSidebarOrdenSaving(false);
    }
  };

  const rolOrdenNombre = rolesLista.find((r) => Number(r.id_roles) === Number(ordenRolId))?.nombre;

  const handleReplicarOrden = async () => {
    const targetRol = Number(replicarTargetRolId);
    if (!targetRol || !sidebarOrdenItems.length) return;
    setReplicarSaving(true);
    try {
      const payload = sidebarOrdenItems.map((it, i) => ({
        tipo: it.tipo,
        id_menu: it.id_menu ?? undefined,
        id_modulo: it.id_modulo ?? undefined,
        orden: i,
        nombre_sidebar: (it.nombre || "").trim() || undefined,
        icon_sidebar: (it.icon || "").trim() || undefined,
      }));
      await reordenarSidebar(targetRol, payload);
      const targetNombre = rolesLista.find((r) => Number(r.id_roles) === targetRol)?.nombre || `Rol ${targetRol}`;
      toastSuccess(`Orden replicado al rol «${targetNombre}» correctamente`);
      setReplicarDialogOpen(false);
      setReplicarTargetRolId("");
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setReplicarSaving(false);
    }
  };

  const handleSidebarEditItem = (item) => {
    setSidebarEditingItem(item);
    setSidebarNombreDraft((item?.nombre || "").trim());
    setSidebarIconoDraft(item?.icon || item?.Icon || "");
    setSidebarEditPanelOpen(true);
  };

  const resetSidebarEditPanel = () => {
    setSidebarEditPanelOpen(false);
    setSidebarEditingItem(null);
    setSidebarNombreDraft("");
    setSidebarIconoDraft("");
  };

  const handleCloseSidebarEditPanel = () => {
    if (sidebarNombreSaving) return;
    resetSidebarEditPanel();
  };

  const handleSaveSidebarNombre = async () => {
    const nombre = (sidebarNombreDraft || "").trim();
    const icono = (sidebarIconoDraft || "").trim();
    if (!nombre || !sidebarEditingItem || !ordenRolId) return;

    setSidebarNombreSaving(true);
    try {
      const payload = {
        tipo: sidebarEditingItem.tipo,
        nombre,
        icon: icono || null,
        ...(sidebarEditingItem.tipo === "modulo"
          ? { id_modulo: sidebarEditingItem.id_modulo }
          : { id_menu: sidebarEditingItem.id_menu }),
      };
      await guardarEtiquetaSidebar(ordenRolId, payload);
      await refreshAppSidebarMenu();
      const key = sidebarItemKey(sidebarEditingItem);
      setSidebarOrdenItems((prev) => prev.map((it) => (
        sidebarItemKey(it) === key ? { ...it, nombre, icon: icono || null } : it
      )));
      setSidebarEtiquetasMap((prev) => ({
        ...prev,
        ...(icono ? { [key]: icono } : {}),
      }));
      setFullListForForm(null);
      await loadAll();
      await loadSidebarOrden();
      if (Number(ordenRolId) === Number(perfil?.id_roles)) {
        await loadSidebarEtiquetas(perfil.id_roles);
      }
      toastSuccess("Nombre actualizado en sidebar y en el lienzo de módulos");
      resetSidebarEditPanel();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSidebarNombreSaving(false);
    }
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const keys = new Set();
    tree.forEach((mod) => {
      keys.add(`modulo_${mod.id_modulo}`);
      const addKeys = (nodes) => {
        nodes.forEach((n) => {
          if (n.children && n.children.length) {
            keys.add(`menu_${n.id_menu}`);
            addKeys(n.children);
          }
        });
      };
      addKeys(mod.children || []);
    });
    setExpanded(keys);
  };

  const collapseAll = () => setExpanded(new Set());

  const openNew = (idModuloOrParentId = null, isModule = false, parentMenuNode = null) => {
    loadFullListForForm();
    const idPadre = isModule ? null : (idModuloOrParentId ?? null);
    const idModulo = isModule ? idModuloOrParentId : (parentMenuNode?.id_modulo ?? null);
    setFormData({
      nombre: "",
      id_modulo: idModulo,
      id_menu_padre: idPadre,
      url: "",
      Icon: "",
      Activo: "S",
      id_etiquetas: [],
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    loadFullListForForm();
    setFormData({
      id_menu: row.id_menu,
      nombre: row.nombre ?? "",
      id_modulo: row.id_modulo ?? null,
      id_menu_padre: row.id_menu_padre ?? null,
      url: row.url ?? "",
      Icon: row.icon ?? row.Icon ?? "",
      Activo: row.Activo ?? "S",
      id_etiquetas: (row.etiquetas || []).map((t) => t.id_etiqueta),
    });
    setEditingId(row.id_menu);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!isNotEmpty(formData.nombre)) return;
    const list = fullListForForm || lista;
    let idModulo = formData.id_modulo ?? null;
    if (idModulo == null && formData.id_menu_padre != null) {
      const parent = list.find((m) => m.id_menu === formData.id_menu_padre);
      if (parent) idModulo = parent.id_modulo ?? null;
    }
    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre,
        id_modulo: idModulo,
        id_menu_padre: formData.id_menu_padre ?? null,
        url: formData.url || null,
        Icon: formData.Icon || null,
        Activo: formData.Activo ?? "S",
        id_etiquetas: formData.id_etiquetas || [],
        id_roles: etiquetasRolId,
      };
      if (editingId) {
        await actualizar({ id_menu: editingId, ...payload });
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      } else {
        await crear(payload);
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      }
      setDialogOpen(false);
      setFullListForForm(null);
      await loadAll();
      await refreshAppSidebarMenu();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    setLoading(true);
    try {
      await eliminar({ id_menu: confirmEliminar.id_menu });
      toastSuccess("Registro eliminado");
      setConfirmEliminar(null);
      setFullListForForm(null);
      await loadAll();
      await refreshAppSidebarMenu();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  /** Mueve el ítem una posición arriba: reindexa solo sus hermanos (0,1,2,...) para no desordenar el resto. */
  const moveUp = (node, siblings) => {
    const idx = siblings.findIndex((s) => s.id_menu === node.id_menu);
    if (idx <= 0) return;
    const newOrder = [...siblings];
    newOrder.splice(idx, 1);
    newOrder.splice(idx - 1, 0, node);
    const parentId = node.id_menu_padre ?? null;
    const items = newOrder.map((m, i) => ({ id_menu: m.id_menu, id_menu_padre: parentId, orden: i }));
    reordenar(items)
      .then(async () => {
        toastSuccess("Orden actualizado");
        setFullListForForm(null);
        await loadAll();
        await refreshAppSidebarMenu();
      })
      .catch((err) => handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err));
  };

  /** Mueve el ítem una posición abajo: reindexa solo sus hermanos (0,1,2,...) para no desordenar el resto. */
  const moveDown = (node, siblings) => {
    const idx = siblings.findIndex((s) => s.id_menu === node.id_menu);
    if (idx < 0 || idx >= siblings.length - 1) return;
    const newOrder = [...siblings];
    newOrder.splice(idx, 1);
    newOrder.splice(idx + 1, 0, node);
    const parentId = node.id_menu_padre ?? null;
    const items = newOrder.map((m, i) => ({ id_menu: m.id_menu, id_menu_padre: parentId, orden: i }));
    reordenar(items)
      .then(async () => {
        toastSuccess("Orden actualizado");
        setFullListForForm(null);
        await loadAll();
        await refreshAppSidebarMenu();
      })
      .catch((err) => handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err));
  };

  const handleModuloDragStart = (idx) => {
    dragModRef.current = idx;
  };

  const handleModuloDragOver = (e, idx) => {
    e.preventDefault();
    if (dragModRef.current !== null && dragModRef.current !== idx) {
      setDragOverModIdx(idx);
    }
  };

  const handleModuleDrop = (e, dropIdx, modulosList) => {
    e.preventDefault();
    const fromIdx = dragModRef.current;
    dragModRef.current = null;
    setDragOverModIdx(null);
    if (fromIdx === null || fromIdx === dropIdx) return;
    const realMods = modulosList.filter((m) => m.id_modulo != null);
    const fromMod = modulosList[fromIdx];
    const toMod = modulosList[dropIdx];
    if (!fromMod || !toMod || fromMod.id_modulo == null || toMod.id_modulo == null) return;
    const realFrom = realMods.findIndex((m) => m.id_modulo === fromMod.id_modulo);
    const realTo = realMods.findIndex((m) => m.id_modulo === toMod.id_modulo);
    if (realFrom < 0 || realTo < 0) return;
    const newList = [...realMods];
    const [moved] = newList.splice(realFrom, 1);
    newList.splice(realTo, 0, moved);
    const items = newList.map((m, i) => ({ id_modulo: m.id_modulo, orden: i }));
    reordenarModulos(items)
      .then(async () => {
        toastSuccess("Orden de módulos actualizado");
        setFullListForForm(null);
        await loadAll();
        await refreshAppSidebarMenu();
      })
      .catch((err) => handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err));
  };

  const handleModuleDragEnd = () => {
    dragModRef.current = null;
    setDragOverModIdx(null);
  };

  const openObjetosModal = async (row, tipo = "menu") => {
    const id = tipo === "modulo" ? row.id_modulo : row.id_menu;
    const nombre = row.nombre ?? (tipo === "modulo" ? "Módulo" : "Menú");
    setMenuParaObjetos({ id, nombre, tipo });
    setObjetosModalOpen(true);
    setObjetosModalLoading(true);
    setObjetosSeleccionados(new Set());
    try {
      const [todos, asignados] = await Promise.all([
        listarObjetos(),
        tipo === "modulo" ? listarObjetosModulo(id) : listarObjetosMenu(id),
      ]);
      setObjetosLista(Array.isArray(todos) ? todos : []);
      setObjetosAsignados(Array.isArray(asignados) ? asignados : []);
      const ids = (Array.isArray(asignados) ? asignados : []).map((a) => a.id_objetos);
      setObjetosSeleccionados(new Set(ids));
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      setObjetosModalOpen(false);
    } finally {
      setObjetosModalLoading(false);
    }
  };

  const closeObjetosModal = () => {
    setObjetosModalOpen(false);
    setMenuParaObjetos(null);
    setObjetosLista([]);
    setObjetosAsignados([]);
    setObjetosSeleccionados(new Set());
  };

  const handleToggleObjeto = (id_objetos) => {
    setObjetosSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id_objetos)) next.delete(id_objetos);
      else next.add(id_objetos);
      return next;
    });
  };

  const handleGuardarObjetos = async () => {
    if (!menuParaObjetos) return;
    setObjetosGuardando(true);
    setLoading(true);
    try {
      const { id, tipo } = menuParaObjetos;
      const esModulo = tipo === "modulo";
      const idKey = esModulo ? "id_modulo_objetos" : "id_menu_objetos";
      const asignadosMap = new Map((objetosAsignados || []).map((a) => [a.id_objetos, a[idKey]]));
      for (const obj of objetosLista) {
        const objId = obj.id_objetos;
        const estaba = asignadosMap.has(objId);
        const quiere = objetosSeleccionados.has(objId);
        if (!estaba && quiere) {
          esModulo ? await asignarObjetoModulo(id, objId) : await asignarObjeto(id, objId);
        }
        if (estaba && !quiere) {
          esModulo ? await quitarObjetoModulo(asignadosMap.get(objId)) : await quitarObjeto(asignadosMap.get(objId));
        }
      }
      toastSuccess("Objetos asignados actualizados");
      closeObjetosModal();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setObjetosGuardando(false);
      setLoading(false);
    }
  };

  const openEditModulo = (mod) => {
    setConvirtiendoSinModulo(false);
    setEditingModulo(mod);
    setNuevoModuloNombre(mod.nombre || "");
    setNuevoModuloUrl(mod.url || "");
    setNuevoModuloIcon(mod.Icon || "");
    setModuloEtiquetas((mod.etiquetas || []).map((t) => t.id_etiqueta));
    setDialogNuevoModuloOpen(true);
  };

  const openNewModulo = () => {
    setConvirtiendoSinModulo(false);
    setEditingModulo(null);
    setNuevoModuloNombre("");
    setNuevoModuloUrl("");
    setNuevoModuloIcon("");
    setModuloEtiquetas([]);
    setDialogNuevoModuloOpen(true);
  };

  const openConvertirSinModulo = (mod) => {
    const count = (lista || []).filter((m) => m.id_modulo == null).length;
    setSinModuloMenuCount(count);
    setConvirtiendoSinModulo(true);
    setEditingModulo(null);
    setNuevoModuloNombre(mod?.nombre && mod.nombre !== "Sin módulo" ? mod.nombre : "Páginas web");
    setNuevoModuloUrl(mod?.url || "");
    setNuevoModuloIcon(mod?.Icon || "folder");
    setModuloEtiquetas([]);
    setDialogNuevoModuloOpen(true);
  };

  const closeDialogModulo = () => {
    if (nuevoModuloGuardando) return;
    setDialogNuevoModuloOpen(false);
    setConvirtiendoSinModulo(false);
    setEditingModulo(null);
  };

  const handleGuardarModulo = async () => {
    const nombre = (nuevoModuloNombre || "").trim();
    const url = (nuevoModuloUrl || "").trim();
    const icon = (nuevoModuloIcon || "").trim();
    if (!nombre && !url) return;
    setNuevoModuloGuardando(true);
    try {
      if (convirtiendoSinModulo) {
        const res = await convertirSinModulo({
          nombre: nombre || "Módulo",
          url: url || undefined,
          Icon: icon || undefined,
          Activo: "S",
          id_etiquetas: moduloEtiquetas,
          id_roles: etiquetasRolId,
        });
        const asignados = res?.menus_asignados ?? sinModuloMenuCount;
        toastSuccess(`Módulo creado: ${asignados} menú(s) asignados`);
        setConvirtiendoSinModulo(false);
      } else if (editingModulo) {
        await actualizarModulo({
          id_modulo: editingModulo.id_modulo,
          nombre: nombre || editingModulo.nombre,
          url: url || undefined,
          Icon: icon || undefined,
          id_etiquetas: moduloEtiquetas,
          id_roles: etiquetasRolId,
        });
        toastSuccess("Módulo actualizado");
      } else {
        const created = await crearModulo({
          nombre: nombre || undefined,
          url: url || undefined,
          Icon: icon || undefined,
          id_etiquetas: moduloEtiquetas,
          id_roles: etiquetasRolId,
        });
        if (dialogOpen) {
          setFormData((p) => ({ ...p, id_modulo: created.id_modulo }));
        }
        toastSuccess("Módulo creado");
      }
      setNuevoModuloNombre("");
      setNuevoModuloUrl("");
      setNuevoModuloIcon("");
      setModuloEtiquetas([]);
      setEditingModulo(null);
      setDialogNuevoModuloOpen(false);
      setFullListForForm(null);
      await loadAll();
      await refreshAppSidebarMenu();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setNuevoModuloGuardando(false);
    }
  };

  const handleEliminarModulo = async () => {
    if (!confirmEliminarModulo) return;
    setLoading(true);
    try {
      await eliminarModulo(confirmEliminarModulo.id_modulo);
      toastSuccess("Módulo eliminado");
      setConfirmEliminarModulo(null);
      setFullListForForm(null);
      await loadAll();
      await refreshAppSidebarMenu();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const requestModuloActivoChange = (mod, nextChecked) => {
    if (mod == null || mod.id_modulo == null) return;
    const nextActivo = nextChecked ? "S" : "N";
    const cur = mod.Activo || "S";
    if (nextActivo === cur) return;
    setConfirmToggleModulo({ mod, nextActivo });
  };

  const handleConfirmToggleModuloActivo = async () => {
    if (!confirmToggleModulo) return;
    const { mod, nextActivo } = confirmToggleModulo;
    setLoading(true);
    try {
      await actualizarModulo({
        id_modulo: mod.id_modulo,
        nombre: mod.nombre || `Módulo ${mod.id_modulo}`,
        url: mod.url || undefined,
        Icon: mod.Icon || undefined,
        Activo: nextActivo,
        id_roles: etiquetasRolId ?? perfil?.id_roles,
      });
      toastSuccess(nextActivo === "S" ? "Módulo activado" : "Módulo desactivado");
      setConfirmToggleModulo(null);
      setModuloVista(nextActivo === "S" ? "activos" : "inactivos");
      setFullListForForm(null);
      await loadAll();
      await refreshAppSidebarMenu();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const requestMenuActivoChange = (node, nextChecked) => {
    if (node == null || node.id_menu == null) return;
    const nextActivo = nextChecked ? "S" : "N";
    const cur = node.Activo || "S";
    if (nextActivo === cur) return;
    setConfirmToggleMenu({ node, nextActivo });
  };

  const handleConfirmToggleMenuActivo = async () => {
    if (!confirmToggleMenu) return;
    const { node, nextActivo } = confirmToggleMenu;
    setLoading(true);
    try {
      const iconVal = node.icon ?? node.Icon ?? null;
      const payload = {
        id_menu: node.id_menu,
        nombre: node.nombre || `Menú ${node.id_menu}`,
        id_modulo: node.id_modulo ?? null,
        id_menu_padre: node.id_menu_padre ?? null,
        url: node.url || null,
        Icon: iconVal,
        Activo: nextActivo,
      };
      if (node.orden !== undefined && node.orden !== null) {
        payload.orden = node.orden;
      }
      await actualizar(payload);
      toastSuccess(nextActivo === "S" ? "Menú activado" : "Menú desactivado");
      setConfirmToggleMenu(null);
      setFullListForForm(null);
      await loadAll();
      await refreshAppSidebarMenu();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const tree = buildTreeByModulo(lista, modulosLista);

  const tabCounts = useMemo(() => {
    const t = tree || [];
    return {
      todos: t.length,
      activos: t.filter((m) => m.id_modulo == null || (m.Activo || "S") !== "N").length,
      inactivos: t.filter((m) => m.id_modulo != null && (m.Activo || "S") === "N").length,
    };
  }, [tree]);

  const moduloTreeFiltrado = useMemo(() => {
    if (moduloVista === "todos") return tree;
    return (tree || []).filter((m) => {
      if (m.id_modulo == null) return moduloVista === "activos";
      const inact = (m.Activo || "S") === "N";
      if (moduloVista === "inactivos") return inact;
      return !inact;
    });
  }, [tree, moduloVista]);

  const moduloTreeParaVista = useMemo(() => {
    if (moduloVista === "urls" || moduloVista === "orden_sidebar") return moduloTreeFiltrado;
    return filterModuloTree(moduloTreeFiltrado, arbolSearchQuery);
  }, [moduloTreeFiltrado, arbolSearchQuery, moduloVista]);

  const arbolSearchActivo = arbolSearchQuery.trim().length > 0
    && moduloVista !== "urls"
    && moduloVista !== "orden_sidebar";

  useEffect(() => {
    if (!arbolSearchActivo) return;
    const keys = collectMenuTreeExpandKeys(moduloTreeParaVista);
    setExpanded((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });
  }, [arbolSearchActivo, arbolSearchQuery, moduloTreeParaVista]);

  const allowModuloReorder = moduloVista === "todos" && !arbolSearchActivo;
  const moduleOptions = (modulosLista || []).map((m) => ({
    value: m.id_modulo,
    label: m.nombre || `Módulo ${m.id_modulo}`,
  }));

  /* ─── Botones de acción de nodo (reutilizable) + switch activo/inactivo ─── */
  function NodeActions({ node, siblings, moduloContenedorInactivo = false, menuItemInactivo = false }) {
    const idx = (siblings || []).findIndex((s) => s.id_menu === node.id_menu);
    const sibs = siblings || [];
    const bloqueadoAcciones = moduloContenedorInactivo || menuItemInactivo;
    const tipBloqueoAcciones = moduloContenedorInactivo ? TIP_ARBOL_MODULO_INACTIVO : menuItemInactivo ? TIP_MENU_ITEM_INACTIVO : null;
    const switchBloqueado = moduloContenedorInactivo;

    return (
      <Box className="node-actions" sx={{ ...nodeActionsSx, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
        <Tooltip title={bloqueadoAcciones ? tipBloqueoAcciones : "Agregar hijo"} arrow>
          <span>
            <IconButton size="small" disabled={bloqueadoAcciones} sx={{ color: bloqueadoAcciones ? "grey.500" : "primary.main" }} onClick={() => openNew(node.id_menu, false, node)}>
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={switchBloqueado ? TIP_ARBOL_MODULO_INACTIVO : (node.Activo || "S") === "N" ? "Activar menú" : "Desactivar menú"} arrow>
          <span>
            <Switch
              size="small"
              disabled={switchBloqueado}
              checked={(node.Activo || "S") !== "N"}
              onChange={(e) => requestMenuActivoChange(node, e.target.checked)}
              inputProps={{ "aria-label": "Activo menú" }}
              sx={{ mx: 0.25 }}
            />
          </span>
        </Tooltip>
        <Tooltip title={bloqueadoAcciones ? tipBloqueoAcciones : "Subir"} arrow>
          <span>
            <IconButton size="small" disabled={bloqueadoAcciones || idx <= 0} onClick={() => moveUp(node, sibs)} sx={{ color: bloqueadoAcciones ? "grey.500" : "text.secondary" }}>
              <ArrowUpwardIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={bloqueadoAcciones ? tipBloqueoAcciones : "Bajar"} arrow>
          <span>
            <IconButton
              size="small"
              disabled={bloqueadoAcciones || idx < 0 || idx >= sibs.length - 1}
              onClick={() => moveDown(node, sibs)}
              sx={{ color: bloqueadoAcciones ? "grey.500" : "text.secondary" }}
            >
              <ArrowDownwardIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={bloqueadoAcciones ? tipBloqueoAcciones : "Objetos"} arrow>
          <span>
            <IconButton size="small" disabled={bloqueadoAcciones} sx={{ color: bloqueadoAcciones ? "grey.500" : "text.secondary" }} onClick={() => openObjetosModal(node)}>
              <ListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={bloqueadoAcciones ? tipBloqueoAcciones : "Editar"} arrow>
          <span>
            <IconButton size="small" disabled={bloqueadoAcciones} sx={{ color: bloqueadoAcciones ? "grey.500" : "info.main" }} onClick={() => openEdit(node)}>
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={bloqueadoAcciones ? tipBloqueoAcciones : "Eliminar"} arrow>
          <span>
            <IconButton size="small" disabled={bloqueadoAcciones} sx={{ color: bloqueadoAcciones ? "grey.500" : "error.main" }} onClick={() => setConfirmEliminar(node)}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  }

  /* ─── Fila de Módulo ─── */
  function ModuloRow({ mod, modIndex }) {
    const key = `modulo_${mod.id_modulo}`;
    const isExpanded = expanded.has(key);
    const hasChildren = mod.children && mod.children.length > 0;
    const totalDesc = countDescendants(mod.children);
    const esSinModuloVirtual = mod.id_modulo == null;
    const isDraggable = mod.id_modulo != null && allowModuloReorder;
    const isDragOver = dragOverModIdx === modIndex;
    const modInactivo = mod.id_modulo != null && (mod.Activo || "S") === "N";
    const tipAccionBloqueada = esSinModuloVirtual
      ? "Conviértalo en módulo real para activar, editar objetos o eliminar el grupo."
      : "Módulo desactivado: actívelo para usar esta acción.";

    return (
      <Box
        sx={{ mb: 1.5 }}
        draggable={isDraggable}
        onDragStart={(e) => {
          if (!isDraggable) {
            e.preventDefault();
            return;
          }
          e.dataTransfer.effectAllowed = "move";
          handleModuloDragStart(modIndex);
        }}
        onDragOver={(e) => handleModuloDragOver(e, modIndex)}
        onDrop={(e) => handleModuleDrop(e, modIndex, tree)}
        onDragEnd={handleModuleDragEnd}
      >
        {/* Cabecera del módulo */}
        <Box
          onClick={() => toggleExpand(key)}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.25,
            cursor: isDraggable ? "grab" : "pointer",
            borderRadius: 2,
            bgcolor: (t) => {
              if (modInactivo) return alpha(t.palette.grey[500], 0.22);
              return moduloVista === "inactivos" ? alpha(t.palette.grey[600], 0.08) : TREE_COLORS.module.bg;
            },
            border: "2px solid",
            borderColor: (t) => {
              if (modInactivo) return isExpanded ? alpha(t.palette.grey[600], 0.55) : alpha(t.palette.grey[500], 0.35);
              if (isDragOver) return t.palette.primary.main;
              if (isExpanded) return TREE_COLORS.module.border;
              return "transparent";
            },
            transition: "all 0.2s ease",
            opacity: dragModRef.current === modIndex ? 0.4 : 1,
            "&:hover": {
              bgcolor: (t) => {
                if (modInactivo) return alpha(t.palette.grey[600], 0.28);
                return moduloVista === "inactivos" ? alpha(t.palette.grey[600], 0.14) : TREE_COLORS.module.hoverBg;
              },
              borderColor: (t) => {
                if (modInactivo) return alpha(t.palette.grey[700], 0.45);
                return isDragOver ? t.palette.primary.main : TREE_COLORS.module.border;
              },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
            <ChevronRightIcon
              fontSize="small"
              sx={{
                color: modInactivo ? "grey.600" : TREE_COLORS.module.border,
                transition: "transform 0.25s ease",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
            <MenuSidebarIcon
              icon={resolveTreeIcon(mod, { esModulo: true, etiquetasMap: sidebarEtiquetasMap })}
              esModulo
              sx={{ fontSize: 20, color: modInactivo ? "grey.600" : TREE_COLORS.module.icon }}
            />
            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: modInactivo ? "grey.700" : TREE_COLORS.module.icon }}>
              {mod.nombre}
            </Typography>
            {esSinModuloVirtual && (
              <Chip
                label="Sin módulo en BD"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600 }}
              />
            )}
            {modInactivo && (
              <Chip label="Desactivado" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "grey.400", color: "grey.900" }} />
            )}
            {totalDesc > 0 && (
              <Chip
                label={`${totalDesc} elemento${totalDesc > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  bgcolor: (t) => (modInactivo ? alpha(t.palette.grey[600], 0.22) : "rgba(25, 118, 210, 0.08)"),
                  color: modInactivo ? "grey.800" : TREE_COLORS.module.border,
                }}
              />
            )}
            <EtiquetasChips etiquetas={mod.etiquetas} />
          </Box>
          <Box
            className="mod-actions"
            sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={modInactivo && !esSinModuloVirtual ? tipAccionBloqueada : "Agregar menú en este módulo"} arrow>
              <span>
                <IconButton
                  size="small"
                  disabled={modInactivo && !esSinModuloVirtual}
                  sx={{ color: modInactivo && !esSinModuloVirtual ? "grey.500" : TREE_COLORS.module.border }}
                  onClick={() => openNew(esSinModuloVirtual ? null : mod.id_modulo, true)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {esSinModuloVirtual ? (
              <Tooltip title="Convertir en módulo real (nombre, activar, objetos…)" arrow>
                <span>
                  <IconButton size="small" sx={{ color: "warning.main" }} onClick={() => openConvertirSinModulo(mod)}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <>
                <Tooltip title={(mod.Activo || "S") === "N" ? "Activar módulo" : "Desactivar módulo"} arrow>
                  <Switch
                    size="small"
                    checked={(mod.Activo || "S") !== "N"}
                    onChange={(e) => requestModuloActivoChange(mod, e.target.checked)}
                    inputProps={{ "aria-label": "Activo módulo" }}
                    sx={{ ml: 0.5, mr: 0.25 }}
                  />
                </Tooltip>
                <Tooltip title={modInactivo ? tipAccionBloqueada : "Objetos del módulo"} arrow>
                  <span>
                    <IconButton size="small" disabled={modInactivo} sx={{ color: modInactivo ? "grey.500" : "text.secondary" }} onClick={() => openObjetosModal(mod, "modulo")}>
                      <ListIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={modInactivo ? tipAccionBloqueada : "Editar módulo"} arrow>
                  <span>
                    <IconButton size="small" disabled={modInactivo} sx={{ color: modInactivo ? "grey.500" : "info.main" }} onClick={() => openEditModulo(mod)}>
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={modInactivo ? tipAccionBloqueada : "Eliminar módulo"} arrow>
                  <span>
                    <IconButton size="small" disabled={modInactivo} sx={{ color: modInactivo ? "grey.500" : "error.main" }} onClick={() => setConfirmEliminarModulo(mod)}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Hijos del módulo */}
        {hasChildren && (
          <Collapse in={isExpanded} timeout={300} unmountOnExit>
            <Box
              sx={{
                ml: 2.5,
                mt: 0.5,
                pl: 2.5,
                borderLeft: "2px solid",
                borderColor: modInactivo ? "grey.400" : TREE_COLORS.module.border,
                opacity: modInactivo ? 0.85 : 1,
              }}
              role="tree"
              aria-label={`Rama de ${mod.nombre}`}
            >
              {mod.children.map((menuNode) => (
                <MenuTreeNode key={menuNode.id_menu} node={menuNode} siblings={mod.children} depth={0} parentModuloInactivo={modInactivo} />
              ))}
            </Box>
          </Collapse>
        )}

        {/* Módulo vacío */}
        {!hasChildren && isExpanded && (
          <Box sx={{ ml: 2.5, mt: 1, pl: 2.5, borderLeft: "2px dashed", borderColor: "grey.300" }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 1 }}>
              <InfoOutlinedIcon sx={{ fontSize: 14 }} />
              Sin menús. Haz clic en + para agregar uno.
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  /* ─── Nodo de menú recursivo ─── */
  function MenuTreeNode({ node, siblings, depth = 0, parentModuloInactivo = false }) {
    const hasChildren = node.children && node.children.length > 0;
    const menuKey = `menu_${node.id_menu}`;
    const isExpanded = expanded.has(menuKey);
    const childCount = hasChildren ? node.children.length : 0;
    const isFolder = hasChildren;
    const hasUrl = !!node.url;
    const arbolBloqueado = parentModuloInactivo;
    const menuInactivo = (node.Activo || "S") === "N";
    const filaGris = arbolBloqueado || menuInactivo;

    // Color del borde de la rama según profundidad (gris si fila bloqueada o módulo off)
    const branchColor = filaGris
      ? "grey.500"
      : depth === 0
        ? TREE_COLORS.folder.border
        : depth === 1
          ? "#81c784"
          : "#a5d6a7";

    return (
      <Box sx={{ position: "relative", mb: 0.25 }}>
        {/* Conector horizontal */}
        <Box
          sx={{
            position: "absolute",
            left: -20,
            top: 18,
            width: 18,
            borderBottom: "2px solid",
            borderColor: branchColor,
            opacity: filaGris ? 0.5 : 0.7,
          }}
          aria-hidden
        />

        {/* Fila del nodo */}
        <Box
          sx={{
            ...nodeRowSx,
            cursor: isFolder ? "pointer" : "default",
            bgcolor: (t) => (filaGris ? alpha(t.palette.grey[500], 0.1) : "transparent"),
            "&:hover": {
              bgcolor: (t) =>
                filaGris ? alpha(t.palette.grey[600], 0.18) : isFolder ? TREE_COLORS.folder.hoverBg : "grey.50",
            },
          }}
          onClick={isFolder ? () => toggleExpand(menuKey) : undefined}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flex: 1, minWidth: 0 }}>
            {/* Icono chevron / espacio */}
            {isFolder ? (
              <ChevronRightIcon
                sx={{
                  fontSize: 18,
                  color: filaGris ? "grey.600" : TREE_COLORS.folder.icon,
                  transition: "transform 0.25s ease",
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            ) : (
              <Box sx={{ width: 18 }} />
            )}

            <MenuSidebarIcon
              icon={resolveTreeIcon(node, { esModulo: false, etiquetasMap: sidebarEtiquetasMap })}
              esModulo={false}
              sx={{
                fontSize: 20,
                color: filaGris ? "grey.600" : (isFolder ? TREE_COLORS.folder.icon : TREE_COLORS.leaf.icon),
              }}
            />

            {/* Nombre */}
            <Typography
              variant="body2"
              fontWeight={isFolder ? 600 : 400}
              noWrap
              sx={{ color: filaGris ? "grey.700" : isFolder ? TREE_COLORS.folder.icon : "text.primary" }}
            >
              {node.nombre || `(Menú ${node.id_menu})`}
            </Typography>

            {/* Chips informativos */}
            {node.url && (
              <Chip
                icon={<LinkIcon sx={{ fontSize: "14px !important" }} />}
                label={node.url}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  maxWidth: 220,
                  borderColor: filaGris ? "grey.400" : "grey.300",
                  color: filaGris ? "grey.700" : undefined,
                  "& .MuiChip-icon": { color: "grey.500" },
                }}
              />
            )}
            {node.Activo === "N" && (
              <Chip label="Inactivo" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "grey.400", color: "grey.900" }} />
            )}
            {arbolBloqueado && (
              <Chip label="Módulo inactivo" size="small" sx={{ height: 20, fontSize: "0.62rem", bgcolor: "grey.500", color: "grey.100" }} />
            )}
            {childCount > 0 && (
              <Chip
                label={`${childCount} hijo${childCount > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  bgcolor: (t) => (filaGris ? alpha(t.palette.grey[600], 0.22) : "rgba(46,125,50,0.08)"),
                  color: filaGris ? "grey.800" : TREE_COLORS.folder.icon,
                }}
              />
            )}
            {!isFolder && !hasUrl && (
              <Chip
                label="sin URL"
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: "0.6rem", borderColor: "grey.300", color: "text.disabled" }}
              />
            )}
            <EtiquetasChips etiquetas={node.etiquetas} />
          </Box>

          {/* Acciones */}
          <NodeActions node={node} siblings={siblings} moduloContenedorInactivo={arbolBloqueado} menuItemInactivo={menuInactivo} />
        </Box>

        {/* Hijos recursivos */}
        {isFolder && (
          <Collapse in={isExpanded} timeout={250} unmountOnExit>
            <Box
              sx={{
                ml: 2.5,
                pl: 2.5,
                borderLeft: "2px solid",
                borderColor: branchColor,
                opacity: filaGris ? 0.9 : 0.85,
                mt: 0.25,
              }}
            >
              {node.children.map((child) => (
                <MenuTreeNode key={child.id_menu} node={child} siblings={node.children} depth={depth + 1} parentModuloInactivo={parentModuloInactivo} />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <>
      <MenuSidebarNombrePanel
        open={sidebarEditPanelOpen}
        panelLeft={panelLeft}
        item={sidebarEditingItem}
        nombre={sidebarNombreDraft}
        icono={sidebarIconoDraft}
        onNombreChange={setSidebarNombreDraft}
        onIconoChange={setSidebarIconoDraft}
        onSave={handleSaveSidebarNombre}
        onClose={handleCloseSidebarEditPanel}
        saving={sidebarNombreSaving}
      />

      <PageWrap sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ borderRadius: 3, overflow: "visible" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AccountTreeIcon sx={{ color: "primary.main", fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Gestión de menús
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Multinivel - Módulos, menús y submenús
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              <Button size="small" variant="outlined" onClick={expandAll}>
                Expandir todo
              </Button>
              <Button size="small" variant="outlined" onClick={collapseAll}>
                Colapsar todo
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="info"
                component={RouterLink}
                to="/administracion-etiquetas/index"
                startIcon={<LabelIcon />}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Etiquetas
              </Button>
              <Button size="small" variant="outlined" color="secondary" startIcon={<AddIcon />} onClick={() => openNewModulo()} sx={{ borderRadius: 2, textTransform: "none" }}>
                Crear módulo
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openNew(null)} sx={{ borderRadius: 2 }}>
                Nuevo menú
              </Button>
            </Box>
          </Box>

          {/* Info */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2.5, p: 1.5, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", mt: 0.25 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Estructura por módulos. Cada menú puede tener hijos (submenús) o ser un <strong>enlace directo sin hijos</strong>.
              Pasa el cursor sobre un elemento para ver las acciones.
              Los menús sin módulo aparecen bajo el grupo <strong>«Sin módulo»</strong> (virtual). Use el botón <strong>editar</strong> (lápiz) en esa fila para convertirlo en un módulo real con nombre y todas las opciones.
              Use las pestañas del <strong>lienzo de módulos</strong> para ver solo activos o inactivos; al desactivar un módulo pasa a la vista correspondiente.
              El <strong>arrastre para reordenar</strong> módulos en el árbol solo está en la pestaña «Todos».
              Use la pestaña <strong>«Orden sidebar»</strong> para definir el orden del menú lateral por rol (administración).
              La pestaña <strong>«URLs»</strong> lista rutas del admin, Laravel y su vínculo con nombres del menú (incluye submenús).
              Cada usuario puede ordenar el suyo en <strong>Orden de mi menú</strong> (<code>/menu/orden</code>).
            </Typography>
          </Box>

          {/* Árbol: vacío global vs lienzo con pestañas */}
          <Box sx={{ minHeight: 100 }}>
            {tree.length === 0 && moduloVista !== "urls" && (
              <Box sx={{ textAlign: "center", py: 6, color: "text.disabled" }}>
                <AccountTreeIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                <Typography variant="body1" color="text.disabled">
                  No hay menús registrados
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                  Comienza creando un menú con el botón "Nuevo menú", o use el buscador de URLs.
                </Typography>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openNew(null)}>
                    Crear primer menú
                  </Button>
                  <Button variant="outlined" startIcon={<TravelExploreIcon />} onClick={() => setModuloVista("urls")}>
                    Buscador de URLs
                  </Button>
                </Box>
              </Box>
            )}

            {(tree.length > 0 || moduloVista === "urls" || moduloVista === "orden_sidebar") && (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ letterSpacing: 0.02, color: "text.secondary" }}>
                    Lienzo de módulos
                  </Typography>
                  {moduloVista !== "orden_sidebar" && moduloVista !== "urls" && !allowModuloReorder && (
                    <Chip size="small" variant="outlined" color="warning" label="Reordenar módulos en árbol: pestaña «Todos»" />
                  )}
                  {moduloVista === "orden_sidebar" && (
                    <Chip size="small" variant="outlined" color="primary" label="Orden del sidebar por rol" />
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                    gap: 2,
                    mb: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Tabs
                    value={moduloVista}
                    onChange={(_, v) => {
                      setModuloVista(v);
                      if (v === "urls" || v === "orden_sidebar") setArbolSearchQuery("");
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      flex: "1 1 280px",
                      minWidth: 0,
                      minHeight: 44,
                      "& .MuiTab-root": { textTransform: "none", minHeight: 44, py: 0.5 },
                    }}
                  >
                    <Tab
                      value="todos"
                      icon={<ViewModuleOutlinedIcon fontSize="small" />}
                      iconPosition="start"
                      label={`Todos (${tabCounts.todos})`}
                    />
                    <Tab
                      value="activos"
                      icon={<CheckCircleOutlineIcon fontSize="small" />}
                      iconPosition="start"
                      label={`Activos (${tabCounts.activos})`}
                    />
                    <Tab
                      value="inactivos"
                      icon={<BlockOutlinedIcon fontSize="small" />}
                      iconPosition="start"
                      label={`Inactivos (${tabCounts.inactivos})`}
                    />
                    <Tab
                      value="orden_sidebar"
                      icon={<DragIndicatorIcon fontSize="small" />}
                      iconPosition="start"
                      label="Orden sidebar"
                    />
                    <Tab
                      value="urls"
                      icon={<TravelExploreIcon fontSize="small" />}
                      iconPosition="start"
                      label="URLs"
                    />
                  </Tabs>

                  {moduloVista !== "urls" && moduloVista !== "orden_sidebar" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0.75, flex: "0 1 340px" }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Buscar módulo, menú, URL o etiqueta..."
                        value={arbolSearchQuery}
                        onChange={(e) => setArbolSearchQuery(e.target.value)}
                        autoComplete="off"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: arbolSearchQuery ? (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setArbolSearchQuery("")} edge="end" aria-label="Limpiar búsqueda">
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ) : null,
                        }}
                        sx={{ minWidth: { xs: "100%", sm: 260 }, maxWidth: 360 }}
                      />
                      {arbolSearchActivo && (
                        <Chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          label={`${moduloTreeParaVista.length} módulo(s)`}
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {moduloVista === "urls" && (
                  <MenuUrlsTab menus={lista} />
                )}

                {moduloVista === "orden_sidebar" && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 280 }}>
                      <InputLabel id="orden-sidebar-rol-label">Rol</InputLabel>
                      <Select
                        labelId="orden-sidebar-rol-label"
                        label="Rol"
                        value={ordenRolId || ""}
                        onChange={(e) => setOrdenRolId(Number(e.target.value))}
                      >
                        {rolesLista.map((r) => (
                          <MenuItem key={r.id_roles} value={r.id_roles}>
                            {r.nombre || `Rol ${r.id_roles}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {rolOrdenNombre && (
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`Orden para: ${rolOrdenNombre}`}
                      />
                    )}
                    {sidebarOrdenItems.length > 0 && (
                      <Tooltip title="Copiar este orden a otro rol">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => { setReplicarTargetRolId(""); setReplicarDialogOpen(true); }}
                          sx={{
                            ml: "auto",
                            borderColor: "#0d2137",
                            color: "#0d2137",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "none",
                            "&:hover": { bgcolor: "rgba(13,33,55,0.06)", borderColor: "#0d2137" },
                          }}
                        >
                          ⧉ Replicar orden a otro rol
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                )}

                {moduloVista === "urls" ? null : moduloVista === "orden_sidebar" ? (
                  <MenuSidebarOrderCanvas
                    items={sidebarOrdenItems}
                    loading={sidebarOrdenLoading}
                    saving={sidebarOrdenSaving}
                    rolNombre={rolOrdenNombre}
                    autoSave={false}
                    onReorder={handleSidebarOrdenReorder}
                    onEditItem={handleSidebarEditItem}
                    editingPreview={
                      sidebarEditPanelOpen && sidebarEditingItem
                        ? {
                            key: sidebarItemKey(sidebarEditingItem),
                            nombre: sidebarNombreDraft,
                            icon: sidebarIconoDraft,
                          }
                        : null
                    }
                    hintText="Arrastre las filas para ordenar. Pulse «Guardar cambios» para aplicar el nuevo orden; use el lápiz para editar nombre e ícono."
                    saveButtonLabel="Guardar cambios"
                  />
                ) : (
                <Paper
                  elevation={0}
                  sx={{
                    position: "relative",
                    p: { xs: 1.5, sm: 2.5 },
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "border-color 0.35s ease, box-shadow 0.35s ease",
                    boxShadow: (t) =>
                      moduloVista === "inactivos"
                        ? `inset 0 0 0 1px ${alpha(t.palette.warning.main, 0.25)}`
                        : moduloVista === "activos"
                          ? `inset 0 0 0 1px ${alpha(t.palette.success.main, 0.22)}`
                          : `inset 0 0 0 1px ${alpha(t.palette.primary.main, 0.2)}`,
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
                    backgroundImage: (t) =>
                      `radial-gradient(${alpha(t.palette.text.primary, 0.07)} 0.55px, transparent 0.55px)`,
                    backgroundSize: "14px 14px",
                    minHeight: 200,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      bgcolor: (t) =>
                        alpha(
                          moduloVista === "inactivos"
                            ? t.palette.warning.main
                            : moduloVista === "activos"
                              ? t.palette.success.main
                              : t.palette.primary.main,
                          moduloVista === "todos" ? 0.04 : 0.055
                        ),
                    },
                  }}
                >
                  <Fade in timeout={280} key={moduloVista}>
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      {moduloTreeParaVista.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 5, px: 2 }}>
                          <FolderIcon sx={{ fontSize: 40, mb: 1, opacity: 0.35, color: "text.secondary" }} />
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            {arbolSearchActivo
                              ? `Sin resultados para «${arbolSearchQuery.trim()}»`
                              : moduloVista === "inactivos"
                                ? "No hay módulos desactivados"
                                : moduloVista === "activos"
                                  ? "No hay módulos activos en esta lista"
                                  : "Sin elementos en esta vista"}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {moduloVista === "inactivos"
                              ? "Desactive un módulo con el interruptor para verlo aquí."
                              : "Cambie de pestaña o cree un módulo nuevo."}
                          </Typography>
                        </Box>
                      ) : (
                        moduloTreeParaVista.map((mod, idx) => (
                          <ModuloRow key={mod.id_modulo != null ? mod.id_modulo : "__null"} mod={mod} modIndex={idx} />
                        ))
                      )}
                    </Box>
                  </Fade>
                </Paper>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ─── Dialog: Nuevo/Editar menú ─── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 2, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {editingId ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
          {editingId ? "Editar menú" : "Nuevo menú"}
          <IconButton aria-label="cerrar" onClick={() => setDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nombre del menú"
            value={formData.nombre ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
            margin="normal"
            required
            autoFocus
            placeholder="Ej: Clientes, Dashboard, Reportes..."
            helperText="Nombre global para todos los roles. Tras guardar, el menú lateral se actualiza automáticamente."
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Menú padre (opcional)</InputLabel>
            <Select
              value={formData.id_menu_padre ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : e.target.value;
                const next = { ...formData, id_menu_padre: val };
                if (val != null) {
                  const parent = (fullListForForm || lista).find((m) => m.id_menu === val);
                  if (parent) next.id_modulo = parent.id_modulo ?? null;
                }
                setFormData(next);
              }}
              label="Menú padre (opcional)"
              renderValue={(v) => {
                if (v == null || v === "") return "Raíz (nivel superior, sin padre)";
                const opt = parentOptions(fullListForForm || lista, editingId).find((o) => o.value === v);
                return opt?.path ?? opt?.label ?? v;
              }}
            >
              {parentOptions(fullListForForm || lista, editingId).map((opt) => (
                <MenuItem key={opt.value ?? "root"} value={opt.value ?? ""} sx={{ pl: 2 + opt.level * 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {opt.level > 0 && <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: "grey.400" }} />}
                    <Typography variant="body2">{opt.path || opt.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              "Raíz" = menú de nivel superior. Seleccione un menú existente para crear un submenú (hijo).
              <strong> No es obligatorio tener hijos</strong> - un menú puede ser un enlace directo.
            </Typography>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Módulo</InputLabel>
            <Select
              value={formData.id_modulo ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, id_modulo: e.target.value === "" ? null : e.target.value }))}
              label="Módulo"
              disabled={!!formData.id_menu_padre}
            >
              <MenuItem value="">
                — {formData.id_menu_padre ? "Heredado del padre" : "Sin módulo (aparece directo en sidebar)"} —
              </MenuItem>
              {moduleOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {formData.id_menu_padre ? (
                <Typography variant="caption" color="primary.main">
                  Se hereda del menú padre automáticamente.
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Sin módulo = aparece directamente en el sidebar como ítem independiente. Para crear un módulo nuevo use el botón &quot;Crear módulo&quot; arriba a la derecha.
                </Typography>
              )}
            </Box>
          </FormControl>

          <Divider sx={{ my: 1.5 }} />

          <TextField
            fullWidth
            label="URL / Ruta"
            value={formData.url ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
            margin="normal"
            placeholder="/admin/mi-pagina"
            helperText="Ruta de navegación. Déjalo vacío si es solo un contenedor de submenús."
          />
          <TextField
            fullWidth
            label="Icono (nombre Material Icons)"
            value={formData.Icon ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, Icon: e.target.value }))}
            margin="normal"
            placeholder="folder, person, settings, dashboard..."
            helperText="Nombre del icono de Material Icons para el sidebar"
          />
          <Typography variant="caption" component="div" sx={{ mt: -0.5, mb: 0.5 }}>
            <Link href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" underline="hover">
              Buscar iconos en Font Awesome
            </Link>
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Activo</InputLabel>
            <Select value={formData.Activo ?? "S"} onChange={(e) => setFormData((p) => ({ ...p, Activo: e.target.value }))} label="Activo">
              <MenuItem value="S">Sí - Visible en sidebar</MenuItem>
              <MenuItem value="N">No - Oculto temporalmente</MenuItem>
            </Select>
          </FormControl>
          <MenuEtiquetaSelect
            idRoles={etiquetasRolId}
            value={formData.id_etiquetas || []}
            onChange={(ids) => setFormData((p) => ({ ...p, id_etiquetas: ids }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isNotEmpty(formData.nombre)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {editingId ? "Actualizar" : "Crear menú"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Dialog: Crear/Editar módulo ─── */}
      <Dialog open={dialogNuevoModuloOpen} onClose={closeDialogModulo} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {convirtiendoSinModulo ? <FolderIcon color="warning" /> : editingModulo ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
          {convirtiendoSinModulo ? "Convertir «Sin módulo» en módulo" : editingModulo ? "Editar módulo" : "Crear nuevo módulo"}
        </DialogTitle>
        <DialogContent dividers>
          {convirtiendoSinModulo && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
              Se creará un registro en <strong>sistema_modulo</strong> y se asignarán{" "}
              <strong>{sinModuloMenuCount}</strong> menú(s) que hoy no tienen módulo. Después podrá activarlo, editarlo y gestionar objetos como cualquier otro módulo.
            </Typography>
          )}
          <TextField
            fullWidth
            label="Nombre"
            value={nuevoModuloNombre}
            onChange={(e) => setNuevoModuloNombre(e.target.value)}
            margin="normal"
            placeholder="Ej: Ventas, Reportes"
            helperText="Nombre global del grupo en el sidebar (todos los roles). Se actualiza al guardar."
            onKeyDown={(e) => e.key === "Enter" && handleGuardarModulo()}
            autoFocus
          />
          <TextField
            fullWidth
            label="URL (opcional)"
            value={nuevoModuloUrl}
            onChange={(e) => setNuevoModuloUrl(e.target.value)}
            margin="normal"
            placeholder="/admin/ventas"
            helperText="Si el módulo no tiene submenús, esta URL se usa como enlace directo en el sidebar"
            onKeyDown={(e) => e.key === "Enter" && handleGuardarModulo()}
          />
          <TextField
            fullWidth
            label="Icono (Material Icons)"
            value={nuevoModuloIcon}
            onChange={(e) => setNuevoModuloIcon(e.target.value)}
            margin="normal"
            placeholder="folder, settings, security..."
            helperText="Nombre del icono de Material Icons"
            onKeyDown={(e) => e.key === "Enter" && handleGuardarModulo()}
          />
          <Typography variant="caption" component="div" sx={{ mt: -0.5, mb: 0.5 }}>
            <Link href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" underline="hover">
              Buscar iconos en Font Awesome
            </Link>
          </Typography>
          <MenuEtiquetaSelect
            idRoles={etiquetasRolId}
            value={moduloEtiquetas}
            onChange={setModuloEtiquetas}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1 }}>
          <Button onClick={closeDialogModulo} disabled={nuevoModuloGuardando}>
            Cancelar
          </Button>
          <Button variant="contained" color={convirtiendoSinModulo ? "warning" : "primary"} onClick={handleGuardarModulo} disabled={(!nuevoModuloNombre.trim() && !nuevoModuloUrl.trim()) || nuevoModuloGuardando}>
            {nuevoModuloGuardando
              ? "Guardando..."
              : convirtiendoSinModulo
                ? "Crear módulo y asignar menús"
                : editingModulo
                  ? "Actualizar"
                  : "Crear módulo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Dialog: Objetos del menú ─── */}
      <Dialog open={objetosModalOpen} onClose={closeObjetosModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <ListIcon color="primary" />
          Objetos: {menuParaObjetos?.nombre ?? ""}
          <IconButton aria-label="cerrar" onClick={closeObjetosModal} sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {objetosModalLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography color="text.secondary">Cargando...</Typography>
            </Box>
          ) : (
            <List dense>
              {(objetosLista || []).map((obj) => (
                <ListItem key={obj.id_objetos} disablePadding>
                  <ListItemButton onClick={() => handleToggleObjeto(obj.id_objetos)} dense sx={{ borderRadius: 1 }}>
                    <ListItemIcon>
                      <Checkbox edge="start" checked={objetosSeleccionados.has(obj.id_objetos)} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText primary={obj.nombre ?? `Objeto ${obj.id_objetos}`} />
                  </ListItemButton>
                </ListItem>
              ))}
              {objetosLista.length === 0 && !objetosModalLoading && (
                <ListItem>
                  <ListItemText primary="No hay objetos disponibles." />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1 }}>
          <Button onClick={closeObjetosModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarObjetos} disabled={objetosGuardando || objetosModalLoading}>
            {objetosGuardando ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Confirm open={!!confirmEliminar} title="Eliminar menú" text="¿Eliminar este menú y todos sus hijos?" onConfirm={handleEliminar} onCancel={() => setConfirmEliminar(null)} />
      <Confirm open={!!confirmEliminarModulo} title="Eliminar módulo" text={`¿Eliminar el módulo "${confirmEliminarModulo?.nombre || ""}" y todos sus menús?`} onConfirm={handleEliminarModulo} onCancel={() => setConfirmEliminarModulo(null)} />
      <Confirm
        open={!!confirmToggleModulo}
        title={confirmToggleModulo?.nextActivo === "S" ? "Activar módulo" : "Desactivar módulo"}
        text={
          confirmToggleModulo?.nextActivo === "S"
            ? `¿Activar el módulo "${confirmToggleModulo?.mod?.nombre || ""}"?`
            : `¿Desactivar el módulo "${confirmToggleModulo?.mod?.nombre || ""}"? Los menús asociados pueden dejar de mostrarse según la configuración del sitio.`
        }
        onConfirm={handleConfirmToggleModuloActivo}
        onCancel={() => setConfirmToggleModulo(null)}
      />
      <Confirm
        open={!!confirmToggleMenu}
        title={confirmToggleMenu?.nextActivo === "S" ? "Activar menú" : "Desactivar menú"}
        text={
          confirmToggleMenu?.nextActivo === "S"
            ? `¿Activar el menú "${confirmToggleMenu?.node?.nombre || ""}"?`
            : `¿Desactivar el menú "${confirmToggleMenu?.node?.nombre || ""}"? Puede dejar de mostrarse en el sidebar según la configuración.`
        }
        onConfirm={handleConfirmToggleMenuActivo}
        onCancel={() => setConfirmToggleMenu(null)}
      />

      {/* ── Dialog: Replicar orden a otro rol ─────────────────────── */}
      <Dialog
        open={replicarDialogOpen}
        onClose={() => { if (!replicarSaving) { setReplicarDialogOpen(false); setReplicarTargetRolId(""); } }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Replicar orden a otro rol</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se copiará el orden actual del sidebar del rol <b>«{rolOrdenNombre}»</b> al rol que selecciones.
            El rol destino verá exactamente el mismo orden de ítems.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="replicar-rol-label">Rol destino</InputLabel>
            <Select
              labelId="replicar-rol-label"
              label="Rol destino"
              value={replicarTargetRolId}
              onChange={(e) => setReplicarTargetRolId(e.target.value)}
            >
              {rolesLista
                .filter((r) => Number(r.id_roles) !== Number(ordenRolId))
                .map((r) => (
                  <MenuItem key={r.id_roles} value={r.id_roles}>
                    {r.nombre || `Rol ${r.id_roles}`}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setReplicarDialogOpen(false); setReplicarTargetRolId(""); }}
            disabled={replicarSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!replicarTargetRolId || replicarSaving}
            onClick={handleReplicarOrden}
            startIcon={replicarSaving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ bgcolor: "#0d2137", "&:hover": { bgcolor: "#1a3a5c" } }}
          >
            {replicarSaving ? "Replicando…" : "Replicar orden"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrap>
    </>
  );
}

export default injectIntl(WithLoandingPanel(MenuIndexPageInner));
