import React, { useEffect, useRef, useState } from "react";
import { injectIntl, useIntl } from "react-intl";
import {
  Box, Paper, Typography, Button, IconButton, TextField,
  Chip, Tooltip, CircularProgress,
} from "@mui/material";
import EditIcon              from "@mui/icons-material/Edit";
import SaveIcon              from "@mui/icons-material/Save";
import CloseIcon             from "@mui/icons-material/Close";
import AddIcon               from "@mui/icons-material/Add";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutline";
import PhotoCameraIcon       from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon     from "@mui/icons-material/ImageOutlined";
import CheckBoxOutlinedIcon  from "@mui/icons-material/CheckBoxOutlined";
import InfoOutlinedIcon      from "@mui/icons-material/InfoOutlined";

import { listar, actualizar }          from "../../../api/web_about.api";
import {
  listar as listarCaract,
  crear  as crearCaract,
  actualizar as actualizarCaract,
  eliminar   as eliminarCaract,
} from "../../../api/web_about_caracteristica.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { authJWTConfig } from "app/authJWTConfig";

const Domain = `${(authJWTConfig.domain || "").replace(/\/$/, "")}/`;

/* ══════════════════════════════════════════════════════════
   PALETA — réplica del "Dark Passion Theme" del sitio público
   (assets/css/dark-passion-theme.css)
══════════════════════════════════════════════════════════ */
const C = {
  bgDeep:  "#12070a",
  bgMid:   "#2a0f16",
  bgWarm:  "#33141a",
  bgSoft:  "#1c0d10",
  text:    "#f5e6e2",
  muted:   "#d3b3ae",
  gold:    "#d9a56b",
  statBg:  "#181818",
  statTxt: "#aa8432",
  border:  "rgba(252,169,169,.16)",
  edit:    "#f97316",   // naranja lápiz (solo afordancia de edición)
};

/* Fondo degradado idéntico al body del sitio */
const SITE_BG = `
  radial-gradient(circle at 12% 8%, rgba(122,6,6,.30) 0%, transparent 45%),
  radial-gradient(circle at 88% 92%, rgba(122,6,6,.25) 0%, transparent 50%),
  linear-gradient(160deg, ${C.bgDeep} 0%, ${C.bgMid} 30%, ${C.bgWarm} 50%, ${C.bgSoft} 72%, ${C.bgDeep} 100%)`;

/* Parsea la lista de checks (llega como JSON string desde la BD o array en el draft) */
const parseBullets = (raw) => {
  if (Array.isArray(raw)) return raw.map((b) => (typeof b === "string" ? b : (b?.texto ?? "")));
  if (typeof raw === "string" && raw.trim()) {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p.map((b) => (typeof b === "string" ? b : (b?.texto ?? ""))) : []; }
    catch { return []; }
  }
  return [];
};

/* ══════════════════════════════════════════════════════════
   EDIT ZONE — hover muestra lápiz naranja
══════════════════════════════════════════════════════════ */
function EZ({ id, active, onEdit, children, sx = {}, hint = "" }) {
  const isA = active === id;
  return (
    <Box sx={{
      position: "relative",
      outline: isA ? `2px solid ${C.edit}` : "2px solid transparent",
      outlineOffset: 4,
      borderRadius: "8px",
      transition: "outline .15s",
      "&:hover .ez-pencil": { opacity: 1 },
      ...sx,
    }}>
      {children}
      <Tooltip title={hint || "Editar"} placement="top">
        <Box className="ez-pencil"
          onClick={e => { e.stopPropagation(); onEdit(id); }}
          sx={{
            position: "absolute", top: 0, right: 10,
            width: 28, height: 28, borderRadius: "50%",
            bgcolor: isA ? "#ea580c" : C.edit,
            color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", zIndex: 20,
            opacity: isA ? 1 : 0, transition: "opacity .15s",
            boxShadow: "0 2px 10px rgba(249,115,22,.5)",
            "&:hover": { transform: "scale(1.15)", bgcolor: "#ea580c" },
          }}>
          <EditIcon sx={{ fontSize: 13 }} />
        </Box>
      </Tooltip>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS PREVIEW — réplica fiel de la sección "features-6"
   del sitio público (partials/02_about_intro.blade.php)
══════════════════════════════════════════════════════════ */
function CanvasPreview({ about, caract, active, onEdit, bannerPreview }) {
  const bannerSrc = bannerPreview
    || (about.banner_url_imagen ? `${Domain}${about.banner_url_imagen}` : null)
    || (about.url_imagen ? `${Domain}${about.url_imagen}` : null);

  const imgSrc = about._imgPreview
    || (about.url_imagen ? `${Domain}${about.url_imagen}` : null);

  const bullets = parseBullets(about.bullets);
  const bulletCols = [bullets.slice(0, 2), bullets.slice(2, 4)];   // 2 columnas (igual que array_chunk en el Blade)

  const SERIF = "'Playfair Display', 'PT Serif', Georgia, serif";

  return (
    <Box sx={{
      background: SITE_BG,
      fontFamily: "'Open Sans', sans-serif",
      userSelect: "none",
    }}>
      {/* ── BANNER SUPERIOR ── */}
      <EZ id="banner" active={active} onEdit={onEdit} hint="Editar banner superior">
        <Box sx={{
          position: "relative", minHeight: 220, px: { xs: 3, md: 6 }, py: 5,
          display: "flex", flexDirection: "column", justifyContent: "center",
          backgroundImage: bannerSrc
            ? `linear-gradient(160deg, rgba(42,15,22,0.72), rgba(18,7,10,0.82)), url(${bannerSrc})`
            : `linear-gradient(160deg, ${C.bgMid}, ${C.bgDeep})`,
          backgroundSize: "cover", backgroundPosition: "center",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <Typography sx={{ color: C.gold, fontFamily: SERIF, fontStyle: "italic", fontSize: "1rem", mb: 1 }}>
            {about.banner_subtitulo || "L'histoire · Notre Maison"}
          </Typography>
          <Typography sx={{ color: "#fff", fontFamily: SERIF, fontSize: "clamp(1.9rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.1, mb: 1.5, textTransform: "uppercase" }}>
            {about.banner_titulo || "QUIÉNES SOMOS"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ color: C.muted, fontSize: "0.8rem" }}>Inicio</Typography>
            <Typography sx={{ color: C.muted, fontSize: "0.7rem" }}>›</Typography>
            <Typography sx={{ color: C.gold, fontSize: "0.8rem" }}>Quiénes Somos</Typography>
          </Box>
        </Box>
      </EZ>

      <Box sx={{ p: { xs: "40px 24px", md: "64px 48px" } }}>
        <Box sx={{
          display: "flex", gap: { xs: "36px", md: "52px" }, alignItems: "center",
          maxWidth: 1080, mx: "auto", flexWrap: "wrap",
        }}>

        {/* ── IZQUIERDA: imagen 1:1 + recuadro estadístico ──────── */}
        <EZ id="imagen" active={active} onEdit={onEdit} hint="Cambiar imagen principal"
          sx={{ flex: "1 1 300px", minWidth: 260, maxWidth: 420 }}>
          <Box sx={{ position: "relative", width: "100%" }}>
            {imgSrc ? (
              <Box component="img" src={imgSrc} alt="Sobre nosotros"
                sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover",
                  display: "block", borderRadius: "4px" }} />
            ) : (
              <Box sx={{ width: "100%", aspectRatio: "1 / 1", display: "flex",
                alignItems: "center", justifyContent: "center", borderRadius: "4px",
                border: "2px dashed rgba(255,255,255,.2)", bgcolor: "rgba(0,0,0,.25)" }}>
                <ImageOutlinedIcon sx={{ fontSize: 48, color: "rgba(255,255,255,.3)" }} />
              </Box>
            )}

            {/* Recuadro estadístico "100%" — esquina inferior derecha */}
            <EZ id="stat" active={active} onEdit={onEdit} hint="Editar recuadro (100%)"
              sx={{ position: "absolute", bottom: 20, right: 0 }}>
              <Box sx={{
                bgcolor: C.statBg, border: "2px solid #fff", textAlign: "center",
                px: "22px", py: "16px", minWidth: 150,
                boxShadow: "0 8px 24px rgba(0,0,0,.35)",
              }}>
                <Typography sx={{ color: C.statTxt, fontFamily: "'DM Sans', sans-serif",
                  fontSize: "2.4rem", fontWeight: 700, lineHeight: 1 }}>
                  {about.stat_valor || "100%"}
                </Typography>
                <Typography sx={{ color: C.statTxt, fontSize: ".78rem", fontWeight: 500,
                  mt: .6, lineHeight: 1.3 }}>
                  {about.stat_etiqueta || "Soin dédié · Atención con reserva"}
                </Typography>
              </Box>
            </EZ>
          </Box>
        </EZ>

        {/* ── DERECHA: contenido ────────────────────────────────── */}
        <Box sx={{ flex: "1 1 340px", minWidth: 300 }}>

          {/* Sub-heading (etiqueta dorada) */}
          <EZ id="subtitulo" active={active} onEdit={onEdit} hint="Editar etiqueta superior"
            sx={{ display: "inline-block", mb: 1.2 }}>
            <Typography sx={{ color: C.gold, fontSize: ".95rem", fontWeight: 600,
              fontStyle: "italic", letterSpacing: ".3px" }}>
              {about.subtitulo || "¿Qué es Amour Spa?"}
            </Typography>
          </EZ>

          {/* Título principal (mayúsculas, serif) */}
          <EZ id="titulo" active={active} onEdit={onEdit} hint="Editar título" sx={{ mb: 2 }}>
            <Typography sx={{
              fontFamily: "'PT Serif', Georgia, serif",
              fontSize: "clamp(24px, 3.4vw, 36px)", fontWeight: 700,
              color: C.text, lineHeight: 1.25, textTransform: "uppercase",
            }}>
              {about.titulo || "Un santuario donde el cuerpo se escribe con delicadeza"}
            </Typography>
          </EZ>

          {/* Descripción */}
          <EZ id="descripcion" active={active} onEdit={onEdit} hint="Editar descripción" sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: ".92rem", color: C.muted, lineHeight: 1.85,
              whiteSpace: "pre-wrap" }}>
              {about.descripcion || "Descripción de la empresa…"}
            </Typography>
          </EZ>

          {/* Características (íconos + título + texto) */}
          <EZ id="caracteristicas" active={active} onEdit={onEdit} hint="Editar características"
            sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
              {caract.length === 0 && (
                <Typography sx={{ fontSize: ".85rem", color: C.muted, fontStyle: "italic" }}>
                  Sin características — agrégalas desde el panel.
                </Typography>
              )}
              {caract.map((c, i) => {
                const icon = c._imgPreview || (c.url_imagen ? `${Domain}${c.url_imagen}` : null);
                const isLeft = i % 2 === 0;
                const hasNeighbor = isLeft && i + 1 < caract.length;
                return (
                  <Box key={c.id || i} sx={{
                    flex: "1 1 45%", minWidth: 200, display: "flex", gap: "14px",
                    alignItems: "flex-start", py: .5,
                    pr: hasNeighbor ? "20px" : 0, pl: isLeft ? 0 : "20px",
                    borderRight: hasNeighbor ? `1px dashed rgba(210,176,149,.4)` : "none",
                    mb: 1.5,
                  }}>
                    <Box sx={{ width: 40, height: 40, flexShrink: 0, display: "flex",
                      alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {icon ? (
                        <Box component="img" src={icon} alt=""
                          sx={{ width: 40, height: 40, objectFit: "contain" }} />
                      ) : (
                        <ImageOutlinedIcon sx={{ fontSize: 26, color: C.gold }} />
                      )}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: ".9rem", fontWeight: 700, color: C.text,
                        mb: .4, letterSpacing: ".3px" }}>
                        {c.titulo || "Característica"}
                      </Typography>
                      <Typography sx={{ fontSize: ".82rem", color: C.muted, lineHeight: 1.55 }}>
                        {c.descripcion || "Descripción…"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </EZ>

          {/* Lista de checks */}
          <EZ id="bullets" active={active} onEdit={onEdit} hint="Editar lista de checks">
            {bullets.length === 0 ? (
              <Typography sx={{ fontSize: ".85rem", color: C.muted, fontStyle: "italic" }}>
                Sin ítems — agrégalos desde el panel.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {bulletCols.map((col, ci) => (
                  <Box key={ci} sx={{ flex: "1 1 45%", minWidth: 200 }}>
                    {col.map((b, bi) => (
                      <Box key={bi} sx={{ display: "flex", alignItems: "center", gap: "10px", mb: 1.2 }}>
                        <CheckBoxOutlinedIcon sx={{ fontSize: 22, color: C.gold }} />
                        <Typography sx={{ fontSize: ".9rem", color: C.muted }}>{b}</Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </EZ>

        </Box>
      </Box>

      {/* ── CTA final (solo en la página "Quiénes Somos") ─────────── */}
      <EZ id="cta" active={active} onEdit={onEdit} hint="Editar bloque CTA"
        sx={{ maxWidth: 720, mx: "auto", mt: { xs: 5, md: 8 }, textAlign: "center" }}>
        <Typography sx={{ color: C.gold, fontSize: "1rem", fontWeight: 600,
          fontStyle: "italic", mb: 1 }}>
          {about.cta_eyebrow || "Votre rituel vous attend"}
        </Typography>
        <Typography sx={{ fontFamily: "'PT Serif', Georgia, serif",
          fontSize: "clamp(24px, 3.4vw, 34px)", fontWeight: 700, color: C.text,
          lineHeight: 1.25, textTransform: "uppercase", mb: 1.5 }}>
          {about.cta_titulo || "¿Lista para tu momento de calma?"}
        </Typography>
        <Typography sx={{ fontSize: ".92rem", color: C.muted, lineHeight: 1.7, mb: 3 }}>
          {about.cta_descripcion || "Reserva tu cita y déjate llevar por un ritual pensado para ti."}
        </Typography>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          bgcolor: C.gold, color: "#2c1408", fontWeight: 700, fontSize: "13px",
          px: "28px", py: "13px", letterSpacing: ".5px",
          boxShadow: `0 6px 24px rgba(217,165,107,.35)`,
        }}>
          {about.cta_btn_texto || "Reservar mi ritual"}
          <Box component="span" sx={{ fontSize: "15px", lineHeight: 1 }}>↗</Box>
        </Box>
      </EZ>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   CAMPO SIMPLE
══════════════════════════════════════════════════════════ */
const FF = ({ label, value, onChange, multiline = false, rows = 3, placeholder = "" }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#475569",
      textTransform: "uppercase", letterSpacing: .5, mb: .5 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" value={value || ""} multiline={multiline}
      rows={multiline ? rows : undefined} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      sx={{
        "& .MuiInputBase-root": { fontSize: ".82rem", bgcolor: "#f8fafc", alignItems: multiline ? "flex-start" : "center" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.edit },
        ...(multiline && {
          "& textarea": { resize: "vertical", overflow: "auto !important", minHeight: `${rows * 0.9}em` },
        }),
      }} />
  </Box>
);

/* ══════════════════════════════════════════════════════════
   PANEL EDITOR DERECHO
══════════════════════════════════════════════════════════ */
function EditPanel({ zone, about, caract, onChangeAbout, onChangeCaract, onSaveAbout, onSaveCaract, saving }) {
  const imgRef = useRef(null);

  const imgSrc = about._imgPreview
    || (about.url_imagen ? `${Domain}${about.url_imagen}` : null);

  const bannerSrc = about._bannerImgPreview
    || (about.banner_url_imagen ? `${Domain}${about.banner_url_imagen}` : null)
    || (about.url_imagen ? `${Domain}${about.url_imagen}` : null);

  const bullets = parseBullets(about.bullets);

  const TITLES = {
    banner:          "🖼️  Banner superior",
    imagen:          "🖼️  Imagen principal",
    stat:            "🔢  Recuadro estadístico",
    subtitulo:       "🏷️  Etiqueta superior",
    titulo:          "✏️  Título principal",
    descripcion:     "📝  Descripción",
    caracteristicas: "✦  Características (íconos)",
    bullets:         "✔️  Lista de checks",
    cta:             "🎯  Bloque CTA final",
  };

  const isAboutZone = ["subtitulo", "titulo", "descripcion", "imagen", "stat", "bullets", "cta", "banner"].includes(zone);
  const handleSave  = isAboutZone ? onSaveAbout : onSaveCaract;

  const setBullet = (i, val) => {
    const next = [...bullets]; next[i] = val; onChangeAbout("bullets", next);
  };
  const addBullet    = () => onChangeAbout("bullets", [...bullets, ""]);
  const removeBullet = (i) => onChangeAbout("bullets", bullets.filter((_, x) => x !== i));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 1, bgcolor: "#fafbfc",
        position: "sticky", top: 0, zIndex: 10 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#fff7ed",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EditIcon sx={{ fontSize: 14, color: C.edit }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: ".85rem", flex: 1, color: "#0f172a" }}>
          {TITLES[zone] || zone}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>

        {/* ── Banner superior ── */}
        {zone === "banner" && (
          <>
            <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#475569",
              textTransform: "uppercase", letterSpacing: .5, mb: .8 }}>
              Imagen del banner (Fondo)
            </Typography>
            <input type="file" ref={imgRef} accept="image/*" hidden
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                onChangeAbout("_bannerImgFile", f);
                const reader = new FileReader();
                reader.onload = ev => onChangeAbout("_bannerImgPreview", ev.target.result);
                reader.readAsDataURL(f);
              }} />
            <Box onClick={() => imgRef.current?.click()}
              sx={{ border: `2px dashed ${about._bannerImgPreview || about.banner_url_imagen ? C.edit : "#cbd5e1"}`, borderRadius: "12px",
                height: 160, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative",
                mb: 2, "&:hover": { borderColor: C.edit } }}>
              {bannerSrc ? (
                <Box component="img" src={bannerSrc}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Box sx={{ textAlign: "center", color: "#94a3b8" }}>
                  <ImageOutlinedIcon sx={{ fontSize: 36, opacity: .4 }} />
                  <Typography sx={{ fontSize: ".7rem", mt: .5 }}>Clic para subir imagen</Typography>
                </Box>
              )}
              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: ".2s", "&:hover": { opacity: 1 } }}>
                <PhotoCameraIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Box>
            </Box>

            <FF label="Título del banner" value={about.banner_titulo}
              placeholder="QUIÉNES SOMOS" onChange={v => onChangeAbout("banner_titulo", v)} />
            <FF label="Subtítulo / Eyebrow del banner" value={about.banner_subtitulo}
              placeholder="L'histoire · Notre Maison" onChange={v => onChangeAbout("banner_subtitulo", v)} />
          </>
        )}

        {/* ── Imagen principal ── */}
        {zone === "imagen" && (
          <>
            <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#475569",
              textTransform: "uppercase", letterSpacing: .5, mb: .8 }}>
              Imagen principal (formato 1:1)
            </Typography>
            <input type="file" ref={imgRef} accept="image/*" hidden
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                onChangeAbout("_imgFile", f);
                const reader = new FileReader();
                reader.onload = ev => onChangeAbout("_imgPreview", ev.target.result);
                reader.readAsDataURL(f);
              }} />
            <Box onClick={() => imgRef.current?.click()}
              sx={{ border: `2px dashed ${imgSrc ? C.edit : "#cbd5e1"}`, borderRadius: "12px",
                aspectRatio: "1 / 1", maxWidth: 240, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative",
                "&:hover": { borderColor: C.edit } }}>
              {imgSrc ? (
                <Box component="img" src={imgSrc}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Box sx={{ textAlign: "center", color: "#94a3b8" }}>
                  <ImageOutlinedIcon sx={{ fontSize: 36, opacity: .4 }} />
                  <Typography sx={{ fontSize: ".7rem", mt: .5 }}>Clic para subir imagen</Typography>
                </Box>
              )}
              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: ".2s", "&:hover": { opacity: 1 } }}>
                <PhotoCameraIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Box>
            </Box>
            {imgSrc && (
              <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize: 13 }} />}
                onClick={() => { onChangeAbout("_imgPreview", null); onChangeAbout("_imgFile", null); }}
                sx={{ mt: .5, color: "#ef4444", textTransform: "none", fontSize: ".75rem" }}>
                Quitar imagen seleccionada
              </Button>
            )}
            <Typography sx={{ fontSize: ".7rem", color: "#94a3b8", mt: 1, lineHeight: 1.5 }}>
              Se muestra en formato cuadrado (1:1) a la izquierda de la sección.
            </Typography>
          </>
        )}

        {/* ── Recuadro estadístico ── */}
        {zone === "stat" && (
          <>
            <FF label="Valor (ej: 100%)" value={about.stat_valor}
              placeholder="100%" onChange={v => onChangeAbout("stat_valor", v)} />
            <FF label="Texto del recuadro" value={about.stat_etiqueta}
              placeholder="Soin dédié · Atención con reserva" multiline rows={2}
              onChange={v => onChangeAbout("stat_etiqueta", v)} />
            <Typography sx={{ fontSize: ".7rem", color: "#94a3b8", mt: .5, lineHeight: 1.5 }}>
              Es la etiqueta oscura con borde blanco superpuesta sobre la imagen.
            </Typography>
          </>
        )}

        {/* ── Etiqueta superior ── */}
        {zone === "subtitulo" && (
          <FF label="Etiqueta (ej: ¿Qué es Amour Spa?)" value={about.subtitulo}
            placeholder="¿Qué es Amour Spa?" onChange={v => onChangeAbout("subtitulo", v)} />
        )}

        {/* ── Título ── */}
        {zone === "titulo" && (
          <>
            <FF label="Título principal" value={about.titulo} multiline rows={3}
              onChange={v => onChangeAbout("titulo", v)} />
            <Typography sx={{ fontSize: ".7rem", color: "#94a3b8", lineHeight: 1.5 }}>
              Se muestra en MAYÚSCULAS automáticamente en el sitio.
            </Typography>
          </>
        )}

        {/* ── Descripción ── */}
        {zone === "descripcion" && (
          <FF label="Descripción" value={about.descripcion}
            onChange={v => onChangeAbout("descripcion", v)} multiline rows={8} />
        )}

        {/* ── Características ── */}
        {zone === "caracteristicas" && (
          <CaractEditor items={caract} onChangeCaract={onChangeCaract} />
        )}

        {/* ── Lista de checks ── */}
        {zone === "bullets" && (
          <Box>
            <Typography sx={{ fontSize: "10px", color: "#64748b", mb: 1.5, lineHeight: 1.5 }}>
              Ítems con ✔ que aparecen en dos columnas debajo de las características.
            </Typography>
            {bullets.map((b, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                <CheckBoxOutlinedIcon sx={{ fontSize: 20, color: C.gold, flexShrink: 0 }} />
                <TextField size="small" fullWidth value={b}
                  placeholder="Texto del ítem"
                  onChange={e => setBullet(i, e.target.value)}
                  sx={{ "& .MuiInputBase-root": { fontSize: ".8rem", bgcolor: "#f8fafc" } }} />
                <IconButton size="small" onClick={() => removeBullet(i)}
                  sx={{ color: "#ef4444", flexShrink: 0 }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={addBullet}
              sx={{ textTransform: "none", fontSize: ".78rem", color: C.edit, mt: .5 }}>
              Agregar ítem
            </Button>
          </Box>
        )}

        {/* ── Bloque CTA final ── */}
        {zone === "cta" && (
          <>
            <Box sx={{ bgcolor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px",
              p: 1.2, mb: 1.8 }}>
              <Typography sx={{ fontSize: ".72rem", color: "#9a3412", lineHeight: 1.5 }}>
                Este bloque aparece al final de la página pública <b>“Quiénes Somos”</b>.
              </Typography>
            </Box>
            <FF label="Etiqueta superior" value={about.cta_eyebrow}
              placeholder="Votre rituel vous attend" onChange={v => onChangeAbout("cta_eyebrow", v)} />
            <FF label="Título" value={about.cta_titulo} multiline rows={2}
              placeholder="¿Lista para tu momento de calma?" onChange={v => onChangeAbout("cta_titulo", v)} />
            <FF label="Descripción" value={about.cta_descripcion} multiline rows={3}
              placeholder="Reserva tu cita y déjate llevar…" onChange={v => onChangeAbout("cta_descripcion", v)} />
            <FF label="Texto del botón" value={about.cta_btn_texto}
              placeholder="Reservar mi ritual" onChange={v => onChangeAbout("cta_btn_texto", v)} />
            <FF label="URL del botón (opcional)" value={about.cta_btn_url}
              placeholder="Vacío = WhatsApp del sitio" onChange={v => onChangeAbout("cta_btn_url", v)} />
            <Typography sx={{ fontSize: ".7rem", color: "#94a3b8", lineHeight: 1.5 }}>
              Si dejas la URL vacía, el botón usa automáticamente el WhatsApp configurado del sitio.
            </Typography>
          </>
        )}

      </Box>

      {/* Footer guardar */}
      <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f1f5f9" }}>
        <Button variant="contained" fullWidth startIcon={<SaveIcon sx={{ fontSize: 15 }} />}
          onClick={handleSave} disabled={saving}
          sx={{ textTransform: "none", fontWeight: 800, fontSize: ".85rem",
            bgcolor: C.gold, borderRadius: "10px", py: 1.1,
            boxShadow: `0 4px 16px rgba(217,165,107,.35)`,
            "&:hover": { bgcolor: "#c08f52" } }}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   EDITOR DE CARACTERÍSTICAS (dentro del panel)
══════════════════════════════════════════════════════════ */
function CaractEditor({ items, onChangeCaract }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "10px", color: "#64748b", mb: 1.5, lineHeight: 1.5 }}>
        Íconos con título y texto (ej. MANOS EXPERTAS, ARMONÍA CORPORAL).
        En la página de inicio se muestran los 2 primeros.
      </Typography>
      {items.map((c, i) => (
        <CaractItem key={c.id || i} item={c} index={i} onChangeCaract={onChangeCaract} />
      ))}
      <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
        onClick={() => onChangeCaract("add", null)}
        sx={{ textTransform: "none", fontSize: ".78rem", color: C.edit, mt: 1 }}>
        Agregar característica
      </Button>
    </Box>
  );
}

function CaractItem({ item, index, onChangeCaract }) {
  const fileRef = useRef(null);
  const imgSrc  = item._imgPreview || (item.url_imagen ? `${Domain}${item.url_imagen}` : null);

  return (
    <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px",
      border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        {/* Mini ícono */}
        <Box onClick={() => fileRef.current?.click()}
          sx={{ width: 52, height: 52, borderRadius: "10px", flexShrink: 0,
            border: `2px dashed ${imgSrc ? C.edit : "#cbd5e1"}`, overflow: "hidden",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: "#fff", "&:hover": { borderColor: C.edit } }}>
          {imgSrc ? (
            <Box component="img" src={imgSrc} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <ImageOutlinedIcon sx={{ fontSize: 22, color: "#cbd5e1" }} />
          )}
        </Box>
        <input type="file" hidden ref={fileRef} accept="image/*"
          onChange={e => {
            const f = e.target.files?.[0];
            if (!f) return;
            onChangeCaract("img", { index, file: f });
          }} />

        {/* Campos */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: .8 }}>
          <TextField size="small" placeholder="Título" value={item.titulo || ""}
            onChange={e => onChangeCaract("field", { index, key: "titulo", val: e.target.value })}
            sx={{ "& .MuiInputBase-root": { fontSize: ".8rem" } }} />
          <TextField size="small" placeholder="Descripción" value={item.descripcion || ""}
            multiline rows={2}
            onChange={e => onChangeCaract("field", { index, key: "descripcion", val: e.target.value })}
            sx={{ "& .MuiInputBase-root": { fontSize: ".78rem" } }} />
        </Box>

        {/* Eliminar */}
        <IconButton size="small" onClick={() => onChangeCaract("remove", { index })}
          sx={{ color: "#ef4444", flexShrink: 0 }}>
          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
const AboutIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();

  const [aboutData,  setAboutData]  = useState(null);      // registro principal
  const [caractData, setCaractData] = useState([]);        // características
  const [aboutDraft, setAboutDraft] = useState({});        // cambios sin guardar
  const [caractDraft,setCaractDraft]= useState(null);      // null = sin cambios
  const [activeZone, setActiveZone] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const panelRef = useRef(null);

  /* Merged */
  const about  = { ...(aboutData || {}), ...aboutDraft };
  const caract = caractDraft ?? caractData;

  /* ── Carga inicial ── */
  const load = async () => {
    setLoading(true);
    try {
      const [abouts, caracts] = await Promise.all([listar(), listarCaract()]);
      const ab = Array.isArray(abouts)  ? abouts[0] : abouts;
      const ca = Array.isArray(caracts) ? caracts   : [caracts];
      setAboutData(ab  || {});
      setCaractData(ca || []);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  /* ── Cambios about ── */
  const handleChangeAbout = (field, val) =>
    setAboutDraft(p => ({ ...p, [field]: val }));

  /* ── Cambios características ── */
  const handleChangeCaract = (action, payload) => {
    const base = caractDraft ?? [...caractData];
    if (action === "add") {
      setCaractDraft([...base, { titulo: "", descripcion: "", _new: true }]);
    } else if (action === "remove") {
      const updated = [...base];
      updated.splice(payload.index, 1);
      setCaractDraft(updated);
    } else if (action === "field") {
      setCaractDraft(base.map((c, i) =>
        i === payload.index ? { ...c, [payload.key]: payload.val } : c));
    } else if (action === "img") {
      const updated = base.map((c, i) => {
        if (i !== payload.index) return c;
        const reader = new FileReader();
        reader.onload = ev => {
          setCaractDraft(prev => (prev ?? base).map((x, xi) =>
            xi === payload.index ? { ...x, _imgPreview: ev.target.result } : x));
        };
        reader.readAsDataURL(payload.file);
        return { ...c, _imgFile: payload.file };
      });
      setCaractDraft(updated);
    }
  };

  /* ── Guardar about ── */
  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("id_about",      aboutData?.id_about || 1);
      fd.append("titulo",        about.titulo        || "");
      fd.append("subtitulo",     about.subtitulo     || "");
      fd.append("descripcion",   about.descripcion   || "");
      fd.append("stat_valor",    about.stat_valor    || "");
      fd.append("stat_etiqueta", about.stat_etiqueta || "");
      fd.append("bullets",       JSON.stringify(parseBullets(about.bullets).map(b => (b || "").trim()).filter(Boolean)));
      fd.append("cta_eyebrow",     about.cta_eyebrow     || "");
      fd.append("cta_titulo",      about.cta_titulo      || "");
      fd.append("cta_descripcion", about.cta_descripcion || "");
      fd.append("cta_btn_texto",   about.cta_btn_texto   || "");
      fd.append("cta_btn_url",     about.cta_btn_url     || "");
      fd.append("banner_titulo",    about.banner_titulo   || "");
      fd.append("banner_subtitulo", about.banner_subtitulo|| "");
      fd.append("Activo",        "S");
      if (about._imgFile) fd.append("image", about._imgFile);
      if (about._bannerImgFile) fd.append("banner_image", about._bannerImgFile);

      await actualizar(fd);
      toastSuccess("Sección 'Sobre Nosotros' actualizada ✓");
      setAboutDraft({});
      load();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Guardar características ── */
  const handleSaveCaract = async () => {
    if (!caractDraft) { toastSuccess("Sin cambios en características"); return; }
    setSaving(true);
    try {
      for (const c of caractDraft) {
        const fd = new FormData();
        if (c._new) {
          fd.append("titulo",      c.titulo      || "");
          fd.append("descripcion", c.descripcion || "");
          if (c._imgFile) fd.append("image", c._imgFile);
          await crearCaract(fd);
        } else if (c.id) {
          fd.append("id",          c.id);
          fd.append("titulo",      c.titulo      || "");
          fd.append("descripcion", c.descripcion || "");
          if (c._imgFile) fd.append("image", c._imgFile);
          await actualizarCaract(fd);
        }
      }
      const removedIds = caractData
        .filter(old => !caractDraft.some(n => n.id === old.id))
        .map(x => x.id);
      for (const id of removedIds) {
        await eliminarCaract({ id });
      }

      toastSuccess("Características actualizadas ✓");
      setCaractDraft(null);
      load();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (zone) => {
    setActiveZone(p => p === zone ? null : zone);
    setTimeout(() => { panelRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, 60);
  };

  const hasDraft = Object.keys(aboutDraft).length > 0 || caractDraft !== null;

  /* ═══════════════════════════════════════════════════════ */
  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#f0f4f8" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        bgcolor: "#0f172a", borderRadius: "12px", px: 2.5, py: 1.2 }}>
        <InfoOutlinedIcon sx={{ color: C.gold, fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: ".9rem", color: "#f1f5f9", lineHeight: 1 }}>
            Editor de "Sobre Nosotros" — Vista real del sitio
          </Typography>
          <Typography sx={{ fontSize: ".65rem", color: "#94a3b8", mt: .3 }}>
            Haz clic en el ✏️ sobre cualquier elemento para editarlo. Así se verá en tu web.
          </Typography>
        </Box>
        <Chip label="Vista previa en tiempo real" size="small"
          sx={{ bgcolor: "rgba(217,165,107,.15)", color: C.gold, fontSize: ".65rem", height: 22 }} />
        {hasDraft && (
          <Button size="small" variant="outlined"
            onClick={() => { setAboutDraft({}); setCaractDraft(null); }}
            sx={{ textTransform: "none", fontSize: ".75rem", color: "#94a3b8",
              borderColor: "#334155", borderRadius: "8px" }}>
            Descartar
          </Button>
        )}
      </Box>

      {/* ── Body: canvas + panel ── */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

        {/* Canvas */}
        <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => activeZone && setActiveZone(null)}>
          <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden",
            border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
            {aboutData !== null ? (
              <CanvasPreview about={about} caract={caract} active={activeZone} onEdit={handleEdit} bannerPreview={about._bannerImgPreview} />
            ) : (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <CircularProgress size={28} sx={{ color: C.gold }} />
              </Box>
            )}
          </Paper>

          {/* Leyenda de zonas */}
          <Box sx={{ mt: 1.5, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {[
              { label: "🖼️ Banner superior", zone: "banner" },
              { label: "🖼️ Imagen",        zone: "imagen" },
              { label: "🔢 Recuadro 100%",  zone: "stat" },
              { label: "🏷️ Etiqueta",       zone: "subtitulo" },
              { label: "✏️ Título",          zone: "titulo" },
              { label: "📝 Descripción",     zone: "descripcion" },
              { label: "✦ Características",  zone: "caracteristicas" },
              { label: "✔️ Lista de checks", zone: "bullets" },
              { label: "🎯 CTA final",       zone: "cta" },
            ].map(({ label, zone }) => (
              <Box key={zone} onClick={() => handleEdit(zone)}
                sx={{ display: "flex", alignItems: "center", gap: .6,
                  cursor: "pointer", px: 1.2, py: .5, borderRadius: "8px",
                  bgcolor: activeZone === zone ? "#fff7ed" : "#fff",
                  border: `1px solid ${activeZone === zone ? C.edit : "#e2e8f0"}`,
                  "&:hover": { borderColor: C.edit } }}>
                <Typography sx={{ fontSize: ".72rem",
                  fontWeight: activeZone === zone ? 700 : 400,
                  color: activeZone === zone ? C.edit : "#64748b" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Panel editor derecho */}
        {activeZone && (
          <Box ref={panelRef} sx={{
            width: 360, flexShrink: 0,
            bgcolor: "#fff", borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,.08)",
            maxHeight: "80vh", overflowY: "auto",
            position: "sticky", top: 16,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end",
              px: 1.5, pt: 1 }}>
              <IconButton size="small" onClick={() => setActiveZone(null)}
                sx={{ color: "#94a3b8" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <EditPanel
              zone={activeZone}
              about={about}
              caract={caract}
              onChangeAbout={handleChangeAbout}
              onChangeCaract={handleChangeCaract}
              onSaveAbout={handleSaveAbout}
              onSaveCaract={handleSaveCaract}
              saving={saving}
            />
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default injectIntl(WithLoandingPanel(AboutIndexPage));
