import React, { useState } from "react";
import { Typography } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { HistoriaEditor } from "../evento/EventoEditors";

const isIconImage = (v) =>
  !!v && (/^https?:\/\//i.test(v) || v.startsWith("storage_/") || /\.(png|jpe?g|gif|svg|webp)$/i.test(v));

export default function EventoHistoriaIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const abrir = () => { setItems(data.historia || []); setOpen(true); };
  const guardar = async () => { if (await guardarCampos({ historia: items })) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Nuestra Historia" subtitle="Línea de tiempo de la pareja" />

      <CanvasPhone>
        <EditZone className="section has-flowers" sx={{ py: 3 }}>
          <EzPencil onClick={abrir} />
          <p className="divider">💕</p>
          <h2 className="script-title">Nuestra Historia</h2>
          <div className="historia-timeline">
            {(data.historia || []).map((h, i) => (
              <div className="historia-row" key={i}>
                <span className="historia-node">
                  {isIconImage(h.icono) ? <img className="historia-node-img" src={publicAsset(h.icono)} alt="" /> : h.icono}
                </span>
                <div className="historia-card">
                  <div className="historia-photo-wrap">
                    {h.imagen && <img className="historia-photo" src={publicAsset(h.imagen)} alt={h.titulo} />}
                    <span className="historia-badge">{h.fecha}</span>
                  </div>
                  <div className="historia-body">
                    <h3>{h.titulo}</h3>
                    <p>{h.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="historia-final">✨ Y la historia continúa... ✨</p>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar nuestra historia" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <HistoriaEditor items={items} onChange={setItems} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
