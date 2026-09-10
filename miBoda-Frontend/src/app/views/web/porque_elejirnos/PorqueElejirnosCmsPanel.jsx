import React, { useRef, useState, useEffect } from "react";
import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon         from "@mui/icons-material/Close";
import SaveIcon          from "@mui/icons-material/Save";
import AddIcon           from "@mui/icons-material/Add";
import DragHandleIcon    from "@mui/icons-material/DragHandle";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import { cmsPublicImageUrlCandidates } from "../../../utils/utils";

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

const ImgUploadArea = styled(Box)(({ hasimg }) => ({
  width: "100%",
  height: 80,
  borderRadius: 10,
  border: `2px dashed ${hasimg === "true" ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.18)"}`,
  backgroundColor: "rgba(255,255,255,0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  transition: "border-color 0.25s",
  "&:hover": { borderColor: "#f97316" },
  "&:hover .cam-ov": { opacity: 1 },
}));

const CamOv = styled(Box)({
  position: "absolute", inset: 0,
  backgroundColor: "rgba(0,0,0,0.55)",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  opacity: 0, transition: "opacity 0.25s", zIndex: 2,
});

// ── Upload de imagen con preview ──────────────────────────────────────────────
const ImgUpload = ({
  label, fieldKey, previewFieldKey, currentUrl, absoluteUrl, previewUrl, onChange, open,
}) => {
  const ref = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);

  useEffect(() => {
    if (!open) setLocalPreview(null);
  }, [open]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(fieldKey, file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setLocalPreview(dataUrl);
      if (previewFieldKey) onChange(previewFieldKey, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setLocalPreview(null);
    onChange(fieldKey, null);
    if (previewFieldKey) onChange(previewFieldKey, null);
    if (ref.current) ref.current.value = "";
  };

  const effectivePreview = localPreview || previewUrl;
  const hasImage = Boolean(
    effectivePreview
    || currentUrl
    || absoluteUrl
    || cmsPublicImageUrlCandidates(currentUrl, absoluteUrl).length > 0
  );

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ color: "#94a3b8", fontSize: "0.62rem", mb: 0.5 }}>{label}</Typography>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <ImgUploadArea hasimg={String(hasImage)} onClick={() => ref.current?.click()}>
        {hasImage ? (
          <>
            <CmsStorageImage
              storagePath={currentUrl}
              absoluteUrl={absoluteUrl}
              previewSrc={effectivePreview}
              alt={label}
              sx={{ maxHeight: 70, maxWidth: "95%", objectFit: "contain" }}
            />
            <CamOv className="cam-ov">
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.58rem", mt: 0.3 }}>
                Cambiar
              </Typography>
            </CamOv>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4, color: "#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize: 28, opacity: 0.6 }} />
            <Typography variant="caption" sx={{ fontSize: "0.60rem" }}>Subir imagen</Typography>
          </Box>
        )}
      </ImgUploadArea>
      {localPreview && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 0.4 }}>
          <IconButton size="small" sx={{ color: "#ef4444", p: 0.3 }} onClick={handleRemove}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem" }}>
            Nueva imagen lista
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Títulos y descripciones por sección ───────────────────────────────────────
const SECTION_META = {
  header:        { label: "Encabezado",            desc: "Badge, título y descripción" },
  imagen_izq:    { label: "Imagen izquierda",       desc: "Foto del equipo" },
  imagen_centro: { label: "Imagen centro",          desc: "Foto principal" },
  beneficios:    { label: "Beneficios",             desc: "Lista con checks" },
  stats:         { label: "Estadísticas",           desc: "Los 3 números destacados" },
};

// ─────────────────────────────────────────────────────────────────────────────

const PorqueElejirnosCmsPanel = ({ open, panelLeft = 0, datos, onChange, onSave, onClose, scrollTo }) => {
  const beneficios = Array.isArray(datos?.beneficios) ? datos.beneficios : [];
  const section    = scrollTo || "header";
  const meta       = SECTION_META[section] || SECTION_META.header;

  const field = (label, key, multiline = false, rows = 2, type = "text") => (
    <DarkField
      key={key} size="small" fullWidth type={type} label={label}
      value={datos?.[key] ?? ""} multiline={multiline}
      rows={multiline ? rows : undefined}
      onChange={(e) => onChange(key, e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  const addBeneficio    = () => onChange("beneficios", [...beneficios, ""]);
  const updateBeneficio = (i, val) => {
    const arr = [...beneficios]; arr[i] = val; onChange("beneficios", arr);
  };
  const removeBeneficio = (i) =>
    onChange("beneficios", beneficios.filter((_, idx) => idx !== i));

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

        {/* ── Encabezado ── */}
        {section === "header" && (
          <>
            <SectionTag>Encabezado</SectionTag>
            {field("Badge / Etiqueta", "badge_texto")}
            {field("Título principal", "titulo", true, 3)}
            {field("Descripción", "descripcion", true, 3)}
          </>
        )}

        {/* ── Imagen izquierda ── */}
        {section === "imagen_izq" && (
          <>
            <SectionTag>Imagen izquierda</SectionTag>
            <ImgUpload
              label="Foto del equipo"
              fieldKey="_imgIzquierda"
              previewFieldKey="_previewIzq"
              currentUrl={datos?.url_imagen_izquierda}
              absoluteUrl={datos?.url_imagen_izquierda_publica}
              previewUrl={datos?._previewIzq}
              onChange={onChange}
              open={open}
            />
          </>
        )}

        {/* ── Imagen centro ── */}
        {section === "imagen_centro" && (
          <>
            <SectionTag>Imagen centro</SectionTag>
            <ImgUpload
              label="Foto principal"
              fieldKey="_imgCentro"
              previewFieldKey="_previewCentro"
              currentUrl={datos?.url_imagen_centro}
              absoluteUrl={datos?.url_imagen_centro_publica}
              previewUrl={datos?._previewCentro}
              onChange={onChange}
              open={open}
            />
          </>
        )}

        {/* ── Beneficios ── */}
        {section === "beneficios" && (
          <>
            <SectionTag>Beneficios (lista con checks)</SectionTag>
            <Stack spacing={0.8} sx={{ mb: 1 }}>
              {beneficios.map((item, i) => (
                <Box key={i} sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <DragHandleIcon sx={{ color: "#475569", fontSize: 16, flexShrink: 0 }} />
                  <DarkField
                    size="small" fullWidth value={item}
                    placeholder={`Beneficio ${i + 1}`}
                    onChange={(e) => updateBeneficio(i, e.target.value)}
                    sx={{ mb: 0 }}
                  />
                  <IconButton size="small" onClick={() => removeBeneficio(i)}
                    sx={{ color: "#ef4444", flexShrink: 0 }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button size="small" startIcon={<AddIcon />} onClick={addBeneficio}
              sx={{ color: "#f97316", textTransform: "none", fontSize: "0.72rem", mb: 1 }}>
              Agregar beneficio
            </Button>
          </>
        )}

        {/* ── Estadísticas ── */}
        {section === "stats" && (
          <>
            {[1, 2, 3].map((n) => (
              <Box key={n}>
                <SectionTag>Estadística {n}</SectionTag>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <DarkField size="small" type="number" label="Número"
                    value={datos?.[`stat${n}_numero`] ?? ""}
                    onChange={(e) => onChange(`stat${n}_numero`, e.target.value)}
                    sx={{ mb: 1.5, flex: 1 }} />
                  <DarkField size="small" label="Sufijo"
                    value={datos?.[`stat${n}_sufijo`] ?? ""}
                    onChange={(e) => onChange(`stat${n}_sufijo`, e.target.value)}
                    sx={{ mb: 1.5, width: 80 }} />
                </Box>
                {field(`Descripción stat ${n}`, `stat${n}_texto`, true, 2)}
                {n < 3 && <Sep />}
              </Box>
            ))}
          </>
        )}

      </Box>

      {/* Botones fijos al fondo */}
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

export default PorqueElejirnosCmsPanel;
