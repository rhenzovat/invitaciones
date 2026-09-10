import React, { useState, useRef } from "react";
import { useIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { PortletHeader, PortletHeaderToolbar } from "../../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { SimpleCard } from "app/components";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Tooltip from '@mui/material/Tooltip';
import { authJWTConfig } from "app/authJWTConfig";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export const DomainBackend = authJWTConfig.domain + "/";

const ACCEPTED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
const RECOMMENDED_WIDTH = 228;
const RECOMMENDED_HEIGHT = 220;

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ImageUploadArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isDragging",
})(({ theme, isDragging }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: `${RECOMMENDED_WIDTH} / ${RECOMMENDED_HEIGHT}`,
  borderRadius: "14px",
  overflow: "hidden",
  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: isDragging
    ? theme.palette.mode === "dark" ? "rgba(25,118,210,0.15)" : "rgba(25,118,210,0.07)"
    : theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
  cursor: "pointer",
  transition: "all 0.25s ease",
  transform: isDragging ? "scale(1.025)" : "scale(1)",
  boxShadow: isDragging ? "0 0 0 5px rgba(25,118,210,0.18)" : "none",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(25,118,210,0.05)",
    "& .overlay": { opacity: 1 },
  },
}));

const ImageOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  opacity: 0,
  transition: "opacity 0.25s ease",
  zIndex: 2,
  backdropFilter: "blur(2px)",
});

const ImageInfoModal = ({ open, onClose, onConfirm, previewUrl, dimensions, fileInfo }) => {
  if (!dimensions || !fileInfo) return null;

  const widthOk  = dimensions.width  >= RECOMMENDED_WIDTH;
  const heightOk = dimensions.height >= RECOMMENDED_HEIGHT;
  const allGood  = widthOk && heightOk;

  const InfoRow = ({ label, value, highlight }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.6 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: highlight ? "#1976d2" : "text.primary" }}>{value}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>

      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5,
        }}>
          <ImageSearchIcon sx={{ color: "#fff", fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#fff">
              Información de la imagen
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Verifica que cumple los requisitos antes de guardar
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ backgroundColor: "#0a0a0a", maxHeight: 220, overflow: "hidden", display: "flex", justifyContent: "center" }}>
          <img src={previewUrl} alt="preview"
            style={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain" }} />
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
              {allGood
                ? "¡La imagen cumple los requisitos recomendados!"
                : "La imagen no cumple todos los requisitos recomendados."}
            </Typography>
          </Box>

          <Typography variant="caption" fontWeight={700} sx={{
            textTransform: "uppercase", letterSpacing: 0.8, color: "#1e3c72",
            display: "block", mb: 1,
          }}>
            📐 Dimensiones detectadas
          </Typography>
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: "10px", px: 2, py: 1, mb: 2 }}>
            <InfoRow label="Dimensiones" value={`${dimensions.width} x ${dimensions.height}`} highlight />
            <Divider sx={{ my: 0.5, opacity: 0.5 }} />
            <InfoRow label="Ancho" value={`${dimensions.width} píxeles`} highlight />
            <InfoRow label="Alto" value={`${dimensions.height} píxeles`} highlight />
          </Box>

          <Typography variant="caption" fontWeight={700} sx={{
            textTransform: "uppercase", letterSpacing: 0.8, color: "#1e3c72",
            display: "block", mb: 1,
          }}>
            📄 Archivo
          </Typography>
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: "10px", px: 2, py: 1, mb: 2 }}>
            <InfoRow label="Nombre" value={fileInfo.name} />
            <Divider sx={{ my: 0.5, opacity: 0.5 }} />
            <InfoRow label="Formato" value={fileInfo.ext.toUpperCase()} />
            <InfoRow label="Tamaño" value={formatFileSize(fileInfo.size)} />
          </Box>

          <Typography variant="caption" fontWeight={700} sx={{
            textTransform: "uppercase", letterSpacing: 0.8, color: "#1e3c72",
            display: "block", mb: 1,
          }}>
            ✅ Requisitos recomendados
          </Typography>
          <Box sx={{ backgroundColor: "#f8fafc", borderRadius: "10px", px: 2, py: 1, mb: 1 }}>
            <Stack direction="row" flexWrap="wrap" gap={0.8} mb={1} pt={0.5}>
              {ACCEPTED_FORMATS.map((fmt) => (
                <Chip key={fmt} label={`.${fmt}`} size="small"
                  sx={{
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
                {widthOk
                  ? <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 16 }} />
                  : <WarningAmberIcon sx={{ color: "#d97706", fontSize: 16 }} />}
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Alto mínimo</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>{RECOMMENDED_HEIGHT} px</Typography>
                {heightOk
                  ? <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 16 }} />
                  : <WarningAmberIcon sx={{ color: "#d97706", fontSize: 16 }} />}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small"
          sx={{ borderRadius: "8px", textTransform: "none", minWidth: 100 }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" size="small"
          startIcon={<CheckCircleOutlineIcon />}
          sx={{
            borderRadius: "8px", textTransform: "none", minWidth: 130,
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          }}>
          Usar esta imagen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CategoriaPopularEditPage = ({
  dataRowEditNew,
  titulo,
  cancelarEdicion,
  agregarCategoriaPopular,
  actualizarCategoriaPopular,
  ...props
}) => {
  const intl = useIntl();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [openZoomModal, setOpenZoomModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));

  const grabar = (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      const categoriaData = {
        ...dataRowEditNew,
        url_imagen: props.imagenProfile ? props.imagenProfile : null
      };
      if (dataRowEditNew.esNuevoRegistro) {
        agregarCategoriaPopular(categoriaData);
      } else {
        actualizarCategoriaPopular(categoriaData);
      }
    }
  };

  const processFile = (file) => {
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
        setShowImageModal(true);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handleModalConfirm = () => {
    props.setImagenProfile(pendingFile);
    setPreviewUrl(pendingPreview);
    setShowImageModal(false);
  };

  const handleModalCancel = () => {
    setPendingFile(null);
    setPendingPreview(null);
    setShowImageModal(false);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    props.setImagenProfile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentImageUrl = dataRowEditNew.url_imagen
    ? DomainBackend + dataRowEditNew.url_imagen
    : null;
  const displayImage = previewUrl || currentImageUrl;

  return (
    <div className="container mt-3">
      <PortletHeader
        title={titulo}
        toolbar={
          <PortletHeaderToolbar>
            <ButtonDev
              icon="save"
              type="default"
              hint="Grabar"
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
            <ButtonDev
              icon="remove"
              type="normal"
              stylingMode="outlined"
              onClick={cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />

      <SimpleCard>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: { xs: "stretch", md: "flex-start" },
            width: "100%",
          }}
        >
          {/* ── Campos del formulario (arriba en móvil) ── */}
          <Box sx={{ flex: 1, minWidth: 0, width: { xs: "100%", md: "auto" } }}>
            <Form formData={dataRowEditNew} validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={isNarrow ? 1 : 2} colSpan={2}>
                <Item
                  dataField="nombre_categoria"
                  label={{ text: "Nombre de la categoría" }}
                  isRequired={true}
                />
                <Item
                  dataField="orden"
                  label={{ text: "Orden" }}
                  editorType="dxNumberBox"
                  isRequired={true}
                  editorOptions={{
                    min: 1,
                    step: 1,
                    showSpinButtons: true,
                    placeholder: "Ingrese un número mayor a 0",
                    onKeyDown: (e) => {
                      if (["e","E","-","+","."].includes(e.event.key)) e.event.preventDefault();
                    },
                    onValueChanged: (e) => {
                      if (e.value <= 0) e.component.option("value", null);
                    },
                  }}
                />
                <Item
                  dataField="url_direccion"
                  label={{ text: "URL" }}
                />
                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.ACTION.ESTADO" }) }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    items: props.estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />
              </GroupItem>
            </Form>
          </Box>

          {/* ── Imagen (debajo del formulario en móvil) ── */}
          <Box
            sx={{
              width: { xs: "100%", md: 248 },
              maxWidth: { xs: "100%", md: 248 },
              flexShrink: 0,
              alignSelf: { xs: "stretch", md: "flex-start" },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* Header del panel */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PhotoCameraIcon sx={{ color: "#fff", fontSize: 18 }} />
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#fff"
                    display="block"
                    sx={{ letterSpacing: 0.5, fontSize: "0.68rem", textTransform: "uppercase" }}
                  >
                    Imagen de categoría
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)", fontSize: "10px" }}>
                    {RECOMMENDED_WIDTH} × {RECOMMENDED_HEIGHT} px recomendado
                  </Typography>
                </Box>
              </Box>

              {/* Área de carga */}
              <Box sx={{ p: 2 }}>
                <ImageUploadArea
                  isDragging={isDragging}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt="categoria"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <ImageOverlay className="overlay">
                        <PhotoCameraIcon sx={{ color: "#fff", fontSize: 26, mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>
                          Cambiar imagen
                        </Typography>
                      </ImageOverlay>
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        color: isDragging ? "primary.main" : "text.secondary",
                        p: 2,
                      }}
                    >
                      <CloudUploadOutlinedIcon
                        sx={{
                          fontSize: 46,
                          opacity: isDragging ? 1 : 0.35,
                          transform: isDragging ? "translateY(-5px) scale(1.08)" : "none",
                          transition: "all 0.25s ease",
                          color: isDragging ? "primary.main" : "inherit",
                        }}
                      />
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.3 }}>
                          {isDragging ? "¡Suelta aquí!" : "Arrastra o haz clic"}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "10px" }}>
                          {ACCEPTED_FORMATS.map((f) => `.${f}`).join("  ")}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </ImageUploadArea>

                {/* Botones de acción */}
                {displayImage && (
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mt: 1 }}>
                    <Tooltip title="Ver imagen completa">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setOpenZoomModal(true); }}
                        sx={{ color: "text.secondary" }}
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {previewUrl && (
                      <Tooltip title="Quitar imagen nueva">
                        <IconButton size="small" color="error" onClick={handleRemoveImage}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}

                {/* Estado de imagen */}
                {previewUrl ? (
                  <Box sx={{ mt: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        borderRadius: 4,
                        mb: 1,
                        height: 4,
                        backgroundColor: "#dcfce7",
                        "& .MuiLinearProgress-bar": { backgroundColor: "#16a34a" },
                      }}
                    />
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {imageDimensions && (
                        <Chip
                          icon={<AspectRatioIcon sx={{ fontSize: "12px !important" }} />}
                          label={`${imageDimensions.width}×${imageDimensions.height}`}
                          size="small"
                          sx={{ fontSize: "10px", fontWeight: 700, height: 20, backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd" }}
                        />
                      )}
                      {fileInfo && (
                        <Chip
                          label={fileInfo.ext.toUpperCase()}
                          size="small"
                          sx={{ fontSize: "10px", fontWeight: 700, height: 20, backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac" }}
                        />
                      )}
                      {fileInfo && (
                        <Chip
                          label={formatFileSize(fileInfo.size)}
                          size="small"
                          sx={{ fontSize: "10px", fontWeight: 700, height: 20, backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" color="success.main" fontWeight={600} display="block" sx={{ mt: 0.5, fontSize: "10px" }}>
                      ✓ Nueva imagen lista para guardar
                    </Typography>
                  </Box>
                ) : currentImageUrl ? (
                  <Box sx={{ mt: 1, textAlign: "center" }}>
                    <Chip
                      label="Imagen actual guardada"
                      size="small"
                      sx={{ fontSize: "10px", fontWeight: 600, backgroundColor: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ mt: 1, textAlign: "center" }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "10px" }}>
                      Sin imagen asignada
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer informativo */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <AspectRatioIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "10px" }}>
                  Recomendado: {RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT}px
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </SimpleCard>

      {/* Modal zoom imagen */}
      <Dialog open={openZoomModal} onClose={() => setOpenZoomModal(false)} maxWidth="lg" fullWidth
        PaperProps={{ sx: { borderRadius: "12px", overflow: "hidden" } }}>
        <DialogTitle sx={{ m: 0, p: 0 }}>
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 2.5, py: 1.5, backgroundColor: "#f5f5f5",
            borderBottom: "1px solid", borderColor: "divider"
          }}>
            <Typography fontWeight={600} fontSize="1rem" color="#333">
              {dataRowEditNew.nombre_categoria || "Imagen de Categoría"}
            </Typography>
            <IconButton size="small" onClick={() => setOpenZoomModal(false)} sx={{ color: "#666" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{
          p: 3, display: "flex", justifyContent: "center",
          alignItems: "center", backgroundColor: "#fafafa", minHeight: "400px"
        }}>
          <img
            src={displayImage}
            alt={dataRowEditNew.nombre_categoria || "Categoría"}
            style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "6px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal info imagen */}
      <ImageInfoModal
        open={showImageModal}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        previewUrl={pendingPreview}
        dimensions={imageDimensions}
        fileInfo={fileInfo}
      />
    </div>
  );
};

export default CategoriaPopularEditPage;
