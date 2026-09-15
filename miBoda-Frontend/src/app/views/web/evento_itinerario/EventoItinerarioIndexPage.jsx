import React, { useState } from "react";
import { Typography } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { ItinerarioEditor, IconPickerField, iconosUsadosPorOtrasSecciones } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/fecha-limite.png";

export default function EventoItinerarioIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [icono, setIcono] = useState("");

  const abrir = () => { setItems(data.itinerario || []); setIcono(data.icono_itinerario || ""); setOpen(true); };
  const guardar = async () => {
    const ok = await guardarCampos({ itinerario: items, icono_itinerario: icono });
    if (ok) setOpen(false);
  };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Itinerario" subtitle="Horarios del día de la boda" />

      <CanvasPhone>
        <EditZone className="section" sx={{ py: 3 }}>
          <EzPencil onClick={abrir} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_itinerario || ICONO_DEFAULT)} alt="" /></p>
          <h2 className="script-title">Itinerario</h2>
          <div className="itinerario-card">
            <div className="itinerario-timeline">
              {(data.itinerario || []).map((it, i) => (
                <div className={`itinerario-row visible ${i % 2 === 0 ? "from-left" : "from-right"}`} key={i}>
                  <span className="itinerario-node">{it.imagen && <img src={publicAsset(it.imagen)} alt="" />}</span>
                  <div className="itinerario-content">
                    <div className="itinerario-hora">{it.hora}</div>
                    <div className="itinerario-titulo">{it.titulo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar itinerario" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={icono} onChange={setIcono} excluir={iconosUsadosPorOtrasSecciones(data, "icono_itinerario")} />
          <ItinerarioEditor items={items} onChange={setItems} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
