import React from "react";
import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button, Tooltip, Switch, FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon   from "@mui/icons-material/Close";
import SaveIcon    from "@mui/icons-material/Save";
import DeleteIcon  from "@mui/icons-material/Delete";
import AddIcon     from "@mui/icons-material/Add";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#f1f5f9",
    borderRadius: 6,
  },
  "& .MuiInputBase-input":        { color: "#f1f5f9" },
  "& .MuiInputLabel-root":        { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize:      "0.60rem",
  fontWeight:    700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color:         "#f97316",
  marginBottom:  5,
  marginTop:     2,
}));

const Sep = () => (
  <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />
);

// ─────────────────────────────────────────────────────────────────────────────

const PlanesCmsPanel = ({
  open,
  panelLeft = 0,
  isNew,
  datos,
  onChange,
  onSave,
  onClose,
  onDelete,
}) => {
  const caracteristicas = Array.isArray(datos?.caracteristicas)
    ? datos.caracteristicas
    : [];

  const addCaracteristica = () => {
    onChange("caracteristicas", [...caracteristicas, ""]);
  };

  const updateCaracteristica = (i, val) => {
    const arr = [...caracteristicas];
    arr[i] = val;
    onChange("caracteristicas", arr);
  };

  const removeCaracteristica = (i) => {
    onChange("caracteristicas", caracteristicas.filter((_, idx) => idx !== i));
  };

  const F = (label, key, multiline = false, rows = 2, ph = "", type = "text") => (
    <DarkField
      key={key}
      size="small"
      fullWidth
      type={type}
      label={label}
      value={datos?.[key] ?? ""}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      placeholder={ph}
      onChange={(e) => onChange(key, e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>

      {/* ── Cabecera ─────────────────────────────────────────────────── */}
      <Box sx={{
        px: 2, py: 1.5,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", top: 0, zIndex: 1,
        gap: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {isNew ? "Nuevo Plan" : "Editar Plan"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {isNew ? "Completa los campos y guarda" : datos?.nombre || ""}
          </Typography>
        </Box>
        <Tooltip title="Cerrar">
          <IconButton size="small" onClick={onClose}
            sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Campos ───────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        <SectionTag>Identificación</SectionTag>
        {F("Ícono (emoji)", "icono", false, 1, "💡")}
        {F("Nombre del plan", "nombre", false, 1, "Plan Básico")}
        {F("Descripción breve", "descripcion", true, 3, "Ideal para emprendedores...")}

        <Sep />
        <SectionTag>Precio</SectionTag>
        {F("Precio mensual (S/.)", "precio", false, 1, "120", "number")}
        {F("Nota de precio", "precio_nota", false, 1, "Sin permanencia mínima")}

        <Sep />
        <SectionTag>Enlace de contratación</SectionTag>
        {F("URL WhatsApp / Cotizar", "url_whatsapp", false, 1, "https://wa.me/...")}

        <Sep />
        <SectionTag>Opciones</SectionTag>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Switch
            size="small"
            checked={!!datos?.es_destacado}
            onChange={(e) => onChange("es_destacado", e.target.checked)}
            sx={{ "& .MuiSwitch-thumb": { bgcolor: datos?.es_destacado ? "#f97316" : "#94a3b8" } }}
          />
          <Typography variant="caption" sx={{ color: "#f1f5f9" }}>
            Plan destacado (resaltado visualmente)
          </Typography>
        </Box>
        <DarkField
          size="small"
          fullWidth
          type="number"
          label="Orden de visualización"
          value={datos?.orden ?? ""}
          onChange={(e) => onChange("orden", e.target.value)}
          sx={{ mb: 1.5 }}
        />

        <Sep />
        <SectionTag>Características incluidas</SectionTag>
        <Stack spacing={0.8} sx={{ mb: 1 }}>
          {caracteristicas.map((item, i) => (
            <Box key={i} sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <DragHandleIcon sx={{ color: "#475569", fontSize: 16, flexShrink: 0 }} />
              <DarkField
                size="small"
                fullWidth
                value={item}
                placeholder={`Característica ${i + 1}`}
                onChange={(e) => updateCaracteristica(i, e.target.value)}
                sx={{ mb: 0 }}
              />
              <IconButton size="small" onClick={() => removeCaracteristica(i)}
                sx={{ color: "#ef4444", flexShrink: 0 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addCaracteristica}
          sx={{ color: "#f97316", textTransform: "none", fontSize: "0.72rem" }}
        >
          Agregar característica
        </Button>

      </Box>

      {/* ── Botones fijos al fondo ───────────────────────────────────── */}
      <Box sx={{
        px: 2, py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", bottom: 0,
      }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              sx={{ bgcolor: "#f97316", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}
            >
              {isNew ? "Crear plan" : "Guardar cambios"}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          {!isNew && (
            <Button
              fullWidth variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={onDelete}
              sx={{ borderColor: "rgba(239,68,68,0.5)", color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
            >
              Eliminar plan
            </Button>
          )}
        </Stack>
      </Box>

    </CmsPanelRoot>
  );
};

export default PlanesCmsPanel;
