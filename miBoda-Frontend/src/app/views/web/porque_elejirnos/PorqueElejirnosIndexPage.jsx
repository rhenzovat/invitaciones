import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button, Grid, IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditIcon        from "@mui/icons-material/Edit";
import CheckIcon       from "@mui/icons-material/Check";

import { obtener, actualizar } from "../../../api/web_porque_elejirnos.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import PorqueElejirnosCmsPanel from "./PorqueElejirnosCmsPanel";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import { cmsPublicImageUrlCandidates } from "../../../utils/utils";

const PageBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
}));

const HeaderBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.8, 1.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: "10px",
  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 3px 12px rgba(124,58,237,0.25)",
}));

/* ── Placeholder de imagen ─────────────────────────────────────── */
const ImgPlaceholder = ({ label, sx = {} }) => (
  <Box sx={{
    width: "100%", height: "100%", minHeight: 180,
    bgcolor: "#f1f5f9", borderRadius: "12px",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    border: "2px dashed #cbd5e1", color: "#94a3b8",
    fontSize: "0.72rem", gap: 0.5, ...sx,
  }}>
    <Box sx={{ fontSize: "2rem", opacity: 0.3 }}>🖼</Box>
    {label}
  </Box>
);

/* ── Lápiz de edición por bloque ───────────────────────────────── */
const Pencil = ({ onClick, tip = "Editar" }) => (
  <Tooltip title={tip} placement="top">
    <IconButton onClick={onClick} size="small"
      sx={{
        position: "absolute", top: 6, right: 6, zIndex: 10,
        bgcolor: "#7c3aed", color: "#fff", width: 24, height: 24,
        boxShadow: "0 2px 6px rgba(124,58,237,0.35)",
        "&:hover": { bgcolor: "#6d28d9" },
      }}
    >
      <EditIcon sx={{ fontSize: 13 }} />
    </IconButton>
  </Tooltip>
);

/* ── Preview de la sección ─────────────────────────────────────── */
const tieneImagen = (datos, previewKey, pathKey, publicKey) =>
  Boolean(datos?.[previewKey])
  || Boolean(datos?.[pathKey])
  || Boolean(datos?.[publicKey]);

const SectionPreview = ({ datos, onEdit }) => {
  const beneficios = Array.isArray(datos?.beneficios) ? datos.beneficios : [];
  const showIzq = tieneImagen(
    datos, "_previewIzq", "url_imagen_izquierda", "url_imagen_izquierda_publica"
  );
  const showCentro = tieneImagen(
    datos, "_previewCentro", "url_imagen_centro", "url_imagen_centro_publica"
  );

  return (
    <Box sx={{ bgcolor: "#fff" }}>

      {/* ── Encabezado de texto ── */}
      <Box sx={{ position: "relative", textAlign: "center", pt: 3, pb: 2, px: 3 }}>
        <Pencil onClick={() => onEdit("header")} tip="Editar encabezado" />
        <Box sx={{
          display: "inline-block",
          border: "1.5px solid #d1d5db", borderRadius: "50px",
          px: 2.5, py: 0.6, mb: 1.5,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "#374151",
        }}>
          {datos?.badge_texto || "¿POR QUÉ ELEGIR royalsensorymassage?"}
        </Box>
        <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.2, mb: 1.2, color: "#111827" }}>
          {datos?.titulo || "Detrás de cada negocio exitoso hay una gran estrategia digital"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 620, mx: "auto", fontSize: "0.83rem", lineHeight: 1.6 }}>
          {datos?.descripcion || ""}
        </Typography>
      </Box>

      {/* ── Grid principal ── */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={2} alignItems="stretch">

          {/* Col 1 — imagen izquierda + beneficios */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>

              {/* Imagen izquierda */}
              <Box sx={{ position: "relative" }}>
                <Pencil onClick={() => onEdit("imagen_izq")} tip="Editar imagen izquierda" />
                {showIzq ? (
                  <CmsStorageImage
                    storagePath={datos?.url_imagen_izquierda}
                    absoluteUrl={datos?.url_imagen_izquierda_publica}
                    previewSrc={datos?._previewIzq}
                    alt="Equipo"
                    sx={{
                      width: "100%", objectFit: "cover", borderRadius: "12px",
                      minHeight: 160, display: "block",
                    }}
                  />
                ) : (
                  <ImgPlaceholder label="Imagen izquierda (equipo)" sx={{ minHeight: 160 }} />
                )}
              </Box>

              {/* Beneficios */}
              <Box sx={{ position: "relative", pl: 0.5 }}>
                <Pencil onClick={() => onEdit("beneficios")} tip="Editar beneficios" />
                {beneficios.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, pr: 3 }}>
                    {beneficios.map((item, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <CheckIcon sx={{ color: "#16a34a", fontSize: 17, mt: "1px", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontSize: "0.84rem", color: "#374151", lineHeight: 1.4 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                    Sin beneficios aún
                  </Typography>
                )}
              </Box>

            </Box>
          </Grid>

          {/* Col 2 — imagen centro */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: "relative", height: "100%" }}>
              <Pencil onClick={() => onEdit("imagen_centro")} tip="Editar imagen centro" />
              {showCentro ? (
                <CmsStorageImage
                  storagePath={datos?.url_imagen_centro}
                  absoluteUrl={datos?.url_imagen_centro_publica}
                  previewSrc={datos?._previewCentro}
                  alt="Principal"
                  sx={{
                    width: "100%", height: "100%", minHeight: 260,
                    objectFit: "cover", borderRadius: "12px", display: "block",
                  }}
                />
              ) : (
                <ImgPlaceholder label="Imagen centro (principal)" sx={{ minHeight: 260 }} />
              )}
            </Box>
          </Grid>

          {/* Col 3 — estadísticas */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 1.5, height: "100%", justifyContent: "center" }}>
              <Pencil onClick={() => onEdit("stats")} tip="Editar estadísticas" />
              {[1, 2, 3].map((n) => (
                <Box key={n} sx={{ borderBottom: n < 3 ? "1px solid #e5e7eb" : "none", pb: n < 3 ? 1.5 : 0 }}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.3, mb: 0.4 }}>
                    <Typography sx={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, color: "#111827" }}>
                      {datos?.[`stat${n}_numero`] ?? "—"}
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#6d28d9" }}>
                      {datos?.[`stat${n}_sufijo`] ?? ""}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: "0.76rem", color: "#6b7280", lineHeight: 1.4 }}>
                    {datos?.[`stat${n}_texto`] ?? ""}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

/* ── Página ────────────────────────────────────────────────────── */
const PorqueElejirnosIndexPage = (props) => {
  const { setLoading }               = props;
  const intl                         = useIntl();
  const { panelLeft } = useCmsPanelLayout();

  const [datos,       setDatos]       = useState(null);
  const [panelOpen,   setPanelOpen]   = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelData,   setPanelData]   = useState({});
  const [panelScroll, setPanelScroll] = useState("header");

  const openPanel = (section = "header") => {
    setPanelData({ ...datos });
    setPanelScroll(section);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleChange = (field, value) =>
    setPanelData((prev) => ({ ...prev, [field]: value }));

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtener();
      setDatos(data || {});
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Imágenes opcionales
      if (panelData._imgIzquierda) formData.append("image_izquierda", panelData._imgIzquierda);
      if (panelData._imgCentro)    formData.append("image_centro",    panelData._imgCentro);

      // Campos de texto
      formData.append("badge_texto",  panelData.badge_texto  || "");
      formData.append("titulo",       panelData.titulo       || "");
      formData.append("descripcion",  panelData.descripcion  || "");
      formData.append("beneficios",   JSON.stringify(Array.isArray(panelData.beneficios) ? panelData.beneficios : []));

      [1, 2, 3].forEach((n) => {
        formData.append(`stat${n}_numero`, parseInt(panelData[`stat${n}_numero`]) || 0);
        formData.append(`stat${n}_sufijo`, panelData[`stat${n}_sufijo`] || "");
        formData.append(`stat${n}_texto`,  panelData[`stat${n}_texto`]  || "");
      });

      const saved = await actualizar(formData);
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      setDatos(saved);
      closePanel();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <>
      <PorqueElejirnosCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        datos={panelData}
        onChange={handleChange}
        onSave={handleSave}
        onClose={closePanel}
        scrollTo={panelScroll}
      />

      <PageBox>

        {/* Header compacto */}
        <HeaderBar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HelpOutlineIcon sx={{ fontSize: 16, opacity: 0.85 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.01em" }}>
              ¿Por qué elegirnos?
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.65, ml: 0.5 }}>
              · Sección "about"
            </Typography>
          </Box>
          <Tooltip title="Editar contenido" placement="left">
            <IconButton size="small" onClick={openPanel}
              sx={{ color: "#fff", width: 28, height: 28, bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </HeaderBar>

        {/* Preview a ancho completo */}
        <Paper elevation={0} sx={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0", width: "100%" }}>
          {datos ? (
            <SectionPreview datos={panelOpen ? panelData : datos} onEdit={openPanel} />
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">Cargando datos...</Typography>
            </Box>
          )}
        </Paper>

      </PageBox>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PorqueElejirnosIndexPage));
