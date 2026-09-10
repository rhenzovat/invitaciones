import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, ImageUploadField } from "../evento/EventoEditors";

export default function EventoHeroIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => {
    setForm({
      novio: data.novio,
      novia: data.novia,
      fecha_boda: data.fecha_boda,
      fecha_boda_texto: data.fecha_boda_texto,
      hero_subtitulo: data.hero_subtitulo,
      hero_foto: data.hero_foto,
    });
    setOpen(true);
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Hero" subtitle="Nombres, fecha, subtítulo y foto de fondo de la portada principal" />

      <CanvasPhone>
        <EditZone
          className="hero"
          sx={{
            minHeight: 300,
            backgroundImage: data.hero_foto ? `url(${publicAsset(data.hero_foto)})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <EzPencil onClick={abrir} />
            <p className="kicker">Nos Casamos...!!!</p>
            <h1 className="hero-names">
              <span>{data.novio}</span> <span className="amp">&amp;</span> <span>{data.novia}</span>
            </h1>
            <p className="hero-date">{data.fecha_boda_texto}</p>
            <p className="hero-subtitle">{data.hero_subtitulo}</p>
          </div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar Hero" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <ImageUploadField label="Foto de fondo" value={form.hero_foto} onChange={(path) => set("hero_foto", path)} />
          <TextField {...darkTf} label="Nombre del novio" value={form.novio || ""} onChange={(e) => set("novio", e.target.value)} />
          <TextField {...darkTf} label="Nombre de la novia" value={form.novia || ""} onChange={(e) => set("novia", e.target.value)} />
          <TextField {...darkTf} type="datetime-local" label="Fecha y hora de la boda" InputLabelProps={{ shrink: true }}
            value={form.fecha_boda ? form.fecha_boda.replace(" ", "T").slice(0, 16) : ""} onChange={(e) => set("fecha_boda", e.target.value)} />
          <TextField {...darkTf} label="Fecha en texto (ej: 11 de noviembre de 2026)" value={form.fecha_boda_texto || ""} onChange={(e) => set("fecha_boda_texto", e.target.value)} />
          <TextField {...darkTf} label="Subtítulo" multiline minRows={2} value={form.hero_subtitulo || ""} onChange={(e) => set("hero_subtitulo", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
