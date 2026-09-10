import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, IconButton, Skeleton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import InboxIcon from "@mui/icons-material/Inbox";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { listar, eliminar } from "../../../api/web_rsvp_respuestas.api";
import { handleErrorMessages, handleSuccessMessages, confirmAction } from "../../../components/notify-messages";

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

const GRID_COLS = "160px 1fr 1fr 130px 64px";

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

const TRow = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: GRID_COLS,
  padding: "0 12px",
  borderBottom: "1px solid rgba(204,107,142,0.1)",
  backgroundColor: "#fff",
  "&:hover": { backgroundColor: "rgba(204,107,142,0.05)" },
  "&:last-child": { borderBottom: "none" },
}));

const TCell = styled(Box)(() => ({
  padding: "14px 12px",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
}));

const fmtFecha = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <Box key={i} sx={{ display: "grid", gridTemplateColumns: GRID_COLS, px: 1.5, py: 1.2, borderBottom: "1px solid rgba(204,107,142,0.1)" }}>
      {[130, 160, 160, 90, 32].map((w, j) => (
        <Box key={j} sx={{ px: 1, display: "flex", alignItems: "center" }}>
          <Skeleton variant="rounded" width={w} height={20} sx={{ borderRadius: "6px" }} />
        </Box>
      ))}
    </Box>
  ));

export default function RsvpRespuestasIndexPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try { setRows((await listar()) ?? []); }
    catch (e) { handleErrorMessages("Error", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const confirmados = rows.filter((r) => r.asistira === "S").length;
  const noAsisten = rows.filter((r) => r.asistira === "N").length;

  const handleEliminar = async (row) => {
    const res = await confirmAction(`¿Eliminar la confirmación de ${row.nombre}?`, "Sí, eliminar", "Cancelar");
    if (!res.isConfirmed) return;
    try {
      await eliminar(row.id_rsvp_respuesta);
      handleSuccessMessages("Listo", "Respuesta eliminada.");
      cargar();
    } catch (e) { handleErrorMessages("Error", e); }
  };

  return (
    <PageWrap>
      <HeaderCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg,#cc6b8e,#a0455e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(204,107,142,0.4)" }}>
            <HowToRegIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>
              Confirmaciones de Asistencia (RSVP)
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.3 }}>
              Respuestas enviadas desde la invitación
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip icon={<CheckCircleIcon />} label={`${confirmados} sí asisten`} sx={{ bgcolor: "rgba(34,197,94,0.18)", color: "#bbf7d0", fontWeight: 700, "& .MuiChip-icon": { color: "#4ade80" } }} />
          <Chip icon={<CancelIcon />} label={`${noAsisten} no asisten`} sx={{ bgcolor: "rgba(239,68,68,0.18)", color: "#fecaca", fontWeight: 700, "& .MuiChip-icon": { color: "#f87171" } }} />
        </Box>
      </HeaderCard>

      <TableWrap elevation={0}>
        <THead>
          <THeadCell>📅 Fecha</THeadCell>
          <THeadCell>👤 Invitado</THeadCell>
          <THeadCell>➕ Acompañante</THeadCell>
          <THeadCell>✅ Asistencia</THeadCell>
          <THeadCell></THeadCell>
        </THead>

        {loading ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <InboxIcon sx={{ fontSize: 52, color: "#e8d5c0", mb: 1.5 }} />
            <Typography sx={{ color: "#b8a090", fontWeight: 600, fontSize: "0.9rem" }}>Todavía no hay confirmaciones</Typography>
            <Typography sx={{ color: "#c4a98a", fontSize: "0.78rem", mt: 0.5 }}>Las respuestas del formulario RSVP aparecerán aquí</Typography>
          </Box>
        ) : (
          rows.map((r) => (
            <TRow key={r.id_rsvp_respuesta}>
              <TCell>
                <Typography sx={{ fontSize: "0.78rem", color: "#4a3a30" }}>{fmtFecha(r.created_at)}</Typography>
              </TCell>
              <TCell>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#2c1a0e" }}>{r.nombre}</Typography>
              </TCell>
              <TCell>
                <Typography sx={{ fontSize: "0.8rem", color: "#4a3a30" }}>{r.acompanante || "—"}</Typography>
              </TCell>
              <TCell>
                {r.asistira === "S" ? (
                  <Chip icon={<CheckCircleIcon sx={{ fontSize: "13px !important" }} />} label="Sí, asiste" size="small"
                    sx={{ bgcolor: "rgba(34,197,94,0.1)", color: "#15803d", border: "1px solid rgba(34,197,94,0.25)", fontWeight: 600, fontSize: "0.72rem", "& .MuiChip-icon": { color: "#16a34a" } }} />
                ) : (
                  <Chip icon={<CancelIcon sx={{ fontSize: "13px !important" }} />} label="No asiste" size="small"
                    sx={{ bgcolor: "rgba(239,68,68,0.1)", color: "#b91c1c", border: "1px solid rgba(239,68,68,0.25)", fontWeight: 600, fontSize: "0.72rem", "& .MuiChip-icon": { color: "#ef4444" } }} />
                )}
              </TCell>
              <TCell sx={{ justifyContent: "center" }}>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => handleEliminar(r)}
                    sx={{ width: 32, height: 32, bgcolor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.15)" } }}>
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </TCell>
            </TRow>
          ))
        )}
      </TableWrap>

      {!loading && rows.length > 0 && (
        <Typography sx={{ mt: 1.5, fontSize: "0.68rem", color: "#b8a090", textAlign: "right" }}>
          Mostrando {rows.length} respuesta{rows.length !== 1 ? "s" : ""}
        </Typography>
      )}
    </PageWrap>
  );
}
