import React, { useState, useRef } from "react";
import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon        from "@mui/icons-material/Close";
import CloudUploadIcon  from "@mui/icons-material/CloudUpload";
import SaveIcon         from "@mui/icons-material/Save";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon       from "@mui/icons-material/WarningAmber";
import ImageSearchIcon        from "@mui/icons-material/ImageSearch";
import DeleteOutlineIcon      from "@mui/icons-material/DeleteOutline";
import AspectRatioIcon        from "@mui/icons-material/AspectRatio";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
// CmsTinyMceFieldDark removido: el slider usa texto plano (sin HTML)

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#f1f5f9",
    borderRadius: 6,
  },
  "& .MuiInputBase-input":        { color: "#f1f5f9" },
  "& .MuiInputLabel-root":        { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(204,107,142,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#cc6b8e" },
}));

const UploadZone = styled(Box, {
  shouldForwardProp: (p) => p !== "hasImg",
})(({ hasImg }) => ({
  border:          `2px dashed ${hasImg ? "#f97316" : "rgba(255,255,255,0.20)"}`,
  borderRadius:    10,
  minHeight:       90,
  display:         "flex",
  flexDirection:   "column",
  alignItems:      "center",
  justifyContent:  "center",
  cursor:          "pointer",
  backgroundColor: hasImg ? "transparent" : "rgba(255,255,255,0.04)",
  overflow:        "hidden",
  position:        "relative",
  transition:      "border-color 0.2s",
  "&:hover":       { borderColor: "#f97316" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize:      "0.60rem",
  fontWeight:    700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color:         "#cc6b8e",
  marginBottom:  5,
  marginTop:     2,
}));

const Sep = () => (
  <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />
);

// ─── Validación de imagen ────────────────────────────────────────────────────
const ACCEPTED_FORMATS    = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
const RECOMMENDED_WIDTH   = 1920;
const RECOMMENDED_HEIGHT  = 600;

const formatFileSize = (bytes) => {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const InfoRow = ({ label, value, highlight }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.6 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
    <Typography variant="body2" fontWeight={700} sx={{ color: highlight ? "#1976d2" : "text.primary" }}>{value}</Typography>
  </Box>
);

// ─── Modal de información de imagen ─────────────────────────────────────────
const ImageInfoModal = ({ open, onClose, onConfirm, previewUrl, dimensions, fileInfo }) => {
  if (!dimensions || !fileInfo) return null;
  const widthOk  = dimensions.width  >= RECOMMENDED_WIDTH;
  const heightOk = dimensions.height >= RECOMMENDED_HEIGHT;
  const ratioOk  = Math.abs(dimensions.width / dimensions.height - RECOMMENDED_WIDTH / RECOMMENDED_HEIGHT) < 0.15;
  const allGood  = widthOk && heightOk && ratioOk;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      sx={{ zIndex: 1600 }}
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
          px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <ImageSearchIcon sx={{ color: "#fff", fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#fff">Información de la imagen</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Verifica que cumple los requisitos antes de guardar
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ backgroundColor: "#0a0a0a", maxHeight: 220, overflow: "hidden", display: "flex", justifyContent: "center" }}>
          <img src={previewUrl} alt="preview" style={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain" }} />
        </Box>
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1, mb: 2,
            backgroundColor: allGood ? "#f0fdf4" : "#fffbeb",
            border: `1px solid ${allGood ? "#86efac" : "#fcd34d"}`,
            borderRadius: "10px", px: 2, py: 1,
          }}>
            {allGood
              ? <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 20 }} />
              : <WarningAmberIcon sx={{ color: "#d97706", fontSize: 20 }} />}
            <Typography variant="body2" fontWeight={600} color={allGood ? "#15803d" : "#92400e"}>
              {allGood ? "¡La imagen cumple los requisitos!" : "La imagen no cumple todos los requisitos."}
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.8, color: "#cc6b8e", display: "block", mb: 1 }}>
            Dimensiones detectadas
          </Typography>
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: "10px", px: 2, py: 1, mb: 2 }}>
            <InfoRow label="Ancho"  value={`${dimensions.width} px`}  highlight />
            <Divider sx={{ my: 0.5, opacity: 0.5 }} />
            <InfoRow label="Alto"   value={`${dimensions.height} px`} highlight />
          </Box>
          <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.8, color: "#cc6b8e", display: "block", mb: 1 }}>
            Requisitos recomendados
          </Typography>
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: "10px", px: 2, py: 1, mb: 1 }}>
            <Stack direction="row" flexWrap="wrap" gap={0.8} mb={1} pt={0.5}>
              {ACCEPTED_FORMATS.map((fmt) => (
                <Chip key={fmt} label={`.${fmt}`} size="small" sx={{
                  fontSize: "11px", fontWeight: 700, height: 22,
                  backgroundColor: fmt === fileInfo.ext ? "#dbeafe" : "#f1f5f9",
                  color: fmt === fileInfo.ext ? "#1d4ed8" : "#64748b",
                  border: fmt === fileInfo.ext ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                }} />
              ))}
            </Stack>
            <Divider sx={{ my: 0.5, opacity: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Ancho mínimo</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>{RECOMMENDED_WIDTH} px</Typography>
                {widthOk ? <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 16 }} /> : <WarningAmberIcon sx={{ color: "#d97706", fontSize: 16 }} />}
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Alto mínimo</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>{RECOMMENDED_HEIGHT} px</Typography>
                {heightOk ? <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 16 }} /> : <WarningAmberIcon sx={{ color: "#d97706", fontSize: 16 }} />}
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Relación aspecto</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>16:5 (panorámico)</Typography>
                {ratioOk ? <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 16 }} /> : <WarningAmberIcon sx={{ color: "#d97706", fontSize: 16 }} />}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ borderRadius: "8px", textTransform: "none", minWidth: 100 }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" size="small" startIcon={<CheckCircleOutlineIcon />}
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 130, background: "linear-gradient(135deg,#cc6b8e,#a0455e)" }}>
          Usar esta imagen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = {
  contenido: { title: "Contenido del Slide", subtitle: "Imagen, textos y enlace al hacer clic" },
  boton:     { title: "Enlace y botón",       subtitle: "URL del slide y texto del botón (opcional)" },
};

// ─────────────────────────────────────────────────────────────────────────────

const SliderCmsPanel = ({
  open,
  panelLeft = 0,
  section,
  sliderTitulo,
  datos,
  onChange,
  onSave,
  onClose,
}) => {
  const meta = SECTIONS[section] || SECTIONS.contenido;
  const fileInputRef = useRef(null);

  // Estado interno para flujo de imagen
  const [pendingFile,     setPendingFile]     = useState(null);
  const [pendingPreview,  setPendingPreview]  = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [fileInfo,        setFileInfo]        = useState(null);
  const [showModal,       setShowModal]       = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setFileInfo({ name: file.name, ext, size: file.size });
        setPendingFile(file);
        setPendingPreview(dataUrl);
        setShowModal(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModalConfirm = () => {
    onChange("localImage",  pendingFile);
    onChange("previewUrl",  pendingPreview);
    setShowModal(false);
    setPendingFile(null);
    setPendingPreview(null);
  };

  const handleModalCancel = () => {
    setPendingFile(null);
    setPendingPreview(null);
    setShowModal(false);
  };

  const handleRemoveImage = () => {
    onChange("localImage", null);
    onChange("previewUrl", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayImage = datos?.previewUrl || datos?.storedImageUrl || null;

  // Campo de texto genérico
  const F = (label, key, multiline = false, rows = 3, ph = "") => (
    <DarkField
      key={key}
      size="small"
      fullWidth
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
    <>
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
            <Typography variant="caption" sx={{ color: "#f97316", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {sliderTitulo}
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
              {meta.title}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
              {meta.subtitle}
            </Typography>
          </Box>
          <Tooltip title="Cerrar editor">
            <IconButton size="small" onClick={onClose}
              sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Campos ───────────────────────────────────────────────────── */}
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

          {/* ══ CONTENIDO ════════════════════════════════════════════════ */}
          {section === "contenido" && (<>
            <SectionTag>Imagen de fondo</SectionTag>
            <UploadZone hasImg={!!displayImage} onClick={() => fileInputRef.current?.click()} sx={{ mb: 1 }}>
              {displayImage ? (
                <>
                  <img src={displayImage} alt="fondo" style={{ maxHeight: 70, maxWidth: "90%", objectFit: "cover", width: "100%" }} />
                  <Box sx={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    bgcolor: "rgba(0,0,0,0.65)", py: 0.4, textAlign: "center",
                  }}>
                    <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.58rem" }}>
                      Cambiar imagen
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 0.5 }}>
                  <CloudUploadIcon sx={{ fontSize: 24, color: "#475569" }} />
                  <Typography variant="caption" sx={{ display: "block", color: "#64748b", fontSize: "0.60rem", mt: 0.3 }}>
                    Clic para seleccionar (1920×600px)
                  </Typography>
                </Box>
              )}
            </UploadZone>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp" style={{ display: "none" }} onChange={handleFileSelect} />
            {datos?.previewUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                <IconButton size="small" onClick={handleRemoveImage} sx={{ color: "#ef4444" }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: "#4ade80", fontSize: "0.60rem" }}>
                  ✓ Nueva imagen lista para guardar
                </Typography>
              </Box>
            )}

            <Sep />
            <SectionTag>Enlace al hacer clic (opcional)</SectionTag>
            {F("URL del slide", "url_link", false, 1, "https://wa.me/... o /productos")}
            <Typography variant="caption" sx={{ display: "block", color: "#64748b", fontSize: "0.62rem", mb: 1.5, lineHeight: 1.45 }}>
              Si completas la URL, el visitante podrá hacer clic en la imagen del slide. También se usa en el botón si lo configuras abajo.
            </Typography>

            <Sep />
            <SectionTag>Subtítulo (etiqueta naranja)</SectionTag>
            {F("Subtítulo", "subtitulo", false, 1, "Ej: Empresa de Importaciones · Lima")}

            <SectionTag>Título principal</SectionTag>
            {F("Título del slide", "titulo", true, 3, "Ej: Reconecta con tu cuerpo y el equilibrio energético")}

            <SectionTag>Párrafo descriptivo (opcional)</SectionTag>
            {F("Descripción breve", "descripcion", true, 4, "Ej: Relajación profunda y tacto consciente para mujeres profesionales en Lima")}
          </>)}

          {/* ══ BOTÓN ════════════════════════════════════════════════════ */}
          {section === "boton" && (<>
            <SectionTag>URL al hacer clic</SectionTag>
            {F("URL del slide", "url_link", false, 1, "https://wa.me/... o /productos")}
            <Typography variant="caption" sx={{ display: "block", color: "#64748b", fontSize: "0.62rem", mb: 1.5, lineHeight: 1.45 }}>
              Enlace al que irá el visitante al hacer clic en el slide o en el botón.
            </Typography>

            <Sep />
            <SectionTag>Texto del botón (opcional)</SectionTag>
            {F("Texto del botón", "texto_boton", false, 1, "Ej: Escríbenos por WhatsApp")}
          </>)}

        </Box>

        {/* ── Botón Guardar fijo al fondo ──────────────────────────────── */}
        <Box sx={{
          px: 2, py: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)",
          position: "sticky", bottom: 0,
        }}>
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              sx={{ background: "linear-gradient(135deg,#cc6b8e,#a0455e)", color: "#fff", fontWeight: 700, borderRadius: "9px", "&:hover": { background: "linear-gradient(135deg,#a0455e,#7a2a3e)" } }}
            >
              Guardar cambios
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
        </Box>

      </CmsPanelRoot>

      {/* Modal de validación de imagen */}
      <ImageInfoModal
        open={showModal}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        previewUrl={pendingPreview}
        dimensions={imageDimensions}
        fileInfo={fileInfo}
      />
    </>
  );
};

export default SliderCmsPanel;
