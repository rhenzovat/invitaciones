import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Box, Typography, Button, IconButton, TextField,
  CircularProgress, Stack, Divider, Tooltip, Switch,
} from "@mui/material";
import EditIcon          from "@mui/icons-material/Edit";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import AddIcon           from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraIcon   from "@mui/icons-material/PhotoCamera";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ContactMailIcon   from "@mui/icons-material/ContactMail";
import WhatsAppIcon      from "@mui/icons-material/WhatsApp";
import OpenInNewIcon     from "@mui/icons-material/OpenInNew";
import LocationOnIcon    from "@mui/icons-material/LocationOn";
import LockOutlinedIcon  from "@mui/icons-material/LockOutlined";

import {
  obtener, actualizar, crear_columna, actualizar_columna, eliminar_columna,
} from "../../../api/web_pagina_contacto.api";
import {
  obtener as obtenerLanding, actualizar as actualizarLanding,
} from "../../../api/web_contacto_landing.api";
import { toastSuccess, toastError, handleErrorMessages } from "../../../components/notify-messages";
import { authJWTConfig } from "app/authJWTConfig";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";

const BASE = (authJWTConfig.domain || "").replace(/\/$/, "") + "/";

/* ── Paleta Amour "Dark Passion" (igual que la web pública /contacto) ── */
const AM = {
  bgDeep:     "#12070a",
  bgMid:      "#2a0f16",
  bgWarm:     "#33141a",
  card:       "#2a0f16",
  cardAlt:    "#33141a",
  cardBorder: "rgba(217,165,107,.28)",
  gold:       "#d9a56b",
  goldLight:  "#f5d39d",
  goldBtn:    "#aa8432",
  text:       "#f5e6e2",
  textMuted:  "#d3b3ae",
  accent:     "#fca9a9",
};
const ACCENT = AM.gold;
const PANEL_W = 300;

/* ── Resolver imagen ── */
const resolveImg = (path, preview) => {
  if (preview) return preview;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE}${path}`;
};

/** Parse horario_dias: JSON del CMS, texto legacy o horario_linea1/2 */
function parseHorarioRows(form = {}) {
  const raw = form.horario_dias;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* legacy */ }
    if (typeof raw === "string" && raw.includes(":")) {
      return raw.split("|").map((part) => {
        const partTrim = part.trim();
        if (!partTrim) return null;
        const idx = partTrim.indexOf(":");
        if (idx === -1) return { dia: partTrim, hora: "", rosa: false };
        return {
          dia: partTrim.slice(0, idx).trim(),
          hora: partTrim.slice(idx + 1).trim(),
          rosa: /domingo/i.test(partTrim),
        };
      }).filter(Boolean);
    }
  }
  if (form.horario_linea2 && form.horario_linea1) {
    return [{ dia: form.horario_linea2, hora: form.horario_linea1, rosa: false }];
  }
  return [];
}

/* ── darkFormSx ── */
const darkFormSx = {
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 1, fontSize: "0.82rem" },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(217,165,107,0.5)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
};

/* ── FField dark ── */
const FField = ({ label, value, onChange, multiline, rows = 1, type }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" value={value || ""} onChange={e => onChange(e.target.value)}
      multiline={multiline} minRows={rows} type={type} sx={darkFormSx} />
  </Box>
);

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

function HorarioEditor({ form, onField }) {
  const filas = parseHorarioRows(form);
  const setFilas = (next) => onField("horario_dias", JSON.stringify(next));
  const setFila = (i, k, v) => { const n = [...filas]; n[i] = { ...n[i], [k]: v }; setFilas(n); };
  const delFila = (i) => setFilas(filas.filter((_, idx) => idx !== i));
  const addFila = () => setFilas([...filas, { dia: "", hora: "", rosa: false }]);

  return (
    <Box>
      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", mb: 1.5, lineHeight: 1.6 }}>
        Cada fila es un día o etiqueta con su horario. Puedes agregar, editar o eliminar filas.
      </Typography>
      <FField label="Título de la sección" value={form.horario_etiqueta} onChange={v => onField("horario_etiqueta", v)} />
      <Sep />
      {filas.length === 0 && (
        <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", mb: 1.5, fontStyle: "italic" }}>
          Sin filas de horario. Usa el botón de abajo para agregar la primera.
        </Typography>
      )}
      {filas.map((f, i) => (
        <Box key={i} sx={{ mb: 1.2, p: 1.2, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1, border: "1px solid rgba(255,255,255,0.08)" }}>
          <Box sx={{ display: "flex", gap: 1, mb: 0.8 }}>
            <TextField size="small" placeholder="Día (ej: Lunes – Viernes)" value={f.dia || ""} onChange={e => setFila(i, "dia", e.target.value)}
              sx={{ flex: 1, ...darkFormSx }} />
            <IconButton size="small" onClick={() => delFila(i)} sx={{ color: "#f87171", flexShrink: 0 }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <TextField size="small" placeholder="Hora (ej: 10:00 am – 9:00 pm)" value={f.hora || ""} onChange={e => setFila(i, "hora", e.target.value)}
            fullWidth sx={{ mb: 0.6, ...darkFormSx }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Switch size="small" checked={!!f.rosa}
              onChange={e => setFila(i, "rosa", e.target.checked)}
              sx={{ "& .MuiSwitch-thumb": { bgcolor: f.rosa ? AM.gold : "#666" } }} />
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)" }}>Resaltar en rosa</Typography>
          </Box>
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />} onClick={addFila}
        sx={{ color: AM.gold, textTransform: "none", fontSize: "0.75rem" }}>
        Agregar fila de horario
      </Button>
    </Box>
  );
}

/* ── EditZone ── */
function EditZone({ id, label, activeZone, onOpen, children }) {
  const isActive = activeZone === id;
  return (
    <Box sx={{
      position: "relative",
      outline: isActive ? `2.5px dashed ${AM.gold}` : "2px dashed transparent",
      outlineOffset: -2, transition: "outline .2s",
      "&:hover": { outline: `2px dashed rgba(204,107,142,0.4)` },
      "&:hover .ez-pencil": { opacity: 1 },
    }}>
      {children}
      <Tooltip title={`Editar: ${label}`} placement="left">
        <IconButton className="ez-pencil" size="small" onClick={() => onOpen(id)} sx={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          background: isActive ? ACCENT : "rgba(160,69,94,0.88)",
          color: "#fff", width: 28, height: 28,
          opacity: isActive ? 1 : 0, transition: "opacity .2s",
          "&:hover": { background: ACCENT, transform: "scale(1.12)" },
        }}>
          <EditIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/* ── Upload imagen ── */
function ImgUpload({ preview, currentUrl, onFile }) {
  const ref = useRef();
  const src = resolveImg(currentUrl, preview);
  return (
    <Box>
      <input type="file" ref={ref} accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width: "100%", height: 110, borderRadius: 2, overflow: "hidden",
        border: `2px dashed ${src ? "rgba(160,69,94,0.6)" : "rgba(255,255,255,0.2)"}`,
        bgcolor: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", "&:hover": { borderColor: ACCENT },
      }}>
        {src
          ? <Box component="img" src={src} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Stack alignItems="center" gap={0.5} sx={{ color: "#475569" }}>
              <PhotoCameraIcon sx={{ fontSize: 24, opacity: 0.5 }} />
              <Typography sx={{ fontSize: 10 }}>Clic para subir imagen</Typography>
            </Stack>
        }
      </Box>
    </Box>
  );
}

/* ── ZoneDrawer ── */
const ZoneDrawer = forwardRef(function ZoneDrawer(
  { zone, form, onField, landingForm, onFieldLanding, columnas, colEdit, onColEdit, bgPreview, onBgFile, onSaveColumna, onDeleteColumna }, ref
) {
  useImperativeHandle(ref, () => ({}), []);

  if (zone === "fondo") return (
    <Box>
      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", mb: 1.5, lineHeight: 1.6 }}>
        Imagen de fondo del hero/banner de contacto con overlay oscuro.
      </Typography>
      <ImgUpload preview={bgPreview} currentUrl={form.banner_url_imagen} onFile={onBgFile} />
    </Box>
  );

  if (zone === "formulario") return (
    <Box>
      <FField label="Etiqueta superior (ej: Écrivez-nous · Escríbenos)" value={form.form_subtitulo} onChange={v => onField("form_subtitulo", v)} />
      <FField label="Título principal" value={form.form_titulo} onChange={v => onField("form_titulo", v)} multiline rows={2} />
      <FField label="Descripción / Texto bajo el título" value={form.form_descripcion} onChange={v => onField("form_descripcion", v)} multiline rows={3} placeholder="Royal Sensory Experience Massage..." />
      <Sep />
      <FField label="Texto del botón WhatsApp" value={form.btn_texto} onChange={v => onField("btn_texto", v)} />
      <Sep />
      <FField label="Nota al pie de la tarjeta" value={form.frase_texto} onChange={v => onField("frase_texto", v)} multiline rows={3} />
    </Box>
  );

  if (zone === "info_cards") return (
    <Box>
      <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.45)", mb: 1.5, lineHeight: 1.6 }}>
        Cada fila aparece como una tarjeta de información en la sección superior.
      </Typography>
      {columnas.map((col) => {
        const row = colEdit?.id === col.id ? { ...col, ...colEdit } : col;
        return (
        <Box key={col.id} sx={{ mb: 1, p: 1.2, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1, border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 1 }}>
          <Box flex={1}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#f1f5f9" }}>{row.titulo}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>{row.descripcion}</Typography>
          </Box>
          <IconButton size="small" sx={{ color: AM.gold }} onClick={() => onColEdit({ ...col })}>
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: "#f87171" }} onClick={() => onDeleteColumna(col.id)}>
            <DeleteOutlineIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>
        );
      })}
      <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
        onClick={() => onColEdit({ titulo: "", descripcion: "" })}
        sx={{ color: AM.gold, textTransform: "none", fontSize: "0.75rem", mt: 0.5 }}>
        Agregar tarjeta
      </Button>

      {colEdit && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: "rgba(160,69,94,0.12)", borderRadius: 1, border: "1px solid rgba(160,69,94,0.3)" }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: AM.gold, mb: 1 }}>
            {colEdit.id ? "Editar tarjeta" : "Nueva tarjeta"}
          </Typography>
          <FField label="Título" value={colEdit.titulo} onChange={v => onColEdit(x => ({ ...x, titulo: v }))} />
          <FField label="Descripción" value={colEdit.descripcion} onChange={v => onColEdit(x => ({ ...x, descripcion: v }))} multiline rows={2} />
          <Box sx={{ mb: 1.5 }}>
            <PhIconPicker value={colEdit.icono ?? ""} onChange={v => onColEdit(x => ({ ...x, icono: v }))} />
          </Box>
          <Stack direction="row" gap={1} mt={0.5}>
            <Button size="small" variant="contained" onClick={onSaveColumna}
              sx={{ bgcolor: ACCENT, textTransform: "none", fontWeight: 700, fontSize: "0.75rem", "&:hover": { bgcolor: AM.gold } }}>
              Guardar
            </Button>
            <Button size="small" onClick={() => onColEdit(null)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", fontSize: "0.75rem" }}>
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );

  if (zone === "mapa") {
    return (
      <Box>
        <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", mb: 1.5, lineHeight: 1.6 }}>
          Pega el código embed de Google Maps (iframe completo o solo la URL src).
        </Typography>
        <FField label="Embed del mapa (iframe)" value={form.mapa_embed_url} onChange={v => onField("mapa_embed_url", v)} multiline rows={4} />
      </Box>
    );
  }

  if (zone === "suscripcion") {
    return (
      <Box>
        <FField label="Etiqueta superior (ej: Reserva tu cita)" value={landingForm.subtitulo} onChange={v => onFieldLanding("subtitulo", v)} />
        <FField label="Título principal" value={landingForm.titulo} onChange={v => onFieldLanding("titulo", v)} multiline rows={2} />
        <FField label="Descripción de reserva" value={landingForm.descripcion} onChange={v => onFieldLanding("descripcion", v)} multiline rows={3} />
      </Box>
    );
  }

  return null;
});

/* ── ZONE META ── */
const ZONE_META = {
  fondo:      { label: "Banner / Imagen de fondo", emoji: "🖼" },
  formulario: { label: "Formulario",               emoji: "📝" },
  info_cards: { label: "Otras formas de contacto", emoji: "📋" },
  mapa:       { label: "Mapa",                      emoji: "🗺" },
  horarios:   { label: "Horario de atención",       emoji: "🕐" },
  suscripcion:{ label: "Formulario de Reserva",     emoji: "📅" },
};

/* Mapa de clases Phosphor → componentes MUI para la vista previa del canvas */
const PH_ICON_MAP = [
  { cls: "ph ph-map-pin",         Icon: LocationOnIcon,   label: "📍 Ubicación" },
  { cls: "ph ph-whatsapp-logo",   Icon: WhatsAppIcon,     label: "💬 WhatsApp" },
  { cls: "ph ph-lock-simple",     Icon: LockOutlinedIcon, label: "🔒 Privacidad" },
  { cls: "ph ph-phone-call",      Icon: ContactMailIcon,  label: "📞 Teléfono" },
  { cls: "ph ph-envelope-simple", Icon: ContactMailIcon,  label: "📧 Email" },
  { cls: "ph ph-star",            Icon: ContactMailIcon,  label: "⭐ Estrella" },
];

/** Resuelve clase Phosphor → MUI Icon component */
function resolvePhIcon(cls) {
  return PH_ICON_MAP.find(e => e.cls === cls)?.Icon ?? LocationOnIcon;
}

/** Picker de icono pequeño en el panel lateral */
function PhIconPicker({ value, onChange }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.8 }}>
        Icono de la tarjeta
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
        {PH_ICON_MAP.map(({ cls, Icon, label }) => (
          <Tooltip key={cls} title={label}>
            <Box onClick={() => onChange(cls)} sx={{
              width: 38, height: 38, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", border: `2px solid ${value === cls ? ACCENT : "rgba(255,255,255,0.13)"}`,
              bgcolor: value === cls ? "rgba(160,69,94,0.22)" : "rgba(255,255,255,0.04)",
              transition: "all .15s",
              "&:hover": { borderColor: ACCENT, bgcolor: "rgba(160,69,94,0.15)" },
            }}>
              <Icon sx={{ color: value === cls ? ACCENT : "rgba(255,255,255,0.5)", fontSize: 18 }} />
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

/* ── CANVAS — refleja la web pública Amour (tema "Dark Passion") ── */
function ContactoCanvas({ form, landingForm, columnas, activeZone, onZone, bgPreview }) {
  const bgSrc = resolveImg(form.banner_url_imagen, bgPreview);
  const bannerTitle   = form.banner_titulo  || "Contáctenos";
  const bannerEyebrow = "Contactez-nous · Estamos aquí";
  const formEyebrow   = form.form_subtitulo || "Écrivez-nous · Escríbenos";
  const heading       = form.form_titulo    || "Cuéntanos qué rituel buscas";
  const subtitle      = form.form_descripcion || "Royal Sensory Experience Massage — relajación profunda y tacto consciente exclusivamente para mujeres profesionales en Lima.";
  const btnTxt        = form.btn_texto      || "Enviar por WhatsApp";


  const mapSrc = (() => {
    const raw = (form.mapa_embed_url || "").trim();
    if (!raw) return null;
    // Si es un iframe completo, extraer el src
    const m = raw.match(/src="([^"]+)"/);
    if (m) return m[1];
    // Si ya es una URL directa, usarla tal cual
    if (raw.startsWith("http")) return raw;
    return null;
  })();


  const SERIF = "'Playfair Display', 'PT Serif', Georgia, serif";

  /* Campo simulado del formulario (label dorado + input oscuro) */
  const MockField = ({ label, placeholder, full, tall }) => (
    <Box sx={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <Typography sx={{ color: AM.gold, fontSize: "0.72rem", fontWeight: 500, mb: 0.6 }}>{label}</Typography>
      <Box sx={{
        border: `1px solid ${AM.cardBorder}`, borderRadius: "10px",
        px: 1.5, py: tall ? 2.2 : 1.15, bgcolor: "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "flex-start",
      }}>
        <Typography sx={{ color: "rgba(245,230,226,0.45)", fontSize: "0.78rem" }}>{placeholder}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      borderRadius: 2, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      backgroundColor: "#ffffff",
    }}>

      {/* ── Banner / Hero ── */}
      <EditZone id="fondo" label="Banner" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{
          position: "relative", minHeight: 220, px: { xs: 3, md: 6 }, py: 5,
          display: "flex", flexDirection: "column", justifyContent: "center",
          backgroundImage: bgSrc
            ? `linear-gradient(160deg, rgba(42,15,22,0.72), rgba(18,7,10,0.82)), url(${bgSrc})`
            : `linear-gradient(160deg, ${AM.bgMid}, ${AM.bgDeep})`,
          backgroundSize: "cover", backgroundPosition: "center",
          borderBottom: `1px solid ${AM.cardBorder}`,
        }}>
          <Typography sx={{ color: AM.gold, fontFamily: SERIF, fontStyle: "italic", fontSize: "1rem", mb: 1 }}>
            {bannerEyebrow}
          </Typography>
          <Typography sx={{ color: "#fff", fontFamily: SERIF, fontSize: "clamp(1.9rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.1, mb: 1.5 }}>
            {bannerTitle}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ color: AM.textMuted, fontSize: "0.8rem" }}>Inicio</Typography>
            <Typography sx={{ color: AM.textMuted, fontSize: "0.7rem" }}>›</Typography>
            <Typography sx={{ color: AM.gold, fontSize: "0.8rem" }}>Contacto</Typography>
          </Box>
        </Box>
      </EditZone>

      {/* ── Formulario (tarjeta vino con borde dorado) ── */}
      <EditZone id="formulario" label="Formulario" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 4, md: 6 }, display: "flex", justifyContent: "center", bgcolor: "#ffffff" }}>
          <Box sx={{
            position: "relative", width: "100%", maxWidth: 620,
            background: `linear-gradient(160deg, ${AM.card} 0%, ${AM.cardAlt} 100%)`,
            border: `1px solid ${AM.cardBorder}`, borderRadius: "24px",
            boxShadow: "0 12px 35px rgba(18,7,10,0.4)", px: { xs: 2.5, md: 5 }, py: { xs: 4, md: 5 },
          }}>
            {/* Línea dorada superior */}
            <Box sx={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 70, height: 3, borderRadius: 20,
              background: `linear-gradient(90deg, ${AM.gold}, ${AM.goldLight}, ${AM.gold})`,
            }} />
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography sx={{ color: AM.gold, fontFamily: SERIF, fontStyle: "italic", fontSize: "1rem", mb: 0.8 }}>
                {formEyebrow}
              </Typography>
              <Typography sx={{ color: AM.text, fontFamily: SERIF, fontSize: "clamp(1.4rem,2.6vw,2rem)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.15, mb: 1 }}>
                {heading}
              </Typography>
              <Typography sx={{ color: AM.textMuted, fontSize: "0.85rem" }}>{subtitle}</Typography>
            </Box>

            {/* Campos simulados */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <MockField label="Nombre"           placeholder="Tu nombre..." />
              <MockField label="Correo"           placeholder="Tu correo..." />
              <MockField label="Teléfono"         placeholder="977 807 314" />
              <MockField label="Rituel de interés" placeholder="Elegir rituel" />
              <MockField label="Mensaje"          placeholder="Cuéntanos qué buscas..." full tall />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Box sx={{
                bgcolor: AM.goldBtn, borderRadius: "6px", px: 3.5, py: 1.3,
                display: "flex", alignItems: "center", gap: 0.8,
              }}>
                <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: "0.85rem" }}>{btnTxt}</Typography>
                <WhatsAppIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </EditZone>

      {/* ── Otras formas de contactarnos ── */}
      <EditZone id="info_cards" label="Otras formas de contacto" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, bgcolor: "#ffffff" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography sx={{ color: AM.gold, fontFamily: SERIF, fontStyle: "italic", fontSize: "1rem", mb: 0.5 }}>
              Toujours disponibles
            </Typography>
            <Typography sx={{ color: AM.bgMid, fontFamily: SERIF, fontSize: "clamp(1.3rem,2.4vw,1.8rem)", fontWeight: 700, textTransform: "uppercase" }}>
              Otras formas de contactarnos
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: `repeat(${Math.min(columnas.length || 3, 3)}, 1fr)` }, gap: 2 }}>
            {(columnas.length > 0 ? columnas : [
              { id: 1, titulo: "Ubicación",       descripcion: "Av. Ernesto Diez Canseco 204, 15074 Miraflores, Lima, Perú.",          icono: "ph ph-map-pin" },
              { id: 2, titulo: "WhatsApp",         descripcion: "Escríbenos ahora y coordinamos tu ritual.",                           icono: "ph ph-whatsapp-logo" },
              { id: 3, titulo: "100% Confidencial", descripcion: "Tu identidad, datos y experiencia son absolutamente privados.",        icono: "ph ph-lock-simple" },
            ]).map((col) => {
              const Icon = resolvePhIcon(col.icono);
              return (
                <Box key={col.id} sx={{
                  background: `linear-gradient(160deg, ${AM.card} 0%, ${AM.cardAlt} 100%)`,
                  border: `1px solid ${AM.cardBorder}`,
                  borderRadius: "10px", p: 3, textAlign: "center",
                  boxShadow: "0 4px 20px rgba(18,7,10,0.25)",
                }}>
                  <Box sx={{
                    width: 54, height: 54, mx: "auto", mb: 1.5, borderRadius: "50%",
                    bgcolor: "rgba(217,165,107,0.14)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon sx={{ color: AM.gold, fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ color: AM.text, fontFamily: SERIF, fontSize: "1.05rem", fontWeight: 700, mb: 0.75 }}>
                    {col.titulo}
                  </Typography>
                  <Typography sx={{ color: AM.textMuted, fontSize: "0.82rem", lineHeight: 1.6 }}>
                    {col.descripcion}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </EditZone>

      {/* ── Mapa ── */}
      <EditZone id="mapa" label="Mapa" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{ px: { xs: 2, md: 6 }, pb: 6, bgcolor: "#ffffff" }}>
          <Box sx={{
            borderRadius: "10px", overflow: "hidden",
            border: `1px solid ${AM.cardBorder}`, boxShadow: "0 20px 45px rgba(18,7,10,0.2)",
            bgcolor: AM.bgMid, aspectRatio: "16 / 7", minHeight: 240,
          }}>
            {mapSrc
              ? <Box component="iframe" src={mapSrc}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Amour Spa"
                  sx={{ width: "100%", height: "100%", border: "none", display: "block", filter: "saturate(0.85) brightness(0.92)" }} />
              : <Box sx={{ height: "100%", minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1, color: AM.textMuted }}>
                  <ImageOutlinedIcon sx={{ fontSize: 34, opacity: 0.5 }} />
                  <Typography sx={{ fontSize: "0.78rem" }}>Sin mapa — añade un embed de Google Maps</Typography>
                </Box>
            }

          </Box>
        </Box>
      </EditZone>

      {/* ── Sección de Reserva Inferior ── */}
      <EditZone id="suscripcion" label="Formulario de Reserva" activeZone={activeZone} onOpen={onZone}>
        <Box sx={{
          px: { xs: 2, md: 6 }, pb: 6, pt: 5,
          background: `linear-gradient(160deg, ${AM.bgDeep} 0%, ${AM.bgMid} 50%, ${AM.bgWarm} 100%)`,
          textAlign: "center"
        }}>
          <Typography sx={{ color: AM.gold, fontFamily: SERIF, fontStyle: "italic", fontSize: "0.9rem", mb: 1 }}>
            {landingForm.subtitulo || "Réservez Maintenant · Reserva Tu Cita"}
          </Typography>
          <Typography
            sx={{ color: "#fff", fontFamily: SERIF, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.25, mb: 2 }}
            dangerouslySetInnerHTML={{ __html: landingForm.titulo || "¿LISTA PARA TU EXPERIENCIA <EM>ROYAL?</EM>" }}
          />
          <Typography sx={{ color: AM.textMuted, fontSize: "0.85rem", maxWidth: 650, mx: "auto", mb: 4, lineHeight: 1.6 }}>
            {landingForm.descripcion || "Reserva tu sesión hoy y vive la relajación profunda..."}
          </Typography>

          {/* Formulario horizontal blanco */}
          <Box sx={{
            bgcolor: "#ffffff", borderRadius: "16px", p: 2.5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            maxWidth: 1000, mx: "auto"
          }}>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(6, 1fr) auto" },
              gap: 1.5, alignItems: "center"
            }}>
              <Box sx={{ bgcolor: "#faf8f6", border: "1px solid #e2e8f0", borderRadius: "6px", p: 1.2, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Tu nombre...</Typography>
              </Box>
              <Box sx={{ bgcolor: "#faf8f6", border: "1px solid #e2e8f0", borderRadius: "6px", p: 1.2, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Tu correo...</Typography>
              </Box>
              <Box sx={{ bgcolor: "#faf8f6", border: "1px solid #e2e8f0", borderRadius: "6px", p: 1.2, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>977 807 314</Typography>
              </Box>
              <Box sx={{ bgcolor: "#faf8f6", border: "1px solid #e2e8f0", borderRadius: "6px", p: 1.2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Elegir ritual</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>▼</Typography>
              </Box>
              <Box sx={{ bgcolor: "#faf8f6", border: "1px solid #e2e8f0", borderRadius: "6px", p: 1.2, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>dd/mm/aaaa</Typography>
              </Box>
              <Box sx={{ bgcolor: "#faf8f6", border: "1px solid #e2e8f0", borderRadius: "6px", p: 1.2, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>--:--</Typography>
              </Box>
              <Button size="small" variant="contained" disabled
                sx={{
                  bgcolor: AM.goldBtn, color: "#fff", textTransform: "uppercase",
                  fontWeight: 700, borderRadius: "50px", px: 3, py: 1, fontSize: "0.75rem",
                  "&.Mui-disabled": { bgcolor: AM.goldBtn, color: "#fff", opacity: 0.8 }
                }}>
                RÉSERVER
              </Button>
            </Box>
          </Box>
        </Box>
      </EditZone>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════════ */
export default function PaginaContactoIndexPage() {
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState({});
  const [landingForm,setLandingForm]= useState({});
  const [columnas,   setColumnas]   = useState([]);
  const [colEdit,    setColEdit]    = useState(null);
  const [bgPreview,  setBgPreview]  = useState(null);
  const [bgFile,     setBgFile]     = useState(null);
  const [activeZone, setActiveZone] = useState(null);

  const panelOpen = Boolean(activeZone);

  const load = async () => {
    try {
      const data = await obtener();
      setForm(data?.pagina ?? {});
      setColumnas(data?.columnas ?? []);

      const landing = await obtenerLanding();
      setLandingForm(landing ?? {});
    } catch (e) { handleErrorMessages(e); }
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleFieldLanding = (k, v) => setLandingForm(f => ({ ...f, [k]: v }));
  const handleColEdit = (value) => {
    if (typeof value === "function") {
      setColEdit((prev) => value(prev));
    } else {
      setColEdit(value);
    }
  };
  const openZone = (id) => {
    setActiveZone(p => p === id ? null : id);
    if (id !== "info_cards") setColEdit(null);
  };
  const closePanel = () => { setActiveZone(null); setColEdit(null); };

  const liveColumnas = useMemo(() => {
    if (!colEdit || activeZone !== "info_cards") return columnas;
    if (colEdit.id) {
      return columnas.map((c) => (c.id === colEdit.id ? { ...c, ...colEdit } : c));
    }
    return [...columnas, { ...colEdit, id: "__draft__" }];
  }, [columnas, colEdit, activeZone]);

  const persistColEdit = async (target = colEdit) => {
    if (!target?.titulo?.trim()) return null;
    const payload = {
      titulo: target.titulo.trim(),
      descripcion: target.descripcion || "",
      icono: target.icono || "",
    };
    if (target.id) {
      return actualizar_columna({ id: target.id, ...payload });
    }
    return crear_columna(payload);
  };

  const saveColumna = async () => {
    if (!colEdit?.titulo?.trim()) {
      toastError("Escribe el título de la tarjeta.");
      return;
    }
    try {
      const saved = await persistColEdit(colEdit);
      setColEdit(null);
      await load();
      toastSuccess("Tarjeta guardada ✓");
      return saved;
    } catch (e) {
      handleErrorMessages(e);
      throw e;
    }
  };

  const deleteColumna = async (id) => {
    if (id === "__draft__") {
      setColEdit(null);
      return;
    }
    try {
      await eliminar_columna({ id });
      if (colEdit?.id === id) setColEdit(null);
      await load();
      toastSuccess("Tarjeta eliminada");
    } catch (e) { handleErrorMessages(e); }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (colEdit?.titulo?.trim()) {
        await persistColEdit(colEdit);
        setColEdit(null);
      }

      const fd = new FormData();
      const keys = [
        "banner_titulo", "form_titulo", "form_subtitulo", "form_descripcion",
        "btn_texto", "mapa_embed_url", "info_titulo", "info_texto",
        "telefono_etiqueta", "telefonos_texto", "telefono",
        "email_etiqueta", "emails_texto", "email",
        "ubicacion_etiqueta", "ubicacion",
        "horario_etiqueta", "horario_linea1", "horario_linea2", "horario_dias",
        "productos_placeholder", "suscribe_titulo", "suscribe_texto", "suscribe_placeholder",
        "frase_texto",
      ];
      keys.forEach(k => fd.append(k, form[k] ?? ""));
      if (bgFile) fd.append("banner_image", bgFile);

      const res = await actualizar(fd);
      if (res?.pagina) setForm(res.pagina);
      if (res?.columnas) setColumnas(res.columnas);

      // Guardar landingForm en la API del contacto landing
      const fdLanding = new FormData();
      fdLanding.append("subtitulo", landingForm.subtitulo ?? "");
      fdLanding.append("titulo", landingForm.titulo ?? "");
      fdLanding.append("descripcion", landingForm.descripcion ?? "");
      fdLanding.append("email_destino", landingForm.email_destino ?? "");
      fdLanding.append("asuntos", JSON.stringify(landingForm.asuntos ?? []));
      await actualizarLanding(fdLanding);

      await load();

      setBgFile(null);
      setBgPreview(null);
      toastSuccess("✓ Página de contacto actualizada");
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 12, minHeight: "100vh", bgcolor: "#ffffff" }}>
      <CircularProgress sx={{ color: AM.gold }} />
    </Box>
  );

  const meta = ZONE_META[activeZone] ?? {};

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#ffffff" }}>

      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        background: `linear-gradient(135deg,${AM.bgMid},${AM.bgWarm})`,
        borderRadius: 2, px: 2.5, py: 1.4, boxShadow: "0 4px 20px rgba(44,26,14,0.3)" }}>
        <ContactMailIcon sx={{ color: AM.gold, fontSize: 22 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#f5ede0", lineHeight: 1 }}>
            Página Contacto — Editor Canvas
          </Typography>
          <Typography sx={{ fontSize: "0.64rem", color: "#a07850", mt: 0.3 }}>
            Pasa el cursor sobre cualquier zona y haz clic en ✏️ para editar en tiempo real
          </Typography>
        </Box>
        <Tooltip title="Ver página pública">
          <IconButton sx={{ color: "rgba(255,255,255,0.6)" }} onClick={() => window.open("/contacto", "_blank")} size="small">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button variant="contained" size="small" startIcon={saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <SaveIcon sx={{ fontSize: 15 }} />}
          onClick={save} disabled={saving}
          sx={{ bgcolor: AM.gold, textTransform: "none", fontWeight: 700, borderRadius: 1, "&:hover": { bgcolor: ACCENT } }}>
          {saving ? "Guardando…" : "Guardar página"}
        </Button>
      </Box>

      {/* ── Panel fijo izquierda ── */}
      <CmsPanelRoot open={panelOpen} panelLeft={0} panelWidth={PANEL_W}>
        {/* Header zona */}
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, bgcolor: ACCENT, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 16 }}>{meta.emoji}</Typography>
          <Box flex={1}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{meta.label ?? "Editar"}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>Los cambios se ven en tiempo real</Typography>
          </Box>
          <IconButton size="small" onClick={closePanel} sx={{ color: "rgba(255,255,255,0.7)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Contenido scrolleable */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { background: "rgba(204,107,142,0.35)", borderRadius: 2 } }}>
          {panelOpen && (
            <ZoneDrawer
              zone={activeZone}
              form={form}
              landingForm={landingForm}
              onField={handleField}
              onFieldLanding={handleFieldLanding}
              columnas={columnas}
              colEdit={colEdit}
              onColEdit={handleColEdit}
              bgPreview={bgPreview}
              onBgFile={f => { setBgFile(f); setBgPreview(URL.createObjectURL(f)); }}
              onSaveColumna={saveColumna}
              onDeleteColumna={deleteColumna}
            />
          )}
        </Box>

        {/* Footer guardar */}
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Button fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <SaveIcon />}
            onClick={save} disabled={saving}
            sx={{ bgcolor: ACCENT, fontWeight: 700, borderRadius: 1, "&:hover": { bgcolor: AM.gold }, "&:disabled": { opacity: 0.6 } }}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Box>
      </CmsPanelRoot>

      {/* ── Canvas ── */}
      <Box>
        <ContactoCanvas
          form={form}
          landingForm={landingForm}
          columnas={liveColumnas}
          activeZone={activeZone}
          onZone={openZone}
          bgPreview={bgPreview}
        />
      </Box>
    </Box>
  );
}
