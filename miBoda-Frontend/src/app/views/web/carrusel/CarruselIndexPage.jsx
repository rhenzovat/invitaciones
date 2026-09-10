import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, Button, IconButton,
  TextField, CircularProgress, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Stack, Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon              from "@mui/icons-material/Edit";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutline";
import SaveIcon              from "@mui/icons-material/Save";
import CloseIcon             from "@mui/icons-material/Close";
import PhotoCameraIcon       from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon     from "@mui/icons-material/ImageOutlined";
import ViewCarouselIcon      from "@mui/icons-material/ViewCarousel";

import { listar, crear, actualizar, eliminar } from "../../../api/web_carrusel.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import { cmsPublicImageUrlCandidates } from "../../../utils/utils";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

/* ─── Styled ──────────────────────────────────────────────────────────────── */
const PageBox = styled(Box)({
  padding: 20,
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
});

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.8, 2.5),
  marginBottom: theme.spacing(2),
  borderRadius: "14px",
  background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #f97316 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  boxShadow: "0 6px 28px rgba(15,23,42,0.30)",
}));

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root":               { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input":              { color: "#f1f5f9" },
  "& .MuiInputLabel-root":              { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused":  { color: "#f97316" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#f97316", marginBottom: 6, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

/* ─── Image upload inside the panel ─────────────────────────────────────── */
const PanelImgUpload = ({ currentUrl, absoluteUrl, previewSrc, onFile, open }) => {
  const ref = useRef(null);

  useEffect(() => { if (!open && ref.current) ref.current.value = ""; }, [open]);

  const hasImage = Boolean(
    previewSrc
    || currentUrl
    || absoluteUrl
    || cmsPublicImageUrlCandidates(currentUrl, absoluteUrl).length > 0
  );

  return (
    <Box sx={{ mb: 2 }}>
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
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: 2,
          border: "2px dashed rgba(249,115,22,0.45)",
          bgcolor: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          "&:hover": { borderColor: "#f97316", bgcolor: "rgba(249,115,22,0.06)" },
          "&:hover .cam-ov": { opacity: hasImage ? 1 : 0 },
        }}
      >
        {hasImage ? (
          <>
            <CmsStorageImage
              storagePath={currentUrl}
              absoluteUrl={absoluteUrl}
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
              pointerEvents: "none",
            }}>
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 26 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.62rem", mt: 0.4 }}>
                Cambiar imagen
              </Typography>
            </Box>
          </>
        ) : (
          <Stack alignItems="center" spacing={0.5} sx={{ py: 3 }}>
            <PhotoCameraIcon sx={{ color: "#f97316", fontSize: 36 }} />
            <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center" }}>
              Clic para subir imagen
            </Typography>
          </Stack>
        )}
      </Box>
      {previewSrc && (
        <Typography variant="caption" sx={{ color: "#22c55e", fontSize: "0.60rem", mt: 0.5, display: "block" }}>
          Nueva imagen lista para guardar
        </Typography>
      )}
    </Box>
  );
};

/* ─── CMS Panel ──────────────────────────────────────────────────────────── */
const CarruselCmsPanel = ({
  open, panelLeft, item, isNew, preview,
  onFile, onLabelChange, onSave, onClose, saving,
}) => (
  <CmsPanelRoot open={open} panelLeft={panelLeft}>

    <Box sx={{
      px: 2, py: 1.5, display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: 1,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", top: 0, zIndex: 1,
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3, fontSize: "0.82rem" }}>
          {isNew ? "Nueva imagen" : "Editar imagen"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
          Sección "Más de nuestros servicios"
        </Typography>
      </Box>
      <IconButton size="small" onClick={onClose}
        sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#f97316" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
      <SectionTag>Imagen</SectionTag>
      <PanelImgUpload
        currentUrl={item?.url_imagen ?? null}
        absoluteUrl={item?.url_imagen_publica ?? null}
        previewSrc={preview}
        onFile={onFile}
        open={open}
      />
      <Sep />
      <SectionTag>Etiqueta</SectionTag>
      <DarkField
        size="small"
        fullWidth
        label="Texto sobre la imagen"
        value={item?.label ?? ""}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder="Ej: Estrategia Digital"
      />
    </Box>

    <Box sx={{
      px: 2, py: 1.5,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
    }}>
      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          variant="contained"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          onClick={onSave}
          disabled={saving}
          sx={{ bgcolor: "#f97316", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </Stack>
    </Box>

  </CmsPanelRoot>
);

/* ─── Thumbnail card ─────────────────────────────────────────────────────── */
const CarruselCard = ({ item, onEdit, onDelete, isEditing }) => {
  const hasImage = Boolean(
    item._preview
    || item.url_imagen
    || item.url_imagen_publica
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        transition: "box-shadow 0.22s, transform 0.22s",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(249,115,22,0.15)",
          transform: "translateY(-3px)",
        },
      }}
    >
      <Box sx={{
        width: "100%", aspectRatio: "4/3", position: "relative", overflow: "hidden", bgcolor: "#f1f5f9",
        outline: isEditing ? "2px solid #f97316" : "none",
        outlineOffset: -2,
      }}>
        {hasImage ? (
          <CmsStorageImage
            storagePath={item.url_imagen}
            absoluteUrl={item.url_imagen_publica}
            previewSrc={item._preview}
            alt={item.label || ""}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageOutlinedIcon sx={{ fontSize: 42, color: "#cbd5e1" }} />
          </Box>
        )}

        <Box sx={{
          position: "absolute", top: 8, left: 8,
          bgcolor: "rgba(15,23,42,0.80)", color: "#fff",
          borderRadius: 1, px: 1, py: 0.2, fontSize: "0.62rem", fontWeight: 700,
        }}>
          #{item.orden}
        </Box>

        <Box sx={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(item)}
              sx={{ bgcolor: "#f97316", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#ea580c" } }}>
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => onDelete(item)}
              sx={{ bgcolor: "rgba(239,68,68,0.9)", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#dc2626" } }}>
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ px: 1.5, py: 1.2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ color: "#0f172a", fontSize: "0.82rem" }}>
          {item.label || <em style={{ color: "#94a3b8" }}>Sin etiqueta</em>}
        </Typography>
      </Box>
    </Paper>
  );
};

/* ─── Add placeholder card ───────────────────────────────────────────────── */
const AddCard = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      border: "2px dashed #cbd5e1",
      borderRadius: "14px",
      aspectRatio: "4/3",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      cursor: "pointer", gap: 1,
      transition: "border-color 0.2s, background 0.2s",
      "&:hover": { borderColor: "#f97316", bgcolor: "rgba(249,115,22,0.04)" },
    }}
  >
    <AddPhotoAlternateIcon sx={{ fontSize: 38, color: "#cbd5e1" }} />
    <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: "0.78rem" }}>
      Agregar imagen
    </Typography>
  </Box>
);

/* ─── Página principal ───────────────────────────────────────────────────── */
const CarruselIndexPage = () => {
  const { panelLeft } = useCmsPanelLayout();

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [panelOpen,   setPanelOpen]   = useState(false);
  useCmsPanelPush(panelOpen);
  const [editItem,    setEditItem]    = useState(null);
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const isNew = !editItem?.id_carrusel;

  /** Tarjetas del lienzo con vista previa en tiempo real del ítem en edición */
  const canvasItems = useMemo(() => {
    if (!panelOpen || !editItem?.id_carrusel) return items;
    return items.map((it) => (
      it.id_carrusel === editItem.id_carrusel
        ? { ...it, label: editItem.label ?? it.label, _preview: preview }
        : it
    ));
  }, [items, panelOpen, editItem, preview]);

  const cargar = async () => {
    setLoading(true);
    try { setItems(await listar() || []); }
    catch (err) { handleErrorMessages("Error", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const openPanel = (item = null) => {
    setEditItem(item ? { ...item } : { label: "", url_imagen: null });
    setFile(null);
    setPreview(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setFile(null);
    setPreview(null);
  };

  const handleFile = (f) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("label", editItem?.label || "");
      if (file) fd.append("image", file);
      if (!isNew) fd.append("id_carrusel", editItem.id_carrusel);

      if (isNew) await crear(fd);
      else       await actualizar(fd);

      toastSuccess(isNew ? "Imagen creada correctamente" : "Imagen actualizada correctamente");
      closePanel();
      cargar();
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmItem) return;
    setDeleting(true);
    try {
      await eliminar({ id_carrusel: confirmItem.id_carrusel });
      toastSuccess("Imagen eliminada correctamente");
      setConfirmItem(null);
      cargar();
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <CarruselCmsPanel
        open={panelOpen}
        panelLeft={panelLeft}
        item={editItem}
        isNew={isNew}
        preview={preview}
        onFile={handleFile}
        onLabelChange={(val) => setEditItem((p) => ({ ...p, label: val }))}
        onSave={handleSave}
        onClose={closePanel}
        saving={saving}
      />

      <PageBox>

        <HeaderCard elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: "11px",
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ViewCarouselIcon sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                Carrusel de Imágenes
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.78 }}>
                Sección "Más de nuestros servicios" · {items.length} imagen{items.length !== 1 ? "es" : ""}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => openPanel(null)}
            sx={{
              bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700,
              borderRadius: 2, border: "1px solid rgba(255,255,255,0.28)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.30)" },
            }}
          >
            Agregar imagen
          </Button>
        </HeaderCard>

        <Typography variant="caption" sx={{
          display: "block", mb: 2, color: "#64748b",
          fontWeight: 600, fontSize: "0.68rem",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          {items.length} imagen{items.length !== 1 ? "es" : ""} en el carrusel — haz clic en ✏️ para editar
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress sx={{ color: "#f97316" }} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {canvasItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id_carrusel}>
                <CarruselCard
                  item={item}
                  onEdit={openPanel}
                  onDelete={setConfirmItem}
                  isEditing={panelOpen && editItem?.id_carrusel === item.id_carrusel}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <AddCard onClick={() => openPanel(null)} />
            </Grid>
          </Grid>
        )}

      </PageBox>

      <Dialog open={!!confirmItem} onClose={() => setConfirmItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar imagen?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Se eliminará permanentemente la imagen <strong>"{confirmItem?.label || "sin etiqueta"}"</strong>.
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmItem(null)}>Cancelar</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineIcon />}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CarruselIndexPage;
