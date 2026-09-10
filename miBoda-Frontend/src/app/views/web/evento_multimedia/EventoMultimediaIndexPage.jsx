import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, ImageUploadField } from "../evento/EventoEditors";

export default function EventoMultimediaIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [panel, setPanel] = useState(null); // 'fotopareja' | 'estacionamiento' | 'musica'
  const [form, setForm] = useState({});

  const abrir = (tipo, campos) => { setForm(campos); setPanel(tipo); };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setPanel(null); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Foto, Música y Estacionamiento" subtitle="Foto de pareja, música de fondo y avisos de estacionamiento" />

      <CanvasPhone>
        <EditZone className="section section-photo" sx={{ pt: 3 }}>
          <EzPencil onClick={() => abrir("fotopareja", { foto_pareja_src: data.foto_pareja_src })} />
          <div className="foto-pareja-frame"><div className="foto-card">
            {data.foto_pareja_src && <img className="foto-nitida" src={publicAsset(data.foto_pareja_src)} alt="" />}
          </div></div>
        </EditZone>

        <EditZone className="section section-note">
          <EzPencil onClick={() => abrir("estacionamiento", { estacionamiento_texto: data.estacionamiento_texto })} />
          <h2>Estacionamiento disponible</h2>
          <p>{data.estacionamiento_texto}</p>
        </EditZone>

        <EditZone sx={{ p: 2, textAlign: "center" }}>
          <EzPencil onClick={() => abrir("musica", { musica_src: data.musica_src, musica_volumen: data.musica_volumen })} tip="Editar música de fondo" />
          <Typography sx={{ fontSize: "0.8rem", color: "#7a4030" }}>🎵 Música de fondo: {data.musica_src || "—"} (volumen {data.musica_volumen})</Typography>
        </EditZone>
      </CanvasPhone>

      {panel === "fotopareja" && (
        <EditPanel open title="Editar foto de pareja" onClose={() => setPanel(null)} onSave={guardar} saving={saving}>
          <ImageUploadField label="Foto" value={form.foto_pareja_src} onChange={(path) => set("foto_pareja_src", path)} />
        </EditPanel>
      )}
      {panel === "estacionamiento" && (
        <EditPanel open title="Editar estacionamiento" onClose={() => setPanel(null)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Texto" multiline minRows={3} value={form.estacionamiento_texto || ""} onChange={(e) => set("estacionamiento_texto", e.target.value)} />
        </EditPanel>
      )}
      {panel === "musica" && (
        <EditPanel open title="Editar música de fondo" onClose={() => setPanel(null)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Ruta del audio (assets/audio/...)" value={form.musica_src || ""} onChange={(e) => set("musica_src", e.target.value)} />
          <TextField {...darkTf} type="number" label="Volumen (0 a 1)" inputProps={{ step: 0.05, min: 0, max: 1 }}
            value={form.musica_volumen ?? 0.4} onChange={(e) => set("musica_volumen", parseFloat(e.target.value))} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
