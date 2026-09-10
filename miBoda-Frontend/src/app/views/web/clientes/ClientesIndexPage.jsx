import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Grid, Button, IconButton, TextField, CircularProgress, Dialog, DialogTitle, DialogActions, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  obtener_seccion, actualizar_seccion,
  listar_estadisticas, crear_estadistica, actualizar_estadistica, eliminar_estadistica,
  listar_logos, crear_logo, actualizar_logo, eliminar_logo,
} from "../../../api/web_cliente.api";
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

export default function ClientesIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);
  const [tab, setTab] = useState(0);
  const [seccion, setSeccion] = useState({});
  const [stats, setStats] = useState([]);
  const [logos, setLogos] = useState([]);
  const [edit, setEdit] = useState(null);
  const [editType, setEditType] = useState("stat");
  const [isNew, setIsNew] = useState(false);
  const [file, setFile] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      setSeccion((await obtener_seccion()) ?? {});
      setStats((await listar_estadisticas()) ?? []);
      setLogos((await listar_logos()) ?? []);
    } catch (e) { handleErrorMessages(e); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editType === "seccion") {
        const fd = new FormData();
        ["tag", "titulo", "descripcion", "cta_texto", "cta_url"].forEach((k) => fd.append(k, seccion[k] || ""));
        await actualizar_seccion(fd);
        toastSuccess("Sección guardada");
        setPanelOpen(false);
        load();
        return;
      }
      if (editType === "stat") {
        if (isNew) await crear_estadistica(edit);
        else await actualizar_estadistica(edit);
      } else {
        const fd = new FormData();
        if (isNew) {
          fd.append("nombre", edit.nombre || "");
          if (file) fd.append("image", file);
          await crear_logo(fd);
        } else {
          fd.append("id", edit.id);
          fd.append("nombre", edit.nombre || "");
          fd.append("url_enlace", edit.url_enlace || "");
          if (file) fd.append("image", file);
          await actualizar_logo(fd);
        }
      }
      toastSuccess("Guardado");
      setPanelOpen(false);
      load();
    } catch (e) { handleErrorMessages(e); }
  };

  return (
    <>
      <PageBox sx={{ marginLeft: panelOpen ? `${panelLeft}px` : 0 }}>
        <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg,#134e4a,#f97316)" }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}><GroupsIcon sx={{ mr: 1 }} />Clientes</Typography>
        </Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Sección" /><Tab label="Estadísticas" /><Tab label="Logos" />
        </Tabs>
        {tab === 0 && (
          <Paper sx={{ p: 2 }}>
            <Button variant="contained" sx={{ bgcolor: "#f97316", mb: 2 }} onClick={() => { setEditType("seccion"); setPanelOpen(true); }}>Editar sección</Button>
            <Typography variant="h6">{seccion.titulo}</Typography>
            <Typography color="text.secondary">{seccion.descripcion}</Typography>
          </Paper>
        )}
        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><Paper onClick={() => { setEditType("stat"); setEdit({ valor: "", etiqueta: "", icono_clase: "fas fa-users" }); setIsNew(true); setPanelOpen(true); }} sx={{ p: 2, textAlign: "center", cursor: "pointer", border: "2px dashed #f97316" }}><AddIcon /></Paper></Grid>
            {stats.map((s) => (
              <Grid item xs={6} md={3} key={s.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h5">{s.valor}</Typography>
                  <Typography variant="body2">{s.etiqueta}</Typography>
                  <IconButton size="small" onClick={() => { setEditType("stat"); setEdit({ ...s }); setIsNew(false); setPanelOpen(true); }}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelTarget({ type: "stat", item: s })}><DeleteOutlineIcon /></IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        {tab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}><Paper onClick={() => { setEditType("logo"); setEdit({ nombre: "" }); setIsNew(true); setFile(null); setPanelOpen(true); }} sx={{ p: 2, textAlign: "center", cursor: "pointer", border: "2px dashed #f97316" }}><AddIcon /></Paper></Grid>
            {logos.map((lg) => (
              <Grid item xs={6} md={2} key={lg.id}>
                <Paper sx={{ p: 1 }}>
                  <CmsStorageImage path={lg.url_imagen} sx={{ width: "100%", height: 50, objectFit: "contain" }} />
                  <IconButton size="small" onClick={() => { setEditType("logo"); setEdit({ ...lg }); setIsNew(false); setPanelOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDelTarget({ type: "logo", item: lg })}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </PageBox>
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ px: 2, py: 2 }}>
          {editType === "seccion" ? (
            <>
              <DarkField fullWidth size="small" label="Tag" sx={{ mb: 1 }} value={seccion.tag ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, tag: e.target.value }))} />
              <DarkField fullWidth size="small" label="Título" sx={{ mb: 1 }} value={seccion.titulo ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, titulo: e.target.value }))} />
              <DarkField fullWidth size="small" label="Descripción" multiline rows={2} sx={{ mb: 1 }} value={seccion.descripcion ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, descripcion: e.target.value }))} />
              <DarkField fullWidth size="small" label="CTA texto" sx={{ mb: 1 }} value={seccion.cta_texto ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, cta_texto: e.target.value }))} />
              <DarkField fullWidth size="small" label="CTA URL" sx={{ mb: 1 }} value={seccion.cta_url ?? ""} onChange={(e) => setSeccion((s) => ({ ...s, cta_url: e.target.value }))} />
            </>
          ) : editType === "stat" ? (
            <>
              <DarkField fullWidth size="small" label="Valor" sx={{ mb: 1 }} value={edit?.valor ?? ""} onChange={(e) => setEdit((x) => ({ ...x, valor: e.target.value }))} />
              <DarkField fullWidth size="small" label="Etiqueta" sx={{ mb: 1 }} value={edit?.etiqueta ?? ""} onChange={(e) => setEdit((x) => ({ ...x, etiqueta: e.target.value }))} />
              <DarkField fullWidth size="small" label="Icono (clase FA)" sx={{ mb: 1 }} value={edit?.icono_clase ?? ""} onChange={(e) => setEdit((x) => ({ ...x, icono_clase: e.target.value }))} />
            </>
          ) : (
            <>
              <DarkField fullWidth size="small" label="Nombre" sx={{ mb: 1 }} value={edit?.nombre ?? ""} onChange={(e) => setEdit((x) => ({ ...x, nombre: e.target.value }))} />
              <DarkField fullWidth size="small" label="URL enlace" sx={{ mb: 1 }} value={edit?.url_enlace ?? ""} onChange={(e) => setEdit((x) => ({ ...x, url_enlace: e.target.value }))} />
              <input type="file" hidden ref={fileRef} accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
              <Button fullWidth sx={{ color: "#94a3b8", mb: 2 }} onClick={() => fileRef.current?.click()}>Logo imagen</Button>
            </>
          )}
          <Button fullWidth variant="contained" sx={{ bgcolor: "#f97316" }} onClick={save}>Guardar</Button>
        </Box>
      </CmsPanelRoot>
      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}><DialogTitle>¿Eliminar?</DialogTitle>
        <DialogActions><Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" onClick={async () => {
            if (delTarget.type === "stat") await eliminar_estadistica({ id: delTarget.item.id });
            else await eliminar_logo({ id: delTarget.item.id });
            setDelTarget(null); load();
          }}>Eliminar</Button></DialogActions></Dialog>
    </>
  );
}
