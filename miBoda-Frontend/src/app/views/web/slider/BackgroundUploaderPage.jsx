import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  Grid,
  Button,
  Paper,
  Box,
  Typography,
  Chip,
  Alert,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { Avatar } from "@files-ui/react";
import Badge from "@mui/material/Badge";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LinkIcon from "@mui/icons-material/Link";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { authJWTConfig } from "app/authJWTConfig";
import { sliderImageUrl } from "./SliderEditPage";
import TextArea from "devextreme-react/text-area";

export const DomainBackend = authJWTConfig.domain + "/";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2.5, 3),
  background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  color: "white",
}));

const HeaderIconWrapper = styled(Box)({
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "24px",
    color: "#fff",
  },
});

const BannerSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(4),
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "2px dashed #d0d7de",
  transition: "all 0.3s ease",
  minHeight: "350px",
  justifyContent: "center",
  "&:hover": {
    borderColor: "#1e3c72",
    backgroundColor: "#f0f4f8",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  padding: "10px 24px",
  borderRadius: "10px",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(30, 60, 114, 0.3)",
  },
}));

const FieldLabel = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
  color: "#1e3c72",
  fontSize: "14px",
  fontWeight: 600,
}));

const InfoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: "#e8f5e9",
  borderRadius: "10px",
  border: "1px solid #81c784",
  marginTop: theme.spacing(2),
}));

const InfoAlert = styled(Alert)(({ theme }) => ({
  borderRadius: "10px",
  backgroundColor: "#e3f2fd",
  border: "1px solid #90caf9",
  marginBottom: theme.spacing(3),
  "& .MuiAlert-icon": {
    color: "#1e3c72",
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#fff",
}));

const BackgroundUploaderPage = ({ dataRowEditNew, actualizarSlider, setLoading, accessButton }) => {
  const intl = useIntl();
  const [imagenFondo, setImagenFondo] = useState(null);
  const [sliderData, setSliderData] = useState(dataRowEditNew);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field) => (e) => {
    setSliderData({
      ...sliderData,
      [field]: e.value,
    });
    setHasChanges(true);
  };

  useEffect(() => {
    setSliderData(dataRowEditNew);
    setImagenFondo(null);
    setHasChanges(false);
  }, [dataRowEditNew]);

  const handleSave = () => {
    if (!imagenFondo && !sliderData.url_imagen) {
      alert("Debes seleccionar una imagen para el banner.");
      return;
    }

    const params = {
      id_slider: sliderData.id_slider,
      urlFileTem: imagenFondo ?? null,
      Activo: sliderData.Activo,
      titulo: null,
      descripcion: null,
      url_link: sliderData.url_link,
    };

    actualizarSlider(params);
    setHasChanges(false);
  };

  const handleImageChange = (e) => {
    setImagenFondo(e);
    setHasChanges(true);
  };

  const hasImage = imagenFondo || sliderData.url_imagen;
  const imageUrl = imagenFondo
    ? imagenFondo
    : sliderImageUrl(sliderData) || `${import.meta.env.BASE_URL}assets/logos/subir_imagen.svg`;

  return (
    <Box>
      <StyledPaper elevation={0}>
        {/* Header */}
        <HeaderBox>
          <Box display="flex" alignItems="center" gap={2}>
            <HeaderIconWrapper>
              <WallpaperIcon />
            </HeaderIconWrapper>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Banner de Cabecera
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Imagen mostrada en páginas internas
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            {hasChanges && (
              <Chip
                label="Cambios sin guardar"
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "1px solid rgba(255, 152, 0, 0.5)",
                }}
              />
            )}
            <StyledButton
              variant="contained"
              onClick={handleSave}
              startIcon={<SaveIcon />}
              disabled={!hasChanges}
              sx={{
                backgroundColor: "#fff",
                color: "#1e3c72",
                "&:hover": {
                  backgroundColor: "#f0f4f8",
                },
                "&:disabled": {
                  backgroundColor: "rgba(255,255,255,0.5)",
                  color: "rgba(30, 60, 114, 0.5)",
                },
              }}
            >
              Guardar Banner
            </StyledButton>
          </Box>
        </HeaderBox>

        <ContentSection>
          {/* Alert Info */}
          <InfoAlert icon={<InfoOutlinedIcon />} severity="info">
            Este banner aparece en la parte superior de las páginas internas. Los usuarios
            pueden hacer <strong>clic</strong> para abrir el enlace en una nueva pestaña.
          </InfoAlert>

          <Grid container spacing={3}>
            {/* Banner Upload Section */}
            <Grid item xs={12}>
              <BannerSection>
                <WallpaperIcon
                  sx={{
                    fontSize: 48,
                    color: "#1e3c72",
                    mb: 2,
                    opacity: 0.7,
                  }}
                />

                <Typography variant="h6" fontWeight={600} gutterBottom color="#1e3c72">
                  Imagen del Banner
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mb: 3, maxWidth: "500px" }}
                >
                  Tamaño recomendado: <strong>1920x400px</strong> | Formato: JPG, PNG |
                  Tamaño máximo: 2MB
                </Typography>

                <Badge
                  overlap="rectangular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <PhotoCameraIcon
                      sx={{
                        border: "4px solid white",
                        backgroundColor: "#1e3c72",
                        borderRadius: "50%",
                        padding: ".4rem",
                        width: 50,
                        height: 50,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#2a5298",
                          transform: "scale(1.1)",
                        },
                      }}
                    />
                  }
                >
                  <Avatar
                    src={imageUrl}
                    alt="Banner Image"
                    onChange={handleImageChange}
                    style={{
                      width: "100%",
                      maxWidth: "800px",
                      height: "4rem",
                      borderRadius: "12px",
                      objectFit: "cover",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </Badge>

                {hasImage && (
                  <InfoBox>
                    <CheckCircleIcon sx={{ color: "#2e7d32" }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="#2e7d32">
                        Imagen cargada correctamente
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        El banner se mostrará en las páginas internas después de guardar
                      </Typography>
                    </Box>
                  </InfoBox>
                )}
              </BannerSection>
            </Grid>

            {/* URL Link Section */}
            <Grid item xs={12}>
              <Box
                p={3}
                bgcolor="#f8fafc"
                borderRadius="12px"
                border="1px solid #e8ecf0"
              >
                <FieldLabel>
                  <LinkIcon fontSize="small" />
                  URL de Destino
                  <Tooltip title="El usuario será redirigido a esta URL al hacer clic en el banner">
                    <IconButton size="small">
                      <InfoOutlinedIcon fontSize="small" sx={{ color: "#9e9e9e" }} />
                    </IconButton>
                  </Tooltip>
                </FieldLabel>

                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Configura a dónde será redirigido el usuario al hacer clic en el banner
                </Typography>

                <TextArea
                  id="txtArea_url_link"
                  height={70}
                  value={sliderData.url_link}
                  autoResizeEnabled={false}
                  placeholder="https://ejemplo.com/pagina-destino"
                  stylingMode="outlined"
                  showClearButton
                  onValueChanged={handleInputChange("url_link")}
                />

                {sliderData.url_link && (
                  <Box mt={2} display="flex" alignItems="center" gap={1}>
                    <Chip
                      icon={<LinkIcon />}
                      label="Enlace configurado"
                      size="small"
                      variant="outlined"
                      sx={{ color: "#1e3c72", borderColor: "#1e3c72" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Se abrirá en una nueva pestaña
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Footer Info */}
          <Box
            p={2.5}
            bgcolor="#f0f4f8"
            borderRadius="10px"
            display="flex"
            gap={2}
            border="1px solid #e8ecf0"
          >
            <InfoOutlinedIcon sx={{ color: "#1e3c72" }} />
            <Box>
              <Typography variant="body2" fontWeight={600} gutterBottom color="#1e3c72">
                Sobre el banner de cabecera:
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                - Este banner aparece en las páginas: Nosotros, Galería y Contacto
                <br />
                - Se muestra en la parte superior, debajo del menú de navegación
                <br />
                - Los cambios se verán reflejados inmediatamente después de guardar
                <br />- El enlace es opcional, pero recomendado para mejorar la navegación
              </Typography>
            </Box>
          </Box>
        </ContentSection>
      </StyledPaper>
    </Box>
  );
};

export default BackgroundUploaderPage;
