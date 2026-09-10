import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, ImageUploadField } from "../evento/EventoEditors";

export default function EventoMomento1IndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => {
    setForm({ momento1_verso_texto: data.momento1_verso_texto, momento1_verso_referencia: data.momento1_verso_referencia, momento1_foto: data.momento1_foto });
    setOpen(true);
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Momento 1" subtitle="Versículo y foto a pantalla completa (después de Ubicaciones)" />

      <CanvasPhone>
        <EditZone className="section section-quote" sx={{ pt: 3 }}>
          <EzPencil onClick={abrir} />
          <p className="divider">✦</p>
          <p className="quote-text">{data.momento1_verso_texto}</p>
          <p className="quote-ref">— {data.momento1_verso_referencia}</p>
        </EditZone>
        <EditZone className="section section-photo" sx={{ pb: 3 }}>
          <EzPencil onClick={abrir} />
          <div className="foto-pareja-frame"><div className="foto-card">
            {data.momento1_foto && <img className="foto-nitida" src={publicAsset(data.momento1_foto)} alt="" />}
          </div></div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar Momento 1" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Versículo" multiline minRows={3} value={form.momento1_verso_texto || ""} onChange={(e) => set("momento1_verso_texto", e.target.value)} />
          <TextField {...darkTf} label="Referencia" value={form.momento1_verso_referencia || ""} onChange={(e) => set("momento1_verso_referencia", e.target.value)} />
          <ImageUploadField label="Foto" value={form.momento1_foto} onChange={(path) => set("momento1_foto", path)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
