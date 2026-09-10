import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Grid, Button, IconButton, TextField,
  CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EventIcon from "@mui/icons-material/Event";

import { listar, crear, actualizar, eliminar, actualizar_seccion } from "../../../api/web_eventos.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import CmsTinyMceField from "app/components/cms/CmsTinyMceField";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const PageBox = styled(Box)({
  padding: 20, minHeight: "100vh", backgroundColor: "#f0f4f8",
});

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
}));

export default function EventosIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const openPanel = () => setPanelOpen(true);
  const closePanel = () => { setPanelOpen(false); setPreview(null); setFile(null); };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [seccion, setSeccion] = useState({ titulo: "", subtitulo: "" });
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeccion({
        titulo: data?.seccion_titulo ?? "",
        subtitulo: data?.seccion_subtitulo ?? "",
      });
      setItems(data?.items ?? []);
    } catch (e) {
      handleErrorMessages(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEdit({ titulo: "", slug: "", alt_imagen: "" });
    setIsNew(true);
    setPreview(null);
    setFile(null);
    openPanel();
  };

  const startEdit = (item) => {
    setEdit({ ...item });
    setIsNew(false);
    setPreview(null);
    setFile(null);
    openPanel();
  };

  const handleSave = async () => {
    if (!edit?.titulo?.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      if (isNew) {
        fd.append("titulo", edit.titulo);
        fd.append("slug", edit.slug || "");
        fd.append("alt_imagen", edit.alt_imagen || edit.titulo);
        if (file) fd.append("image", file);
        await crear(fd);
        toastSuccess("Evento creado");
      } else {
        fd.append("id_evento", edit.id_evento);
        fd.append("titulo", edit.titulo);
        fd.append("slug", edit.slug || "");
        fd.append("alt_imagen", edit.alt_imagen || "");
        if (file) fd.append("image", file);
        await actualizar(fd);
        toastSuccess("Evento actualizado");
      }
      closePanel();
      await load();
    } catch (e) {
      handleErrorMessages(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await eliminar({ id_evento: delTarget.id_evento });
      toastSuccess("Evento eliminado");
      setDelTarget(null);
      await load();
    } catch (e) {
      handleErrorMessages(e);
    }
  };

  const saveSeccion = async () => {
    try {
      await actualizar_seccion({
        seccion_titulo: seccion.titulo,
        seccion_subtitulo: seccion.subtitulo,
      });
      toastSuccess("Textos de sección guardados");
      await load();
    } catch (e) {
      handleErrorMessages(e);
    }
  };

  return (
    <>
      <PageBox>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, background: "linear-gradient(135deg,#0f172a,#1d4ed8 60%,#f97316)" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>Eventos — Galería landing</Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>Textos de la sección</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CmsTinyMceField
                label="Título sección (HTML)"
                value={seccion.titulo}
                onChange={(v) => setSeccion((s) => ({ ...s, titulo: v }))}
                mode="compact"
                height={100}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField size="small" fullWidth label="Subtítulo" value={seccion.subtitulo}
                onChange={(e) => setSeccion((s) => ({ ...s, subtitulo: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={saveSeccion} sx={{ bgcolor: "#f97316" }}>Guardar sección</Button>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Paper onClick={startNew} sx={{
                aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", cursor: "pointer", border: "2px dashed #f97316", borderRadius: 2,
              }}>
                <AddPhotoAlternateIcon sx={{ fontSize: 40, color: "#f97316" }} />
                <Typography variant="body2" sx={{ mt: 1, color: "#64748b" }}>Agregar evento</Typography>
              </Paper>
            </Grid>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id_evento}>
                <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ aspectRatio: "4/3", position: "relative", bgcolor: "#f1f5f9" }}>
                    <CmsStorageImage
                      storagePath={item.url_imagen}
                      absoluteUrl={item.url_imagen_publica}
                      alt={item.titulo}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Box sx={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 0.5 }}>
                      <IconButton size="small" onClick={() => startEdit(item)}
                        sx={{ bgcolor: "#f97316", color: "#fff", width: 28, height: 28 }}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDelTarget(item)}
                        sx={{ bgcolor: "#ef4444", color: "#fff", width: 28, height: 28 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={600}>{item.titulo}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </PageBox>

      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Typography variant="subtitle2" sx={{ color: "#f1f5f9", fontWeight: 700 }}>
            {isNew ? "Nuevo evento" : "Editar evento"}
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 1.5 }}>
          <input type="file" ref={fileRef} accept="image/*" hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
            }} />
          <Box onClick={() => fileRef.current?.click()} sx={{
            aspectRatio: "4/3", border: "2px dashed rgba(249,115,22,0.5)", borderRadius: 2,
            overflow: "hidden", cursor: "pointer", mb: 2,
          }}>
            {(preview || edit?.url_imagen) ? (
              <CmsStorageImage storagePath={edit?.url_imagen} previewSrc={preview} alt=""
                sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <PhotoCameraIcon sx={{ color: "#f97316", fontSize: 36 }} />
              </Stack>
            )}
          </Box>
          <DarkField size="small" fullWidth label="Título" value={edit?.titulo ?? ""} sx={{ mb: 1.5 }}
            onChange={(e) => setEdit((x) => ({ ...x, titulo: e.target.value }))} />
          <DarkField size="small" fullWidth label="Slug" value={edit?.slug ?? ""} sx={{ mb: 1.5 }}
            onChange={(e) => setEdit((x) => ({ ...x, slug: e.target.value }))} />
          <DarkField size="small" fullWidth label="Texto alt imagen" value={edit?.alt_imagen ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, alt_imagen: e.target.value }))} />
        </Box>
        <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Button fullWidth variant="contained" startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={saving}
            sx={{ bgcolor: "#f97316", fontWeight: 700, "&:hover": { bgcolor: "#ea580c" } }}>
            Guardar
          </Button>
        </Box>
      </CmsPanelRoot>

      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}>
        <DialogTitle>¿Eliminar evento?</DialogTitle>
        <DialogContent><Typography>{delTarget?.titulo}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
