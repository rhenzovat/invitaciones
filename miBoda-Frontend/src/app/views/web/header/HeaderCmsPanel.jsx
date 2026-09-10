import React, { useRef } from "react";
import {
  Box, Typography, IconButton, Divider, Stack, TextField, Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon      from "@mui/icons-material/Close";
import SaveIcon       from "@mui/icons-material/Save";
import AddIcon        from "@mui/icons-material/Add";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { authJWTConfig } from "app/authJWTConfig";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";

const DomainBackend = `${(authJWTConfig.domain || "").replace(/\/$/, "")}/`;

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

const LogoUploadArea = styled(Box)(({ hasImg }) => ({
  width: "100%",
  height: 90,
  borderRadius: 10,
  border: `2px dashed ${hasImg ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.18)"}`,
  backgroundColor: "rgba(255,255,255,0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  transition: "border-color 0.25s",
  "&:hover": { borderColor: "#f97316" },
  "&:hover .cam-overlay": { opacity: 1 },
}));

const CamOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.25s",
  zIndex: 2,
});

const HeaderCmsPanel = ({ open, panelLeft = 0, datos, onChange, onSave, onClose }) => {
  const navItems  = Array.isArray(datos?.nav_items) ? datos.nav_items : [];
  const fileRef = useRef(null);

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange("_logoFile", file);
    const reader = new FileReader();
    reader.onload = (ev) => onChange("_logoPreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();
    onChange("_logoPreview", null);
    onChange("_logoFile", null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const currentLogoUrl = datos?.url_logo
    ? `${DomainBackend}${datos.url_logo}`
    : null;

  const displayLogo = datos?._logoPreview || currentLogoUrl;

  const addNavItem = () =>
    onChange("nav_items", [...navItems, { label: "", href: "#" }]);

  const updateNavItem = (i, key, val) =>
    onChange("nav_items", navItems.map((item, idx) =>
      idx === i ? { ...item, [key]: val } : item
    ));

  const removeNavItem = (i) =>
    onChange("nav_items", navItems.filter((_, idx) => idx !== i));

  const F = (label, key) => (
    <DarkField
      key={key} size="small" fullWidth label={label}
      value={datos?.[key] ?? ""}
      onChange={(e) => onChange(key, e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      {/* Cabecera */}
      <Box sx={{
        px: 2, py: 1.5,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            Header / Barra de navegación
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            Logo, nav links, teléfono y botón CTA
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Campos */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        {/* ── LOGO ── */}
        <SectionTag>Logo del sitio</SectionTag>
        <input
          type="file"
          ref={fileRef}
          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
          style={{ display: "none" }}
          onChange={handleLogoFile}
        />
        <LogoUploadArea hasImg={!!displayLogo} onClick={() => fileRef.current?.click()}>
          {displayLogo ? (
            <>
              <Box
                component="img"
                src={displayLogo}
                alt="Logo"
                onError={(e) => { e.target.style.display = "none"; }}
                sx={{ maxHeight: 70, maxWidth: "90%", objectFit: "contain" }}
              />
              <CamOverlay className="cam-overlay">
                <PhotoCameraIcon sx={{ color: "#fff", fontSize: 22 }} />
                <Typography variant="caption" sx={{ color: "#fff", mt: 0.4, fontSize: "0.60rem" }}>
                  Cambiar imagen
                </Typography>
              </CamOverlay>
            </>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, color: "#94a3b8" }}>
              <ImageOutlinedIcon sx={{ fontSize: 34, opacity: 0.5 }} />
              <Typography variant="caption" sx={{ fontSize: "0.62rem" }}>
                Clic para subir logo
              </Typography>
            </Box>
          )}
        </LogoUploadArea>

        {datos?._logoPreview && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.8, gap: 0.5 }}>
            <IconButton size="small" sx={{ color: "#ef4444" }} onClick={handleRemoveLogo}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.62rem" }}>
              Nueva imagen lista para guardar
            </Typography>
          </Box>
        )}

        <Sep />

        {/* ── MENÚ ── */}
        <SectionTag>Menú de navegación</SectionTag>
        <Stack spacing={0.8} sx={{ mb: 1 }}>
          {navItems.map((item, i) => (
            <Box key={i} sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <DragHandleIcon sx={{ color: "#475569", fontSize: 16, flexShrink: 0 }} />
              <DarkField
                size="small" value={item.label} placeholder="Etiqueta"
                onChange={(e) => updateNavItem(i, "label", e.target.value)}
                sx={{ mb: 0, flex: 1 }}
              />
              <DarkField
                size="small" value={item.href} placeholder="#seccion"
                onChange={(e) => updateNavItem(i, "href", e.target.value)}
                sx={{ mb: 0, flex: 1 }}
              />
              <IconButton size="small" onClick={() => removeNavItem(i)}
                sx={{ color: "#ef4444", flexShrink: 0 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
        <Button size="small" startIcon={<AddIcon />} onClick={addNavItem}
          sx={{ color: "#f97316", textTransform: "none", fontSize: "0.72rem", mb: 1 }}>
          Agregar enlace
        </Button>

        <Sep />

        {/* ── TELÉFONO ── */}
        <SectionTag>Teléfono</SectionTag>
        {F("Etiqueta", "telefono_label")}
        {F("Número a mostrar", "telefono_numero")}
        {F("href del enlace (tel:...)", "telefono_href")}

        <Sep />

        {/* ── BOTÓN CTA ── */}
        <SectionTag>Botón CTA</SectionTag>
        {F("Texto del botón", "btn_texto")}
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.62rem", lineHeight: 1.4 }}>
          La URL usa el WhatsApp configurado en el Footer.
        </Typography>
      </Box>

      {/* Botones fijos al fondo */}
      <Box sx={{
        px: 2, py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.08)",
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

export default HeaderCmsPanel;
