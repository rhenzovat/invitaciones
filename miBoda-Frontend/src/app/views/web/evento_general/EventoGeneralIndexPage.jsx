import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf } from "../evento/EventoEditors";

export default function EventoGeneralIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => { setForm({ footer_texto: data.footer_texto }); setOpen(true); };
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Pie de Página" subtitle="Texto de despedida al final de la invitación" />

      <CanvasPhone>
        <EditZone className="footer has-flowers" sx={{ py: 3 }}>
          <EzPencil onClick={abrir} tip="Editar pie de página" />
          <h2>{data.footer_texto}</h2>
          <p className="footer-names">{data.novio} &amp; {data.novia}</p>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar pie de página" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Texto de despedida" multiline minRows={2} value={form.footer_texto || ""} onChange={(e) => setForm((p) => ({ ...p, footer_texto: e.target.value }))} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
