import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, Avatar,
  IconButton, Tooltip, CircularProgress, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import EditIcon        from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon         from "@mui/icons-material/Add";
import StarIcon        from "@mui/icons-material/Star";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChatIcon        from "@mui/icons-material/Chat";

import { listar, crear, actualizar, eliminar, actualizarSeccion } from "../../../api/web_testimonios.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import { cmsPublicImageUrlCandidates } from "app/utils/utils";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import TestimoniosCmsPanel from "./TestimoniosCmsPanel";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const DEFAULT_LATERAL_IMAGE = "temp02/assets/images/inicio/historia.jpg";

/** Avatar con preview en tiempo real y fallback de URL (panel + canvas). */
const TestimonialAvatar = ({ item, size = 42 }) => {
  const candidates = item?._previewAvatar
    ? [item._previewAvatar]
    : cmsPublicImageUrlCandidates(item?.url_avatar, item?.url_avatar_publica);
  const [idx, setIdx] = React.useState(0);
  const src = candidates[idx] ?? null;

  React.useEffect(() => {
    setIdx(0);
  }, [item?._previewAvatar, item?.url_avatar, item?.url_avatar_publica]);

  return (
    <Avatar
      src={src}
      imgProps={{
        onError: () => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i)),
      }}
      sx={{ width: size, height: size }}
    >
      {!src && <PersonOutlineIcon sx={{ fontSize: size * 0.55, opacity: 0.4 }} />}
    </Avatar>
  );
};

const PageBox = styled(Box)({
  padding: 16,
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
});

const HeaderBar = styled(Box)(() => ({
  padding: "7px 14px",
  marginBottom: 12,
  borderRadius: 10,
  background: "linear-gradient(135deg, #831843 0%, #cc6b8e 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 3px 12px rgba(131,24,67,0.3)",
}));

const Pencil = ({ onClick, tip = "Editar" }) => (
  <Tooltip title={tip} placement="top">
    <IconButton onClick={onClick} size="small"
      sx={{
        position: "absolute", top: 8, right: 8, zIndex: 10,
        bgcolor: "rgba(204,107,142,0.85)", color: "#fff", width: 28, height: 28,
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        "&:hover": { bgcolor: "#cc6b8e", transform: "scale(1.1)" },
        transition: "all 0.2s",
      }}
    >
      <EditIcon sx={{ fontSize: 13 }} />
    </IconButton>
  </Tooltip>
);

const CardActions = ({ onEdit, onDelete, editTip = "Editar" }) => (
  <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", gap: 0.5 }}>
    <Tooltip title={editTip} placement="top">
      <IconButton size="small" onClick={onEdit}
        sx={{
          bgcolor: "#0f766e", color: "#fff", width: 24, height: 24,
          boxShadow: "0 2px 6px rgba(15,118,110,0.4)",
          "&:hover": { bgcolor: "#0d9488" },
        }}
      >
        <EditIcon sx={{ fontSize: 13 }} />
      </IconButton>
    </Tooltip>
    {onDelete && (
      <Tooltip title="Eliminar" placement="top">
        <IconButton size="small" onClick={onDelete}
          sx={{
            bgcolor: "rgba(239,68,68,0.92)", color: "#fff", width: 24, height: 24,
            "&:hover": { bgcolor: "#dc2626" },
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

const AddTestimonialCard = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      border: "2px dashed #cbd5e1",
      borderRadius: "16px",
      minHeight: 200,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      gap: 1,
      bgcolor: "#fff",
      transition: "border-color 0.2s, background 0.2s",
      "&:hover": { borderColor: "#0f766e", bgcolor: "rgba(15,118,110,0.04)" },
    }}
  >
    <AddIcon sx={{ fontSize: 36, color: "#94a3b8" }} />
    <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: "0.78rem" }}>
      Agregar testimonio
    </Typography>
  </Box>
);

const TestimonialCard = ({ item, onEdit, onDelete, isEditing }) => {
  const esCaptura = item.tipo === "captura";
  const tieneCaptura = item._previewCaptura || item.url_captura;

  if (esCaptura) {
    return (
      <Box sx={{ position: "relative", height: "100%" }}>
        <CardActions onEdit={onEdit} onDelete={onDelete} editTip="Editar captura" />
        <Chip
          icon={<ChatIcon sx={{ fontSize: "12px !important" }} />}
          label="Captura"
          size="small"
          sx={{
            position: "absolute", top: 8, left: 8, zIndex: 10,
            height: 22, fontSize: "0.65rem", fontWeight: 700,
            bgcolor: "#ecfdf5", color: "#0f766e",
          }}
        />
        <Paper elevation={0} sx={{
          borderRadius: "16px", bgcolor: "#fff", p: 1.5, height: "100%",
          boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          display: "flex", flexDirection: "column",
          outline: isEditing ? "2px solid #0f766e" : "none",
          outlineOffset: -2,
        }}>
          {tieneCaptura ? (
            <CmsStorageImage
              storagePath={item.url_captura}
              absoluteUrl={item.url_captura_publica}
              previewSrc={item._previewCaptura}
              alt={item.nombre || "Evidencia"}
              sx={{
                width: "100%", borderRadius: "12px",
                objectFit: "contain", maxHeight: 320, flex: 1,
              }}
            />
          ) : (
            <Box sx={{
              flex: 1, minHeight: 180, display: "flex", alignItems: "center",
              justifyContent: "center", bgcolor: "#f3f4f6", borderRadius: "12px",
            }}>
              <Typography variant="caption" color="text.secondary">
                Sin captura — edite para subir imagen
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <CardActions onEdit={onEdit} onDelete={onDelete} editTip={`Editar — ${item.nombre || "Testimonio"}`} />
      <Paper elevation={0} sx={{
        borderRadius: "16px", bgcolor: "#fff", p: 3, height: "100%",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        outline: isEditing ? "2px solid #0f766e" : "none",
        outlineOffset: -2,
      }}>
        <Typography variant="body2" sx={{
          color: "#374151", fontSize: "0.88rem", lineHeight: 1.65, mb: 2.5,
        }}>
          {item.testimonio || ""}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <TestimonialAvatar item={item} size={42} />
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                {item.nombre || "Cliente"}
              </Typography>
              <Typography sx={{ fontSize: "0.70rem", color: "#6b7280" }}>
                {item.subtitulo || ""}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <StarIcon sx={{ color: "#f59e0b", fontSize: 15 }} />
            <Typography sx={{ fontSize: "0.73rem", color: "#6b7280", fontWeight: 600 }}>
              ({parseFloat(item.calificacion || 4.8).toFixed(1)})
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

/* ── Card glassmorphism estilo frontend Royal ───────────────── */
const RoyalTestimonialCard = ({ item, onEdit, onDelete, isEditing }) => {
  const candidates = item?._previewAvatar
    ? [item._previewAvatar]
    : cmsPublicImageUrlCandidates(item?.url_avatar, item?.url_avatar_publica);
  const [imgIdx, setImgIdx] = React.useState(0);
  React.useEffect(() => setImgIdx(0), [item?._previewAvatar, item?.url_avatar]);
  const avatarSrc = candidates[imgIdx] ?? null;

  const esCaptura = item.tipo === "captura";
  const tieneCaptura = item._previewCaptura || item.url_captura;

  return (
    <Box sx={{
      position: "relative",
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: "18px",
      p: "24px 22px 20px",
      minHeight: 200,
      height: "100%",
      display: "flex", flexDirection: "column",
      outline: isEditing ? "2px solid #cc6b8e" : "none",
      outlineOffset: -2,
      transition: "transform 0.25s, box-shadow 0.25s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" },
    }}>
      {/* Botones admin */}
      <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 0.5, zIndex: 10 }}>
        <Tooltip title={`Editar: ${item.nombre || "testimonio"}`} placement="top">
          <IconButton size="small" onClick={onEdit} sx={{
            bgcolor: "rgba(204,107,142,0.85)", color: "#fff",
            width: 28, height: 28, backdropFilter: "blur(4px)",
            "&:hover": { bgcolor: "#cc6b8e" }, transition: "all 0.2s",
          }}>
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        {onDelete && (
          <Tooltip title="Eliminar" placement="top">
            <IconButton size="small" onClick={onDelete} sx={{
              bgcolor: "rgba(239,68,68,0.82)", color: "#fff",
              width: 28, height: 28, backdropFilter: "blur(4px)",
              "&:hover": { bgcolor: "#dc2626" }, transition: "all 0.2s",
            }}>
              <DeleteOutlineIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {esCaptura ? (
        /* Tipo captura */
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {tieneCaptura ? (
            <CmsStorageImage
              storagePath={item.url_captura}
              absoluteUrl={item.url_captura_publica}
              previewSrc={item._previewCaptura}
              alt={item.nombre}
              sx={{ width: "100%", borderRadius: "10px", objectFit: "contain", maxHeight: 240 }}
            />
          ) : (
            <Box sx={{ color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
              <ChatIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="caption" sx={{ display: "block", fontSize: "0.68rem" }}>Sin captura</Typography>
            </Box>
          )}
        </Box>
      ) : (
        /* Tipo texto */
        <>
          {/* Avatar + comillas */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
            {/* Avatar con borde rosa punteado */}
            <Box sx={{ flexShrink: 0, position: "relative" }}>
              <Box sx={{
                width: 68, height: 68, borderRadius: "50%",
                border: "2.5px dashed #cc6b8e",
                display: "flex", alignItems: "center", justifyContent: "center",
                p: "3px",
              }}>
                <Avatar
                  src={avatarSrc}
                  imgProps={{ onError: () => setImgIdx(i => Math.min(i + 1, candidates.length - 1)) }}
                  sx={{ width: 60, height: 60 }}>
                  <PersonOutlineIcon sx={{ fontSize: 28, opacity: 0.4 }} />
                </Avatar>
              </Box>
            </Box>

            {/* Texto testimonio */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{
                color: "rgba(255,255,255,0.92)", fontSize: "0.83rem",
                lineHeight: 1.70, fontStyle: "italic",
                display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {item.testimonio || "Testimonio del cliente..."}
              </Typography>
            </Box>
          </Box>

          {/* Nombre + profesión */}
          <Box sx={{ mt: "auto", pt: "14px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <Typography sx={{
              color: "#cc6b8e", fontSize: "0.88rem", fontWeight: 700,
              fontFamily: "'PT Serif',serif", letterSpacing: "0.3px",
            }}>
              {item.nombre || "Cliente Royal"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", mt: 0.3 }}>
              {item.subtitulo || ""}
            </Typography>
            {item.calificacion && (
              <Box sx={{ display: "flex", gap: 0.3, mt: 0.5 }}>
                {[1,2,3,4,5].map(s => (
                  <StarIcon key={s} sx={{
                    fontSize: 12,
                    color: s <= Math.round(parseFloat(item.calificacion)) ? "#f59e0b" : "rgba(255,255,255,0.2)",
                  }} />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

/* ── Paleta "Dark Passion" del sitio público ─────────────────── */
const PP = {
  text:  "#f5e6e2",
  muted: "#d3b3ae",
  gold:  "#d9a56b",
  serif: "'Playfair Display','PT Serif',Georgia,serif",
};
const SITE_BG = `
  radial-gradient(circle at 12% 8%, rgba(122,6,6,.30) 0%, transparent 45%),
  radial-gradient(circle at 88% 92%, rgba(122,6,6,.25) 0%, transparent 50%),
  linear-gradient(160deg, #12070a 0%, #2a0f16 30%, #33141a 50%, #1c0d10 72%, #12070a 100%)`;

/* ── Preview canvas — réplica del público (testimonial-6) ────── */
const SectionPreview = ({ items, seccion, lateralPreview, onEdit, onDelete, onAdd, editingId }) => {
  const [idx, setIdx] = React.useState(0);
  const total = items.length;
  const current = total ? items[Math.min(idx, total - 1)] : null;
  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  const avatarCands = current?._previewAvatar
    ? [current._previewAvatar]
    : cmsPublicImageUrlCandidates(current?.url_avatar, current?.url_avatar_publica);
  const [avIdx, setAvIdx] = React.useState(0);
  React.useEffect(() => setAvIdx(0), [current?._previewAvatar, current?.url_avatar]);
  const avatarSrc = avatarCands[avIdx] ?? null;
  const stars = Math.round(parseFloat(current?.calificacion ?? 5));

  return (
    <Box sx={{ background: SITE_BG }}>
      <Box sx={{ display: "flex", flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "stretch" }}>

        {/* ── IZQUIERDA: texto + testimonio ── */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 52%" }, position: "relative",
          p: { xs: "32px 24px", md: "48px 44px" } }}>

          {/* Lápiz encabezado */}
          <Tooltip title="Editar encabezado (etiqueta, título, descripción, imagen)" placement="top">
            <IconButton onClick={() => onEdit("header")} size="small" sx={{
              position: "absolute", top: 16, right: 16,
              bgcolor: "rgba(217,165,107,0.9)", color: "#2c1408",
              width: 30, height: 30, "&:hover": { bgcolor: PP.gold, transform: "scale(1.1)" },
              transition: "all 0.2s", zIndex: 5,
            }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>

          {/* Encabezado */}
          <Typography sx={{ color: PP.gold, fontFamily: PP.serif, fontStyle: "italic",
            fontSize: "1rem", mb: 1 }}>
            {seccion.badge_seccion || "Las Voces De Nuestros Invitados"}
          </Typography>
          <Typography sx={{ color: PP.text, fontFamily: PP.serif, fontWeight: 700,
            fontSize: { xs: "1.6rem", md: "2.1rem" }, lineHeight: 1.2, textTransform: "uppercase", mb: 2 }}>
            {seccion.seccion_titulo || "Historias de calma en Miraflores"}
          </Typography>
          {seccion.seccion_descripcion && (
            <Typography sx={{ color: PP.muted, fontSize: "0.86rem", lineHeight: 1.8, mb: 3 }}>
              {seccion.seccion_descripcion}
            </Typography>
          )}

          {/* Testimonio actual */}
          {current ? (
            <Box sx={{ position: "relative", "&:hover .testi-ctrls": { opacity: 1 } }}>
              {/* Controles admin del testimonio visible */}
              <Box className="testi-ctrls" sx={{ position: "absolute", top: -6, right: 0, zIndex: 5,
                display: "flex", gap: 0.5, opacity: 0, transition: "opacity .2s" }}>
                <Tooltip title={`Editar — ${current.nombre || "testimonio"}`}>
                  <IconButton size="small" onClick={() => onEdit(current.id_testimonio)}
                    sx={{ bgcolor: "rgba(204,107,142,0.9)", color: "#fff", width: 26, height: 26,
                      "&:hover": { bgcolor: "#cc6b8e" } }}>
                    <EditIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
                {current.id_testimonio && (
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(current)}
                      sx={{ bgcolor: "rgba(239,68,68,0.85)", color: "#fff", width: 26, height: 26,
                        "&:hover": { bgcolor: "#dc2626" } }}>
                      <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start",
                outline: editingId && current.id_testimonio === editingId ? `2px solid ${PP.gold}` : "none",
                outlineOffset: 6, borderRadius: "8px" }}>
                {/* Columna nombre + avatar */}
                <Box sx={{ flexShrink: 0, maxWidth: 150 }}>
                  <Typography sx={{ color: PP.text, fontFamily: PP.serif, fontWeight: 700,
                    fontSize: "1rem", textTransform: "uppercase", lineHeight: 1.2 }}>
                    {current.nombre || "Cliente"}
                  </Typography>
                  {current.subtitulo && (
                    <Typography sx={{ color: PP.muted, fontSize: "0.75rem", mb: 1 }}>
                      {current.subtitulo}
                    </Typography>
                  )}
                  <Avatar src={avatarSrc}
                    imgProps={{ onError: () => setAvIdx(i => Math.min(i + 1, avatarCands.length - 1)) }}
                    sx={{ width: 74, height: 74, mt: 1, border: `2px solid ${PP.gold}` }}>
                    <PersonOutlineIcon sx={{ fontSize: 32, opacity: 0.4 }} />
                  </Avatar>
                </Box>
                {/* Cita */}
                <Box sx={{ flex: 1, pt: 0.5 }}>
                  <Box sx={{ display: "flex", gap: 0.4, mb: 1 }}>
                    {[1,2,3,4,5].map(s => (
                      <StarIcon key={s} sx={{ fontSize: 15,
                        color: s <= stars ? "#f0b429" : "rgba(255,255,255,0.2)" }} />
                    ))}
                  </Box>
                  <Typography sx={{ color: PP.muted, fontSize: "0.92rem", lineHeight: 1.7 }}>
                    “{current.testimonio || "Testimonio del cliente…"}”
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ color: PP.muted, fontStyle: "italic" }}>
              Aún no hay testimonios.
            </Typography>
          )}

          {/* Flechas + agregar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 3.5 }}>
            <IconButton onClick={prev} disabled={total < 2} sx={{
              width: 46, height: 46, borderRadius: "6px", color: PP.gold,
              border: `1px solid ${PP.gold}`, "&:hover": { bgcolor: "rgba(217,165,107,0.15)" },
              "&.Mui-disabled": { opacity: 0.3, color: PP.gold, borderColor: PP.gold } }}>
              ←
            </IconButton>
            <IconButton onClick={next} disabled={total < 2} sx={{
              width: 46, height: 46, borderRadius: "6px", color: PP.gold,
              border: `1px solid ${PP.gold}`, "&:hover": { bgcolor: "rgba(217,165,107,0.15)" },
              "&.Mui-disabled": { opacity: 0.3, color: PP.gold, borderColor: PP.gold } }}>
              →
            </IconButton>
            {total > 0 && (
              <Typography sx={{ color: PP.muted, fontSize: "0.78rem", ml: 0.5 }}>
                {Math.min(idx, total - 1) + 1} / {total}
              </Typography>
            )}
            <Button onClick={onAdd} size="small" startIcon={<AddIcon />}
              sx={{ ml: "auto", color: PP.gold, borderRadius: "20px", textTransform: "none",
                border: `1px dashed ${PP.gold}`, px: 1.6,
                "&:hover": { bgcolor: "rgba(217,165,107,0.12)" } }}>
              Agregar
            </Button>
          </Box>
        </Box>

        {/* ── DERECHA: imagen grande ── */}
        <Box sx={{ flex: 1, minWidth: 0, position: "relative", minHeight: { xs: 260, md: "auto" },
          display: { xs: "none", md: "block" } }}>
          <CmsStorageImage
            storagePath={seccion?.url_imagen_lateral || DEFAULT_LATERAL_IMAGE}
            absoluteUrl={seccion?.url_imagen_lateral ? seccion?.url_imagen_lateral_publica : null}
            previewSrc={lateralPreview}
            alt="Testimonios"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const TestimoniosIndexPage = () => {
  const { panelLeft } = useCmsPanelLayout();

  const [items,   setItems]   = useState([]);
  const [seccion, setSeccion] = useState({
    badge_seccion: "",
    seccion_titulo: "",
    seccion_descripcion: "",
    url_imagen_lateral: "",
    url_imagen_lateral_publica: "",
  });
  const [loading, setLoading] = useState(true);
  const [lateralFile,    setLateralFile]    = useState(null);
  const [lateralPreview, setLateralPreview] = useState(null);

  const [panelOpen,    setPanelOpen]    = useState(false);
  useCmsPanelPush(panelOpen);
  const [panelSection, setPanelSection] = useState("header");
  const [editItem,     setEditItem]     = useState(null);
  const [editFile,     setEditFile]     = useState(null);
  const [editPreview,  setEditPreview]  = useState(null);
  const [editCapturaFile,    setEditCapturaFile]    = useState(null);
  const [editCapturaPreview, setEditCapturaPreview] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [confirmItem,  setConfirmItem]  = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const isNew = panelOpen && panelSection !== "header" && !editItem?.id_testimonio;

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setItems(data || []);
      if (data?.length > 0) {
        setSeccion({
          badge_seccion:              data[0].badge_seccion              || "",
          seccion_titulo:             data[0].seccion_titulo             || "",
          seccion_descripcion:        data[0].seccion_descripcion        || "",
          url_imagen_lateral:         data[0].url_imagen_lateral         || "",
          url_imagen_lateral_publica: data[0].url_imagen_lateral_publica || "",
        });
      }
      setLateralFile(null); setLateralPreview(null);
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFiles = () => {
    setEditFile(null);
    setEditPreview(null);
    setEditCapturaFile(null);
    setEditCapturaPreview(null);
  };

  const openNewPanel = () => {
    setPanelSection("new");
    setEditItem({
      tipo: "texto",
      nombre: "Cliente Satisfecho",
      subtitulo: "Cliente de royalsensorymassage",
      testimonio: "",
      calificacion: 4.8,
      badge_seccion: seccion.badge_seccion,
      seccion_titulo: seccion.seccion_titulo,
    });
    resetFiles();
    setPanelOpen(true);
  };

  const openPanel = (section) => {
    if (section === "new") {
      openNewPanel();
      return;
    }
    setPanelSection(section);
    if (section !== "header") {
      const found = items.find((i) => i.id_testimonio === section);
      setEditItem(found ? { ...found, tipo: found.tipo || "texto" } : null);
    } else {
      setEditItem(null);
    }
    resetFiles();
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    resetFiles();
  };

  const handleSeccionChange = (key, value) =>
    setSeccion((prev) => ({ ...prev, [key]: value }));

  const handleItemChange = (key, value) =>
    setEditItem((prev) => ({ ...prev, [key]: value }));

  const handleFile = (file) => {
    setEditFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEditPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setEditFile(null);
    setEditPreview(null);
  };

  const handleCapturaFile = (file) => {
    setEditCapturaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEditCapturaPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveCapturaFile = () => {
    setEditCapturaFile(null);
    setEditCapturaPreview(null);
  };

  const handleLateralFile = (file) => {
    setLateralFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLateralPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleRemoveLateralFile = () => { setLateralFile(null); setLateralPreview(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (panelSection === "header") {
        const fd = new FormData();
        fd.append("badge_seccion", seccion.badge_seccion || "");
        fd.append("seccion_titulo", seccion.seccion_titulo || "");
        fd.append("seccion_descripcion", seccion.seccion_descripcion || "");
        if (lateralFile) fd.append("imagen_lateral", lateralFile);
        await actualizarSeccion(fd);
        toastSuccess("Encabezado actualizado correctamente");
        await cargar();
        closePanel();
      } else if (editItem) {
        const tipo = editItem.tipo === "captura" ? "captura" : "texto";

        if (tipo === "captura" && !editCapturaFile && !editItem.url_captura) {
          handleErrorMessages("Validación", new Error("Suba una imagen de captura antes de guardar."));
          return;
        }

        const formData = new FormData();
        formData.append("tipo", tipo);
        formData.append("badge_seccion", seccion.badge_seccion);
        formData.append("seccion_titulo", seccion.seccion_titulo);

        if (tipo === "captura") {
          formData.append("nombre", editItem.nombre || "Evidencia WhatsApp");
          if (editItem.subtitulo) formData.append("subtitulo", editItem.subtitulo);
          if (editItem.url_link) formData.append("url_link", editItem.url_link);
          if (editCapturaFile) formData.append("captura", editCapturaFile);
        } else {
          formData.append("nombre", editItem.nombre || "");
          formData.append("subtitulo", editItem.subtitulo || "");
          formData.append("testimonio", editItem.testimonio || "");
          formData.append("calificacion", editItem.calificacion ?? 4.8);
          if (editFile) formData.append("image", editFile);
        }

        if (isNew) {
          await crear(formData);
          toastSuccess("Testimonio creado correctamente");
        } else {
          formData.append("id_testimonio", editItem.id_testimonio);
          await actualizar(formData);
          toastSuccess("Testimonio actualizado correctamente");
        }
        await cargar();
        closePanel();
      }
    } catch (err) {
      handleErrorMessages("Error al guardar", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmItem?.id_testimonio) return;
    setDeleting(true);
    try {
      await eliminar({ id_testimonio: confirmItem.id_testimonio });
      toastSuccess("Testimonio eliminado");
      setConfirmItem(null);
      if (editItem?.id_testimonio === confirmItem.id_testimonio) {
        closePanel();
      }
      await cargar();
    } catch (err) {
      handleErrorMessages("Error al eliminar", err);
    } finally {
      setDeleting(false);
    }
  };

  const previewItems = items.map((i) => {
    if (!editItem?.id_testimonio || i.id_testimonio !== editItem.id_testimonio) return i;
    const merged = { ...editItem, tipo: editItem.tipo || "texto" };
    if (editPreview) merged._previewAvatar = editPreview;
    if (editCapturaPreview) merged._previewCaptura = editCapturaPreview;
    return merged;
  });

  const editingId = !isNew && editItem?.id_testimonio ? editItem.id_testimonio : null;

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Dialog open={!!confirmItem} onClose={() => !deleting && setConfirmItem(null)}>
        <DialogTitle>Eliminar testimonio</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Eliminar «{confirmItem?.nombre || "este testimonio"}»? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmItem(null)} disabled={deleting}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <TestimoniosCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        section={panelSection}
        seccion={seccion}
        item={editItem}
        isNew={isNew}
        preview={editPreview}
        capturaPreview={editCapturaPreview}
        onSeccionChange={handleSeccionChange}
        onItemChange={handleItemChange}
        lateralPreview={lateralPreview}
        onLateralFile={handleLateralFile}
        onRemoveLateralFile={handleRemoveLateralFile}
        onFile={handleFile}
        onRemoveFile={handleRemoveFile}
        onCapturaFile={handleCapturaFile}
        onRemoveCapturaFile={handleRemoveCapturaFile}
        onSave={handleSave}
        onClose={closePanel}
        onDelete={editItem?.id_testimonio ? () => setConfirmItem(editItem) : undefined}
      />

      <PageBox>

        <HeaderBar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormatQuoteIcon sx={{ fontSize: 16, opacity: 0.85 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
              Testimonios y Reseñas
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.65, ml: 0.5 }}>
              · Sección landing page
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Agregar testimonio">
              <IconButton size="small" onClick={openNewPanel}
                sx={{ color: "#fff", width: 28, height: 28, bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.30)" } }}>
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar encabezado" placement="left">
              <IconButton size="small" onClick={() => openPanel("header")}
                sx={{ color: "#fff", width: 28, height: 28, bgcolor: "rgba(255,255,255,0.18)", "&:hover": { bgcolor: "rgba(255,255,255,0.30)" } }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </HeaderBar>

        <Box sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
          <SectionPreview
            items={panelOpen && panelSection !== "header" && !isNew ? previewItems : items}
            seccion={seccion}
            lateralPreview={lateralPreview}
            onEdit={openPanel}
            onDelete={(item) => setConfirmItem(item)}
            onAdd={openNewPanel}
            editingId={editingId}
          />
        </Box>

      </PageBox>
    </>
  );
};

export default TestimoniosIndexPage;
