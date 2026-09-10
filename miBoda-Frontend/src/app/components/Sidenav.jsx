import { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import Scrollbar from "react-perfect-scrollbar";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { MatxVerticalNav } from "app/components";
import SidebarNavGroup from "app/components/SidebarNavGroup";
import useSettings from "app/hooks/useSettings";
import useAuth from "app/hooks/useAuth";
import useMenuFavoritos from "app/contexts/MenuFavoritosContext";
import { listarSidebar } from "app/api/menu.api";
import { subscribeSidebarReload } from "app/store/sidebarCache";
import { filterNavItems } from "app/components/MatxVerticalNav/filterNavItems";
import { SIDEBAR_PADDING_X, ACCENT, TEXT_MUTED } from "app/components/MatxVerticalNav/sidebarTheme";

// STYLED COMPONENTS
const SideNavRoot = styled(Box)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  height: "100%",
  overflow: "hidden",
});

const SearchSticky = styled(Box, {
  shouldForwardProp: (prop) => prop !== "mode",
})(({ mode }) => ({
  flexShrink: 0,
  display: mode === "compact" ? "none" : "block",
  paddingLeft: SIDEBAR_PADDING_X,
  paddingRight: SIDEBAR_PADDING_X,
  paddingTop: 4,
  paddingBottom: 8,
  zIndex: 3,
  background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
  boxShadow: "0 6px 12px rgba(15, 15, 35, 0.45)",
}));

const StyledScrollBar = styled(Scrollbar)(() => ({
  flex: 1,
  minHeight: 0,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  paddingLeft: SIDEBAR_PADDING_X,
  paddingRight: SIDEBAR_PADDING_X,
  position: "relative",
  overflow: "hidden",
}));

const SideNavMobile = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  width: "100vw",
  background: "rgba(0, 0, 0, 0.54)",
  [theme.breakpoints.up("lg")]: { display: "none" }
}));

const SearchWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  background: "rgba(255,255,255,0.07)",
  borderRadius: "6px",
  padding: "3px 8px",
  marginBottom: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "border-color 200ms ease-in-out, background 200ms ease-in-out",
  "&:focus-within": {
    borderColor: ACCENT,
    background: "rgba(74, 222, 128, 0.06)"
  }
}));

/** Normaliza ítems del API recursivamente (multinivel, path con /, formato esperado por MatxVerticalNav). */
function normalizeSidebarItems(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((item) => {
    const normalized = {
      name: item.name,
      id_menu: item.id_menu,
      id_modulo: item.id_modulo,
    };
    if (item.path) {
      normalized.path = item.path.startsWith("/") ? item.path : `/${item.path}`;
    }
    if (item.icon) {
      normalized.icon = item.icon;
    }
    if (item.children && item.children.length) {
      normalized.children = normalizeSidebarItems(item.children);
    }
    if (!normalized.icon) {
      normalized.iconText = (item.name || "M").substring(0, 2).toUpperCase();
    }
    return normalized;
  });
}

export default function Sidenav({ children }) {
  const { settings, updateSettings } = useSettings();
  const { isAuthenticated, perfil } = useAuth();
  const { favoritosNavItems, registerSidebarItems } = useMenuFavoritos();
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { mode } = settings.layout1Settings.leftSidebar;

  useEffect(() => {
    if (mode === "compact") setSearchQuery("");
  }, [mode]);

  const loadSidebarMenu = useCallback((options = {}) => {
    if (!isAuthenticated) {
      setMenuItems([]);
      return Promise.resolve();
    }
    return listarSidebar(perfil?.id_roles, options)
      .then((result) => setMenuItems(normalizeSidebarItems(result)))
      .catch(() => {
        setMenuItems([]);
      });
  }, [isAuthenticated, perfil?.id_roles]);

  useEffect(() => {
    loadSidebarMenu();
  }, [loadSidebarMenu]);

  useEffect(() => {
    return subscribeSidebarReload(() => loadSidebarMenu({ force: true }));
  }, [loadSidebarMenu]);

  useEffect(() => {
    registerSidebarItems(menuItems);
  }, [menuItems, registerSidebarItems]);

  const favoritosItems = useMemo(
    () => favoritosNavItems || [],
    [favoritosNavItems]
  );

  const favoritosVisibles = useMemo(
    () => filterNavItems(favoritosItems, searchQuery),
    [favoritosItems, searchQuery]
  );

  const sistemaVisibles = useMemo(
    () => filterNavItems(menuItems, searchQuery),
    [menuItems, searchQuery]
  );

  const updateSidebarMode = (sidebarSettings) => {
    let activeLayoutSettingsName = settings.activeLayout + "Settings";
    let activeLayoutSettings = settings[activeLayoutSettingsName];

    updateSettings({
      ...settings,
      [activeLayoutSettingsName]: {
        ...activeLayoutSettings,
        leftSidebar: { ...activeLayoutSettings.leftSidebar, ...sidebarSettings }
      }
    });
  };

  const showGroupedNav = mode !== "compact";

  return (
    <Fragment>
      <SideNavRoot>
        {children}
        <SearchSticky mode={mode}>
          <SearchWrapper
            component="form"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            <SearchIcon sx={{ color: TEXT_MUTED, fontSize: "16px", flexShrink: 0 }} />
            <InputBase
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar menú o ruta..."
              autoComplete="off"
              inputProps={{
                autoComplete: "off",
                name: "sidebar_nav_menu_filter",
                id: "sidebar-nav-menu-filter",
                role: "searchbox",
                "aria-label": "Buscar menú o ruta",
                "data-lpignore": "true",
                "data-form-type": "other",
                readOnly: true,
                onFocus: (e) => e.target.removeAttribute("readonly"),
              }}
              sx={{
                flex: 1,
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.85)",
                "& input::placeholder": { color: TEXT_MUTED, opacity: 1 }
              }}
            />
            {searchQuery && (
              <IconButton
                size="small"
                onClick={() => setSearchQuery("")}
                sx={{ color: TEXT_MUTED, padding: "2px", "&:hover": { color: ACCENT } }}>
                <ClearIcon sx={{ fontSize: "14px" }} />
              </IconButton>
            )}
          </SearchWrapper>
        </SearchSticky>

        <StyledScrollBar options={{ suppressScrollX: true }}>
        {showGroupedNav ? (
          <>
            <SidebarNavGroup
              title="favoritos"
              variant="favoritos"
              defaultOpen={false}
              emptyHint={
                favoritosVisibles.length === 0
                  ? searchQuery
                    ? "Sin coincidencias en favoritos"
                    : "Marca un menú con el corazón para agregarlo aquí"
                  : null
              }
            >
              {favoritosVisibles.length > 0 && (
                <MatxVerticalNav
                  items={favoritosItems}
                  searchQuery={searchQuery}
                  variant="favoritos"
                />
              )}
            </SidebarNavGroup>

            <SidebarNavGroup
              title="sistema"
              variant="sistema"
              defaultOpen={true}
              emptyHint={
                sistemaVisibles.length === 0 && searchQuery
                  ? "Sin coincidencias en el menú del sistema"
                  : null
              }
            >
              {sistemaVisibles.length > 0 && (
                <MatxVerticalNav
                  items={menuItems}
                  searchQuery={searchQuery}
                  variant="sistema"
                />
              )}
            </SidebarNavGroup>
          </>
        ) : (
          <MatxVerticalNav
            items={[...favoritosItems, ...menuItems]}
            searchQuery={searchQuery}
            variant="sistema"
          />
        )}
        </StyledScrollBar>
      </SideNavRoot>

      <SideNavMobile onClick={() => updateSidebarMode({ mode: "close" })} />
    </Fragment>
  );
}
