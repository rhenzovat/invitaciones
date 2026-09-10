import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Button, TextField, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import MailIcon from "@mui/icons-material/Mail";
import { obtener, actualizar } from "../../../api/web_contacto_landing.api";
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

export default function ContactoLandingIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(true);
  useCmsPanelPush(panelOpen);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [asuntosText, setAsuntosText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await obtener();
      setData(r ?? {});
      const a = r?.asuntos;
      setAsuntosText(Array.isArray(a) ? a.join("\n") : "");
    } catch (e) { handleErrorMessages(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const fd = new FormData();
      fd.append("titulo", data.titulo || "");
      fd.append("descripcion", data.descripcion || "");
      fd.append("email_destino", data.email_destino || "");
      fd.append("asuntos", JSON.stringify(asuntosText.split("\n").map((s) => s.trim()).filter(Boolean)));
      if (file) fd.append("image", file);
      await actualizar(fd);
      toastSuccess("Guardado");
      load();
    } catch (e) { handleErrorMessages(e); }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <>
      <PageBox sx={{ marginLeft: panelOpen ? `${panelLeft}px` : 0 }}>
        <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg,#0369a1,#f97316)" }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}><MailIcon sx={{ verticalAlign: "middle", mr: 1 }} />Formulario contacto landing</Typography>
        </Paper>
        <Paper sx={{ p: 3, maxWidth: 480 }}>
          <Typography variant="h6">{data.titulo}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>{data.descripcion}</Typography>
          <CmsStorageImage path={data.url_imagen} sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 1 }} />
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setPanelOpen(true)}>Editar en panel</Button>
        </Paper>
      </PageBox>
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ px: 2, py: 2 }}>
          <DarkField fullWidth size="small" label="Título" sx={{ mb: 1.5 }} value={data.titulo ?? ""} onChange={(e) => setData((d) => ({ ...d, titulo: e.target.value }))} />
          <DarkField fullWidth size="small" label="Descripción" multiline rows={2} sx={{ mb: 1.5 }} value={data.descripcion ?? ""} onChange={(e) => setData((d) => ({ ...d, descripcion: e.target.value }))} />
          <DarkField fullWidth size="small" label="Email destino" sx={{ mb: 1.5 }} value={data.email_destino ?? ""} onChange={(e) => setData((d) => ({ ...d, email_destino: e.target.value }))} />
          <DarkField fullWidth size="small" label="Asuntos (uno por línea)" multiline rows={4} sx={{ mb: 1.5 }} value={asuntosText} onChange={(e) => setAsuntosText(e.target.value)} />
          <input type="file" hidden ref={fileRef} accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
          <Button fullWidth sx={{ mb: 2, color: "#94a3b8" }} onClick={() => fileRef.current?.click()}>Imagen lateral</Button>
          <Button fullWidth variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: "#f97316" }} onClick={save}>Guardar</Button>
        </Box>
      </CmsPanelRoot>
    </>
  );
}
