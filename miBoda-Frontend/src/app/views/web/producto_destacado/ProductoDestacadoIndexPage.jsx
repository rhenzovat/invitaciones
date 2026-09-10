import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Grid, Button, IconButton, TextField,
  CircularProgress, Dialog, DialogTitle, DialogActions, Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import InventoryIcon from "@mui/icons-material/Inventory";

import { listar, crear, actualizar, eliminar, actualizar_seccion } from "../../../api/web_producto_destacado.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const PageBox = styled(Box)({ padding: 20, minHeight: "100vh", backgroundColor: "#f0f4f8" });
const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
}));

export default function ProductoDestacadoIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [seccion, setSeccion] = useState({ seccion_subtitulo: "" });
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [file, setFile] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setSeccion(data?.seccion ?? {});
      setItems(data?.items ?? []);
    } catch (e) {
      handleErrorMessages(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveSeccion = async () => {
    try {
      await actualizar_seccion(seccion);
      toastSuccess("Sección guardada");
    } catch (e) {
      handleErrorMessages(e);
    }
  };

  const saveItem = async () => {
    if (!edit?.titulo?.trim()) return;
    try {
      const fd = new FormData();
      if (isNew) {
        fd.append("titulo", edit.titulo);
        fd.append("descripcion", edit.descripcion || "");
        fd.append("url_video_youtube", edit.url_video_youtube || "");
        fd.append("btn_texto", edit.btn_texto || "Me interesa");
        fd.append("btn_url", edit.btn_url || "");
        if (file) fd.append("image", file);
        await crear(fd);
      } else {
        fd.append("id", edit.id);
        fd.append("titulo", edit.titulo);
        fd.append("descripcion", edit.descripcion || "");
        fd.append("url_video_youtube", edit.url_video_youtube || "");
        fd.append("btn_texto", edit.btn_texto || "");
        fd.append("btn_url", edit.btn_url || "");
        if (file) fd.append("image", file);
        await actualizar(fd);
      }
      toastSuccess("Guardado");
      setPanelOpen(false);
      load();
    } catch (e) {
      handleErrorMessages(e);
    }
  };

  return (
    <>
      <PageBox sx={{ marginLeft: panelOpen ? `${panelLeft}px` : 0, transition: "margin-left 0.25s" }}>
        <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg,#1e3a5f,#f97316)" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <InventoryIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>Productos destacados (carousel)</Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Subtítulo de sección</Typography>
          <Stack direction="row" spacing={2}>
            <TextField size="small" fullWidth value={seccion.seccion_subtitulo ?? ""}
              onChange={(e) => setSeccion((s) => ({ ...s, seccion_subtitulo: e.target.value }))} />
            <Button variant="contained" sx={{ bgcolor: "#f97316" }} onClick={saveSeccion}>Guardar sección</Button>
          </Stack>
        </Paper>
        {loading ? <CircularProgress /> : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper onClick={() => { setEdit({ titulo: "", descripcion: "", btn_texto: "Me interesa" }); setIsNew(true); setFile(null); setPanelOpen(true); }}
                sx={{ p: 3, textAlign: "center", cursor: "pointer", border: "2px dashed #f97316" }}>
                <AddIcon sx={{ color: "#f97316" }} /><Typography>Agregar</Typography>
              </Paper>
            </Grid>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Paper sx={{ p: 2 }}>
                  <CmsStorageImage path={item.url_imagen} alt={item.titulo} sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 1, mb: 1 }} />
                  <Typography fontWeight={700}>{item.titulo}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <IconButton size="small" onClick={() => { setEdit({ ...item }); setIsNew(false); setFile(null); setPanelOpen(true); }}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDelTarget(item)}><DeleteOutlineIcon /></IconButton>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </PageBox>

      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ px: 2, py: 2 }}>
          <Typography sx={{ color: "#f1f5f9", fontWeight: 700, mb: 2 }}>{isNew ? "Nuevo" : "Editar"} producto</Typography>
          <DarkField fullWidth size="small" label="Título" sx={{ mb: 1.5 }} value={edit?.titulo ?? ""} onChange={(e) => setEdit((x) => ({ ...x, titulo: e.target.value }))} />
          <DarkField fullWidth size="small" label="Descripción" multiline rows={3} sx={{ mb: 1.5 }} value={edit?.descripcion ?? ""} onChange={(e) => setEdit((x) => ({ ...x, descripcion: e.target.value }))} />
          <DarkField fullWidth size="small" label="URL video YouTube" sx={{ mb: 1.5 }} value={edit?.url_video_youtube ?? ""} onChange={(e) => setEdit((x) => ({ ...x, url_video_youtube: e.target.value }))} />
          <DarkField fullWidth size="small" label="Texto botón" sx={{ mb: 1.5 }} value={edit?.btn_texto ?? ""} onChange={(e) => setEdit((x) => ({ ...x, btn_texto: e.target.value }))} />
          <DarkField fullWidth size="small" label="URL botón" sx={{ mb: 1.5 }} value={edit?.btn_url ?? ""} onChange={(e) => setEdit((x) => ({ ...x, btn_url: e.target.value }))} />
          <input type="file" hidden ref={fileRef} accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button fullWidth variant="outlined" sx={{ color: "#94a3b8", mb: 2 }} onClick={() => fileRef.current?.click()}>Subir imagen</Button>
          <Button fullWidth variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: "#f97316" }} onClick={saveItem}>Guardar</Button>
        </Box>
      </CmsPanelRoot>

      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}>
        <DialogTitle>¿Eliminar producto?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" onClick={async () => { await eliminar({ id: delTarget.id }); toastSuccess("Eliminado"); setDelTarget(null); load(); }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
