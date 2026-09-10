import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Box, Typography, CircularProgress, Button, TextField, Stack,
  IconButton, Tooltip, Avatar, Dialog, DialogTitle, DialogActions,
  DialogContent, Switch, Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import EditIcon          from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon           from "@mui/icons-material/Add";
import SpaIcon           from "@mui/icons-material/Spa";
import UploadFileIcon    from "@mui/icons-material/UploadFile";
import OpenInNewIcon     from "@mui/icons-material/OpenInNew";

import { obtener, actualizar, subirHero }    from "../../../api/web_pagina_masajes.api";
import { listar, crear, actualizar as actualizarFaq, eliminar } from "../../../api/web_masaje_faq.api";
import { toastSuccess, toastError, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot        from "app/components/cms/CmsPanelRoot";
import CmsTinyMceFieldDark from "app/components/cms/CmsTinyMceFieldDark";
import { authJWTConfig } from "app/authJWTConfig";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

/* ── Paleta ──────────────────────────────────────────────────────── */
const RM = { brown:"#2c1a0e", mid:"#4a2a15", pink:"#cc6b8e", deepPink:"#a0455e", gold:"#b8860b", cream:"#fdf8f5" };
const ACCENT = RM.deepPink;
const PANEL_W_DEFAULT = 360;
/** Panel más ancho solo al editar FAQ (barra completa de TinyMCE). */
const PANEL_W_FAQ = 1000;

const htmlToPlain = (html) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

/* ── darkFormSx — hereda en todos los TextField del panel ────────── */
const darkFormSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#f1f5f9",
    borderRadius: 1,
    fontSize: "0.82rem",
  },
  "& .MuiInputBase-input":        { color: "#f1f5f9" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(204,107,142,0.5)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
};

/* ── Styled ──────────────────────────────────────────────────────── */
const PageBox   = styled(Box)({ padding: 16, minHeight: "100vh", background: RM.cream });
const HeaderBar = styled(Box)({
  padding: "10px 18px", marginBottom: 16, borderRadius: 10,
  background: `linear-gradient(135deg,${RM.brown},${RM.mid})`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
  boxShadow: "0 4px 14px rgba(44,26,14,0.5)",
});

/* ── FField — campo estándar dark-theme ──────────────────────────── */
const FField = ({ label, value, onChange, multiline, rows = 1, type }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{
      fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.55)",
      textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5,
    }}>
      {label}
    </Typography>
    <TextField
      fullWidth size="small"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      multiline={multiline} minRows={rows} type={type}
      sx={darkFormSx}
    />
  </Box>
);

/* ── Sep ─────────────────────────────────────────────────────────── */
const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

/* ── Upload imagen ───────────────────────────────────────────────── */
function ImgUpload({ preview, currentUrl, onFile }) {
  const ref = useRef();
  const src = preview || (currentUrl ? (currentUrl.startsWith("http") ? currentUrl : `/${currentUrl}`) : null);
  return (
    <Box>
      <input type="file" ref={ref} accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width: "100%", height: 120, borderRadius: 2, overflow: "hidden",
        border: `2px dashed ${src ? "rgba(160,69,94,0.6)" : "rgba(255,255,255,0.2)"}`,
        bgcolor: "rgba(255,255,255,0.04)", display: "flex",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative",
        "&:hover": { borderColor: ACCENT },
      }}>
        {src
          ? <Box component="img" src={src} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Stack alignItems="center" gap={0.5} sx={{ color: "#475569" }}>
              <UploadFileIcon sx={{ fontSize: 28, opacity: 0.5 }} />
              <Typography sx={{ fontSize: 10 }}>Clic para subir imagen</Typography>
            </Stack>
        }
      </Box>
    </Box>
  );
}

/* ── Canvas FAQ item ─────────────────────────────────────────────── */
function FaqCanvasItem({ faq, isFirst, onEdit, onDelete }) {
  const [open, setOpen] = useState(isFirst);
  return (
    <Box sx={{
      bgcolor: "#fff", borderRadius: 2,
      border: open ? `1.5px solid ${RM.pink}` : "1.5px solid #f0e0e8",
      boxShadow: open ? "0 4px 16px rgba(204,107,142,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
      overflow: "hidden",
      opacity: faq.Activo === "N" ? 0.5 : 1,
      "&:hover .faq-actions": { opacity: 1 },
    }}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.4, cursor: "pointer",
        background: open ? "linear-gradient(135deg,rgba(204,107,142,0.06),rgba(160,69,94,0.04))" : "#fff",
      }} onClick={() => setOpen(o => !o)}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: open ? `linear-gradient(135deg,${RM.pink},${RM.deepPink})` : "rgba(204,107,142,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={faq.icono || "fas fa-spa"} style={{ fontSize: 14, color: open ? "#fff" : RM.pink }} />
        </Box>
        <Typography sx={{ flex: 1, fontFamily: "'PT Serif',serif", fontSize: "0.9rem", fontWeight: 600, color: RM.brown }}>
          {faq.titulo}
        </Typography>
        <Box className="faq-actions" sx={{ display: "flex", gap: 0.5, opacity: 0, transition: "opacity .2s" }}
          onClick={e => e.stopPropagation()}>
          <Tooltip title="Editar pregunta">
            <IconButton size="small" onClick={onEdit} sx={{
              bgcolor: "rgba(44,26,14,0.85)", color: "#fff", width: 26, height: 26,
              "&:hover": { bgcolor: RM.brown },
            }}>
              <EditIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar pregunta">
            <IconButton size="small" onClick={onDelete} sx={{
              bgcolor: "rgba(220,38,38,0.85)", color: "#fff", width: 26, height: 26,
              "&:hover": { bgcolor: "#dc2626" },
            }}>
              <DeleteOutlineIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{
          width: 24, height: 24, borderRadius: "50%",
          background: open ? RM.pink : "transparent",
          border: open ? "none" : `1px solid ${RM.pink}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: open ? "rotate(180deg)" : "none", transition: "all .25s", flexShrink: 0,
        }}>
          <i className="fas fa-chevron-down" style={{ fontSize: 10, color: open ? "#fff" : RM.pink }} />
        </Box>
      </Box>
      {open && (
        <Box sx={{ px: 2, pb: 1.5, pt: 0.5, borderTop: `1px solid rgba(204,107,142,0.12)` }}>
          <Box sx={{
            fontSize: "0.80rem", color: "#666", lineHeight: 1.7,
            "& p": { mb: 0.8 }, "& ul": { pl: 2, mb: 0.8 }, "& li": { mb: 0.3 },
            "& strong": { color: RM.brown }, "& em": { color: RM.pink },
            "& img": { maxWidth: "100%", borderRadius: 1, my: 0.5 },
          }}
            dangerouslySetInnerHTML={{ __html: faq.contenido || "<p>Sin contenido</p>" }}
          />
        </Box>
      )}
    </Box>
  );
}

/* ── EditZone — zona clicable con lápiz ─────────────────────────── */
function EditZone({ id, label, activeZone, onOpen, children }) {
  const isActive = activeZone === id;
  return (
    <Box sx={{
      position: "relative",
      outline: isActive ? `2.5px dashed ${RM.pink}` : "2px dashed transparent",
      outlineOffset: -2, transition: "outline .2s",
      "&:hover": { outline: `2px dashed rgba(204,107,142,0.4)` },
      "&:hover .ez-pencil": { opacity: 1 },
    }}>
      {children}
      <Tooltip title={`Editar: ${label}`} placement="left">
        <IconButton className="ez-pencil" size="small" onClick={() => onOpen(id)} sx={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          background: isActive ? ACCENT : "rgba(160,69,94,0.88)",
          color: "#fff", width: 28, height: 28,
          opacity: isActive ? 1 : 0, transition: "opacity .2s",
          "&:hover": { background: ACCENT, transform: "scale(1.12)" },
        }}>
          <EditIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/* ── Canvas completo ─────────────────────────────────────────────── */
function PageCanvas({ pagForm, heroPreview, activeZone, onZone, faqs, onEditFaq, onDeleteFaq, onNewFaq }) {
  const heroBg = heroPreview
    || (pagForm.hero_url_imagen
      ? (pagForm.hero_url_imagen.startsWith("http") ? pagForm.hero_url_imagen : `/${pagForm.hero_url_imagen}`)
      : null);

  return (
    <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>

      {/* HERO */}
      <EditZone id="hero" label="Hero" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{
          height: 200,
          background: heroBg
            ? `linear-gradient(rgba(20,8,2,.52),rgba(20,8,2,.68)), url(${heroBg}) center/cover no-repeat`
            : `linear-gradient(135deg,#1a0b04,#2c1a0e)`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 0.6, px: 2,
        }}>
          <Box sx={{ border: "1px solid rgba(204,107,142,0.5)", borderRadius: 20, px: 2, py: 0.35, mb: 0.5 }}>
            <Typography sx={{ color: "#d4a8b8", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>
              {pagForm.hero_tag || "Royal Sensory Experience"}
            </Typography>
          </Box>
          <Typography sx={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "'PT Serif',serif", textAlign: "center" }}>
            {pagForm.hero_titulo || "Nuestros Masajes Tántricos"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.3 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Inicio</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>/</Typography>
            <Typography sx={{ color: RM.pink, fontSize: 10 }}>Masajes Tántricos</Typography>
          </Box>
        </Box>
      </EditZone>

      {/* INTRO */}
      <EditZone id="intro" label="Intro" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{ background: "linear-gradient(180deg,#fdf8f5 0%,#fff 50%,#fdf8f5 100%)", pt: "32px", pb: "20px", textAlign: "center", px: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <Box sx={{ height: 1, width: 32, background: RM.pink, opacity: 0.4 }} />
            <Typography sx={{ color: RM.gold, fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>
              {pagForm.intro_label || "Conocimiento & Bienestar"}
            </Typography>
            <Box sx={{ height: 1, width: 32, background: RM.pink, opacity: 0.4 }} />
          </Box>
          <Typography sx={{ fontFamily: "'PT Serif',serif", color: RM.brown, fontSize: 22, fontWeight: 700, lineHeight: 1.25, mb: 0.8 }}>
            {pagForm.intro_titulo || "Masaje Tántrico —"}<br />
            <em style={{ color: RM.pink }}>{pagForm.intro_titulo2 || "Todo lo que necesitas saber"}</em>
          </Typography>
          {pagForm.intro_subtitulo && (
            <Typography sx={{ color: "#888", fontSize: "0.82rem", maxWidth: 520, mx: "auto", mb: 1 }}>
              {pagForm.intro_subtitulo}
            </Typography>
          )}
          <Box sx={{ width: 60, height: 3, background: `linear-gradient(90deg,${RM.pink},${RM.gold})`, borderRadius: 2, mx: "auto", mt: 1 }} />
        </Box>
      </EditZone>

      {/* FAQ */}
      <Box sx={{ background: "linear-gradient(180deg,#fff 0%,#fdf8f5 100%)", px: 4, pb: "28px" }}>
        <Stack spacing={1.2} sx={{ maxWidth: 760, mx: "auto" }}>
          {faqs.length > 0
            ? faqs.map((faq, i) => (
                <FaqCanvasItem key={faq.id} faq={faq} isFirst={i === 0}
                  onEdit={() => onEditFaq(faq)} onDelete={() => onDeleteFaq(faq.id)} />
              ))
            : [1, 2, 3].map(n => (
                <Box key={n} sx={{ bgcolor: "#fff", borderRadius: 2, px: 2, py: 1.5,
                  border: "2px dashed rgba(204,107,142,0.2)", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(204,107,142,0.08)" }} />
                  <Box sx={{ flex: 1, height: 12, borderRadius: 1, bgcolor: "rgba(44,26,14,0.06)" }} />
                </Box>
              ))
          }
        </Stack>
        <Box sx={{ maxWidth: 760, mx: "auto", mt: 1.5 }}>
          <Button size="small" startIcon={<AddIcon />} onClick={onNewFaq} sx={{
            width: "100%", borderRadius: "50px",
            border: `1.5px dashed rgba(204,107,142,0.5)`,
            color: RM.deepPink, fontSize: 11, textTransform: "none", fontWeight: 600, py: 0.8,
            "&:hover": { background: "rgba(204,107,142,0.07)", borderColor: RM.pink },
          }}>
            + Agregar nueva pregunta frecuente
          </Button>
        </Box>
      </Box>

      {/* CTA */}
      <EditZone id="cta" label="CTA WhatsApp" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{ background: `linear-gradient(135deg,${RM.deepPink},${RM.brown})`, py: "20px", textAlign: "center", px: 3 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 12, mb: 1.2 }}>
            {pagForm.cta_texto || "¿Tienes más preguntas? Escríbenos directamente"}
          </Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1,
            background: "#25d366", color: "#fff", px: 2.5, py: 0.8, borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            <i className="fab fa-whatsapp" style={{ fontSize: 14 }} />
            {pagForm.cta_btn || "Chatear por WhatsApp"}
          </Box>
        </Box>
      </EditZone>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ZONE DRAWER — forwardRef con useImperativeHandle
══════════════════════════════════════════════════════════════════ */
const ZoneDrawer = forwardRef(function ZoneDrawer({ zone, pagForm, onPagField, heroPreview, onHeroImg, faqForm, onFaqField }, ref) {
  useImperativeHandle(ref, () => ({ apply: null }), [zone]);

  if (zone === "faq") {
    return (
      <Box>
        {/* Ícono */}
        <FField label="Ícono FontAwesome (ej: fas fa-spa)" value={faqForm.icono}
          onChange={v => onFaqField("icono", v)} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5,
          px: 1.5, py: 0.8, borderRadius: 1, bgcolor: "rgba(255,255,255,0.05)" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%",
            background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={faqForm.icono || "fas fa-spa"} style={{ fontSize: 13, color: "#fff" }} />
          </Box>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Preview ícono</Typography>
        </Box>

        <Sep />
        <FField label="Pregunta (título) *" value={faqForm.titulo} onChange={v => onFaqField("titulo", v)} />

        <Sep />
        <CmsTinyMceFieldDark
          key={faqForm.id ?? "new-faq"}
          label="Contenido (texto e imágenes)"
          value={faqForm.contenido ?? ""}
          onChange={(v) => onFaqField("contenido", v)}
          mode="notes"
          height={320}
        />

        <Sep />
        <FField label="Orden" value={faqForm.orden} onChange={v => onFaqField("orden", v)} type="number" />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 1, py: 0.8, borderRadius: 1, bgcolor: "rgba(255,255,255,0.05)" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Visible en el sitio</Typography>
          <Switch checked={faqForm.Activo === "S"} size="small"
            onChange={e => onFaqField("Activo", e.target.checked ? "S" : "N")}
            sx={{ "& .MuiSwitch-thumb": { bgcolor: faqForm.Activo === "S" ? RM.pink : "#666" } }} />
        </Box>
      </Box>
    );
  }

  if (zone === "hero") {
    return (
      <Box>
        <FField label="Etiqueta (tag)" value={pagForm.hero_tag} onChange={v => onPagField("hero_tag", v)} />
        <FField label="Título principal" value={pagForm.hero_titulo} onChange={v => onPagField("hero_titulo", v)} />
        <Sep />
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.75 }}>
          Imagen de fondo
        </Typography>
        <ImgUpload preview={heroPreview} currentUrl={pagForm.hero_url_imagen} onFile={onHeroImg} />
      </Box>
    );
  }

  if (zone === "intro") {
    return (
      <Box>
        <FField label="Etiqueta (ej: Conocimiento & Bienestar)" value={pagForm.intro_label} onChange={v => onPagField("intro_label", v)} />
        <FField label="Título (parte normal)" value={pagForm.intro_titulo} onChange={v => onPagField("intro_titulo", v)} />
        <FField label="Título (parte rosa cursiva)" value={pagForm.intro_titulo2} onChange={v => onPagField("intro_titulo2", v)} />
        <FField label="Subtítulo / descripción" value={pagForm.intro_subtitulo} onChange={v => onPagField("intro_subtitulo", v)} multiline rows={3} />
      </Box>
    );
  }

  if (zone === "cta") {
    return (
      <Box>
        <FField label="Texto del CTA" value={pagForm.cta_texto} onChange={v => onPagField("cta_texto", v)} multiline rows={2} />
        <FField label="Texto del botón" value={pagForm.cta_btn} onChange={v => onPagField("cta_btn", v)} />
      </Box>
    );
  }

  return null;
});

/* ── Meta de zonas ───────────────────────────────────────────────── */
const ZONE_META = {
  hero:  { label: "Hero · Cabecera",   emoji: "🖼" },
  intro: { label: "Sección Intro",     emoji: "📖" },
  cta:   { label: "CTA WhatsApp",      emoji: "💬" },
  faq:   { label: "Pregunta FAQ",      emoji: "❓" },
};

/* ════════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════════ */
const emptyFaq = () => ({ id: null, titulo: "", contenido: "", icono: "fas fa-spa", orden: 0, Activo: "S" });

export default function PaginaMasajesIndexPage() {
  const [pagForm,     setPagForm]     = useState({});
  const [heroImg,     setHeroImg]     = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [pagSaving,   setPagSaving]   = useState(false);
  const [faqs,        setFaqs]        = useState([]);
  const [faqForm,     setFaqForm]     = useState(emptyFaq());
  const [faqSaving,   setFaqSaving]   = useState(false);
  const [activeZone,  setActiveZone]  = useState(null);
  const [delId,       setDelId]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  const panelOpen = Boolean(activeZone);
  const panelWidth = activeZone === "faq" ? PANEL_W_FAQ : PANEL_W_DEFAULT;

  const loadFaqs = async () => {
    const data = await listar();
    setFaqs(data ?? []);
  };

  useEffect(() => {
    Promise.all([obtener(), listar()])
      .then(([pag, faqList]) => { setPagForm(pag); setFaqs(faqList ?? []); })
      .catch(handleErrorMessages)
      .finally(() => setLoading(false));
  }, []);

  const handlePagField = (k, v) => setPagForm(p => ({ ...p, [k]: v }));
  const handleHeroImg  = file => { setHeroImg(file); setHeroPreview(URL.createObjectURL(file)); };

  const openZone = (id) => setActiveZone(p => p === id ? null : id);
  const openEditFaq = faq => { setFaqForm({ ...faq }); setActiveZone("faq"); };
  const openNewFaq  = ()  => { setFaqForm(emptyFaq()); setActiveZone("faq"); };
  const closePanel  = ()  => setActiveZone(null);

  const savePag = async () => {
    setPagSaving(true);
    try {
      let payload = { ...pagForm };
      if (heroImg) {
        const res = await subirHero(heroImg);
        payload = { ...payload, hero_url_imagen: res.url };
        setHeroImg(null);
        setHeroPreview(null);
      }
      const updated = await actualizar(payload);
      setPagForm(updated);
      toastSuccess("Sección guardada");
    } catch (e) { handleErrorMessages(e); }
    finally { setPagSaving(false); }
  };

  const faqPayload = () => ({
    titulo: (faqForm.titulo || "").trim(),
    contenido: faqForm.contenido ?? "",
    icono: faqForm.icono || "fas fa-spa",
    orden: Number(faqForm.orden) || 0,
    Activo: faqForm.Activo === "N" ? "N" : "S",
  });

  const saveFaq = async () => {
    if (!faqForm.titulo?.trim()) {
      toastError("Escribe la pregunta (título) antes de guardar.");
      return;
    }
    if (!htmlToPlain(faqForm.contenido)) {
      toastError("Escribe el contenido de la respuesta antes de guardar.");
      return;
    }
    setFaqSaving(true);
    try {
      const payload = faqPayload();
      if (faqForm.id) {
        await actualizarFaq(faqForm.id, payload);
        toastSuccess("Pregunta actualizada");
      } else {
        await crear(payload);
        toastSuccess("Pregunta creada");
      }
      await loadFaqs();
      closePanel();
    } catch (e) { handleErrorMessages(e); }
    finally { setFaqSaving(false); }
  };

  const liveFaqs = useMemo(() => {
    if (activeZone !== "faq") return faqs;
    if (faqForm.id) {
      return faqs.map((f) => (f.id === faqForm.id ? { ...f, ...faqForm } : f));
    }
    return [...faqs, { ...faqForm, id: "__draft__" }];
  }, [faqs, faqForm, activeZone]);

  const handleSave = activeZone === "faq" ? saveFaq : savePag;
  const isSaving   = activeZone === "faq" ? faqSaving : pagSaving;

  const doDelete = async () => {
    try { await eliminar(delId); toastSuccess("Pregunta eliminada"); setDelId(null); await loadFaqs(); }
    catch (e) { handleErrorMessages(e); }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 12, minHeight: "100vh", background: "#111827" }}>
      <CircularProgress sx={{ color: RM.pink }} />
    </Box>
  );

  const meta = ZONE_META[activeZone] ?? {};

  return (
    <PageBox>
      {/* ── Header ── */}
      <HeaderBar>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: RM.pink, width: 34, height: 34 }}>
            <SpaIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography fontWeight={800} fontSize={15} lineHeight={1}>Masajes Tántricos · CMS</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
              Haz clic en ✏️ en cada sección del canvas o en editar en las preguntas
            </Typography>
          </Box>
        </Stack>
        <Tooltip title="Ver página pública">
          <IconButton sx={{ color: "rgba(255,255,255,0.6)" }}
            onClick={() => window.open("/masajes", "_blank")} size="small">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </HeaderBar>

      {/* ── Panel FIXED izquierda ─────────────────────────────────── */}
      <CmsPanelRoot open={panelOpen} panelLeft={0} panelWidth={panelWidth}>
        {/* Header zona */}
        <Box sx={{
          px: 2, py: 1.5, flexShrink: 0,
          bgcolor: ACCENT,
          display: "flex", alignItems: "center", gap: 1,
        }}>
          <Typography sx={{ fontSize: 16 }}>{meta.emoji}</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
              {meta.label ?? "Editar"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>
              Los cambios se ven en tiempo real
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel} sx={{ color: "rgba(255,255,255,0.7)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Contenido scrolleable */}
        <Box sx={{
          flex: 1, overflowY: "auto", p: 2,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { background: "rgba(204,107,142,0.35)", borderRadius: 2 },
        }}>
          {panelOpen && (
            <ZoneDrawer
              zone={activeZone}
              pagForm={pagForm}
              onPagField={handlePagField}
              heroPreview={heroPreview}
              onHeroImg={handleHeroImg}
              faqForm={faqForm}
              onFaqField={(k, v) => setFaqForm(p => ({ ...p, [k]: v }))}
            />
          )}
        </Box>

        {/* Footer — botón guardar */}
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Button fullWidth variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveIcon />}
            onClick={handleSave} disabled={isSaving}
            sx={{
              bgcolor: ACCENT, fontWeight: 700, borderRadius: 1,
              "&:hover": { bgcolor: RM.pink },
              "&:disabled": { opacity: 0.6 },
            }}>
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Box>
      </CmsPanelRoot>

      {/* ── Canvas ───────────────────────────────────────────────── */}
      <Box>
        <PageCanvas
          pagForm={pagForm}
          heroPreview={heroPreview}
          activeZone={activeZone}
          onZone={openZone}
          faqs={liveFaqs}
          onEditFaq={openEditFaq}
          onDeleteFaq={id => { if (id !== "__draft__") setDelId(id); }}
          onNewFaq={openNewFaq}
        />
      </Box>

      {/* Confirmar eliminación */}
      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar esta pregunta?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </PageBox>
  );
}
