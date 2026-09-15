import React, { useState } from "react";
import { Typography } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { UbicacionesEditor, IconPickerField, iconosUsadosPorOtrasSecciones } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/mapa.png";

const isIconImage = (v) =>
  !!v && (/^https?:\/\//i.test(v) || v.startsWith("storage_/") || /\.(png|jpe?g|gif|svg|webp)$/i.test(v));

export default function EventoUbicacionesIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [icono, setIcono] = useState("");

  const abrir = () => { setItems(data.ubicaciones || []); setIcono(data.icono_ubicaciones || ""); setOpen(true); };
  const guardar = async () => {
    const ok = await guardarCampos({ ubicaciones: items, icono_ubicaciones: icono });
    if (ok) setOpen(false);
  };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Ubicaciones" subtitle="Ceremonia civil, recepción y demás lugares" />

      <CanvasPhone>
        <EditZone className="section has-flowers" sx={{ py: 3 }}>
          <EzPencil onClick={abrir} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_ubicaciones || ICONO_DEFAULT)} alt="" /></p>
          <h2 className="script-title">¿Dónde Será?</h2>
          <div className="cards-grid">
            {(data.ubicaciones || []).map((u, i) => (
              <div className="card" key={i}>
                {u.imagen && <img className="card-img" src={publicAsset(u.imagen)} alt={u.tipo} />}
                <div className="card-body">
                  {u.icono && (
                    <div className="card-icon">
                      {isIconImage(u.icono) ? <img src={publicAsset(u.icono)} alt="" /> : u.icono}
                    </div>
                  )}
                  <h3>{u.tipo}</h3>
                  <p><strong>{u.lugar}</strong></p>
                  <p>{u.horario}</p>
                  <p>{u.direccion}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="closing-phrase">¡Esperamos verte ahí!</p>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar ubicaciones" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={icono} onChange={setIcono} excluir={iconosUsadosPorOtrasSecciones(data, "icono_ubicaciones")} />
          <UbicacionesEditor items={items} onChange={setItems} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
