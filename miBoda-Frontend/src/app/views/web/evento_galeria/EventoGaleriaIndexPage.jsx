import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { PageWrap, ModuleHeader, CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, IconPickerField } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/camara-reflex-digital.png";

export default function EventoGaleriaIndexPage() {
  useInjectPublicCss();
  const { data, loading, saving, guardarCampos } = useEventoData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const abrir = () => {
    setForm({
      galeria_texto: data.galeria_texto,
      galeria_nota: data.galeria_nota,
      galeria_boton_subir: data.galeria_boton_subir,
      galeria_boton_ver: data.galeria_boton_ver,
      icono_galeria: data.icono_galeria,
    });
    setOpen(true);
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardar = async () => { if (await guardarCampos(form)) setOpen(false); };

  if (loading || !data) return <PageWrap><Typography sx={{ color: "#7a4030" }}>Cargando...</Typography></PageWrap>;

  return (
    <PageWrap>
      <ModuleHeader title="Galería" subtitle="Texto y botones de la sección de Galería de Fotos" />

      <CanvasPhone>
        <EditZone className="section has-flowers">
          <EzPencil onClick={abrir} />
          <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_galeria || ICONO_DEFAULT)} alt="" /></p>
          <div className="galeria-title-row">
            <h2 className="script-title">Galería de Fotos</h2>
            <span className="btn-icon-camera btn-icon-camera-float">
              <img src={publicAsset(data.icono_galeria || ICONO_DEFAULT)} alt="" />
            </span>
          </div>
          <p className="section-sub">{data.galeria_texto}</p>
          <div className="galeria-actions">
            <button type="button" className="btn-secondary">{data.galeria_boton_subir}</button>
            <span className="btn-secondary">{data.galeria_boton_ver}</span>
          </div>
          <p className="galeria-note">{data.galeria_nota}</p>
        </EditZone>
      </CanvasPhone>

      {open && (
        <EditPanel open title="Editar galería" onClose={() => setOpen(false)} onSave={guardar} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={form.icono_galeria} onChange={(path) => set("icono_galeria", path)} />
          <TextField {...darkTf} label="Texto (subtítulo)" multiline minRows={2} value={form.galeria_texto || ""} onChange={(e) => set("galeria_texto", e.target.value)} />
          <TextField {...darkTf} label="Botón: Subir foto" value={form.galeria_boton_subir || ""} onChange={(e) => set("galeria_boton_subir", e.target.value)} />
          <TextField {...darkTf} label="Botón: Ver galería" value={form.galeria_boton_ver || ""} onChange={(e) => set("galeria_boton_ver", e.target.value)} />
          <TextField {...darkTf} label="Nota" value={form.galeria_nota || ""} onChange={(e) => set("galeria_nota", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
