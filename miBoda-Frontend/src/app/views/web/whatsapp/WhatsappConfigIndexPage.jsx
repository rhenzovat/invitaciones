import React, { useEffect, useState } from "react";
import {
  Box, Typography, Switch, CircularProgress,
  Divider, IconButton, Tooltip, Button, Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { obtenerWhatsappConfig, actualizarWhatsappConfig } from "../../../api/web_whatsapp_config.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

const WA_GREEN = "#25d366";
const DARK_BG  = "#1a1a1a";
const INPUT_BG = "#2a2a2a";
const ACCENT   = "#cc6b8e";

const DarkField = ({ label, value, onChange, multiline, rows, placeholder, type = "text" }) => (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ color: ACCENT, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
      {label}
    </Typography>
    <Box
      component={multiline ? "textarea" : "input"}
      type={!multiline ? type : undefined}
      rows={multiline ? (rows || 5) : undefined}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{
        width: "100%", background: INPUT_BG, border: "1px solid #3a3a3a",
        borderRadius: 1, color: "#e0e0e0", fontSize: "0.85rem",
        px: 1.5, py: 1, outline: "none", resize: multiline ? "vertical" : "none",
        fontFamily: "inherit", boxSizing: "border-box",
        "&:focus": { borderColor: WA_GREEN },
      }}
    />
  </Box>
);

const EZ = ({ children, onEdit, sx = {} }) => {
  const [hover, setHover] = useState(false);
  return (
    <Box
      position="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{ outline: hover ? `2px dashed ${WA_GREEN}` : "2px dashed transparent", borderRadius: 2, transition: "outline 0.15s", ...sx }}
    >
      {children}
      {hover && (
        <Tooltip title="Editar" placement="top">
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              position: "absolute", top: -13, right: -13, zIndex: 10,
              bgcolor: WA_GREEN, color: "#fff", width: 28, height: 28,
              "&:hover": { bgcolor: "#1da851" },
            }}
          >
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const BubblePreview = ({ config, onEditBubble, onEditButton }) => {
  const activo = config.Activo === "S";
  return (
    <Box sx={{ position: "relative", minHeight: 220, background: "#e5ddd5", borderRadius: 3, p: 3, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
      <Typography sx={{ fontSize: "0.65rem", color: "#64748b", mb: 2, textAlign: "center" }}>
        Vista previa del botón WhatsApp (esquina inferior izquierda del sitio)
      </Typography>

      <EZ onEdit={onEditBubble} sx={{ display: "inline-block", mb: 2, maxWidth: 300 }}>
        <Box sx={{ background: "#fff", borderRadius: "12px 12px 12px 2px", p: 1.5, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "inline-block" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#1a1a1a", mb: 0.3 }}>
            {config.wa_burbuja_linea1 || "💆‍♀️ ¿Lista para reservar tu experiencia?"}
          </Typography>
          <Typography sx={{ fontSize: "0.77rem", color: "#4a4a4a" }}>
            {config.wa_burbuja_linea2 || "¡Escríbenos!"}
          </Typography>
        </Box>
      </EZ>

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <EZ onEdit={onEditButton}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ position: "relative" }}>
              <Box sx={{
                bgcolor: activo ? WA_GREEN : "#9e9e9e", width: 56, height: 56, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 18px rgba(37,211,102,0.45)",
              }}>
                <WhatsAppIcon sx={{ color: "#fff", fontSize: 30 }} />
              </Box>
              {config.wa_badge && Number(config.wa_badge) > 0 && (
                <Box sx={{
                  bgcolor: "#f44336", color: "#fff", borderRadius: "50%",
                  width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.62rem", fontWeight: 700, position: "absolute", top: -4, right: -4,
                }}>
                  {config.wa_badge}
                </Box>
              )}
            </Box>
            <Typography sx={{ color: WA_GREEN, fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1 }}>
              {config.wa_label || "WHATSAPP"}
            </Typography>
          </Box>
        </EZ>
      </Box>

      {!activo && (
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.35)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", bgcolor: "rgba(0,0,0,0.6)", px: 2, py: 0.8, borderRadius: 2 }}>
            BOTÓN DESACTIVADO
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const PanelContacto = ({ config, onChange }) => (
  <Box>
    <DarkField label="Número WhatsApp (solo dígitos)" value={config.wa_numero} onChange={(v) => onChange("wa_numero", v)} placeholder="51982311335" />
    <DarkField label="Mensaje predeterminado" value={config.wa_mensaje} onChange={(v) => onChange("wa_mensaje", v)} multiline rows={6} placeholder="¡Hola! Me gustaría hacer una reserva..." />
    <DarkField label="Delay badge (segundos)" value={config.wa_delay_segundos} onChange={(v) => onChange("wa_delay_segundos", v)} type="number" />
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
      <Typography sx={{ color: "#aaa", fontSize: "0.8rem" }}>Botón activo en la web</Typography>
      <Switch
        checked={config.Activo === "S"}
        onChange={(e) => onChange("Activo", e.target.checked ? "S" : "N")}
        sx={{ "& .MuiSwitch-thumb": { bgcolor: WA_GREEN }, "& .Mui-checked + .MuiSwitch-track": { bgcolor: WA_GREEN } }}
      />
    </Box>
  </Box>
);

const PanelBurbuja = ({ config, onChange }) => (
  <Box>
    <DarkField label="Línea 1 de la burbuja" value={config.wa_burbuja_linea1} onChange={(v) => onChange("wa_burbuja_linea1", v)} placeholder="💆‍♀️ ¿Lista para reservar tu experiencia?" />
    <DarkField label="Línea 2 de la burbuja" value={config.wa_burbuja_linea2} onChange={(v) => onChange("wa_burbuja_linea2", v)} placeholder="¡Escríbenos!" />
  </Box>
);

const PanelBoton = ({ config, onChange }) => (
  <Box>
    <DarkField label="Etiqueta bajo el botón" value={config.wa_label} onChange={(v) => onChange("wa_label", v)} placeholder="WhatsApp" />
    <DarkField label="Badge (0 = ocultar)" value={config.wa_badge} onChange={(v) => onChange("wa_badge", v)} type="number" />
  </Box>
);

const WhatsappConfigIndexPage = () => {
  const { panelLeft } = useCmsPanelLayout();
  const [config, setConfig] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("contacto");

  useCmsPanelPush(panelOpen);

  useEffect(() => {
    obtenerWhatsappConfig().subscribe({
      next: (res) => {
        const d = res ?? {};
        setConfig(d);
        setDraft(d);
      },
      error: (err) => handleErrorMessages("", err),
    });
  }, []);

  const handleChange = (key, val) => setDraft((p) => ({ ...p, [key]: val }));
  const openPanel = (mode) => { setPanelMode(mode); setPanelOpen(true); };

  const handleSave = () => {
    setSaving(true);
    actualizarWhatsappConfig(draft).subscribe({
      next: (saved) => {
        const d = saved ?? draft;
        toastSuccess("WhatsApp actualizado — sincronizado con Footer y Header");
        setConfig(d);
        setDraft(d);
        setSaving(false);
        setPanelOpen(false);
      },
      error: (err) => { handleErrorMessages("", err); setSaving(false); },
    });
  };

  if (!config) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress sx={{ color: WA_GREEN }} />
      </Box>
    );
  }

  const panelTitles = {
    contacto: "Contacto WhatsApp",
    burbuja: "Burbuja del botón",
    boton: "Botón flotante",
  };

  return (
    <Box sx={{
      maxWidth: 860, mx: "auto", py: 3, px: 2,
      marginLeft: panelOpen ? `${panelLeft}px` : 0,
      transition: "margin-left 0.3s",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <WhatsAppIcon sx={{ color: WA_GREEN, fontSize: 28 }} />
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>WhatsApp Flotante</Typography>
          <Typography sx={{ color: "#888", fontSize: "0.78rem" }}>
            Botón verde de la esquina inferior izquierda — sincroniza teléfono y mensaje con Footer y Header
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem" }}>
        Al guardar, se actualizan también el teléfono corporativo del Footer, el enlace wa.me del sitio y el topbar del Header.
      </Alert>

      <Box sx={{ background: DARK_BG, borderRadius: 3, p: 3, border: "1px solid #2a2a2a" }}>
        <BubblePreview
          config={draft}
          onEditBubble={() => openPanel("burbuja")}
          onEditButton={() => openPanel("boton")}
        />

        <Divider sx={{ borderColor: "#2a2a2a", my: 2.5 }} />

        <EZ onEdit={() => openPanel("contacto")} sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ color: "#555", fontSize: "0.65rem", textTransform: "uppercase" }}>Número</Typography>
              <Typography sx={{ color: "#ddd", fontSize: "0.85rem", fontWeight: 600 }}>+{draft.wa_numero}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography sx={{ color: "#555", fontSize: "0.65rem", textTransform: "uppercase" }}>Mensaje</Typography>
              <Typography sx={{ color: "#aaa", fontSize: "0.78rem" }} noWrap>
                {draft.wa_mensaje?.slice(0, 80)}{draft.wa_mensaje?.length > 80 ? "…" : ""}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: "#555", fontSize: "0.65rem", textTransform: "uppercase" }}>Estado</Typography>
              <Typography sx={{ color: draft.Activo === "S" ? WA_GREEN : "#f44336", fontWeight: 700 }}>
                {draft.Activo === "S" ? "Activo" : "Inactivo"}
              </Typography>
            </Box>
          </Box>
        </EZ>
      </Box>

      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
            {panelTitles[panelMode]}
          </Typography>
          <IconButton size="small" onClick={() => setPanelOpen(false)} sx={{ color: "#94a3b8" }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, flex: 1 }}>
          {panelMode === "contacto" && <PanelContacto config={draft} onChange={handleChange} />}
          {panelMode === "burbuja"  && <PanelBurbuja  config={draft} onChange={handleChange} />}
          {panelMode === "boton"    && <PanelBoton    config={draft} onChange={handleChange} />}
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            sx={{ bgcolor: WA_GREEN, "&:hover": { bgcolor: "#1da851" }, fontWeight: 700, borderRadius: 2 }}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Box>
      </CmsPanelRoot>
    </Box>
  );
};

export default WhatsappConfigIndexPage;
