import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, IconButton, TextField,
  CircularProgress, Stack, Grid, Paper, Chip, Divider,
} from "@mui/material";
import EditIcon          from "@mui/icons-material/Edit";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import AddIcon           from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupsIcon        from "@mui/icons-material/Groups";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";

import {
  obtener, actualizar_pagina, actualizar_quienes,
  crear_beneficio, actualizar_beneficio, eliminar_beneficio,
  crear_contador, actualizar_contador, eliminar_contador,
  actualizar_producto_seccion, crear_producto, actualizar_producto, eliminar_producto,
} from "../../../api/web_pagina_nosotros.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import CmsTinyMceField from "app/components/cms/CmsTinyMceField";

// ─── Edit Zone ────────────────────────────────────────────────────────────────
function EZ({ id, active, onEdit, children, sx = {} }) {
  const isA = active === id;
  return (
    <Box sx={{
      position: "relative",
      outline: isA ? "2.5px solid #2563eb" : "2.5px solid transparent",
      outlineOffset: 3, borderRadius: 1,
      transition: "outline 0.15s",
      "&:hover .ez-btn": { opacity: 1 },
      ...sx,
    }}>
      {children}
      <Box className="ez-btn" onClick={e => { e.stopPropagation(); onEdit(id); }}
        sx={{
          position: "absolute", top: -12, right: -12,
          opacity: isA ? 1 : 0, transition: "opacity 0.15s", zIndex: 30,
          cursor: "pointer",
          bgcolor: isA ? "#1d4ed8" : "#2563eb", color: "#fff",
          borderRadius: "50%", width: 28, height: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 3px 10px rgba(37,99,235,0.5)",
          "&:hover": { bgcolor: "#1d4ed8", transform: "scale(1.12)" },
        }}>
        <EditIcon sx={{ fontSize: 14 }} />
      </Box>
    </Box>
  );
}

// ─── Image Upload Box ─────────────────────────────────────────────────────────
function ImgUpload({ storagePath, preview, onSelect, height = 200, label = "Clic para subir imagen" }) {
  const ref = useRef(null);
  const src = preview || (storagePath ? storagePath : null);
  return (
    <Box onClick={() => ref.current?.click()}
      sx={{
        height, border: `2px dashed ${src ? "#2563eb" : "#cbd5e1"}`,
        borderRadius: "10px", cursor: "pointer", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: "#f8fafc", position: "relative",
        "&:hover": { borderColor: "#2563eb" },
        "&:hover .cam": { opacity: 1 },
      }}>
      <input ref={ref} type="file" hidden accept="image/*"
        onChange={e => { const f = e.target.files?.[0]; if (f) onSelect(f, URL.createObjectURL(f)); }} />
      {src ? (
        <>
          <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <Box className="cam" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.45)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s" }}>
            <PhotoCameraIcon sx={{ color: "#fff", fontSize: 28 }} />
            <Typography sx={{ color: "#fff", fontSize: "0.7rem", mt: 0.5 }}>Cambiar imagen</Typography>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: "center", color: "#94a3b8" }}>
          <ImageOutlinedIcon sx={{ fontSize: 36, opacity: 0.5 }} />
          <Typography sx={{ fontSize: "0.7rem", mt: 0.5 }}>{label}</Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── CANVAS VISUAL ────────────────────────────────────────────────────────────
function NosotrosCanvas({ pagina, quienes, beneficios, contadores, prodSeccion, productos, active, onEdit,
  bannerPreview, introLogoPreview, quienesPreview }) {

  const bannerSrc = bannerPreview || pagina.banner_url_imagen;
  const logoSrc   = introLogoPreview || pagina.intro_url_logo;
  const quienesSrc = quienesPreview || quienes.url_imagen;

  return (
    <Box sx={{ fontFamily: "Inter, sans-serif", bgcolor: "#fff", overflow: "hidden" }}>

      {/* ── BANNER ──────────────────────────────────────────────────────────── */}
      <EZ id="banner" active={active} onEdit={onEdit}>
        <Box sx={{
          position: "relative", minHeight: 280,
          bgcolor: bannerSrc ? "transparent" : "#0f172a",
          backgroundImage: bannerSrc ? `url(${bannerSrc})` : "none",
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          {/* Overlay */}
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(15,23,42,0.55)" }} />
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            {!bannerSrc && (
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", mb: 2 }}>
                Sin imagen de fondo — haz clic en ✏️ para subir
              </Typography>
            )}
            <Typography sx={{ fontSize: "1rem", color: "#94a3b8", textTransform: "uppercase",
              letterSpacing: 3, mb: 0.5, fontWeight: 500 }}>
              {pagina.banner_subtitulo || ""}
            </Typography>
            <Typography
              dangerouslySetInnerHTML={{ __html: pagina.banner_titulo || "<h2>Nosotros</h2>" }}
              sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
                "& h1,& h2,& h3": { margin: 0, color: "#fff" } }}
            />
            {pagina.banner_empresa && (
              <Typography sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5, fontSize: "0.9rem" }}>
                {pagina.banner_empresa}
              </Typography>
            )}
          </Box>
        </Box>
      </EZ>

      {/* ── INTRO ───────────────────────────────────────────────────────────── */}
      <EZ id="intro" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 6, display: "flex", gap: 6,
          alignItems: "center", flexWrap: "wrap", bgcolor: "#fff" }}>
          <Box flex={1} sx={{ minWidth: 260 }}>
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", mb: 1.5 }}>
              {pagina.intro_titulo || "J&H Importaciones"}
            </Typography>
            <Typography sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.92rem", mb: 2 }}>
              {pagina.intro_descripcion || "Descripción de la empresa..."}
            </Typography>
            {pagina.intro_btn_texto && (
              <Box sx={{ display: "inline-block", bgcolor: "#e11d48", color: "#fff",
                borderRadius: "6px", px: 3, py: 1.2, fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer" }}>
                {pagina.intro_btn_texto}
              </Box>
            )}
          </Box>
          {logoSrc ? (
            <Box component="img" src={logoSrc} alt="Logo"
              sx={{ width: 220, height: 180, objectFit: "contain", flexShrink: 0 }} />
          ) : (
            <Box sx={{ width: 220, height: 180, bgcolor: "#f1f5f9", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              border: "2px dashed #cbd5e1" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>Logo empresa</Typography>
            </Box>
          )}
        </Box>
      </EZ>

      {/* ── QUIÉNES SOMOS ───────────────────────────────────────────────────── */}
      <EZ id="quienes" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 6, display: "flex", gap: 5,
          alignItems: "flex-start", flexWrap: "wrap", bgcolor: "#f8fafc" }}>
          {quienesSrc ? (
            <Box component="img" src={quienesSrc} alt="Quiénes somos"
              sx={{ width: 260, height: 260, objectFit: "cover", borderRadius: "12px",
                flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
          ) : (
            <Box sx={{ width: 260, height: 260, bgcolor: "#e2e8f0", borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              border: "2px dashed #94a3b8" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>Imagen quiénes somos</Typography>
            </Box>
          )}
          <Box flex={1} sx={{ minWidth: 260 }}>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", mb: 1.5 }}>
              {quienes.titulo || "¿Quiénes Somos?"}
            </Typography>
            <Typography sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.88rem", mb: 2 }}
              dangerouslySetInnerHTML={{ __html: quienes.descripcion || "Descripción..." }} />
            {beneficios.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {beneficios.map((b, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.85rem", color: "#334155" }}>{b.texto}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </EZ>

      {/* ── ESTADÍSTICAS ────────────────────────────────────────────────────── */}
      {contadores.length > 0 && (
        <EZ id="contadores" active={active} onEdit={onEdit}>
          <Box sx={{ bgcolor: "#0f172a", py: 5, px: { xs: 3, md: 8 } }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4 }}>
              {contadores.map((c, i) => (
                <Box key={i} sx={{ textAlign: "center", minWidth: 120 }}>
                  <Typography sx={{ fontSize: "2rem", fontWeight: 900, color: "#2563eb", lineHeight: 1 }}>
                    {c.valor}{c.sufijo || "+"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", mt: 0.5 }}>
                    {c.etiqueta}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </EZ>
      )}

      {/* ── PRODUCTOS ───────────────────────────────────────────────────────── */}
      {productos.length > 0 && (
        <EZ id="productos" active={active} onEdit={onEdit}>
          <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#fff" }}>
            <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a",
              textAlign: "center", mb: 0.5 }}>
              {prodSeccion.seccion_titulo || "Algunos productos"}
            </Typography>
            {prodSeccion.seccion_descripcion && (
              <Typography sx={{ textAlign: "center", color: "#64748b", mb: 3, fontSize: "0.88rem" }}>
                {prodSeccion.seccion_descripcion}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              {productos.slice(0, 3).map((p, i) => (
                <Box key={i} sx={{ width: 200, borderRadius: "10px", overflow: "hidden",
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <CmsStorageImage storagePath={p.url_imagen}
                    sx={{ width: "100%", height: 130, objectFit: "cover" }} />
                  <Box sx={{ p: 1.5 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                      {p.titulo}
                    </Typography>
                    <Box sx={{ bgcolor: "#e11d48", color: "#fff", borderRadius: "6px",
                      px: 1.5, py: 0.5, fontSize: "0.72rem", fontWeight: 700,
                      display: "inline-block", cursor: "pointer" }}>
                      {p.btn_texto || "Me interesa"}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </EZ>
      )}

      {/* ── FRASE ───────────────────────────────────────────────────────────── */}
      <EZ id="frase" active={active} onEdit={onEdit}>
        <Box sx={{ bgcolor: "#1e3a8a", py: 6, px: { xs: 3, md: 12 }, textAlign: "center" }}>
          <Typography sx={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontWeight: 700,
            color: "#fff", fontStyle: "italic", lineHeight: 1.6 }}>
            "{pagina.frase_texto || "Calidad y servicio en cada producto."}"
          </Typography>
        </Box>
      </EZ>

    </Box>
  );
}

// ─── PANEL EDITOR ─────────────────────────────────────────────────────────────
function EditPanel({ zone, pagina, setPagina, quienes, setQuienes, beneficios, setBeneficios,
  contadores, setContadores, prodSeccion, setProdSeccion, productos, setProductos,
  bannerPreview, setBannerPreview, setBannerFile,
  introLogoPreview, setIntroLogoPreview, setIntroLogoFile,
  quienesPreview, setQuienesPreview, setQuienesFile,
  onSave, onSaveQuienes, onSaveContador, onSaveBeneficio, onDeleteBeneficio,
  onSaveProdSeccion, saving, onClose,
}) {
  const [prodEdit, setProdEdit] = useState(null);
  const [prodFile, setProdFile] = useState(null);
  const [prodPreview, setProdPreview] = useState(null);

  const titles = {
    banner:    "🖼️ Banner superior",
    intro:     "📋 Intro — Empresa",
    quienes:   "👥 ¿Quiénes Somos?",
    contadores:"📊 Estadísticas",
    productos: "📦 Productos destacados",
    frase:     "💬 Frase destacada",
  };

  const saveProd = async () => {
    if (!prodEdit?.titulo?.trim()) return;
    try {
      const fd = new FormData();
      if (prodEdit.id) {
        fd.append("id", prodEdit.id); fd.append("titulo", prodEdit.titulo);
        fd.append("descripcion", prodEdit.descripcion || "");
        fd.append("btn_texto", prodEdit.btn_texto || "Me interesa");
        fd.append("btn_url", prodEdit.btn_url || "");
        if (prodFile) fd.append("image", prodFile);
        await actualizar_producto(fd);
      } else {
        fd.append("titulo", prodEdit.titulo); fd.append("descripcion", prodEdit.descripcion || "");
        fd.append("btn_texto", prodEdit.btn_texto || "Me interesa");
        fd.append("btn_url", prodEdit.btn_url || "");
        if (prodFile) fd.append("image", prodFile);
        await crear_producto(fd);
      }
      toastSuccess("Producto guardado");
      setProdEdit(null); setProdFile(null); setProdPreview(null);
      onSave(); // recarga
    } catch (e) { handleErrorMessages(e); }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 1, bgcolor: "#fafbfc", flexShrink: 0 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#eff6ff",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EditIcon sx={{ fontSize: 14, color: "#2563eb" }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", flex: 1, color: "#0f172a" }}>
          {titles[zone] || zone}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>

        {/* BANNER */}
        {zone === "banner" && (
          <Box>
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Imagen de fondo
            </Typography>
            <ImgUpload storagePath={pagina.banner_url_imagen} preview={bannerPreview}
              height={160} label="Subir imagen de fondo del banner"
              onSelect={(f, url) => { setBannerFile(f); setBannerPreview(url); }} />
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569", mb: 0.5,
                textTransform: "uppercase", letterSpacing: 0.5 }}>
                Título del banner
              </Typography>
              <TextField fullWidth size="small" value={pagina.banner_titulo || ""}
                onChange={e => setPagina(p => ({ ...p, banner_titulo: e.target.value }))}
                placeholder="Nosotros"
                sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem" } }} />
            </Box>
            <Box sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569", mb: 0.5,
                textTransform: "uppercase", letterSpacing: 0.5 }}>
                Nombre empresa (subtítulo)
              </Typography>
              <TextField fullWidth size="small" value={pagina.banner_empresa || ""}
                onChange={e => setPagina(p => ({ ...p, banner_empresa: e.target.value }))}
                placeholder="J&H Importaciones"
                sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem" } }} />
            </Box>
          </Box>
        )}

        {/* INTRO */}
        {zone === "intro" && (
          <Box>
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Título
            </Typography>
            <TextField fullWidth size="small" sx={{ mb: 1.5 }} value={pagina.intro_titulo || ""}
              onChange={e => setPagina(p => ({ ...p, intro_titulo: e.target.value }))} />
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Descripción
            </Typography>
            <TextField fullWidth size="small" multiline rows={4} sx={{ mb: 1.5 }} value={pagina.intro_descripcion || ""}
              onChange={e => setPagina(p => ({ ...p, intro_descripcion: e.target.value }))} />
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Texto botón" value={pagina.intro_btn_texto || ""}
                  onChange={e => setPagina(p => ({ ...p, intro_btn_texto: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="URL botón" value={pagina.intro_btn_url || ""}
                  onChange={e => setPagina(p => ({ ...p, intro_btn_url: e.target.value }))} />
              </Grid>
            </Grid>
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Logo / imagen derecha
            </Typography>
            <ImgUpload storagePath={pagina.intro_url_logo} preview={introLogoPreview}
              height={140} label="Subir logo de la empresa"
              onSelect={(f, url) => { setIntroLogoFile(f); setIntroLogoPreview(url); }} />
          </Box>
        )}

        {/* QUIÉNES */}
        {zone === "quienes" && (
          <Box>
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Imagen
            </Typography>
            <ImgUpload storagePath={quienes.url_imagen} preview={quienesPreview}
              height={160} label="Subir imagen de quiénes somos"
              onSelect={(f, url) => { setQuienesFile(f); setQuienesPreview(url); }} />
            <TextField fullWidth size="small" label="Título" sx={{ mt: 2, mb: 1.5 }} value={quienes.titulo || ""}
              onChange={e => setQuienes(q => ({ ...q, titulo: e.target.value }))} />
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Descripción
            </Typography>
            <CmsTinyMceField value={quienes.descripcion || ""}
              onChange={v => setQuienes(q => ({ ...q, descripcion: v }))} mode="standard" height={160} />
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
              Beneficios (lista con ✓)
            </Typography>
            {beneficios.map((b, idx) => (
              <Box key={b.id || idx} sx={{ display: "flex", gap: 0.5, mb: 0.8, alignItems: "center" }}>
                <TextField size="small" fullWidth value={b.texto || ""}
                  onChange={e => setBeneficios(l => l.map((x, i) => i === idx ? { ...x, texto: e.target.value } : x))}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem" } }} />
                <IconButton size="small" sx={{ color: "#2563eb" }} onClick={() => onSaveBeneficio(b, idx)}>
                  <SaveIcon sx={{ fontSize: 14 }} />
                </IconButton>
                {b.id && (
                  <IconButton size="small" sx={{ color: "#ef4444" }} onClick={() => onDeleteBeneficio(b)}>
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setBeneficios(l => [...l, { texto: "" }])}
              sx={{ color: "#2563eb", textTransform: "none", fontSize: "0.75rem" }}>
              Agregar beneficio
            </Button>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" fullWidth onClick={onSaveQuienes}
                startIcon={<SaveIcon sx={{ fontSize: 15 }} />} disabled={saving}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb",
                  borderRadius: "9px", "&:hover": { bgcolor: "#1d4ed8" } }}>
                Guardar Quiénes Somos
              </Button>
            </Box>
          </Box>
        )}

        {/* ESTADÍSTICAS */}
        {zone === "contadores" && (
          <Box>
            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 1.5 }}>
              Edita cada estadística y guárdala individualmente.
            </Typography>
            {contadores.map((c, idx) => (
              <Box key={c.id || idx} sx={{ mb: 1.5, p: 1.5, bgcolor: "#f8fafc",
                borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <TextField size="small" fullWidth label="Número" value={c.valor || ""}
                      onChange={e => setContadores(l => l.map((x, i) => i === idx ? { ...x, valor: e.target.value } : x))} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField size="small" fullWidth label="Sufijo" value={c.sufijo || "+"}
                      onChange={e => setContadores(l => l.map((x, i) => i === idx ? { ...x, sufijo: e.target.value } : x))} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField size="small" fullWidth label="Etiqueta" value={c.etiqueta || ""}
                      onChange={e => setContadores(l => l.map((x, i) => i === idx ? { ...x, etiqueta: e.target.value } : x))} />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={() => onSaveContador(c, idx)}
                    sx={{ textTransform: "none", bgcolor: "#2563eb", fontSize: "0.72rem" }}>
                    Guardar
                  </Button>
                  {c.id && (
                    <Button size="small" color="error" onClick={async () => {
                      await eliminar_contador({ id: c.id });
                      setContadores(l => l.filter((_, i) => i !== idx));
                    }} sx={{ textTransform: "none", fontSize: "0.72rem" }}>
                      Eliminar
                    </Button>
                  )}
                </Stack>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setContadores(l => [...l, { valor: "0", sufijo: "+", etiqueta: "Nueva estadística" }])}
              sx={{ color: "#2563eb", textTransform: "none", fontSize: "0.75rem" }}>
              Agregar estadística
            </Button>
          </Box>
        )}

        {/* PRODUCTOS */}
        {zone === "productos" && (
          <Box>
            <TextField fullWidth size="small" label="Título sección" sx={{ mb: 1 }}
              value={prodSeccion.seccion_titulo || ""}
              onChange={e => setProdSeccion(s => ({ ...s, seccion_titulo: e.target.value }))} />
            <TextField fullWidth size="small" label="Descripción sección" multiline rows={2} sx={{ mb: 1.5 }}
              value={prodSeccion.seccion_descripcion || ""}
              onChange={e => setProdSeccion(s => ({ ...s, seccion_descripcion: e.target.value }))} />
            <Button size="small" variant="outlined" onClick={onSaveProdSeccion}
              sx={{ mb: 2, textTransform: "none", borderColor: "#e2e8f0", color: "#475569" }}>
              Guardar título sección
            </Button>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
              Productos ({productos.length})
            </Typography>
            {productos.map((p, i) => (
              <Box key={p.id} sx={{ display: "flex", gap: 1, alignItems: "center",
                mb: 0.8, p: 1, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <CmsStorageImage storagePath={p.url_imagen}
                  sx={{ width: 44, height: 44, objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                <Typography sx={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }} noWrap>
                  {p.titulo}
                </Typography>
                <IconButton size="small" sx={{ color: "#2563eb" }} onClick={() => setProdEdit({ ...p })}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: "#ef4444" }}
                  onClick={async () => { await eliminar_producto({ id: p.id }); onSave(); }}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setProdEdit({ titulo: "", descripcion: "", btn_texto: "Me interesa", btn_url: "" })}
              sx={{ color: "#2563eb", textTransform: "none", fontSize: "0.75rem", mt: 1 }}>
              Agregar producto
            </Button>

            {/* Form inline producto */}
            {prodEdit && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#eff6ff", borderRadius: "10px",
                border: "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", mb: 1.2 }}>
                  {prodEdit.id ? "Editar" : "Nuevo"} producto
                </Typography>
                <TextField fullWidth size="small" label="Título" sx={{ mb: 1 }} value={prodEdit.titulo || ""}
                  onChange={e => setProdEdit(x => ({ ...x, titulo: e.target.value }))} />
                <TextField fullWidth size="small" label="Descripción" sx={{ mb: 1 }} value={prodEdit.descripcion || ""}
                  onChange={e => setProdEdit(x => ({ ...x, descripcion: e.target.value }))} />
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Botón" value={prodEdit.btn_texto || ""}
                      onChange={e => setProdEdit(x => ({ ...x, btn_texto: e.target.value }))} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="URL WhatsApp" value={prodEdit.btn_url || ""}
                      onChange={e => setProdEdit(x => ({ ...x, btn_url: e.target.value }))} />
                  </Grid>
                </Grid>
                <ImgUpload storagePath={prodEdit.url_imagen} preview={prodPreview}
                  height={100} label="Imagen del producto"
                  onSelect={(f, url) => { setProdFile(f); setProdPreview(url); }} />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button variant="contained" size="small" onClick={saveProd}
                    sx={{ textTransform: "none", bgcolor: "#2563eb", borderRadius: "8px" }}>
                    Guardar
                  </Button>
                  <Button size="small" onClick={() => { setProdEdit(null); setProdFile(null); setProdPreview(null); }}
                    sx={{ textTransform: "none", color: "#64748b" }}>
                    Cancelar
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* FRASE */}
        {zone === "frase" && (
          <Box>
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Frase destacada (sin comillas)
            </Typography>
            <TextField fullWidth multiline rows={3} value={pagina.frase_texto || ""}
              onChange={e => setPagina(p => ({ ...p, frase_texto: e.target.value }))}
              placeholder="Calidad y servicio en cada producto."
              sx={{ "& .MuiInputBase-root": { fontSize: "0.85rem" } }} />
          </Box>
        )}

      </Box>

      {/* Footer guardar */}
      {["banner", "intro", "frase"].includes(zone) && (
        <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
          <Button variant="contained" fullWidth onClick={onSave}
            startIcon={<SaveIcon sx={{ fontSize: 15 }} />} disabled={saving}
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb",
              borderRadius: "9px", py: 1, "&:hover": { bgcolor: "#1d4ed8" } }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function PaginaNosotrosIndexPage() {
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [pagina,    setPagina]    = useState({});
  const [quienes,   setQuienes]   = useState({});
  const [beneficios, setBeneficios] = useState([]);
  const [contadores, setContadores] = useState([]);
  const [prodSeccion, setProdSeccion] = useState({});
  const [productos, setProductos] = useState([]);

  const [bannerPreview,    setBannerPreview]    = useState(null);
  const [bannerFile,       setBannerFile]       = useState(null);
  const [introLogoPreview, setIntroLogoPreview] = useState(null);
  const [introLogoFile,    setIntroLogoFile]    = useState(null);
  const [quienesPreview,   setQuienesPreview]   = useState(null);
  const [quienesFile,      setQuienesFile]      = useState(null);

  const [activeZone, setActiveZone] = useState(null);
  const panelRef = useRef(null);

  const load = async () => {
    try {
      const data = await obtener();
      setPagina(data?.pagina ?? {});
      setQuienes(data?.quienes ?? {});
      setBeneficios(data?.quienes_beneficios ?? []);
      setContadores(data?.about_contadores ?? []);
      setProdSeccion(data?.producto_seccion ?? {});
      setProductos(data?.productos ?? []);
    } catch (e) { handleErrorMessages(e); }
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const handleEdit = (zone) => {
    setActiveZone(prev => prev === zone ? null : zone);
    setTimeout(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, 60);
  };

  const savePagina = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("banner_titulo",     pagina.banner_titulo     || "");
      fd.append("banner_empresa",    pagina.banner_empresa    || "");
      fd.append("intro_titulo",      pagina.intro_titulo      || "");
      fd.append("intro_descripcion", pagina.intro_descripcion || "");
      fd.append("intro_btn_texto",   pagina.intro_btn_texto   || "");
      fd.append("intro_btn_url",     pagina.intro_btn_url     || "");
      fd.append("frase_texto",       pagina.frase_texto       || "");
      if (bannerFile)    fd.append("banner_image", bannerFile);
      if (introLogoFile) fd.append("intro_logo",   introLogoFile);
      await actualizar_pagina(fd);
      toastSuccess("Guardado correctamente");
      setBannerFile(null); setBannerPreview(null);
      setIntroLogoFile(null); setIntroLogoPreview(null);
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const saveQuienes = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo",      quienes.titulo      || "");
      fd.append("descripcion", quienes.descripcion || "");
      if (quienesFile) fd.append("image", quienesFile);
      await actualizar_quienes(fd);
      toastSuccess("Quiénes Somos guardado");
      setQuienesFile(null); setQuienesPreview(null);
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const onSaveBeneficio = async (b, idx) => {
    if (b.id) await actualizar_beneficio({ id: b.id, texto: b.texto });
    else { const saved = await crear_beneficio({ texto: b.texto }); setBeneficios(l => l.map((x, i) => i === idx ? { ...x, ...saved } : x)); }
    toastSuccess("Guardado");
  };

  const onDeleteBeneficio = async (b) => {
    await eliminar_beneficio({ id: b.id });
    setBeneficios(l => l.filter(x => x.id !== b.id));
  };

  const onSaveContador = async (c, idx) => {
    if (c.id) await actualizar_contador({ id: c.id, valor: c.valor, etiqueta: c.etiqueta, descripcion: c.descripcion || "", sufijo: c.sufijo || "" });
    else await crear_contador({ valor: c.valor, etiqueta: c.etiqueta, descripcion: c.descripcion || "" });
    toastSuccess("Estadística guardada");
    await load();
  };

  const onSaveProdSeccion = async () => {
    await actualizar_producto_seccion(prodSeccion);
    toastSuccess("Sección guardada");
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress />
    </Box>
  );

  const secciones = [
    { id: "banner",    label: "🖼️ Banner" },
    { id: "intro",     label: "📋 Intro" },
    { id: "quienes",   label: "👥 Quiénes" },
    { id: "contadores",label: "📊 Stats" },
    { id: "productos", label: "📦 Productos" },
    { id: "frase",     label: "💬 Frase" },
  ];

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#f0f4f8" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        bgcolor: "#0f172a", borderRadius: "12px", px: 2.5, py: 1.2 }}>
        <GroupsIcon sx={{ color: "#2563eb", fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", lineHeight: 1 }}>
            Página Nosotros — Canvas
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
            Haz clic en ✏️ sobre cualquier sección para editarla
          </Typography>
        </Box>
        <Chip label="Preview en tiempo real" size="small"
          sx={{ bgcolor: "rgba(37,99,235,0.15)", color: "#60a5fa", fontSize: "0.65rem", height: 22 }} />
      </Box>

      {/* ── Body ── */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

        {/* Canvas */}
        <Box sx={{ flex: 1 }} onClick={() => activeZone && setActiveZone(null)}>
          <Paper elevation={0} sx={{ borderRadius: "12px", overflow: "hidden",
            border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <NosotrosCanvas
              pagina={pagina} quienes={quienes} beneficios={beneficios}
              contadores={contadores} prodSeccion={prodSeccion} productos={productos}
              active={activeZone} onEdit={handleEdit}
              bannerPreview={bannerPreview} introLogoPreview={introLogoPreview} quienesPreview={quienesPreview}
            />
          </Paper>

          {/* Leyenda de accesos rápidos */}
          <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {secciones.map(({ id, label }) => (
              <Box key={id} onClick={() => handleEdit(id)}
                sx={{ display: "flex", alignItems: "center", gap: 0.6, cursor: "pointer",
                  px: 1.2, py: 0.5, borderRadius: "8px",
                  bgcolor: activeZone === id ? "#eff6ff" : "#fff",
                  border: `1px solid ${activeZone === id ? "#2563eb" : "#e2e8f0"}`,
                  "&:hover": { borderColor: "#2563eb" } }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: activeZone === id ? 700 : 400,
                  color: activeZone === id ? "#2563eb" : "#64748b" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Panel editor */}
        {activeZone && (
          <Box ref={panelRef} sx={{ width: 370, flexShrink: 0,
            bgcolor: "#fff", borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            maxHeight: "82vh", overflowY: "auto",
            position: "sticky", top: 16,
          }}>
            <EditPanel
              zone={activeZone}
              pagina={pagina} setPagina={setPagina}
              quienes={quienes} setQuienes={setQuienes}
              beneficios={beneficios} setBeneficios={setBeneficios}
              contadores={contadores} setContadores={setContadores}
              prodSeccion={prodSeccion} setProdSeccion={setProdSeccion}
              productos={productos} setProductos={setProductos}
              bannerPreview={bannerPreview} setBannerPreview={setBannerPreview} setBannerFile={setBannerFile}
              introLogoPreview={introLogoPreview} setIntroLogoPreview={setIntroLogoPreview} setIntroLogoFile={setIntroLogoFile}
              quienesPreview={quienesPreview} setQuienesPreview={setQuienesPreview} setQuienesFile={setQuienesFile}
              onSave={savePagina} onSaveQuienes={saveQuienes}
              onSaveBeneficio={onSaveBeneficio} onDeleteBeneficio={onDeleteBeneficio}
              onSaveContador={onSaveContador} onSaveProdSeccion={onSaveProdSeccion}
              saving={saving} onClose={() => setActiveZone(null)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
