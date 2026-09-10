import React, { useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, ImageUploadField } from "../evento/EventoEditors";

export default function EventoSobreIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [panel, setPanel] = useState(null); // 'texto' | 'fotos'
  const [form, setForm] = useState({});

  const abrirTexto = () => {
    setForm({ monograma: data.monograma, envelope_verse_texto: data.envelope_verse_texto, envelope_verse_referencia: data.envelope_verse_referencia });
    setPanel("texto");
  };
  const abrirFotos = () => {
    setForm({ envelope_foto1: data.envelope_foto1, envelope_foto2: data.envelope_foto2, envelope_sello_img: data.envelope_sello_img });
    setPanel("fotos");
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setPanel(null); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Sobre Animado (Portada)" subtitle="Monograma, versículo y las 2 fotos que asoman al abrir el sobre" />

      <CanvasPhone>
        <EditZone sx={{ p: 3, textAlign: "center", background: "linear-gradient(180deg, #fff, var(--color-fondo))" }}>
          <EzPencil onClick={abrirTexto} tip="Editar monograma y versículo" />
          <p className="portada-kicker">Te invitamos a</p>
          <h1 className="portada-title">Nuestra Boda</h1>
          <Box sx={{ mt: 2, mb: 1, fontFamily: "var(--font-script)", fontSize: "1.3rem", color: "#A16207" }}>{data.monograma}</Box>
          <Typography sx={{ fontStyle: "italic", fontSize: "0.75rem", color: "#3B3128", opacity: 0.85 }}>
            &ldquo;{data.envelope_verse_texto}&rdquo;<br />{data.envelope_verse_referencia}
          </Typography>
        </EditZone>

        <EditZone sx={{ p: 3, textAlign: "center" }}>
          <EzPencil onClick={abrirFotos} tip="Cambiar fotos del sobre" />
          <Typography sx={{ fontSize: "0.7rem", color: "#94836f", mb: 1.5 }}>Fotos que asoman al abrir el sobre</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            {data.envelope_foto1 && (
              <Box component="img" src={publicAsset(data.envelope_foto1)} sx={{ width: 90, height: 120, objectFit: "cover", borderRadius: "6px", border: "4px solid #fff", boxShadow: "0 6px 14px rgba(0,0,0,0.2)", transform: "rotate(-6deg)" }} />
            )}
            {data.envelope_foto2 && (
              <Box component="img" src={publicAsset(data.envelope_foto2)} sx={{ width: 90, height: 120, objectFit: "cover", borderRadius: "6px", border: "4px solid #fff", boxShadow: "0 6px 14px rgba(0,0,0,0.2)", transform: "rotate(6deg)" }} />
            )}
          </Box>
          {data.envelope_sello_img && (
            <Box component="img" src={publicAsset(data.envelope_sello_img)} sx={{ width: 50, height: 50, objectFit: "contain", mt: 2 }} />
          )}
        </EditZone>
      </CanvasPhone>

      {panel === "texto" && (
        <EditPanel open title="Editar monograma y versículo" onClose={() => setPanel(null)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Monograma (ej: R & Y)" value={form.monograma || ""} onChange={(e) => set("monograma", e.target.value)} />
          <TextField {...darkTf} label="Versículo del sobre" multiline minRows={3} value={form.envelope_verse_texto || ""} onChange={(e) => set("envelope_verse_texto", e.target.value)} />
          <TextField {...darkTf} label="Referencia (ej: Colosenses 3:14)" value={form.envelope_verse_referencia || ""} onChange={(e) => set("envelope_verse_referencia", e.target.value)} />
        </EditPanel>
      )}

      {panel === "fotos" && (
        <EditPanel open title="Editar fotos del sobre" onClose={() => setPanel(null)} onSave={guardar} saving={saving}>
          <ImageUploadField label="Foto 1 (asoma a la izquierda)" value={form.envelope_foto1} onChange={(path) => set("envelope_foto1", path)} />
          <ImageUploadField label="Foto 2 (asoma a la derecha)" value={form.envelope_foto2} onChange={(path) => set("envelope_foto2", path)} />
          <ImageUploadField label="Sello del sobre" value={form.envelope_sello_img} onChange={(path) => set("envelope_sello_img", path)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
