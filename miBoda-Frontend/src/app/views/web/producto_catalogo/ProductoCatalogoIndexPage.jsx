import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Grid, Button, IconButton, TextField,
  CircularProgress, Stack, Tooltip, Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { listar, crear, actualizar, eliminar, actualizar_seccion } from "../../../api/web_producto_catalogo.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const ACCENT       = "#f97316";
const ACCENT_HOVER = "#ea6c0a";

const PageBox = styled(Box)(() => ({ padding: 20, minHeight: "100vh", backgroundColor: "#f0f4f8" }));
const SectionTitle = styled(Typography)(() => ({ fontWeight: 700, marginBottom: 16, color: "#1e293b" }));

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.55)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: ACCENT, marginBottom: 6, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

/* ── Zona de imagen en el panel ── */
function PanelImgUpload({ storagePath, previewSrc, onFile, open }) {
  const ref = useRef(null);
  useEffect(() => { if (!open && ref.current) ref.current.value = ""; }, [open]);
  const hasImage = Boolean(previewSrc || storagePath);

  return (
    <Box sx={{ mb: 1.5 }}>
      <input
        type="file"
        ref={ref}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <Box
        onClick={() => ref.current?.click()}
        sx={{
          width: "100%", aspectRatio: "4/3", borderRadius: 2,
          border: "2px dashed rgba(249,115,22,0.45)",
          bgcolor: "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative", overflow: "hidden",
          "&:hover": { borderColor: ACCENT },
          "&:hover .cam-ov": { opacity: hasImage ? 1 : 0 },
        }}
      >
        {hasImage ? (
          <>
            <CmsStorageImage
              storagePath={storagePath}
              previewSrc={previewSrc}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <Box className="cam-ov" sx={{
              position: "absolute", inset: 0,
              bgcolor: "rgba(0,0,0,0.52)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.22s",
            }}>
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 26 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.62rem", mt: 0.4 }}>
                Cambiar imagen
              </Typography>
            </Box>
          </>
        ) : (
          <Stack alignItems="center" spacing={0.5}>
            <PhotoCameraIcon sx={{ color: ACCENT, fontSize: 32 }} />
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>Subir imagen</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function ProductoCatalogoIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [secSaving, setSecSaving] = useState(false);
  const [items,    setItems]    = useState([]);
  const [seccion,  setSeccion]  = useState({ seccion_titulo: "", seccion_descripcion: "" });

  const [edit,     setEdit]     = useState(null);
  const [isNew,    setIsNew]    = useState(false);
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);

  /* ── Carga de datos ── */
  const load = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeccion(data?.seccion ?? {});
      setItems(data?.items ?? []);
    } catch (e) { handleErrorMessages(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  /* ── Panel helpers ── */
  const openNew = () => {
    setEdit({ titulo: "", badge: "J&H", descripcion: "", btn_texto: "Me interesa", btn_url: "https://wa.me/51981629466" });
    setFile(null);
    setPreview(null);
    setIsNew(true);
    setPanelOpen(true);
  };

  const openEdit = (item) => {
    setEdit({ ...item });
    setFile(null);
    setPreview(null);
    setIsNew(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEdit(null);
    setFile(null);
    setPreview(null);
  };

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ── Guardar ítem ── */
  const saveItem = async () => {
    if (!edit?.titulo?.trim()) {
      handleErrorMessages("El título es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo",    edit.titulo    || "");
      fd.append("badge",     edit.badge     || "");
      fd.append("descripcion", edit.descripcion || "");
      fd.append("btn_texto", edit.btn_texto || "Me interesa");
      fd.append("btn_url",   edit.btn_url   || "");
      if (file) fd.append("image", file);
      if (!isNew) {
        fd.append("id", edit.id);
        await actualizar(fd);
      } else {
        await crear(fd);
      }
      toastSuccess(isNew ? "Producto creado" : "Producto actualizado");
      closePanel();
      await load();
    } catch (e) { handleErrorMessages(e); } finally { setSaving(false); }
  };

  /* ── Eliminar ── */
  const deleteItem = async (id) => {
    try {
      await eliminar({ id });
      toastSuccess("Eliminado");
      load();
    } catch (e) { handleErrorMessages(e); }
  };

  /* ── Guardar sección ── */
  const saveSeccion = async () => {
    setSecSaving(true);
    try {
      await actualizar_seccion(seccion);
      toastSuccess("Sección guardada");
    } catch (e) { handleErrorMessages(e); } finally { setSecSaving(false); }
  };

  if (loading) return <PageBox><CircularProgress /></PageBox>;

  return (
    <>
      {/* ── Panel lateral ── */}
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        {/* Header sticky */}
        <Box sx={{
          px: 2, py: 1.5, display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 1,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3, fontSize: "0.82rem" }}>
              {isNew ? "Nuevo producto" : "Editar producto"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
              Catálogo de productos
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel}
            sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: ACCENT } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          <SectionTag>Imagen del producto</SectionTag>
          <PanelImgUpload
            storagePath={edit?.url_imagen}
            previewSrc={preview}
            onFile={handleFile}
            open={panelOpen}
          />
          <Sep />
          <SectionTag>Datos</SectionTag>
          <DarkField fullWidth size="small" label="Título *" sx={{ mb: 1.5 }}
            value={edit?.titulo ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, titulo: e.target.value }))} />
          <DarkField fullWidth size="small" label="Badge (ej. J&H)" sx={{ mb: 1.5 }}
            value={edit?.badge ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, badge: e.target.value }))} />
          <DarkField fullWidth size="small" label="Descripción" multiline rows={3} sx={{ mb: 1.5 }}
            value={edit?.descripcion ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, descripcion: e.target.value }))} />
          <Sep />
          <SectionTag>Botón de acción</SectionTag>
          <DarkField fullWidth size="small" label="Texto del botón" sx={{ mb: 1.5 }}
            value={edit?.btn_texto ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, btn_texto: e.target.value }))} />
          <DarkField fullWidth size="small" label="URL WhatsApp"
            value={edit?.btn_url ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, btn_url: e.target.value }))} />
        </Box>

        {/* Footer sticky */}
        <Box sx={{
          px: 2, py: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
        }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
              onClick={saveItem} disabled={saving}
              sx={{ bgcolor: ACCENT, color: "#fff", fontWeight: 700, "&:hover": { bgcolor: ACCENT_HOVER } }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button variant="outlined" onClick={closePanel}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
        </Box>
      </CmsPanelRoot>

      {/* ── Contenido principal ── */}
      <PageBox>
        {/* Header de página */}
        <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg,#0f766e,#f97316)" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CategoryIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>Catálogo de productos</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.80)" }}>
            Vista pública: /productos — galería de catálogo
          </Typography>
        </Paper>

        {/* Sección: título y descripción */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <SectionTitle variant="subtitle1">Encabezado de sección</SectionTitle>
          <TextField fullWidth size="small" label="Título sección" sx={{ mb: 1 }}
            value={seccion.seccion_titulo ?? ""}
            onChange={(e) => setSeccion((s) => ({ ...s, seccion_titulo: e.target.value }))} />
          <TextField fullWidth size="small" label="Descripción sección" multiline rows={2} sx={{ mb: 2 }}
            value={seccion.seccion_descripcion ?? ""}
            onChange={(e) => setSeccion((s) => ({ ...s, seccion_descripcion: e.target.value }))} />
          <Button variant="contained" startIcon={secSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={saveSeccion} disabled={secSaving}
            sx={{ bgcolor: "#0f766e", "&:hover": { bgcolor: "#0d9488" } }}>
            {secSaving ? "Guardando..." : "Guardar sección"}
          </Button>
        </Paper>

        {/* Galería de ítems */}
        <Paper sx={{ p: 3, mb: 2 }}>
          <SectionTitle variant="subtitle1">Productos del catálogo (4 columnas)</SectionTitle>
          <Typography variant="caption" sx={{
            display: "block", mb: 2, color: "#64748b",
            fontWeight: 600, fontSize: "0.68rem",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            Haz clic en el lápiz para editar cada producto
          </Typography>

          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Paper sx={{
                  p: 0, borderRadius: "14px", overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  outline: panelOpen && edit?.id === item.id ? `2px solid ${ACCENT}` : "none",
                  outlineOffset: -2,
                }}>
                  {/* Imagen con botones superpuestos */}
                  <Box sx={{ position: "relative", height: 120, bgcolor: "#f1f5f9" }}>
                    <CmsStorageImage
                      storagePath={item.url_imagen}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <Box sx={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(item)}
                          sx={{ bgcolor: ACCENT, color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: ACCENT_HOVER } }}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => deleteItem(item.id)}
                          sx={{ bgcolor: "rgba(239,68,68,0.9)", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#dc2626" } }}>
                          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Info */}
                  <Box sx={{ px: 1.5, py: 1.2 }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: "0.82rem" }}>
                      {item.titulo}
                    </Typography>
                    {item.badge && (
                      <Typography variant="caption" sx={{ color: ACCENT, fontWeight: 700, fontSize: "0.68rem" }}>
                        {item.badge}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}

            {/* Agregar nuevo */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper onClick={openNew}
                sx={{
                  p: 2, textAlign: "center", cursor: "pointer",
                  border: `2px dashed ${ACCENT}`, minHeight: 140,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 1, borderRadius: "14px",
                  "&:hover": { bgcolor: "rgba(249,115,22,0.04)" },
                }}>
                <AddIcon sx={{ fontSize: 36, color: ACCENT }} />
                <Typography fontWeight={600} sx={{ color: ACCENT }}>Agregar producto</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </PageBox>
    </>
  );
}
