import React, { useState } from "react";
import { Typography, TextField, FormControlLabel, Switch } from "@mui/material";
import useInjectPublicCss from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { TransferenciasEditor, YapePlinEditor, darkTf } from "../evento/EventoEditors";

export default function EventoRegalosIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [panel, setPanel] = useState(null); // 'config' | 'transferencias' | 'yapeplin'
  const [form, setForm] = useState({});
  const [transferencias, setTransferencias] = useState([]);
  const [yapePlin, setYapePlin] = useState([]);

  const abrirConfig = () => {
    setForm({
      regalos_sobre_activo: data.regalos_sobre_activo,
      regalos_tienda_nombre: data.regalos_tienda_nombre,
      regalos_tienda_url: data.regalos_tienda_url,
      regalos_direccion_fisica: data.regalos_direccion_fisica,
    });
    setPanel("config");
  };
  const abrirTransferencias = () => { setTransferencias(data.regalos_transferencias || []); setPanel("transferencias"); };
  const abrirYapePlin = () => { setYapePlin(data.regalos_yape_plin || []); setPanel("yapeplin"); };

  const guardarConfig = async () => { if (await guardarCampos(form)) setPanel(null); };
  const guardarTransferencias = async () => { if (await guardarCampos({ regalos_transferencias: transferencias })) setPanel(null); };
  const guardarYapePlin = async () => { if (await guardarCampos({ regalos_yape_plin: yapePlin })) setPanel(null); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Mesa de Regalos" subtitle="Transferencias, Yape/Plin, sobre y regalos físicos" />

      <CanvasPhone>
        <div className="section has-flowers" style={{ padding: "20px 0" }}>
          <p className="divider">🎁</p>
          <h2 className="script-title">Mesa de Regalos</h2>
          <div className="regalos-grid">
            {data.regalos_sobre_activo ? (
              <EditZone className="regalo-card" onClick={abrirConfig}>
                <EzPencil onClick={abrirConfig} />
                <h3>Sobre</h3>
                <p>Habrá una caja de sobres en la recepción para tu obsequio.</p>
              </EditZone>
            ) : null}

            <EditZone className="regalo-card">
              <EzPencil onClick={abrirTransferencias} />
              <h3>Transferencia</h3>
              {(data.regalos_transferencias || []).map((t, i) => (
                <div key={i} style={{ marginTop: i > 0 ? 10 : 0 }}>
                  <p><strong>{t.banco}</strong> — {t.titular}</p>
                  <div className="regalo-dato"><span>Cuenta: <code>{t.cuenta}</code></span></div>
                  <div className="regalo-dato"><span>CCI: <code>{t.cci}</code></span></div>
                </div>
              ))}
            </EditZone>

            <EditZone className="regalo-card">
              <EzPencil onClick={abrirYapePlin} />
              <h3>Yape / Plin</h3>
              {(data.regalos_yape_plin || []).map((y, i) => (
                <div key={i} style={{ marginTop: i > 0 ? 10 : 0 }}>
                  <p><strong>{y.app}</strong> — {y.nombre}</p>
                  <div className="regalo-dato"><span>Número: <code>{y.numero}</code></span></div>
                </div>
              ))}
            </EditZone>

            {data.regalos_direccion_fisica ? (
              <EditZone className="regalo-card">
                <EzPencil onClick={abrirConfig} />
                <h3>Regalos Físicos</h3>
                <p>Puedes enviar tu regalo a:</p>
                <p><strong>{data.regalos_direccion_fisica}</strong></p>
              </EditZone>
            ) : null}
          </div>
        </div>
      </CanvasPhone>

      {panel === "config" && (
        <EditPanel open title="Editar configuración de regalos" onClose={() => setPanel(null)} onSave={guardarConfig} saving={saving}>
          <FormControlLabel
            sx={{ color: "#f1f5f9", mb: 1 }}
            control={<Switch checked={!!form.regalos_sobre_activo} onChange={(e) => setForm((p) => ({ ...p, regalos_sobre_activo: e.target.checked }))} />}
            label="Mostrar tarjeta de 'Sobre'"
          />
          <TextField {...darkTf} label="Nombre tienda de regalos (opcional)" value={form.regalos_tienda_nombre || ""} onChange={(e) => setForm((p) => ({ ...p, regalos_tienda_nombre: e.target.value }))} />
          <TextField {...darkTf} label="Link tienda de regalos (opcional)" value={form.regalos_tienda_url || ""} onChange={(e) => setForm((p) => ({ ...p, regalos_tienda_url: e.target.value }))} />
          <TextField {...darkTf} label="Dirección física para regalos" value={form.regalos_direccion_fisica || ""} onChange={(e) => setForm((p) => ({ ...p, regalos_direccion_fisica: e.target.value }))} />
        </EditPanel>
      )}

      {panel === "transferencias" && (
        <EditPanel open title="Editar transferencias" onClose={() => setPanel(null)} onSave={guardarTransferencias} saving={saving}>
          <TransferenciasEditor items={transferencias} onChange={setTransferencias} />
        </EditPanel>
      )}

      {panel === "yapeplin" && (
        <EditPanel open title="Editar Yape / Plin" onClose={() => setPanel(null)} onSave={guardarYapePlin} saving={saving}>
          <YapePlinEditor items={yapePlin} onChange={setYapePlin} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
