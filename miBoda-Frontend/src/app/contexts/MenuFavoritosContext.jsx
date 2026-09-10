import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import useAuth from "app/hooks/useAuth";
import useTabs from "app/contexts/TabsContext";
import { normalizeTabPath, formatPathTitle } from "app/contexts/TabsContext";
import {
  listarFavoritos,
  toggleFavorito,
} from "app/api/menuFavoritos.api";
import { findNavItemByPath, normalizeNavPath, pathsMatch } from "app/utils/flattenNavItems";
import { toastSuccess } from "app/components/notify-messages";
import { subscribeSidebarReload } from "app/store/sidebarCache";

const MenuFavoritosContext = createContext(null);

export function MenuFavoritosProvider({ children }) {
  const { isAuthenticated, user, perfil } = useAuth();
  const location = useLocation();
  const { tabs, activeKey } = useTabs();
  const [favoritos, setFavoritos] = useState([]);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const idRoles = perfil?.id_roles != null ? Number(perfil.id_roles) : null;

  const registerSidebarItems = useCallback((items) => {
    setSidebarItems(Array.isArray(items) ? items : []);
  }, []);

  const loadFavoritos = useCallback(async () => {
    if (!isAuthenticated || !idRoles) {
      setFavoritos([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await listarFavoritos(idRoles);
      setFavoritos(Array.isArray(rows) ? rows : []);
    } catch {
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, idRoles]);

  useEffect(() => {
    loadFavoritos();
  }, [loadFavoritos, user?.id, idRoles]);

  useEffect(() => {
    return subscribeSidebarReload(loadFavoritos);
  }, [loadFavoritos]);

  const resolveCurrentMeta = useCallback(
    (path) => {
      const key = normalizeNavPath(normalizeTabPath(path || activeKey || location.pathname));
      const tab = tabs.find((t) => pathsMatch(t.key, key));
      const nav = findNavItemByPath(sidebarItems, key);
      return {
        path: key,
        nombre: tab?.title || nav?.name || formatPathTitle(key),
        icon: nav?.icon || null,
        id_menu: nav?.id_menu ?? null,
        id_modulo: nav?.id_modulo ?? null,
        id_roles: idRoles,
      };
    },
    [activeKey, location.pathname, sidebarItems, tabs, idRoles]
  );

  const isFavorite = useCallback(
    (path) => {
      const key = normalizeNavPath(path);
      return favoritos.some((f) => pathsMatch(f.path, key));
    },
    [favoritos]
  );

  const toggleFavorite = useCallback(
    async (pathOrMeta) => {
      if (!idRoles) return null;

      const meta =
        typeof pathOrMeta === "string"
          ? resolveCurrentMeta(pathOrMeta)
          : { ...resolveCurrentMeta(), ...pathOrMeta, id_roles: idRoles };

      if (!meta.path || meta.path === "/") {
        return null;
      }

      const wasFavorite = isFavorite(meta.path);

      setFavoritos((prev) => {
        if (wasFavorite) {
          return prev.filter((f) => !pathsMatch(f.path, meta.path));
        }
        return [
          ...prev,
          {
            id_favorito: `tmp-${meta.path}`,
            path: meta.path,
            nombre: meta.nombre,
            icon: meta.icon || "favorite",
            id_menu: meta.id_menu,
            id_modulo: meta.id_modulo,
            id_roles: idRoles,
            visitas: 1,
          },
        ];
      });

      try {
        const result = await toggleFavorito(meta);
        await loadFavoritos();
        if (result?.accion === "agregado") {
          toastSuccess("Agregado a favoritos de este rol");
        } else {
          toastSuccess("Quitado de favoritos de este rol");
        }
        return result;
      } catch {
        await loadFavoritos();
        return null;
      }
    },
    [idRoles, isFavorite, loadFavoritos, resolveCurrentMeta]
  );

  const toggleCurrentFavorite = useCallback(() => {
    return toggleFavorite(resolveCurrentMeta());
  }, [toggleFavorite, resolveCurrentMeta]);

  const favoritosNavItems = useMemo(
    () =>
      favoritos.map((f) => ({
        name: f.nombre || f.path,
        path: normalizeNavPath(f.path),
        icon: f.icon || "favorite",
        id_menu: f.id_menu,
        id_modulo: f.id_modulo,
        isFavoriteEntry: true,
      })),
    [favoritos]
  );

  const value = useMemo(
    () => ({
      favoritos,
      favoritosNavItems,
      idRoles,
      loading,
      isFavorite,
      toggleFavorite,
      toggleCurrentFavorite,
      reloadFavoritos: loadFavoritos,
      registerSidebarItems,
    }),
    [
      favoritos,
      favoritosNavItems,
      idRoles,
      loading,
      isFavorite,
      toggleFavorite,
      toggleCurrentFavorite,
      loadFavoritos,
      registerSidebarItems,
    ]
  );

  return (
    <MenuFavoritosContext.Provider value={value}>
      {children}
    </MenuFavoritosContext.Provider>
  );
}

export default function useMenuFavoritos() {
  const ctx = useContext(MenuFavoritosContext);
  if (!ctx) {
    return {
      favoritos: [],
      favoritosNavItems: [],
      idRoles: null,
      loading: false,
      isFavorite: () => false,
      toggleFavorite: async () => null,
      toggleCurrentFavorite: async () => null,
      reloadFavoritos: () => {},
      registerSidebarItems: () => {},
    };
  }
  return ctx;
}
