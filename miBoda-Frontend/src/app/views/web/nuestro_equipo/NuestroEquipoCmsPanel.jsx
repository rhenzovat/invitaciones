import React, { useRef, useEffect } from "react";
import {
  Box, Typography, IconButton, Divider, Stack, TextField, Button, Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon         from "@mui/icons-material/Close";
import SaveIcon          from "@mui/icons-material/Save";
import DeleteIcon        from "@mui/icons-material/Delete";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import { cmsPublicImageUrlCandidates } from "app/utils/utils";

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

// ─── Área de upload circular ─────────────────────────────────────────────────
const UploadCircle = styled(Box)(({ hasimg }) => ({
  width:           110,
  height:          110,
  borderRadius:    "50%",
  border:          `2px dashed ${hasimg === "true" ? "rgba(249,115,22,0.7)" : "rgba(255,255,255,0.22)"}`,
  backgroundColor: "rgba(255,255,255,0.05)",
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "center",
  cursor:          "pointer",
  position:        "relative",
  overflow:        "hidden",
  margin:          "0 auto",
  transition:      "border-color 0.25s",
  "&:hover":       { borderColor: "#f97316" },
  "&:hover .cam-overlay": { opacity: 1 },
}));

const CamOverlay = styled(Box)({
  position:        "absolute",
  inset:           0,
  backgroundColor: "rgba(0,0,0,0.55)",
  display:         "flex",
  flexDirection:   "column",
  alignItems:      "center",
  justifyContent:  "center",
  opacity:         0,
  transition:      "opacity 0.25s",
  zIndex:          2,
});

// ─────────────────────────────────────────────────────────────────────────────

const NuestroEquipoCmsPanel = ({
  open, panelLeft = 0, mode, datos, onChange,
  onSave, onClose, onDelete, isNew,
  previewUrl, onFileSelect, onRemoveFile,
}) => {
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open && fileRef.current) fileRef.current.value = "";
  }, [open]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
  };

  const hasImage = Boolean(
    previewUrl
    || datos?.url_imagen
    || datos?.url_imagen_publica
    || cmsPublicImageUrlCandidates(datos?.url_imagen, datos?.url_imagen_publica).length > 0
  );

  const F = (label, key, multiline = false, rows = 2) => (
    <DarkField
      key={key} size="small" fullWidth label={label}
      value={datos?.[key] ?? ""} multiline={multiline}
      rows={multiline ? rows : undefined}
      onChange={(e) => onChange(key, e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>

      {/* Cabecera */}
      <Box sx={{
        px: 2, py: 1.5, display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 1,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {mode === "seccion"
              ? "Encabezado de sección"
              : isNew ? "Nuevo miembro" : "Editar miembro"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {mode === "seccion" ? "Badge y título del bloque" : datos?.titulo || "Completa los campos"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Campos */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        {mode === "seccion" ? (
          <>
            <SectionTag>Encabezado de sección</SectionTag>
            {F("Badge / Etiqueta", "badge_texto")}
            {F("Título de sección", "titulo_seccion", true, 3)}
          </>
        ) : (
          <>
            {/* ── Foto circular ── */}
            <SectionTag>Foto del miembro</SectionTag>
            <input
              type="file"
              ref={fileRef}
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <UploadCircle hasimg={hasImage ? "true" : "false"} onClick={() => fileRef.current?.click()}>
              {hasImage ? (
                <>
                  <CmsStorageImage
                    storagePath={datos?.url_imagen}
                    absoluteUrl={datos?.url_imagen_publica}
                    previewSrc={previewUrl}
                    alt="foto"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <CamOverlay className="cam-overlay">
                    <PhotoCameraIcon sx={{ color: "#fff", fontSize: 22 }} />
                    <Typography variant="caption" sx={{ color: "#fff", mt: 0.3, fontSize: "0.58rem" }}>
                      Cambiar
                    </Typography>
                  </CamOverlay>
                </>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                  <ImageOutlinedIcon sx={{ fontSize: 32, opacity: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.60rem", textAlign: "center" }}>
                    Clic para subir foto
                  </Typography>
                </Box>
              )}
            </UploadCircle>

            {previewUrl && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 0.8, gap: 0.5 }}>
                <Tooltip title="Quitar imagen nueva">
                  <IconButton size="small" sx={{ color: "#ef4444" }} onClick={onRemoveFile}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.62rem" }}>
                  Nueva foto lista para guardar
                </Typography>
              </Box>
            )}

            <Sep />
            <SectionTag>Información</SectionTag>
            {F("Cargo / Rol", "cargo")}
            {F("Nombre / Título", "titulo")}
            {F("Descripción", "descripcion", true, 4)}

            <Sep />
            <SectionTag>Redes sociales</SectionTag>
            {F("URL Facebook", "url_facebook")}
            {F("URL WhatsApp", "url_whatsapp")}

            <Sep />
            <SectionTag>Opciones</SectionTag>
            <DarkField
              size="small" fullWidth type="number" label="Orden de visualización"
              value={datos?.orden ?? ""}
              onChange={(e) => onChange("orden", e.target.value)}
              sx={{ mb: 1.5 }}
            />
          </>
        )}
      </Box>

      {/* Botones fijos al fondo */}
      <Box sx={{
        px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
      }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}
              sx={{ bgcolor: "#f97316", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}>
              {isNew ? "Crear miembro" : "Guardar"}
            </Button>
            <Button variant="outlined" onClick={onClose}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          {!isNew && mode === "miembro" && (
            <Button fullWidth variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}
              sx={{ borderColor: "rgba(239,68,68,0.5)", color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
              Eliminar miembro
            </Button>
          )}
        </Stack>
      </Box>

    </CmsPanelRoot>
  );
};

export default NuestroEquipoCmsPanel;
