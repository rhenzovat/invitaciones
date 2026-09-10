import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { listar, actualizar, crear, eliminar } from "../../../api/web_slider.api";
import SliderEditPage, { sliderImageUrl } from "./SliderEditPage";
import { handleErrorMessages, handleSuccessMessages } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";
import SliderCmsPanel from "./SliderCmsPanel";
import SliderAutoplaySettings from "./SliderAutoplaySettings";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import CollectionsIcon from "@mui/icons-material/Collections";
import AddIcon from "@mui/icons-material/Add";

// ─── Strip HTML for plain-text slider fields ──────────────────────────────────
const stripHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};

// ─── Contenedor principal con push cuando el panel está abierto ──────────────
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#f0f4f8",
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  marginBottom: theme.spacing(2),
  borderRadius: "14px",
  background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  boxShadow: "0 6px 25px rgba(44,26,14,0.35)",
}));

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

const HeaderIconWrapper = styled(Box)({
  width: "46px",
  height: "46px",
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

const StatsChip = styled(Chip)({
  backgroundColor: "rgba(204,107,142,0.25)",
  color: "#f5c6d8",
  fontWeight: 700,
  fontSize: "12px",
  height: "30px",
  border: "1px solid rgba(204,107,142,0.4)",
  "& .MuiChip-icon": {
    color: "#f5c6d8",
    fontSize: "18px",
  },
});

// ─────────────────────────────────────────────────────────────────────────────

const SliderIndexPage = (props) => {
  const { accessButton }              = UseAccesosObjetos();
  const { panelLeft } = useCmsPanelLayout();
  const { setLoading }                = props;
  const intl                          = useIntl();

  const [sliders,       setSliders]       = useState([]);
  // ── Estado del panel CMS ──────────────────────────────────────────────────
  const [panelSliderId, setPanelSliderId] = useState(null);   // id del slider activo
  const [panelSection,  setPanelSection]  = useState(null);   // "contenido" | "boton"
  const [panelData,     setPanelData]     = useState({});     // campos editables
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [creating,      setCreating]      = useState(false);

  const titulo = intl.formatMessage({ id: "COMMON.TITLE.SLIDER" });

  // ── Funciones del panel ───────────────────────────────────────────────────
  const openCmsPanel = (sliderItem, section) => {
    const storedImageUrl = sliderImageUrl(sliderItem);
    // Strip any legacy HTML that may have been saved previously
    setPanelData({
      ...sliderItem,
      titulo:      stripHtml(sliderItem.titulo),
      subtitulo:   stripHtml(sliderItem.subtitulo),
      descripcion: stripHtml(sliderItem.descripcion),
      texto_boton: stripHtml(sliderItem.texto_boton),
      storedImageUrl,
      localImage: null,
      previewUrl: null,
    });
    setPanelSliderId(sliderItem.id_slider);
    setPanelSection(section);
  };

  const closeCmsPanel = () => {
    setPanelSliderId(null);
    setPanelSection(null);
    setPanelData({});
  };

  const handlePanelChange = (field, value) => {
    setPanelData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePanelSave = async () => {
    const ok = await actualizarSlider({
      id_slider:   panelData.id_slider,
      subtitulo:   stripHtml(panelData.subtitulo),
      titulo:      stripHtml(panelData.titulo),
      descripcion: stripHtml(panelData.descripcion),
      texto_boton: stripHtml(panelData.texto_boton),
      url_link:    panelData.url_link,
      urlFileTem:  panelData.localImage || null,
      Activo:      "S",
    });
    if (ok) closeCmsPanel();
  };

  // ── API ───────────────────────────────────────────────────────────────────
  async function actualizarSlider(dataRow) {
    setLoading(true);
    const { id_slider, subtitulo, titulo, descripcion, texto_boton, urlFileTem, Activo, url_link } = dataRow;

    const formData = new FormData();
    formData.append("id_slider",   id_slider);
    formData.append("subtitulo",   stripHtml(subtitulo   ?? ""));
    formData.append("titulo",      stripHtml(titulo      ?? ""));
    formData.append("descripcion", stripHtml(descripcion ?? ""));
    formData.append("texto_boton", texto_boton ?? "");
    formData.append("url_link",    url_link    ?? "");
    formData.append("Activo",      Activo      ?? "S");
    if (urlFileTem) formData.append("image", urlFileTem);

    try {
      await actualizar(formData);
      handleSuccessMessages(
        "Información",
        intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" })
      );
      await obtenerSliders();
      return true;
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function obtenerSliders() {
    setLoading(true);
    try {
      const response = await listar();
      // Strip any legacy HTML from text fields before setting state
      const cleaned = response
        .filter((item) => item.id_slider !== 4)
        .map((item) => ({
          ...item,
          titulo:      stripHtml(item.titulo),
          subtitulo:   stripHtml(item.subtitulo),
          descripcion: stripHtml(item.descripcion),
          texto_boton: stripHtml(item.texto_boton),
        }));
      setSliders(cleaned);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  }

  const handleCrearSlider = async () => {
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("titulo", "Nuevo slide");
      fd.append("subtitulo", "");
      fd.append("descripcion", "Describe tu promoción aquí");
      fd.append("texto_boton", "Me interesa");
      fd.append("url_link", "#");
      const created = await crear(fd);
      handleSuccessMessages("Información", "Slide creado. Edítalo y sube una imagen.");
      await obtenerSliders();
      if (created?.id_slider) {
        const item = { ...created, id_slider: created.id_slider };
        openCmsPanel(item, "contenido");
      }
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setCreating(false);
    }
  };

  const handleEliminarSlider = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await eliminar({ id_slider: confirmDelete.id_slider });
      handleSuccessMessages("Información", "Slide eliminado");
      setConfirmDelete(null);
      closeCmsPanel();
      await obtenerSliders();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerSliders();
  }, []);

  const panelOpen = !!panelSliderId;
  useCmsPanelPush(panelOpen);

  // Título del slider activo para mostrar en el panel
  const activePanelTitulo = panelSliderId
    ? `Slider ${sliders.findIndex((s) => s.id_slider === panelSliderId) + 1}`
    : "";

  return (
    <>
      {/* ══ Panel CMS deslizante ════════════════════════════════════════ */}
      <SliderCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        section={panelSection}
        sliderTitulo={activePanelTitulo}
        datos={panelData}
        onChange={handlePanelChange}
        onSave={handlePanelSave}
        onClose={closeCmsPanel}
      />

      <PageContainer>

        {/* Header */}
        <HeaderCard elevation={0}>
          <HeaderLeft>
            <HeaderIconWrapper>
              <CollectionsIcon />
            </HeaderIconWrapper>
            <Box>
              <Typography variant="h6" fontWeight={700}>{titulo}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Carrusel del inicio — cada slide puede tener enlace al hacer clic
              </Typography>
            </Box>
          </HeaderLeft>
          <StatsChip icon={<ViewCarouselIcon />} label={`${sliders.filter((s) => (s.Activo ?? "S") === "S").length} activos`} size="small" />
        </HeaderCard>

        <SliderAutoplaySettings />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.68rem" }}>
            Sliders del carrusel ({sliders.length})
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            disabled={creating}
            onClick={handleCrearSlider}
            sx={{
              background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
              textTransform: "none", fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(204,107,142,0.35)",
              "&:hover": { background: "linear-gradient(135deg,#a0455e,#7a2a3e)" },
            }}
          >
            Nuevo slider
          </Button>
        </Box>

        <Box>
          {sliders.length > 0 ? (
            <Box>
              <Grid container spacing={2}>
                {sliders.map((item, index) => {
                  const isActive    = item.id_slider === panelSliderId;
                  const liveSlide   = isActive ? panelData : undefined;
                  const liveImgUrl  = isActive
                    ? (panelData.previewUrl || panelData.storedImageUrl)
                    : sliderImageUrl(item);

                  return (
                    <Grid item xs={12} lg={6} key={item.id_slider}>
                      <SliderEditPage
                        dataRowEditNew={item}
                        titulo={`Slider ${index + 1}`}
                        accessButton={accessButton}
                        onZoneClick={openCmsPanel}
                        cmsActive={isActive ? panelSection : null}
                        liveSlide={liveSlide}
                        liveImageUrl={liveImgUrl}
                        onDelete={setConfirmDelete}
                        canDelete={sliders.length > 1}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No hay sliders disponibles para mostrar.
            </Alert>
          )}
        </Box>

      </PageContainer>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>¿Eliminar este slide?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleEliminarSlider}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default injectIntl(WithLoandingPanel(SliderIndexPage));
