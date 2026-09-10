import React, { useRef, useState, useEffect } from "react";
import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button, Avatar, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon         from "@mui/icons-material/Close";
import SaveIcon          from "@mui/icons-material/Save";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FormatQuoteIcon   from "@mui/icons-material/FormatQuote";
import ChatIcon          from "@mui/icons-material/Chat";
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

const ToggleWrap = styled(ToggleButtonGroup)(() => ({
  width: "100%",
  marginBottom: 12,
  "& .MuiToggleButton-root": {
    flex: 1,
    color: "#94a3b8",
    borderColor: "rgba(255,255,255,0.15)",
    fontSize: "0.68rem",
    fontWeight: 600,
    textTransform: "none",
    py: 0.8,
    "&.Mui-selected": {
      bgcolor: "rgba(249,115,22,0.2) !important",
      color: "#f97316",
      borderColor: "rgba(249,115,22,0.5)",
    },
  },
}));

// ── Avatar upload (modo texto) ────────────────────────────────────────────────
const AvatarUpload = ({ currentUrl, absoluteUrl, preview, onFile, onRemove, open }) => {
  const ref = useRef(null);
  const candidates = preview
    ? [preview]
    : cmsPublicImageUrlCandidates(currentUrl, absoluteUrl);
  const [idx, setIdx] = useState(0);
  const displaySrc = candidates[idx] ?? null;

  useEffect(() => {
    setIdx(0);
  }, [preview, currentUrl, absoluteUrl]);

  useEffect(() => {
    if (!open) {
      onRemove();
      if (ref.current) ref.current.value = "";
    }
  }, [open]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onFile(f);
  };

  const handleImgError = () => {
    setIdx((i) => (i < candidates.length - 1 ? i + 1 : i));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 2 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <Box sx={{ position: "relative", cursor: "pointer" }}
        onClick={() => ref.current?.click()}>
        <Avatar
          src={displaySrc}
          imgProps={{ onError: handleImgError }}
          sx={{ width: 72, height: 72, border: "2px solid rgba(249,115,22,0.6)" }}
        >
          {!displaySrc && <PersonOutlineIcon sx={{ fontSize: 34, opacity: 0.4 }} />}
        </Avatar>
        <Box sx={{
          position: "absolute", inset: 0, borderRadius: "50%",
          bgcolor: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", opacity: 0,
          transition: "opacity 0.2s", "&:hover": { opacity: 1 },
        }}>
          <PhotoCameraIcon sx={{ color: "#fff", fontSize: 20 }} />
          <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.55rem" }}>Cambiar</Typography>
        </Box>
      </Box>
      {preview && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem" }}>Nueva foto lista</Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Captura WhatsApp / evidencia ─────────────────────────────────────────────
const CapturaUpload = ({ currentUrl, absoluteUrl, preview, onFile, onRemove, open }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) {
      onRemove();
      if (ref.current) ref.current.value = "";
    }
  }, [open]);

  return (
    <Box sx={{ mb: 2 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box
        onClick={() => ref.current?.click()}
        sx={{
          border: "2px dashed rgba(249,115,22,0.45)",
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.04)",
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          "&:hover": { borderColor: "#f97316", bgcolor: "rgba(249,115,22,0.06)" },
        }}
      >
        {(preview || currentUrl) ? (
          <CmsStorageImage
            storagePath={currentUrl}
            absoluteUrl={absoluteUrl}
            previewSrc={preview}
            alt="Captura"
            sx={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }}
          />
        ) : (
          <Stack alignItems="center" spacing={0.5} sx={{ py: 3, px: 2 }}>
            <PhotoCameraIcon sx={{ color: "#f97316", fontSize: 36 }} />
            <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center" }}>
              Subir captura de WhatsApp u otra imagen de evidencia
            </Typography>
          </Stack>
        )}
        {(preview || currentUrl) && (
          <Box sx={{
            position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", opacity: 0,
            transition: "opacity 0.2s", "&:hover": { opacity: 1 },
          }}>
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>Cambiar imagen</Typography>
          </Box>
        )}
      </Box>
      {preview && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem" }}>Nueva captura lista</Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Imagen lateral de la sección (columna derecha del sitio) ─────────────────
const LateralUpload = ({ currentUrl, absoluteUrl, preview, onFile, onRemove, open }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) { onRemove(); if (ref.current) ref.current.value = ""; }
  }, [open]);
  return (
    <Box sx={{ mb: 2 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        border: "2px dashed rgba(249,115,22,0.45)", borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.04)", minHeight: 150, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative",
        "&:hover": { borderColor: "#f97316", bgcolor: "rgba(249,115,22,0.06)" },
      }}>
        {(preview || currentUrl) ? (
          <CmsStorageImage
            storagePath={currentUrl}
            absoluteUrl={absoluteUrl}
            previewSrc={preview}
            alt="Imagen lateral"
            sx={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
          />
        ) : (
          <Stack alignItems="center" spacing={0.5} sx={{ py: 3, px: 2 }}>
            <PhotoCameraIcon sx={{ color: "#f97316", fontSize: 34 }} />
            <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center" }}>
              Imagen grande de la derecha
            </Typography>
          </Stack>
        )}
        {(preview || currentUrl) && (
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", opacity: 0,
            transition: "opacity 0.2s", "&:hover": { opacity: 1 } }}>
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>Cambiar imagen</Typography>
          </Box>
        )}
      </Box>
      {preview && (
        <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem", mt: 0.4, display: "block" }}>
          Nueva imagen lista ✓
        </Typography>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const TestimoniosCmsPanel = ({
  open, panelLeft = 0, section, seccion, item, preview, capturaPreview,
  isNew = false,
  onSeccionChange, onItemChange, onFile, onRemoveFile,
  onCapturaFile, onRemoveCapturaFile,
  lateralPreview, onLateralFile, onRemoveLateralFile,
  onSave, onClose, onDelete,
}) => {
  const isHeader = section === "header";
  const tipo = item?.tipo === "captura" ? "captura" : "texto";

  const metaLabel = isHeader
    ? "Encabezado de sección"
    : (isNew ? "Nuevo testimonio" : (item?.nombre || "Testimonio"));
  const metaDesc = isHeader
    ? "Badge y título principal"
    : (tipo === "captura"
      ? "Solo imagen de evidencia (WhatsApp, etc.)"
      : "Foto, nombre, calificación y texto");

  const darkField = (label, key, value, onChange, multiline = false, rows = 2, type = "text") => (
    <DarkField
      key={key} size="small" fullWidth type={type} label={label}
      value={value ?? ""} multiline={multiline}
      rows={multiline ? rows : undefined}
      onChange={(e) => onChange(key, e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>

      <Box sx={{
        px: 2, py: 1.5, display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 1,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3, fontSize: "0.82rem" }}>
            {metaLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {metaDesc}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        {isHeader && (
          <>
            <SectionTag>Encabezado</SectionTag>
            {darkField("Badge / Etiqueta", "badge_seccion", seccion?.badge_seccion, onSeccionChange)}
            {darkField("Título principal", "seccion_titulo", seccion?.seccion_titulo, onSeccionChange, true, 3)}
            {darkField("Descripción (párrafo introductorio)", "seccion_descripcion", seccion?.seccion_descripcion, onSeccionChange, true, 8)}

            <Sep />
            <SectionTag>Imagen lateral (columna derecha)</SectionTag>
            <LateralUpload
              currentUrl={seccion?.url_imagen_lateral}
              absoluteUrl={seccion?.url_imagen_lateral_publica}
              preview={lateralPreview}
              onFile={onLateralFile}
              onRemove={onRemoveLateralFile}
              open={open}
            />
          </>
        )}

        {!isHeader && item && (
          <>
            <SectionTag>Tipo de testimonio</SectionTag>
            <ToggleWrap
              exclusive
              size="small"
              value={tipo}
              onChange={(_, v) => { if (v) onItemChange("tipo", v); }}
            >
              <ToggleButton value="texto">
                <FormatQuoteIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Descripción
              </ToggleButton>
              <ToggleButton value="captura">
                <ChatIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Captura WhatsApp
              </ToggleButton>
            </ToggleWrap>

            {tipo === "captura" ? (
              <>
                <SectionTag>Imagen de evidencia</SectionTag>
                <CapturaUpload
                  currentUrl={item.url_captura}
                  absoluteUrl={item.url_captura_publica}
                  preview={capturaPreview}
                  onFile={onCapturaFile}
                  onRemove={onRemoveCapturaFile}
                  open={open}
                />
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1.5, lineHeight: 1.4 }}>
                  No es necesario completar nombre ni texto. La imagen se mostrará tal cual en la landing.
                </Typography>
                {darkField("Etiqueta opcional (alt)", "nombre", item.nombre, onItemChange)}
                <Sep />
                <SectionTag>Enlace al hacer doble clic</SectionTag>
                {darkField("URL de redirección (opcional)", "url_link", item.url_link, onItemChange)}
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1, lineHeight: 1.4 }}>
                  Si escribes una URL, al hacer doble clic en la imagen se abrirá en una nueva pestaña. Déjalo vacío para que no tenga enlace.
                </Typography>
              </>
            ) : (
              <>
                <SectionTag>Foto de perfil</SectionTag>
                <AvatarUpload
                  currentUrl={item.url_avatar}
                  absoluteUrl={item.url_avatar_publica}
                  preview={preview}
                  onFile={onFile}
                  onRemove={onRemoveFile}
                  open={open}
                />
                <Sep />
                <SectionTag>Datos del testimonio</SectionTag>
                {darkField("Nombre del cliente", "nombre", item.nombre, onItemChange)}
                {darkField("Subtítulo (ej. Cliente de royalsensorymassage)", "subtitulo", item.subtitulo, onItemChange)}
                {darkField("Calificación (0–5)", "calificacion", item.calificacion, onItemChange, false, 1, "number")}
                <Sep />
                <SectionTag>Texto</SectionTag>
                {darkField("Testimonio", "testimonio", item.testimonio, onItemChange, true, 5)}
              </>
            )}
          </>
        )}

      </Box>

      <Box sx={{
        px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
      }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}
              sx={{ bgcolor: "#f97316", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}>
              {isNew ? "Crear testimonio" : "Guardar cambios"}
            </Button>
            <Button variant="outlined" onClick={onClose}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          {!isHeader && !isNew && onDelete && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={onDelete}
              sx={{
                borderColor: "rgba(239,68,68,0.5)",
                color: "#ef4444",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(239,68,68,0.08)", borderColor: "#ef4444" },
              }}
            >
              Eliminar testimonio
            </Button>
          )}
        </Stack>
      </Box>

    </CmsPanelRoot>
  );
};

export default TestimoniosCmsPanel;
