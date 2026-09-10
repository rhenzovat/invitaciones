import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Tooltip, CircularProgress, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import EditIcon        from "@mui/icons-material/Edit";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { listar, actualizar } from "../../../api/web_servicios.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import { authJWTConfig } from "app/authJWTConfig";
import ServiciosCmsPanel from "./ServiciosCmsPanel";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const DomainBackend = authJWTConfig.domain + "/";

/* Todas las tarjetas con degradado verde */
const CARD_STYLES = [
  {
    bg: "linear-gradient(145deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)",
    titleColor: "#14532d", descColor: "#166534", borderColor: "#86efac",
  },
  {
    bg: "linear-gradient(145deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)",
    titleColor: "#14532d", descColor: "#166534", borderColor: "#86efac",
  },
  {
    bg: "linear-gradient(145deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)",
    titleColor: "#14532d", descColor: "#166534", borderColor: "#86efac",
  },
  {
    bg: "linear-gradient(145deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)",
    titleColor: "#14532d", descColor: "#166534", borderColor: "#86efac",
  },
];

const PageBox = styled(Box)({
  padding: 16, minHeight: "100vh", backgroundColor: "#f0f4f8",
});

const HeaderBar = styled(Box)(() => ({
  padding: "7px 14px", marginBottom: 12, borderRadius: 10,
  background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
  boxShadow: "0 3px 12px rgba(29,78,216,0.25)",
}));

/* ── Lápiz de edición ────────────────────────────────────────────── */
const Pencil = ({ onClick, tip = "Editar", dark = false }) => (
  <Tooltip title={tip} placement="top">
    <IconButton onClick={onClick} size="small"
      sx={{
        position: "absolute", top: 8, right: 8, zIndex: 20,
        bgcolor: dark ? "rgba(0,0,0,0.55)" : "#1d4ed8",
        color: "#fff", width: 26, height: 26,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        "&:hover": { bgcolor: dark ? "rgba(0,0,0,0.75)" : "#1e40af" },
        backdropFilter: "blur(4px)",
      }}
    >
      <EditIcon sx={{ fontSize: 13 }} />
    </IconButton>
  </Tooltip>
);

/* ── Slot de foto decorativa (ahora muestra imagen real) ─────────── */
const PhotoSlot = ({ src, label, minH = 280 }) => (
  <Box sx={{
    width: "100%", height: "100%", minHeight: minH,
    borderRadius: "16px", overflow: "hidden",
    bgcolor: "#e8edf2", position: "relative",
    flexShrink: 0,
  }}>
    {src ? (
      <Box component="img" src={src} alt={label}
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    ) : (
      <Box sx={{
        width: "100%", height: "100%", minHeight: minH,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: "#94a3b8", gap: 1,
        background: "linear-gradient(135deg, #e8edf2 0%, #dde4ec 100%)",
      }}>
        <ImageOutlinedIcon sx={{ fontSize: 44, opacity: 0.3 }} />
        <Typography sx={{ fontSize: "0.70rem", opacity: 0.5, letterSpacing: "0.04em" }}>
          {label}
        </Typography>
      </Box>
    )}
  </Box>
);

/* ── Tarjeta de servicio ─────────────────────────────────────────── */
const ServiceCard = ({ card, cardStyle, onEdit, minH = 280 }) => {
  const iconSrc = card.url_icono ? `${DomainBackend}${card.url_icono}` : null;

  return (
    <Box sx={{
      position: "relative", height: "100%", minHeight: minH,
      borderRadius: "16px", overflow: "hidden",
      background: cardStyle.bg,
      border: `1px solid ${cardStyle.borderColor}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
      p: 2.5,
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.12)", transform: "translateY(-2px)" },
    }}>
      <Pencil onClick={onEdit} tip={`Editar — ${card.titulo || "Servicio"}`} />

      <Typography sx={{
        fontSize: "1.05rem", fontWeight: 800,
        color: cardStyle.titleColor,
        lineHeight: 1.25, mb: 1.2, pr: 3,
      }}>
        {card.titulo || ""}
      </Typography>

      <Typography variant="body2" sx={{
        color: cardStyle.descColor,
        fontSize: "0.82rem", lineHeight: 1.65, flex: 1,
      }}>
        {card.descripcion || ""}
      </Typography>

      <Box sx={{ mt: "auto", pt: 2, position: "relative", width: 60, height: 60 }}>
        <Box sx={{
          position: "absolute", bottom: 0, left: 0,
          width: 42, height: 42,
          bgcolor: "#fed7aa", borderRadius: "50%",
          opacity: 0.85,
        }} />
        {iconSrc ? (
          <Box component="img" src={iconSrc} alt={card.titulo}
            sx={{
              position: "absolute", bottom: 5, left: 5,
              width: 38, height: 38, objectFit: "contain",
            }} />
        ) : (
          <ImageOutlinedIcon sx={{
            position: "absolute", bottom: 5, left: 5,
            fontSize: 34, color: "#d97706", opacity: 0.45,
          }} />
        )}
      </Box>
    </Box>
  );
};

/* ── Calcula URL de foto para preview (acepta _previewFoto) ───────── */
const fotoUrl = (card) => {
  if (!card) return null;
  if (card._previewFoto) return card._previewFoto;
  if (card.url_foto) return `${DomainBackend}${card.url_foto}`;
  return null;
};

/* ── Preview bento-grid ──────────────────────────────────────────── */
const SectionPreview = ({ cards, seccionTitulo, onEdit }) => {
  const [c1, c2, c3, c4] = cards;

  return (
    <Box sx={{ bgcolor: "#fff", p: { xs: 2, md: 3.5 } }}>

      <Box sx={{ mb: 3, position: "relative" }}>
        <Pencil onClick={() => onEdit("header")} tip="Editar título de sección" />
        <Box sx={{
          display: "inline-block",
          border: "1.5px solid #111827", borderRadius: "50px",
          px: 2.5, py: 0.6, mb: 1.5,
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.08em", color: "#111827",
        }}>
          Nuestros Servicios
        </Box>
        <Typography sx={{
          fontSize: { xs: "1.6rem", md: "2.2rem" },
          fontWeight: 900, color: "#111827",
          lineHeight: 1.15, maxWidth: 700,
        }}>
          {seccionTitulo || "Todo lo que tu marca necesita para vender en redes sociales"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Fila 1 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "5fr 4fr 3fr", gap: 2 }}>
          <Box sx={{ minHeight: 280, position: "relative" }}>
            <PhotoSlot src={fotoUrl(c1)} label="Foto servicio 1" minH={280} />
            {c1 && (
              <Tooltip title={`Editar foto — ${c1.titulo || "Servicio 1"}`} placement="top">
                <IconButton
                  onClick={() => onEdit(c1.id_servicio, "foto")}
                  size="small"
                  sx={{
                    position: "absolute", top: 8, right: 8, zIndex: 20,
                    bgcolor: "rgba(0,0,0,0.55)", color: "#fff", width: 26, height: 26,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <EditIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ minHeight: 280 }}>
            {c1 && (
              <ServiceCard card={c1} cardStyle={CARD_STYLES[0]}
                onEdit={() => onEdit(c1.id_servicio)} minH={280} />
            )}
          </Box>
          <Box sx={{ minHeight: 280 }}>
            {c2 && (
              <ServiceCard card={c2} cardStyle={CARD_STYLES[1]}
                onEdit={() => onEdit(c2.id_servicio)} minH={280} />
            )}
          </Box>
        </Box>

        {/* Fila 2 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "3fr 5fr 4fr", gap: 2 }}>
          <Box sx={{ minHeight: 280 }}>
            {c3 && (
              <ServiceCard card={c3} cardStyle={CARD_STYLES[2]}
                onEdit={() => onEdit(c3.id_servicio)} minH={280} />
            )}
          </Box>
          <Box sx={{ minHeight: 280, position: "relative" }}>
            <PhotoSlot src={fotoUrl(c4)} label="Foto servicio 4" minH={280} />
            {c4 && (
              <Tooltip title={`Editar foto — ${c4.titulo || "Servicio 4"}`} placement="top">
                <IconButton
                  onClick={() => onEdit(c4.id_servicio, "foto")}
                  size="small"
                  sx={{
                    position: "absolute", top: 8, right: 8, zIndex: 20,
                    bgcolor: "rgba(0,0,0,0.55)", color: "#fff", width: 26, height: 26,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <EditIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ minHeight: 280 }}>
            {c4 && (
              <ServiceCard card={c4} cardStyle={CARD_STYLES[3]}
                onEdit={() => onEdit(c4.id_servicio)} minH={280} />
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

/* ── Página ─────────────────────────────────────────────────────── */
const ServiciosIndexPage = () => {
  const { panelLeft } = useCmsPanelLayout();

  const [cards,   setCards]   = useState([]);
  const [loading, setLoading] = useState(true);

  const [panelOpen,        setPanelOpen]        = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelSection,     setPanelSection]      = useState("header");
  const [panelFotoMode,    setPanelFotoMode]     = useState(false);
  const [editCard,         setEditCard]          = useState(null);
  const [editFile,         setEditFile]          = useState(null);
  const [editPreview,      setEditPreview]       = useState(null);
  const [editFotoFile,     setEditFotoFile]      = useState(null);
  const [editFotoPreview,  setEditFotoPreview]   = useState(null);
  const [seccionTitulo,    setSeccionTitulo]     = useState("");
  const [saving,           setSaving]            = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setCards(data || []);
      if (data?.length > 0) setSeccionTitulo(data[0].seccion_titulo || "");
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const openPanel = (section, mode = "card") => {
    setPanelSection(section);
    setPanelFotoMode(mode === "foto");
    if (section !== "header") {
      const found = cards.find((c) => c.id_servicio === section);
      setEditCard(found ? { ...found } : null);
    } else {
      setEditCard(null);
    }
    setEditFile(null);
    setEditPreview(null);
    setEditFotoFile(null);
    setEditFotoPreview(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditFile(null);
    setEditPreview(null);
    setEditFotoFile(null);
    setEditFotoPreview(null);
  };

  const handleCardChange = (key, value) =>
    setEditCard((prev) => ({ ...prev, [key]: value }));

  const handleFile = (file) => {
    setEditFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEditPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFotoFile = (file) => {
    setEditFotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEditFotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (panelSection === "header") {
        const first = cards[0];
        if (!first) return;
        const fd = new FormData();
        fd.append("id_servicio",    first.id_servicio);
        fd.append("titulo",         first.titulo        || "");
        fd.append("descripcion",    first.descripcion   || "");
        fd.append("seccion_titulo", seccionTitulo);
        await actualizar(fd);
        toastSuccess("Encabezado actualizado correctamente");
      } else {
        const fd = new FormData();
        fd.append("id_servicio",    editCard.id_servicio);
        fd.append("titulo",         editCard.titulo        || "");
        fd.append("descripcion",    editCard.descripcion   || "");
        fd.append("seccion_titulo", seccionTitulo);
        if (editFile)     fd.append("image", editFile);
        if (editFotoFile) {
          fd.append("foto", editFotoFile);
        } else if (editCard.url_foto !== undefined) {
          fd.append("url_foto_manual", editCard.url_foto || "");
        }
        await actualizar(fd);
        toastSuccess("Servicio actualizado correctamente");
      }
      await cargar();
      closePanel();
    } catch (err) {
      handleErrorMessages("Error al guardar", err);
    } finally {
      setSaving(false);
    }
  };

  /* Preview en tiempo real */
  const previewCards = cards.map((c) => {
    if (!editCard || c.id_servicio !== editCard.id_servicio) return c;
    return {
      ...editCard,
      url_icono: editPreview ? null : c.url_icono,
      _previewIcon: editPreview,
      _previewFoto: editFotoPreview || undefined,
    };
  });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <ServiciosCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        section={panelSection}
        fotoMode={panelFotoMode}
        seccionTitulo={seccionTitulo}
        card={editCard}
        preview={editPreview}
        fotoPreview={editFotoPreview}
        onSeccionChange={setSeccionTitulo}
        onCardChange={handleCardChange}
        onFile={handleFile}
        onRemoveFile={() => { setEditFile(null); setEditPreview(null); }}
        onFotoFile={handleFotoFile}
        onRemoveFoto={() => { setEditFotoFile(null); setEditFotoPreview(null); }}
        onSave={handleSave}
        onClose={closePanel}
        saving={saving}
      />

      <PageBox>

        <HeaderBar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MiscellaneousServicesIcon sx={{ fontSize: 16, opacity: 0.85 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>Servicios</Typography>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.65, ml: 0.5 }}>· Sección landing page</Typography>
          </Box>
          <Tooltip title="Editar título principal" placement="left">
            <IconButton size="small" onClick={() => openPanel("header")}
              sx={{ color: "#fff", width: 28, height: 28, bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }}>
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </HeaderBar>

        <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <SectionPreview
            cards={panelOpen && panelSection !== "header" ? previewCards : cards}
            seccionTitulo={seccionTitulo}
            onEdit={openPanel}
          />
        </Paper>

      </PageBox>
    </>
  );
};

export default ServiciosIndexPage;
