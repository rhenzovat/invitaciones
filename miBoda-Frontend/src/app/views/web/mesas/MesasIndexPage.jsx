import React, { useState, useEffect } from "react";
import PlanoMesas from "./PlanoMesas";
import {
  Box, Typography, Paper, Chip, IconButton, Tooltip, TextField, Button, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Autocomplete, Checkbox,
  FormControlLabel, Alert, CircularProgress, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";

import {
  listar, crearMesas, actualizarMesa, moverMesa, eliminarMesa, crearRegla, juntarPorGrupo, eliminarRegla, asignar, limpiar, optimizar, aceptar,
} from "../../../api/web_mesas.api";
import { handleErrorMessages, handleSuccessMessages, confirmAction } from "../../../components/notify-messages";

const PageWrap = styled(Box)(() => ({ padding: "24px", minHeight: "100vh", background: "#f7f3f0" }));

const HeaderCard = styled(Box)(() => ({
  background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
  borderRadius: "16px",
  padding: "20px 28px",
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "16px",
  boxShadow: "0 6px 28px rgba(44,26,14,0.3)",
}));

const Card = styled(Paper)(() => ({
  borderRadius: "14px",
  border: "1px solid rgba(204,107,142,0.18)",
  boxShadow: "0 4px 18px rgba(44,26,14,0.07)",
  padding: "14px 16px",
}));

const TIPOS = { SAME_TABLE: "Juntos", SEPARATE: "Separados", FIXED_TABLE: "Mesa fija" };

const ESTADO_PROPUESTA = {
  CUMPLE_TODO: { label: "Cumple todas las reglas", bgcolor: "rgba(34,197,94,0.14)", color: "#16a34a" },
  INCUMPLE_OBLIGATORIAS: { label: "No logró cumplir las obligatorias", bgcolor: "rgba(239,68,68,0.14)", color: "#dc2626" },
  IMPOSIBLE: { label: "Imposible con estas reglas", bgcolor: "rgba(239,68,68,0.14)", color: "#dc2626" },
  SIN_PROBLEMA: { label: "Nada que optimizar", bgcolor: "rgba(148,163,184,0.18)", color: "#64748b" },
};

const REGLA_INICIAL = { tipo: "SAME_TABLE", severidad: "SOFT", peso: 50, sujetos: [], id_mesa: "" };

function SelectorMesa({ valor, mesas, onChange }) {
  return (
    <Select
      size="small" displayEmpty value={valor ?? ""} sx={{ fontSize: "0.78rem", minWidth: 140, bgcolor: "#fff" }}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    >
      <MenuItem value=""><em>Sin mesa</em></MenuItem>
      {mesas.map((m) => (
        <MenuItem key={m.id_mesa} value={m.id_mesa}>{m.nombre} ({m.ocupados}/{m.capacidad})</MenuItem>
      ))}
    </Select>
  );
}

function FilaPersona({ persona, mesaActual, mesas, onMover }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 0.6, borderTop: "1px solid rgba(204,107,142,0.1)" }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#2c1a0e", lineHeight: 1.2 }}>{persona.nombre}</Typography>
        {persona.acompanante && (
          <Typography sx={{ fontSize: "0.72rem", color: "#8a7a5c" }}>+ {persona.acompanante}</Typography>
        )}
        {persona.grupo && (
          <Typography sx={{ fontSize: "0.68rem", color: "#a0455e", fontWeight: 600 }}>{persona.grupo}</Typography>
        )}
      </Box>
      <SelectorMesa valor={mesaActual} mesas={mesas} onChange={(id) => onMover(persona.id_invitado, id)} />
    </Box>
  );
}

export default function MesasIndexPage() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState("");
  const [dlgMesas, setDlgMesas] = useState(null);
  const [dlgMesa, setDlgMesa] = useState(null);
  const [dlgRegla, setDlgRegla] = useState(null);
  const [opt, setOpt] = useState(null);
  const [minimizar, setMinimizar] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [vista, setVista] = useState(() => {
    try { return localStorage.getItem("mesas_vista") === "lista" ? "lista" : "plano"; } catch { return "plano"; }
  });
  const cambiarVista = (_, v) => {
    if (!v) return;
    setVista(v);
    try { localStorage.setItem("mesas_vista", v); } catch { /* sin almacenamiento: no se recuerda */ }
  };

  const cargar = async () => {
    try { setDatos(await listar()); }
    catch (e) { handleErrorMessages("Error", e); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const mesas = datos?.mesas ?? [];
  const resumen = datos?.resumen;

  const guardarPosicion = async (id_mesa, x, y) => {
    try { await moverMesa(id_mesa, x, y); }
    catch (e) { handleErrorMessages("No se guardó la posición de la mesa", e); }
  };

  const mover = async (id_invitado, id_mesa) => {
    try {
      const res = await asignar(id_invitado, id_mesa);
      setAviso((res.result?.advertencias || []).join(" "));
      await cargar();
    } catch (e) { handleErrorMessages("Error", e); }
  };

  const ejecutar = async (accion, mensajeOk) => {
    setGuardando(true);
    try {
      await accion();
      if (mensajeOk) handleSuccessMessages("Listo", mensajeOk);
      await cargar();
      return true;
    } catch (e) { handleErrorMessages("Error", e); return false; }
    finally { setGuardando(false); }
  };

  const guardarMesas = async () => {
    if (await ejecutar(() => crearMesas({ cantidad: Number(dlgMesas.cantidad), capacidad: Number(dlgMesas.capacidad) }))) setDlgMesas(null);
  };
  const guardarMesa = async () => {
    if (await ejecutar(() => actualizarMesa({ id_mesa: dlgMesa.id_mesa, nombre: dlgMesa.nombre, capacidad: Number(dlgMesa.capacidad) }))) setDlgMesa(null);
  };
  const borrarMesa = async (m) => {
    const r = await confirmAction(`¿Eliminar ${m.nombre}? Quienes estén sentados ahí quedarán sin mesa.`, "Sí, eliminar", "Cancelar");
    if (r.isConfirmed) await ejecutar(() => eliminarMesa(m.id_mesa));
  };
  const quitarTodos = async () => {
    const r = await confirmAction("¿Quitar a todos de sus mesas?", "Sí, quitar", "Cancelar");
    if (r.isConfirmed) await ejecutar(() => limpiar(), "Nadie tiene mesa ahora.");
  };
  const guardarRegla = async () => {
    const r = dlgRegla;
    const datosRegla = {
      tipo: r.tipo,
      severidad: r.severidad,
      sujetos: r.sujetos,
      ...(r.severidad === "SOFT" ? { peso: Number(r.peso) || 50 } : {}),
      ...(r.tipo === "FIXED_TABLE" ? { id_mesa: r.id_mesa === "" ? undefined : r.id_mesa } : {}),
    };
    if (await ejecutar(() => crearRegla(datosRegla))) setDlgRegla(null);
  };
  const juntarGrupos = async () => {
    const hayAuto = (datos?.reglas ?? []).some((r) => r.grupo);
    if (hayAuto) {
      const c = await confirmAction("Ya hay reglas por grupo. Se van a rehacer con los grupos actuales (tus reglas manuales no se tocan).", "Sí, rehacer", "Cancelar");
      if (!c.isConfirmed) return;
    }
    setGuardando(true);
    try {
      const res = await juntarPorGrupo();
      const sinGrupo = res.result?.sinGrupo ?? 0;
      handleSuccessMessages("Listo", sinGrupo > 0 ? `${res.message} ${sinGrupo} confirmados no tienen grupo.` : res.message);
      await cargar();
    } catch (e) { handleErrorMessages("Error", e); }
    finally { setGuardando(false); }
  };
  const borrarRegla = async (r) => {
    const c = await confirmAction("¿Eliminar esta regla?", "Sí, eliminar", "Cancelar");
    if (c.isConfirmed) await ejecutar(() => eliminarRegla(r.id_regla));
  };

  const calcular = async () => {
    setOpt({ calculando: true, propuesta: null });
    try {
      const propuesta = await optimizar(minimizar && (resumen?.sentadas ?? 0) > 0);
      setOpt({ calculando: false, propuesta });
    } catch (e) {
      setOpt(null);
      handleErrorMessages("Error", e);
    }
  };

  const aceptarPropuesta = async () => {
    const p = opt.propuesta;
    setGuardando(true);
    try {
      await aceptar(p.asignaciones.map((a) => ({ id_invitado: a.id_invitado, id_mesa: a.id_mesa })));
      setOpt(null);
      setAviso("");
      handleSuccessMessages("Listo", "Distribución guardada.");
      await cargar();
    } catch (e) { handleErrorMessages("Error", e); }
    finally { setGuardando(false); }
  };

  const propuesta = opt?.propuesta;
  const porMesa = {};
  (propuesta?.asignaciones ?? []).forEach((a) => { (porMesa[a.mesa] ||= []).push(a.nombre); });

  return (
    <PageWrap>
      <HeaderCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg,#cc6b8e,#a0455e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(204,107,142,0.4)" }}>
            <TableRestaurantIcon sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>Mesas</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", mt: 0.3 }}>
              Sienta a quienes confirmaron: a mano, o deja que el optimizador proponga la distribución
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined" startIcon={<AddIcon />} onClick={() => setDlgMesas({ cantidad: 8, capacidad: 10 })}
            sx={{ color: "#fdf8f5", borderColor: "rgba(255,255,255,0.4)", textTransform: "none", fontWeight: 700, borderRadius: "10px", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}
          >
            Agregar mesas
          </Button>
          <Button
            variant="contained" startIcon={<AutoAwesomeIcon />} onClick={calcular}
            disabled={loading || mesas.length === 0 || (resumen?.confirmados ?? 0) === 0 || !datos?.optimizadorConfigurado}
            sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", textTransform: "none", fontWeight: 700, borderRadius: "10px", "&.Mui-disabled": { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)" } }}
          >
            Optimizar
          </Button>
        </Box>
      </HeaderCard>

      {datos && !datos.optimizadorConfigurado && (
        <Alert severity="info" sx={{ mb: 2 }}>
          El optimizador todavía no está configurado en el servidor (faltan las variables OPTIMIZADOR_URL y OPTIMIZADOR_API_KEY). Mientras tanto puedes sentar a mano.
        </Alert>
      )}
      {aviso && <Alert severity="warning" onClose={() => setAviso("")} sx={{ mb: 2 }}>{aviso}</Alert>}

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center", color: "#a89a7d" }}>Cargando...</Box>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
            {[
              `Confirmaron: ${resumen.confirmados} (${resumen.personas} personas)`,
              `Sentadas: ${resumen.sentadas}`,
              `Sin mesa: ${resumen.sinMesa}`,
              `Capacidad total: ${resumen.capacidadTotal}`,
            ].map((t) => (
              <Chip key={t} label={t} sx={{ fontWeight: 700, bgcolor: "rgba(204,107,142,0.12)", color: "#a0455e" }} />
            ))}
            {resumen.sentadas > 0 && (
              <Button size="small" startIcon={<PersonOffIcon />} onClick={quitarTodos} sx={{ textTransform: "none", color: "#8a7a5c" }}>
                Quitar a todos de sus mesas
              </Button>
            )}
          </Box>

          {resumen.personas > resumen.capacidadTotal && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Hay {resumen.personas} personas confirmadas y las mesas suman {resumen.capacidadTotal} lugares: agrega mesas o más capacidad.
            </Alert>
          )}

          {mesas.length > 0 && (
            <ToggleButtonGroup size="small" exclusive value={vista} onChange={cambiarVista} sx={{ mb: 2, bgcolor: "#fff" }}>
              <ToggleButton value="plano" sx={{ textTransform: "none", fontWeight: 700, gap: 0.6 }}><MapIcon sx={{ fontSize: 18 }} />Plano</ToggleButton>
              <ToggleButton value="lista" sx={{ textTransform: "none", fontWeight: 700, gap: 0.6 }}><ViewListIcon sx={{ fontSize: 18 }} />Lista</ToggleButton>
            </ToggleButtonGroup>
          )}

          {mesas.length > 0 && vista === "plano" && (
            <PlanoMesas
              mesas={mesas} sinMesa={datos.sinMesa}
              renderPersona={(p, mesaActual) => <FilaPersona persona={p} mesaActual={mesaActual} mesas={mesas} onMover={mover} />}
              onMover={mover} onPosicion={guardarPosicion}
              onEditar={(m) => setDlgMesa({ id_mesa: m.id_mesa, nombre: m.nombre, capacidad: m.capacidad })}
              onBorrar={borrarMesa}
            />
          )}

          {vista === "lista" && datos.sinMesa.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 800, color: "#7a4030", fontSize: "0.8rem", mb: 0.5 }}>
                SIN MESA ({datos.sinMesa.length})
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, columnGap: 3 }}>
                {datos.sinMesa.map((p) => (
                  <FilaPersona key={p.id_invitado} persona={p} mesaActual={null} mesas={mesas} onMover={mover} />
                ))}
              </Box>
            </Card>
          )}

          {mesas.length === 0 ? (
            <Card sx={{ textAlign: "center", color: "#b8a090", py: 4 }}>
              Aún no hay mesas. Usa «Agregar mesas» para crearlas (por ejemplo 8 mesas de 10 lugares).
            </Card>
          ) : vista === "plano" ? null : (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
              {mesas.map((m) => {
                const pct = Math.min(100, Math.round((m.ocupados / m.capacidad) * 100));
                return (
                  <Card key={m.id_mesa}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, color: "#2c1a0e" }}>{m.nombre}</Typography>
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => setDlgMesa({ id_mesa: m.id_mesa, nombre: m.nombre, capacidad: m.capacidad })} sx={{ color: "#a0455e" }}><EditIcon sx={{ fontSize: 15 }} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => borrarMesa(m)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.72rem", color: "#8a7a5c", mb: 0.5 }}>{m.ocupados} / {m.capacidad} lugares</Typography>
                    <LinearProgress
                      variant="determinate" value={pct}
                      sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: "rgba(204,107,142,0.12)", "& .MuiLinearProgress-bar": { bgcolor: pct >= 100 ? "#f59e0b" : "#22c55e" } }}
                    />
                    {m.personas.length === 0 ? (
                      <Typography sx={{ fontSize: "0.78rem", color: "#b8a090", py: 1 }}>Vacía</Typography>
                    ) : (
                      m.personas.map((p) => (
                        <FilaPersona key={p.id_invitado} persona={p} mesaActual={m.id_mesa} mesas={mesas} onMover={mover} />
                      ))
                    )}
                  </Card>
                );
              })}
            </Box>
          )}

          <Card>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontWeight: 800, color: "#7a4030", fontSize: "0.8rem" }}>REGLAS DEL ORGANIZADOR ({datos.reglas.length})</Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Tooltip title="Crea una regla preferible de «juntos» por cada grupo de invitados (Amigos de la novia, Tíos del novio, etc.)">
                  <span>
                    <Button size="small" startIcon={<GroupWorkIcon />} onClick={juntarGrupos} disabled={guardando || mesas.length === 0} sx={{ textTransform: "none", fontWeight: 700, color: "#a0455e" }}>
                      Juntar por grupo
                    </Button>
                  </span>
                </Tooltip>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setDlgRegla({ ...REGLA_INICIAL })} sx={{ textTransform: "none", fontWeight: 700, color: "#a0455e" }}>
                  Agregar regla
                </Button>
              </Box>
            </Box>
            {datos.reglas.length === 0 ? (
              <Typography sx={{ fontSize: "0.8rem", color: "#b8a090" }}>
                Sin reglas. Asigna un grupo a tus invitados y pulsa «Juntar por grupo», o agrega reglas a mano: que dos familias se sienten juntas, que dos personas no coincidan, o fijar a alguien en una mesa.
              </Typography>
            ) : (
              datos.reglas.map((r) => (
                <Box key={r.id_regla} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 0.7, borderTop: "1px solid rgba(204,107,142,0.1)" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap", minWidth: 0 }}>
                    <Chip size="small" label={r.tipo === "FIXED_TABLE" ? `Fijo en ${r.mesa_nombre ?? "?"}` : TIPOS[r.tipo]} sx={{ fontWeight: 700, bgcolor: "rgba(44,26,14,0.08)" }} />
                    {r.grupo && <Chip size="small" label={`Grupo: ${r.grupo}`} sx={{ fontWeight: 700, bgcolor: "rgba(204,107,142,0.14)", color: "#a0455e" }} />}
                    <Chip
                      size="small" label={r.severidad === "HARD" ? "Obligatoria" : `Preferible (${r.peso})`}
                      sx={{ fontWeight: 700, bgcolor: r.severidad === "HARD" ? "rgba(239,68,68,0.14)" : "rgba(245,158,11,0.16)", color: r.severidad === "HARD" ? "#dc2626" : "#b45309" }}
                    />
                    <Typography sx={{ fontSize: "0.8rem", color: "#2c1a0e" }}>
                      {r.sujetos.map((s) => (s.confirmo ? s.nombre : `${s.nombre} (sin confirmar)`)).join(", ")}
                    </Typography>
                  </Box>
                  <Tooltip title="Eliminar regla">
                    <IconButton size="small" onClick={() => borrarRegla(r)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                  </Tooltip>
                </Box>
              ))
            )}
          </Card>
        </>
      )}

      {/* Agregar mesas */}
      <Dialog open={!!dlgMesas} onClose={() => setDlgMesas(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar mesas</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField label="Cantidad de mesas" type="number" inputProps={{ min: 1, max: 50 }} value={dlgMesas?.cantidad ?? ""} onChange={(e) => setDlgMesas((p) => ({ ...p, cantidad: e.target.value }))} />
          <TextField label="Lugares por mesa" type="number" inputProps={{ min: 1, max: 50 }} value={dlgMesas?.capacidad ?? ""} onChange={(e) => setDlgMesas((p) => ({ ...p, capacidad: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgMesas(null)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarMesas} disabled={guardando}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Editar mesa */}
      <Dialog open={!!dlgMesa} onClose={() => setDlgMesa(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar mesa</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField label="Nombre" value={dlgMesa?.nombre ?? ""} onChange={(e) => setDlgMesa((p) => ({ ...p, nombre: e.target.value }))} />
          <TextField label="Lugares" type="number" inputProps={{ min: 1, max: 50 }} value={dlgMesa?.capacidad ?? ""} onChange={(e) => setDlgMesa((p) => ({ ...p, capacidad: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgMesa(null)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarMesa} disabled={guardando}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Agregar regla */}
      <Dialog open={!!dlgRegla} onClose={() => setDlgRegla(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar regla</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          {dlgRegla && (
            <>
              <FormControl size="small">
                <InputLabel>Tipo</InputLabel>
                <Select label="Tipo" value={dlgRegla.tipo} onChange={(e) => setDlgRegla((p) => ({ ...p, tipo: e.target.value, sujetos: e.target.value === "FIXED_TABLE" ? p.sujetos.slice(-1) : p.sujetos }))}>
                  <MenuItem value="SAME_TABLE">Juntos (misma mesa)</MenuItem>
                  <MenuItem value="SEPARATE">Separados (mesas distintas)</MenuItem>
                  <MenuItem value="FIXED_TABLE">Mesa fija (una persona en una mesa)</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Qué tan importante</InputLabel>
                <Select label="Qué tan importante" value={dlgRegla.severidad} onChange={(e) => setDlgRegla((p) => ({ ...p, severidad: e.target.value }))}>
                  <MenuItem value="HARD">Obligatoria (no se puede romper)</MenuItem>
                  <MenuItem value="SOFT">Preferible (se intenta cumplir)</MenuItem>
                </Select>
              </FormControl>
              {dlgRegla.severidad === "SOFT" && (
                <TextField size="small" label="Importancia (1 a 1000)" type="number" inputProps={{ min: 1, max: 1000 }} value={dlgRegla.peso} onChange={(e) => setDlgRegla((p) => ({ ...p, peso: e.target.value }))} />
              )}
              <Autocomplete
                multiple size="small" options={datos?.invitadosConfirmados ?? []}
                getOptionLabel={(o) => o.nombre}
                isOptionEqualToValue={(a, b) => a.id_invitado === b.id_invitado}
                value={(datos?.invitadosConfirmados ?? []).filter((o) => dlgRegla.sujetos.includes(o.id_invitado))}
                onChange={(_, v) => setDlgRegla((p) => ({ ...p, sujetos: (p.tipo === "FIXED_TABLE" ? v.slice(-1) : v).map((o) => o.id_invitado) }))}
                renderInput={(params) => (
                  <TextField {...params} label={dlgRegla.tipo === "FIXED_TABLE" ? "Invitado" : "Invitados (al menos 2)"} helperText="Solo aparecen quienes ya confirmaron." />
                )}
              />
              {dlgRegla.tipo === "FIXED_TABLE" && (
                <FormControl size="small">
                  <InputLabel>Mesa</InputLabel>
                  <Select label="Mesa" value={dlgRegla.id_mesa} onChange={(e) => setDlgRegla((p) => ({ ...p, id_mesa: e.target.value }))}>
                    {mesas.map((m) => <MenuItem key={m.id_mesa} value={m.id_mesa}>{m.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgRegla(null)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarRegla} disabled={guardando}>Guardar regla</Button>
        </DialogActions>
      </Dialog>

      {/* Optimizar */}
      <Dialog open={!!opt} onClose={() => !opt?.calculando && setOpt(null)} maxWidth="md" fullWidth>
        <DialogTitle>Propuesta del optimizador</DialogTitle>
        <DialogContent>
          {opt?.calculando && (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={34} />
              <Typography sx={{ mt: 2, fontWeight: 700 }}>Calculando la mejor distribución...</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#8a7a5c" }}>
                Si el servicio estaba dormido puede tardar hasta un minuto en despertar.
              </Typography>
            </Box>
          )}
          {propuesta && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                {(() => {
                  const e = ESTADO_PROPUESTA[propuesta.estado] || ESTADO_PROPUESTA.SIN_PROBLEMA;
                  return <Chip label={e.label} sx={{ fontWeight: 700, bgcolor: e.bgcolor, color: e.color }} />;
                })()}
                {propuesta.satisfaccion != null && <Chip label={`Preferencias cumplidas: ${propuesta.satisfaccion}%`} />}
                {propuesta.parcial && <Chip label="Resultado parcial (se agotó el tiempo)" />}
              </Box>

              {propuesta.conflictos.map((c, i) => (
                <Alert key={i} severity="error">
                  {c.mensaje}{c.sugerencia ? ` ${c.sugerencia}` : ""}
                </Alert>
              ))}
              {propuesta.violaciones.map((v, i) => (
                <Alert key={i} severity={v.severidad === "HARD" ? "error" : "warning"}>{v.mensaje}</Alert>
              ))}
              {propuesta.sinAsignar.length > 0 && (
                <Alert severity="warning">
                  Sin lugar: {propuesta.sinAsignar.map((s) => `${s.nombre} (${s.motivo})`).join(", ")}.
                </Alert>
              )}

              {Object.keys(porMesa).length > 0 && (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                  {Object.entries(porMesa).map(([mesa, nombres]) => (
                    <Box key={mesa} sx={{ border: "1px solid rgba(204,107,142,0.2)", borderRadius: "10px", p: 1.2 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: "#7a4030" }}>{mesa} ({nombres.length})</Typography>
                      <Typography sx={{ fontSize: "0.78rem", color: "#2c1a0e" }}>{nombres.join(", ")}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography sx={{ fontSize: "0.75rem", color: "#8a7a5c" }}>
                Nada se guarda hasta que aceptes. Al aceptar se reemplaza la distribución actual.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={minimizar} onChange={(e) => setMinimizar(e.target.checked)} disabled={opt?.calculando || (resumen?.sentadas ?? 0) === 0} />}
            label={<Typography sx={{ fontSize: "0.78rem" }}>Mover lo menos posible a quienes ya tienen mesa</Typography>}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => setOpt(null)} disabled={opt?.calculando}>Cerrar</Button>
            <Button onClick={calcular} disabled={opt?.calculando}>Recalcular</Button>
            <Button variant="contained" onClick={aceptarPropuesta} disabled={!propuesta?.aceptable || guardando}>Aceptar y guardar</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </PageWrap>
  );
}
