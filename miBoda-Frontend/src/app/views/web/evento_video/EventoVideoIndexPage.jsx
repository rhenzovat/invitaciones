import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf } from "../evento/EventoEditors";

export default function EventoVideoIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => { setForm({ video_src: data.video_src, video_texto: data.video_texto }); setOpen(true); };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Video" subtitle="Video de la pareja y texto de introducción" />

      <CanvasPhone>
        <EditZone className="section has-flowers">
          <EzPencil onClick={abrir} />
          <p className="divider">🎬</p>
          <h2 className="script-title">Nuestro Video</h2>
          <p className="section-sub">{data.video_texto}</p>
          <div className="video-frame">
            {data.video_src && <video controls src={publicAsset(data.video_src)} style={{ width: "100%" }} />}
          </div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar video" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Ruta del video (assets/video/...)" value={form.video_src || ""} onChange={(e) => set("video_src", e.target.value)} />
          <TextField {...darkTf} label="Texto" multiline minRows={2} value={form.video_texto || ""} onChange={(e) => set("video_texto", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
