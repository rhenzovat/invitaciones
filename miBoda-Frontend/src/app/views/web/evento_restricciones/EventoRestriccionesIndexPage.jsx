import React, { useState } from "react";
import { Typography, TextField, FormControlLabel, Switch } from "@mui/material";
import useInjectPublicCss from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf } from "../evento/EventoEditors";

export default function EventoRestriccionesIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => { setForm({ solo_adultos_activo: data.solo_adultos_activo, solo_adultos_texto: data.solo_adultos_texto }); setOpen(true); };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Restricciones" subtitle="Avisos como 'Solo Adultos' u otras restricciones de la boda" />

      <CanvasPhone>
        <EditZone className="section section-note">
          <EzPencil onClick={abrir} />
          {data.solo_adultos_activo ? (
            <>
              <h2>Solo Adultos</h2>
              <p>{data.solo_adultos_texto}</p>
            </>
          ) : (
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
              Aviso desactivado — no se muestra en la invitación
            </Typography>
          )}
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar restricción 'Solo Adultos'" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <FormControlLabel sx={{ color: "#f1f5f9", mb: 1 }}
            control={<Switch checked={!!form.solo_adultos_activo} onChange={(e) => set("solo_adultos_activo", e.target.checked)} />}
            label="Mostrar aviso" />
          <TextField {...darkTf} label="Texto" multiline minRows={3} value={form.solo_adultos_texto || ""} onChange={(e) => set("solo_adultos_texto", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
