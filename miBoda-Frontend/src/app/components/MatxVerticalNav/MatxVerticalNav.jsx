import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import ButtonBase from "@mui/material/ButtonBase";
import Tooltip from "@mui/material/Tooltip";
import styled from "@mui/material/styles/styled";

import useSettings from "app/hooks/useSettings";
import { Paragraph, Span } from "../Typography";
import MatxVerticalNavExpansionPanel from "./MatxVerticalNavExpansionPanel";
import useAuth from "app/hooks/useAuth";
import { SIDEBAR_RESET_STATE_KEY } from "app/hooks/useSidebarModuleReset";
import useTabs from "app/contexts/TabsContext";
import { normalizeTabPath } from "app/contexts/TabsContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuFavoriteHeart from "app/components/MenuFavoriteHeart";
import { pathsMatch } from "app/utils/flattenNavItems";
import { filterNavItems } from "./filterNavItems";

import {
  ACCENT, ACCENT_HOVER_BG, ACCENT_ACTIVE_BG, ACTIVE_BORDER_LEFT,
  BADGE_BG, BADGE_PADDING, BADGE_BORDER_RADIUS, BADGE_FONT_SIZE, BADGE_FONT_WEIGHT,
  TEXT_PRIMARY, TEXT_ICON, TEXT_ACTIVE_WEIGHT, BULLET_BG,
  ITEM_HEIGHT, ITEM_MARGIN_BOTTOM, ITEM_BORDER_RADIUS,
  ICON_SIZE, ICON_PADDING_LEFT, ICON_PADDING_RIGHT, ICON_WIDTH,
  BULLET_SIZE_NAV, BULLET_MARGIN_LEFT, BULLET_MARGIN_RIGHT,
  TEXT_FONT_SIZE, TEXT_PADDING_LEFT, TEXT_FONT_WEIGHT,
  LABEL_FONT_SIZE, LABEL_MARGIN_TOP, LABEL_MARGIN_LEFT, LABEL_MARGIN_BOTTOM,
  LABEL_LETTER_SPACING, LABEL_FONT_WEIGHT, TEXT_LABEL,
  TRANSITION_SPEED, TRANSITION_EASING,
} from "./sidebarTheme";

/* ── Tooltip compacto ─────────────────────────────────────────── */
const tooltipSlotProps = {
  tooltip: {
    sx: {
      bgcolor: "#0f172a",
      color: "#f1f5f9",
      fontSize: "0.78rem",
      fontWeight: 600,
      px: 1.6,
      py: 0.9,
      borderRadius: "10px",
      boxShadow: "0 8px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
      letterSpacing: "0.01em",
    },
  },
  arrow: { sx: { color: "#0f172a" } },
};

const CompactTooltip = ({ title, mode, children }) => (
  <Tooltip
    title={title}
    placement="right"
    arrow
    disableHoverListener={mode !== "compact"}
    disableFocusListener
    disableTouchListener
    slotProps={tooltipSlotProps}
  >
    {children}
  </Tooltip>
);

// STYLED COMPONENTS
const ListLabel = styled(Paragraph)(({ theme, mode }) => ({
  fontSize: LABEL_FONT_SIZE,
  marginTop: LABEL_MARGIN_TOP,
  marginLeft: LABEL_MARGIN_LEFT,
  marginBottom: LABEL_MARGIN_BOTTOM,
  textTransform: "uppercase",
  letterSpacing: LABEL_LETTER_SPACING,
  fontWeight: LABEL_FONT_WEIGHT,
  display: mode === "compact" && "none",
  color: TEXT_LABEL
}));

const ExtAndIntCommon = {
  display: "flex",
  overflow: "hidden",
  borderRadius: ITEM_BORDER_RADIUS,
  height: ITEM_HEIGHT,
  whiteSpace: "pre",
  marginBottom: ITEM_MARGIN_BOTTOM,
  textDecoration: "none",
  justifyContent: "space-between",
  transition: `all ${TRANSITION_SPEED} ${TRANSITION_EASING}`,
  "&:hover": {
    background: ACCENT_HOVER_BG,
    "& .icon": { color: ACCENT }
  },
  "&.compactNavItem": {
    overflow: "hidden",
    justifyContent: "center !important"
  },
  "& .icon": {
    fontSize: ICON_SIZE,
    paddingLeft: ICON_PADDING_LEFT,
    paddingRight: ICON_PADDING_RIGHT,
    verticalAlign: "middle",
    color: TEXT_ICON,
    transition: `color ${TRANSITION_SPEED} ${TRANSITION_EASING}`
  }
};

const ExternalLink = styled("a")(() => ({
  ...ExtAndIntCommon,
  color: TEXT_PRIMARY
}));

const InternalLink = styled(Box)(() => ({
  "& a, & .MuiButtonBase-root": {
    ...ExtAndIntCommon,
    color: TEXT_PRIMARY
  },
  "& .navItemActive": {
    background: ACCENT_ACTIVE_BG,
    borderLeft: ACTIVE_BORDER_LEFT,
    "& .icon": { color: ACCENT },
    "& span": { color: "#ffffff", fontWeight: TEXT_ACTIVE_WEIGHT }
  }
}));

const StyledText = styled(Span)(({ mode }) => ({
  fontSize: TEXT_FONT_SIZE,
  paddingLeft: TEXT_PADDING_LEFT,
  display: mode === "compact" && "none",
  color: TEXT_PRIMARY,
  fontWeight: TEXT_FONT_WEIGHT
}));

const BulletIcon = styled("div")(() => ({
  padding: BULLET_SIZE_NAV,
  marginLeft: BULLET_MARGIN_LEFT,
  marginRight: BULLET_MARGIN_RIGHT,
  overflow: "hidden",
  borderRadius: "300px",
  background: BULLET_BG
}));

const BadgeValue = styled("div")(() => ({
  padding: BADGE_PADDING,
  overflow: "hidden",
  borderRadius: BADGE_BORDER_RADIUS,
  fontSize: BADGE_FONT_SIZE,
  fontWeight: BADGE_FONT_WEIGHT,
  background: BADGE_BG,
  color: ACCENT
}));

/** Verifica recursivamente si el ítem o algún descendiente tiene permiso (por id_menu o por id_modulo). */
function hasPermittedDescendant(item, allowedMenuIds, modulosPermitidos = []) {
  if (item.id_modulo != null && Array.isArray(modulosPermitidos) && modulosPermitidos.includes(Number(item.id_modulo))) return true;
  if (item.id_menu != null && Array.isArray(allowedMenuIds) && allowedMenuIds.includes(Number(item.id_menu))) return true;
  if (item.children && item.children.length) {
    return item.children.some((child) => hasPermittedDescendant(child, allowedMenuIds, modulosPermitidos));
  }
  return false;
}

function normalizeSidebarPath(p) {
  if (!p) return "";
  return p.startsWith("/") ? p : `/${p}`;
}

export default function MatxVerticalNav({ items, searchQuery = "", variant = "sistema" }) {
  const { settings } = useSettings();
  const { mode } = settings.layout1Settings.leftSidebar;
  const { perfil } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openTab, activeKey } = useTabs();

  const handleSidebarLeafClick = (path, name) => {
    const target = normalizeSidebarPath(path);
    if (!target) return;
    const pathname = normalizeTabPath(location.pathname);
    const t = normalizeTabPath(target);
    if (pathname === t) {
      openTab(target, name, {
        replace: true,
        state: { [SIDEBAR_RESET_STATE_KEY]: Date.now() },
      });
    } else {
      openTab(target, name);
    }
  };

  const renderLevels = (data) => {

    const renderMenu = (item, index) => {
      if (item.type === "label") {
        return (
          <ListLabel key={index} mode={mode} className="sidenavHoverShow">
            {item.label}
          </ListLabel>
        );
      }

      if (item.children) {
        return (
          <CompactTooltip key={index} title={item.name} mode={mode}>
            <div>
              <MatxVerticalNavExpansionPanel mode={mode} item={item} forceOpen={!!searchQuery}>
                {renderLevels(item.children)}
              </MatxVerticalNavExpansionPanel>
            </div>
          </CompactTooltip>
        );
      } else if (item.type === "extLink") {
        return (
          <CompactTooltip key={index} title={item.name} mode={mode}>
            <ExternalLink
              href={item.path}
              className={`${mode === "compact" && "compactNavItem"}`}
              rel="noopener noreferrer"
              target="_blank">
              <ButtonBase name="child" sx={{ width: "100%" }}>
                {item.icon ? (
                  <Icon className="icon">{item.icon}</Icon>
                ) : (
                  <BulletIcon className="nav-bullet" />
                )}
                <StyledText mode={mode} className="sidenavHoverShow">
                  {item.name}
                </StyledText>
                <Box mx="auto" />
                {item.badge && <BadgeValue>{item.badge.value}</BadgeValue>}
              </ButtonBase>
            </ExternalLink>
          </CompactTooltip>
        );
      } else if (item.path) {
        const itemPath = normalizeTabPath(normalizeSidebarPath(item.path));
        const isActive = pathsMatch(activeKey, itemPath);
        return (
          <CompactTooltip key={index} title={item.name} mode={mode}>
            <InternalLink>
              <ButtonBase
                name="child"
                sx={{ width: "100%" }}
                className={
                  isActive
                    ? `navItemActive ${mode === "compact" ? "compactNavItem" : ""}`
                    : mode === "compact"
                      ? "compactNavItem"
                      : ""
                }
                onClick={() => handleSidebarLeafClick(item.path, item.name)}
              >
                {item?.icon ? (
                  <Icon className="icon" sx={{ width: ICON_WIDTH }}>
                    {item.icon}
                  </Icon>
                ) : (
                  <BulletIcon className="nav-bullet" />
                )}
                <StyledText mode={mode} className="sidenavHoverShow">
                  {item.name}
                </StyledText>
                <Box mx="auto" />
                {variant === "favoritos" ? (
                  <FavoriteIcon
                    className="sidenavHoverShow"
                    sx={{ fontSize: 18, color: "rgba(255,255,255,0.92)", mr: 0.75, flexShrink: 0 }}
                  />
                ) : (
                  <MenuFavoriteHeart item={item} mode={mode} />
                )}
                {item.badge && (
                  <BadgeValue className="sidenavHoverShow">{item.badge.value}</BadgeValue>
                )}
              </ButtonBase>
            </InternalLink>
          </CompactTooltip>
        );
      }
      return null;
    }

    if (perfil) {
      const menuObjetosStr = perfil.menu_objetos || '';
      const listMenus = menuObjetosStr.split('-').filter(Boolean);
      const fromMenuObjetos = listMenus
        .map((element) => {
          const idx = element.indexOf('_');
          if (idx <= 1) return NaN;
          return parseInt(element.slice(1, idx), 10);
        })
        .filter((n) => !Number.isNaN(n));
      const fromMenusPermitidos = Array.isArray(perfil.menus_permitidos)
        ? perfil.menus_permitidos.map(Number).filter((n) => !Number.isNaN(n))
        : [];
      const arrasys = [...new Set([...fromMenuObjetos, ...fromMenusPermitidos])];
      const modulosPermitidos = Array.isArray(perfil.modulos_permitidos) ? perfil.modulos_permitidos.map(Number) : [];
      return data.map((item, index) => {
        if (perfil.id_usuario === "1") {
          return renderMenu(item, index);
        }
        if (hasPermittedDescendant(item, arrasys, modulosPermitidos)) {
          return renderMenu(item, index);
        }
        return null;
      });
    }
  };

  const displayItems = filterNavItems(items, searchQuery);
  return <div className="navigation">{renderLevels(displayItems)}</div>;
}
