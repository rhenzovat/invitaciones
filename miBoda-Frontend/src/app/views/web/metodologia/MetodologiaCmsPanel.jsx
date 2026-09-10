import React, { useRef, useState, useEffect } from "react";
import {
  Box, Typography, IconButton, Stack, TextField, Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon        from "@mui/icons-material/Close";
import SaveIcon         from "@mui/icons-material/Save";
import PhotoCameraIcon  from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import { cmsPublicImageUrlCandidates } from "../../../utils/utils";

/* ─── Dark text field ─────────────────────────────────────────────────────── */
const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 8 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.58rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#f97316",
  marginBottom: 8,
  marginTop: 4,
}));

/* ─── Image upload area ───────────────────────────────────────────────────── */
const ImgUploadArea = styled(Box)(({ hasimg }) => ({
  width: "100%",
  height: 100,
  borderRadius: 10,
  border: `2px dashed ${hasimg === "true" ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.18)"}`,
  backgroundColor: "rgba(255,255,255,0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  transition: "border-color 0.25s, background-color 0.2s",
  "&:hover": { borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.04)" },
  "&:hover .cam-ov": { opacity: 1 },
}));

const CamOv = styled(Box)({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.60)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.25s",
  zIndex: 2,
});

/* ─── Image upload component ─────────────────────────────────────────────── */
const ImgUpload = ({ label, currentUrl, absoluteUrl, previewUrl, onFile, onClear, open }) => {
  const ref = useRef(null);

  const hasImage = Boolean(
    previewUrl
    || currentUrl
    || absoluteUrl
    || cmsPublicImageUrlCandidates(currentUrl, absoluteUrl).length > 0
  );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onClear();
    if (ref.current) ref.current.value = "";
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ color: "#94a3b8", fontSize: "0.62rem", mb: 0.6, fontWeight: 600 }}>
        {label}
      </Typography>
      <input
        type="file"
        ref={ref}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <ImgUploadArea hasimg={String(hasImage)} onClick={() => ref.current?.click()}>
        {hasImage ? (
          <>
            <CmsStorageImage
              storagePath={currentUrl}
              absoluteUrl={absoluteUrl}
              previewSrc={previewUrl}
              alt=""
              sx={{ maxHeight: 86, maxWidth: "92%", objectFit: "contain", borderRadius: 1, position: "relative", zIndex: 1 }}
            />
            <CamOv className="cam-ov">
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.58rem", mt: 0.3 }}>
                Cambiar imagen
              </Typography>
            </CamOv>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, color: "#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize: 30, opacity: 0.55 }} />
            <Typography variant="caption" sx={{ fontSize: "0.60rem", color: "#64748b" }}>
              Clic para subir imagen
            </Typography>
          </Box>
        )}
      </ImgUploadArea>

      {hasImage && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.6, gap: 0.5 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={handleRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: previewUrl ? "#22c55e" : "#94a3b8", fontSize: "0.60rem" }}>
            {previewUrl ? "Nueva imagen lista para guardar" : "Imagen actual"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* ─── Section meta ────────────────────────────────────────────────────────── */
const SECTION_META = {
  header: { label: "Encabezado de sección",      desc: "Badge y título principal" },
  paso1:  { label: "Paso 1",                     desc: "Título, descripción e icono" },
  paso2:  { label: "Paso 2",                     desc: "Título, descripción e icono" },
  paso3:  { label: "Paso 3",                     desc: "Título, descripción e icono" },
};

/* ─── Panel CMS ───────────────────────────────────────────────────────────── */
const MetodologiaCmsPanel = ({
  open, panelLeft = 0, datos,
  onChange, onChangePaso, onSave, onClose, scrollTo,
}) => {
  const section   = scrollTo || "header";
  const meta      = SECTION_META[section] || SECTION_META.header;
  const pasoIndex = section.startsWith("paso") ? parseInt(section.replace("paso", ""), 10) - 1 : -1;
  const paso      = pasoIndex >= 0 && datos?.pasos ? datos.pasos[pasoIndex] : null;

  const field = (label, value, onVal, multiline = false, rows = 3) => (
    <DarkField
      size="small"
      fullWidth
      label={label}
      value={value ?? ""}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      onChange={(e) => onVal(e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>

      {/* Header sticky */}
      <Box sx={{
        px: 2, py: 1.5,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.30)",
        position: "sticky", top: 0, zIndex: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* colored accent bar */}
          <Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: "#f97316", mb: 0.6 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {meta.label}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {meta.desc}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316", bgcolor: "rgba(249,115,22,0.12)" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2, py: 2, flex: 1 }}>

        {section === "header" && (
          <>
            <SectionTag>Textos del encabezado</SectionTag>
            {field("Badge / etiqueta", datos?.badge_seccion, (v) => onChange("badge_seccion", v))}
            {field("Título principal", datos?.seccion_titulo, (v) => onChange("seccion_titulo", v), true, 3)}
            <Typography variant="caption" sx={{ color: "#475569", display: "block", fontSize: "0.60rem", mt: -0.5 }}>
              Los textos de cada paso se editan haciendo clic sobre la tarjeta.
            </Typography>
          </>
        )}

        {paso && (
          <>
            <SectionTag>Contenido del paso {pasoIndex + 1}</SectionTag>
            <ImgUpload
              label="Icono / imagen del paso"
              currentUrl={paso.url_imagen}
              absoluteUrl={paso.url_imagen_publica}
              previewUrl={paso._preview}
              open={open}
              onFile={(file) => onChangePaso(pasoIndex, "_imageFile", file)}
              onClear={() => onChangePaso(pasoIndex, "_clearImage", true)}
            />
            {field("Título del paso", paso.titulo, (v) => onChangePaso(pasoIndex, "titulo", v))}
            {field("Descripción", paso.descripcion, (v) => onChangePaso(pasoIndex, "descripcion", v), true, 5)}
          </>
        )}

      </Box>

      {/* Footer sticky */}
      <Box sx={{
        px: 2, py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", bottom: 0,
      }}>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            sx={{
              bgcolor: "#f97316",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.82rem",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            Guardar cambios
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "rgba(255,255,255,0.20)",
              color: "#94a3b8",
              minWidth: 42,
              borderRadius: 2,
              "&:hover": { borderColor: "#f97316", color: "#f97316" },
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>

    </CmsPanelRoot>
  );
};

export default MetodologiaCmsPanel;
