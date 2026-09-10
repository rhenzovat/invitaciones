import React, { useEffect, useRef, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import {
  Box, Paper, Typography, Button, Stack, IconButton,
  TextField, Chip, Tooltip, Divider, Badge,
} from "@mui/material";
import EditIcon            from "@mui/icons-material/Edit";
import SaveIcon            from "@mui/icons-material/Save";
import CloseIcon           from "@mui/icons-material/Close";
import AddIcon             from "@mui/icons-material/Add";
import DeleteOutlineIcon   from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon   from "@mui/icons-material/ImageOutlined";
import PhotoCameraIcon     from "@mui/icons-material/PhotoCamera";
import DragHandleIcon      from "@mui/icons-material/DragHandle";
import SearchIcon          from "@mui/icons-material/Search";
import WhatsAppIcon        from "@mui/icons-material/WhatsApp";
import FacebookIcon        from "@mui/icons-material/Facebook";
import TwitterIcon         from "@mui/icons-material/Twitter";
import LanguageIcon        from "@mui/icons-material/Language";
import LinkIcon            from "@mui/icons-material/Link";
import InstagramIcon       from "@mui/icons-material/Instagram";
import YouTubeIcon           from "@mui/icons-material/YouTube";
import LinkedInIcon          from "@mui/icons-material/LinkedIn";

import { obtener, actualizar } from "../../../api/web_header.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { authJWTConfig } from "app/authJWTConfig";

const DomainBackend = `${(authJWTConfig.domain || "").replace(/\/$/, "")}/`;

// ─── DEFAULTS Royal Masajes ───────────────────────────────────────────────────
const DEF = {
  topbar_bgcolor:         "#111111",
  topbar_mensaje_centro:  "Atención privada en Lima — Reserva al WhatsApp",
  topbar_wa_numero:       "982 311 335",
  topbar_wa_href:         "https://wa.me/51982311335",
  topbar_redes: [
    { tipo: "facebook",  url: "https://www.facebook.com/", etiqueta: "Facebook",  orden: 1 },
    { tipo: "twitter",   url: "#",                         etiqueta: "Twitter",   orden: 2 },
    { tipo: "whatsapp",  url: "https://wa.me/51982311335", etiqueta: "WhatsApp",  orden: 3 },
  ],
  nav_bgcolor:            "#ffffff",
  nav_link_color:         "#2c1a0e",
  nav_items: [
    { label: "Inicio",         href: "/",            side: "left"  },
    { label: "Sobre Nosotros", href: "/nosotros",    side: "left"  },
    { label: "Masajes",        href: "/masajes",     side: "left"  },
    { label: "Galería",        href: "/galeria",     side: "right" },
    { label: "Contacto",       href: "/contacto",    side: "right" },
    { label: "Publicaciones",  href: "/publicaciones", side: "right" },
  ],
};

const resolveRedUrl = (red) => {
  let url = (red.url || "").trim();
  const etiqueta = (red.etiqueta || red.label || "").trim();
  if (!url && /^https?:\/\//i.test(etiqueta)) url = etiqueta;
  return url;
};

const parseTopbarRedes = (raw) => {
  let arr = [];
  if (Array.isArray(raw)) arr = raw;
  else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && typeof parsed === "object") arr = Object.values(parsed);
    } catch {
      arr = [];
    }
  } else if (raw && typeof raw === "object") {
    arr = Object.values(raw);
  }
  return arr.map((r, i) => {
    const url = resolveRedUrl(r);
    const rawEtiqueta = (r.etiqueta || r.label || "").trim();
    const etiqueta = !((r.url || "").trim()) && /^https?:\/\//i.test(rawEtiqueta) ? "" : rawEtiqueta;
    return {
      tipo: r.tipo || r.red || "whatsapp",
      url,
      etiqueta,
      orden: r.orden ?? i + 1,
    };
  });
};

function TikTokIcon(props) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      {...props}
      sx={{ width: "1em", height: "1em", fill: "currentColor", ...props.sx }}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </Box>
  );
}

const normalize = (d) => {
  if (!d) return {};
  return {
    ...d,
    topbar_wa_href:  d.topbar_wa_href  || d.url_whatsapp_top || "",
    topbar_wa_numero: d.topbar_wa_numero || d.telefono_numero  || "",
    topbar_mensaje_centro: d.topbar_mensaje_centro || d.top_ubicacion || "",
    topbar_redes: parseTopbarRedes(d.topbar_redes ?? d.redes_side),
  };
};

const merge = (saved) => {
  if (!saved || Object.keys(saved).length === 0) return { ...DEF };
  const n = normalize(saved);
  const hasRedesConfigured = saved.redes_side !== undefined && saved.redes_side !== null && saved.redes_side !== "";
  return {
    ...DEF,
    ...n,
    topbar_redes: hasRedesConfigured ? parseTopbarRedes(saved.redes_side) : DEF.topbar_redes,
  };
};

const RED_ICON_MAP = {
  facebook:  FacebookIcon,
  twitter:   TwitterIcon,
  whatsapp:  WhatsAppIcon,
  instagram: InstagramIcon,
  youtube:   YouTubeIcon,
  linkedin:  LinkedInIcon,
  tiktok:    TikTokIcon,
};

// ─── Botón lápiz que aparece en hover ────────────────────────────────────────
function EditZone({ id, active, onEdit, children, sx = {} }) {
  const isA = active === id;
  return (
    <Box sx={{
      position: "relative",
      outline: isA ? "2px solid #cc6b8e" : "2px solid transparent",
      outlineOffset: isA ? 3 : 2,
      borderRadius: "6px",
      transition: "outline 0.15s, outline-offset 0.15s",
      cursor: "default",
      "&:hover .ez-pencil": { opacity: 1, transform: "scale(1)" },
      ...sx,
    }}>
      {children}
      {/* Lápiz flotante */}
      <Box
        className="ez-pencil"
        onClick={e => { e.stopPropagation(); onEdit(id); }}
        title={`Editar ${id}`}
        sx={{
          position: "absolute", top: -11, right: -11,
          opacity: isA ? 1 : 0,
          transform: isA ? "scale(1)" : "scale(0.7)",
          transition: "opacity 0.18s, transform 0.18s",
          zIndex: 30, cursor: "pointer",
          bgcolor: isA ? "#a0455e" : "#cc6b8e",
          color: "#fff",
          borderRadius: "50%",
          width: 24, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(204,107,142,0.55)",
          "&:hover": { bgcolor: "#a0455e", transform: "scale(1.15) !important" },
        }}
      >
        <EditIcon sx={{ fontSize: 12 }} />
      </Box>
    </Box>
  );
}

// ─── CANVAS PREVIEW — fiel al navbar Royal Masajes ───────────────────────────
function CanvasPreview({ d, active, onEdit }) {
  const navItems = Array.isArray(d.nav_items) ? d.nav_items : DEF.nav_items;
  const leftItems  = navItems.filter(it => it.side === "left"  || navItems.indexOf(it) < Math.ceil(navItems.length / 2) && it.side !== "right");
  const rightItems = navItems.filter(it => it.side === "right");
  // fallback split si no hay side definido
  const half = Math.ceil(navItems.length / 2);
  const lItems = navItems.some(x => x.side) ? leftItems  : navItems.slice(0, half);
  const rItems = navItems.some(x => x.side) ? rightItems : navItems.slice(half);

  const logoSrc = d._logoPreview || (d.url_logo ? `${DomainBackend}${d.url_logo}` : null);
  const topbarRedes = Array.isArray(d.topbar_redes) ? d.topbar_redes : DEF.topbar_redes;

  const accent = "#cc6b8e";

  return (
    <Box sx={{ fontFamily: "Inter, 'Open Sans', sans-serif", userSelect: "none", borderRadius: "10px", overflow: "hidden" }}>

      {/* ══ TOPBAR ══ */}
      <Box sx={{
        bgcolor: d.topbar_bgcolor || DEF.topbar_bgcolor,
        px: 2, py: 0.65,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Redes sociales izquierda — sincronizadas desde Footer */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", minHeight: 26, pr: 1 }}>
            {topbarRedes.length > 0 ? topbarRedes.map((red, i) => {
              const Icon = RED_ICON_MAP[red.tipo] || LanguageIcon;
              const redUrl = resolveRedUrl(red);
              const hasUrl = red.tipo === "whatsapp" || (redUrl && redUrl !== "#");
              return (
                <Box key={i} sx={{
                  width: 26, height: 26, borderRadius: "50%",
                  border: `1px solid ${hasUrl ? "rgba(255,255,255,0.2)" : "rgba(255,165,0,0.6)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  opacity: hasUrl ? 1 : 0.45,
                  "&:hover": { borderColor: accent, bgcolor: "rgba(204,107,142,0.15)" },
                }}>
                  <Icon sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }} />
                </Box>
              );
            }) : (
              <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
                Sin redes — edítalas en Footer
              </Typography>
            )}
          </Box>

        {/* Centro + derecha */}
        <EditZone id="topbar" active={active} onEdit={onEdit} sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", ml: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent }} />
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#b8860b" }} />
            <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.85)", letterSpacing: "0.3px" }}>
              {d.topbar_mensaje_centro || DEF.topbar_mensaje_centro}
            </Typography>
          </Box>

          {/* WhatsApp derecha */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{
              width: 26, height: 26, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SearchIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <WhatsAppIcon sx={{ fontSize: 14, color: "#25d366" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#fff", fontWeight: 700, letterSpacing: "0.3px" }}>
                {d.topbar_wa_numero || DEF.topbar_wa_numero}
              </Typography>
            </Box>
          </Box>
        </EditZone>
      </Box>

      {/* ══ NAV PRINCIPAL ══ */}
      <Box sx={{
        bgcolor: d.nav_bgcolor || DEF.nav_bgcolor,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        px: 2, py: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 2,
      }}>
        {/* Links izquierda */}
        <EditZone id="nav_items_izq" active={active} onEdit={onEdit}
          sx={{ display: "flex", gap: 2.5, alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center" }}>
            {lItems.map((item, i) => (
              <Typography key={i} sx={{
                fontSize: "0.82rem", fontWeight: 600,
                color: d.nav_link_color || DEF.nav_link_color,
                cursor: "pointer", whiteSpace: "nowrap",
                borderBottom: i === 0 ? `2px solid ${accent}` : "2px solid transparent",
                pb: "2px",
                "&:hover": { color: accent },
                transition: "color 0.2s",
              }}>
                {item.label}
              </Typography>
            ))}
          </Box>
        </EditZone>

        {/* LOGO CENTRAL */}
        <EditZone id="logo" active={active} onEdit={onEdit} sx={{ flexShrink: 0 }}>
          {logoSrc ? (
            <Box component="img" src={logoSrc} alt="Logo"
              sx={{ height: 60, maxWidth: 110, objectFit: "contain", display: "block" }} />
          ) : (
            <Box sx={{
              width: 80, height: 80, borderRadius: "50%",
              bgcolor: "#fdf8f5", border: "2px dashed #e8d5c0",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <ImageOutlinedIcon sx={{ fontSize: 22, color: "#c4a98a", mb: 0.3 }} />
              <Typography sx={{ fontSize: "0.5rem", color: "#c4a98a", textAlign: "center", lineHeight: 1.2 }}>
                Logo
              </Typography>
            </Box>
          )}
        </EditZone>

        {/* Links derecha */}
        <EditZone id="nav_items_der" active={active} onEdit={onEdit}
          sx={{ display: "flex", gap: 2.5, alignItems: "center", flex: 1 }}>
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center" }}>
            {rItems.map((item, i) => (
              <Typography key={i} sx={{
                fontSize: "0.82rem", fontWeight: 600,
                color: d.nav_link_color || DEF.nav_link_color,
                cursor: "pointer", whiteSpace: "nowrap",
                pb: "2px", borderBottom: "2px solid transparent",
                "&:hover": { color: accent },
                transition: "color 0.2s",
              }}>
                {item.label}
              </Typography>
            ))}
          </Box>
        </EditZone>
      </Box>

      {/* ══ INDICADORES DE EDICIÓN ══ */}
      <Box sx={{
        bgcolor: "#fdf8f5", borderTop: "1px solid #f0e8e8",
        px: 2, py: 0.8,
        display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center",
      }}>
        <Typography sx={{ fontSize: "0.6rem", color: "#b8860b", fontWeight: 700, letterSpacing: 1 }}>
          HAGA CLIC EN ✏️ PARA EDITAR CADA ZONA:
        </Typography>
        {[
          { id: "topbar",        emoji: "🔝", label: "Topbar" },
          { id: "logo",          emoji: "🖼️", label: "Logo" },
          { id: "nav_items_izq", emoji: "◀", label: "Menú izq." },
          { id: "nav_items_der", emoji: "▶", label: "Menú der." },
        ].map(z => (
          <Box key={z.id} onClick={() => onEdit(z.id)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              px: 1.2, py: 0.4, borderRadius: "20px", cursor: "pointer",
              bgcolor: active === z.id ? "#fce4ec" : "#fff",
              border: `1px solid ${active === z.id ? "#cc6b8e" : "#e8d5c0"}`,
              transition: "all 0.15s",
              "&:hover": { borderColor: "#cc6b8e", bgcolor: "#fce4ec" },
            }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: active === z.id ? 700 : 400,
              color: active === z.id ? "#cc6b8e" : "#7a6020" }}>
              {z.emoji} {z.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Campo de texto ───────────────────────────────────────────────────────────
const FField = ({ label, value, onChange, placeholder, type = "text", hint }) => (
  <Box sx={{ mb: 1.8 }}>
    <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, color: "#475569",
      mb: 0.4, textTransform: "uppercase", letterSpacing: 0.6 }}>
      {label}
    </Typography>
    {type === "color" ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box component="input" type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
          sx={{ width: 38, height: 32, border: "1px solid #e2e8f0", borderRadius: "6px",
            cursor: "pointer", p: 0.3, bgcolor: "transparent" }} />
        <TextField size="small" value={value || ""} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} sx={{ flex: 1,
            "& .MuiInputBase-root": { fontSize: "0.8rem", bgcolor: "#f8fafc" } }} />
      </Box>
    ) : (
      <TextField fullWidth size="small" type={type} value={value || ""} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        sx={{
          "& .MuiInputBase-root": { fontSize: "0.82rem", bgcolor: "#f8fafc" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
        }} />
    )}
    {hint && <Typography sx={{ fontSize: "0.62rem", color: "#94a3b8", mt: 0.4 }}>{hint}</Typography>}
  </Box>
);

// ─── Panel de edición por zona ────────────────────────────────────────────────
function EditPanel({ zone, d, onChange, onClose, onSave, saving }) {
  const fileRef = useRef(null);
  const logoSrc = d._logoPreview || (d.url_logo ? `${DomainBackend}${d.url_logo}` : null);
  const navItems = Array.isArray(d.nav_items) ? d.nav_items : DEF.nav_items;

  const updateNav = (i, key, val) =>
    onChange("nav_items", navItems.map((it, idx) => {
      if (idx !== i) return it;
      // Sincroniza href↔url para compatibilidad Blade
      const update = { ...it, [key]: val };
      if (key === "href") update.url = val;
      if (key === "url")  update.href = val;
      return update;
    }));

  const addNav = (side) =>
    onChange("nav_items", [...navItems, { label: "Nuevo", href: "#", url: "#", side }]);

  const removeNav = (i) =>
    onChange("nav_items", navItems.filter((_, idx) => idx !== i));

  const filteredNav = (side) => {
    const half = Math.ceil(navItems.length / 2);
    if (navItems.some(x => x.side)) return navItems.filter(x => x.side === side);
    return side === "left" ? navItems.slice(0, half) : navItems.slice(half);
  };

  const zoneTitle = {
    topbar:        "🔝 Barra Superior (Topbar)",
    logo:          "🖼️ Logo & Colores del menú",
    nav_items_izq: "◀ Menú — Lado izquierdo",
    nav_items_der: "▶ Menú — Lado derecho",
  };

  const NavItemsList = ({ side }) => {
    const items = filteredNav(side);
    const globalIdxOf = (item) => navItems.findIndex(x => x === item);
    return (
      <Box>
        <Typography sx={{ fontSize: "0.67rem", color: "#94a3b8", mb: 1.5 }}>
          Etiqueta visible + URL de destino. Arrastra el ícono ⣿ para reordenar.
        </Typography>
        {items.map((item, li) => {
          const gi = globalIdxOf(item);
          return (
            <Box key={gi} sx={{ mb: 1.2, p: 1.5, bgcolor: "#f8fafc", borderRadius: "10px",
              border: "1px solid #e8d5c0", display: "flex", gap: 0.8, alignItems: "center" }}>
              <DragHandleIcon sx={{ fontSize: 16, color: "#c4a98a", flexShrink: 0 }} />
              <TextField size="small" value={item.label} placeholder="Etiqueta"
                onChange={e => updateNav(gi, "label", e.target.value)}
                sx={{ flex: 1.2, "& .MuiInputBase-root": { fontSize: "0.78rem" } }} />
              <TextField size="small" value={item.href} placeholder="/ruta"
                onChange={e => updateNav(gi, "href", e.target.value)}
                InputProps={{ startAdornment: <LinkIcon sx={{ fontSize: 13, color: "#c4a98a", mr: 0.3 }} /> }}
                sx={{ flex: 1.5, "& .MuiInputBase-root": { fontSize: "0.78rem" } }} />
              <Tooltip title="Eliminar ítem">
                <IconButton size="small" onClick={() => removeNav(gi)} sx={{ color: "#ef4444", flexShrink: 0 }}>
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => addNav(side)}
          sx={{ textTransform: "none", fontSize: "0.76rem", color: "#cc6b8e", mt: 0.5,
            border: "1px dashed #cc6b8e", borderRadius: "8px", px: 1.5 }}>
          Añadir ítem al {side === "left" ? "lado izquierdo" : "lado derecho"}
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header panel */}
      <Box sx={{
        px: 2.5, py: 1.5, borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 1, bgcolor: "#fff9fb",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Box sx={{
          width: 30, height: 30, borderRadius: "8px",
          background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <EditIcon sx={{ fontSize: 14, color: "#fff" }} />
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#2c1a0e",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {zoneTitle[zone] || zone}
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "#94a3b8" }}>
            Cambios en tiempo real en el canvas
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </Box>

      {/* Cuerpo del panel */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>

        {/* ── TOPBAR ── */}
        {zone === "topbar" && (
          <>
            <FField label="Color de fondo del topbar" value={d.topbar_bgcolor}
              placeholder={DEF.topbar_bgcolor} type="color"
              onChange={v => onChange("topbar_bgcolor", v)} />
            <Divider sx={{ my: 1.5, borderColor: "#f5e8e8" }} />
            <FField label="Mensaje central del topbar" value={d.topbar_mensaje_centro}
              placeholder={DEF.topbar_mensaje_centro}
              hint="Texto informativo que aparece en el centro de la barra superior"
              onChange={v => onChange("topbar_mensaje_centro", v)} />
            <Divider sx={{ my: 1.5, borderColor: "#f5e8e8" }} />
            <FField label="Número WhatsApp a mostrar (lado derecho)" value={d.topbar_wa_numero}
              placeholder={DEF.topbar_wa_numero}
              onChange={v => onChange("topbar_wa_numero", v)} />
            <FField label="Enlace WhatsApp (wa.me/...)" value={d.topbar_wa_href}
              placeholder="https://wa.me/51982311335"
              onChange={v => onChange("topbar_wa_href", v)} />
          </>
        )}

        {/* ── LOGO ── */}
        {zone === "logo" && (
          <>
            <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                onChange("_logoFile", file);
                const reader = new FileReader();
                reader.onload = ev => onChange("_logoPreview", ev.target.result);
                reader.readAsDataURL(file);
              }} />
            <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, color: "#475569",
              mb: 0.8, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Logo central del navbar
            </Typography>
            <Box onClick={() => fileRef.current?.click()} sx={{
              border: `2px dashed ${logoSrc ? "#cc6b8e" : "#e8d5c0"}`,
              borderRadius: "12px", height: 120,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", bgcolor: "#fdf8f5", position: "relative", overflow: "hidden",
              "&:hover": { borderColor: "#cc6b8e" },
            }}>
              {logoSrc ? (
                <>
                  <Box component="img" src={logoSrc} alt="Logo"
                    sx={{ maxHeight: 90, maxWidth: "85%", objectFit: "contain" }} />
                  <Box sx={{
                    position: "absolute", inset: 0,
                    bgcolor: "rgba(204,107,142,0)", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column",
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: "rgba(204,107,142,0.35)" },
                  }}>
                    <PhotoCameraIcon sx={{ color: "#fff", fontSize: 28, opacity: 0 }} />
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: "center", color: "#c4a98a" }}>
                  <ImageOutlinedIcon sx={{ fontSize: 38, opacity: 0.5 }} />
                  <Typography sx={{ fontSize: "0.68rem", mt: 0.5 }}>
                    Clic para subir logo
                  </Typography>
                  <Typography sx={{ fontSize: "0.6rem", color: "#b8a090", mt: 0.2 }}>
                    PNG, SVG, WEBP recomendado
                  </Typography>
                </Box>
              )}
            </Box>
            {logoSrc && (
              <Button size="small" startIcon={<DeleteOutlineIcon sx={{ fontSize: 13 }} />}
                onClick={() => { onChange("_logoPreview", null); onChange("_logoFile", null); }}
                sx={{ mt: 1, color: "#ef4444", textTransform: "none", fontSize: "0.72rem" }}>
                Quitar logo
              </Button>
            )}
            <Divider sx={{ my: 2, borderColor: "#f5e8e8" }} />
            {/* <FField label="Color de fondo del navbar" value={d.nav_bgcolor} placeholder="#ffffff"
              type="color" onChange={v => onChange("nav_bgcolor", v)} />
            <FField label="Color de los enlaces del menú" value={d.nav_link_color} placeholder="#2c1a0e"
              type="color" onChange={v => onChange("nav_link_color", v)} /> */}
          </>
        )}

        {/* ── MENÚ IZQUIERDO ── */}
        {zone === "nav_items_izq" && <NavItemsList side="left" />}

        {/* ── MENÚ DERECHO ── */}
        {zone === "nav_items_der" && <NavItemsList side="right" />}

      </Box>

      {/* Footer con botón guardar */}
      <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f5e8e8", bgcolor: "#fff9fb" }}>
        <Button variant="contained" fullWidth onClick={onSave}
          startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
          disabled={saving}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.85rem",
            background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
            borderRadius: "10px", py: 1.1,
            boxShadow: "0 4px 14px rgba(204,107,142,0.4)",
            "&:hover": { background: "linear-gradient(135deg,#a0455e,#7a2a3e)" },
          }}>
          {saving ? "Guardando…" : "💾 Guardar cambios"}
        </Button>
      </Box>
    </Box>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const HeaderIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();

  const [datos,      setDatos]      = useState(null);
  const [draft,      setDraft]      = useState({});
  const [activeZone, setActiveZone] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const panelRef = useRef(null);
  const datosRef = useRef(null);
  const draftRef = useRef({});

  const merged = { ...merge(datos), ...draft };

  useEffect(() => { datosRef.current = datos; }, [datos]);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  const buildMerged = () => ({ ...merge(datosRef.current), ...draftRef.current });

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtener();
      setDatos(data || {});
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (field, value) =>
    setDraft(p => ({ ...p, [field]: value }));

  const handleEdit = (zone) => {
    setActiveZone(prev => prev === zone ? null : zone);
    setTimeout(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, 60);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const current = buildMerged();
      const formData = new FormData();
      if (current._logoFile) formData.append("image", current._logoFile);

      // Aseguramos side + compatibilidad url/href para el Blade
      const navFinal = (current.nav_items || []).map((it, idx) => {
        const link = it.href || it.url || "#";
        return {
          ...it,
          href: link,
          url:  link,   // el Blade usa 'url', el canvas usa 'href'
          side: it.side || (idx < Math.ceil(current.nav_items.length / 2) ? "left" : "right"),
        };
      });

      formData.append("nav_items",             JSON.stringify(navFinal));
      formData.append("topbar_bgcolor",         current.topbar_bgcolor         || "");
      formData.append("topbar_mensaje_centro",  current.topbar_mensaje_centro  || "");
      formData.append("topbar_wa_numero",       current.topbar_wa_numero       || "");
      formData.append("topbar_wa_href",         current.topbar_wa_href         || "");
      formData.append("nav_bgcolor",            current.nav_bgcolor            || "");
      formData.append("nav_link_color",         current.nav_link_color         || "");
      // campos legacy para compatibilidad
      formData.append("top_ubicacion",          current.topbar_mensaje_centro  || "");
      formData.append("url_whatsapp_top",       current.topbar_wa_href         || "");
      formData.append("telefono_numero",        current.topbar_wa_numero       || "");

      const saved = await actualizar(formData);
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      setDatos(saved);
      setDraft({});
      setActiveZone(null);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSaving(false);
    }
  };

  const hasDraft = Object.keys(draft).filter(k => !k.startsWith("_")).length > 0;

  return (
    <Box sx={{ p: 2.5, minHeight: "100vh", bgcolor: "#f7f3f0" }}>

      {/* ══ TOOLBAR HEADER ══ */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5, mb: 2.5,
        background: "linear-gradient(135deg,#2c1a0e,#4a2a15)",
        borderRadius: "14px", px: 2.5, py: 1.4,
        boxShadow: "0 4px 20px rgba(44,26,14,0.3)",
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: "10px",
          background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <LanguageIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#fdf8f5", lineHeight: 1.1 }}>
            Editor de Menú — Canvas
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.2 }}>
            Pasa el cursor sobre una zona y haz clic en ✏️ para editarla · Los cambios se ven en tiempo real
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {hasDraft && (
            <>
              <Chip label={`${Object.keys(draft).filter(k=>!k.startsWith('_')).length} cambio(s)`}
                size="small"
                sx={{ bgcolor: "rgba(184,134,11,0.2)", color: "#b8860b",
                  fontSize: "0.62rem", height: 22, fontWeight: 700 }} />
              <Button size="small" variant="outlined"
                onClick={() => { setDraft({}); setActiveZone(null); }}
                sx={{ textTransform: "none", fontSize: "0.72rem", color: "#94a3b8",
                  borderColor: "rgba(255,255,255,0.2)", borderRadius: "8px", py: 0.4 }}>
                Descartar
              </Button>
            </>
          )}
          <Button size="small" variant="contained"
            onClick={handleSave} disabled={saving}
            startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none", fontSize: "0.78rem", fontWeight: 700,
              background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
              borderRadius: "9px", py: 0.6,
              boxShadow: "0 3px 10px rgba(204,107,142,0.4)",
            }}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </Box>
      </Box>

      {/* ══ BODY: canvas + panel ══ */}
      <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>

        {/* Canvas */}
        <Box sx={{ flex: 1 }} onClick={() => activeZone && setActiveZone(null)}>
          <Paper elevation={0} sx={{
            borderRadius: "14px", overflow: "hidden",
            border: "1px solid #e8d5c0",
            boxShadow: "0 6px 30px rgba(44,26,14,0.1)",
          }}>
            {datos !== null ? (
              <CanvasPreview d={merged} active={activeZone} onEdit={handleEdit} />
            ) : (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography sx={{ color: "#c4a98a", fontSize: "0.85rem" }}>
                  Cargando preview del menú…
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Nota informativa */}
          <Box sx={{
            mt: 2, p: 2, bgcolor: "#fff", borderRadius: "12px",
            border: "1px solid #f0e8e8",
            display: "flex", gap: 1.5, alignItems: "flex-start",
          }}>
            <Box sx={{ flexShrink: 0, fontSize: "1.1rem" }}>💡</Box>
            <Box>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2c1a0e", mb: 0.3 }}>
                ¿Cómo editar el menú?
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#7a6020", lineHeight: 1.7 }}>
                1. Pasa el cursor sobre la zona que quieres editar (redes topbar, topbar, logo, menú izquierdo o derecho).<br />
                2. Haz clic en el <strong>ícono de lápiz ✏️ rosa</strong> que aparece.<br />
                3. Se abrirá un panel lateral con los campos editables.<br />
                4. Los cambios se ven <strong>en tiempo real</strong> en el canvas arriba.<br />
                5. Presiona <strong>"Guardar cambios"</strong> para aplicarlos al sitio web.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Panel editor lateral */}
        {activeZone && (
          <Box
            ref={panelRef}
            onClick={e => e.stopPropagation()}
            sx={{
              width: 370, flexShrink: 0,
              bgcolor: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8d5c0",
              boxShadow: "0 8px 32px rgba(204,107,142,0.15)",
              maxHeight: "80vh", overflowY: "auto",
              position: "sticky", top: 16,
              animation: "slideIn 0.2s ease",
              "@keyframes slideIn": {
                from: { opacity: 0, transform: "translateX(16px)" },
                to:   { opacity: 1, transform: "translateX(0)" },
              },
            }}
          >
            <EditPanel
              zone={activeZone}
              d={merged}
              onChange={handleChange}
              onClose={() => setActiveZone(null)}
              onSave={handleSave}
              saving={saving}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default injectIntl(WithLoandingPanel(HeaderIndexPage));
