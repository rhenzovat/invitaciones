import { useState, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, Chip, Tooltip, IconButton,
  TextField, InputAdornment, Divider, Stack, LinearProgress,
  Tab, Tabs, Badge, Collapse, Avatar,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BuildIcon from "@mui/icons-material/Build";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LinkIcon from "@mui/icons-material/Link";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WebIcon from "@mui/icons-material/Web";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";

/* ── Keyframes ── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Styled ── */
const PageRoot = styled(Box)(() => ({
  padding: "24px",
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
  animation: `${fadeUp} 0.4s ease`,
}));

const KpiCard = styled(Paper)(({ color = "#0f172a" }) => ({
  padding: "20px 24px",
  borderRadius: 14,
  borderLeft: `5px solid ${color}`,
  display: "flex",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
}));

const ModuleCard = styled(Paper)(({ estado }) => ({
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  border: `1px solid ${
    estado === "activo" ? "#d1fae5" :
    estado === "pendiente" ? "#fef3c7" : "#fee2e2"
  }`,
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
}));

/* ── Datos del sistema ── */
const SISTEMA = [
  /* ══════════ CORE / ADMIN ══════════ */
  {
    grupo: "Core / Administración",
    icono: <PeopleIcon />,
    color: "#0f172a",
    modulos: [
      {
        nombre: "Dashboard Analytics",
        ruta: "/dashboard/default",
        estado: "activo",
        descripcion: "Panel principal con KPIs de ventas, productos y usuarios.",
        objetos: 12,
        submodulos: [],
      },
      {
        nombre: "Usuarios",
        ruta: "/usuarios/index",
        estado: "activo",
        descripcion: "Gestión CRUD de usuarios del sistema.",
        objetos: 8,
        submodulos: ["Crear usuario", "Editar usuario", "Asignar rol", "Desactivar"],
      },
      {
        nombre: "Perfiles",
        ruta: "/perfiles/index",
        estado: "activo",
        descripcion: "Configuración de perfiles de acceso.",
        objetos: 5,
        submodulos: ["Crear perfil", "Editar permisos"],
      },
      {
        nombre: "Roles",
        ruta: "/roles/index",
        estado: "activo",
        descripcion: "Definición de roles y permisos del sistema.",
        objetos: 6,
        submodulos: ["Crear rol", "Asignar objetos", "Editar rol"],
      },
      {
        nombre: "Menú",
        ruta: "/menu/index",
        estado: "activo",
        descripcion: "Gestión de ítems del menú lateral dinámico.",
        objetos: 7,
        submodulos: ["Crear ítem", "Editar ítem", "Activar/Inactivar", "Ordenar sidebar → /menu/orden"],
      },
      {
        nombre: "Objetos",
        ruta: "/objetos/index",
        estado: "activo",
        descripcion: "Objetos asignables a roles (vistas, acciones, permisos).",
        objetos: 4,
        submodulos: ["Crear objeto", "Editar objeto"],
      },
      {
        nombre: "Clientes / Ventas",
        ruta: "/clientes-ventas/index",
        estado: "activo",
        descripcion: "Listado de clientes con historial de compras.",
        objetos: 6,
        submodulos: ["Ver detalle", "Exportar"],
      },
      {
        nombre: "Empleados",
        ruta: "/empleados/index",
        estado: "activo",
        descripcion: "Gestión de empleados internos.",
        objetos: 5,
        submodulos: ["Crear", "Editar", "Desactivar"],
      },
      {
        nombre: "Vendedor",
        ruta: "/vendedor/index",
        estado: "activo",
        descripcion: "Panel de vendedores con comisiones y estadísticas.",
        objetos: 4,
        submodulos: ["Ver métricas", "Asignar zona"],
      },
      {
        nombre: "Backup",
        ruta: "/backup/index",
        estado: "activo",
        descripcion: "Respaldo y restauración de la base de datos.",
        objetos: 3,
        submodulos: ["Generar backup", "Descargar", "Restaurar"],
      },
      {
        nombre: "Mi Perfil",
        ruta: "/profile/index",
        estado: "activo",
        descripcion: "Edición del perfil del usuario autenticado.",
        objetos: 3,
        submodulos: ["Cambiar foto", "Cambiar contraseña"],
      },
    ],
  },

  /* ══════════ VENTAS / PRODUCTOS ══════════ */
  {
    grupo: "Ventas & Productos",
    icono: <ShoppingCartIcon />,
    color: "#059669",
    modulos: [
      {
        nombre: "Pedidos",
        ruta: "/pedidos/index",
        estado: "activo",
        descripcion: "Gestión de órdenes de compra (pendiente, procesando, entregado).",
        objetos: 10,
        submodulos: ["Ver detalle", "Cambiar estado", "Imprimir orden", "Notificar cliente"],
      },
      {
        nombre: "Facturas",
        ruta: "/facturas/index",
        estado: "activo",
        descripcion: "Listado y descarga de facturas generadas.",
        objetos: 5,
        submodulos: ["Descargar PDF", "Reenviar email"],
      },
      {
        nombre: "Balance de Ventas",
        ruta: "/balance_ventas/index",
        estado: "activo",
        descripcion: "Reporte de ingresos y balance por período.",
        objetos: 7,
        submodulos: ["Filtrar por fecha", "Exportar Excel"],
      },
      {
        nombre: "Productos",
        ruta: "/producto/index",
        estado: "activo",
        descripcion: "CRUD completo de productos del catálogo.",
        objetos: 14,
        submodulos: ["Crear", "Editar", "Importar → /producto/importar", "Galería", "Precio", "Stock", "SEO"],
      },
      {
        nombre: "Categorías",
        ruta: "/categoria/index",
        estado: "activo",
        descripcion: "Árbol de categorías y subcategorías.",
        objetos: 6,
        submodulos: ["Crear", "Editar", "Árbol jerárquico"],
      },
      {
        nombre: "Promociones",
        ruta: "/promocion/index",
        estado: "activo",
        descripcion: "Gestión de descuentos y códigos de promoción.",
        objetos: 5,
        submodulos: ["Crear cupón", "Fechas vigencia", "Tipo descuento"],
      },
      {
        nombre: "Oferta del Día",
        ruta: "/ofertas/index",
        estado: "activo",
        descripcion: "Oferta destacada con cuenta regresiva.",
        objetos: 4,
        submodulos: ["Seleccionar producto", "Definir tiempo"],
      },
      {
        nombre: "Envíos",
        ruta: "/envios/index",
        estado: "activo",
        descripcion: "Configuración de tarifas y zonas de envío.",
        objetos: 5,
        submodulos: ["Zonas", "Tarifas", "Courier"],
      },
    ],
  },

  /* ══════════ WEB / CMS ══════════ */
  {
    grupo: "Web / CMS",
    icono: <WebIcon />,
    color: "#7c3aed",
    modulos: [
      {
        nombre: "Header",
        ruta: "/header/index",
        estado: "activo",
        descripcion: "Logo, menú de navegación y top-bar del sitio web.",
        objetos: 6,
        submodulos: ["Logo", "Menú nav", "Top bar", "WhatsApp", "Redes side"],
      },
      {
        nombre: "Footer",
        ruta: "/footer/index",
        estado: "activo",
        descripcion: "Contenido del pie de página (contacto, redes, descripción).",
        objetos: 8,
        submodulos: ["Textos", "Redes sociales", "Teléfonos", "Correos", "Dirección"],
      },
      {
        nombre: "Slider / Banner",
        ruta: "/slider/index",
        estado: "activo",
        descripcion: "Carrusel principal de la página de inicio.",
        objetos: 5,
        submodulos: ["Agregar slide", "Ordenar", "Imagen", "Texto CTA"],
      },
      {
        nombre: "Carrusel",
        ruta: "/carrusel/index",
        estado: "activo",
        descripcion: "Carrusel secundario de imágenes o marcas.",
        objetos: 4,
        submodulos: ["Agregar ítem", "Ordenar"],
      },
      {
        nombre: "Página Nosotros",
        ruta: "/pagina-nosotros/index",
        estado: "activo",
        descripcion: "Contenido completo de la página /nosotros.",
        objetos: 9,
        submodulos: ["Banner", "Misión/Visión", "Contadores", "Catálogo", "Frase CTA"],
      },
      {
        nombre: "Página Productos",
        ruta: "/pagina-productos/index",
        estado: "activo",
        descripcion: "Configuración de la página /productos.",
        objetos: 6,
        submodulos: ["Banner", "Intro imagen", "Frase CTA"],
      },
      {
        nombre: "Página Maquinarias",
        ruta: "/pagina-maquinarias/index",
        estado: "activo",
        descripcion: "Galería de maquinarias con flip-card hover.",
        objetos: 7,
        submodulos: ["Banner", "Galería items", "Frase CTA"],
      },
      {
        nombre: "Página Contacto",
        ruta: "/pagina-contacto/index",
        estado: "activo",
        descripcion: "Formulario, mapa y datos de contacto de la página /contacto.",
        objetos: 8,
        submodulos: ["Banner", "Formulario", "Mapa embed", "Suscripción", "Frase CTA"],
      },
      {
        nombre: "Servicios",
        ruta: "/servicios/index",
        estado: "activo",
        descripcion: "Listado de servicios ofrecidos.",
        objetos: 5,
        submodulos: ["Agregar servicio", "Ícono", "Descripción"],
      },
      {
        nombre: "FAQ",
        ruta: "/faq/index",
        estado: "activo",
        descripcion: "Preguntas frecuentes con acordeón.",
        objetos: 4,
        submodulos: ["Agregar pregunta", "Editar", "Orden"],
      },
      {
        nombre: "Testimonios",
        ruta: "/testimonios/index",
        estado: "activo",
        descripcion: "Reseñas y testimonios de clientes.",
        objetos: 5,
        submodulos: ["Agregar", "Foto", "Calificación"],
      },
      {
        nombre: "Nuestro Equipo",
        ruta: "/nuestro_equipo/index",
        estado: "activo",
        descripcion: "Perfiles del equipo de trabajo.",
        objetos: 5,
        submodulos: ["Agregar miembro", "Foto", "Redes"],
      },
      {
        nombre: "Contadores",
        ruta: "/contadores/index",
        estado: "activo",
        descripcion: "Estadísticas animadas (años, clientes, proyectos).",
        objetos: 4,
        submodulos: ["Agregar contador", "Valor", "Sufijo", "Etiqueta"],
      },
      {
        nombre: "Portafolio",
        ruta: "/portafolio/index",
        estado: "activo",
        descripcion: "Galería de trabajos/proyectos.",
        objetos: 5,
        submodulos: ["Agregar item", "Imagen", "Categoría"],
      },
      {
        nombre: "Eventos",
        ruta: "/eventos/index",
        estado: "activo",
        descripcion: "Agenda de eventos próximos.",
        objetos: 5,
        submodulos: ["Crear evento", "Fecha", "Lugar", "Imagen"],
      },
      {
        nombre: "Publicaciones",
        ruta: "/publicaciones/index",
        estado: "activo",
        descripcion: "Blog / artículos del sitio.",
        objetos: 6,
        submodulos: ["Crear artículo", "Editor", "Categoría", "SEO"],
      },
      {
        nombre: "Videos",
        ruta: "/videos/index",
        estado: "activo",
        descripcion: "Galería de videos embed (YouTube/Vimeo).",
        objetos: 5,
        submodulos: ["Agregar video", "URL embed", "Miniatura", "Frase CTA"],
      },
      {
        nombre: "Ejemplares",
        ruta: "/ejemplares/index",
        estado: "activo",
        descripcion: "Muestra de ejemplares o muestras físicas.",
        objetos: 4,
        submodulos: ["Agregar", "Imagen", "Descripción"],
      },
      {
        nombre: "Producto Destacado",
        ruta: "/producto-destacado/index",
        estado: "activo",
        descripcion: "Selección de producto destacado en home.",
        objetos: 3,
        submodulos: ["Seleccionar producto"],
      },
      {
        nombre: "Catálogo Producto",
        ruta: "/producto-catalogo/index",
        estado: "activo",
        descripcion: "Gestión del catálogo visual de productos.",
        objetos: 4,
        submodulos: ["Imagen catálogo", "Descripción"],
      },
      {
        nombre: "Línea de Producto",
        ruta: "/linea-producto/index",
        estado: "activo",
        descripcion: "Líneas/familias de productos.",
        objetos: 4,
        submodulos: ["Agregar línea", "Imagen", "Descripción"],
      },
      {
        nombre: "Clientes Web",
        ruta: "/clientes/index",
        estado: "activo",
        descripcion: "Logos de clientes/marcas en el sitio web.",
        objetos: 3,
        submodulos: ["Agregar logo", "Ordenar"],
      },
      {
        nombre: "Beneficios",
        ruta: "/beneficio/index",
        estado: "activo",
        descripcion: "Sección de beneficios o ventajas.",
        objetos: 4,
        submodulos: ["Agregar beneficio", "Ícono", "Descripción"],
      },
      {
        nombre: "Metodología",
        ruta: "/metodologia/index",
        estado: "activo",
        descripcion: "Pasos o proceso de trabajo.",
        objetos: 4,
        submodulos: ["Agregar paso", "Número", "Descripción"],
      },
      {
        nombre: "Porque Elegirnos",
        ruta: "/porque_elejirnos/index",
        estado: "activo",
        descripcion: "Razones de diferenciación de la empresa.",
        objetos: 4,
        submodulos: ["Agregar razón", "Ícono"],
      },
      {
        nombre: "Característica About",
        ruta: "/about-caracteristica/index",
        estado: "activo",
        descripcion: "Características detalladas de la sección nosotros.",
        objetos: 4,
        submodulos: ["Agregar", "Editar"],
      },
      {
        nombre: "Confianza Items",
        ruta: "/confianza-item/index",
        estado: "activo",
        descripcion: "Items/logos de confianza y certificaciones.",
        objetos: 3,
        submodulos: ["Agregar logo", "Ordenar"],
      },
      {
        nombre: "Popular / Categoría",
        ruta: "/popular/index",
        estado: "activo",
        descripcion: "Sección de categorías populares en home.",
        objetos: 4,
        submodulos: ["Seleccionar categoría", "Imagen"],
      },
      {
        nombre: "Planes",
        ruta: "/planes/index",
        estado: "activo",
        descripcion: "Sección de planes o precios.",
        objetos: 5,
        submodulos: ["Agregar plan", "Precio", "Features"],
      },
      {
        nombre: "Contacto Landing",
        ruta: "/contacto-landing/index",
        estado: "activo",
        descripcion: "Formulario de contacto embebido en landing.",
        objetos: 4,
        submodulos: ["Configurar campos", "Email destino"],
      },
      {
        nombre: "Contacto Mensajes",
        ruta: "/contacto-mensajes/index",
        estado: "activo",
        descripcion: "Bandeja de mensajes recibidos del formulario de contacto.",
        objetos: 4,
        submodulos: ["Ver mensaje", "Marcar leído", "Responder"],
      },
      {
        nombre: "Libro de Reclamos",
        ruta: "/libro_reclamo/index",
        estado: "activo",
        descripcion: "Gestión de reclamos de clientes.",
        objetos: 5,
        submodulos: ["Ver reclamo", "Responder", "Estado"],
      },
      {
        nombre: "Metadatos de Página",
        ruta: "/metadatospagina/index",
        estado: "activo",
        descripcion: "SEO: title, description, keywords por página.",
        objetos: 4,
        submodulos: ["Editar meta title", "Meta description", "OG tags"],
      },
      {
        nombre: "Mas Vendidos",
        ruta: null,
        estado: "inactivo",
        descripcion: "Sección de productos más vendidos (comentado en routes.jsx).",
        objetos: 0,
        submodulos: [],
      },
    ],
  },

  /* ══════════ CONFIGURACIÓN ══════════ */
  {
    grupo: "Configuración",
    icono: <SettingsIcon />,
    color: "#d97706",
    modulos: [
      {
        nombre: "Pasarela de Pago",
        ruta: "/configuracion/pasarela",
        estado: "activo",
        descripcion: "Configuración de Culqi, PayPal u otras pasarelas.",
        objetos: 5,
        submodulos: ["API keys", "Modo sandbox", "Moneda"],
      },
      {
        nombre: "Auth Proveedor",
        ruta: "/configuracion/auth-proveedor",
        estado: "activo",
        descripcion: "Configuración de proveedores de autenticación (Google, GitHub).",
        objetos: 4,
        submodulos: ["Client ID", "Secret", "Redirect URI"],
      },
      {
        nombre: "Favicon",
        ruta: "/configuracion/favicon",
        estado: "activo",
        descripcion: "Subida y configuración del favicon del sitio.",
        objetos: 2,
        submodulos: ["Subir imagen", "Preview"],
      },
    ],
  },

  /* ══════════ ANÁLISIS ══════════ */
  {
    grupo: "Análisis & Reportes",
    icono: <AssessmentIcon />,
    color: "#0284c7",
    modulos: [
      {
        nombre: "Gráficos ECharts",
        ruta: "/charts/echarts",
        estado: "activo",
        descripcion: "Página de gráficos interactivos con Apache ECharts.",
        objetos: 3,
        submodulos: ["Líneas", "Barras", "Pastel"],
      },
    ],
  },

  /* ══════════ PENDIENTES / MEJORAS ══════════ */
  {
    grupo: "Pendientes & Mejoras",
    icono: <BuildIcon />,
    color: "#dc2626",
    modulos: [
      {
        nombre: "Notificaciones Push",
        ruta: null,
        estado: "pendiente",
        descripcion: "Módulo para enviar notificaciones push a clientes (por desarrollar).",
        objetos: 0,
        submodulos: [],
      },
      {
        nombre: "Chat en Vivo",
        ruta: null,
        estado: "pendiente",
        descripcion: "Integración de chat en tiempo real con clientes.",
        objetos: 0,
        submodulos: [],
      },
      {
        nombre: "Reportes Avanzados",
        ruta: null,
        estado: "pendiente",
        descripcion: "Exportación de reportes en PDF/Excel con filtros avanzados.",
        objetos: 0,
        submodulos: [],
      },
      {
        nombre: "Multi-idioma CMS",
        ruta: null,
        estado: "pendiente",
        descripcion: "Traducción del contenido web a múltiples idiomas.",
        objetos: 0,
        submodulos: [],
      },
      {
        nombre: "Auditoría / Logs",
        ruta: null,
        estado: "pendiente",
        descripcion: "Registro de acciones de usuarios (quién hizo qué y cuándo).",
        objetos: 0,
        submodulos: [],
      },
      {
        nombre: "Mas Vendidos",
        ruta: null,
        estado: "inactivo",
        descripcion: "Vista comentada en routes.jsx — pendiente de activación.",
        objetos: 0,
        submodulos: [],
      },
    ],
  },
];

/* ── KPI totales ── */
function calcularKpis(data) {
  let totalModulos = 0, activos = 0, inactivos = 0, pendientes = 0;
  let totalObjetos = 0, totalSubmodulos = 0, totalRutas = 0;
  data.forEach((g) => {
    g.modulos.forEach((m) => {
      totalModulos++;
      if (m.estado === "activo") activos++;
      else if (m.estado === "inactivo") inactivos++;
      else if (m.estado === "pendiente") pendientes++;
      totalObjetos += m.objetos;
      totalSubmodulos += m.submodulos.length;
      if (m.ruta) totalRutas++;
    });
  });
  return { totalModulos, activos, inactivos, pendientes, totalObjetos, totalSubmodulos, totalRutas };
}

/* ── Chip de estado ── */
const EstadoChip = ({ estado }) => {
  const map = {
    activo:    { label: "Activo",    color: "success", icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
    inactivo:  { label: "Inactivo",  color: "error",   icon: <CancelIcon sx={{ fontSize: 14 }} /> },
    pendiente: { label: "Pendiente", color: "warning",  icon: <BuildIcon sx={{ fontSize: 14 }} /> },
  };
  const cfg = map[estado] ?? map.inactivo;
  return <Chip size="small" color={cfg.color} icon={cfg.icon} label={cfg.label} />;
};

/* ── Tarjeta de módulo ── */
function ModuleRow({ mod, groupColor, navigate }) {
  const [open, setOpen] = useState(false);
  return (
    <ModuleCard estado={mod.estado}>
      <Box
        sx={{ p: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        onClick={() => setOpen((v) => !v)}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <EstadoChip estado={mod.estado} />
          <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "#1e293b" }}>
            {mod.nombre}
          </Typography>
          {mod.ruta && (
            <Tooltip title={`Ir a ${mod.ruta}`}>
              <Chip
                size="small"
                icon={<LinkIcon sx={{ fontSize: 12 }} />}
                label={mod.ruta}
                onClick={(e) => { e.stopPropagation(); navigate(mod.ruta); }}
                sx={{ fontSize: "0.68rem", bgcolor: "#f1f5f9", cursor: "pointer", maxWidth: 220 }}
              />
            </Tooltip>
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {mod.objetos > 0 && (
            <Chip size="small" label={`${mod.objetos} obj`} sx={{ bgcolor: groupColor, color: "#fff", fontSize: "0.68rem" }} />
          )}
          {mod.submodulos.length > 0 && (
            <Chip size="small" label={`${mod.submodulos.length} sub`} sx={{ bgcolor: "#e2e8f0", fontSize: "0.68rem" }} />
          )}
          <IconButton size="small">{open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}</IconButton>
        </Stack>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 1.5, borderTop: "1px solid #f1f5f9" }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {mod.descripcion}
          </Typography>
          {mod.submodulos.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {mod.submodulos.map((s, i) => (
                <Chip key={i} size="small" label={s} variant="outlined" sx={{ fontSize: "0.68rem" }} />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </ModuleCard>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function InformeSistemaPage() {
  const navigate = useNavigate();
  const [tabIdx, setTabIdx] = useState(0);
  const [search, setSearch] = useState("");

  const kpis = useMemo(() => calcularKpis(SISTEMA), []);

  const gruposFiltrados = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return SISTEMA;
    return SISTEMA.map((g) => ({
      ...g,
      modulos: g.modulos.filter(
        (m) =>
          m.nombre.toLowerCase().includes(q) ||
          (m.ruta ?? "").toLowerCase().includes(q) ||
          m.descripcion.toLowerCase().includes(q)
      ),
    })).filter((g) => g.modulos.length > 0);
  }, [search]);

  /* tab filter */
  const TAB_ESTADOS = ["todos", "activo", "inactivo", "pendiente"];
  const gruposTab = useMemo(() => {
    const est = TAB_ESTADOS[tabIdx];
    if (est === "todos") return gruposFiltrados;
    return gruposFiltrados.map((g) => ({
      ...g,
      modulos: g.modulos.filter((m) => m.estado === est),
    })).filter((g) => g.modulos.length > 0);
  }, [gruposFiltrados, tabIdx]);

  const pct = Math.round((kpis.activos / kpis.totalModulos) * 100);

  return (
    <PageRoot>
      {/* ── Header ── */}
      <Paper sx={{ p: "20px 28px", mb: 3, background: "linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#ff0605", width: 48, height: 48 }}>
            <AssessmentIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff">Informe del Sistema</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
              Inventario completo de módulos, rutas, objetos y submódulos del panel administrativo
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total módulos",   value: kpis.totalModulos,   color: "#0f172a", icon: <DashboardIcon sx={{ color: "#0f172a" }} /> },
          { label: "Activos",         value: kpis.activos,        color: "#059669", icon: <CheckCircleIcon sx={{ color: "#059669" }} /> },
          { label: "Inactivos",       value: kpis.inactivos,      color: "#dc2626", icon: <CancelIcon sx={{ color: "#dc2626" }} /> },
          { label: "Pendientes",      value: kpis.pendientes,     color: "#d97706", icon: <BuildIcon sx={{ color: "#d97706" }} /> },
          { label: "Rutas registradas", value: kpis.totalRutas,   color: "#0284c7", icon: <LinkIcon sx={{ color: "#0284c7" }} /> },
          { label: "Total objetos",   value: kpis.totalObjetos,   color: "#7c3aed", icon: <StorageIcon sx={{ color: "#7c3aed" }} /> },
          { label: "Total submódulos", value: kpis.totalSubmodulos, color: "#0891b2", icon: <WebIcon sx={{ color: "#0891b2" }} /> },
          { label: "Grupos/Secciones", value: SISTEMA.length,    color: "#475569", icon: <AssessmentIcon sx={{ color: "#475569" }} /> },
        ].map((k) => (
          <Grid key={k.label} size={{ xs: 6, sm: 3, md: 3 }}>
            <KpiCard elevation={2} color={k.color}>
              {k.icon}
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: k.color, lineHeight: 1 }}>{k.value}</Typography>
                <Typography variant="caption" color="text.secondary">{k.label}</Typography>
              </Box>
            </KpiCard>
          </Grid>
        ))}
      </Grid>

      {/* ── Barra de salud ── */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="body2" fontWeight={700}>Cobertura activa del sistema</Typography>
          <Typography variant="body2" fontWeight={800} color="success.main">{pct}%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={pct} color="success" sx={{ height: 10, borderRadius: 5 }} />
        <Typography variant="caption" color="text.secondary">
          {kpis.activos} de {kpis.totalModulos} módulos activos · {kpis.pendientes} por desarrollar · {kpis.inactivos} inactivos
        </Typography>
      </Paper>

      {/* ── Búsqueda + Tabs ── */}
      <Paper sx={{ p: "12px 16px", mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <TextField
            size="small" placeholder="Buscar módulo, ruta o descripción…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ minHeight: 36 }}>
            {["Todos", "Activos", "Inactivos", "Pendientes"].map((lbl, i) => {
              const counts = [kpis.totalModulos, kpis.activos, kpis.inactivos, kpis.pendientes];
              return (
                <Tab
                  key={lbl}
                  label={
                    <Badge badgeContent={counts[i]} color={["default","success","error","warning"][i]} sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem" } }}>
                      <Box sx={{ pr: 1.5 }}>{lbl}</Box>
                    </Badge>
                  }
                  sx={{ minHeight: 36, py: 0.5, fontSize: "0.78rem" }}
                />
              );
            })}
          </Tabs>
        </Stack>
      </Paper>

      {/* ── Grupos de módulos ── */}
      {gruposTab.map((grupo) => (
        <Box key={grupo.grupo} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Avatar sx={{ bgcolor: grupo.color, width: 32, height: 32 }}>
              {grupo.icono}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: grupo.color }}>
              {grupo.grupo}
            </Typography>
            <Chip size="small" label={`${grupo.modulos.length} módulos`} sx={{ bgcolor: grupo.color, color: "#fff", fontSize: "0.68rem" }} />
          </Stack>
          <Stack spacing={1}>
            {grupo.modulos.map((mod) => (
              <ModuleRow key={mod.nombre} mod={mod} groupColor={grupo.color} navigate={navigate} />
            ))}
          </Stack>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}

      {gruposTab.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="text.secondary">No se encontraron módulos con ese criterio.</Typography>
        </Paper>
      )}
    </PageRoot>
  );
}
