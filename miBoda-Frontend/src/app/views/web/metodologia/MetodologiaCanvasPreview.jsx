import React from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import CmsStorageImage from "app/components/cms/CmsStorageImage";

/* ─── Wrapper ─────────────────────────────────────────────────────────────── */
const PreviewWrap = styled(Box)(() => ({
  borderRadius: 14,
  overflow: "hidden",
  background: "linear-gradient(135deg, #0a1128 0%, #1a2a5c 55%, #c2410c 100%)",
  position: "relative",
  padding: "28px 24px 32px",
}));

const BadgePill = styled(Box)(() => ({
  display: "inline-block",
  border: "1.5px solid rgba(255,255,255,0.55)",
  borderRadius: 20,
  padding: "4px 18px",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: "#fff",
  textTransform: "uppercase",
  backgroundColor: "rgba(255,255,255,0.08)",
  marginBottom: 10,
}));

const StepCard = styled(Box, {
  shouldForwardProp: (p) => p !== "isActive",
})(({ isActive }) => ({
  flex: "1 1 0",
  minWidth: 0,
  borderRadius: 16,
  border: isActive
    ? "2px solid #f97316"
    : "1.5px solid rgba(255,255,255,0.28)",
  backgroundColor: isActive
    ? "rgba(249,115,22,0.10)"
    : "rgba(0,0,0,0.22)",
  padding: "18px 14px 20px",
  cursor: "pointer",
  position: "relative",
  transition: "border-color 0.2s, background-color 0.2s, transform 0.18s",
  "&:hover": {
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: "translateY(-3px)",
  },
  "&:hover .pencil-btn": { opacity: 1 },
}));

const circleSx = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.30)",
  backgroundColor: "rgba(255,255,255,0.12)",
  overflow: "hidden",
  mx: "auto",
  my: 1.5,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Vista previa local (_preview) o imagen guardada con fallback de URL. */
const PasoImagen = ({ paso }) => {
  const tienePreview = Boolean(paso?._preview);
  const tieneGuardada = Boolean(paso?.url_imagen || paso?.url_imagen_publica);

  if (!tienePreview && !tieneGuardada) {
    return (
      <Box sx={circleSx}>
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.15)" }} />
      </Box>
    );
  }

  return (
    <Box sx={circleSx}>
      <CmsStorageImage
        storagePath={paso.url_imagen}
        absoluteUrl={paso.url_imagen_publica}
        previewSrc={paso._preview}
        alt=""
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </Box>
  );
};

const PASO_ZONES = ["paso1", "paso2", "paso3"];

const MetodologiaCanvasPreview = ({ preview, onZoneClick, cmsActive }) => {
  if (!preview) return null;

  const { badge_seccion, seccion_titulo, pasos = [] } = preview;

  return (
    <PreviewWrap>
      <Box
        onClick={() => onZoneClick?.("header")}
        sx={{
          textAlign: "center",
          pb: 2,
          cursor: "pointer",
          borderRadius: 2,
          position: "relative",
          transition: "background 0.18s",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
          "&:hover .pencil-btn": { opacity: 1 },
          ...(cmsActive === "header" && {
            outline: "2px solid rgba(255,255,255,0.45)",
            outlineOffset: 2,
            backgroundColor: "rgba(255,255,255,0.06)",
          }),
        }}
      >
        <BadgePill>
          {(badge_seccion || "¿Cómo trabajamos?").toUpperCase()}
        </BadgePill>
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" },
            lineHeight: 1.3,
            px: 1,
          }}
        >
          {seccion_titulo || "Así impulsamos tu negocio en 3 pasos"}
        </Typography>

        <Tooltip title="Editar encabezado" placement="left">
          <IconButton
            className="pencil-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); onZoneClick?.("header"); }}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              opacity: cmsActive === "header" ? 1 : 0,
              transition: "opacity 150ms",
              bgcolor: cmsActive === "header" ? "#f97316" : "rgba(15,23,42,0.85)",
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.4)",
              width: 28,
              height: 28,
              "&:hover": { bgcolor: "#f97316", transform: "scale(1.06)" },
            }}
          >
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
        {[0, 1, 2].map((i) => {
          const p = pasos[i] || {};
          const zoneId = PASO_ZONES[i];
          const isActive = cmsActive === zoneId;

          return (
            <StepCard
              key={zoneId}
              isActive={isActive}
              onClick={() => onZoneClick?.(zoneId)}
            >
              <Tooltip title={`Editar paso ${i + 1}`} placement="left">
                <IconButton
                  className="pencil-btn"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onZoneClick?.(zoneId); }}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 150ms",
                    bgcolor: isActive ? "#f97316" : "rgba(15,23,42,0.85)",
                    color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    width: 26,
                    height: 26,
                    "&:hover": { bgcolor: "#f97316", transform: "scale(1.06)" },
                  }}
                >
                  <EditIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.90)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textAlign: "center",
                  lineHeight: 1,
                  borderBottom: "1px solid rgba(255,255,255,0.3)",
                  pb: 0.6,
                  mb: 0.8,
                }}
              >
                {i + 1}.
              </Typography>

              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  textAlign: "center",
                  lineHeight: 1.3,
                  mb: 0.5,
                  minHeight: 34,
                }}
              >
                {p.titulo || `Paso ${i + 1}`}
              </Typography>

              <PasoImagen paso={p} />

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "0.72rem",
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {p.descripcion || ""}
              </Typography>
            </StepCard>
          );
        })}
      </Box>
    </PreviewWrap>
  );
};

export default MetodologiaCanvasPreview;
