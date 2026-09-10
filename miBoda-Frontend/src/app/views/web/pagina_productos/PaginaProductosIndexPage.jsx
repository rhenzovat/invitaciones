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
import Inventory2Icon    from "@mui/icons-material/Inventory2";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";

import {
  obtener, actualizar_pagina, actualizar_galeria_seccion,
  crear_galeria, actualizar_galeria, eliminar_galeria,
} from "../../../api/web_pagina_productos.api";
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
function ProductosCanvas({ pagina, seccion, galeria, active, onEdit,
  bannerPreview, introPreview, prioridadPreview }) {

  const bannerSrc    = bannerPreview    || pagina.banner_url_imagen;
  const introSrc     = introPreview     || pagina.intro_url_imagen;
  const prioridadSrc = prioridadPreview || pagina.prioridad_url_imagen;

  return (
    <Box sx={{ fontFamily: "Inter, sans-serif", bgcolor: "#fff", overflow: "hidden" }}>

      {/* ── BANNER ──────────────────────────────────────────────────────────── */}
      <EZ id="banner" active={active} onEdit={onEdit}>
        <Box sx={{
          position: "relative", minHeight: 260,
          bgcolor: bannerSrc ? "transparent" : "#0f172a",
          backgroundImage: bannerSrc ? `url(${bannerSrc})` : "none",
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(15,23,42,0.58)" }} />
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            {!bannerSrc && (
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", mb: 2 }}>
                Sin imagen de fondo — haz clic en ✏️ para subir
              </Typography>
            )}
            <Typography
              dangerouslySetInnerHTML={{ __html: pagina.banner_titulo || "<h2>Productos</h2>" }}
              sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.6rem,4vw,2.6rem)",
                "& h1,& h2,& h3": { margin: 0, color: "#fff" } }}
            />
          </Box>
        </Box>
      </EZ>

      {/* ── INTRO ───────────────────────────────────────────────────────────── */}
      <EZ id="intro" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 6, display: "flex", gap: 6,
          alignItems: "center", flexWrap: "wrap", bgcolor: "#fff" }}>
          {introSrc ? (
            <Box component="img" src={introSrc} alt="intro"
              sx={{ width: 240, height: 200, objectFit: "cover", borderRadius: "12px",
                flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
          ) : (
            <Box sx={{ width: 240, height: 200, bgcolor: "#f1f5f9", borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              border: "2px dashed #cbd5e1" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>Imagen intro</Typography>
            </Box>
          )}
          <Box flex={1} sx={{ minWidth: 240 }}>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", mb: 1.5 }}>
              {pagina.intro_titulo || "Nuestros Productos"}
            </Typography>
            <Typography sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.9rem", mb: 2 }}
              dangerouslySetInnerHTML={{ __html: pagina.intro_descripcion || "Descripción de la sección..." }} />
            {pagina.intro_btn_texto && (
              <Box sx={{ display: "inline-block", bgcolor: "#2563eb", color: "#fff",
                borderRadius: "6px", px: 3, py: 1.2, fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer" }}>
                {pagina.intro_btn_texto}
              </Box>
            )}
          </Box>
        </Box>
      </EZ>

      {/* ── GALERÍA ─────────────────────────────────────────────────────────── */}
      <EZ id="galeria" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 6, bgcolor: "#f8fafc" }}>
          <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a",
            textAlign: "center", mb: 0.5 }}>
            {seccion.seccion_titulo || "Galería de Productos"}
          </Typography>
          {seccion.seccion_descripcion && (
            <Typography sx={{ textAlign: "center", color: "#64748b", mb: 3, fontSize: "0.88rem" }}>
              {seccion.seccion_descripcion}
            </Typography>
          )}
          {galeria.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", py: 3 }}>
              Sin productos — haz clic en ✏️ para agregar
            </Typography>
          ) : (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              {galeria.slice(0, 4).map((g, i) => (
                <Box key={g.id || i} sx={{ width: 190, borderRadius: "10px", overflow: "hidden",
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", bgcolor: "#fff" }}>
                  <CmsStorageImage storagePath={g.url_imagen}
                    sx={{ width: "100%", height: 130, objectFit: "cover" }} />
                  <Box sx={{ p: 1.5 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                      {g.titulo}
                    </Typography>
                    <Box sx={{ bgcolor: "#2563eb", color: "#fff", borderRadius: "6px",
                      px: 1.5, py: 0.5, fontSize: "0.72rem", fontWeight: 700,
                      display: "inline-block", cursor: "pointer" }}>
                      {g.btn_texto || "Me interesa"}
                    </Box>
                  </Box>
                </Box>
              ))}
              {galeria.length > 4 && (
                <Box sx={{ width: 190, borderRadius: "10px", bgcolor: "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px dashed #cbd5e1" }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                    +{galeria.length - 4} más
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </EZ>

      {/* ── PRIORIDAD ───────────────────────────────────────────────────────── */}
      <EZ id="prioridad" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 6, display: "flex", gap: 5,
          alignItems: "center", flexWrap: "wrap", bgcolor: "#fff" }}>
          {prioridadSrc ? (
            <Box component="img" src={prioridadSrc} alt="prioridad"
              sx={{ width: 260, height: 220, objectFit: "cover", borderRadius: "12px",
                flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} />
          ) : (
            <Box sx={{ width: 260, height: 220, bgcolor: "#f1f5f9", borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              border: "2px dashed #cbd5e1" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>Imagen prioridad</Typography>
            </Box>
          )}
          <Box flex={1} sx={{ minWidth: 240 }}>
            {pagina.prioridad_etiqueta && (
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563eb",
                textTransform: "uppercase", letterSpacing: 2, mb: 0.5 }}>
                {pagina.prioridad_etiqueta}
              </Typography>
            )}
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", mb: 1.5 }}>
              {pagina.prioridad_titulo || "Nuestros Clientes son nuestra prioridad"}
            </Typography>
            <Typography sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.9rem", mb: 2 }}>
              {pagina.prioridad_descripcion || "Descripción..."}
            </Typography>
            {pagina.prioridad_btn_texto && (
              <Box sx={{ display: "inline-block", bgcolor: "#0f172a", color: "#fff",
                borderRadius: "6px", px: 3, py: 1.2, fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer" }}>
                {pagina.prioridad_btn_texto}
              </Box>
            )}
          </Box>
        </Box>
      </EZ>

      {/* ── FRASE ───────────────────────────────────────────────────────────── */}
      <EZ id="frase" active={active} onEdit={onEdit}>
        <Box sx={{ bgcolor: "#1e3a8a", py: 6, px: { xs: 3, md: 12 }, textAlign: "center" }}>
          {pagina.frase_titulo && (
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#93c5fd", mb: 1 }}>
              {pagina.frase_titulo}
            </Typography>
          )}
          <Typography sx={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 700,
            color: "#fff", fontStyle: "italic", lineHeight: 1.6 }}>
            "{pagina.frase_texto || "Calidad y servicio en cada producto."}"
          </Typography>
        </Box>
      </EZ>

    </Box>
  );
}

// ─── PANEL EDITOR ─────────────────────────────────────────────────────────────
function EditPanel({ zone, pagina, setPagina, seccion, setSeccion, galeria,
  bannerPreview, setBannerPreview, setBannerFile,
  introPreview, setIntroPreview, setIntroFile,
  prioridadPreview, setPrioridadPreview, setPrioridadFile,
  onSave, onSaveSeccion, saving, onClose,
  onReload,
}) {
  const [galEdit, setGalEdit] = useState(null);
  const [galFile, setGalFile] = useState(null);
  const [galPreview, setGalPreview] = useState(null);

  const titles = {
    banner:    "🖼️ Banner superior",
    intro:     "📋 Intro — Productos",
    galeria:   "🗂️ Galería de productos",
    prioridad: "⭐ Sección Prioridad",
    frase:     "💬 Frase destacada",
  };

  const saveGalItem = async () => {
    if (!galEdit?.titulo?.trim()) return;
    try {
      const fd = new FormData();
      if (galEdit.id) {
        fd.append("id", galEdit.id);
        fd.append("titulo", galEdit.titulo);
        fd.append("descripcion", galEdit.descripcion || "");
        fd.append("btn_texto", galEdit.btn_texto || "Me interesa");
        fd.append("btn_url", galEdit.btn_url || "");
        if (galFile) fd.append("image", galFile);
        await actualizar_galeria(fd);
      } else {
        fd.append("titulo", galEdit.titulo);
        fd.append("descripcion", galEdit.descripcion || "");
        fd.append("btn_texto", galEdit.btn_texto || "Me interesa");
        fd.append("btn_url", galEdit.btn_url || "https://wa.me/51981629466");
        if (galFile) fd.append("image", galFile);
        await crear_galeria(fd);
      }
      toastSuccess("Producto guardado");
      setGalEdit(null); setGalFile(null); setGalPreview(null);
      onReload();
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
                placeholder="Productos"
                sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem" } }} />
            </Box>
          </Box>
        )}

        {/* INTRO */}
        {zone === "intro" && (
          <Box>
            <TextField fullWidth size="small" label="Título" sx={{ mb: 1.5 }} value={pagina.intro_titulo || ""}
              onChange={e => setPagina(p => ({ ...p, intro_titulo: e.target.value }))} />
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Descripción
            </Typography>
            <CmsTinyMceField value={pagina.intro_descripcion || ""}
              onChange={v => setPagina(p => ({ ...p, intro_descripcion: v }))} mode="standard" height={160} />
            <Grid container spacing={1} sx={{ mt: 1.5, mb: 1.5 }}>
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
              Imagen derecha
            </Typography>
            <ImgUpload storagePath={pagina.intro_url_imagen} preview={introPreview}
              height={140} label="Subir imagen de la sección intro"
              onSelect={(f, url) => { setIntroFile(f); setIntroPreview(url); }} />
          </Box>
        )}

        {/* GALERÍA */}
        {zone === "galeria" && (
          <Box>
            <TextField fullWidth size="small" label="Título sección" sx={{ mb: 1 }}
              value={seccion.seccion_titulo || ""}
              onChange={e => setSeccion(s => ({ ...s, seccion_titulo: e.target.value }))} />
            <TextField fullWidth size="small" label="Descripción sección" multiline rows={2} sx={{ mb: 1 }}
              value={seccion.seccion_descripcion || ""}
              onChange={e => setSeccion(s => ({ ...s, seccion_descripcion: e.target.value }))} />
            <Button size="small" variant="outlined" onClick={onSaveSeccion}
              sx={{ mb: 2, textTransform: "none", borderColor: "#e2e8f0", color: "#475569" }}>
              Guardar título sección
            </Button>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
              Productos ({galeria.length})
            </Typography>
            {galeria.map((g) => (
              <Box key={g.id} sx={{ display: "flex", gap: 1, alignItems: "center",
                mb: 0.8, p: 1, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <CmsStorageImage storagePath={g.url_imagen}
                  sx={{ width: 44, height: 44, objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                <Typography sx={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }} noWrap>
                  {g.titulo}
                </Typography>
                <IconButton size="small" sx={{ color: "#2563eb" }} onClick={() => setGalEdit({ ...g })}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: "#ef4444" }}
                  onClick={async () => { await eliminar_galeria({ id: g.id }); onReload(); }}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setGalEdit({ titulo: "", descripcion: "", btn_texto: "Me interesa", btn_url: "https://wa.me/51981629466" })}
              sx={{ color: "#2563eb", textTransform: "none", fontSize: "0.75rem", mt: 1 }}>
              Agregar producto
            </Button>

            {/* Form inline galería */}
            {galEdit && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#eff6ff", borderRadius: "10px",
                border: "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", mb: 1.2 }}>
                  {galEdit.id ? "Editar" : "Nuevo"} producto
                </Typography>
                <TextField fullWidth size="small" label="Título" sx={{ mb: 1 }} value={galEdit.titulo || ""}
                  onChange={e => setGalEdit(x => ({ ...x, titulo: e.target.value }))} />
                <TextField fullWidth size="small" label="Descripción" sx={{ mb: 1 }} value={galEdit.descripcion || ""}
                  onChange={e => setGalEdit(x => ({ ...x, descripcion: e.target.value }))} />
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Botón" value={galEdit.btn_texto || ""}
                      onChange={e => setGalEdit(x => ({ ...x, btn_texto: e.target.value }))} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="URL WhatsApp" value={galEdit.btn_url || ""}
                      onChange={e => setGalEdit(x => ({ ...x, btn_url: e.target.value }))} />
                  </Grid>
                </Grid>
                <ImgUpload storagePath={galEdit.url_imagen} preview={galPreview}
                  height={100} label="Imagen del producto"
                  onSelect={(f, url) => { setGalFile(f); setGalPreview(url); }} />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button variant="contained" size="small" onClick={saveGalItem}
                    sx={{ textTransform: "none", bgcolor: "#2563eb", borderRadius: "8px" }}>
                    Guardar
                  </Button>
                  <Button size="small" onClick={() => { setGalEdit(null); setGalFile(null); setGalPreview(null); }}
                    sx={{ textTransform: "none", color: "#64748b" }}>
                    Cancelar
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* PRIORIDAD */}
        {zone === "prioridad" && (
          <Box>
            <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
              mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Imagen izquierda
            </Typography>
            <ImgUpload storagePath={pagina.prioridad_url_imagen} preview={prioridadPreview}
              height={150} label="Subir imagen de prioridad"
              onSelect={(f, url) => { setPrioridadFile(f); setPrioridadPreview(url); }} />
            <TextField fullWidth size="small" label="Etiqueta (ej. PRIORIDAD)" sx={{ mt: 1.5, mb: 1 }}
              value={pagina.prioridad_etiqueta || ""}
              onChange={e => setPagina(p => ({ ...p, prioridad_etiqueta: e.target.value }))} />
            <TextField fullWidth size="small" label="Título" sx={{ mb: 1 }}
              value={pagina.prioridad_titulo || ""}
              onChange={e => setPagina(p => ({ ...p, prioridad_titulo: e.target.value }))} />
            <TextField fullWidth size="small" label="Descripción" multiline rows={3} sx={{ mb: 1 }}
              value={pagina.prioridad_descripcion || ""}
              onChange={e => setPagina(p => ({ ...p, prioridad_descripcion: e.target.value }))} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Botón" value={pagina.prioridad_btn_texto || ""}
                  onChange={e => setPagina(p => ({ ...p, prioridad_btn_texto: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="URL" value={pagina.prioridad_btn_url || ""}
                  onChange={e => setPagina(p => ({ ...p, prioridad_btn_url: e.target.value }))} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* FRASE */}
        {zone === "frase" && (
          <Box>
            <TextField fullWidth size="small" label="Título (opcional)" sx={{ mb: 1.5 }}
              value={pagina.frase_titulo || ""}
              onChange={e => setPagina(p => ({ ...p, frase_titulo: e.target.value }))} />
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
      {["banner", "intro", "prioridad", "frase"].includes(zone) && (
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
export default function PaginaProductosIndexPage() {
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [pagina,   setPagina]   = useState({});
  const [seccion,  setSeccion]  = useState({});
  const [galeria,  setGaleria]  = useState([]);

  const [bannerPreview,    setBannerPreview]    = useState(null);
  const [bannerFile,       setBannerFile]       = useState(null);
  const [introPreview,     setIntroPreview]     = useState(null);
  const [introFile,        setIntroFile]        = useState(null);
  const [prioridadPreview, setPrioridadPreview] = useState(null);
  const [prioridadFile,    setPrioridadFile]    = useState(null);

  const [activeZone, setActiveZone] = useState(null);
  const panelRef = useRef(null);

  const load = async () => {
    try {
      const data = await obtener();
      setPagina(data?.pagina ?? {});
      setSeccion(data?.seccion ?? {});
      setGaleria(data?.galeria ?? []);
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
      const fields = [
        "banner_titulo", "intro_titulo", "intro_descripcion", "intro_btn_texto", "intro_btn_url",
        "prioridad_etiqueta", "prioridad_titulo", "prioridad_descripcion",
        "prioridad_btn_texto", "prioridad_btn_url", "frase_titulo", "frase_texto",
      ];
      fields.forEach(f => fd.append(f, pagina[f] ?? ""));
      if (bannerFile)    fd.append("banner_image",    bannerFile);
      if (introFile)     fd.append("intro_image",     introFile);
      if (prioridadFile) fd.append("prioridad_image", prioridadFile);
      await actualizar_pagina(fd);
      toastSuccess("Guardado correctamente");
      setBannerFile(null); setBannerPreview(null);
      setIntroFile(null); setIntroPreview(null);
      setPrioridadFile(null); setPrioridadPreview(null);
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  const saveSeccion = async () => {
    await actualizar_galeria_seccion(seccion);
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
    { id: "galeria",   label: "🗂️ Galería" },
    { id: "prioridad", label: "⭐ Prioridad" },
    { id: "frase",     label: "💬 Frase" },
  ];

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#f0f4f8" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        bgcolor: "#0f172a", borderRadius: "12px", px: 2.5, py: 1.2 }}>
        <Inventory2Icon sx={{ color: "#2563eb", fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", lineHeight: 1 }}>
            Página Productos — Canvas
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
            <ProductosCanvas
              pagina={pagina} seccion={seccion} galeria={galeria}
              active={activeZone} onEdit={handleEdit}
              bannerPreview={bannerPreview} introPreview={introPreview} prioridadPreview={prioridadPreview}
            />
          </Paper>

          {/* Chips acceso rápido */}
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
              seccion={seccion} setSeccion={setSeccion}
              galeria={galeria}
              bannerPreview={bannerPreview} setBannerPreview={setBannerPreview} setBannerFile={setBannerFile}
              introPreview={introPreview} setIntroPreview={setIntroPreview} setIntroFile={setIntroFile}
              prioridadPreview={prioridadPreview} setPrioridadPreview={setPrioridadPreview} setPrioridadFile={setPrioridadFile}
              onSave={savePagina} onSaveSeccion={saveSeccion}
              saving={saving} onClose={() => setActiveZone(null)}
              onReload={load}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
