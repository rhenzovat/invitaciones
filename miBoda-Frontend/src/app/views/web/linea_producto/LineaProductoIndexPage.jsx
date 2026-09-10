import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Grid, Button, IconButton, TextField, CircularProgress, Dialog, DialogTitle, DialogActions, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { listar, crear, actualizar, eliminar, actualizar_seccion } from "../../../api/web_linea_producto.api";
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

export default function LineaProductoIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [seccion, setSeccion] = useState({});
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
    } catch (e) { handleErrorMessages(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const saveItem = async () => {
    if (!edit?.titulo?.trim()) return;
    const fd = new FormData();
    try {
      if (isNew) {
        ["titulo", "badge", "icono_clase", "url_enlace"].forEach((f) => fd.append(f, edit[f] || ""));
        if (file) fd.append("image", file);
        await crear(fd);
      } else {
        fd.append("id", edit.id);
        ["titulo", "badge", "icono_clase", "url_enlace"].forEach((f) => fd.append(f, edit[f] || ""));
        if (file) fd.append("image", file);
        await actualizar(fd);
      }
      toastSuccess("Guardado");
      setPanelOpen(false);
      load();
    } catch (e) { handleErrorMessages(e); }
  };

  return (
    <>
      <PageBox sx={{ marginLeft: panelOpen ? `${panelLeft}px` : 0 }}>
        <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg,#4338ca,#f97316)" }}>
          <Stack direction="row" spacing={1} alignItems="center"><ViewModuleIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>Líneas de producto</Typography></Stack>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField size="small" fullWidth label="Título sección" sx={{ mb: 1 }} value={seccion.seccion_titulo ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, seccion_titulo: e.target.value }))} />
          <TextField size="small" fullWidth label="Descripción" multiline rows={2} sx={{ mb: 1 }} value={seccion.seccion_descripcion ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, seccion_descripcion: e.target.value }))} />
          <Button variant="contained" sx={{ bgcolor: "#f97316" }} onClick={async () => { await actualizar_seccion(seccion); toastSuccess("OK"); }}>Guardar sección</Button>
        </Paper>
        {loading ? <CircularProgress /> : (
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><Paper onClick={() => { setEdit({ titulo: "", badge: "", icono_clase: "flaticon-feature" }); setIsNew(true); setPanelOpen(true); }} sx={{ p: 2, textAlign: "center", cursor: "pointer", border: "2px dashed #f97316" }}><AddIcon /> Agregar</Paper></Grid>
            {items.map((item) => (
              <Grid item xs={6} md={3} key={item.id}>
                <Paper sx={{ p: 1.5 }}>
                  <CmsStorageImage path={item.url_imagen} sx={{ width: "100%", height: 80, objectFit: "cover" }} />
                  <Typography variant="body2" fontWeight={700}>{item.titulo}</Typography>
                  <IconButton size="small" onClick={() => { setEdit({ ...item }); setIsNew(false); setPanelOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelTarget(item)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </PageBox>
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ px: 2, py: 2 }}>
          <DarkField fullWidth size="small" label="Título" sx={{ mb: 1 }} value={edit?.titulo ?? ""} onChange={(e) => setEdit((x) => ({ ...x, titulo: e.target.value }))} />
          <DarkField fullWidth size="small" label="Badge" sx={{ mb: 1 }} value={edit?.badge ?? ""} onChange={(e) => setEdit((x) => ({ ...x, badge: e.target.value }))} />
          <DarkField fullWidth size="small" label="Clase icono flaticon" sx={{ mb: 1 }} value={edit?.icono_clase ?? ""} onChange={(e) => setEdit((x) => ({ ...x, icono_clase: e.target.value }))} />
          <DarkField fullWidth size="small" label="Enlace" sx={{ mb: 1 }} value={edit?.url_enlace ?? ""} onChange={(e) => setEdit((x) => ({ ...x, url_enlace: e.target.value }))} />
          <input type="file" hidden ref={fileRef} accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button fullWidth sx={{ mb: 2, color: "#94a3b8" }} onClick={() => fileRef.current?.click()}>Imagen</Button>
          <Button fullWidth variant="contained" sx={{ bgcolor: "#f97316" }} onClick={saveItem}>Guardar</Button>
        </Box>
      </CmsPanelRoot>
      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}><DialogTitle>¿Eliminar?</DialogTitle>
        <DialogActions><Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" onClick={async () => { await eliminar({ id: delTarget.id }); setDelTarget(null); load(); }}>Eliminar</Button></DialogActions></Dialog>
    </>
  );
}
