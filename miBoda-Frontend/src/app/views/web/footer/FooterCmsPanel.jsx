import { useState, useEffect, useRef } from "react";
import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button, Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon       from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon        from "@mui/icons-material/Save";
import AddIcon         from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import FooterRedesEditor from "./FooterRedesEditor";
import { parseNavFooter } from "../../../api/web_footer.api";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#f1f5f9",
    borderRadius: 6,
  },
  "& .MuiInputBase-input":         { color: "#f1f5f9" },
  "& .MuiInputLabel-root":         { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#cc6b8e" },
}));

const UploadZone = styled(Box, {
  shouldForwardProp: (p) => p !== "hasImg",
})(({ hasImg }) => ({
  border:          `2px dashed ${hasImg ? "#cc6b8e" : "rgba(255,255,255,0.20)"}`,
  borderRadius:    10,
  minHeight:       90,
  display:         "flex",
  flexDirection:   "column",
  alignItems:      "center",
  justifyContent:  "center",
  cursor:          "pointer",
  backgroundColor: hasImg ? "transparent" : "rgba(255,255,255,0.04)",
  overflow:        "hidden",
  position:        "relative",
  transition:      "border-color 0.2s",
  "&:hover":       { borderColor: "#cc6b8e" },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize:      "0.60rem",
  fontWeight:    700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color:         "#cc6b8e",
  marginBottom:  5,
  marginTop:     2,
}));

const Sep = () => (
  <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />
);

const BulletItemRow = ({ item, onSet, onDel }) => (
  <Box sx={{ display: "flex", gap: .75, mb: 1, alignItems: "flex-start" }}>
    <DarkField
      size="small" label="Emoji" value={item.icon ?? "✦"}
      onChange={e => onSet("icon", e.target.value)}
      sx={{ width: 64, flexShrink: 0, "& input": { textAlign: "center", fontSize: "18px" } }}
    />
    <DarkField
      size="small" label="Texto" value={item.text ?? ""}
      onChange={e => onSet("text", e.target.value)}
      sx={{ flex: 1 }}
    />
    <IconButton size="small" onClick={onDel} sx={{ color: "#f87171", mt: .5, flexShrink: 0 }}>
      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Box>
);

const BulletsColBlock = ({ label, colId, items, onSet, onDel, onAdd }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" sx={{
      color: "#cc6b8e", fontWeight: 700, fontSize: "0.60rem",
      textTransform: "uppercase", letterSpacing: ".08em", display: "block", mb: .5,
    }}>
      {label}
    </Typography>
    {items.length === 0 && (
      <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.58rem", display: "block", mb: .75 }}>
        Sin ítems aún.
      </Typography>
    )}
    {items.map((item, idx) => (
      <BulletItemRow
        key={`${colId}-${idx}`}
        item={item}
        onSet={(field, val) => onSet(idx, field, val)}
        onDel={() => onDel(idx)}
      />
    ))}
    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAdd}
      sx={{ color: "#cc6b8e", borderColor: "rgba(204,107,142,0.5)" }}>
      Agregar ítem
    </Button>
  </Box>
);

/* ── Editor de bullets — lista única ─────────────────────────────── */
const BulletsEditor = ({ bullets = [], onChange }) => {
  const toArr = (v) => (Array.isArray(v) ? v : []);

  const [items, setItems] = useState(() => toArr(bullets));

  const prevBullets = useRef(bullets);
  useEffect(() => {
    if (prevBullets.current !== bullets) {
      prevBullets.current = bullets;
      setItems(toArr(bullets));
    }
  }, [bullets]);

  const update = (next) => { setItems(next); onChange(next); };
  const setItem = (idx, field, val) => {
    const next = [...items]; next[idx] = { ...next[idx], [field]: val }; update(next);
  };
  const del  = (idx) => update(items.filter((_, i) => i !== idx));
  const add  = () => update([...items, { icon: "✦", text: "" }]);

  return (
    <Box>
      <BulletsColBlock colId="main" label="Ítems"
        items={items} onSet={setItem} onDel={del} onAdd={add} />
    </Box>
  );
};

const parseHorarioText = (value) => {
  const base = {
    sem: "Lunes a Sábado",
    semH: "10:00 AM – 09:00 PM",
    dom: "Domingo",
    domH: "Con reserva previa",
  };

  if (!value || typeof value !== "string" || !value.includes("|")) {
    return base;
  }

  const parts = value.split("|").map((part) => part.trim());
  if (parts.length >= 4) {
    return {
      sem: parts[0] || base.sem,
      semH: parts[1] || base.semH,
      dom: parts[2] || base.dom,
      domH: parts[3] || base.domH,
    };
  }

  return {
    ...base,
    sem: parts[0] || base.sem,
    domH: parts[1] || base.domH,
  };
};

const formatHorarioText = (value) => [value.sem, value.semH, value.dom, value.domH].join(" | ");

const DEFAULT_NAV_FOOTER = parseNavFooter(null);

const NavItemRow = ({ item, onSet, onDel }) => (
  <Box sx={{ display: "flex", gap: .75, mb: 1, alignItems: "flex-start" }}>
    <DarkField
      size="small" label="Texto" value={item.label ?? ""}
      onChange={e => onSet("label", e.target.value)}
      sx={{ flex: 1.15 }}
    />
    <DarkField
      size="small" label="URL" value={item.href ?? ""}
      onChange={e => onSet("href", e.target.value)}
      sx={{ flex: 1.2 }}
    />
    <IconButton size="small" onClick={onDel} sx={{ color: "#f87171", mt: .5, flexShrink: 0 }}>
      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
    </IconButton>
  </Box>
);

const NavSectionEditor = ({ label, sectionKey, navFooter = DEFAULT_NAV_FOOTER, onChange }) => {
  const current = navFooter?.[sectionKey] || DEFAULT_NAV_FOOTER[sectionKey];
  const items = Array.isArray(current.items) ? current.items : [];

  const updateSection = (nextSection) => {
    onChange("nav_footer", {
      ...(navFooter || DEFAULT_NAV_FOOTER),
      [sectionKey]: nextSection,
    });
  };

  const setTitle = (value) => updateSection({ ...current, title: value });
  const setItem = (index, field, value) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    updateSection({ ...current, items: nextItems });
  };
  const addItem = () => updateSection({ ...current, items: [...items, { label: "", href: "" }] });
  const delItem = (index) => updateSection({ ...current, items: items.filter((_, i) => i !== index) });

  return (
    <Box sx={{ mb: 2 }}>
      <SectionTag>{label}</SectionTag>
      <DarkField
        size="small"
        fullWidth
        label="Título de columna"
        value={current.title ?? ""}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 1.5 }}
      />
      {items.length === 0 && (
        <Typography variant="caption" sx={{ color: "#475569", fontSize: "0.58rem", display: "block", mb: .75 }}>
          Sin enlaces aún.
        </Typography>
      )}
      {items.map((item, idx) => (
        <NavItemRow
          key={`${sectionKey}-${idx}`}
          item={item}
          onSet={(field, val) => setItem(idx, field, val)}
          onDel={() => delItem(idx)}
        />
      ))}
      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addItem}
        sx={{ color: "#cc6b8e", borderColor: "rgba(204,107,142,0.5)" }}>
        Agregar enlace
      </Button>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = {
  cta:       { title: "Reserva tu Experiencia",    subtitle: "Título, subtítulo y teléfono de contacto" },
  marca:     { title: "Logo & Descripción",        subtitle: "Logo y texto de la empresa (columna 1)" },
  horario:   { title: "Horario",                   subtitle: "Horarios de atención (columna 2)" },
  links:     { title: "Links",                     subtitle: "Enlaces de navegación editables (columna 3)" },
  servicios: { title: "Servicios",                 subtitle: "Servicios editables (columna 4)" },
  contacto:  { title: "Contacto",                  subtitle: "Información de contacto (columna 5)" },
  promociones: { title: "Promociones",             subtitle: "Código QR y texto promocional (columna 6)" },
  footer:    { title: "Barra inferior",            subtitle: "Copyright y texto de la barra inferior" },
};

// ─────────────────────────────────────────────────────────────────────────────

const FooterCmsPanel = ({
  open,
  panelLeft = 0,
  section,
  datos,
  onChange,
  onSave,
  onClose,
  previewLogoFooter,
  imgFooterUrl,
  previewImgCentro,
  imgCentroUrl,
  inputLogoFooterRef,
  inputImgCentroRef,
  onLogoFooterChange,
  onImgCentroChange,
}) => {
  const meta = SECTIONS[section] || SECTIONS.cta;

  // Campo de texto genérico
  const F = (label, key, multiline = false, rows = 3, ph = "") => (
    <DarkField
      key={key}
      size="small"
      fullWidth
      label={label}
      value={datos?.[key] ?? ""}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      placeholder={ph}
      onChange={(e) => onChange(key, e.target.value)}
      sx={{ mb: 1.5 }}
    />
  );

  // Bloque de logo upload
  const LogoUpload = ({ previewUrl, storedUrl, inputRef, onFileChange, label, previewFlag }) => (
    <>
      <SectionTag>{label}</SectionTag>
      <UploadZone hasImg={!!(previewUrl || storedUrl)} onClick={() => inputRef.current?.click()} sx={{ mb: 1 }}>
        {(previewUrl || storedUrl) ? (
          <>
            <img
              src={previewUrl || storedUrl}
              alt={label}
              style={{ maxHeight: 70, maxWidth: "90%", objectFit: "contain", padding: 6 }}
            />
            <Box sx={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              bgcolor: "rgba(0,0,0,0.65)", py: 0.4, textAlign: "center",
            }}>
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.58rem" }}>
                Cambiar imagen
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 0.5 }}>
            <CloudUploadIcon sx={{ fontSize: 24, color: "#475569" }} />
            <Typography variant="caption" sx={{ display: "block", color: "#64748b", fontSize: "0.60rem", mt: 0.3 }}>
              Clic para seleccionar
            </Typography>
          </Box>
        )}
      </UploadZone>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.jpg,.jpeg,.jfif,.png,.webp" style={{ display: "none" }} onChange={onFileChange} />
      {previewFlag && (
        <Typography variant="caption" sx={{ color: "#cc6b8e", fontSize: "0.60rem", mb: 1, display: "block" }}>
          ✓ Lista para guardar
        </Typography>
      )}
    </>
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>

      {/* ── Cabecera ─────────────────────────────────────────────────── */}
      <Box sx={{
        px: 2, py: 1.5,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", top: 0, zIndex: 1,
        gap: 1,
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {meta.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {meta.subtitle}
          </Typography>
        </Box>
        <Tooltip title="Cerrar editor">
          <IconButton size="small" onClick={onClose}
            sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#cc6b8e" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Campos ───────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

        {/* ══ CTA — Reserva tu Experiencia ══════════════════════════ */}
        {section === "cta" && (<>
          <SectionTag>Título (columna derecha)</SectionTag>
          {F("Título principal", "footer_cta_titulo", true, 2,
            "RESERVA TU EXPERIENCIA")}

          <SectionTag>Subtítulo</SectionTag>
          {F("Subtítulo", "footer_cta_subtitulo", false, 1,
            "¿Lista para reservar tu experiencia?")}

          <Sep />
          <SectionTag>Teléfono / WhatsApp principal</SectionTag>
          {F("Teléfono visible (ej: 982 311 335)", "contacto_telefono", false, 1, "982 311 335")}

          <Sep />
          <SectionTag>Mensaje de WhatsApp (todo el sitio)</SectionTag>
          {F("Mensaje al abrir WhatsApp", "whatsapp_mensaje", true, 4,
            "¡Hola! Quisiera reservar una sesión de masaje en Royal Masajes.")}
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mb: 1.5 }}>
            Este texto se envía automáticamente en el botón flotante, header, footer y demás enlaces de WhatsApp.
          </Typography>

          <Sep />
          <SectionTag>Ítems de la columna derecha</SectionTag>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mb: 1 }}>
            Agrega o elimina los puntos de la lista (emoji + texto). Se muestran en 2 columnas.
          </Typography>
          <BulletsEditor
            bullets={datos?.footer_bullets ?? []}
            onChange={(list) => onChange("footer_bullets", list)}
          />
        </>)}

        {/* ══ MARCA / LOGO ═══════════════════════════════════════════ */}
        {section === "marca" && (<>
          <SectionTag>Descripción (tarjeta izquierda)</SectionTag>
          {F("Texto de la empresa", "descripcion_footer", true, 6,
            "Amour Spa es un centro de bienestar en Miraflores especializado en masajes relajantes y terapias corporales.")}

          <Sep />
          <LogoUpload
            label="Logo del footer"
            previewUrl={previewLogoFooter}
            storedUrl={imgFooterUrl}
            inputRef={inputLogoFooterRef}
            onFileChange={onLogoFooterChange}
            previewFlag={!!previewLogoFooter}
          />

          <Sep />
          <SectionTag>Redes sociales (Instagram, WhatsApp…)</SectionTag>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mb: 1 }}>
            Aparecen bajo la descripción en la tarjeta izquierda (y en el resto del sitio).
          </Typography>
          <FooterRedesEditor
            redes={datos?.footer_redes ?? []}
            onChange={(list) => onChange("footer_redes", list)}
          />
        </>)}

        {/* ══ HORARIO ═══════════════════════════════════════════════════ */}
        {section === "horario" && (<>
          {(() => {
            const horario = parseHorarioText(datos?.nuestros_horarios || "");
            const updateHorario = (field, value) => {
              const next = { ...horario, [field]: value };
              onChange("nuestros_horarios", formatHorarioText(next));
            };

            return (
              <>
                <SectionTag>Título del bloque</SectionTag>
                <DarkField
                  size="small"
                  fullWidth
                  label="Título"
                  value={datos?.footer_horario_titulo ?? "Horario"}
                  onChange={(e) => onChange("footer_horario_titulo", e.target.value)}
                  sx={{ mb: 1.5 }}
                />

                <SectionTag>Bloque lunes a sábado</SectionTag>
                <DarkField
                  size="small"
                  fullWidth
                  label="Días"
                  value={horario.sem}
                  onChange={(e) => updateHorario("sem", e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <DarkField
                  size="small"
                  fullWidth
                  label="Horario"
                  value={horario.semH}
                  onChange={(e) => updateHorario("semH", e.target.value)}
                  sx={{ mb: 1.5 }}
                />

                <SectionTag>Bloque domingo</SectionTag>
                <DarkField
                  size="small"
                  fullWidth
                  label="Días"
                  value={horario.dom}
                  onChange={(e) => updateHorario("dom", e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <DarkField
                  size="small"
                  fullWidth
                  label="Horario"
                  value={horario.domH}
                  onChange={(e) => updateHorario("domH", e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mt: 0.5 }}>
                  Cada bloque del horario se edita por separado y se guarda en el footer.
                </Typography>
              </>
            );
          })()}
        </>)}

        {/* ══ LINKS ═════════════════════════════════════════════════════ */}
        {section === "links" && (<>
          <NavSectionEditor
            label="Enlaces de navegación"
            sectionKey="links"
            navFooter={datos?.nav_footer ?? DEFAULT_NAV_FOOTER}
            onChange={onChange}
          />
        </>)}

        {/* ══ SERVICIOS ═════════════════════════════════════════════════ */}
        {section === "servicios" && (<>
          <NavSectionEditor
            label="Servicios ofrecidos"
            sectionKey="services"
            navFooter={datos?.nav_footer ?? DEFAULT_NAV_FOOTER}
            onChange={onChange}
          />
        </>)}

        {/* ══ CONTACTO ═════════════════════════════════════════════════ */}
        {section === "contacto" && (<>
          <SectionTag>Información de contacto</SectionTag>
          {F("Teléfono", "contacto_telefono", false, 1, "+51 977 807 314")}
          {F("Email", "contacto_email", false, 1, "informacion@amourspa.com")}
          {F("Dirección completa", "contacto_direccion", true, 3,
            "Av. Ernesto Diez Canseco 204, Miraflores, Lima 15074 Miraflores, Lima, Perú")}
        </>)}

        {/* ══ PROMOCIONES ═══════════════════════════════════════════════ */}
        {section === "promociones" && (<>
          <SectionTag>Texto promocional</SectionTag>
          {F("Mensaje promocional", "promo_texto", true, 3,
            "Escanea el código QR y síguenos en Instagram para novedades, tips de piel y ofertas especiales.")}
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mb: 1.5 }}>
            Se muestra en la columna Promociones con el código QR.
          </Typography>

          <Sep />
          <SectionTag>Correo de contacto</SectionTag>
          {F("Email", "contacto_email", false, 1, "informacion@amourspa.com")}

          <Sep />
          <SectionTag>Imagen del código QR</SectionTag>
          <LogoUpload
            label="Subir código QR"
            previewUrl={previewImgCentro}
            storedUrl={imgCentroUrl}
            inputRef={inputImgCentroRef}
            onFileChange={onImgCentroChange}
            previewFlag={!!previewImgCentro}
          />
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mt: 0.5 }}>
            Se muestra debajo del texto promocional. Recomendado: imagen cuadrada (PNG/JPG).
          </Typography>
        </>)}

        {/* ══ CONTACTO & PROMOCIONES (anterior) ════════════════════════════ */}

        {/* ══ PIE DE PÁGINA ══════════════════════════════════════════ */}
        {section === "footer" && (<>
          <SectionTag>Texto de la barra inferior</SectionTag>
          {F("Copyright", "texto_copyright", false, 1, 
            "Copyright © Amour Spa 2026. Tous droits réservés · Miraflores, Lima.")}
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block", mb: 1.5 }}>
            Se muestra en la barra inferior del footer. Usa © para el símbolo de copyright.
          </Typography>
        </>)}

      </Box>

      {/* ── Botón Guardar fijo al fondo ──────────────────────────────── */}
      <Box sx={{
        px: 2, py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", bottom: 0,
      }}>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            sx={{
              background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
              color: "#fff", fontWeight: 700,
              "&:hover": { background: "linear-gradient(135deg,#a0455e,#7a2a3e)" },
            }}
          >
            Guardar cambios
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>

    </CmsPanelRoot>
  );
};

export default FooterCmsPanel;