import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, IconPickerField } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/calendario.png";

export default function EventoCountdownIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => {
    setForm({
      fecha_boda: data.fecha_boda,
      fecha_boda_texto: data.fecha_boda_texto,
      countdown_nota_1: data.countdown_nota_1,
      countdown_nota_2: data.countdown_nota_2,
      icono_countdown: data.icono_countdown,
    });
    setOpen(true);
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  const fecha = data.fecha_boda ? new Date(data.fecha_boda) : null;
  const mes = fecha ? fecha.toLocaleDateString("es-PE", { month: "long", year: "numeric" }) : "";
  const dia = fecha ? fecha.getDate() : null;

  return (
    <PageWrap>
      <ModuleHeader title="Cuenta Regresiva" subtitle="Fecha de la boda y el mensaje que acompaña al contador" />

      <CanvasPhone>
        <EditZone className="section section-dark countdown-section" sx={{ py: 4 }}>
          <EzPencil onClick={abrir} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_countdown || ICONO_DEFAULT)} alt="" /></p>
          <h2 className="script-title">Faltan</h2>
          <div className="mini-calendario" style={{ maxWidth: 220, margin: "0 auto" }}>
            <p className="mini-calendario-mes" style={{ textTransform: "uppercase" }}>{mes}</p>
            <p style={{ fontSize: "0.75rem", opacity: 0.8 }}>Día {dia}</p>
          </div>
          <div className="countdown" style={{ display: "flex", justifyContent: "center", gap: "1.2rem", margin: "1.2rem 0" }}>
            {["Días", "Hrs", "Min", "Seg"].map((label) => (
              <div className="countdown-item" key={label}>
                <span className="countdown-number">00</span>
                <span className="countdown-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="section-sub">para nuestro gran día</p>
          <div className="countdown-nota">
            <p>{data.countdown_nota_1}</p>
            <p>{data.countdown_nota_2}</p>
          </div>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar cuenta regresiva" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={form.icono_countdown} onChange={(path) => set("icono_countdown", path)} />
          <TextField {...darkTf} type="datetime-local" label="Fecha y hora de la boda" InputLabelProps={{ shrink: true }}
            value={form.fecha_boda ? form.fecha_boda.replace(" ", "T").slice(0, 16) : ""} onChange={(e) => set("fecha_boda", e.target.value)} />
          <TextField {...darkTf} label="Fecha en texto" value={form.fecha_boda_texto || ""} onChange={(e) => set("fecha_boda_texto", e.target.value)} />
          <TextField {...darkTf} label="Primer mensaje" multiline minRows={2} value={form.countdown_nota_1 || ""} onChange={(e) => set("countdown_nota_1", e.target.value)} />
          <TextField {...darkTf} label="Segundo mensaje" multiline minRows={2} value={form.countdown_nota_2 || ""} onChange={(e) => set("countdown_nota_2", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
