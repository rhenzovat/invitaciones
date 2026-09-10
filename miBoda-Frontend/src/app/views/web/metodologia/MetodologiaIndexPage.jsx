import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, IconButton, Tooltip,
  CircularProgress, Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";

import MetodologiaCanvasPreview from "./MetodologiaCanvasPreview";
import MetodologiaCmsPanel from "./MetodologiaCmsPanel";
import { listar, actualizar } from "../../../api/web_metodologia.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const PageBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(2),
  borderRadius: "12px",
  background: "linear-gradient(135deg, #0a1128 0%, #c2410c 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  boxShadow: "0 6px 24px rgba(10,17,40,0.35)",
}));

function normalizedFromCards(cards) {
  const sorted = [...cards].sort((a, b) => Number(a.paso) - Number(b.paso));
  if (!sorted.length) return null;
  const f = sorted[0];
  return {
    badge_seccion: f.badge_seccion || "",
    seccion_titulo: f.seccion_titulo || "",
    pasos: sorted.map((c) => ({
      id_metodologia: c.id_metodologia,
      paso: c.paso,
      titulo: c.titulo || "",
      descripcion: c.descripcion || "",
      url_imagen: c.url_imagen || "",
      url_imagen_publica: c.url_imagen_publica || null,
      _imageFile: null,
      _preview: null,
    })),
  };
}

const MetodologiaIndexPage = ({ setLoading }) => {
  const { panelLeft } = useCmsPanelLayout();
  const [cards, setCards] = useState([]);
  const [booting, setBooting] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelData, setPanelData] = useState(null);
  const [panelSection, setPanelSection] = useState("header");
  const [cmsActiveZone, setCmsActiveZone] = useState(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listar();
      setCards(data || []);
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }, [setLoading]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const openPanel = useCallback((section = "header") => {
    const n = normalizedFromCards(cards);
    setPanelData(n ? JSON.parse(JSON.stringify(n)) : null);
    setPanelSection(section);
    setCmsActiveZone(section);
    setPanelOpen(true);
  }, [cards]);

  const closePanel = () => {
    setPanelOpen(false);
    setCmsActiveZone(null);
  };

  const handleChange = (field, value) =>
    setPanelData((prev) => ({ ...prev, [field]: value }));

  const handleChangePaso = (idx, key, value) => {
    if (key === "_clearImage") {
      setPanelData((prev) => {
        const pasos = [...prev.pasos];
        const n = Math.max(1, Math.min(3, Number(pasos[idx]?.paso) || idx + 1));
        pasos[idx] = {
          ...pasos[idx],
          _imageFile: null,
          _preview: null,
          _removeImage: true,
          url_imagen: `temp02/assets/img/works-icon-${n}.png`,
        };
        return { ...prev, pasos };
      });
      return;
    }
    if (key === "_imageFile" && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPanelData((prev) => {
          const pasos = [...prev.pasos];
          pasos[idx] = {
            ...pasos[idx],
            _imageFile: value,
            _preview: e.target.result,
            _removeImage: false,
          };
          return { ...prev, pasos };
        });
      };
      reader.readAsDataURL(value);
      return;
    }
    setPanelData((prev) => {
      const pasos = [...prev.pasos];
      pasos[idx] = { ...pasos[idx], [key]: value };
      if (key === "_imageFile" && value === null) pasos[idx]._preview = null;
      return { ...prev, pasos };
    });
  };

  const handlePanelSave = async () => {
    if (!panelData?.pasos?.length) return;
    setLoading(true);
    try {
      const saveOne = async (idx) => {
        const p = panelData.pasos[idx];
        const fd = new FormData();
        fd.append("id_metodologia", p.id_metodologia);
        fd.append("badge_seccion",  panelData.badge_seccion || "");
        fd.append("seccion_titulo", panelData.seccion_titulo || "");
        fd.append("titulo",         (p.titulo && p.titulo.trim()) || "-");
        fd.append("descripcion",    p.descripcion || "");
        if (p._removeImage) fd.append("remove_image", "1");
        if (p._imageFile)   fd.append("image", p._imageFile);
        const saved = await actualizar(fd);
        if (saved?.url_imagen) {
          setPanelData((prev) => {
            if (!prev?.pasos) return prev;
            const pasos = [...prev.pasos];
            pasos[idx] = {
              ...pasos[idx],
              url_imagen:   saved.url_imagen,
              _imageFile:   null,
              _preview:     null,
              _removeImage: false,
            };
            return { ...prev, pasos };
          });
        }
      };

      if (panelSection === "header") {
        for (let i = 0; i < panelData.pasos.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          await saveOne(i);
        }
        toastSuccess("Encabezado guardado. Recarga la landing (Ctrl+F5) para ver los cambios.");
      } else {
        const m = panelSection.match(/^paso(\d)$/);
        if (m) {
          const idx = parseInt(m[1], 10) - 1;
          await saveOne(idx);
          toastSuccess(`Paso ${idx + 1} guardado. Recarga la landing (Ctrl+F5) para ver los cambios.`);
        }
      }
      await cargarDatos();
      const refreshed = normalizedFromCards(await listar());
      if (refreshed) setPanelData(JSON.parse(JSON.stringify(refreshed)));
      closePanel();
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const onZoneClick = (zoneId) => {
    setCmsActiveZone(zoneId);
    if (panelOpen) {
      setPanelSection(zoneId);
    } else {
      openPanel(zoneId);
    }
  };

  const previewSource = panelOpen && panelData
    ? panelData
    : normalizedFromCards(cards);

  if (booting && !cards.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "#f97316" }} />
      </Box>
    );
  }

  return (
    <>
      <MetodologiaCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        datos={panelData}
        onChange={handleChange}
        onChangePaso={handleChangePaso}
        onSave={handlePanelSave}
        onClose={closePanel}
        scrollTo={panelSection}
      />

      <PageBox>

        {/* Page title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #0a1128, #c2410c)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FilterListIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#0f172a", lineHeight: 1 }}>
              Metodología
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Sección "¿Cómo trabajamos?" del landing
            </Typography>
          </Box>
        </Box>

        {/* Header banner */}
        <HeaderCard elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                ¿Cómo trabajamos?
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", opacity: 0.75 }}>
                Sección en landing · {cards.length} pasos
              </Typography>
            </Box>
            <Chip
              label="Activo"
              size="small"
              sx={{ bgcolor: "rgba(34,197,94,0.25)", color: "#86efac", height: 22, fontSize: "0.62rem", fontWeight: 700 }}
            />
          </Box>
          <Tooltip title="Editar encabezado">
            <IconButton
              size="small"
              onClick={() => panelOpen ? (setPanelSection("header"), setCmsActiveZone("header")) : openPanel("header")}
              sx={{
                color: "#fff", width: 32, height: 32,
                bgcolor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                "&:hover": { bgcolor: "#f97316" },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </HeaderCard>

        {/* Help text */}
        <Typography variant="caption" sx={{
          display: "block", mb: 1.5, color: "#64748b",
          fontWeight: 600, fontSize: "0.68rem",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          Haz clic en cualquier zona del preview para editarla
        </Typography>

        {/* Preview */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {previewSource ? (
            <MetodologiaCanvasPreview
              preview={previewSource}
              onZoneClick={onZoneClick}
              cmsActive={cmsActiveZone}
            />
          ) : (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No hay datos. Verifica la base de datos.
              </Typography>
            </Box>
          )}
        </Paper>

      </PageBox>
    </>
  );
};

export default WithLoandingPanel(MetodologiaIndexPage, { initialLoading: false });
