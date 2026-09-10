import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import styled from "@mui/material/styles/styled";
import ButtonBase from "@mui/material/ButtonBase";
import ChevronRight from "@mui/icons-material/ChevronRight";

import {
  ACCENT, ACCENT_HOVER_BG, ACCENT_OPEN_BG, ACCENT_HIGHLIGHT_BG,
  BADGE_BG, BADGE_PADDING, BADGE_BORDER_RADIUS, BADGE_FONT_SIZE, BADGE_FONT_WEIGHT,
  TEXT_PRIMARY, TEXT_ICON, TEXT_MUTED, BULLET_BG,
  ITEM_HEIGHT, ITEM_MARGIN_BOTTOM, ITEM_BORDER_RADIUS, ITEM_PADDING_RIGHT,
  ICON_WIDTH, ICON_SIZE, ICON_PADDING_LEFT, ICON_PADDING_RIGHT,
  BULLET_SIZE_PANEL, BULLET_MARGIN_LEFT_PANEL, BULLET_MARGIN_RIGHT,
  TEXT_FONT_SIZE, TEXT_PADDING_LEFT, TEXT_FONT_WEIGHT,
  PANEL_PADDING_LEFT, PANEL_MARGIN_LEFT, PANEL_MARGIN_TOP, PANEL_MARGIN_BOTTOM,
  PANEL_BORDER_WIDTH, PANEL_BRANCH_COLOR,
  COMPACT_WIDTH, TRANSITION_SPEED, TRANSITION_EASING,
  PANEL_TRANSITION, CHEVRON_TRANSITION,
} from "./sidebarTheme";

// STYLED COMPONENTS
const NavExpandRoot = styled("div")(() => ({
  "& .expandIcon": {
    transition: CHEVRON_TRANSITION,
    transform: "rotate(90deg)"
  },
  "& .collapseIcon": {
    transition: CHEVRON_TRANSITION,
    transform: "rotate(0deg)"
  },
  "& .expansion-panel": {
    overflow: "hidden",
    transition: PANEL_TRANSITION,
    paddingLeft: PANEL_PADDING_LEFT,
    marginLeft: PANEL_MARGIN_LEFT,
    marginTop: PANEL_MARGIN_TOP,
    marginBottom: PANEL_MARGIN_BOTTOM,
    borderLeft: `${PANEL_BORDER_WIDTH} solid ${PANEL_BRANCH_COLOR}`,
  },
  "& .highlight": {
    background: ACCENT_HIGHLIGHT_BG
  },
  "&.compactNavItem": {
    width: COMPACT_WIDTH,
    overflow: "hidden",
    justifyContent: "center !important",
    "& .itemText": { display: "none" },
    "& .itemIcon": { display: "none" }
  }
}));

const BaseButton = styled(ButtonBase)(() => ({
  height: ITEM_HEIGHT,
  width: "100%",
  whiteSpace: "pre",
  overflow: "hidden",
  paddingRight: ITEM_PADDING_RIGHT,
  borderRadius: ITEM_BORDER_RADIUS,
  marginBottom: ITEM_MARGIN_BOTTOM,
  display: "flex",
  justifyContent: "space-between !important",
  color: TEXT_PRIMARY,
  transition: `all ${TRANSITION_SPEED} ${TRANSITION_EASING}`,
  "&:hover": {
    background: ACCENT_HOVER_BG,
    "& .icon": { color: ACCENT }
  },
  "&.open": {
    background: ACCENT_OPEN_BG,
    "& .icon": { color: ACCENT }
  },
  "& .icon": {
    width: ICON_WIDTH,
    fontSize: ICON_SIZE,
    paddingLeft: ICON_PADDING_LEFT,
    paddingRight: ICON_PADDING_RIGHT,
    verticalAlign: "middle",
    color: TEXT_ICON,
    transition: `color ${TRANSITION_SPEED} ${TRANSITION_EASING}`
  }
}));

const BulletIcon = styled("div")(() => ({
  width: BULLET_SIZE_PANEL,
  height: BULLET_SIZE_PANEL,
  color: "inherit",
  overflow: "hidden",
  marginLeft: BULLET_MARGIN_LEFT_PANEL,
  marginRight: BULLET_MARGIN_RIGHT,
  borderRadius: "300px !important",
  background: BULLET_BG
}));

const ItemText = styled("span")(({ mode }) => ({
  fontSize: TEXT_FONT_SIZE,
  paddingLeft: TEXT_PADDING_LEFT,
  verticalAlign: "middle",
  color: TEXT_PRIMARY,
  fontWeight: TEXT_FONT_WEIGHT,
  display: mode === "compact" ? "none" : "block"
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

// Obtiene todas las rutas hijas (incluye anidados) para saber si la ruta actual está en este menú
function getDescendantPaths(menuItem) {
  if (!menuItem) return [];
  if (menuItem.path) return [menuItem.path];
  if (menuItem.children) return menuItem.children.flatMap(getDescendantPaths);
  return [];
}

const expansionTooltipSlotProps = {
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
    },
  },
  arrow: { sx: { color: "#0f172a" } },
};

export default function MatxVerticalNavExpansionPanel({ item, children, mode, forceOpen = false }) {
  const elementRef = useRef(null);
  const { pathname } = useLocation();
  const { name, icon, iconText, badge } = item;

  const childPaths = getDescendantPaths({ children: item.children });
  const isChildActive = childPaths.some(
    (path) => pathname === path || pathname.endsWith(path) || pathname === "/admin" + path
  );

  const [collapsed, setCollapsed] = useState(!isChildActive);
  const [panelHeight, setPanelHeight] = useState(0);
  // settled = true cuando la animación de expansión terminó → maxHeight: "none" para que hijos anidados no se recorten
  const [settled, setSettled] = useState(isChildActive);

  const handleClick = () => {
    const el = elementRef.current;
    if (!collapsed) {
      // COLAPSAR: medir altura real actual (incluye hijos expandidos), luego animar a 0
      if (el) setPanelHeight(el.scrollHeight);
      setSettled(false);
      requestAnimationFrame(() => setCollapsed(true));
    } else {
      // EXPANDIR: medir scrollHeight del contenido oculto, animar de 0 a esa altura
      if (el) setPanelHeight(el.scrollHeight);
      setSettled(false);
      setCollapsed(false);
    }
  };

  // Cuando termina la animación de max-height y estamos expandidos → liberar altura
  const handleTransitionEnd = useCallback((e) => {
    if (e.target === elementRef.current && e.propertyName === "max-height" && !collapsed) {
      setSettled(true);
    }
  }, [collapsed]);

  // Auto-expandir si la ruta activa está en este menú
  useEffect(() => {
    if (isChildActive) {
      setCollapsed(false);
      setSettled(true);
    }
  }, [pathname, isChildActive]);

  // Expandir/colapsar cuando la búsqueda activa/inactiva
  useEffect(() => {
    if (forceOpen) {
      setCollapsed(false);
      setSettled(true);
    } else {
      setCollapsed(!isChildActive);
      setSettled(isChildActive);
    }
  }, [forceOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estilo inline: controla la animación y el overflow
  let panelStyle;
  if (collapsed) {
    panelStyle = { maxHeight: "0px", overflow: "hidden" };
  } else if (settled) {
    // Expandido y estable: sin límite de altura, overflow visible para hijos anidados
    panelStyle = { maxHeight: "none", overflow: "visible" };
  } else {
    // Animando: altura explícita con overflow hidden
    panelStyle = { maxHeight: panelHeight + "px", overflow: "hidden" };
  }

  return (
    <NavExpandRoot>
      <Tooltip
        title={mode === "compact" ? name : ""}
        placement="right"
        arrow
        disableHoverListener={mode !== "compact"}
        disableFocusListener
        disableTouchListener
        slotProps={expansionTooltipSlotProps}
      >
        <BaseButton
          className={clsx({
            "has-submenu": true,
            compactNavItem: mode === "compact",
            open: !collapsed
          })}
          onClick={handleClick}>
          <Box display="flex" alignItems="center">
            {icon && <Icon className="icon">{icon}</Icon>}
            {iconText && mode !== "compact" && <BulletIcon />}
            <ItemText mode={mode} className="sidenavHoverShow">{name}</ItemText>
          </Box>

          {badge && mode !== "compact" && <BadgeValue className="sidenavHoverShow itemIcon">{badge.value}</BadgeValue>}

          {mode !== "compact" && (
            <div
              className={clsx({
                sidenavHoverShow: true,
                collapseIcon: collapsed,
                expandIcon: !collapsed
              })}>
              <ChevronRight fontSize="small" sx={{ verticalAlign: "middle", color: TEXT_MUTED }} />
            </div>
          )}
        </BaseButton>
      </Tooltip>

      <div
        ref={elementRef}
        className="expansion-panel submenu"
        onTransitionEnd={handleTransitionEnd}
        style={panelStyle}>
        {children}
      </div>
    </NavExpandRoot>
  );
}
