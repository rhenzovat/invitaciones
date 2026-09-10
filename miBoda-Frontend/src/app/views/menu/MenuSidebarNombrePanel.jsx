import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Tooltip,
  CircularProgress,
  Link,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import { CMS_PANEL_WIDTH } from "app/hooks/useCmsPanelLayout";
import MenuSidebarIcon from "./MenuSidebarIcon";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#f1f5f9",
    borderRadius: 6,
  },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" },
}));

const MATERIAL_ICONS_URL = "https://fonts.google.com/icons";

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.60rem",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#f97316",
  marginBottom: 0,
  marginTop: 2,
}));

/**
 * Panel lateral CMS (mismo modelo que PlanesCmsPanel), compacto: solo identificación.
 */
export default function MenuSidebarNombrePanel({
  open,
  panelLeft = 0,
  item = null,
  nombre = "",
  icono = "",
  onNombreChange,
  onIconoChange,
  onSave,
  onClose,
  saving = false,
}) {
  const esModulo = item?.tipo === "modulo";
  const titulo = esModulo ? "Editar módulo" : "Editar menú";
  const subtitulo = (item?.nombre || "").trim()
    || (esModulo ? `Módulo #${item?.id_modulo}` : `Menú #${item?.id_menu}`);
  const nombreValido = !!(nombre || "").trim();

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft} panelWidth={CMS_PANEL_WIDTH}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)",
          position: "sticky",
          top: 0,
          zIndex: 1,
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {titulo}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}
            noWrap
            title={subtitulo}
          >
            {subtitulo}
          </Typography>
        </Box>
        <Tooltip title="Cerrar">
          <IconButton
            size="small"
            onClick={onClose}
            disabled={saving}
            sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1,
          }}
        >
          <SectionTag>Identificación</SectionTag>
          <Link
            href={MATERIAL_ICONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.35,
              fontSize: "0.62rem",
              color: "#60a5fa",
              flexShrink: 0,
              "&:hover": { color: "#f97316" },
            }}
          >
            Buscar iconos
            <OpenInNewIcon sx={{ fontSize: 12 }} />
          </Link>
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            <MenuSidebarIcon icon={icono} esModulo={esModulo} sx={{ fontSize: 24, width: 24, height: 24 }} />
          </Box>
          <DarkField
            size="small"
            fullWidth
            label="Ícono (emoji o nombre Material)"
            value={icono}
            placeholder={esModulo ? "folder" : "link"}
            helperText="Ej: contact_support, dashboard, 💡"
            FormHelperTextProps={{ sx: { color: "#64748b", fontSize: "0.65rem", mt: 0.5 } }}
            onChange={(e) => onIconoChange(e.target.value)}
          />
        </Box>
        <DarkField
          size="small"
          fullWidth
          autoFocus
          label={esModulo ? "Nombre en el sidebar (este rol)" : "Nombre en el sidebar (este rol)"}
          value={nombre}
          placeholder="Ej. Planes"
          helperText="Solo afecta al rol activo; no cambia el nombre global del menú."
          FormHelperTextProps={{ sx: { color: "#64748b", fontSize: "0.65rem", mt: 0.5 } }}
          onChange={(e) => onNombreChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !saving && nombreValido) onSave?.();
          }}
          sx={{ mb: 1.5 }}
        />
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)",
          position: "sticky",
          bottom: 0,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={onSave}
            disabled={saving || !nombreValido}
            sx={{
              bgcolor: "#f97316",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            Guardar cambios
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            sx={{
              borderColor: "rgba(255,255,255,0.20)",
              color: "#94a3b8",
              minWidth: 44,
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>
    </CmsPanelRoot>
  );
}
