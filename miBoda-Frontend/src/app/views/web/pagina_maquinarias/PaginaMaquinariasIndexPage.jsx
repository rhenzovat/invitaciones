import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, IconButton, TextField,
  CircularProgress, Stack, Grid, Paper, Chip, Divider,
} from "@mui/material";
import EditIcon                  from "@mui/icons-material/Edit";
import SaveIcon                  from "@mui/icons-material/Save";
import CloseIcon                 from "@mui/icons-material/Close";
import AddIcon                   from "@mui/icons-material/Add";
import DeleteOutlineIcon         from "@mui/icons-material/DeleteOutline";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import FlipIcon                  from "@mui/icons-material/Flip";
import ImageOutlinedIcon         from "@mui/icons-material/ImageOutlined";
import PhotoCameraIcon           from "@mui/icons-material/PhotoCamera";

import {
  obtener, actualizar_pagina, crear_item, actualizar_item, eliminar_item,
} from "../../../api/web_pagina_maquinarias.api";
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
function MaquinariasCanvas({ pagina, items, active, onEdit, bannerPreview }) {
  const bannerSrc = bannerPreview || pagina.banner_url_imagen;

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
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(15,23,42,0.6)" }} />
          <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}>
            {!bannerSrc && (
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", mb: 2 }}>
                Sin imagen de fondo — haz clic en ✏️ para subir
              </Typography>
            )}
            <Typography
              dangerouslySetInnerHTML={{ __html: pagina.banner_titulo || "<h2>Máquinarias</h2>" }}
              sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.6rem,4vw,2.6rem)",
                "& h1,& h2,& h3": { margin: 0, color: "#fff" } }}
            />
          </Box>
        </Box>
      </EZ>

      {/* ── SECCIÓN TEXTO ───────────────────────────────────────────────────── */}
      <EZ id="seccion" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, py: 5, bgcolor: "#fff", textAlign: "center" }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", mb: 1 }}>
            {pagina.seccion_titulo || "Nuestras Máquinarias"}
          </Typography>
          {pagina.seccion_descripcion && (
            <Typography sx={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.7,
              maxWidth: 640, mx: "auto" }}>
              {pagina.seccion_descripcion}
            </Typography>
          )}
        </Box>
      </EZ>

      {/* ── GRID DE ITEMS ───────────────────────────────────────────────────── */}
      <EZ id="items" active={active} onEdit={onEdit}>
        <Box sx={{ px: { xs: 3, md: 8 }, pb: 6, bgcolor: "#f8fafc" }}>
          {items.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", py: 4 }}>
              Sin máquinarias — haz clic en ✏️ para agregar
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
              {items.slice(0, 6).map((it, i) => (
                <Box key={it.id || i} sx={{ width: 210, borderRadius: "12px", overflow: "hidden",
                  border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                  bgcolor: "#fff", position: "relative" }}>
                  {it.url_imagen_back && (
                    <Chip size="small" icon={<FlipIcon sx={{ fontSize: 12 }} />} label="Flip"
                      sx={{ position: "absolute", top: 6, left: 6, zIndex: 2,
                        bgcolor: "#7c3aed", color: "#fff", fontSize: "0.6rem", height: 18 }} />
                  )}
                  <Box sx={{ height: 150, bgcolor: "#e2e8f0", position: "relative", overflow: "hidden" }}>
                    <CmsStorageImage storagePath={it.url_imagen_front}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {it.url_imagen_back && (
                      <Box sx={{ position: "absolute", inset: 0, opacity: 0,
                        transition: "opacity 0.3s",
                        "&:hover": { opacity: 1 } }}>
                        <CmsStorageImage storagePath={it.url_imagen_back}
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", mb: 1 }} noWrap>
                      {it.titulo}
                    </Typography>
                    <Box sx={{ bgcolor: "#7c3aed", color: "#fff", borderRadius: "6px",
                      px: 1.5, py: 0.5, fontSize: "0.72rem", fontWeight: 700,
                      display: "inline-block", cursor: "pointer" }}>
                      {it.btn_texto || "Me interesa"}
                    </Box>
                  </Box>
                </Box>
              ))}
              {items.length > 6 && (
                <Box sx={{ width: 210, borderRadius: "12px", bgcolor: "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px dashed #cbd5e1", minHeight: 180 }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                    +{items.length - 6} más
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </EZ>

      {/* ── FRASE ───────────────────────────────────────────────────────────── */}
      <EZ id="frase" active={active} onEdit={onEdit}>
        <Box sx={{ bgcolor: "#1e3a8a", py: 6, px: { xs: 3, md: 12 }, textAlign: "center" }}>
          <Typography sx={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)", fontWeight: 700,
            color: "#fff", fontStyle: "italic", lineHeight: 1.6 }}>
            "{pagina.frase_texto || "Innovando tus proyectos con calidad y eficiencia."}"
          </Typography>
        </Box>
      </EZ>

    </Box>
  );
}

// ─── PANEL EDITOR ─────────────────────────────────────────────────────────────
function EditPanel({ zone, pagina, setPagina, items,
  bannerPreview, setBannerPreview, setBannerFile,
  onSave, saving, onClose, onReload,
}) {
  const [itemEdit,   setItemEdit]   = useState(null);
  const [frontFile,  setFrontFile]  = useState(null);
  const [backFile,   setBackFile]   = useState(null);
  const [frontPrev,  setFrontPrev]  = useState(null);
  const [backPrev,   setBackPrev]   = useState(null);
  const [removeBack, setRemoveBack] = useState(false);

  const titles = {
    banner:  "🖼️ Banner superior",
    seccion: "📋 Sección de texto",
    items:   "⚙️ Máquinarias",
    frase:   "💬 Frase destacada",
  };

  const resetItemEdit = () => {
    setItemEdit(null); setFrontFile(null); setBackFile(null);
    setFrontPrev(null); setBackPrev(null); setRemoveBack(false);
  };

  const saveItem = async () => {
    if (!itemEdit?.titulo?.trim()) return;
    const isNew = !itemEdit.id;
    if (isNew && !frontFile) { handleErrorMessages("La imagen de frente es obligatoria."); return; }
    try {
      const fd = new FormData();
      fd.append("titulo",    itemEdit.titulo);
      fd.append("btn_texto", itemEdit.btn_texto || "Me interesa");
      fd.append("btn_url",   itemEdit.btn_url   || "https://wa.me/51981629466");
      if (frontFile) fd.append("image_front", frontFile);
      if (backFile)  fd.append("image_back",  backFile);
      if (isNew) {
        await crear_item(fd);
      } else {
        fd.append("id", itemEdit.id);
        if (removeBack) fd.append("remove_back", "1");
        await actualizar_item(fd);
      }
      toastSuccess("Máquinaria guardada");
      resetItemEdit();
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
                placeholder="Máquinarias"
                sx={{ "& .MuiInputBase-root": { fontSize: "0.82rem" } }} />
            </Box>
          </Box>
        )}

        {/* SECCIÓN */}
        {zone === "seccion" && (
          <Box>
            <TextField fullWidth size="small" label="Título de la galería" sx={{ mb: 1.5 }}
              value={pagina.seccion_titulo || ""}
              onChange={e => setPagina(p => ({ ...p, seccion_titulo: e.target.value }))} />
            <TextField fullWidth size="small" label="Descripción" multiline rows={3}
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

        {/* ITEMS */}
        {zone === "items" && (
          <Box>
            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 1.5 }}>
              Imagen frente: obligatoria. Imagen reverso: opcional (activa flip al hover).
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
              Máquinarias ({items.length})
            </Typography>
            {items.map(it => (
              <Box key={it.id} sx={{ display: "flex", gap: 1, alignItems: "center",
                mb: 0.8, p: 1, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <CmsStorageImage storagePath={it.url_imagen_front}
                  sx={{ width: 44, height: 44, objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                <Box flex={1} sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }} noWrap>
                    {it.titulo}
                  </Typography>
                  {it.url_imagen_back && (
                    <Chip size="small" icon={<FlipIcon sx={{ fontSize: 10 }} />} label="Flip"
                      sx={{ fontSize: "0.6rem", height: 16, bgcolor: "#ede9fe", color: "#7c3aed" }} />
                  )}
                </Box>
                <IconButton size="small" sx={{ color: "#2563eb" }}
                  onClick={() => { setItemEdit({ ...it }); setFrontPrev(null); setBackPrev(null); setFrontFile(null); setBackFile(null); setRemoveBack(false); }}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: "#ef4444" }}
                  onClick={async () => { await eliminar_item({ id: it.id }); onReload(); }}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => { setItemEdit({ titulo: "", btn_texto: "Me interesa", btn_url: "https://wa.me/51981629466" }); setFrontPrev(null); setBackPrev(null); setFrontFile(null); setBackFile(null); setRemoveBack(false); }}
              sx={{ color: "#2563eb", textTransform: "none", fontSize: "0.75rem", mt: 1 }}>
              Agregar máquinaria
            </Button>

            {/* Form inline */}
            {itemEdit && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", mb: 1.2 }}>
                  {itemEdit.id ? "Editar" : "Nueva"} máquinaria
                </Typography>
                <TextField fullWidth size="small" label="Nombre" sx={{ mb: 1.5 }}
                  value={itemEdit.titulo || ""}
                  onChange={e => setItemEdit(x => ({ ...x, titulo: e.target.value }))} />

                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
                      mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Imagen frente *
                    </Typography>
                    <ImgUpload storagePath={itemEdit.url_imagen_front} preview={frontPrev}
                      height={100} label="Imagen frente"
                      onSelect={(f, url) => { setFrontFile(f); setFrontPrev(url); }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#475569",
                      mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Imagen reverso
                    </Typography>
                    <ImgUpload storagePath={removeBack ? null : itemEdit.url_imagen_back} preview={backPrev}
                      height={100} label="Imagen reverso (flip)"
                      onSelect={(f, url) => { setBackFile(f); setBackPrev(url); setRemoveBack(false); }} />
                    {itemEdit.url_imagen_back && !removeBack && !backFile && (
                      <Button size="small" color="warning" sx={{ mt: 0.5, fontSize: "0.65rem", textTransform: "none" }}
                        onClick={() => { setRemoveBack(true); setBackFile(null); setBackPrev(null); }}>
                        Quitar imagen 2
                      </Button>
                    )}
                  </Grid>
                </Grid>

                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="Botón" value={itemEdit.btn_texto || ""}
                      onChange={e => setItemEdit(x => ({ ...x, btn_texto: e.target.value }))} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label="URL WhatsApp" value={itemEdit.btn_url || ""}
                      onChange={e => setItemEdit(x => ({ ...x, btn_url: e.target.value }))} />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" onClick={saveItem}
                    sx={{ textTransform: "none", bgcolor: "#2563eb", borderRadius: "8px" }}>
                    Guardar
                  </Button>
                  <Button size="small" onClick={resetItemEdit}
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
export default function PaginaMaquinariasIndexPage() {
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
      fd.append("banner_titulo",       pagina.banner_titulo       || "");
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
    { id: "items",   label: "⚙️ Máquinarias" },
    { id: "frase",   label: "💬 Frase" },
  ];

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#f0f4f8" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        bgcolor: "#0f172a", borderRadius: "12px", px: 2.5, py: 1.2 }}>
        <PrecisionManufacturingIcon sx={{ color: "#2563eb", fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#f1f5f9", lineHeight: 1 }}>
            Página Máquinarias — Canvas
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
            <MaquinariasCanvas
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
