import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, Button,
  TextField, MenuItem, Select, InputLabel, FormControl, Divider,
  Stack, Dialog, DialogTitle, DialogActions, Switch,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon           from "@mui/icons-material/Edit";
import DeleteOutlineIcon  from "@mui/icons-material/DeleteOutline";
import AddIcon            from "@mui/icons-material/Add";
import SaveIcon           from "@mui/icons-material/Save";
import CloseIcon          from "@mui/icons-material/Close";
import PhotoCameraIcon    from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon  from "@mui/icons-material/ImageOutlined";
import SpaIcon            from "@mui/icons-material/Spa";
import StarIcon           from "@mui/icons-material/Star";
import StarBorderIcon     from "@mui/icons-material/StarBorder";

import { listar, crear, actualizar, eliminar } from "../../../api/web_experiencias.api";
import { obtener as obtenerPagina, actualizar as actualizarPagina } from "../../../api/web_pagina_masajes.api";
import { toastSuccess, handleErrorMessages }   from "../../../components/notify-messages";
import CmsPanelRoot      from "app/components/cms/CmsPanelRoot";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";
import { authJWTConfig } from "app/authJWTConfig";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

/* ── Paleta admin + paleta "Dark Passion" del sitio público ─────────── */
const RM = { brown:"#2c1a0e", mid:"#4a2a15", pink:"#cc6b8e", deepPink:"#a0455e", gold:"#b8860b" };
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

const CATS = [
  { key:"tantrico",  label:"Tántricas & Sensoriales" },
  { key:"bienestar", label:"Bienestar Femenino" },
  { key:"corporal",  label:"Renovación Corporal" },
  { key:"estetica",  label:"Modelación & Estética" },
];

/* ── Styled ──────────────────────────────────────────────────────── */
const PageBox = styled(Box)({ padding:16, minHeight:"100vh", backgroundColor:"#f0f4f8" });

const HeaderBar = styled(Box)({
  padding:"9px 14px", marginBottom:16, borderRadius:10,
  background:`linear-gradient(135deg,${RM.brown},${RM.mid})`,
  color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between",
  boxShadow:"0 3px 12px rgba(44,26,14,0.35)",
});

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root":{ backgroundColor:"rgba(255,255,255,0.07)", borderRadius:6 },
  "& .MuiInputBase-input":{ color:"#f1f5f9" },
  "& .MuiInputBase-inputMultiline":{ color:"#f1f5f9" },
  "& .MuiInputLabel-root":{ color:"#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline":{ borderColor:"rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:"rgba(204,107,142,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:RM.pink },
  "& .MuiInputLabel-root.Mui-focused":{ color:RM.pink },
}));

const DarkSelect = styled(Select)(() => ({
  backgroundColor:"rgba(255,255,255,0.07)", color:"#f1f5f9", borderRadius:6,
  "& .MuiOutlinedInput-notchedOutline":{ borderColor:"rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:"rgba(204,107,142,0.6)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:RM.pink },
  "& .MuiSelect-icon":{ color:"#94a3b8" }, "& .MuiSelect-select":{ color:"#f1f5f9" },
}));

const SectionTag = styled(Typography)({
  fontSize:"0.60rem", fontWeight:700, letterSpacing:"0.10em",
  textTransform:"uppercase", color:RM.pink, marginBottom:6, marginTop:2,
});
const Sep = () => <Divider sx={{ borderColor:"rgba(255,255,255,0.08)", my:1.5 }} />;

/* ── Imagen upload ──────────────────────────────────────────────── */
const ImgUpload = ({ preview, currentUrl, onFile, onRemove, open }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) { onRemove(); if(ref.current) ref.current.value=""; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
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
            <Box className="cam-ov" sx={{
              position:"absolute", inset:0, bgcolor:"rgba(0,0,0,0.5)",
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", opacity:0, transition:"opacity 0.25s",
            }}>
              <PhotoCameraIcon sx={{ color:"#fff", fontSize:24 }} />
              <Typography variant="caption" sx={{ color:"#fff", fontSize:"0.60rem", mt:0.3 }}>Cambiar foto</Typography>
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
        <Box sx={{ display:"flex", alignItems:"center", mt:0.5, gap:0.4 }}>
          <IconButton size="small" sx={{ color:"#ef4444", p:0.3 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize:15 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color:"#22c55e", fontSize:"0.60rem" }}>Nueva imagen lista ✓</Typography>
        </Box>
      )}
    </Box>
  );
};

/* ── Botón flotante sobre la tarjeta ─────────────────────────────── */
const FloatBtn = ({ title, onClick, children, sx }) => (
  <Tooltip title={title}>
    <IconButton size="small" onClick={onClick} sx={{
      width:28, height:28, backdropFilter:"blur(4px)", color:"#fff",
      transition:"all .2s", "&:hover":{ transform:"scale(1.1)" }, ...sx,
    }}>
      {children}
    </IconButton>
  </Tooltip>
);

/* ── Card estilo público (project-card overlay) + controles admin ── */
function CanvasCard({ item, onEdit, onDelete, onToggleStar }) {
  const img = item._preview || (item.url_imagen ? `${BASE}${item.url_imagen}` : null);
  const isActive = item.Activo === "S";
  const isStar   = Number(item.destacado) === 1;

  return (
    <Box sx={{
      position:"relative", borderRadius:"14px", overflow:"hidden",
      aspectRatio:"3 / 4", boxShadow:"0 8px 28px rgba(0,0,0,0.35)",
      opacity: isActive ? 1 : 0.5,
      "&:hover .card-img":{ transform:"scale(1.06)" },
      "&:hover .card-ctrls":{ opacity:1 },
    }}>
      {/* Imagen */}
      {img ? (
        <Box className="card-img" component="img" src={img} alt={item.titulo}
          sx={{ position:"absolute", inset:0, width:"100%", height:"100%",
            objectFit:"cover", transition:"transform .5s" }} />
      ) : (
        <Box sx={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", bgcolor:"#2a1a12", color:"#7a5a48" }}>
          <ImageOutlinedIcon sx={{ fontSize:48, opacity:0.5 }} />
        </Box>
      )}

      {/* Overlay degradado */}
      <Box sx={{ position:"absolute", inset:0,
        background:"linear-gradient(to top, rgba(18,7,10,0.92) 0%, rgba(18,7,10,0.25) 45%, rgba(18,7,10,0.05) 100%)" }} />

      {/* Badge destacado (esquina sup. izq) */}
      {isStar && (
        <Box sx={{ position:"absolute", top:10, left:10, zIndex:5,
          display:"inline-flex", alignItems:"center", gap:"4px",
          bgcolor:"rgba(217,165,107,0.95)", color:"#2c1408",
          px:1, py:"3px", borderRadius:"50px", fontSize:"10px", fontWeight:800 }}>
          <StarIcon sx={{ fontSize:12 }} /> En inicio
        </Box>
      )}
      {/* Badge inactivo */}
      {!isActive && (
        <Box sx={{ position:"absolute", bottom:10, left:10, zIndex:5,
          bgcolor:"rgba(0,0,0,0.7)", color:"#fbbf24",
          px:1, py:"2px", borderRadius:"6px", fontSize:"9px", fontWeight:700 }}>
          Oculto en el sitio
        </Box>
      )}

      {/* Controles admin (aparecen al hover) */}
      <Box className="card-ctrls" sx={{
        position:"absolute", top:8, right:8, zIndex:10,
        display:"flex", gap:0.6, opacity:0, transition:"opacity .2s",
      }}>
        <FloatBtn title={isStar ? "Quitar del inicio" : "Mostrar en el inicio"}
          onClick={onToggleStar}
          sx={{ bgcolor: isStar ? "rgba(217,165,107,0.95)" : "rgba(44,26,14,0.85)",
            color: isStar ? "#2c1408" : "#fff",
            "&:hover":{ bgcolor: isStar ? "#c9945b" : RM.brown } }}>
          {isStar ? <StarIcon sx={{ fontSize:15 }} /> : <StarBorderIcon sx={{ fontSize:15 }} />}
        </FloatBtn>
        <FloatBtn title="Editar" onClick={onEdit}
          sx={{ bgcolor:"rgba(44,26,14,0.85)", "&:hover":{ bgcolor:RM.brown } }}>
          <EditIcon sx={{ fontSize:14 }} />
        </FloatBtn>
        <FloatBtn title="Eliminar" onClick={onDelete}
          sx={{ bgcolor:"rgba(239,68,68,0.85)", "&:hover":{ bgcolor:"#dc2626" } }}>
          <DeleteOutlineIcon sx={{ fontSize:14 }} />
        </FloatBtn>
      </Box>

      {/* Info inferior */}
      <Box sx={{ position:"absolute", left:0, right:0, bottom:0, zIndex:4, p:"16px" }}>
        {(item.subtitulo || item.badge) && (
          <Typography sx={{ color:PP.gold, fontSize:"11px", fontWeight:700,
            letterSpacing:"0.6px", mb:0.5 }}>
            {item.subtitulo || item.badge}
          </Typography>
        )}
        <Typography sx={{ color:PP.text, fontFamily:PP.serif, fontSize:"1.05rem",
          fontWeight:700, lineHeight:1.25 }}>
          {item.titulo || "Sin título"}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Panel edición de tarjeta ─────────────────────────────────────── */
function CardEditPanel({ open, panelLeft, form, preview, saving, onFormChange, onFile, onRemoveFile, onSave, onClose }) {
  const f = (k, v) => onFormChange(k, v);
  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ px:2, py:1.5, display:"flex", alignItems:"flex-start",
        justifyContent:"space-between", gap:1,
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:`linear-gradient(135deg,${RM.brown},${RM.mid})`,
        position:"sticky", top:0, zIndex:1 }}>
        <Box sx={{ flex:1 }}>
          <Typography fontWeight={700} sx={{ color:"#f1f5f9", fontSize:"0.83rem" }}>
            {form.id_experiencia ? "✏️ Editar Experiencia" : "➕ Nueva Experiencia"}
          </Typography>
          <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.5)", fontSize:"0.60rem", display:"block" }}>
            {form.titulo || "Completa los campos"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color:"rgba(255,255,255,0.6)", "&:hover":{ color:RM.pink } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px:2, py:1.5, flex:1, overflow:"auto",
        "&::-webkit-scrollbar":{ width:4 },
        "&::-webkit-scrollbar-thumb":{ background:"rgba(204,107,142,0.3)", borderRadius:2 } }}>

        <SectionTag>Imagen de la tarjeta</SectionTag>
        <ImgUpload preview={preview} currentUrl={form.url_imagen}
          onFile={onFile} onRemove={onRemoveFile} open={open} />

        {/* Destacado */}
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          px:1.2, py:1, borderRadius:2, mb:1.5,
          background:"rgba(217,165,107,0.12)", border:"1px solid rgba(217,165,107,0.3)" }}>
          <Box>
            <Typography sx={{ color:"#f1e0c8", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:0.5 }}>
              <StarIcon sx={{ fontSize:15, color:PP.gold }} /> Mostrar en el inicio
            </Typography>
            <Typography sx={{ color:"#94a3b8", fontSize:"0.58rem" }}>
              Solo las destacadas aparecen en la página de inicio.
            </Typography>
          </Box>
          <Switch checked={Number(form.destacado)===1} size="small"
            onChange={e => f("destacado", e.target.checked ? 1 : 0)}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked":{ color:PP.gold },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":{ bgcolor:PP.gold } }} />
        </Box>
        <Sep />

        <SectionTag>Identificación</SectionTag>
        <FormControl fullWidth size="small" sx={{ mb:1.5 }}>
          <InputLabel sx={{ color:"#94a3b8", "&.Mui-focused":{ color:RM.pink } }}>Categoría</InputLabel>
          <DarkSelect value={form.categoria||""} label="Categoría"
            onChange={e => f("categoria", e.target.value)}
            MenuProps={{ PaperProps:{ sx:{ bgcolor:"#1e293b", color:"#f1f5f9" } } }}>
            {CATS.map(c => (
              <MenuItem key={c.key} value={c.key}
                sx={{ fontSize:"0.82rem", "&:hover":{ bgcolor:"rgba(204,107,142,0.15)" } }}>
                {c.label}
              </MenuItem>
            ))}
          </DarkSelect>
        </FormControl>

        <DarkField size="small" fullWidth label="Badge (ej: NURU PREMIUM)" sx={{ mb:1.5 }}
          value={form.badge||""} onChange={e => f("badge", e.target.value)} />
        <DarkField size="small" fullWidth label="Duración (ej: 90 – 120 min)" sx={{ mb:1.5 }}
          value={form.duracion||""} onChange={e => f("duracion", e.target.value)} />

        <Sep />
        <SectionTag>Contenido</SectionTag>
        <DarkField size="small" fullWidth label="Título *" sx={{ mb:1.5 }}
          value={form.titulo||""} onChange={e => f("titulo", e.target.value)} />
        <DarkField size="small" fullWidth label="Subtítulo (ej: DESPERTAR DE LOS SENTIDOS)" sx={{ mb:1.5 }}
          value={form.subtitulo||""} onChange={e => f("subtitulo", e.target.value)} />
        <DarkField size="small" fullWidth label="Descripción" multiline rows={4} sx={{ mb:1.5 }}
          value={form.descripcion||""} onChange={e => f("descripcion", e.target.value)} />

        <Sep />
        <SectionTag>Precio & Botón</SectionTag>
        <DarkField size="small" fullWidth label="Texto de precio (ej: Desde S/ 180)" sx={{ mb:1.5 }}
          value={form.precio_nota||""} onChange={e => f("precio_nota", e.target.value)} />
        <DarkField size="small" fullWidth label="Texto botón (ej: Reservar)" sx={{ mb:1.5 }}
          value={form.btn_texto||""} onChange={e => f("btn_texto", e.target.value)} />

        <Sep />
        <SectionTag>Configuración</SectionTag>
        <DarkField size="small" fullWidth label="Orden (número)" type="number" sx={{ mb:1.5 }}
          value={form.orden||""} onChange={e => f("orden", e.target.value)} />
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          px:1, py:0.8, borderRadius:2, background:"rgba(255,255,255,0.05)" }}>
          <Typography sx={{ color:"#94a3b8", fontSize:12 }}>Visible en el sitio</Typography>
          <Switch checked={form.Activo==="S"} size="small"
            onChange={e => f("Activo", e.target.checked ? "S" : "N")}
            sx={{ "& .MuiSwitch-thumb":{ bgcolor: form.Activo==="S" ? RM.pink : "#666" } }} />
        </Box>
      </Box>

      <Box sx={{ px:2, py:1.5, borderTop:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(0,0,0,0.25)", position:"sticky", bottom:0 }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={onSave} disabled={saving}
            sx={{ bgcolor:RM.pink, fontWeight:700, borderRadius:2,
              textTransform:"none", "&:hover":{ bgcolor:RM.deepPink } }}>
            {saving ? "Guardando…" : "Guardar cambios"}
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

/* ── Panel edición del encabezado (descripción de la página) ──────── */
function HeaderEditPanel({ open, panelLeft, form, saving, onFormChange, onSave, onClose }) {
  const f = (k, v) => onFormChange(k, v);
  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ px:2, py:1.5, display:"flex", alignItems:"flex-start",
        justifyContent:"space-between", gap:1,
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:`linear-gradient(135deg,${RM.brown},${RM.mid})`,
        position:"sticky", top:0, zIndex:1 }}>
        <Box sx={{ flex:1 }}>
          <Typography fontWeight={700} sx={{ color:"#f1f5f9", fontSize:"0.83rem" }}>
            📝 Encabezado de la sección
          </Typography>
          <Typography variant="caption" sx={{ color:"rgba(255,255,255,0.5)", fontSize:"0.60rem", display:"block" }}>
            Etiqueta, título y descripción de la página de servicios
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color:"rgba(255,255,255,0.6)", "&:hover":{ color:RM.pink } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px:2, py:1.5, flex:1, overflow:"auto" }}>
        <SectionTag>Etiqueta superior (dorada)</SectionTag>
        <DarkField size="small" fullWidth sx={{ mb:1.5 }}
          placeholder="Notre Galerie · Cada Ritual, Un Momento"
          value={form.intro_label||""} onChange={e => f("intro_label", e.target.value)} />

        <SectionTag>Título principal</SectionTag>
        <DarkField size="small" fullWidth multiline rows={2} sx={{ mb:1.5 }}
          placeholder="Doce rituales para el cuerpo y la piel"
          value={form.intro_titulo||""} onChange={e => f("intro_titulo", e.target.value)} />
        <Typography sx={{ color:"#94a3b8", fontSize:"0.58rem", mb:1.5 }}>
          Se muestra en MAYÚSCULAS en el sitio.
        </Typography>

        <SectionTag>Descripción</SectionTag>
        <DarkField size="small" fullWidth multiline rows={3} sx={{ mb:1.5 }}
          placeholder="De las piedras calientes al Signature Amour…"
          value={form.intro_subtitulo||""} onChange={e => f("intro_subtitulo", e.target.value)} />
      </Box>

      <Box sx={{ px:2, py:1.5, borderTop:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(0,0,0,0.25)", position:"sticky", bottom:0 }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={onSave} disabled={saving}
            sx={{ bgcolor:RM.pink, fontWeight:700, borderRadius:2,
              textTransform:"none", "&:hover":{ bgcolor:RM.deepPink } }}>
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

/* ═══════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
═══════════════════════════════════════════════════════════════════ */
const emptyForm = () => ({
  id_experiencia: null,
  categoria: "tantrico", badge: "", duracion: "",
  titulo: "", subtitulo: "", descripcion: "",
  precio_nota: "Consultar precio", btn_texto: "Reservar",
  url_imagen: "", orden: "", Activo: "S", destacado: 0,
});

export default function ExperienciasIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelMode, setPanelMode] = useState(null);   // 'card' | 'header' | null
  const panelOpen = panelMode !== null;
  useCmsPanelPush(panelOpen);

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(emptyForm());
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [delId,   setDelId]   = useState(null);

  const [header,  setHeader]  = useState({ intro_label:"", intro_titulo:"", intro_subtitulo:"" });

  const load = async () => {
    setLoading(true);
    try {
      const [exps, pag] = await Promise.all([listar(), obtenerPagina().catch(() => null)]);
      setItems(exps ?? []);
      const p = pag?.result ?? pag?.data ?? pag ?? {};
      setHeader({
        intro_label:     p.intro_label     ?? "",
        intro_titulo:    p.intro_titulo    ?? "",
        intro_subtitulo: p.intro_subtitulo ?? "",
      });
    } catch(e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openEditCard = item => {
    setForm(item ? { ...item } : emptyForm());
    setFile(null); setPreview(null);
    setPanelMode("card");
  };
  const openEditHeader = () => setPanelMode("header");
  const closePanel = () => { setPanelMode(null); setFile(null); setPreview(null); };

  const handleFile = f => {
    setFile(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const saveCard = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v != null && k !== "url_imagen_publica") fd.append(k, v);
      });
      if (file) fd.append("image", file);
      if (form.id_experiencia) { await actualizar(fd); toastSuccess("Experiencia actualizada"); }
      else                     { await crear(fd);     toastSuccess("Experiencia creada"); }
      closePanel(); load();
    } catch(e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const saveHeader = async () => {
    setSaving(true);
    try {
      await actualizarPagina({
        intro_label:     header.intro_label,
        intro_titulo:    header.intro_titulo,
        intro_subtitulo: header.intro_subtitulo,
      });
      toastSuccess("Encabezado actualizado");
      closePanel();
    } catch(e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const toggleStar = async (item) => {
    const nuevo = Number(item.destacado) === 1 ? 0 : 1;
    // Optimista
    setItems(prev => prev.map(i => i.id_experiencia === item.id_experiencia ? { ...i, destacado: nuevo } : i));
    try {
      const fd = new FormData();
      fd.append("id_experiencia", item.id_experiencia);
      fd.append("destacado", nuevo);
      await actualizar(fd);
      toastSuccess(nuevo ? "Se mostrará en el inicio ★" : "Quitada del inicio");
    } catch(e) {
      setItems(prev => prev.map(i => i.id_experiencia === item.id_experiencia ? { ...i, destacado: item.destacado } : i));
      handleErrorMessages(e);
    }
  };

  const doDelete = async () => {
    try { await eliminar(delId); toastSuccess("Eliminada"); setDelId(null); load(); }
    catch(e) { handleErrorMessages(e); }
  };

  /* Preview en tiempo real de la tarjeta en edición */
  const displayItems = items.map(i => {
    if (!form.id_experiencia || i.id_experiencia !== form.id_experiencia || panelMode !== "card") return i;
    return { ...i, ...form, _preview: preview || null };
  });
  const destacadasCount = items.filter(i => Number(i.destacado) === 1).length;

  if (loading) return (
    <Box sx={{ display:"flex", justifyContent:"center", mt:8 }}>
      <CircularProgress sx={{ color:RM.pink }} />
    </Box>
  );

  return (
    <>
      {panelMode === "card" && (
        <CardEditPanel
          open={panelOpen} panelLeft={panelLeft}
          form={form} preview={preview} saving={saving}
          onFormChange={(k,v) => setForm(p => ({ ...p, [k]:v }))}
          onFile={handleFile}
          onRemoveFile={() => { setFile(null); setPreview(null); }}
          onSave={saveCard} onClose={closePanel}
        />
      )}
      {panelMode === "header" && (
        <HeaderEditPanel
          open={panelOpen} panelLeft={panelLeft}
          form={header} saving={saving}
          onFormChange={(k,v) => setHeader(p => ({ ...p, [k]:v }))}
          onSave={saveHeader} onClose={closePanel}
        />
      )}

      <PageBox>
        {/* ── Toolbar admin ── */}
        <HeaderBar>
          <Stack direction="row" alignItems="center" gap={1}>
            <SpaIcon sx={{ fontSize:17, opacity:0.9 }} />
            <Typography sx={{ fontSize:"0.83rem", fontWeight:700 }}>Experiencias / Rituales</Typography>
            <Typography sx={{ fontSize:"0.72rem", opacity:0.6 }}>
              · {items.length} en total · {destacadasCount} en inicio ★
            </Typography>
          </Stack>
          <Tooltip title="Agregar nueva experiencia">
            <Button size="small" variant="contained" startIcon={<AddIcon />}
              onClick={() => openEditCard(null)}
              sx={{ bgcolor:"#f97316", fontWeight:700, borderRadius:"20px",
                fontSize:"0.75rem", px:2, textTransform:"none",
                "&:hover":{ bgcolor:"#ea580c" } }}>
              + Nueva
            </Button>
          </Tooltip>
        </HeaderBar>

        {/* ══ CANVAS — réplica de /servicios ══ */}
        <Box sx={{ borderRadius:2, overflow:"hidden", border:"1px solid #e8d5c0",
          boxShadow:"0 2px 20px rgba(0,0,0,0.10)", background:SITE_BG }}>

          {/* Encabezado editable */}
          <Box sx={{ position:"relative", textAlign:"center", px:{ xs:3, md:6 }, pt:"48px", pb:"32px" }}>
            <Tooltip title="Editar encabezado">
              <IconButton size="small" onClick={openEditHeader} sx={{
                position:"absolute", top:14, right:14,
                bgcolor:"rgba(217,165,107,0.9)", color:"#2c1408", width:30, height:30,
                "&:hover":{ bgcolor:PP.gold, transform:"scale(1.1)" }, transition:"all .2s" }}>
                <EditIcon sx={{ fontSize:15 }} />
              </IconButton>
            </Tooltip>
            <Typography sx={{ color:PP.gold, fontFamily:PP.serif, fontStyle:"italic",
              fontSize:"1rem", mb:1 }}>
              {header.intro_label || "Notre Galerie · Cada Ritual, Un Momento"}
            </Typography>
            <Typography sx={{ color:PP.text, fontFamily:PP.serif, fontWeight:700,
              fontSize:{ xs:"1.7rem", md:"2.3rem" }, lineHeight:1.15, textTransform:"uppercase",
              maxWidth:640, mx:"auto", mb:1.5 }}>
              {header.intro_titulo || "Doce rituales para el cuerpo y la piel"}
            </Typography>
            <Typography sx={{ color:PP.muted, fontSize:"0.9rem", maxWidth:560, mx:"auto" }}>
              {header.intro_subtitulo || "De las piedras calientes al Signature Amour: cada tratamiento tiene su propio ritmo."}
            </Typography>
          </Box>

          {/* Grid de tarjetas — estilo público */}
          <Box sx={{ px:{ xs:2, md:5 }, pb:"48px" }}>
            {displayItems.length === 0 ? (
              <Box sx={{ textAlign:"center", py:6, color:PP.muted }}>
                <SpaIcon sx={{ fontSize:48, opacity:0.3, display:"block", mx:"auto", mb:1.5 }} />
                <Typography sx={{ fontSize:"0.9rem" }}>No hay experiencias todavía.</Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => openEditCard(null)}
                  sx={{ mt:2, borderColor:PP.gold, color:PP.gold, borderRadius:20, textTransform:"none" }}>
                  Agregar experiencia
                </Button>
              </Box>
            ) : (
              <Box sx={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"20px" }}>
                {displayItems.map(item => (
                  <CanvasCard
                    key={item.id_experiencia}
                    item={item}
                    onEdit={() => openEditCard(item)}
                    onDelete={() => setDelId(item.id_experiencia)}
                    onToggleStar={() => toggleStar(item)}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Nota inferior */}
          <Box sx={{ px:4, py:1.5, borderTop:"1px solid rgba(255,255,255,0.08)",
            display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:1 }}>
            <Typography sx={{ fontSize:11, color:PP.muted }}>
              ★ = se muestra en la sección de servicios del <b>inicio</b>. En <b>/servicios</b> se ven todas.
            </Typography>
            <Typography sx={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>
              Vista previa del sitio · tiempo real
            </Typography>
          </Box>
        </Box>
      </PageBox>

      {/* Confirmar eliminación */}
      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle sx={{ fontWeight:700 }}>¿Eliminar esta experiencia?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
