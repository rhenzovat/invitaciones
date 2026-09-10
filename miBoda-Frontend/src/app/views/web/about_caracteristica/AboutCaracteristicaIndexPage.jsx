import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Grid, Button, IconButton, TextField, CircularProgress, Dialog, DialogTitle, DialogActions } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { listar, crear, actualizar, eliminar } from "../../../api/web_about_caracteristica.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const PageBox = styled(Box)({ padding: 20, minHeight: "100vh", backgroundColor: "#f0f4f8" });
const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
}));

export default function AboutCaracteristicaIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [file, setFile] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try { setItems((await listar()) ?? []); } catch (e) { handleErrorMessages(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const fd = new FormData();
    try {
      if (isNew) {
        fd.append("titulo", edit.titulo);
        fd.append("descripcion", edit.descripcion || "");
        fd.append("url_enlace", edit.url_enlace || "");
        fd.append("texto_enlace", edit.texto_enlace || "Ver más");
        if (file) fd.append("image", file);
        await crear(fd);
      } else {
        fd.append("id", edit.id);
        fd.append("titulo", edit.titulo);
        fd.append("descripcion", edit.descripcion || "");
        fd.append("url_enlace", edit.url_enlace || "");
        fd.append("texto_enlace", edit.texto_enlace || "");
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
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Características — sección Nosotros</Typography>
        {loading ? <CircularProgress /> : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Paper onClick={() => { setEdit({ titulo: "" }); setIsNew(true); setPanelOpen(true); }} sx={{ p: 3, textAlign: "center", cursor: "pointer", border: "2px dashed #f97316" }}><AddIcon /> Agregar</Paper></Grid>
            {items.map((it) => (
              <Grid item xs={12} md={4} key={it.id}>
                <Paper sx={{ p: 2 }}>
                  <CmsStorageImage path={it.url_imagen} sx={{ width: "100%", height: 100, objectFit: "cover", mb: 1 }} />
                  <Typography fontWeight={700}>{it.titulo}</Typography>
                  <IconButton size="small" onClick={() => { setEdit({ ...it }); setIsNew(false); setPanelOpen(true); }}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelTarget(it)}><DeleteOutlineIcon /></IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </PageBox>
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ px: 2, py: 2 }}>
          <DarkField fullWidth size="small" label="Título" sx={{ mb: 1 }} value={edit?.titulo ?? ""} onChange={(e) => setEdit((x) => ({ ...x, titulo: e.target.value }))} />
          <DarkField fullWidth size="small" label="Descripción" multiline rows={2} sx={{ mb: 1 }} value={edit?.descripcion ?? ""} onChange={(e) => setEdit((x) => ({ ...x, descripcion: e.target.value }))} />
          <DarkField fullWidth size="small" label="Enlace" sx={{ mb: 1 }} value={edit?.url_enlace ?? ""} onChange={(e) => setEdit((x) => ({ ...x, url_enlace: e.target.value }))} />
          <input type="file" hidden ref={fileRef} onChange={(e) => setFile(e.target.files?.[0])} />
          <Button fullWidth sx={{ mb: 2, color: "#94a3b8" }} onClick={() => fileRef.current?.click()}>Imagen</Button>
          <Button fullWidth variant="contained" sx={{ bgcolor: "#f97316" }} startIcon={<SaveIcon />} onClick={save}>Guardar</Button>
        </Box>
      </CmsPanelRoot>
      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}><DialogTitle>¿Eliminar?</DialogTitle>
        <DialogActions><Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" onClick={async () => { await eliminar({ id: delTarget.id }); setDelTarget(null); load(); }}>Eliminar</Button></DialogActions></Dialog>
    </>
  );
}
