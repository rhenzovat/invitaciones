import React from "react";
import { Box } from "@mui/material";
import Icon from "@mui/material/Icon";
import FolderIcon from "@mui/icons-material/Folder";
import LinkIcon from "@mui/icons-material/Link";

/** Nombres de Material Icons (snake_case), p. ej. contact_support */
const MATERIAL_ICON_RE = /^[a-z0-9_]+$/;

export function isMaterialIconName(value) {
  const v = (value || "").trim();
  return v.length > 0 && MATERIAL_ICON_RE.test(v);
}

/**
 * Muestra el ícono del sidebar igual que MatxVerticalNav (ligature Material o emoji).
 */
export default function MenuSidebarIcon({ icon, esModulo = false, sx = {} }) {
  const raw = (icon ?? "").trim();
  const fallbackColor = esModulo ? "#60a5fa" : "#94a3b8";
  const baseSx = { fontSize: 22, color: fallbackColor, flexShrink: 0, ...sx };

  if (!raw) {
    const Fallback = esModulo ? FolderIcon : LinkIcon;
    return <Fallback sx={baseSx} />;
  }

  if (isMaterialIconName(raw)) {
    return (
      <Icon
        className="icon"
        sx={{
          ...baseSx,
          width: 22,
          height: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {raw}
      </Icon>
    );
  }

  return (
    <Box
      component="span"
      sx={{
        ...baseSx,
        width: 22,
        minWidth: 22,
        fontSize: raw.length <= 2 ? 18 : 15,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {raw}
    </Box>
  );
}
