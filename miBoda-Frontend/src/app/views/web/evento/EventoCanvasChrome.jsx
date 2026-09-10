import React from "react";
import { Box, Typography, IconButton, Tooltip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";

export const PageWrap = styled(Box)(() => ({
  padding: "24px",
  minHeight: "100vh",
  background: "#f7f3f0",
}));

export const HeaderBar = styled(Box)(() => ({
  background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
  borderRadius: "16px",
  padding: "16px 24px",
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  boxShadow: "0 6px 28px rgba(44,26,14,0.3)",
}));

export function ModuleHeader({ title, subtitle }) {
  return (
    <HeaderBar>
      <IconButton component={Link} to="/evento/index" size="small" sx={{ color: "#f5c6d8", bgcolor: "rgba(255,255,255,0.08)" }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.3 }}>{subtitle}</Typography>}
      </Box>
    </HeaderBar>
  );
}

/** Contenedor tipo "celular" para que la vista previa se vea como la invitación real. */
export const CanvasPhone = styled(Box)(() => ({
  maxWidth: 460,
  margin: "0 auto",
  background: "var(--color-fondo, #EDE1C7)",
  borderRadius: "22px",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(44,26,14,0.25)",
  border: "8px solid #2c1a0e",
  position: "relative",
}));

/** Zona editable (EZ): contorno naranja + lápiz al pasar el mouse. */
export const EditZone = styled(Box)(() => ({
  position: "relative",
  "&:hover": {
    outline: "2px dashed #f97316",
    outlineOffset: "2px",
    cursor: "pointer",
  },
  "&:hover .ez-pencil": { opacity: 1 },
}));

export function EzPencil({ onClick, tip = "Editar" }) {
  return (
    <Tooltip title={tip} placement="top">
      <IconButton
        className="ez-pencil"
        onClick={onClick}
        size="small"
        sx={{
          position: "absolute", top: 6, right: 6, zIndex: 10,
          opacity: 0, transition: "opacity 0.15s",
          bgcolor: "#f97316", color: "#fff", width: 30, height: 30,
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          "&:hover": { bgcolor: "#ea580c" },
        }}
      >
        <EditIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  );
}

/** Panel lateral de edición (CmsPanelRoot) con header + botón guardar. */
export function EditPanel({ open, title, onClose, onSave, saving, children }) {
  const { panelLeft } = useCmsPanelLayout();
  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{
        px: 2.5, py: 2,
        background: "linear-gradient(135deg,rgba(44,26,14,0.95),rgba(74,42,21,0.95))",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        borderBottom: "1px solid rgba(204,107,142,0.2)",
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#fdf8f5" }}>{title}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#cc6b8e" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ px: 2.5, py: 2, flex: 1, overflowY: "auto" }}>
        {children}
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.08)", position: "sticky", bottom: 0, background: "#0f172a" }}>
        <Button
          fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave} disabled={saving}
          sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", textTransform: "none", fontWeight: 700, borderRadius: "10px", py: 1 }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Box>
    </CmsPanelRoot>
  );
}
