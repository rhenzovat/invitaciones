import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, ImageUploadField } from "../evento/EventoEditors";

export default function EventoMomento2IndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => {
    setForm({ momento2_foto: data.momento2_foto, momento2_verso_texto: data.momento2_verso_texto, momento2_verso_referencia: data.momento2_verso_referencia });
    setOpen(true);
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Momento 2" subtitle="Foto y versículo a pantalla completa (después de Mesa de Regalos)" />

      <CanvasPhone>
        <EditZone className="section section-photo" sx={{ pt: 3 }}>
          <EzPencil onClick={abrir} />
          <div className="foto-pareja-frame"><div className="foto-card">
            {data.momento2_foto && <img className="foto-nitida" src={publicAsset(data.momento2_foto)} alt="" />}
          </div></div>
        </EditZone>
        <EditZone className="section section-quote" sx={{ pb: 3 }}>
          <EzPencil onClick={abrir} />
          <p className="divider">✦</p>
          <p className="quote-text">{data.momento2_verso_texto}</p>
          <p className="quote-ref">— {data.momento2_verso_referencia}</p>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar Momento 2" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <ImageUploadField label="Foto" value={form.momento2_foto} onChange={(path) => set("momento2_foto", path)} />
          <TextField {...darkTf} label="Versículo" multiline minRows={3} value={form.momento2_verso_texto || ""} onChange={(e) => set("momento2_verso_texto", e.target.value)} />
          <TextField {...darkTf} label="Referencia" value={form.momento2_verso_referencia || ""} onChange={(e) => set("momento2_verso_referencia", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
