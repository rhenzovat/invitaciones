import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, CircularProgress, Button, TextField, Stack,
  IconButton, Tooltip, Avatar, Chip, Dialog, DialogTitle,
  DialogActions, Select, MenuItem, FormControl, InputLabel, Switch,
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
import AccessTimeIcon    from "@mui/icons-material/AccessTime";
import WhatsAppIcon      from "@mui/icons-material/WhatsApp";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";

import { obtener, actualizar as actualizarPag, subirHero } from "../../../api/web_pagina_experiencias.api";
import { listar, crear, actualizar, eliminar }             from "../../../api/web_experiencias.api";
import { toastSuccess, handleErrorMessages }               from "../../../components/notify-messages";
import { authJWTConfig } from "app/authJWTConfig";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

/* ── Paleta ──────────────────────────────────────────────────────── */
const RM = { brown:"#2c1a0e", mid:"#4a2a15", pink:"#cc6b8e", deepPink:"#a0455e", gold:"#b8860b", cream:"#fdf8f5" };

/** Color único para encabezados de categoría (referencia: Bienestar Femenino) */
const CAT_HEADER_COLOR = "#a0654a";
const CAT_HEADER_GRAD  = "linear-gradient(135deg,#a0654a,#7a4a35)";

const CAT_GRAD = {
  tantrico:  CAT_HEADER_GRAD,
  bienestar: CAT_HEADER_GRAD,
  corporal:  CAT_HEADER_GRAD,
  estetica:  CAT_HEADER_GRAD,
  default:   CAT_HEADER_GRAD,
};
const CAT_COLOR = {
  tantrico:  CAT_HEADER_COLOR,
  bienestar: CAT_HEADER_COLOR,
  corporal:  CAT_HEADER_COLOR,
  estetica:  CAT_HEADER_COLOR,
};
const CAT_ORDER = ["tantrico","bienestar","corporal","estetica"];
const CAT_LABELS = {
  tantrico:"Tántricas & Sensoriales", bienestar:"Bienestar Femenino",
  corporal:"Renovación Corporal",     estetica:"Modelación & Estética",
};
const CAT_LABEL_UP = {
  tantrico:"EXPERIENCIAS TÁNTRICAS SENSORIALES", bienestar:"BIENESTAR Y RELAJACIÓN FEMENINA",
  corporal:"RENOVACIÓN CORPORAL PROFUNDA",        estetica:"MODELACIÓN Y ESTÉTICA CORPORAL",
};

/* ── Styled ──────────────────────────────────────────────────────── */
const PageBox   = styled(Box)({ padding:16, minHeight:"100vh", background:"#111827" });
const HeaderBar = styled(Box)({
  padding:"10px 18px", marginBottom:16, borderRadius:10,
  background:`linear-gradient(135deg,${RM.brown},${RM.mid})`,
  color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between",
  boxShadow:"0 4px 14px rgba(44,26,14,0.5)",
});
const SaveBtn = styled(Button)({
  background:`linear-gradient(135deg,${RM.deepPink},${RM.pink})`,
  color:"#fff", fontWeight:700, borderRadius:8, textTransform:"none", padding:"8px 22px",
  "&:hover":{ background:`linear-gradient(135deg,${RM.pink},${RM.deepPink})` },
  "&:disabled":{ opacity:0.6 },
});
const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root":{ backgroundColor:"rgba(255,255,255,0.07)", borderRadius:6 },
  "& .MuiInputBase-input":{ color:"#f1f5f9" },
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
const SecTag = styled(Typography)({
  fontSize:"0.60rem", fontWeight:700, letterSpacing:"0.10em",
  textTransform:"uppercase", color:RM.pink, marginBottom:6, marginTop:4,
});
const Sep = () => <Box sx={{ borderTop:"1px solid rgba(255,255,255,0.08)", my:1.5 }} />;

/* ── Zona de página editable (secciones hero/stats/intro/cta) ────── */
function PageZone({ id, label, activeZone, onOpen, children }) {
  const isActive = activeZone === id;
  return (
    <Box sx={{
      position:"relative",
      outline: isActive ? `2.5px dashed ${RM.pink}` : "2px dashed transparent",
      outlineOffset:-2, transition:"outline .2s",
      "&:hover":{ outline:`2px dashed rgba(204,107,142,0.4)` },
      "&:hover .pz-lbl":{ opacity:1 },
    }}>
      {children}
      <Box className="pz-lbl" sx={{
        position:"absolute", top:6, left:8, zIndex:10,
        background:"rgba(44,26,14,0.9)", color:"#fff",
        fontSize:9, px:1, py:0.2, borderRadius:1,
        letterSpacing:1, textTransform:"uppercase",
        opacity: isActive ? 1 : 0, transition:"opacity .2s", pointerEvents:"none",
      }}>{label}</Box>
      <Tooltip title={`Editar sección: ${label}`} placement="left">
        <IconButton size="small" onClick={() => onOpen(id)} sx={{
          position:"absolute", top:8, right:8, zIndex:10,
          background: isActive ? RM.deepPink : "rgba(160,69,94,0.88)",
          color:"#fff", width:28, height:28,
          "&:hover":{ background:RM.deepPink, transform:"scale(1.12)" },
          transition:"all .15s",
        }}>
          <EditIcon sx={{ fontSize:13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/* ── Upload de imagen ────────────────────────────────────────────── */
function ImgUpload({ preview, currentUrl, onFile, onRemove, label="Imagen" }) {
  const ref = useRef();
  const src = preview || (currentUrl ? (currentUrl.startsWith("http") ? currentUrl : `${BASE}${currentUrl}`) : null);
  return (
    <Box sx={{ mb:1.5 }}>
      <SecTag>{label}</SecTag>
      <input type="file" ref={ref} accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if(f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width:"100%", height:140, borderRadius:2, overflow:"hidden",
        border:`2px dashed ${src?"rgba(204,107,142,0.6)":"rgba(255,255,255,0.18)"}`,
        bgcolor:"rgba(255,255,255,0.04)", display:"flex",
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
              justifyContent:"center", opacity:0, transition:"opacity .25s",
            }}>
              <PhotoCameraIcon sx={{ color:"#fff", fontSize:22 }} />
              <Typography sx={{ color:"#fff", fontSize:9, mt:0.3 }}>Cambiar foto</Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0.5, color:"#475569" }}>
            <ImageOutlinedIcon sx={{ fontSize:32, opacity:0.45 }} />
            <Typography sx={{ fontSize:10 }}>Clic para subir imagen</Typography>
          </Box>
        )}
      </Box>
      {preview && (
        <Box sx={{ display:"flex", alignItems:"center", mt:0.5, gap:0.5 }}>
          <IconButton size="small" sx={{ color:"#ef4444", p:0.2 }} onClick={onRemove}>
            <DeleteOutlineIcon sx={{ fontSize:14 }} />
          </IconButton>
          <Typography sx={{ color:"#22c55e", fontSize:9 }}>Nueva imagen lista ✓</Typography>
        </Box>
      )}
    </Box>
  );
}

/* ── Tarjeta de experiencia en canvas (con botones CMS) ──────────── */
function CanvasExpCard({ item, onEdit, onDelete }) {
  const img  = item._preview || (item.url_imagen ? `${BASE}${item.url_imagen}` : null);
  const grad = CAT_GRAD[item.categoria] || CAT_GRAD.default;
  return (
    <Box sx={{
      position:"relative", bgcolor:"#fff", borderRadius:"14px",
      overflow:"hidden", boxShadow:"0 4px 18px rgba(0,0,0,0.1)",
      display:"flex", flexDirection:"column",
      opacity: item.Activo==="N" ? 0.5 : 1,
      "&:hover .card-actions":{ opacity:1 },
    }}>
      {/* Botones flotantes — aparecen al hover */}
      <Box className="card-actions" sx={{
        position:"absolute", top:8, right:8, zIndex:20,
        display:"flex", gap:0.5, opacity:0, transition:"opacity .2s",
      }}>
        <Tooltip title="Editar tarjeta">
          <IconButton size="small" onClick={onEdit} sx={{
            bgcolor:"rgba(44,26,14,0.88)", color:"#fff", width:28, height:28,
            backdropFilter:"blur(4px)",
            "&:hover":{ bgcolor:RM.brown, transform:"scale(1.1)" }, transition:"all .2s",
          }}>
            <EditIcon sx={{ fontSize:13 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar tarjeta">
          <IconButton size="small" onClick={onDelete} sx={{
            bgcolor:"rgba(220,38,38,0.88)", color:"#fff", width:28, height:28,
            backdropFilter:"blur(4px)",
            "&:hover":{ bgcolor:"#dc2626", transform:"scale(1.1)" }, transition:"all .2s",
          }}>
            <DeleteOutlineIcon sx={{ fontSize:13 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Imagen */}
      <Box sx={{ width:"100%", height:155, position:"relative", bgcolor:"#f0e8e0", overflow:"hidden", flexShrink:0 }}>
        {img ? (
          <Box component="img" src={img} alt={item.titulo}
            sx={{ width:"100%", height:"100%", objectFit:"cover",
              transition:"transform .4s", "&:hover":{ transform:"scale(1.05)" } }} />
        ) : (
          <Box sx={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
            justifyContent:"center", flexDirection:"column", gap:0.5, color:"#c8a882" }}>
            <ImageOutlinedIcon sx={{ fontSize:32, opacity:0.35 }} />
            <Typography sx={{ fontSize:9, color:"#c8a882", opacity:0.7 }}>Sin imagen</Typography>
          </Box>
        )}
        {item.duracion && (
          <Box sx={{ position:"absolute", top:8, left:8,
            bgcolor:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
            color:"#fff", fontSize:8, fontWeight:600,
            px:0.8, py:0.3, borderRadius:"50px",
            display:"flex", alignItems:"center", gap:0.3 }}>
            <AccessTimeIcon sx={{ fontSize:8 }} /> {item.duracion}
          </Box>
        )}
        {item.badge && (
          <Box sx={{ position:"absolute", top:8, right:8,
            background:grad, color:"#fff",
            fontSize:8, fontWeight:800, letterSpacing:"1px",
            textTransform:"uppercase", px:1, py:0.3, borderRadius:"50px" }}>
            {item.badge}
          </Box>
        )}
      </Box>

      {/* Contenido */}
      <Box sx={{ p:"11px 13px 13px", display:"flex", flexDirection:"column", flex:1 }}>
        <Typography sx={{ fontFamily:"'PT Serif',serif", fontSize:"0.88rem",
          fontWeight:700, color:RM.brown, lineHeight:1.3, mb:0.3 }}>
          {item.titulo || "Sin título"}
        </Typography>
        {item.subtitulo && (
          <Typography sx={{ fontSize:9, color:RM.pink, fontWeight:700,
            letterSpacing:"0.8px", textTransform:"uppercase", mb:0.4 }}>
            {item.subtitulo}
          </Typography>
        )}
        {item.descripcion && (
          <Typography sx={{ fontSize:"0.70rem", color:"#888", lineHeight:1.5,
            overflow:"hidden", display:"-webkit-box",
            WebkitLineClamp:2, WebkitBoxOrient:"vertical", mb:0.8 }}>
            {item.descripcion}
          </Typography>
        )}
        <Box sx={{ mt:"auto", pt:0.8, borderTop:"1px solid #f5e8e8",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Typography sx={{ fontSize:9, color:RM.gold, fontWeight:700 }}>
            🏷 {item.precio_nota || "Consultar precio"}
          </Typography>
          <Box sx={{ display:"inline-flex", alignItems:"center", gap:"3px",
            background:grad, color:"#fff", px:1.1, py:"3px",
            borderRadius:"50px", fontSize:9, fontWeight:700 }}>
            <WhatsAppIcon sx={{ fontSize:9 }} /> {item.btn_texto || "Reservar"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Canvas de la página ─────────────────────────────────────────── */
function PageCanvas({ pagForm, heroPreview, pageZone, onPageZone, experiencias, onEditCard, onDeleteCard, onNewCard }) {
  const heroBg = heroPreview
    || (pagForm.hero_url_imagen
      ? (pagForm.hero_url_imagen.startsWith("http") ? pagForm.hero_url_imagen : `/${pagForm.hero_url_imagen}`)
      : null);

  return (
    <Box sx={{ width:"100%", borderRadius:2, overflow:"hidden",
      boxShadow:"0 8px 40px rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.06)" }}>

      {/* HERO */}
      <PageZone id="hero" label="Hero" activeZone={pageZone} onOpen={onPageZone}>
        <Box sx={{
          height:165,
          background: heroBg
            ? `linear-gradient(rgba(20,8,2,.55),rgba(20,8,2,.72)), url(${heroBg}) center/cover no-repeat`
            : `linear-gradient(135deg,#1a0b04,#2c1a0e)`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:0.4,
        }}>
          <Box sx={{ border:"1px solid rgba(204,107,142,0.5)", borderRadius:20, px:2, py:0.3, mb:0.5 }}>
            <Typography sx={{ color:"#d4a8b8", fontSize:9, letterSpacing:3, textTransform:"uppercase" }}>
              {pagForm.hero_tag||"Royal Sensory Experience Massage"}
            </Typography>
          </Box>
          <Typography sx={{ color:"#fff", fontSize:24, fontWeight:800,
            fontFamily:"'PT Serif',serif", textAlign:"center", px:2 }}>
            {pagForm.hero_titulo||"Nuestras Experiencias"}
          </Typography>
          <Box sx={{ display:"flex", gap:1, mt:0.3, alignItems:"center" }}>
            <Typography sx={{ color:"rgba(255,255,255,0.5)", fontSize:9 }}>Inicio</Typography>
            <Typography sx={{ color:"rgba(255,255,255,0.3)", fontSize:9 }}>/</Typography>
            <Typography sx={{ color:RM.pink, fontSize:9 }}>Experiencias</Typography>
          </Box>
        </Box>
      </PageZone>

      {/* STATS */}
      <PageZone id="stats" label="Estadísticas" activeZone={pageZone} onOpen={onPageZone}>
        <Box sx={{ background:RM.brown, display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[
            { v:pagForm.stat1_valor||"16",   l:pagForm.stat1_label||"Experiencias únicas",   c:RM.pink },
            { v:pagForm.stat2_valor||"4",    l:pagForm.stat2_label||"Categorías",             c:RM.gold },
            { v:pagForm.stat3_valor||"100%", l:pagForm.stat3_label||"Privado & Confidencial", c:RM.pink },
            { v:pagForm.stat4_valor||"Solo", l:pagForm.stat4_label||"Para Mujeres",           c:RM.gold },
          ].map((s,i) => (
            <Box key={i} sx={{ py:"11px", px:1, textAlign:"center",
              borderRight: i<3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <Typography sx={{ color:s.c, fontSize:17, fontWeight:800, lineHeight:1 }}>{s.v}</Typography>
              <Typography sx={{ color:"rgba(255,255,255,0.48)", fontSize:8,
                textTransform:"uppercase", letterSpacing:0.7, mt:0.3 }}>{s.l}</Typography>
            </Box>
          ))}
        </Box>
      </PageZone>

      {/* INTRO + TABS */}
      <PageZone id="intro" label="Intro & Filtros" activeZone={pageZone} onOpen={onPageZone}>
        <Box sx={{ background:RM.cream, py:"18px", textAlign:"center" }}>
          <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:1, mb:0.5 }}>
            <Box sx={{ height:1, width:28, background:RM.pink, opacity:0.5 }} />
            <Typography sx={{ color:RM.gold, fontSize:9, letterSpacing:3, textTransform:"uppercase" }}>
              {pagForm.intro_label||"Elige tu Experiencia"}
            </Typography>
            <Box sx={{ height:1, width:28, background:RM.pink, opacity:0.5 }} />
          </Box>
          <Typography sx={{ fontFamily:"'PT Serif',serif", color:RM.brown, fontSize:17, fontWeight:700 }}>
            {pagForm.intro_titulo||"Royal Sensory Experience"}<br/>
            <em style={{ color:RM.pink }}>{pagForm.intro_titulo2||"Diseñado para ti"}</em>
          </Typography>
          <Box sx={{ display:"flex", justifyContent:"center", gap:0.7, mt:1, flexWrap:"wrap", px:2 }}>
            {["Todas", pagForm.cat_tantrico_titulo||"Tántricas", pagForm.cat_bienestar_titulo||"Bienestar",
              pagForm.cat_corporal_titulo||"Corporal", pagForm.cat_estetica_titulo||"Estética"].map((t,i) => (
              <Box key={i} sx={{
                px:1.1, py:0.35, borderRadius:20, fontSize:9, fontWeight: i===0?700:400,
                background: i===0?RM.brown:"transparent",
                color: i===0?"#fff":RM.brown,
                border:`1px solid ${i===0?RM.brown:"rgba(44,26,14,0.2)"}`,
              }}>{t}</Box>
            ))}
          </Box>
        </Box>
      </PageZone>

      {/* CATEGORÍAS + CARDS (totalmente editable) */}
      <Box sx={{ background:"#f5ede8" }}>
        {CAT_ORDER.map(catKey => {
          const cards  = experiencias.filter(e => e.categoria === catKey);
          const titulo = pagForm[`cat_${catKey}_titulo`] || CAT_LABELS[catKey];
          const desc   = pagForm[`cat_${catKey}_desc`]   || "";
          const grad   = CAT_GRAD[catKey];
          return (
            <Box key={catKey}>
              {/* Cabecera categoría — editable con lápiz */}
              <PageZone id={`cat_${catKey}`} label={`Categoría: ${CAT_LABELS[catKey]}`}
                activeZone={pageZone} onOpen={onPageZone}>
                <Box sx={{ background:grad, px:3, py:"10px",
                  display:"flex", alignItems:"center", gap:2 }}>
                  <Box sx={{ width:28, height:28, borderRadius:"50%",
                    background:"rgba(255,255,255,0.15)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Typography sx={{ color:"#fff", fontSize:12 }}>✦</Typography>
                  </Box>
                  <Box sx={{ flex:1 }}>
                    <Typography sx={{ color:"rgba(255,255,255,0.6)", fontSize:8,
                      textTransform:"uppercase", letterSpacing:1.5 }}>
                      {CAT_LABEL_UP[catKey]}
                    </Typography>
                    <Typography sx={{ color:"#fff", fontSize:13, fontWeight:700, lineHeight:1.2 }}>
                      {titulo}
                    </Typography>
                    {desc && (
                      <Typography sx={{ color:"rgba(255,255,255,0.62)", fontSize:9, mt:0.2 }}>
                        {desc.slice(0,65)}{desc.length>65?"…":""}
                      </Typography>
                    )}
                  </Box>
                  <Chip label={`${cards.length} exp.`} size="small"
                    sx={{ bgcolor:"rgba(255,255,255,0.15)", color:"#fff", fontSize:9, height:20, flexShrink:0 }} />
                </Box>
              </PageZone>

              {/* Grid de cards + botón agregar */}
              <Box sx={{ px:2, py:2, background:RM.cream }}>
                <Box sx={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1.5, mb:1.5 }}>
                  {cards.map(item => (
                    <CanvasExpCard key={item.id_experiencia} item={item}
                      onEdit={() => onEditCard(item)}
                      onDelete={() => onDeleteCard(item.id_experiencia)} />
                  ))}
                  {/* Placeholder vacío */}
                  {cards.length === 0 && [1,2,3].map(n => (
                    <Box key={n} sx={{
                      height:170, borderRadius:2,
                      border:"2px dashed rgba(44,26,14,0.15)",
                      display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center", gap:0.5,
                      background:"rgba(44,26,14,0.03)",
                    }}>
                      <ImageOutlinedIcon sx={{ fontSize:26, color:"rgba(44,26,14,0.18)" }} />
                      <Typography sx={{ fontSize:9, color:"rgba(44,26,14,0.3)" }}>Sin experiencias</Typography>
                    </Box>
                  ))}
                </Box>
                {/* Botón agregar nueva card en esta categoría */}
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => onNewCard(catKey)}
                  sx={{
                    borderRadius:"50px", border:`1.5px dashed rgba(204,107,142,0.5)`,
                    color:RM.deepPink, fontSize:11, textTransform:"none", fontWeight:600,
                    px:2, py:0.6, width:"100%",
                    "&:hover":{ background:"rgba(204,107,142,0.08)", borderColor:RM.pink },
                  }}>
                  + Agregar experiencia en "{titulo}"
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* CTA */}
      <PageZone id="cta" label="CTA" activeZone={pageZone} onOpen={onPageZone}>
        <Box sx={{ background:`linear-gradient(135deg,${RM.deepPink},${RM.brown})`,
          py:"20px", textAlign:"center", px:2 }}>
          <Typography sx={{ fontFamily:"'PT Serif',serif", color:"#fff",
            fontSize:15, fontWeight:700, mb:0.5 }}>
            {pagForm.cta_titulo||"¿Lista para tu experiencia Royal Sensory?"}
          </Typography>
          {pagForm.cta_texto && (
            <Typography sx={{ color:"rgba(255,255,255,0.62)", fontSize:10, mb:1.2 }}>
              {pagForm.cta_texto}
            </Typography>
          )}
          <Box sx={{ display:"inline-flex", alignItems:"center", gap:1,
            background:"#25d366", color:"#fff", px:2.5, py:0.7, borderRadius:20,
            fontSize:11, fontWeight:700 }}>
            <WhatsAppIcon sx={{ fontSize:13 }} />
            {pagForm.cta_btn||"Reservar por WhatsApp"}
          </Box>
        </Box>
      </PageZone>
    </Box>
  );
}

/* ── Panel de edición de sección de página ──────────────────────── */
function PageSectionPanel({ zone, pagForm, onPagChange, onSave, saving, onClose, onImgChange, heroImg, heroPreview }) {
  const fileRef = useRef();
  const f = (k,v) => onPagChange(k,v);

  const catKey = zone?.startsWith("cat_") ? zone.replace("cat_","") : null;

  const configs = {
    hero:{ title:"Hero · Cabecera", icon:"🖼", color:RM.deepPink,
      body:(
        <Stack spacing={2}>
          <DarkField label="Etiqueta (tag)" size="small" fullWidth
            value={pagForm.hero_tag||""} onChange={e=>f("hero_tag",e.target.value)} />
          <DarkField label="Título principal" size="small" fullWidth
            value={pagForm.hero_titulo||""} onChange={e=>f("hero_titulo",e.target.value)} />
          <Sep/>
          <ImgUpload preview={heroPreview} currentUrl={pagForm.hero_url_imagen}
            onFile={onImgChange} onRemove={()=>{}} label="Imagen de fondo hero" />
        </Stack>
      ),
    },
    stats:{ title:"Estadísticas", icon:"📊", color:"#5a3218",
      body:(
        <Stack spacing={1.5}>
          {[1,2,3,4].map(n=>(
            <Box key={n} sx={{ background:"rgba(255,255,255,0.04)", borderRadius:2, p:1.5 }}>
              <Typography sx={{ color:RM.gold, fontSize:11, mb:1, fontWeight:700 }}>Estadística {n}</Typography>
              <Stack spacing={1}>
                <DarkField label="Valor" size="small" fullWidth
                  value={pagForm[`stat${n}_valor`]||""} onChange={e=>f(`stat${n}_valor`,e.target.value)} />
                <DarkField label="Etiqueta" size="small" fullWidth
                  value={pagForm[`stat${n}_label`]||""} onChange={e=>f(`stat${n}_label`,e.target.value)} />
              </Stack>
            </Box>
          ))}
        </Stack>
      ),
    },
    intro:{ title:"Intro & Filtros", icon:"✦", color:RM.gold,
      body:(
        <Stack spacing={2}>
          <DarkField label="Etiqueta sobre el título" size="small" fullWidth
            value={pagForm.intro_label||""} onChange={e=>f("intro_label",e.target.value)} />
          <DarkField label="Título (normal)" size="small" fullWidth
            value={pagForm.intro_titulo||""} onChange={e=>f("intro_titulo",e.target.value)} />
          <DarkField label="Título (rosa cursiva)" size="small" fullWidth
            value={pagForm.intro_titulo2||""} onChange={e=>f("intro_titulo2",e.target.value)} />
        </Stack>
      ),
    },
    cta:{ title:"Sección CTA", icon:"📢", color:RM.deepPink,
      body:(
        <Stack spacing={2}>
          <DarkField label="Título CTA" size="small" fullWidth
            value={pagForm.cta_titulo||""} onChange={e=>f("cta_titulo",e.target.value)} />
          <DarkField label="Texto descriptivo" size="small" fullWidth multiline rows={3}
            value={pagForm.cta_texto||""} onChange={e=>f("cta_texto",e.target.value)} />
          <DarkField label="Texto del botón" size="small" fullWidth
            value={pagForm.cta_btn||""} onChange={e=>f("cta_btn",e.target.value)} />
        </Stack>
      ),
    },
  };

  // Si es una categoría
  if (catKey) {
    const cfg2 = {
      title:`Categoría: ${CAT_LABELS[catKey]||catKey}`, icon:"📂",
      color: CAT_COLOR[catKey] || RM.brown,
    };
    return (
      <PanelShell title={cfg2.title} icon={cfg2.icon} color={cfg2.color} onClose={onClose} onSave={onSave} saving={saving}>
        <Stack spacing={2}>
          <DarkField label="Título de sección" size="small" fullWidth
            value={pagForm[`cat_${catKey}_titulo`]||""} onChange={e=>f(`cat_${catKey}_titulo`,e.target.value)} />
          <DarkField label="Descripción" size="small" fullWidth multiline rows={3}
            value={pagForm[`cat_${catKey}_desc`]||""} onChange={e=>f(`cat_${catKey}_desc`,e.target.value)} />
        </Stack>
      </PanelShell>
    );
  }

  const cfg = configs[zone];
  if (!cfg) return null;
  return (
    <PanelShell title={cfg.title} icon={cfg.icon} color={cfg.color} onClose={onClose} onSave={onSave} saving={saving}>
      {cfg.body}
    </PanelShell>
  );
}

/* ── Panel de edición de una tarjeta experiencia ────────────────── */
function CardPanel({ form, preview, saving, onChange, onSave, onClose }) {
  const f = (k,v) => onChange(k,v);
  const [imgFile, setImgFile] = useState(null);
  // preview viene del padre

  return (
    <PanelShell
      title={form.id_experiencia ? "✏️ Editar Tarjeta" : "➕ Nueva Tarjeta"}
      icon="🃏" color={CAT_GRAD[form.categoria]?.split(",")[0]?.replace("linear-gradient(135deg,","")||RM.deepPink}
      onClose={onClose} onSave={onSave} saving={saving}>
      <Stack spacing={0}>
        <ImgUpload preview={preview} currentUrl={form.url_imagen}
          onFile={file => { onChange("_file", file); }}
          onRemove={() => onChange("_file", null)}
          label="Foto de la experiencia" />
        <Sep/>
        <SecTag>Categoría</SecTag>
        <FormControl fullWidth size="small" sx={{ mb:1.5 }}>
          <InputLabel sx={{ color:"#94a3b8", "&.Mui-focused":{ color:RM.pink } }}>Categoría</InputLabel>
          <DarkSelect value={form.categoria||"tantrico"} label="Categoría"
            onChange={e=>f("categoria",e.target.value)}
            MenuProps={{ PaperProps:{ sx:{ bgcolor:"#1e293b", color:"#f1f5f9" } } }}>
            {CAT_ORDER.map(k=>(
              <MenuItem key={k} value={k}
                sx={{ fontSize:"0.82rem", "&:hover":{ bgcolor:"rgba(204,107,142,0.15)" } }}>
                {CAT_LABELS[k]}
              </MenuItem>
            ))}
          </DarkSelect>
        </FormControl>
        <DarkField label="Badge (ej: NURU PREMIUM)" size="small" fullWidth sx={{ mb:1.5 }}
          value={form.badge||""} onChange={e=>f("badge",e.target.value)} />
        <DarkField label="Duración (ej: 90 – 120 min)" size="small" fullWidth sx={{ mb:1.5 }}
          value={form.duracion||""} onChange={e=>f("duracion",e.target.value)} />
        <Sep/>
        <SecTag>Contenido</SecTag>
        <DarkField label="Título *" size="small" fullWidth sx={{ mb:1.5 }}
          value={form.titulo||""} onChange={e=>f("titulo",e.target.value)} />
        <DarkField label="Subtítulo (ej: DESPERTAR DE LOS SENTIDOS)" size="small" fullWidth sx={{ mb:1.5 }}
          value={form.subtitulo||""} onChange={e=>f("subtitulo",e.target.value)} />
        <DarkField label="Descripción" size="small" fullWidth multiline rows={3} sx={{ mb:1.5 }}
          value={form.descripcion||""} onChange={e=>f("descripcion",e.target.value)} />
        <Sep/>
        <SecTag>Precio & Botón</SecTag>
        <DarkField label="Texto de precio (ej: Desde S/ 180)" size="small" fullWidth sx={{ mb:1.5 }}
          value={form.precio_nota||""} onChange={e=>f("precio_nota",e.target.value)} />
        <DarkField label="Texto botón" size="small" fullWidth sx={{ mb:1.5 }}
          value={form.btn_texto||""} onChange={e=>f("btn_texto",e.target.value)} />
        <Sep/>
        <SecTag>Configuración</SecTag>
        <DarkField label="Orden" size="small" fullWidth type="number" sx={{ mb:1.5 }}
          value={form.orden||""} onChange={e=>f("orden",e.target.value)} />
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          px:1, py:0.8, borderRadius:2, background:"rgba(255,255,255,0.05)" }}>
          <Typography sx={{ color:"#94a3b8", fontSize:12 }}>Visible en el sitio</Typography>
          <Switch checked={form.Activo==="S"} size="small"
            onChange={e=>f("Activo", e.target.checked?"S":"N")}
            sx={{ "& .MuiSwitch-thumb":{ bgcolor: form.Activo==="S"?RM.pink:"#666" } }} />
        </Box>
      </Stack>
    </PanelShell>
  );
}

/* ── Shell reutilizable del panel lateral ───────────────────────── */
function PanelShell({ title, icon, color, onClose, onSave, saving, children }) {
  return (
    <Box sx={{ width:330, height:"100%", display:"flex", flexDirection:"column",
      background:`linear-gradient(170deg,${RM.brown} 0%,#1a0a04 100%)` }}>
      <Box sx={{ px:2, py:1.4, display:"flex", alignItems:"center", gap:1,
        background:`linear-gradient(135deg,${color||RM.brown},${RM.mid})`, flexShrink:0 }}>
        <Typography sx={{ fontSize:14 }}>{icon}</Typography>
        <Typography sx={{ color:"#fff", fontWeight:700, fontSize:13, flex:1 }}>{title}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color:"rgba(255,255,255,0.6)" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flex:1, overflowY:"auto", p:2,
        "&::-webkit-scrollbar":{ width:4 },
        "&::-webkit-scrollbar-thumb":{ background:"rgba(204,107,142,0.3)", borderRadius:2 } }}>
        {children}
      </Box>
      <Box sx={{ p:2, borderTop:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }}>
        <SaveBtn fullWidth
          startIcon={saving ? <CircularProgress size={16} sx={{ color:"#fff" }}/> : <SaveIcon />}
          onClick={onSave} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </SaveBtn>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════ */
const emptyCard = (catKey="tantrico") => ({
  id_experiencia:null, categoria:catKey, badge:"", duracion:"",
  titulo:"", subtitulo:"", descripcion:"",
  precio_nota:"Consultar precio", btn_texto:"Reservar",
  url_imagen:"", orden:"", Activo:"S", _file:null,
});

export default function PaginaExperienciasIndexPage() {
  /* página */
  const [pagData,     setPagData]     = useState(null);
  const [pagForm,     setPagForm]     = useState({});
  const [heroImg,     setHeroImg]     = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [pagSaving,   setPagSaving]   = useState(false);
  const [pageZone,    setPageZone]    = useState(null);

  /* experiencias */
  const [experiencias, setExperiencias] = useState([]);
  const [cardForm,     setCardForm]     = useState(emptyCard());
  const [cardPreview,  setCardPreview]  = useState(null);
  const [cardSaving,   setCardSaving]   = useState(false);
  const [panelType,    setPanelType]    = useState(null); // "page" | "card"
  const [delId,        setDelId]        = useState(null);

  const [loading, setLoading] = useState(true);

  /* ── cargar ── */
  const loadExp = async () => {
    const exps = await listar();
    setExperiencias(exps ?? []);
  };
  useEffect(() => {
    Promise.all([obtener(), listar()])
      .then(([pag, exps]) => { setPagData(pag); setPagForm(pag); setExperiencias(exps??[]); })
      .catch(handleErrorMessages)
      .finally(() => setLoading(false));
  }, []);

  /* ── handlers página ── */
  const handlePagField = (k,v) => setPagForm(p => ({ ...p, [k]:v }));
  const handleHeroImg  = file => { setHeroImg(file); setHeroPreview(URL.createObjectURL(file)); };

  const openPageZone = id => {
    setPageZone(p => p===id ? null : id);
    setPanelType("page");
  };

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
      const updated = await actualizarPag(payload);
      setPagData(updated);
      setPagForm(updated);
      toastSuccess("Sección guardada correctamente");
      closePanel();
    } catch(e) { handleErrorMessages(e); }
    finally { setPagSaving(false); }
  };

  /* ── handlers cards ── */
  const handleCardField = (k, v) => {
    if (k === "_file") {
      setCardPreview(v ? URL.createObjectURL(v) : null);
    }
    setCardForm((p) => ({ ...p, [k]: v }));
  };

  const openNewCard = catKey => {
    setCardForm(emptyCard(catKey));
    setCardPreview(null);
    setPanelType("card");
    setPageZone(null);
  };

  const openEditCard = item => {
    setCardForm({ ...item, _file:null });
    setCardPreview(null);
    setPanelType("card");
    setPageZone(null);
  };

  const closePanel = () => { setPanelType(null); setPageZone(null); };

  const saveCard = async () => {
    setCardSaving(true);
    try {
      const fd = new FormData();
      Object.entries(cardForm).forEach(([k,v]) => {
        if (k==="_file") { if(v) fd.append("image",v); }
        else if (v!=null) fd.append(k,v);
      });
      if (cardForm.id_experiencia) {
        await actualizar(fd);
        toastSuccess("Tarjeta actualizada");
      } else {
        await crear(fd);
        toastSuccess("Tarjeta creada");
      }
      await loadExp();
      closePanel();
    } catch(e) { handleErrorMessages(e); }
    finally { setCardSaving(false); }
  };

  const confirmDelete = id => setDelId(id);
  const doDelete = async () => {
    try { await eliminar(delId); toastSuccess("Tarjeta eliminada"); setDelId(null); await loadExp(); }
    catch(e) { handleErrorMessages(e); }
  };

  const liveExperiencias = useMemo(() => {
    if (panelType !== "card") return experiencias;

    const mergeCard = (base) => ({
      ...base,
      ...cardForm,
      _preview: cardPreview || null,
    });

    if (cardForm.id_experiencia) {
      return experiencias.map((e) =>
        e.id_experiencia === cardForm.id_experiencia ? mergeCard(e) : e
      );
    }

    return [
      ...experiencias,
      { ...cardForm, id_experiencia: "__draft__", _preview: cardPreview || null },
    ];
  }, [experiencias, cardForm, cardPreview, panelType]);

  if (loading) return (
    <Box sx={{ display:"flex", justifyContent:"center", pt:12, minHeight:"100vh", background:"#111827" }}>
      <CircularProgress sx={{ color:RM.pink }} />
    </Box>
  );

  const isPanelOpen = panelType !== null || pageZone !== null;

  return (
    <PageBox>
      {/* ── Header ── */}
      <HeaderBar>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor:RM.pink, width:34, height:34 }}>
            <SpaIcon sx={{ fontSize:18 }} />
          </Avatar>
          <Box>
            <Typography fontWeight={800} fontSize={15} lineHeight={1}>Página Experiencias · CMS</Typography>
            <Typography sx={{ color:"rgba(255,255,255,0.5)", fontSize:10 }}>
              Haz clic en ✏️ sobre secciones · hover sobre cards para editar
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1} alignItems="center">
          <Tooltip title="Ver página pública">
            <IconButton sx={{ color:"rgba(255,255,255,0.6)" }}
              onClick={() => window.open("/experiencias","_blank")} size="small">
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <SaveBtn
            startIcon={pagSaving ? <CircularProgress size={16} sx={{ color:"#fff" }}/> : <SaveIcon />}
            onClick={savePag} disabled={pagSaving}>
            {pagSaving ? "Guardando…" : "Guardar página"}
          </SaveBtn>
        </Stack>
      </HeaderBar>

      {/* ── Tip ── */}
      <Box sx={{ mb:2, px:2, py:1, borderRadius:2,
        background:"rgba(204,107,142,0.08)", border:"1px solid rgba(204,107,142,0.18)",
        display:"flex", alignItems:"center", gap:1.5 }}>
        <EditIcon sx={{ color:RM.pink, fontSize:16 }} />
        <Typography sx={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>
          <strong style={{ color:"#fff" }}>Secciones:</strong> clic en ✏️ rosa para editar textos. &nbsp;
          <strong style={{ color:"#fff" }}>Tarjetas:</strong> hover sobre la card → aparecen botones ✏️ editar y 🗑 eliminar. &nbsp;
          <strong style={{ color:"#fff" }}>Agregar:</strong> botón "+ Agregar" al final de cada categoría.
        </Typography>
      </Box>

      {/* ── Layout canvas (el panel es fixed, no ocupa espacio en el flex) ── */}
      <Box sx={{ display:"flex", gap:2, alignItems:"flex-start" }}>

        {/* Canvas — cuando el panel está abierto, dejamos espacio a la derecha */}
        <Box sx={{ flex:1, minWidth:0, mr: isPanelOpen ? "356px" : 0, transition:"margin .25s" }}>
          <PageCanvas
            pagForm={pagForm}
            heroPreview={heroPreview}
            pageZone={pageZone}
            onPageZone={openPageZone}
            experiencias={liveExperiencias}
            onEditCard={openEditCard}
            onDeleteCard={confirmDelete}
            onNewCard={openNewCard}
          />
        </Box>

        {/* Panel lateral FIXED — siempre visible, nunca tapado por footer */}
        {isPanelOpen && (
          <Box sx={{
            position:"fixed",
            top: 0,
            right: 0,
            width: 340,
            height: "100vh",
            zIndex: 1300,
            display:"flex", flexDirection:"column",
            boxShadow:"-8px 0 40px rgba(0,0,0,0.55)",
            border:"1px solid rgba(204,107,142,0.22)",
            overflow:"hidden",
          }}>
            {/* Panel de sección de página */}
            {panelType === "page" && pageZone && (
              <PageSectionPanel
                zone={pageZone} pagForm={pagForm}
                onPagChange={handlePagField}
                onSave={savePag} saving={pagSaving}
                onClose={closePanel}
                onImgChange={handleHeroImg}
                heroImg={heroImg} heroPreview={heroPreview}
              />
            )}
            {/* Panel de tarjeta */}
            {panelType === "card" && (
              <CardPanel
                form={cardForm} preview={cardPreview}
                saving={cardSaving}
                onChange={handleCardField}
                onSave={saveCard}
                onClose={closePanel}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Confirmar eliminación */}
      <Dialog open={!!delId} onClose={() => setDelId(null)}>
        <DialogTitle sx={{ fontWeight:700 }}>¿Eliminar esta tarjeta?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </PageBox>
  );
}
