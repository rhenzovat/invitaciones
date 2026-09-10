import React, { useRef } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import CmsTinyMceField from "app/components/cms/CmsTinyMceField";

/**
 * Campos para banner superior (título + imagen de fondo).
 * @param {boolean} dark - estilo panel lateral oscuro
 */
export default function CmsPaginaBannerFields({
  dark = false,
  titulo,
  onTituloChange,
  tituloLabel = "Título del banner",
  tituloHint,
  storagePath,
  previewSrc,
  onImageSelect,
  showTitulo = true,
  tituloUseEditor = false,
  imageLabel = "Imagen de fondo del banner",
}) {
  const fileRef = useRef(null);
  const Field = dark ? DarkField : TextField;

  return (
    <Box sx={{
      mb: 2, p: 1.5, borderRadius: 2,
      border: dark ? "1px solid rgba(249,115,22,0.35)" : "1px solid #fed7aa",
      bgcolor: dark ? "rgba(249,115,22,0.08)" : "#fff7ed",
    }}>
      <Typography variant="caption" sx={{
        fontWeight: 700, display: "block", mb: 1,
        color: dark ? "#fbbf24" : "#c2410c",
      }}>
        Banner superior (fondo + título)
      </Typography>
      {showTitulo && (tituloUseEditor ? (
        <CmsTinyMceField
          label={tituloLabel}
          value={titulo ?? ""}
          onChange={onTituloChange}
          mode="compact"
          height={80}
          helperText={tituloHint}
          sx={{ mb: 1 }}
        />
      ) : (
        <Field fullWidth size="small" label={tituloLabel} value={titulo ?? ""}
          onChange={(e) => onTituloChange?.(e.target.value)} sx={{ mb: 1 }}
          helperText={tituloHint} />
      ))}
      <Typography variant="caption" sx={{ color: dark ? "#94a3b8" : "text.secondary", display: "block", mb: 0.5 }}>
        {imageLabel}
      </Typography>
      <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onImageSelect?.(f);
      }} />
      <Box onClick={() => fileRef.current?.click()} sx={{
        aspectRatio: "16/6", border: "2px dashed #f97316", borderRadius: 1,
        cursor: "pointer", overflow: "hidden", mb: 1,
      }}>
        {(previewSrc || storagePath) ? (
          <CmsStorageImage storagePath={storagePath} previewSrc={previewSrc}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <PhotoCameraIcon sx={{ color: "#f97316" }} />
            <Typography variant="caption">Subir imagen</Typography>
          </Stack>
        )}
      </Box>
      <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()}
        sx={{ borderColor: "#f97316", color: dark ? "#fbbf24" : "#ea580c" }}>
        Cambiar imagen
      </Button>
    </Box>
  );
}

const DarkField = (props) => (
  <TextField
    {...props}
    sx={{
      ...(props.sx || {}),
      "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
      "& .MuiInputLabel-root": { color: "#94a3b8" },
      "& .MuiFormHelperText-root": { color: "#64748b" },
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
    }}
  />
);
