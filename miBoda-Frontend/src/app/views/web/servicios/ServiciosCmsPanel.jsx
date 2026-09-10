import React, { useRef, useEffect } from "react";
import {
  Box, Typography, IconButton, Divider, Stack, TextField, Button, CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon         from "@mui/icons-material/Close";
import SaveIcon          from "@mui/icons-material/Save";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LinkIcon          from "@mui/icons-material/Link";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { authJWTConfig } from "app/authJWTConfig";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsTinyMceFieldDark from "app/components/cms/CmsTinyMceFieldDark";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#f97316", marginBottom: 6, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

const ImgUploadArea = styled(Box)(({ hasimg }) => ({
  width: "100%", borderRadius: 10,
  border: `2px dashed ${hasimg === "true" ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.18)"}`,
  backgroundColor: "rgba(255,255,255,0.05)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", position: "relative", overflow: "hidden",
  transition: "border-color 0.25s",
  "&:hover": { borderColor: "#f97316" },
  "&:hover .cam-ov": { opacity: 1 },
}));

const CamOv = styled(Box)({
  position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  opacity: 0, transition: "opacity 0.25s", zIndex: 2,
});

/* Acepta imágenes + SVG */
const ACCEPT_IMG = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.svg";

/* ── Subida de icono pequeño (90px) ─────────────────────────────── */
const IconUpload = ({ currentUrl, preview, onFile, onRemove, open }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) { onRemove(); if (ref.current) ref.current.value = ""; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const displayImg = preview || (currentUrl ? `${BASE}${currentUrl}` : null);

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ color: "#94a3b8", fontSize: "0.62rem", mb: 0.5 }}>
        Icono / imagen del servicio (JPG, PNG, SVG…)
      </Typography>
      <input type="file" ref={ref} accept={ACCEPT_IMG} style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <ImgUploadArea hasimg={String(!!displayImg)} sx={{ height: 90 }} onClick={() => ref.current?.click()}>
        {displayImg ? (
          <>
            <Box component="img" src={displayImg} alt="icono"
              sx={{ maxHeight: 76, maxWidth: "90%", objectFit: "contain" }} />
            <CamOv className="cam-ov">
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.58rem", mt: 0.3 }}>Cambiar</Typography>
            </CamOv>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4, color: "#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize: 28, opacity: 0.6 }} />
            <Typography variant="caption" sx={{ fontSize: "0.60rem" }}>Subir icono (clic)</Typography>
          </Box>
        )}
      </ImgUploadArea>
      {preview && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 0.4 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem" }}>Nuevo icono listo</Typography>
        </Box>
      )}
    </Box>
  );
};

/* ── Subida de foto grande + campo URL opcional ───────────────────── */
const FotoUpload = ({ currentUrl, preview, onFile, onRemove, onUrlChange, open }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) { onRemove(); if (ref.current) ref.current.value = ""; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* preview = data-URL del archivo subido; si no hay preview usa la URL guardada en BD */
  const displayImg = preview || (currentUrl ? `${BASE}${currentUrl}` : null);

  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ color: "#94a3b8", fontSize: "0.62rem", mb: 0.5 }}>
        Foto decorativa de fondo (JPG, PNG, WebP, SVG…)
      </Typography>
      <input type="file" ref={ref} accept={ACCEPT_IMG} style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      <ImgUploadArea hasimg={String(!!displayImg)} sx={{ height: 140 }} onClick={() => ref.current?.click()}>
        {displayImg ? (
          <>
            <Box component="img" src={displayImg} alt="foto"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <CamOv className="cam-ov">
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.60rem", mt: 0.4 }}>
                Cambiar foto (clic)
              </Typography>
            </CamOv>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, color: "#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize: 36, opacity: 0.5 }} />
            <Typography variant="caption" sx={{ fontSize: "0.62rem" }}>Subir foto (clic)</Typography>
          </Box>
        )}
      </ImgUploadArea>

      {preview && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 0.4 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem" }}>Nueva foto lista</Typography>
        </Box>
      )}

      {/* URL opcional — si no quiere subir archivo */}
      {!preview && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
            <LinkIcon sx={{ fontSize: 12, color: "#64748b" }} />
            <Typography sx={{ fontSize: "0.58rem", color: "#64748b" }}>
              O pega una URL de imagen (opcional)
            </Typography>
          </Box>
          <DarkField
            size="small" fullWidth placeholder="https://… o ruta relativa"
            value={currentUrl || ""}
            onChange={(e) => onUrlChange(e.target.value)}
            InputProps={{ sx: { fontSize: "0.72rem" } }}
          />
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ServiciosCmsPanel = ({
  open, panelLeft = 0, section,
  seccionTitulo, card, preview, fotoPreview,
  onSeccionChange, onCardChange, onFile, onRemoveFile,
  onFotoFile, onRemoveFoto,
  onSave, onClose, saving,
}) => {
  const isHeader = section === "header";
  const hasFoto  = card && (card.orden === 1 || card.orden === 4);
  const metaLabel = isHeader ? "Encabezado" : (card?.titulo || "Servicio");
  const metaDesc  = isHeader
    ? "Título principal de la sección"
    : hasFoto ? "Foto, icono, título y descripción" : "Icono, título y descripción";

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

      {/* Campos */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        {isHeader && (
          <>
            <SectionTag>Encabezado de la sección</SectionTag>
            <CmsTinyMceFieldDark
              label="Título principal (HTML)"
              value={seccionTitulo ?? ""}
              onChange={onSeccionChange}
              mode="compact"
              height={110}
            />
          </>
        )}

        {!isHeader && card && (
          <>
            {hasFoto && (
              <>
                <SectionTag>Foto decorativa</SectionTag>
                <FotoUpload
                  currentUrl={card.url_foto}
                  preview={fotoPreview}
                  onFile={onFotoFile}
                  onRemove={onRemoveFoto}
                  onUrlChange={(val) => onCardChange("url_foto", val)}
                  open={open}
                />
                <Sep />
              </>
            )}

            <SectionTag>Icono</SectionTag>
            <IconUpload
              currentUrl={card.url_icono}
              preview={preview}
              onFile={onFile}
              onRemove={onRemoveFile}
              open={open}
            />
            <Sep />

            <SectionTag>Contenido</SectionTag>
            <DarkField
              size="small" fullWidth label="Título del servicio"
              value={card.titulo ?? ""}
              onChange={(e) => onCardChange("titulo", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <DarkField
              size="small" fullWidth label="Descripción"
              value={card.descripcion ?? ""}
              onChange={(e) => onCardChange("descripcion", e.target.value)}
              multiline rows={4} sx={{ mb: 1.5 }}
            />
          </>
        )}

      </Box>

      {/* Botones fijos */}
      <Box sx={{
        px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
      }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={onSave} disabled={saving}
            sx={{ bgcolor: "#f97316", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}>
            {saving ? "Guardando…" : "Guardar cambios"}
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

export default ServiciosCmsPanel;
