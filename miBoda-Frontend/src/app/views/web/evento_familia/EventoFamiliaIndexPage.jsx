import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { FamiliaEditor, darkTf } from "../evento/EventoEditors";

export default function EventoFamiliaIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [panel, setPanel] = useState(null); // 'frase' | 'familia'
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});

  const abrirFrase = () => {
    setForm({ frase_texto: data.frase_texto, frase_referencia: data.frase_referencia });
    setPanel("frase");
  };
  const abrirFamilia = () => { setItems(data.familia || []); setPanel("familia"); };

  const guardarFrase = async () => { if (await guardarCampos(form)) setPanel(null); };
  const guardarFamilia = async () => { if (await guardarCampos({ familia: items })) setPanel(null); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Familia" subtitle="Versículo, padres, padrinos y testigos" />

      <CanvasPhone>
        {/* FRASE (aparece justo antes de la sección de familia) */}
        <EditZone className="section section-quote">
          <EzPencil onClick={abrirFrase} tip="Editar versículo" />
          <p className="divider">✦</p>
          <p className="quote-text">{data.frase_texto}</p>
          <p className="quote-ref">— {data.frase_referencia}</p>
          <p className="divider">✦</p>
        </EditZone>

        <EditZone className="section" sx={{ py: 3 }}>
          <EzPencil onClick={abrirFamilia} tip="Editar familia" />
          <div className="familia-card flores-suaves">
            <h2 className="script-title">Con la bendición de Dios</h2>
            <p className="section-sub">y el amor de nuestras familias</p>
            <div className="familia-grid">
              {(data.familia || []).map((g, i) => (
                <div key={i}>
                  <h3>{g.titulo}</h3>
                  {(g.personas || []).map((p, j) => <p key={j}>{p}</p>)}
                </div>
              ))}
            </div>
          </div>
        </EditZone>
      </CanvasPhone>

      {panel === "frase" && (
        <EditPanel open title="Editar versículo" onClose={() => setPanel(null)} onSave={guardarFrase} saving={saving}>
          <TextField {...darkTf} label="Texto" multiline minRows={3} value={form.frase_texto || ""} onChange={(e) => setForm((p) => ({ ...p, frase_texto: e.target.value }))} />
          <TextField {...darkTf} label="Referencia" value={form.frase_referencia || ""} onChange={(e) => setForm((p) => ({ ...p, frase_referencia: e.target.value }))} />
        </EditPanel>
      )}

      {panel === "familia" && (
        <EditPanel open title="Editar familia" onClose={() => setPanel(null)} onSave={guardarFamilia} saving={saving}>
          <FamiliaEditor items={items} onChange={setItems} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
