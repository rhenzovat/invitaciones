import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, IconButton, Tooltip, TextField, Button, LinearProgress, InputAdornment, MenuItem } from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIcon from "@mui/icons-material/Phone";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

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
  overflowX: "auto",
  overflowY: "hidden",
  border: "1px solid rgba(204,107,142,0.15)",
  boxShadow: "0 4px 24px rgba(44,26,14,0.08)",
}));

const GRID_COLS = "1.3fr 140px 70px 105px 1fr 120px 1fr 80px";

function normalizar(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function soloDigitos(s) {
  return (s || "").toString().replace(/\D/g, "");
}

const ESTADOS_RSVP_OPCIONES = [
  { value: "pendiente", label: "Pendiente (sin respuesta)" },
  { value: "confirmado", label: "Confirmó asistencia" },
  { value: "no_asiste", label: "No asistirá" },
];

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
  const [form, setForm] = useState({ nombre: "", pases_asignados: 1, notas: "", celular: "" });
  const [busqueda, setBusqueda] = useState("");
  const [filtroFamilia, setFiltroFamilia] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

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

  const abrirNuevo = () => { setForm({ nombre: "", pases_asignados: 1, notas: "", celular: "" }); setPanel(true); };
  const abrirEditar = (inv) => {
    setForm({
      id_invitado: inv.id_invitado,
      nombre: inv.nombre,
      pases_asignados: inv.pases_asignados,
      notas: inv.notas || "",
      celular: inv.celular || "",
      rsvp_estado: inv.rsvp_estado || "pendiente",
      rsvp_acompanante: inv.rsvp_acompanante || "",
    });
    setPanel(true);
  };
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

  const conteoFamilia = {
    todos: invitados.length,
    novio: invitados.filter((inv) => normalizar(inv.notas) === "novio").length,
    novia: invitados.filter((inv) => normalizar(inv.notas) === "novia").length,
  };

  const invitadosPorFamilia = filtroFamilia === "todos"
    ? invitados
    : invitados.filter((inv) => normalizar(inv.notas) === filtroFamilia);

  const conteoEstado = {
    todos: invitadosPorFamilia.length,
    pendiente: invitadosPorFamilia.filter((inv) => inv.rsvp_estado === "pendiente").length,
    confirmado: invitadosPorFamilia.filter((inv) => inv.rsvp_estado === "confirmado").length,
    no_asiste: invitadosPorFamilia.filter((inv) => inv.rsvp_estado === "no_asiste").length,
  };

  const invitadosPorEstado = filtroEstado === "todos"
    ? invitadosPorFamilia
    : invitadosPorFamilia.filter((inv) => inv.rsvp_estado === filtroEstado);

  const terminoBusqueda = normalizar(busqueda);
  const digitosBusqueda = soloDigitos(busqueda);
  const invitadosFiltrados = terminoBusqueda
    ? invitadosPorEstado.filter((inv) =>
        normalizar(inv.nombre).includes(terminoBusqueda) ||
        normalizar(inv.notas).includes(terminoBusqueda) ||
        normalizar(inv.rsvp_acompanante).includes(terminoBusqueda) ||
        (digitosBusqueda.length >= 3 && soloDigitos(inv.celular).includes(digitosBusqueda)),
      )
    : invitadosPorEstado;

  const hayFiltrosActivos = terminoBusqueda || filtroFamilia !== "todos" || filtroEstado !== "todos";

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
              Invitados, pases y confirmaciones — también puedes confirmar a mano a quien responda por llamada
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

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre, celular, notas o acompañante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{
            width: { xs: "100%", sm: 340 },
            "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#a0455e" }} />
              </InputAdornment>
            ),
            endAdornment: busqueda ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setBusqueda("")}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        {!loading && (
          <Typography sx={{ fontSize: "0.78rem", color: "#8a7a5c" }}>
            {hayFiltrosActivos
              ? `${invitadosFiltrados.length} de ${invitados.length} invitados`
              : `${invitados.length} invitados`}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        {[
          { key: "todos", label: `Todos (${conteoFamilia.todos})` },
          { key: "novio", label: `Familia del novio (${conteoFamilia.novio})` },
          { key: "novia", label: `Familia de la novia (${conteoFamilia.novia})` },
        ].map((op) => (
          <Chip
            key={op.key}
            label={op.label}
            onClick={() => setFiltroFamilia(op.key)}
            sx={{
              fontWeight: 700,
              cursor: "pointer",
              bgcolor: filtroFamilia === op.key ? "#a0455e" : "rgba(204,107,142,0.12)",
              color: filtroFamilia === op.key ? "#fff" : "#a0455e",
              "&:hover": { bgcolor: filtroFamilia === op.key ? "#8a3a4f" : "rgba(204,107,142,0.2)" },
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {[
          { key: "todos", label: `Cualquier estado (${conteoEstado.todos})` },
          { key: "pendiente", label: `Sin confirmar (${conteoEstado.pendiente})` },
          { key: "confirmado", label: `Confirmaron (${conteoEstado.confirmado})` },
          { key: "no_asiste", label: `No asisten (${conteoEstado.no_asiste})` },
        ].map((op) => (
          <Chip
            key={op.key}
            label={op.label}
            onClick={() => setFiltroEstado(op.key)}
            sx={{
              fontWeight: 700,
              cursor: "pointer",
              bgcolor: filtroEstado === op.key ? "#2c1a0e" : "rgba(44,26,14,0.07)",
              color: filtroEstado === op.key ? "#fff" : "#4a2a15",
              "&:hover": { bgcolor: filtroEstado === op.key ? "#4a2a15" : "rgba(44,26,14,0.14)" },
            }}
          />
        ))}
      </Box>

      <TableWrap elevation={0}>
        <Box sx={{ minWidth: 1120 }}>
        <THead>
          <THeadCell>Nombre</THeadCell>
          <THeadCell>Celular</THeadCell>
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
        ) : invitadosFiltrados.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: "#b8a090" }}>
            {terminoBusqueda ? `No hay invitados que coincidan con "${busqueda}"` : "No hay invitados con estos filtros"}
          </Box>
        ) : (
          invitadosFiltrados.map((inv) => (
            <TRow key={inv.id_invitado}>
              <TCell><Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#2c1a0e" }}>{inv.nombre}</Typography></TCell>
              <TCell>
                {inv.celular ? (
                  <Box
                    component="a"
                    href={`tel:${inv.celular.replace(/[^\d+]/g, "")}`}
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, fontSize: "0.8rem", fontWeight: 600, color: "#16a34a", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    <PhoneIcon sx={{ fontSize: 14 }} />
                    {inv.celular}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "0.78rem", color: "#b8a090" }}>—</Typography>
                )}
              </TCell>
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
        </Box>
      </TableWrap>

      {panel && (
        <EditPanel open title={form.id_invitado ? "Editar invitado" : "Agregar invitado"} onClose={() => setPanel(false)} onSave={guardar} saving={saving}>
          <TextField {...darkTf} label="Nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          <TextField {...darkTf} type="tel" label="Celular (opcional)" placeholder="Ej: 987 654 321" inputProps={{ maxLength: 30 }} value={form.celular} onChange={(e) => set("celular", e.target.value)} />
          <TextField {...darkTf} type="number" label="Pases asignados" inputProps={{ min: 1, max: 50 }} value={form.pases_asignados} onChange={(e) => set("pases_asignados", parseInt(e.target.value || "1", 10))} />
          {form.id_invitado && (
            <>
              <TextField
                {...darkTf}
                select
                label="Confirmación de asistencia"
                helperText="Si confirmó por llamada, elige aquí su respuesta. Ya no podrá volver a confirmar desde la invitación."
                FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.45)" } }}
                SelectProps={{ MenuProps: { sx: { zIndex: 2000 } } }}
                sx={{ ...darkTf.sx, "& .MuiSelect-icon": { color: "rgba(255,255,255,0.55)" } }}
                value={form.rsvp_estado || "pendiente"}
                onChange={(e) => set("rsvp_estado", e.target.value)}
              >
                {ESTADOS_RSVP_OPCIONES.map((op) => (
                  <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                ))}
              </TextField>
              {form.rsvp_estado === "confirmado" && Number(form.pases_asignados) > 1 && (
                <TextField {...darkTf} label="Acompañante" placeholder="Nombre del acompañante" inputProps={{ maxLength: 200 }} value={form.rsvp_acompanante || ""} onChange={(e) => set("rsvp_acompanante", e.target.value)} />
              )}
            </>
          )}
          <TextField {...darkTf} label="Notas (opcional)" multiline minRows={2} value={form.notas} onChange={(e) => set("notas", e.target.value)} />
        </EditPanel>
      )}
    </PageWrap>
  );
}
