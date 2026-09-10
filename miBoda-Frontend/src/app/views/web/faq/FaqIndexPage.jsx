import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, Button,
  TextField, Divider, Stack, Dialog, DialogTitle, DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon           from "@mui/icons-material/Edit";
import DeleteOutlineIcon  from "@mui/icons-material/DeleteOutline";
import AddIcon            from "@mui/icons-material/Add";
import SaveIcon           from "@mui/icons-material/Save";
import CloseIcon          from "@mui/icons-material/Close";
import RemoveIcon         from "@mui/icons-material/Remove";
import HelpOutlineIcon    from "@mui/icons-material/HelpOutline";
import PhotoCameraIcon    from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon  from "@mui/icons-material/ImageOutlined";
import ArrowUpwardIcon    from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon  from "@mui/icons-material/ArrowDownward";

import { listar, crear, actualizar, eliminar, reorder } from "../../../api/web_masaje_faq.api";
import { obtener as obtenerPagina, actualizar as actualizarPagina } from "../../../api/web_pagina_faq.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot      from "app/components/cms/CmsPanelRoot";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import { authJWTConfig } from "app/authJWTConfig";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

/* ── Paletas ─────────────────────────────────────────────────────── */
const RM = { brown:"#2c1a0e", mid:"#4a2a15", pink:"#cc6b8e", deepPink:"#a0455e" };
const PP = {
  text:  "#f5e6e2",
  muted: "#d3b3ae",
  gold:  "#d9a56b",
  card:  "rgba(255,255,255,0.045)",
  cardActive: "rgba(217,165,107,0.14)",
  border:"rgba(255,255,255,0.10)",
  serif: "'Playfair Display','PT Serif',Georgia,serif",
};
const SITE_BG = `
  radial-gradient(circle at 12% 8%, rgba(122,6,6,.30) 0%, transparent 45%),
  radial-gradient(circle at 88% 92%, rgba(122,6,6,.25) 0%, transparent 50%),
  linear-gradient(160deg, #12070a 0%, #2a0f16 30%, #33141a 50%, #1c0d10 72%, #12070a 100%)`;

const PageBox = styled(Box)({ padding:16, minHeight:"100vh", backgroundColor:"#f0f4f8" });
const HeaderBar = styled(Box)({
  padding:"9px 14px", marginBottom:16, borderRadius:10,
  background:`linear-gradient(135deg,${RM.brown},${RM.mid})`,
  color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between",
  boxShadow:"0 3px 12px rgba(44,26,14,0.35)",
});
const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root":{ backgroundColor:"rgba(255,255,255,0.07)", borderRadius:6 },
  "& .MuiInputBase-input, & .MuiInputBase-inputMultiline":{ color:"#f1f5f9" },
  "& .MuiInputLabel-root":{ color:"#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline":{ borderColor:"rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:"rgba(204,107,142,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:RM.pink },
  "& .MuiInputLabel-root.Mui-focused":{ color:RM.pink },
}));
const SectionTag = styled(Typography)({
  fontSize:"0.60rem", fontWeight:700, letterSpacing:"0.10em",
  textTransform:"uppercase", color:RM.pink, marginBottom:6, marginTop:2,
});
const Sep = () => <Divider sx={{ borderColor:"rgba(255,255,255,0.08)", my:1.5 }} />;

/* ── Imagen upload (panel header) ────────────────────────────────── */
const ImgUpload = ({ preview, currentUrl, onFile, onRemove }) => {
  const ref = useRef(null);
  const src = preview || (currentUrl ? `${BASE}${currentUrl}` : null);
  return (
    <Box sx={{ mb:1.5 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if(f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width:"100%", height:150, borderRadius:2, overflow:"hidden",
        border:`2px dashed ${src?"rgba(204,107,142,0.6)":"rgba(255,255,255,0.18)"}`,
        bgcolor:"rgba(255,255,255,0.05)", display:"flex",
        alignItems:"center", justifyContent:"center",
        cursor:"pointer", position:"relative",
        "&:hover":{ borderColor:RM.pink }, "&:hover .cam-ov":{ opacity:1 },
      }}>
        {src ? (
          <>
            <Box component="img" src={src} sx={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <Box className="cam-ov" sx={{ position:"absolute", inset:0, bgcolor:"rgba(0,0,0,0.5)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              opacity:0, transition:"opacity 0.25s" }}>
              <PhotoCameraIcon sx={{ color:"#fff", fontSize:24 }} />
              <Typography variant="caption" sx={{ color:"#fff", fontSize:"0.60rem", mt:0.3 }}>Cambiar imagen</Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0.5, color:"#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize:36, opacity:0.5 }} />
            <Typography variant="caption" sx={{ fontSize:"0.62rem" }}>Clic para subir imagen</Typography>
          </Box>
        )}
      </Box>
      {preview && (
        <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize:14 }} />}
          onClick={onRemove} sx={{ color:"#ef4444", textTransform:"none", fontSize:"0.68rem", mt:0.3 }}>
          Quitar imagen nueva
        </Button>
      )}
    </Box>
  );
};

/* ── Panel edición de pregunta ───────────────────────────────────── */
function ItemPanel({ open, panelLeft, form, saving, onChange, onSave, onClose }) {
  const f = (k, v) => onChange(k, v);
  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ px:2, py:1.5, display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        gap:1, borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:`linear-gradient(135deg,${RM.brown},${RM.mid})`, position:"sticky", top:0, zIndex:1 }}>
        <Box sx={{ flex:1 }}>
          <Typography fontWeight={700} sx={{ color:"#f1f5f9", fontSize:"0.83rem" }}>
            {form.id ? "✏️ Editar pregunta" : "➕ Nueva pregunta"}
          </Typography>
          <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.5)", fontSize:"0.60rem", display:"block" }}>
            {form.titulo || "Pregunta frecuente"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color:"rgba(255,255,255,0.6)", "&:hover":{ color:RM.pink } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px:2, py:1.5, flex:1, overflow:"auto" }}>
        <SectionTag>Pregunta</SectionTag>
        <DarkField size="small" fullWidth multiline rows={2} sx={{ mb:1.5 }}
          placeholder="¿Qué tipo de masajes ofrecen?"
          value={form.titulo||""} onChange={e => f("titulo", e.target.value)} />
        <SectionTag>Respuesta</SectionTag>
        <DarkField size="small" fullWidth multiline rows={6} sx={{ mb:1.5 }}
          placeholder="Escribe la respuesta…"
          value={form.contenido||""} onChange={e => f("contenido", e.target.value)} />
      </Box>

      <Box sx={{ px:2, py:1.5, borderTop:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(0,0,0,0.25)", position:"sticky", bottom:0 }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={onSave} disabled={saving || !form.titulo || !form.contenido}
            sx={{ bgcolor:RM.pink, fontWeight:700, borderRadius:2, textTransform:"none", "&:hover":{ bgcolor:RM.deepPink } }}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
          <Button variant="outlined" onClick={onClose}
            sx={{ borderColor:"rgba(255,255,255,0.20)", color:"#94a3b8", minWidth:44 }}>
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>
    </CmsPanelRoot>
  );
}

/* ── Panel edición del encabezado ────────────────────────────────── */
function HeaderPanel({ open, panelLeft, form, imgPreview, currentImg, saving, onChange, onFile, onRemoveFile, onSave, onClose }) {
  const f = (k, v) => onChange(k, v);
  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ px:2, py:1.5, display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        gap:1, borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:`linear-gradient(135deg,${RM.brown},${RM.mid})`, position:"sticky", top:0, zIndex:1 }}>
        <Box sx={{ flex:1 }}>
          <Typography fontWeight={700} sx={{ color:"#f1f5f9", fontSize:"0.83rem" }}>📝 Encabezado de la sección</Typography>
          <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.5)", fontSize:"0.60rem", display:"block" }}>
            Etiqueta, título, descripción e imagen
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color:"rgba(255,255,255,0.6)", "&:hover":{ color:RM.pink } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px:2, py:1.5, flex:1, overflow:"auto" }}>
        <SectionTag>Imagen de la sección</SectionTag>
        <ImgUpload preview={imgPreview} currentUrl={currentImg} onFile={onFile} onRemove={onRemoveFile} />
        <Sep />
        <SectionTag>Etiqueta superior (dorada)</SectionTag>
        <DarkField size="small" fullWidth sx={{ mb:1.5 }} placeholder="Antes de su visita"
          value={form.intro_label||""} onChange={e => f("intro_label", e.target.value)} />
        <SectionTag>Título</SectionTag>
        <DarkField size="small" fullWidth multiline rows={2} sx={{ mb:1.5 }} placeholder="Preguntas frecuentes · Amour Spa"
          value={form.titulo||""} onChange={e => f("titulo", e.target.value)} />
        <SectionTag>Descripción</SectionTag>
        <DarkField size="small" fullWidth multiline rows={3} sx={{ mb:1.5 }}
          placeholder="Todo lo esencial antes de cruzar nuestro umbral…"
          value={form.subtitulo||""} onChange={e => f("subtitulo", e.target.value)} />
      </Box>

      <Box sx={{ px:2, py:1.5, borderTop:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(0,0,0,0.25)", position:"sticky", bottom:0 }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={onSave} disabled={saving}
            sx={{ bgcolor:RM.pink, fontWeight:700, borderRadius:2, textTransform:"none", "&:hover":{ bgcolor:RM.deepPink } }}>
            {saving ? "Guardando…" : "Guardar encabezado"}
          </Button>
          <Button variant="outlined" onClick={onClose}
            sx={{ borderColor:"rgba(255,255,255,0.20)", color:"#94a3b8", minWidth:44 }}>
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>
    </CmsPanelRoot>
  );
}

/* ── Ítem del acordeón (preview + controles admin) ───────────────── */
function FaqItem({ item, isOpen, onToggle, onEdit, onDelete, onUp, onDown, first, last }) {
  return (
    <Box sx={{ borderRadius:"10px", overflow:"hidden",
      bgcolor: isOpen ? PP.cardActive : PP.card, border:`1px solid ${PP.border}`,
      transition:"background .2s", "&:hover .faq-ctrls":{ opacity:1 } }}>
      <Box onClick={onToggle} sx={{ display:"flex", alignItems:"center", gap:1,
        px:2, py:1.4, cursor:"pointer" }}>
        <Typography sx={{ flex:1, color:PP.text, fontFamily:PP.serif, fontSize:"1rem", fontWeight:600 }}>
          {item.titulo || "Pregunta sin título"}
        </Typography>

        {/* Controles admin */}
        <Box className="faq-ctrls" sx={{ display:"flex", gap:0.3, opacity:0, transition:"opacity .2s" }}
          onClick={e => e.stopPropagation()}>
          <Tooltip title="Subir"><span>
            <IconButton size="small" onClick={onUp} disabled={first}
              sx={{ color:"rgba(245,230,226,0.7)", "&:hover":{ color:PP.gold } }}>
              <ArrowUpwardIcon sx={{ fontSize:15 }} />
            </IconButton></span></Tooltip>
          <Tooltip title="Bajar"><span>
            <IconButton size="small" onClick={onDown} disabled={last}
              sx={{ color:"rgba(245,230,226,0.7)", "&:hover":{ color:PP.gold } }}>
              <ArrowDownwardIcon sx={{ fontSize:15 }} />
            </IconButton></span></Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={onEdit}
              sx={{ color:"rgba(245,230,226,0.7)", "&:hover":{ color:PP.gold } }}>
              <EditIcon sx={{ fontSize:15 }} />
            </IconButton></Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={onDelete}
              sx={{ color:"rgba(245,120,120,0.8)", "&:hover":{ color:"#ef4444" } }}>
              <DeleteOutlineIcon sx={{ fontSize:15 }} />
            </IconButton></Tooltip>
        </Box>

        {/* Icono +/- (como el frontend) */}
        <Box sx={{ width:28, height:28, borderRadius:"6px", flexShrink:0,
          border:`1px solid ${PP.gold}`, color:PP.gold,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {isOpen ? <RemoveIcon sx={{ fontSize:16 }} /> : <AddIcon sx={{ fontSize:16 }} />}
        </Box>
      </Box>

      {isOpen && (
        <Box sx={{ px:2, pb:1.8, pt:0 }}>
          <Divider sx={{ borderColor:PP.border, mb:1.2 }} />
          <Typography sx={{ color:PP.muted, fontSize:"0.86rem", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
            {item.contenido || "Sin respuesta."}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
const emptyItem = () => ({ id:null, titulo:"", contenido:"", icono:"fas fa-spa", Activo:"S" });

export default function FaqIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelMode, setPanelMode] = useState(null);   // 'item' | 'header' | null
  const panelOpen = panelMode !== null;
  useCmsPanelPush(panelOpen);

  const [items,   setItems]   = useState([]);
  const [header,  setHeader]  = useState({ intro_label:"", titulo:"", subtitulo:"", url_imagen:"" });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [openId,  setOpenId]  = useState(null);        // acordeón abierto

  const [itemForm, setItemForm] = useState(emptyItem());
  const [headerForm, setHeaderForm] = useState({ intro_label:"", titulo:"", subtitulo:"" });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [delId, setDelId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [faqs, pag] = await Promise.all([listar(), obtenerPagina().catch(() => null)]);
      const list = Array.isArray(faqs) ? faqs : (faqs?.result ?? faqs?.data ?? []);
      setItems(list ?? []);
      if (list?.length) setOpenId(list[0].id);
      const p = pag?.result ?? pag?.data ?? pag ?? {};
      setHeader({
        intro_label: p.intro_label ?? "",
        titulo:      p.titulo ?? "",
        subtitulo:   p.subtitulo ?? "",
        url_imagen:  p.url_imagen ?? "",
      });
    } catch(e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openItem = it => { setItemForm(it ? { ...it } : emptyItem()); setPanelMode("item"); };
  const openHeader = () => {
    setHeaderForm({ intro_label:header.intro_label, titulo:header.titulo, subtitulo:header.subtitulo });
    setImgFile(null); setImgPreview(null);
    setPanelMode("header");
  };
  const closePanel = () => { setPanelMode(null); setImgFile(null); setImgPreview(null); };

  const handleImg = f => {
    setImgFile(f);
    const r = new FileReader();
    r.onload = ev => setImgPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const saveItem = async () => {
    setSaving(true);
    try {
      if (itemForm.id) {
        await actualizar(itemForm.id, { titulo:itemForm.titulo, contenido:itemForm.contenido, icono:itemForm.icono || "fas fa-spa", Activo:"S" });
        toastSuccess("Pregunta actualizada");
      } else {
        const orden = (items.reduce((m,i) => Math.max(m, Number(i.orden)||0), 0)) + 1;
        await crear({ titulo:itemForm.titulo, contenido:itemForm.contenido, icono:"fas fa-spa", orden, Activo:"S" });
        toastSuccess("Pregunta creada");
      }
      closePanel(); load();
    } catch(e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const saveHeader = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("intro_label", headerForm.intro_label || "");
      fd.append("titulo",      headerForm.titulo || "");
      fd.append("subtitulo",   headerForm.subtitulo || "");
      if (imgFile) fd.append("imagen", imgFile);
      await actualizarPagina(fd);
      toastSuccess("Encabezado actualizado");
      closePanel(); load();
    } catch(e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try { await eliminar(delId); toastSuccess("Pregunta eliminada"); setDelId(null); load(); }
    catch(e) { handleErrorMessages(e); }
  };

  const move = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    try { await reorder(next.map((it, i) => ({ id: it.id, orden: i + 1 }))); }
    catch(e) { handleErrorMessages(e); load(); }
  };

  if (loading) return (
    <Box sx={{ display:"flex", justifyContent:"center", mt:8 }}>
      <CircularProgress sx={{ color:RM.pink }} />
    </Box>
  );

  const imgSrc = header.url_imagen ? `${BASE}${header.url_imagen}` : null;

  return (
    <>
      {panelMode === "item" && (
        <ItemPanel open={panelOpen} panelLeft={panelLeft} form={itemForm} saving={saving}
          onChange={(k,v) => setItemForm(p => ({ ...p, [k]:v }))}
          onSave={saveItem} onClose={closePanel} />
      )}
      {panelMode === "header" && (
        <HeaderPanel open={panelOpen} panelLeft={panelLeft} form={headerForm}
          imgPreview={imgPreview} currentImg={header.url_imagen} saving={saving}
          onChange={(k,v) => setHeaderForm(p => ({ ...p, [k]:v }))}
          onFile={handleImg} onRemoveFile={() => { setImgFile(null); setImgPreview(null); }}
          onSave={saveHeader} onClose={closePanel} />
      )}

      <PageBox>
        <HeaderBar>
          <Stack direction="row" alignItems="center" gap={1}>
            <HelpOutlineIcon sx={{ fontSize:18, opacity:0.9 }} />
            <Typography sx={{ fontSize:"0.83rem", fontWeight:700 }}>Preguntas Frecuentes</Typography>
            <Typography sx={{ fontSize:"0.72rem", opacity:0.6 }}>· {items.length} preguntas</Typography>
          </Stack>
          <Tooltip title="Agregar pregunta">
            <Button size="small" variant="contained" startIcon={<AddIcon />}
              onClick={() => openItem(null)}
              sx={{ bgcolor:"#f97316", fontWeight:700, borderRadius:"20px",
                fontSize:"0.75rem", px:2, textTransform:"none", "&:hover":{ bgcolor:"#ea580c" } }}>
              + Nueva pregunta
            </Button>
          </Tooltip>
        </HeaderBar>

        {/* ══ CANVAS — réplica del FAQ público ══ */}
        <Box sx={{ borderRadius:2, overflow:"hidden", border:"1px solid #e8d5c0",
          boxShadow:"0 2px 20px rgba(0,0,0,0.10)", background:SITE_BG }}>
          <Box sx={{ display:"flex", flexWrap:{ xs:"wrap", md:"nowrap" }, alignItems:"stretch" }}>

            {/* Imagen izquierda */}
            <Box sx={{ flex:{ xs:"1 1 100%", md:"0 0 40%" }, position:"relative", minHeight:360,
              display:{ xs:"none", md:"block" } }}>
              {imgSrc ? (
                <Box component="img" src={imgSrc} alt="FAQ"
                  sx={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
              ) : (
                <Box sx={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
                  justifyContent:"center", bgcolor:"#2a1a12", color:"#7a5a48" }}>
                  <ImageOutlinedIcon sx={{ fontSize:48, opacity:0.5 }} />
                </Box>
              )}
            </Box>

            {/* Contenido derecha */}
            <Box sx={{ flex:1, minWidth:0, p:{ xs:"32px 22px", md:"44px 40px" }, position:"relative" }}>
              {/* Editar encabezado */}
              <Tooltip title="Editar encabezado">
                <IconButton size="small" onClick={openHeader} sx={{
                  position:"absolute", top:14, right:14,
                  bgcolor:"rgba(217,165,107,0.9)", color:"#2c1408", width:30, height:30,
                  "&:hover":{ bgcolor:PP.gold, transform:"scale(1.1)" }, transition:"all .2s" }}>
                  <EditIcon sx={{ fontSize:15 }} />
                </IconButton>
              </Tooltip>

              <Typography sx={{ color:PP.gold, fontFamily:PP.serif, fontStyle:"italic", fontSize:"1rem", mb:1 }}>
                {header.intro_label || "Antes de su visita"}
              </Typography>
              <Typography sx={{ color:PP.text, fontFamily:PP.serif, fontWeight:700,
                fontSize:{ xs:"1.5rem", md:"2rem" }, lineHeight:1.2, mb:1.2 }}>
                {header.titulo || "Preguntas frecuentes · Amour Spa"}
              </Typography>
              <Typography sx={{ color:PP.muted, fontSize:"0.9rem", mb:3, maxWidth:520 }}>
                {header.subtitulo || "Todo lo esencial antes de cruzar nuestro umbral en Diez Canseco."}
              </Typography>

              {/* Acordeón */}
              {items.length === 0 ? (
                <Box sx={{ textAlign:"center", py:5, color:PP.muted }}>
                  <HelpOutlineIcon sx={{ fontSize:44, opacity:0.3, display:"block", mx:"auto", mb:1.5 }} />
                  <Typography sx={{ fontSize:"0.9rem" }}>Aún no hay preguntas.</Typography>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openItem(null)}
                    sx={{ mt:2, borderColor:PP.gold, color:PP.gold, borderRadius:20, textTransform:"none" }}>
                    Agregar la primera
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display:"flex", flexDirection:"column", gap:1.5 }}>
                  {items.map((it, i) => (
                    <FaqItem key={it.id} item={it}
                      isOpen={openId === it.id}
                      onToggle={() => setOpenId(openId === it.id ? null : it.id)}
                      onEdit={() => openItem(it)}
                      onDelete={() => setDelId(it.id)}
                      onUp={() => move(i, -1)} onDown={() => move(i, +1)}
                      first={i === 0} last={i === items.length - 1} />
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ px:4, py:1.3, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.4)", textAlign:"right" }}>
              Vista previa del sitio · tiempo real
            </Typography>
          </Box>
        </Box>
      </PageBox>

      {/* Confirmar eliminación */}
      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle sx={{ fontWeight:700 }}>¿Eliminar esta pregunta?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
