import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, IconPickerField } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/silla-de-director.png";

export default function EventoVideoIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => { setForm({ video_src: data.video_src, video_texto: data.video_texto, icono_video: data.icono_video }); setOpen(true); };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Video" subtitle="Video de la pareja y texto de introducción" />

      <CanvasPhone>
        <EditZone className="section has-flowers">
          <EzPencil onClick={abrir} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_video || ICONO_DEFAULT)} alt="" /></p>
          <h2 className="script-title">Nuestro Video</h2>
          <p className="section-sub">{data.video_texto}</p>
          <div className="video-frame">
            {data.video_src && <video controls src={publicAsset(data.video_src)} style={{ width: "100%" }} />}
          </div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar video" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={form.icono_video} onChange={(path) => set("icono_video", path)} />
          <TextField {...darkTf} label="Ruta del video (assets/video/...)" value={form.video_src || ""} onChange={(e) => set("video_src", e.target.value)} />
          <TextField {...darkTf} label="Texto" multiline minRows={2} value={form.video_texto || ""} onChange={(e) => set("video_texto", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
