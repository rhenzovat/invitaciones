import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { ColoresEditor, darkTf, ImageUploadField, IconPickerField, iconosUsadosPorOtrasSecciones } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/camisa.png";

export default function EventoVestimentaIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [panel, setPanel] = useState(null); // 'texto' | 'colores' | 'imagenes'
  const [form, setForm] = useState({});
  const [colores, setColores] = useState([]);

  const abrirTexto = () => { setForm({ vestimenta_tipo: data.vestimenta_tipo, vestimenta_restriccion: data.vestimenta_restriccion, icono_vestimenta: data.icono_vestimenta }); setPanel("texto"); };
  const abrirColores = () => { setColores(data.vestimenta_colores || []); setPanel("colores"); };
  const abrirImagenes = () => { setForm({ vestimenta_img_novia: data.vestimenta_img_novia, vestimenta_img_novio: data.vestimenta_img_novio }); setPanel("imagenes"); };

  const guardarTexto = async () => { if (await guardarCampos(form)) setPanel(null); };
  const guardarColores = async () => { if (await guardarCampos({ vestimenta_colores: colores })) setPanel(null); };
  const guardarImagenes = async () => { if (await guardarCampos(form)) setPanel(null); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Código de Vestimenta" subtitle="Tipo de vestimenta y colores recomendados" />

      <CanvasPhone>
        <EditZone className="section has-flowers" sx={{ py: 3 }}>
          <EzPencil onClick={abrirTexto} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_vestimenta || ICONO_DEFAULT)} alt="" /></p>
          <h2 className="script-title">Código de Vestimenta</h2>
          <p className="vestimenta-label">Vestimenta</p>
          <p className="vestimenta-tipo">{data.vestimenta_tipo}</p>
          <p className="vestimenta-restriccion">{data.vestimenta_restriccion}</p>
        </EditZone>
        <EditZone sx={{ pb: 2, textAlign: "center" }}>
          <EzPencil onClick={abrirColores} tip="Editar colores" />
          <p className="vestimenta-colores-titulo">Se recomienda usar estos colores en la boda</p>
          <div className="vestimenta-colores">
            {(data.vestimenta_colores || []).map((c, i) => (
              <span key={i} className="color-swatch" style={{ background: c }}></span>
            ))}
          </div>
        </EditZone>
        <EditZone className="vestimenta-illustration" sx={{ pb: 3, textAlign: "center" }}>
          <EzPencil onClick={abrirImagenes} tip="Editar ilustraciones" />
          {data.vestimenta_img_novia && <img src={publicAsset(data.vestimenta_img_novia)} alt="Vestido de la novia" className="vestimenta-img" />}
          {data.vestimenta_img_novio && <img src={publicAsset(data.vestimenta_img_novio)} alt="Traje del novio" className="vestimenta-img" />}
        </EditZone>
      </CanvasPhone>

      {panel === "texto" && (
        <EditPanel open title="Editar vestimenta" onClose={() => setPanel(null)} onSave={guardarTexto} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={form.icono_vestimenta} onChange={(path) => setForm((p) => ({ ...p, icono_vestimenta: path }))} excluir={iconosUsadosPorOtrasSecciones(data, "icono_vestimenta")} />
          <TextField {...darkTf} label="Tipo (ej: Formal)" value={form.vestimenta_tipo || ""} onChange={(e) => setForm((p) => ({ ...p, vestimenta_tipo: e.target.value }))} />
          <TextField {...darkTf} label="Restricción" value={form.vestimenta_restriccion || ""} onChange={(e) => setForm((p) => ({ ...p, vestimenta_restriccion: e.target.value }))} />
        </EditPanel>
      )}

      {panel === "colores" && (
        <EditPanel open title="Editar colores recomendados" onClose={() => setPanel(null)} onSave={guardarColores} saving={saving}>
          <ColoresEditor items={colores} onChange={setColores} />
        </EditPanel>
      )}

      {panel === "imagenes" && (
        <EditPanel open title="Editar ilustraciones" onClose={() => setPanel(null)} onSave={guardarImagenes} saving={saving}>
          <ImageUploadField label="Ilustración vestido (novia)" value={form.vestimenta_img_novia} onChange={(path) => setForm((p) => ({ ...p, vestimenta_img_novia: path }))} />
          <ImageUploadField label="Ilustración traje (novio)" value={form.vestimenta_img_novio} onChange={(path) => setForm((p) => ({ ...p, vestimenta_img_novio: path }))} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
