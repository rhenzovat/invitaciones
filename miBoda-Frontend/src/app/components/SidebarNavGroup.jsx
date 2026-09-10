import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { styled, keyframes } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/* ── Animación suave del chevron ── */
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(180deg); }
`;

/* ── Header clickeable del grupo ── */
const GroupHeader = styled(Box, {
  shouldForwardProp: (p) => p !== "variant" && p !== "open",
})(({ variant, open }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  padding: "5px 6px 5px 4px",
  borderRadius: 6,
  marginBottom: open ? 4 : 2,
  marginTop: variant === "sistema" ? 10 : 4,
  userSelect: "none",
  transition: "background 180ms ease",
  "&:hover": {
    background: "rgba(255,255,255,0.05)",
  },
}));

const GroupTitle = styled(Typography, {
  shouldForwardProp: (p) => p !== "variant",
})(({ variant }) => ({
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color:
    variant === "favoritos"
      ? "rgba(251, 113, 133, 0.9)"
      : "rgba(74, 222, 128, 0.85)",
}));

const ChevronBtn = styled(IconButton, {
  shouldForwardProp: (p) => p !== "open",
})(({ open }) => ({
  padding: 2,
  color: "rgba(255,255,255,0.45)",
  transition: "color 180ms ease",
  "& svg": {
    fontSize: 16,
    transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
  },
  "&:hover": { color: "rgba(255,255,255,0.85)", background: "transparent" },
}));

/* Línea decorativa bajo el título */
const TitleAccent = styled(Box, {
  shouldForwardProp: (p) => p !== "variant",
})(({ variant }) => ({
  height: 2,
  width: 22,
  borderRadius: 2,
  marginLeft: 2,
  background:
    variant === "favoritos"
      ? "rgba(251, 113, 133, 0.6)"
      : "rgba(74, 222, 128, 0.55)",
}));

const GroupPanel = styled(Box, {
  shouldForwardProp: (p) => p !== "variant",
})(({ variant }) => ({
  background: "rgba(15, 23, 42, 0.92)",
  border: "1px solid",
  borderColor:
    variant === "favoritos"
      ? "rgba(251, 113, 133, 0.22)"
      : "rgba(74, 222, 128, 0.18)",
  borderRadius: 8,
  padding: "4px 2px 6px",
  marginBottom: 4,
  "& .navigation": { padding: 0 },
  "& .MuiButtonBase-root": { marginBottom: 2 },
}));

const EmptyHint = styled(Typography)({
  fontSize: "0.75rem",
  color: "rgba(255, 255, 255, 0.4)",
  padding: "10px 12px 12px",
  fontStyle: "italic",
});

/**
 * Bloque acordeón del sidebar — se abre/cierra independientemente.
 * @prop {boolean} defaultOpen  — si arranca abierto (default: false)
 */
export default function SidebarNavGroup({
  title,
  variant = "sistema",
  emptyHint,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box component="section" aria-label={title}>
      {/* ── Header ── */}
      <GroupHeader variant={variant} open={open} onClick={() => setOpen((v) => !v)}>
        <Box>
          <GroupTitle variant={variant}>{title}</GroupTitle>
          <TitleAccent variant={variant} />
        </Box>
        <ChevronBtn open={open} size="small" tabIndex={-1} disableRipple>
          <ExpandMoreIcon />
        </ChevronBtn>
      </GroupHeader>

      {/* ── Panel colapsable ── */}
      <Collapse in={open} timeout={260} unmountOnExit={false}>
        <GroupPanel variant={variant}>
          {emptyHint ? <EmptyHint>{emptyHint}</EmptyHint> : null}
          {children}
        </GroupPanel>
      </Collapse>
    </Box>
  );
}
