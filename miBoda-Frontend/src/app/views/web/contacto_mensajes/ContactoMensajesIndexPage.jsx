import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Chip, Avatar, IconButton,
  Skeleton, Tooltip, Divider, Button, Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VisibilityIcon      from "@mui/icons-material/Visibility";
import EmailIcon           from "@mui/icons-material/Email";
import PhoneIcon           from "@mui/icons-material/Phone";
import SpaIcon             from "@mui/icons-material/Spa";
import CalendarTodayIcon   from "@mui/icons-material/CalendarToday";
import CloseIcon           from "@mui/icons-material/Close";
import InboxIcon           from "@mui/icons-material/Inbox";
import MessageIcon         from "@mui/icons-material/Message";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import WhatsAppIcon        from "@mui/icons-material/WhatsApp";
import PersonIcon          from "@mui/icons-material/Person";

import { listar, obtener } from "../../../api/web_contacto_mensaje.api";
import { handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

// ─── Styled helpers ───────────────────────────────────────────────────────────
const PageWrap = styled(Box)(() => ({
  padding: "24px",
  minHeight: "100vh",
  background: "#f7f3f0",
}));

const HeaderCard = styled(Box)(() => ({
  background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
  borderRadius: "16px",
  padding: "20px 28px",
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  boxShadow: "0 6px 28px rgba(44,26,14,0.3)",
}));

const TableWrap = styled(Paper)(() => ({
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(204,107,142,0.15)",
  boxShadow: "0 4px 24px rgba(44,26,14,0.08)",
}));

const GRID_COLS = "140px 180px 130px 140px 1fr 110px 56px";

const THead = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: GRID_COLS,
  background: "linear-gradient(135deg, #fdf8f5, #f5eae4)",
  borderBottom: "2px solid rgba(204,107,142,0.2)",
  padding: "0 12px",
}));

const THeadCell = styled(Typography)(() => ({
  padding: "14px 12px",
  fontSize: "0.67rem",
  fontWeight: 800,
  color: "#7a4030",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
}));

const TRow = styled(Box)(({ selected }) => ({
  display: "grid",
  gridTemplateColumns: GRID_COLS,
  padding: "0 12px",
  borderBottom: "1px solid rgba(204,107,142,0.1)",
  transition: "background-color 0.15s",
  backgroundColor: selected ? "rgba(204,107,142,0.06)" : "#fff",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(204,107,142,0.07)",
  },
  "&:last-child": { borderBottom: "none" },
}));

const TCell = styled(Box)(() => ({
  padding: "14px 12px",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
}));

// ─── Iniciales del avatar ─────────────────────────────────────────────────────
// Null-safe: el mensaje del formulario puede no traer apellido (queda null en BD).
const initials = (nombre, apellido) =>
  (`${(nombre || "").charAt(0)}${(apellido || "").charAt(0)}`.toUpperCase() || "??");

const avatarColor = (str) => {
  const s = str || "";
  const colors = ["#cc6b8e", "#b8860b", "#a0455e", "#7a6020", "#8b6508", "#6d3a2a"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const fmtFecha = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ─── Skeleton rows ────────────────────────────────────────────────────────────
const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <Box key={i} sx={{ display: "grid", gridTemplateColumns: GRID_COLS,
      px: 1.5, py: 1.2, borderBottom: "1px solid rgba(204,107,142,0.1)" }}>
      {[110, 150, 100, 120, 180, 80, 32].map((w, j) => (
        <Box key={j} sx={{ px: 1, display: "flex", alignItems: "center" }}>
          <Skeleton variant="rounded" width={w} height={j === 1 ? 32 : 20} sx={{ borderRadius: "6px" }} />
        </Box>
      ))}
    </Box>
  ));

// ─── Panel de detalle ─────────────────────────────────────────────────────────
function DetailPanel({ open, panelLeft, detail, onClose }) {
  if (!detail) return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      <Box sx={{ p: 3, color: "#94a3b8", textAlign: "center", mt: 4 }}>
        <InboxIcon sx={{ fontSize: 40, opacity: 0.3 }} />
        <Typography sx={{ mt: 1, fontSize: "0.82rem" }}>Sin mensaje seleccionado</Typography>
      </Box>
    </CmsPanelRoot>
  );

  const bg = avatarColor(detail.nombre);
  const waLink = detail.telefono
    ? `https://wa.me/51${String(detail.telefono).replace(/\D/g, "")}`
    : null;

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2,
        background: "linear-gradient(135deg,rgba(44,26,14,0.95),rgba(74,42,21,0.95))",
        display: "flex", alignItems: "flex-start", gap: 1.5,
        position: "sticky", top: 0, zIndex: 10,
        borderBottom: "1px solid rgba(204,107,142,0.2)",
      }}>
        <Avatar sx={{ bgcolor: bg, width: 42, height: 42, fontSize: "0.95rem", fontWeight: 700, flexShrink: 0 }}>
          {initials(detail.nombre, detail.apellido)}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#fdf8f5", lineHeight: 1.2 }}>
            {detail.nombre} {detail.apellido}
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", mt: 0.2 }}>
            Mensaje recibido
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#cc6b8e" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2.5, py: 2, flex: 1, overflowY: "auto" }}>

        {/* Info cards */}
        {[
          { icon: <EmailIcon sx={{ fontSize: 14 }} />, label: "Email", value: detail.email, color: "#cc6b8e" },
          { icon: <PhoneIcon sx={{ fontSize: 14 }} />, label: "Teléfono", value: detail.telefono, color: "#b8860b" },
          { icon: <SpaIcon sx={{ fontSize: 14 }} />, label: "Servicio interés", value: detail.producto_interes || detail.asunto, color: "#a0455e" },
          { icon: <CalendarTodayIcon sx={{ fontSize: 14 }} />, label: "Fecha", value: fmtFecha(detail.created_at || detail.fecha_mensaje), color: "#7a4030" },
        ].map((item, i) => (
          item.value ? (
            <Box key={i} sx={{
              display: "flex", alignItems: "flex-start", gap: 1.2, mb: 1.8,
              p: 1.5, borderRadius: "10px",
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "8px", flexShrink: 0,
                bgcolor: `${item.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.color,
              }}>
                {item.icon}
              </Box>
              <Box minWidth={0}>
                <Typography sx={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: 0.6, lineHeight: 1 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#f1f5f9", mt: 0.3,
                  wordBreak: "break-word", lineHeight: 1.4 }}>
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ) : null
        ))}

        {/* Mensaje */}
        {detail.mensaje && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#cc6b8e",
              textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
              Mensaje
            </Typography>
            <Box sx={{
              bgcolor: "rgba(255,255,255,0.04)", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.07)",
              p: 2,
            }}>
              <Typography sx={{ fontSize: "0.82rem", color: "#e2e8f0",
                whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                {detail.mensaje}
              </Typography>
            </Box>
          </>
        )}

        {/* Email enviado */}
        {detail.email_enviado && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 14, color: "#22c55e" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "#22c55e" }}>
              Email de confirmación enviado
            </Typography>
          </Box>
        )}

        {/* Acciones */}
        {waLink && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />
            <Button
              fullWidth variant="contained" startIcon={<WhatsAppIcon />}
              href={waLink} target="_blank" rel="noopener"
              sx={{
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                textTransform: "none", fontWeight: 700, borderRadius: "10px",
                py: 1, boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                "&:hover": { background: "linear-gradient(135deg,#16a34a,#15803d)" },
              }}>
              Responder por WhatsApp
            </Button>
          </>
        )}
      </Box>
    </CmsPanelRoot>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function ContactoMensajesIndexPage() {
  const { panelLeft }              = useCmsPanelLayout();
  const [panelOpen, setPanelOpen]  = useState(false);
  useCmsPanelPush(panelOpen);

  const [rows,    setRows]    = useState([]);
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [selId,   setSelId]   = useState(null);

  useEffect(() => {
    (async () => {
      try { setRows((await listar()) ?? []); }
      catch (e) { handleErrorMessages(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const openDetail = async (row) => {
    try {
      setSelId(row.id);
      setDetail(await obtener({ id: row.id }));
      setPanelOpen(true);
    } catch (e) { handleErrorMessages(e); }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelId(null);
  };

  return (
    <>
      <DetailPanel
        open={panelOpen}
        panelLeft={panelLeft}
        detail={detail}
        onClose={closePanel}
      />

      <PageWrap>

        {/* ══ HEADER ══ */}
        <HeaderCard>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              width: 46, height: 46, borderRadius: "12px",
              background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(204,107,142,0.4)",
            }}>
              <MessageIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>
                Mensajes Recibidos
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.3 }}>
                Formulario de contacto del sitio web
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label={`${rows.length} mensaje${rows.length !== 1 ? "s" : ""}`}
              size="small"
              sx={{ bgcolor: "rgba(204,107,142,0.25)", color: "#f5c6d8",
                fontWeight: 700, fontSize: "0.72rem", border: "1px solid rgba(204,107,142,0.35)" }}
            />
          </Box>
        </HeaderCard>

        {/* ══ TABLA ══ */}
        <TableWrap elevation={0}>

          {/* Cabecera columnas */}
          <THead>
            <THeadCell>📅 Fecha</THeadCell>
            <THeadCell>👤 Cliente</THeadCell>
            <THeadCell>📱 Teléfono</THeadCell>
            <THeadCell>💆 Servicio / Asunto</THeadCell>
            <THeadCell>💬 Mensaje</THeadCell>
            <THeadCell>✉️ Estado</THeadCell>
            <THeadCell>{/* acciones */}</THeadCell>
          </THead>

          {/* Filas */}
          {loading ? (
            <SkeletonRows />
          ) : rows.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <InboxIcon sx={{ fontSize: 52, color: "#e8d5c0", mb: 1.5 }} />
              <Typography sx={{ color: "#b8a090", fontWeight: 600, fontSize: "0.9rem" }}>
                Todavía no hay mensajes
              </Typography>
              <Typography sx={{ color: "#c4a98a", fontSize: "0.78rem", mt: 0.5 }}>
                Los mensajes del formulario de contacto aparecerán aquí
              </Typography>
            </Box>
          ) : (
            rows.map((r) => {
              const bg = avatarColor(r.nombre);
              const isSelected = selId === r.id;
              return (
                <TRow
                  key={r.id}
                  selected={isSelected ? 1 : 0}
                  onClick={() => openDetail(r)}
                >
                  {/* Fecha */}
                  <TCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2 }}>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#2c1a0e", lineHeight: 1.2 }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }) : "—"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.66rem", color: "#94a3b8" }}>
                        {r.created_at ? new Date(r.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </Typography>
                    </Box>
                  </TCell>

                  {/* Cliente */}
                  <TCell sx={{ gap: 1.2 }}>
                    <Avatar sx={{ bgcolor: bg, width: 34, height: 34, fontSize: "0.72rem",
                      fontWeight: 700, flexShrink: 0, boxShadow: `0 2px 8px ${bg}55` }}>
                      {initials(r.nombre, r.apellido)}
                    </Avatar>
                    <Box minWidth={0}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#2c1a0e",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.nombre} {r.apellido}
                      </Typography>
                      {r.email && (
                        <Typography sx={{ fontSize: "0.66rem", color: "#94a3b8",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.email}
                        </Typography>
                      )}
                    </Box>
                  </TCell>

                  {/* Teléfono */}
                  <TCell>
                    {r.telefono ? (
                      <Chip
                        icon={<PhoneIcon sx={{ fontSize: "13px !important" }} />}
                        label={r.telefono}
                        size="small"
                        sx={{
                          bgcolor: "rgba(34,197,94,0.1)", color: "#15803d",
                          border: "1px solid rgba(34,197,94,0.25)",
                          fontWeight: 600, fontSize: "0.72rem",
                          "& .MuiChip-icon": { color: "#16a34a" },
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: "0.72rem", color: "#c4a98a" }}>—</Typography>
                    )}
                  </TCell>

                  {/* Servicio */}
                  <TCell>
                    {(r.producto_interes || r.asunto) ? (
                      <Chip
                        icon={<SpaIcon sx={{ fontSize: "13px !important" }} />}
                        label={r.producto_interes || r.asunto}
                        size="small"
                        sx={{
                          maxWidth: 200,
                          bgcolor: "rgba(204,107,142,0.1)", color: "#a0455e",
                          border: "1px solid rgba(204,107,142,0.25)",
                          fontWeight: 600, fontSize: "0.7rem",
                          "& .MuiChip-icon": { color: "#cc6b8e" },
                          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: "0.72rem", color: "#c4a98a" }}>—</Typography>
                    )}
                  </TCell>

                  {/* Mensaje */}
                  <TCell>
                    {r.mensaje ? (
                      <Tooltip title={r.mensaje} placement="top">
                        <Typography sx={{
                          fontSize: "0.76rem", color: "#4a3a30", lineHeight: 1.35,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden", textOverflow: "ellipsis", wordBreak: "break-word",
                        }}>
                          {r.mensaje}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography sx={{ fontSize: "0.72rem", color: "#c4a98a" }}>—</Typography>
                    )}
                  </TCell>

                  {/* Email enviado */}
                  <TCell>
                    {r.email_enviado ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: "13px !important" }} />}
                        label="Enviado"
                        size="small"
                        sx={{
                          bgcolor: "rgba(34,197,94,0.1)", color: "#15803d",
                          border: "1px solid rgba(34,197,94,0.25)",
                          fontWeight: 600, fontSize: "0.7rem",
                          "& .MuiChip-icon": { color: "#16a34a" },
                        }}
                      />
                    ) : (
                      <Chip label="Pendiente" size="small"
                        sx={{ bgcolor: "rgba(251,191,36,0.1)", color: "#92400e",
                          border: "1px solid rgba(251,191,36,0.25)", fontWeight: 600, fontSize: "0.7rem" }} />
                    )}
                  </TCell>

                  {/* Acción */}
                  <TCell sx={{ justifyContent: "center" }}>
                    <Tooltip title="Ver detalle" placement="left">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); openDetail(r); }}
                        sx={{
                          width: 32, height: 32,
                          bgcolor: isSelected ? "rgba(204,107,142,0.15)" : "rgba(204,107,142,0.08)",
                          border: "1px solid rgba(204,107,142,0.2)",
                          color: "#cc6b8e",
                          "&:hover": { bgcolor: "rgba(204,107,142,0.2)", borderColor: "#cc6b8e" },
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </TCell>
                </TRow>
              );
            })
          )}
        </TableWrap>

        {/* Footer count */}
        {!loading && rows.length > 0 && (
          <Typography sx={{ mt: 1.5, fontSize: "0.68rem", color: "#b8a090", textAlign: "right" }}>
            Mostrando {rows.length} mensaje{rows.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </PageWrap>
    </>
  );
}
