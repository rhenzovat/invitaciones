import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, IconPickerField, iconosUsadosPorOtrasSecciones } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/papiro.png";

export default function EventoRsvpIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => {
    setForm({
      rsvp_fecha_limite: data.rsvp_fecha_limite,
      rsvp_contacto_nombre: data.rsvp_contacto_nombre,
      rsvp_contacto_whatsapp: data.rsvp_contacto_whatsapp,
      capacidad_maxima: data.capacidad_maxima,
      icono_rsvp: data.icono_rsvp,
    });
    setOpen(true);
  };
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Confirmación de Asistencia (RSVP)" subtitle="Fecha límite y contacto — las respuestas de invitados están en su propia bandeja" />

      <CanvasPhone>
        <EditZone className="section section-terracota has-flowers" sx={{ py: 3 }}>
          <EzPencil onClick={abrir} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_rsvp || ICONO_DEFAULT)} alt="" /></p>
          <h2 className="script-title">Confirma tu Asistencia</h2>
          <p className="rsvp-limite">Por favor, confirma tu asistencia antes del <strong>{data.rsvp_fecha_limite}</strong></p>
          <button type="button" className="btn-primary">Confirmar Asistencia</button>
          <p className="rsvp-contacto">Cualquier consulta o duda con<br />
            <strong>{data.rsvp_contacto_nombre}</strong> · WhatsApp
          </p>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar RSVP" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={form.icono_rsvp} onChange={(path) => setForm((p) => ({ ...p, icono_rsvp: path }))} excluir={iconosUsadosPorOtrasSecciones(data, "icono_rsvp")} />
          <TextField {...darkTf} label="Fecha límite (texto)" value={form.rsvp_fecha_limite || ""} onChange={(e) => setForm((p) => ({ ...p, rsvp_fecha_limite: e.target.value }))} />
          <TextField {...darkTf} label="Nombre de contacto" value={form.rsvp_contacto_nombre || ""} onChange={(e) => setForm((p) => ({ ...p, rsvp_contacto_nombre: e.target.value }))} />
          <TextField {...darkTf} label="WhatsApp (solo números, con código de país)" value={form.rsvp_contacto_whatsapp || ""} onChange={(e) => setForm((p) => ({ ...p, rsvp_contacto_whatsapp: e.target.value }))} />
          <TextField {...darkTf} type="number" label="Aforo máximo (total de personas)" inputProps={{ min: 1 }} value={form.capacidad_maxima ?? 100} onChange={(e) => setForm((p) => ({ ...p, capacidad_maxima: parseInt(e.target.value || "100", 10) }))} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
