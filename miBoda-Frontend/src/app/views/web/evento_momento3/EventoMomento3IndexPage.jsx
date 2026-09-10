import React, { useState } from "react";
import { Typography } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { ImageUploadField } from "../evento/EventoEditors";

export default function EventoMomento3IndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => { setForm({ momento3_foto: data.momento3_foto }); setOpen(true); };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Momento 3" subtitle="Foto a pantalla completa (después de Nuestra Historia)" />

      <CanvasPhone>
        <EditZone className="section section-photo" sx={{ py: 3 }}>
          <EzPencil onClick={abrir} />
          <div className="foto-pareja-frame"><div className="foto-card">
            {data.momento3_foto && <img className="foto-nitida" src={publicAsset(data.momento3_foto)} alt="" />}
          </div></div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar Momento 3" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <ImageUploadField label="Foto" value={form.momento3_foto} onChange={(path) => set("momento3_foto", path)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
