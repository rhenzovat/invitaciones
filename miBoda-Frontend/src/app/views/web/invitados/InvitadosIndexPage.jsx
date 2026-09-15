import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, IconButton, Tooltip, TextField, Button, LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";

import { listar, crear, actualizar, eliminar } from "../../../api/web_invitados.api";
import { handleErrorMessages, handleSuccessMessages, confirmAction } from "../../../components/notify-messages";
import { EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf } from "../evento/EventoEditors";

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
  gap: "16px",
  boxShadow: "0 6px 28px rgba(44,26,14,0.3)",
}));

const TableWrap = styled(Paper)(() => ({
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(204,107,142,0.15)",
  boxShadow: "0 4px 24px rgba(44,26,14,0.08)",
}));

const GRID_COLS = "1.3fr 70px 105px 1fr 120px 1fr 80px";

function formatearFechaRsvp(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

const RSVP_ESTADO_CHIP = {
  confirmado: { label: "Confirmó", bgcolor: "rgba(34,197,94,0.14)", color: "#16a34a" },
  no_asiste: { label: "No asiste", bgcolor: "rgba(239,68,68,0.14)", color: "#dc2626" },
  pendiente: { label: "Pendiente", bgcolor: "rgba(148,163,184,0.18)", color: "#64748b" },
};

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
  padding: "12px",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
}));

export default function InvitadosIndexPage() {
  const [invitados, setInvitados] = useState([]);
  const [capacidad, setCapacidad] = useState(100);
  const [pasesTotales, setPasesTotales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState(false);
  const [form, setForm] = useState({ nombre: "", pases_asignados: 1, notas: "" });

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await listar();
      setInvitados(res.invitados ?? []);
      setCapacidad(res.capacidad_maxima ?? 100);
      setPasesTotales(res.pases_totales ?? 0);
    } catch (e) { handleErrorMessages("Error", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm({ nombre: "", pases_asignados: 1, notas: "" }); setPanel(true); };
  const abrirEditar = (inv) => { setForm({ id_invitado: inv.id_invitado, nombre: inv.nombre, pases_asignados: inv.pases_asignados, notas: inv.notas || "" }); setPanel(true); };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const guardar = async () => {
    if (!form.nombre?.trim()) { handleErrorMessages("Error", { message: "El nombre es obligatorio." }); return; }
    setSaving(true);
    try {
      if (form.id_invitado) await actualizar(form);
      else await crear(form);
      handleSuccessMessages("Guardado", "Invitado guardado correctamente.");
      setPanel(false);
      cargar();
    } catch (e) { handleErrorMessages("Error", e); }
    finally { setSaving(false); }
  };

  const handleEliminar = async (inv) => {
    const res = await confirmAction(`¿Eliminar a ${inv.nombre} de la lista?`, "Sí, eliminar", "Cancelar");
    if (!res.isConfirmed) return;
    try {
      await eliminar(inv.id_invitado);
      handleSuccessMessages("Listo", "Invitado eliminado.");
      cargar();
    } catch (e) { handleErrorMessages("Error", e); }
  };

  const pct = capacidad ? Math.min(100, Math.round((pasesTotales / capacidad) * 100)) : 0;
  const sobrepasado = pasesTotales > capacidad;

  return (
    <PageWrap>
      <HeaderCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg,#cc6b8e,#a0455e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(204,107,142,0.4)" }}>
            <GroupsIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>Lista de Invitados</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.3 }}>
              Planificación de a quién invitar y cuántos pases tiene cada uno — no afecta el RSVP público
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ minWidth: 180 }}>
            <Typography sx={{ fontSize: "0.7rem", color: sobrepasado ? "#fca5a5" : "#d9c6a8", textAlign: "right", mb: 0.5 }}>
              {pasesTotales} / {capacidad} cupos asignados
            </Typography>
            <LinearProgress
              variant="determinate" value={pct}
              sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.12)",
                "& .MuiLinearProgress-bar": { bgcolor: sobrepasado ? "#ef4444" : "#22c55e", borderRadius: 4 } }}
            />
          </Box>
          <Button
            variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}
            sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", textTransform: "none", fontWeight: 700, borderRadius: "10px", whiteSpace: "nowrap" }}
          >
            Agregar
          </Button>
        </Box>
      </HeaderCard>

      <TableWrap elevation={0}>
        <THead>
          <THeadCell>Nombre</THeadCell>
          <THeadCell>Pases</THeadCell>
          <THeadCell>Fecha confirmó</THeadCell>
          <THeadCell>Acompañante</THeadCell>
          <THeadCell>Estado RSVP</THeadCell>
          <THeadCell>Notas</THeadCell>
          <THeadCell></THeadCell>
        </THead>

        {loading ? (
          <Box sx={{ p: 4, textAlign: "center", color: "#a89a7d" }}>Cargando...</Box>
        ) : invitados.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: "#b8a090" }}>Aún no has agregado invitados a la lista</Box>
        ) : (
          invitados.map((inv) => (
            <TRow key={inv.id_invitado}>
              <TCell><Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#2c1a0e" }}>{inv.nombre}</Typography></TCell>
              <TCell><Chip size="small" label={inv.pases_asignados} sx={{ bgcolor: "rgba(204,107,142,0.12)", color: "#a0455e", fontWeight: 700 }} /></TCell>
              <TCell><Typography sx={{ fontSize: "0.78rem", color: "#8a7a5c" }}>{formatearFechaRsvp(inv.rsvp_fecha)}</Typography></TCell>
              <TCell><Typography sx={{ fontSize: "0.78rem", color: "#8a7a5c" }}>{inv.rsvp_acompanante || "—"}</Typography></TCell>
              <TCell>
                {(() => {
                  const chip = RSVP_ESTADO_CHIP[inv.rsvp_estado] || RSVP_ESTADO_CHIP.pendiente;
                  return <Chip size="small" label={chip.label} sx={{ bgcolor: chip.bgcolor, color: chip.color, fontWeight: 700 }} />;
                })()}
              </TCell>
              <TCell><Typography sx={{ fontSize: "0.78rem", color: "#8a7a5c" }}>{inv.notas || "—"}</Typography></TCell>
              <TCell sx={{ gap: 0.5 }}>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => abrirEditar(inv)} sx={{ color: "#a0455e" }}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => handleEliminar(inv)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                </Tooltip>
              </TCell>
            </TRow>
          ))
        )}
      </TableWrap>

      {panel && (
        <EditPanel open title={form.id_invitado ? "Editar invitado" : "Agregar invitado"} onClose={() => setPanel(false)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          <TextField {...darkTf} type="number" label="Pases asignados" inputProps={{ min: 1, max: 50 }} value={form.pases_asignados} onChange={(e) => set("pases_asignados", parseInt(e.target.value || "1", 10))} />
          <TextField {...darkTf} label="Notas (opcional)" multiline minRows={2} value={form.notas} onChange={(e) => set("notas", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
