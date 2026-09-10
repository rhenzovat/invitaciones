import React, { useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TextArea from "devextreme-react/text-area";
import { TextBox } from "devextreme-react/text-box";
import { authJWTConfig } from "app/authJWTConfig";

const DomainBackend = authJWTConfig.domain + "/";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: "1.5rem",
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[6],
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 1.5rem",
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === "dark"
    ? "rgba(255,255,255,0.03)"
    : "rgba(0,0,0,0.01)",
}));

const ImageUploadArea = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  maxWidth: 220,
  margin: "0 auto",
  borderRadius: 12,
  overflow: "hidden",
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === "dark"
    ? "rgba(255,255,255,0.04)"
    : "rgba(0,0,0,0.02)",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(25,118,210,0.04)",
    "& .overlay": {
      opacity: 1,
    },
  },
}));

const ImageOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.45)",
  opacity: 0,
  transition: "opacity 0.3s ease",
  zIndex: 2,
});

const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const PlaceholderBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: theme.palette.text.secondary,
}));

const AboutEditPage = ({ data, onUpdate, title, accessButton, sectionNumber }) => {
  const intl = useIntl();
  const fileInputRef = useRef(null);
  const [localImage, setLocalImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formValues, setFormValues] = useState({
    titulo: "",
    descripcion: "",
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
      });
      setLocalImage(null);
      setPreviewUrl(null);
    }
  }, [data]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setLocalImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    if (!data) return;
    onUpdate({
      id_about: data.id_about,
      titulo: formValues.titulo,
      descripcion: formValues.descripcion,
      urlFileTem: localImage,
      Activo: "S",
    });
  };

  const handleFieldChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value || "" }));
  };

  if (!data) return null;

  const currentImageUrl = data.url_imagen ? `${DomainBackend}${data.url_imagen}` : null;
  const displayImage = previewUrl || currentImageUrl;

  return (
    <StyledCard elevation={1}>
      <CardHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label={`#${sectionNumber || data.id_about}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          {intl.formatMessage({ id: "COMMON.BUTTON.SAVE" })}
        </Button>
      </CardHeader>

      <CardContent sx={{ p: "1.5rem !important" }}>
        <Grid container spacing={3} alignItems="flex-start">
          {/* Columna de imagen */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Imagen
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
              {displayImage ? (
                <>
                  <PreviewImage src={displayImage} alt={data.titulo} />
                  <ImageOverlay className="overlay">
                    <PhotoCameraIcon sx={{ color: "#fff", fontSize: 32, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: "#fff" }}>
                      Cambiar imagen
                    </Typography>
                  </ImageOverlay>
                </>
              ) : (
                <PlaceholderBox>
                  <ImageOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                  <Typography variant="caption" textAlign="center" sx={{ px: 2 }}>
                    Clic para subir imagen
                  </Typography>
                </PlaceholderBox>
              )}
            </ImageUploadArea>

            {previewUrl && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Tooltip title="Quitar imagen nueva">
                  <IconButton size="small" color="error" onClick={handleRemoveImage}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" color="success.main" sx={{ lineHeight: "30px", ml: 0.5 }}>
                  Nueva imagen lista
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Columna de formulario */}
          <Grid item xs={12} sm={8} md={9}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Contenido
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextBox
                id={`titulo-${data.id_about}`}
                value={formValues.titulo}
                placeholder={intl.formatMessage({ id: "ABOUT.TITLE_PLACEHOLDER" })}
                label={intl.formatMessage({ id: "ABOUT.TITLE_LABEL" })}
                stylingMode="outlined"
                labelMode="floating"
                showClearButton={true}
                onValueChanged={(e) => handleFieldChange("titulo", e.value)}
              />
              <TextArea
                id={`descripcion-${data.id_about}`}
                height={160}
                value={formValues.descripcion}
                placeholder={intl.formatMessage({ id: "ABOUT.DESCRIPTION_PLACEHOLDER" })}
                label={intl.formatMessage({ id: "ABOUT.DESCRIPTION_LABEL" })}
                stylingMode="outlined"
                labelMode="floating"
                showClearButton={true}
                onValueChanged={(e) => handleFieldChange("descripcion", e.value)}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default React.memo(AboutEditPage);
