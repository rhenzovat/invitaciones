import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, IconButton, TextField,
  CircularProgress, Stack, Grid, Paper, Chip, Divider,
  ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import EditIcon          from "@mui/icons-material/Edit";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import AddIcon           from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import YouTubeIcon       from "@mui/icons-material/YouTube";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import CloudUploadIcon   from "@mui/icons-material/CloudUpload";

import {
  obtener, actualizar_pagina, crear, actualizar, eliminar,
} from "../../../api/web_videos.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsStorageImage from "app/components/cms/CmsStorageImage";

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
function VideosCanvas({ pagina, items, active, onEdit, bannerPreview }) {
  const bannerSrc = bannerPreview || pagina.banner_url_imagen;
  const activeItems = items.filter(i => i.Activo !== "N");

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
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(15,23,42,0.62)" }} />
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            {!bannerSrc && (
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", mb: 2 }}>
                Sin imagen de fondo — haz clic en ✏️ para subir
              </Typography>
            )}
            <Typography
              dangerouslySetInnerHTML={{ __html: pagina.banner_titulo || "<h2>Videos</h2>" }}
              sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.6rem,4vw,2.6rem)",
                "& h1,& h2,& h3": { margin: 0, color: "#fff" } }}
            />
            <Typography sx={{ color: "rgba(255,255,255,0.65)", mt: 0.5, fontSize: "0.95rem" }}>
              J&amp;H Importaciones
            </Typography>
          </Box>
        </Box>
      </EZ>

      {/* ── SECCIÓN TEXTO ───────────────────────────────────────────────────── */}
      <EZ id="seccion" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 5, bgcolor: "#fff", textAlign: "center" }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", mb: 1 }}>
            {pagina.seccion_titulo || "Galería de Videos"}
          </Typography>
          {pagina.seccion_descripcion && (
            <Typography sx={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 600, mx: "auto" }}>
              {pagina.seccion_descripcion}
            </Typography>
          )}
        </Box>
      </EZ>

      {/* ── GRID DE VIDEOS ──────────────────────────────────────────────────── */}
      <EZ id="videos" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, pb: 6, bgcolor: "#f8fafc" }}>
          {activeItems.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", py: 4 }}>
              Sin videos — haz clic en ✏️ para agregar
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
              {activeItems.slice(0, 6).map((v, i) => (
                <Box key={v.id || i} sx={{ width: 220, borderRadius: "10px", overflow: "hidden",
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", bgcolor: "#fff" }}>
                  <Box sx={{ height: 130, bgcolor: "#1e293b", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {v.url_imagen_portada ? (
                      <CmsStorageImage storagePath={v.url_imagen_portada}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      v.tipo_video === "youtube"
                        ? <YouTubeIcon sx={{ fontSize: 40, color: "#ff0000", opacity: 0.8 }} />
                        : <OndemandVideoIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
                    )}
                    {/* Play overlay */}
                    <Box sx={{ position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: "rgba(0,0,0,0.25)" }}>
                      <Box sx={{ width: 36, height: 36, bgcolor: "rgba(255,255,255,0.9)",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box sx={{ width: 0, height: 0,
                          borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
                          borderLeft: "14px solid #1e293b", ml: "3px" }} />
                      </Box>
                    </Box>
                    {v.tag && (
                      <Chip label={v.tag} size="small"
                        sx={{ position: "absolute", top: 6, left: 6,
                          bgcolor: "#e63946", color: "#fff", fontSize: "0.6rem", height: 18 }} />
                    )}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }} noWrap>
                      {v.titulo}
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                      {v.tipo_video === "youtube" ? "YouTube" : "Archivo"}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {activeItems.length > 6 && (
                <Box sx={{ width: 220, borderRadius: "10px", bgcolor: "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px dashed #cbd5e1", minHeight: 160 }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                    +{activeItems.length - 6} más
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </EZ>

      {/* ── FRASE ───────────────────────────────────────────────────────────── */}
      {pagina.frase_texto && (
        <EZ id="frase" active={active} onEdit={onEdit}>
          <Box sx={{ bgcolor: "#1e3a8a", py: 5, px: { xs: 3, md: 12 }, textAlign: "center" }}>
            <Typography sx={{ fontSize: "clamp(1.1rem,2.5vw,1.4rem)", fontWeight: 700,
              color: "#fff", fontStyle: "italic", lineHeight: 1.6 }}>
              "{pagina.frase_texto}"
            </Typography>
          </Box>
        </EZ>
      )}

    </Box>
  );
}

// ─── PANEL EDITOR ─────────────────────────────────────────────────────────────
function EditPanel({ zone, pagina, setPagina, items,
  bannerPreview, setBannerPreview, setBannerFile,
  onSave, saving, onClose, onReload,
}) {
  const [videoEdit, setVideoEdit] = useState(null);
  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);
  const portadaRef = useRef(null);

  const titles = {
    banner:  "🖼️ Banner superior",
    seccion: "📋 Sección de texto",
    videos:  "🎬 Videos",
    frase:   "💬 Frase destacada",
  };

  const resetVideoEdit = () => {
    setVideoEdit(null); setPortadaFile(null); setPortadaPreview(null); setVideoFile(null);
  };

  const saveVideo = async () => {
    if (!videoEdit?.titulo?.trim()) return;
    const isNew = !videoEdit.id;
    try {
      const fd = new FormData();
      fd.append("titulo", videoEdit.titulo);
      fd.append("tag", videoEdit.tag || "");
      fd.append("descripcion", videoEdit.descripcion || "");
      fd.append("tipo_video", videoEdit.tipo_video || "youtube");
      fd.append("Activo", videoEdit.Activo || "S");
      if (videoEdit.tipo_video === "youtube") {
        fd.append("url_youtube", videoEdit.url_youtube || "");
      } else if (videoFile) {
        fd.append("video", videoFile);
      }
      if (portadaFile) fd.append("portada_image", portadaFile);
      if (isNew) {
        await crear(fd);
      } else {
        fd.append("id", videoEdit.id);
        await actualizar(fd);
      }
      toastSuccess("Video guardado");
      resetVideoEdit();
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
                placeholder="Videos"
                sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem" } }} />
            </Box>
          </Box>
        )}

        {/* SECCIÓN */}
        {zone === "seccion" && (
          <Box>
            <TextField fullWidth size="small" label="Título de la sección" sx={{ mb: 1.5 }}
              value={pagina.seccion_titulo || ""}
              onChange={e => setPagina(p => ({ ...p, seccion_titulo: e.target.value }))} />
            <TextField fullWidth size="small" label="Descripción" multiline rows={3} sx={{ mb: 1.5 }}
              value={pagina.seccion_descripcion || ""}
              onChange={e => setPagina(p => ({ ...p, seccion_descripcion: e.target.value }))} />
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
              placeholder="Innovando tus proyectos con calidad y eficiencia."
              sx={{ "& .MuiInputBase-root": { fontSize: "0.85rem" } }} />
          </Box>
        )}

        {/* VIDEOS */}
        {zone === "videos" && (
          <Box>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
              Videos ({items.length})
            </Typography>
            {items.map(v => (
              <Box key={v.id} sx={{ display: "flex", gap: 1, alignItems: "center",
                mb: 0.8, p: 1, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <Box sx={{ width: 44, height: 44, bgcolor: "#1e293b", borderRadius: "6px",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden" }}>
                  {v.url_imagen_portada
                    ? <CmsStorageImage storagePath={v.url_imagen_portada} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : v.tipo_video === "youtube"
                      ? <YouTubeIcon sx={{ fontSize: 22, color: "#ff0000" }} />
                      : <OndemandVideoIcon sx={{ fontSize: 22, color: "#94a3b8" }} />
                  }
                </Box>
                <Box flex={1} sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }} noWrap>
                    {v.titulo}
                  </Typography>
                  {v.Activo === "N" && (
                    <Chip label="Inactivo" size="small" color="warning" sx={{ fontSize: "0.6rem", height: 16 }} />
                  )}
                </Box>
                <IconButton size="small" sx={{ color: "#2563eb" }}
                  onClick={() => { setVideoEdit({ ...v, tipo_video: v.tipo_video || (v.url_youtube ? "youtube" : "archivo") }); setPortadaPreview(null); setPortadaFile(null); setVideoFile(null); }}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: "#ef4444" }}
                  onClick={async () => { await eliminar({ id: v.id }); toastSuccess("Eliminado"); onReload(); }}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => { setVideoEdit({ titulo: "", tag: "", tipo_video: "youtube", url_youtube: "", Activo: "S" }); setPortadaPreview(null); setPortadaFile(null); setVideoFile(null); }}
              sx={{ color: "#2563eb", textTransform: "none", fontSize: "0.75rem", mt: 1 }}>
              Agregar video
            </Button>

            {/* Form inline video */}
            {videoEdit && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", mb: 1.2 }}>
                  {videoEdit.id ? "Editar" : "Nuevo"} video
                </Typography>
                <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
                  mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Fuente del video
                </Typography>
                <ToggleButtonGroup exclusive fullWidth size="small"
                  value={videoEdit.tipo_video || "youtube"}
                  onChange={(_, v) => v && setVideoEdit(x => ({ ...x, tipo_video: v }))}
                  sx={{ mb: 1.5 }}>
                  <ToggleButton value="youtube" sx={{ fontSize: "0.72rem",
                    "&.Mui-selected": { bgcolor: "#2563eb", color: "#fff" } }}>
                    YouTube
                  </ToggleButton>
                  <ToggleButton value="archivo" sx={{ fontSize: "0.72rem",
                    "&.Mui-selected": { bgcolor: "#2563eb", color: "#fff" } }}>
                    Archivo
                  </ToggleButton>
                </ToggleButtonGroup>

                {videoEdit.tipo_video === "youtube" ? (
                  <TextField fullWidth size="small" label="URL de YouTube" sx={{ mb: 1 }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoEdit.url_youtube || ""}
                    onChange={e => setVideoEdit(x => ({ ...x, url_youtube: e.target.value }))} />
                ) : (
                  <Box sx={{ mb: 1 }}>
                    <Button size="small" startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                      onClick={() => videoRef.current?.click()}
                      sx={{ textTransform: "none", fontSize: "0.72rem", color: "#2563eb" }}>
                      {videoFile ? videoFile.name : videoEdit.url_video ? "Reemplazar video" : "Subir video"}
                    </Button>
                    <input type="file" hidden ref={videoRef} accept="video/*"
                      onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                  </Box>
                )}

                <TextField fullWidth size="small" label="Título *" sx={{ mb: 1 }}
                  value={videoEdit.titulo || ""}
                  onChange={e => setVideoEdit(x => ({ ...x, titulo: e.target.value }))} />
                <TextField fullWidth size="small" label="Etiqueta (FABRICACIÓN…)" sx={{ mb: 1 }}
                  value={videoEdit.tag || ""}
                  onChange={e => setVideoEdit(x => ({ ...x, tag: e.target.value }))} />

                <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
                  mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Imagen portada (opcional)
                </Typography>
                <Box onClick={() => portadaRef.current?.click()}
                  sx={{ height: 80, border: `2px dashed ${portadaPreview || videoEdit.url_imagen_portada ? "#2563eb" : "#cbd5e1"}`,
                    borderRadius: "8px", cursor: "pointer", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: "#f8fafc", mb: 1.5 }}>
                  <input ref={portadaRef} type="file" hidden accept="image/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) { setPortadaFile(f); setPortadaPreview(URL.createObjectURL(f)); } }} />
                  {portadaPreview || videoEdit.url_imagen_portada ? (
                    <CmsStorageImage storagePath={videoEdit.url_imagen_portada} previewSrc={portadaPreview}
                      sx={{ maxHeight: 76, maxWidth: "100%", objectFit: "contain" }} />
                  ) : (
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>Miniatura del video</Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" onClick={saveVideo}
                    sx={{ textTransform: "none", bgcolor: "#2563eb", borderRadius: "8px" }}>
                    Guardar
                  </Button>
                  <Button size="small" onClick={resetVideoEdit}
                    sx={{ textTransform: "none", color: "#64748b" }}>
                    Cancelar
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}

      </Box>

      {/* Footer guardar */}
      {["banner", "seccion", "frase"].includes(zone) && (
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
export default function VideosIndexPage() {
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [pagina,   setPagina]   = useState({});
  const [items,    setItems]    = useState([]);

  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile,    setBannerFile]    = useState(null);

  const [activeZone, setActiveZone] = useState(null);
  const panelRef = useRef(null);

  const load = async () => {
    try {
      const data = await obtener();
      setPagina(data?.pagina ?? {});
      setItems(data?.items ?? []);
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
      fd.append("banner_titulo",       pagina.banner_titulo       || "Videos");
      fd.append("seccion_titulo",      pagina.seccion_titulo      || "");
      fd.append("seccion_descripcion", pagina.seccion_descripcion || "");
      fd.append("frase_texto",         pagina.frase_texto         || "");
      if (bannerFile) fd.append("banner_image", bannerFile);
      await actualizar_pagina(fd);
      toastSuccess("Guardado correctamente");
      setBannerFile(null); setBannerPreview(null);
      await load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress />
    </Box>
  );

  const secciones = [
    { id: "banner",  label: "🖼️ Banner" },
    { id: "seccion", label: "📋 Sección" },
    { id: "videos",  label: "🎬 Videos" },
    { id: "frase",   label: "💬 Frase" },
  ];

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#f0f4f8" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        bgcolor: "#0f172a", borderRadius: "12px", px: 2.5, py: 1.2 }}>
        <OndemandVideoIcon sx={{ color: "#2563eb", fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", lineHeight: 1 }}>
            Galería de Videos — Canvas
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
            <VideosCanvas
              pagina={pagina} items={items}
              active={activeZone} onEdit={handleEdit}
              bannerPreview={bannerPreview}
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
              items={items}
              bannerPreview={bannerPreview} setBannerPreview={setBannerPreview} setBannerFile={setBannerFile}
              onSave={savePagina}
              saving={saving} onClose={() => setActiveZone(null)}
              onReload={load}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
