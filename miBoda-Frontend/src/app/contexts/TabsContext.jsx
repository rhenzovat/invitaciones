import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TabsContext = createContext(null);

const HOME_PATH = "/dashboard/default";

/** Títulos legibles para rutas frecuentes del admin. */
const ROUTE_TITLES = {
  "/dashboard/default": "Dashboard",
  "/clientes/index": "Clientes web",
  "/clientes-ventas/index": "Clientes ventas",
  "/empleados/index": "Empleados",
  "/vendedor/index": "Vendedor",
  "/backup/index": "Backup",
  "/usuarios/index": "Usuarios",
  "/perfiles/index": "Perfiles",
  "/roles/index": "Roles",
  "/menu/index": "Menú",
  "/menu/orden": "Orden menú",
  "/objetos/index": "Objetos",
  "/profile/index": "Perfil",
  "/producto/index": "Productos",
  "/producto/importar": "Importar productos",
  "/footer/index": "Footer",
  "/whatsapp/index": "WhatsApp",
  "/slider/index": "Slider",
  "/planes/index": "Planes",
  "/pedidos/index": "Pedidos",
  "/facturas/index": "Facturas",
  "/balance_ventas/index": "Balance ventas",
  "/categoria/index": "Categorías",
  "/promocion/index": "Promociones",
  "/ofertas/index": "Ofertas del día",
  "/metadatospagina/index": "Metadatos página",
  "/envios/index": "Envíos",
  "/popular/index": "Popular",
  "/libro_reclamo/index": "Libro de reclamos",
  "/configuracion/pasarela": "Pasarela",
  "/configuracion/auth-proveedor": "Auth proveedor",
  "/configuracion/favicon": "Favicon",
  "/charts/echarts": "Gráficos",
  "/metodologia/index": "Metodología",
  "/servicios/index": "Servicios",
  "/faq/index": "FAQ",
  "/testimonios/index": "Testimonios",
  "/beneficio/index": "Beneficios",
  "/porque_elejirnos/index": "Por qué elegirnos",
  "/nuestro_equipo/index": "Nuestro equipo",
  "/header/index": "Header",
  "/carrusel/index": "Carrusel",
  "/eventos/index": "Eventos",
  "/publicaciones/index": "Publicaciones",
  "/contadores/index": "Contadores",
  "/pagina-nosotros/index": "Página Nosotros",
  "/pagina-contacto/index": "Página Contacto",
  "/informe-sistema/index": "Informe del Sistema",
  "/informe_sistema/index": "Informe del Sistema",
};

export function normalizeTabPath(path) {
  const p = path || "/";
  return p.replace(/\/$/, "") || "/";
}

export function formatPathTitle(path) {
  const key = normalizeTabPath(path);
  if (ROUTE_TITLES[key]) return ROUTE_TITLES[key];
  const seg = key.split("/").filter(Boolean).pop() || "inicio";
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function createTab(path, title) {
  const key = normalizeTabPath(path);
  return {
    key,
    path: key,
    title: title || ROUTE_TITLES[key] || formatPathTitle(key),
  };
}

export function TabsProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = normalizeTabPath(location.pathname);

  const [tabs, setTabs] = useState(() => [
    createTab(pathname || HOME_PATH),
  ]);

  const openTab = useCallback(
    (path, title, navigateOptions) => {
      const key = normalizeTabPath(path);
      if (!key) return;

      setTabs((prev) => {
        const exists = prev.find((t) => t.key === key);
        if (exists) {
          if (title && exists.title !== title) {
            return prev.map((t) =>
              t.key === key ? { ...t, title } : t
            );
          }
          return prev;
        }
        return [
          ...prev,
          { key, path: key, title: title || formatPathTitle(key) },
        ];
      });

      const current = normalizeTabPath(location.pathname);
      if (current !== key) {
        navigate(key, navigateOptions);
      } else if (navigateOptions) {
        navigate(key, navigateOptions);
      }
    },
    [location.pathname, navigate]
  );

  const setActiveTab = useCallback(
    (key) => {
      const k = normalizeTabPath(key);
      if (k === pathname) return;
      const tab = tabs.find((t) => t.key === k);
      if (tab) navigate(tab.path);
    },
    [navigate, tabs, pathname]
  );

  const closeTab = useCallback(
    (targetKey) => {
      const key = normalizeTabPath(targetKey);
      setTabs((prev) => {
        if (prev.length <= 1) return prev;

        const idx = prev.findIndex((t) => t.key === key);
        const next = prev.filter((t) => t.key !== key);

        if (pathname === key) {
          const fallback =
            next[Math.min(idx, next.length - 1)] ?? next[next.length - 1];
          if (fallback) navigate(fallback.path);
        }

        return next;
      });
    },
    [navigate, pathname]
  );

  /** Cierra todas las pestañas excepto la indicada y la activa. */
  const closeOtherTabs = useCallback(
    (keepKey) => {
      const key = normalizeTabPath(keepKey);
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const kept = prev.find((t) => t.key === key);
        if (!kept) return prev;
        return [kept];
      });
      if (pathname !== key) navigate(key);
    },
    [navigate, pathname]
  );

  /** Cierra todas las pestañas y deja solo el Dashboard. */
  const closeAllTabs = useCallback(() => {
    setTabs([createTab(HOME_PATH)]);
    if (pathname !== HOME_PATH) navigate(HOME_PATH);
  }, [navigate, pathname]);

  /** Al cambiar la URL (menú, atrás/adelante), abrir pestaña si no existe. */
  useEffect(() => {
    setTabs((prev) => {
      if (prev.some((t) => t.key === pathname)) return prev;
      const next = [
        ...prev,
        {
          key: pathname,
          path: pathname,
          title: formatPathTitle(pathname),
        },
      ];
      return next;
    });
  }, [pathname]);

  const value = useMemo(
    () => ({
      tabs,
      activeKey: pathname,
      openTab,
      closeTab,
      closeOtherTabs,
      closeAllTabs,
      setActiveTab,
    }),
    [tabs, pathname, openTab, closeTab, closeOtherTabs, closeAllTabs, setActiveTab]
  );

  return (
    <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
  );
}

export default function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("useTabs debe usarse dentro de TabsProvider");
  }
  return ctx;
}
