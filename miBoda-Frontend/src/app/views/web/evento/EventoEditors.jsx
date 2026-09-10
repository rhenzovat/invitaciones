import React, { useState } from "react";
import { Box, TextField, Button, IconButton, Grid, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/CloudUpload";
import { subirImagen } from "../../../api/web_evento.api";
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
  const add = () => onChange([...items, { icono: "📍", imagen: "", tipo: "", lugar: "", horario: "", direccion: "", mapsUrl: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <>
      {items.map((u, i) => (
        <ItemCard key={i}>
          <RemoveBtn size="small" onClick={() => remove(i)}><DeleteIcon sx={{ fontSize: 14 }} /></RemoveBtn>
          <Grid container spacing={1}>
            <Grid item xs={3}><TextField {...darkTf} label="Ícono" value={u.icono || ""} onChange={(e) => update(i, "icono", e.target.value)} /></Grid>
            <Grid item xs={9}><TextField {...darkTf} label="Tipo" value={u.tipo || ""} onChange={(e) => update(i, "tipo", e.target.value)} /></Grid>
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
            <Grid item xs={12}><ImageUploadField label="Ícono/imagen" value={it.imagen} onChange={(path) => update(i, "imagen", path)} /></Grid>
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
              <ImageUploadField label="Ícono (sube un PNG/SVG, ej. de Flaticon)" value={h.icono} onChange={(path) => update(i, "icono", path)} />
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
