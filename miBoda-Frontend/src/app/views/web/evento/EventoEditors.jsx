import React, { useState } from "react";
import { Box, TextField, Button, IconButton, Grid, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/CloudUpload";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import { subirImagen, subirAudio } from "../../../api/web_evento.api";
import { publicAsset } from "./useInjectPublicCss";
import { handleErrorMessages } from "../../../components/notify-messages";

// ─── Estilos compartidos por los editores de listas dentro del panel CMS ────
export const ItemCard = styled(Box)(() => ({
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  padding: "14px",
  marginBottom: "12px",
  background: "rgba(255,255,255,0.04)",
  position: "relative",
}));

export const RemoveBtn = styled(IconButton)(() => ({
  position: "absolute",
  top: 6,
  right: 6,
  width: 26,
  height: 26,
  color: "#ef4444",
  "&:hover": { background: "rgba(239,68,68,0.15)" },
}));

export const darkTf = {
  size: "small",
  fullWidth: true,
  sx: {
    mb: 1.2,
    "& .MuiInputBase-root": { color: "#f1f5f9" },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.55)" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.18)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(204,107,142,0.5)" },
  },
};

// ─── SUBIR IMAGEN (archivo) ───────────────────────────────────────────────────
export function ImageUploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await subirImagen(file);
      onChange(res.path);
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ mb: 1.6 }}>
      {label && <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", mb: 0.6 }}>{label}</Typography>}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: "8px", overflow: "hidden", flexShrink: 0,
          border: "1px solid rgba(255,255,255,0.15)", bgcolor: "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {value ? <img src={publicAsset(value)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        </Box>
        <Button
          component="label" size="small" variant="outlined" disabled={uploading}
          startIcon={uploading ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)", fontSize: "0.72rem" }}
        >
          {uploading ? "Subiendo..." : "Cambiar foto"}
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </Button>
      </Box>
    </Box>
  );
}

// ─── SUBIR CANCIÓN (archivo de audio) ─────────────────────────────────────────
export function AudioUploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await subirAudio(file);
      onChange(res.path);
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ mb: 1.6 }}>
      {label && <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", mb: 0.6 }}>{label}</Typography>}
      {value && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <AudiotrackIcon sx={{ fontSize: 18, color: "#f5c6d8" }} />
          <audio controls src={publicAsset(value)} style={{ height: 32, flex: 1, minWidth: 0 }} />
        </Box>
      )}
      <Button
        component="label" size="small" variant="outlined" disabled={uploading}
        startIcon={uploading ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
        sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)", fontSize: "0.72rem" }}
      >
        {uploading ? "Subiendo..." : value ? "Cambiar canción" : "Subir canción"}
        <input type="file" accept="audio/*" hidden onChange={handleFile} />
      </Button>
    </Box>
  );
}

// ─── SELECCIONAR ÍCONO (galería propia + subir + pegar link) ─────────────────
const ICONOS_PRESET_PATH = "assets/img/decor/icon-invitacion/";
const ICONOS_PRESET = [
  "amor.png", "calendario.png", "camisa.png", "caja-de-regalo.png",
  "camara-reflex-digital.png", "fecha-limite.png", "guitarra.png", "mapa.png",
  "papiro.png", "silla-de-director.png",
];

// Los 10 campos "icono_*" de web_evento (uno por sección) — se usan para que
// cada selector oculte los íconos que otra sección ya tiene asignados, y así
// la galería de "elige un ícono" no se llene de opciones ya ocupadas.
const CAMPOS_ICONO_SECCION = [
  "icono_countdown", "icono_ubicaciones", "icono_itinerario", "icono_vestimenta",
  "icono_rsvp", "icono_regalos", "icono_video", "icono_galeria", "icono_cancion", "icono_historia",
];

/** Íconos que YA usan las demás secciones (para excluirlos del selector de `campoActual`). */
export function iconosUsadosPorOtrasSecciones(data, campoActual) {
  if (!data) return [];
  return CAMPOS_ICONO_SECCION
    .filter((campo) => campo !== campoActual)
    .map((campo) => data[campo])
    .filter(Boolean);
}

export function IconPickerField({ label, value, onChange, excluir = [] }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await subirImagen(file);
      onChange(res.path);
    } catch (err) {
      handleErrorMessages("Error", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const usarUrl = () => {
    const v = urlInput.trim();
    if (!v) return;
    onChange(v);
    setUrlInput("");
  };

  return (
    <Box sx={{ mb: 1.6 }}>
      {label && <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", mb: 0.6 }}>{label}</Typography>}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: "8px", overflow: "hidden", flexShrink: 0,
          border: "1px solid rgba(255,255,255,0.15)", bgcolor: "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {value ? <img src={publicAsset(value)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        </Box>
        <Button
          component="label" size="small" variant="outlined" disabled={uploading}
          startIcon={uploading ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)", fontSize: "0.72rem" }}
        >
          {uploading ? "Subiendo..." : "Subir mi imagen"}
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </Button>
      </Box>

      <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mb: 0.6 }}>O elige un ícono:</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1.2 }}>
        {ICONOS_PRESET.filter((file) => !excluir.includes(ICONOS_PRESET_PATH + file)).map((file) => {
          const path = ICONOS_PRESET_PATH + file;
          const selected = value === path;
          return (
            <Box
              key={file}
              onClick={() => onChange(path)}
              title={file.replace(".png", "")}
              sx={{
                width: 38, height: 38, borderRadius: "8px", cursor: "pointer", p: "6px",
                border: selected ? "2px solid #f5c6d8" : "1px solid rgba(255,255,255,0.15)",
                bgcolor: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center",
                "&:hover": { borderColor: "rgba(204,107,142,0.6)" },
              }}
            >
              <img src={publicAsset(path)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", gap: 0.8, alignItems: "flex-start" }}>
        <TextField
          {...darkTf}
          sx={{ ...darkTf.sx, mb: 0 }}
          placeholder="O pega aquí el link de una imagen de ícono"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); usarUrl(); } }}
        />
        <Button size="small" onClick={usarUrl} sx={{ textTransform: "none", fontSize: "0.68rem", color: "#f5c6d8", flexShrink: 0, mt: 0.3 }}>Usar</Button>
      </Box>
      <Button
        size="small" component="a" href="https://www.flaticon.com/search?word=boda" target="_blank" rel="noopener noreferrer"
        sx={{ textTransform: "none", fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", mt: 0.3, p: 0, minWidth: 0, "&:hover": { background: "none", color: "#f5c6d8" } }}
      >
        Buscar más íconos →
      </Button>
    </Box>
  );
}

// ─── FAMILIA ─────────────────────────────────────────────────────────────────
export function FamiliaEditor({ items, onChange }) {
  const update = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };
  const updatePersona = (i, j, value) => {
    const copy = [...items];
    const personas = [...(copy[i].personas || [])];
    personas[j] = value;
    copy[i] = { ...copy[i], personas };
    onChange(copy);
  };
  const addPersona = (i) => {
    const copy = [...items];
    copy[i] = { ...copy[i], personas: [...(copy[i].personas || []), ""] };
    onChange(copy);
  };
  const removePersona = (i, j) => {
    const copy = [...items];
    copy[i] = { ...copy[i], personas: copy[i].personas.filter((_, idx) => idx !== j) };
    onChange(copy);
  };
  const addGrupo = () => onChange([...items, { titulo: "", personas: [""] }]);
  const removeGrupo = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((grupo, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => removeGrupo(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <TextField {...darkTf} label="Título del grupo" value={grupo.titulo || ""} onChange={(e) => update(i, "titulo", e.target.value)} sx={{ ...darkTf.sx, pr: 4 }} />
          {(grupo.personas || []).map((p, j) => (
            <Box key={j} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField {...darkTf} sx={{ ...darkTf.sx, mb: 0 }} value={p} onChange={(e) => updatePersona(i, j, e.target.value)} placeholder="Nombre" />
              <IconButton size="small" onClick={() => removePersona(i, j)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => addPersona(i)} sx={{ textTransform: "none", fontSize: "0.72rem", color: "#f5c6d8" }}>Agregar persona</Button>
        </ItemCard>
      ))}
      <Button startIcon={<AddIcon />} onClick={addGrupo} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar grupo</Button>
    </>
  );
}

// ─── UBICACIONES ─────────────────────────────────────────────────────────────
export function UbicacionesEditor({ items, onChange }) {
  const update = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };
  const add = () => onChange([...items, { icono: ICONOS_PRESET_PATH + "mapa.png", imagen: "", tipo: "", lugar: "", horario: "", direccion: "", mapsUrl: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((u, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => remove(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <Grid container spacing={1}>
            <Grid item xs={12}><IconPickerField label="Ícono" value={u.icono} onChange={(path) => update(i, "icono", path)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Tipo" value={u.tipo || ""} onChange={(e) => update(i, "tipo", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Lugar" value={u.lugar || ""} onChange={(e) => update(i, "lugar", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Horario" value={u.horario || ""} onChange={(e) => update(i, "horario", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Dirección" value={u.direccion || ""} onChange={(e) => update(i, "direccion", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Link de Google Maps" value={u.mapsUrl || ""} onChange={(e) => update(i, "mapsUrl", e.target.value)} /></Grid>
            <Grid item xs={12}><ImageUploadField label="Foto" value={u.imagen} onChange={(path) => update(i, "imagen", path)} /></Grid>
          </Grid>
        </ItemCard>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar ubicación</Button>
    </>
  );
}

// ─── ITINERARIO ───────────────────────────────────────────────────────────────
export function ItinerarioEditor({ items, onChange }) {
  const update = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };
  const add = () => onChange([...items, { hora: "", titulo: "", imagen: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((it, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => remove(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <Grid container spacing={1}>
            <Grid item xs={6}><TextField {...darkTf} label="Hora" value={it.hora || ""} onChange={(e) => update(i, "hora", e.target.value)} /></Grid>
            <Grid item xs={6}><TextField {...darkTf} label="Título" value={it.titulo || ""} onChange={(e) => update(i, "titulo", e.target.value)} /></Grid>
            <Grid item xs={12}><IconPickerField label="Ícono/imagen" value={it.imagen} onChange={(path) => update(i, "imagen", path)} /></Grid>
          </Grid>
        </ItemCard>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar evento</Button>
    </>
  );
}

// ─── HISTORIA ─────────────────────────────────────────────────────────────────
export function HistoriaEditor({ items, onChange }) {
  const update = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };
  const add = () => onChange([...items, { fecha: "", titulo: "", descripcion: "", icono: "💫", imagen: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((h, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => remove(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <IconPickerField label="Ícono" value={h.icono} onChange={(path) => update(i, "icono", path)} />
            </Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Fecha" value={h.fecha || ""} onChange={(e) => update(i, "fecha", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Título" value={h.titulo || ""} onChange={(e) => update(i, "titulo", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Descripción" multiline minRows={2} value={h.descripcion || ""} onChange={(e) => update(i, "descripcion", e.target.value)} /></Grid>
            <Grid item xs={12}><ImageUploadField label="Foto" value={h.imagen} onChange={(path) => update(i, "imagen", path)} /></Grid>
          </Grid>
        </ItemCard>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar momento</Button>
    </>
  );
}

// ─── TRANSFERENCIAS ───────────────────────────────────────────────────────────
export function TransferenciasEditor({ items, onChange }) {
  const update = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };
  const add = () => onChange([...items, { banco: "", titular: "", cuenta: "", cci: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((t, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => remove(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <Grid container spacing={1}>
            <Grid item xs={12}><TextField {...darkTf} label="Banco" value={t.banco || ""} onChange={(e) => update(i, "banco", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Titular" value={t.titular || ""} onChange={(e) => update(i, "titular", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="N° de cuenta" value={t.cuenta || ""} onChange={(e) => update(i, "cuenta", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="CCI" value={t.cci || ""} onChange={(e) => update(i, "cci", e.target.value)} /></Grid>
          </Grid>
        </ItemCard>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar cuenta</Button>
    </>
  );
}

// ─── YAPE / PLIN ──────────────────────────────────────────────────────────────
export function YapePlinEditor({ items, onChange }) {
  const update = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };
  const add = () => onChange([...items, { app: "Yape", nombre: "", numero: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((y, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => remove(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <Grid container spacing={1}>
            <Grid item xs={4}><TextField {...darkTf} label="App" value={y.app || ""} onChange={(e) => update(i, "app", e.target.value)} /></Grid>
            <Grid item xs={8}><TextField {...darkTf} label="Nombre" value={y.nombre || ""} onChange={(e) => update(i, "nombre", e.target.value)} /></Grid>
            <Grid item xs={12}><TextField {...darkTf} label="Número" value={y.numero || ""} onChange={(e) => update(i, "numero", e.target.value)} /></Grid>
          </Grid>
        </ItemCard>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar</Button>
    </>
  );
}

// ─── COLORES (vestimenta) ─────────────────────────────────────────────────────
export function ColoresEditor({ items, onChange }) {
  const update = (i, value) => {
    const copy = [...items];
    copy[i] = value;
    onChange(copy);
  };
  const add = () => onChange([...items, "#C57B57"]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {items.map((c, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5, border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", p: 1 }}>
          <input type="color" value={c || "#C57B57"} onChange={(e) => update(i, e.target.value)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer" }} />
          <TextField size="small" value={c || ""} onChange={(e) => update(i, e.target.value)} sx={{ width: 90, ...darkTf.sx, mb: 0 }} />
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)", height: 44 }}>Agregar color</Button>
    </Box>
  );
}

// ─── GÉNEROS MUSICALES (canción) ──────────────────────────────────────────────
export function GenerosEditor({ items, onChange }) {
  const update = (i, value) => {
    const copy = [...items];
    copy[i] = value;
    onChange(copy);
  };
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <Box>
      {items.map((g, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField {...darkTf} sx={{ ...darkTf.sx, mb: 0 }} value={g} onChange={(e) => update(i, e.target.value)} placeholder="Ej: Reggaetón" />
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={add} variant="outlined" size="small" sx={{ textTransform: "none", color: "#f5c6d8", borderColor: "rgba(204,107,142,0.4)" }}>Agregar género</Button>
    </Box>
  );
}
