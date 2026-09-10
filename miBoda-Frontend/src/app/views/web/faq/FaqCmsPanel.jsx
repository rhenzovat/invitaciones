import React from "react";
import {
  Box, Typography, IconButton, Divider, Stack, TextField, Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon  from "@mui/icons-material/Save";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root":               { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input":              { color: "#f1f5f9" },
  "& .MuiInputLabel-root":              { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused":  { color: "#f97316" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#f97316", marginBottom: 6, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

/* ── Metadatos por sección ─────────────────────────────────────── */
const SECTION_META = {
  encabezado: { label: "Encabezado y teléfonos", desc: "Badge, título y datos de contacto" },
  item:        { label: "Pregunta",              desc: "Pregunta y respuesta" },
};

/* ── Panel ─────────────────────────────────────────────────────── */
const FaqCmsPanel = ({
  open, panelLeft = 0, section = "encabezado",
  seccion, activeItem,
  onChangeSeccion, onChangeItem,
  onSave, onClose,
}) => {
  const meta = SECTION_META[section] || SECTION_META.encabezado;

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>

      {/* Cabecera dinámica */}
      <Box sx={{
        px: 2, py: 1.5, display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 1,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {meta.label}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {meta.desc}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Campos — solo la sección activa */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        {/* ── ENCABEZADO + TELÉFONOS ── */}
        {section === "encabezado" && (
          <>
            <SectionTag>Encabezado</SectionTag>
            <DarkField size="small" fullWidth label="Badge / Etiqueta"
              value={seccion?.badge_seccion ?? ""}
              onChange={(e) => onChangeSeccion("badge_seccion", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <DarkField size="small" fullWidth label="Título principal" multiline rows={3}
              value={seccion?.seccion_titulo ?? ""}
              onChange={(e) => onChangeSeccion("seccion_titulo", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <Sep />
            <SectionTag>Teléfonos de contacto</SectionTag>
            <DarkField size="small" fullWidth label="Etiqueta teléfono 1"
              value={seccion?.telefono_principal_label ?? ""}
              onChange={(e) => onChangeSeccion("telefono_principal_label", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <DarkField size="small" fullWidth label="Número teléfono 1"
              value={seccion?.telefono_principal ?? ""}
              onChange={(e) => onChangeSeccion("telefono_principal", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <DarkField size="small" fullWidth label="Etiqueta teléfono 2"
              value={seccion?.telefono_callcenter_label ?? ""}
              onChange={(e) => onChangeSeccion("telefono_callcenter_label", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <DarkField size="small" fullWidth label="Número teléfono 2"
              value={seccion?.telefono_callcenter ?? ""}
              onChange={(e) => onChangeSeccion("telefono_callcenter", e.target.value)}
              sx={{ mb: 1.5 }}
            />
          </>
        )}

        {/* ── PREGUNTA INDIVIDUAL ── */}
        {section === "item" && activeItem && (
          <>
            <SectionTag>Pregunta {activeItem.orden}</SectionTag>
            <DarkField size="small" fullWidth label="Pregunta"
              value={activeItem.pregunta ?? ""}
              onChange={(e) => onChangeItem("pregunta", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <DarkField size="small" fullWidth label="Respuesta" multiline rows={5}
              value={activeItem.respuesta ?? ""}
              onChange={(e) => onChangeItem("respuesta", e.target.value)}
            />
          </>
        )}

      </Box>

      {/* Footer fijo */}
      <Box sx={{
        px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
      }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}
            sx={{ bgcolor: "#f97316", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}>
            Guardar cambios
          </Button>
          <Button variant="outlined" onClick={onClose}
            sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>

    </CmsPanelRoot>
  );
};

export default FaqCmsPanel;
