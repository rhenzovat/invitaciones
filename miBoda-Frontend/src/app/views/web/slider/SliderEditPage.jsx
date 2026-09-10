import React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { authJWTConfig } from "app/authJWTConfig";
import HeroSlideCanvasPreview from "./HeroSlideCanvasPreview";

export const DomainBackend = authJWTConfig.domain + "/";

/** URL pública de la imagen del slider (API devuelve url_imagen_publica con asset()). */
export const sliderImageUrl = (item) => {
  if (!item) return null;
  if (item.url_imagen_publica) return item.url_imagen_publica;
  if (!item.url_imagen) return null;
  return DomainBackend + String(item.url_imagen).replace(/^\//, "");
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: "1px solid rgba(204,107,142,0.2)",
  transition: "box-shadow 0.3s ease, transform 0.2s ease",
  height: "100%",
  overflow: "hidden",
  "&:hover": {
    boxShadow: "0 8px 32px rgba(204,107,142,0.18)",
    transform: "translateY(-2px)",
  },
}));

const CardHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "8px",
  padding: "0.8rem 1.25rem",
  borderBottom: "1px solid rgba(204,107,142,0.15)",
  background: "linear-gradient(135deg,rgba(253,248,245,1),rgba(248,240,235,1))",
}));

const SliderEditPage = ({
  dataRowEditNew,
  titulo,
  onZoneClick,
  cmsActive,
  liveSlide,
  liveImageUrl,
  onDelete,
  canDelete = true,
}) => {
  const slide = liveSlide || dataRowEditNew;
  const imageUrl = liveImageUrl !== undefined
    ? liveImageUrl
    : sliderImageUrl(dataRowEditNew);
  const slideUrl = String(slide?.url_link ?? "").trim();
  const hasLink = slideUrl !== "" && slideUrl !== "#";

  return (
    <StyledCard elevation={1}>
      <CardHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Chip label={`#${dataRowEditNew?.id_slider}`} size="small" color="primary" variant="outlined" />
          <Typography variant="subtitle1" fontWeight={600}>{titulo}</Typography>
          {(dataRowEditNew?.Activo ?? "S") === "N" && (
            <Chip label="Inactivo" size="small" color="default" />
          )}
        </Box>
      </CardHeader>

      <CardContent sx={{ p: "1.25rem !important" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon sx={{ fontSize: 14 }} />}
            onClick={() => onZoneClick?.(dataRowEditNew, "contenido")}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
              borderColor: "#cc6b8e", color: "#cc6b8e", borderRadius: "8px",
              "&:hover": { borderColor: "#a0455e", color: "#a0455e", bgcolor: "rgba(204,107,142,0.06)" },
            }}
          >
            ✏ Imagen & Texto
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<LinkIcon sx={{ fontSize: 14 }} />}
            onClick={() => onZoneClick?.(dataRowEditNew, "boton")}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
              borderColor: "#b8860b", color: "#b8860b", borderRadius: "8px",
              "&:hover": { borderColor: "#8b6508", color: "#8b6508", bgcolor: "rgba(184,134,11,0.06)" },
            }}
          >
            🔗 Botón & Enlace
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
            onClick={() => onZoneClick?.(dataRowEditNew, "contenido")}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
              background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(204,107,142,0.3)",
              "&:hover": { background: "linear-gradient(135deg,#a0455e,#7a2a3e)" },
            }}
          >
            Subir imagen
          </Button>
          {canDelete && onDelete && (
            <Tooltip title="Eliminar slide">
              <IconButton size="small" onClick={() => onDelete(dataRowEditNew)}
                sx={{ color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {hasLink ? (
          <Chip
            icon={<LinkIcon sx={{ fontSize: "16px !important" }} />}
            label={slideUrl.length > 48 ? `${slideUrl.slice(0, 45)}…` : slideUrl}
            size="small"
            color="success"
            variant="outlined"
            onClick={() => onZoneClick?.(dataRowEditNew, "boton")}
            sx={{ mb: 1.5, maxWidth: "100%", cursor: "pointer", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
          />
        ) : (
          <Typography variant="caption" sx={{ display: "block", color: "#d97706", mb: 1.5 }}>
            Sin enlace — usa «Enlace y botón» para que el slide sea clicable.
          </Typography>
        )}

        <Typography variant="caption" sx={{ display: "block", color: "#64748b", mb: 1 }}>
          También puedes hacer clic en el canvas para editar zonas concretas.
        </Typography>

        <HeroSlideCanvasPreview
          imageUrl={imageUrl}
          slide={slide}
          onZoneClick={(section) => onZoneClick?.(dataRowEditNew, section)}
          cmsActive={cmsActive}
        />
      </CardContent>
    </StyledCard>
  );
};

export default SliderEditPage;
