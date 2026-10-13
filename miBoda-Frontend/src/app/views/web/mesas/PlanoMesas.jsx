import React, { useMemo, useRef, useState } from "react";
import { Box, Typography, IconButton, Tooltip, Chip, Paper, LinearProgress } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import OpenWithIcon from "@mui/icons-material/OpenWith";

const SNAP = 20;
const MIN_W = 1800;
const MIN_H = 1100;
const COLORES = ["#a0455e", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#be123c", "#4d7c0f", "#c2410c", "#0f766e"];

const claveGrupo = (g) =>
  (g || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

const iniciales = (nombre) =>
  (nombre || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";

const ajustar = (v) => Math.max(0, Math.round(v / SNAP) * SNAP);

// Geometria de una mesa redonda: el radio crece con la capacidad; los asientos van en un anillo alrededor.
const geometria = (capacidad) => {
  const radio = Math.round(34 + capacidad * 2.2);
  const anillo = radio + 16;
  const asiento = 11;
  return { radio, anillo, asiento, caja: (anillo + asiento + 4) * 2, centro: anillo + asiento + 4 };
};

/** Un asiento por persona: el invitado y, si lo registro, su acompanante. */
function asientosDe(mesa) {
  const lista = [];
  for (const p of mesa.personas) {
    lista.push({ nombre: p.nombre, grupo: p.grupo, id_invitado: p.id_invitado });
    if (p.acompanante) lista.push({ nombre: p.acompanante, grupo: p.grupo, id_invitado: p.id_invitado, acompanante: true });
  }
  return lista;
}

function Mesa({ mesa, pos, seleccionada, colorDe, zoom, onSeleccionar, onMovida, onSoltarPersona }) {
  const g = geometria(mesa.capacidad);
  const asientos = asientosDe(mesa);
  const arrastre = useRef(null);
  const [vivo, setVivo] = useState(null);
  const [encima, setEncima] = useState(false);
  const actual = vivo ?? pos;
  const lleno = mesa.ocupados >= mesa.capacidad;

  const iniciar = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { x0: e.clientX, y0: e.clientY, px: pos.x, py: pos.y, movio: false };
  };
  const mover = (e) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = (e.clientX - a.x0) / zoom;
    const dy = (e.clientY - a.y0) / zoom;
    if (!a.movio && Math.hypot(dx, dy) < 4) return;
    a.movio = true;
    setVivo({ x: Math.max(0, a.px + dx), y: Math.max(0, a.py + dy) });
  };
  const terminar = (e) => {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ya liberado */ }
    if (!a.movio) { onSeleccionar(mesa.id_mesa); return; }
    const final = { x: ajustar(a.px + (e.clientX - a.x0) / zoom), y: ajustar(a.py + (e.clientY - a.y0) / zoom) };
    setVivo(null);
    onMovida(mesa.id_mesa, final.x, final.y);
  };

  return (
    <Box
      onPointerDown={iniciar} onPointerMove={mover} onPointerUp={terminar} onPointerCancel={terminar}
      onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        e.preventDefault();
        setEncima(false);
        const id = Number(e.dataTransfer.getData("text/invitado"));
        if (id) onSoltarPersona(id, mesa.id_mesa);
      }}
      sx={{
        position: "absolute", left: actual.x - g.centro, top: actual.y - g.centro, width: g.caja, height: g.caja,
        cursor: vivo ? "grabbing" : "grab", touchAction: "none", userSelect: "none",
        zIndex: vivo ? 10 : seleccionada ? 5 : 1,
      }}
    >
      {Array.from({ length: mesa.capacidad }).map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / mesa.capacidad;
        const ocupado = asientos[i];
        return (
          <Tooltip key={i} title={ocupado ? `${ocupado.nombre}${ocupado.acompanante ? " (acompañante)" : ""}${ocupado.grupo ? ` · ${ocupado.grupo}` : ""}` : "Asiento libre"} arrow>
            <Box
              sx={{
                position: "absolute", width: g.asiento * 2, height: g.asiento * 2, borderRadius: "50%",
                left: g.centro + Math.cos(ang) * g.anillo - g.asiento, top: g.centro + Math.sin(ang) * g.anillo - g.asiento,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 800,
                color: "#fff", bgcolor: ocupado ? colorDe(ocupado.grupo) : "#fff",
                border: ocupado ? "2px solid #fff" : "1.5px dashed #c9b8aa",
                boxShadow: ocupado ? "0 1px 4px rgba(44,26,14,0.3)" : "none",
              }}
            >
              {ocupado ? iniciales(ocupado.nombre) : i + 1}
            </Box>
          </Tooltip>
        );
      })}
      <Box
        sx={{
          position: "absolute", left: g.centro - g.radio, top: g.centro - g.radio, width: g.radio * 2, height: g.radio * 2,
          borderRadius: "50%", bgcolor: encima ? "#fdecef" : "#fff", textAlign: "center",
          border: seleccionada ? "3px solid #a0455e" : encima ? "3px dashed #a0455e" : `2px solid ${lleno ? "#f59e0b" : "#d8c9bd"}`,
          boxShadow: vivo ? "0 10px 26px rgba(44,26,14,0.28)" : "0 2px 8px rgba(44,26,14,0.12)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 0.5,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#2c1a0e", lineHeight: 1.1, maxWidth: g.radio * 1.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {mesa.nombre}
        </Typography>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: lleno ? "#b45309" : "#8a7a5c" }}>
          {mesa.ocupados}/{mesa.capacidad}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Plano del salon: mesas redondas que se arrastran (se guardan en la base), zoom, y panel lateral para sentar gente
 * (arrastrando a una mesa o con el selector). `renderPersona` pinta una fila con el selector de mesa.
 */
export default function PlanoMesas({ mesas, sinMesa, renderPersona, onMover, onPosicion, onEditar, onBorrar }) {
  const [zoom, setZoom] = useState(0.8);
  const [seleccion, setSeleccion] = useState(null);
  const [ov, setOv] = useState({});

  const posiciones = useMemo(() => {
    const out = {};
    mesas.forEach((m, i) => {
      const o = ov[m.id_mesa];
      if (o) out[m.id_mesa] = o;
      else if (m.pos_x != null && m.pos_y != null) out[m.id_mesa] = { x: m.pos_x, y: m.pos_y };
      else out[m.id_mesa] = { x: 140 + (i % 5) * 240, y: 150 + Math.floor(i / 5) * 250 };
    });
    return out;
  }, [mesas, ov]);

  const colores = useMemo(() => {
    const claves = [];
    for (const p of [...sinMesa, ...mesas.flatMap((m) => m.personas)]) {
      const k = claveGrupo(p.grupo);
      if (k && !claves.some(([c]) => c === k)) claves.push([k, p.grupo]);
    }
    return claves.map(([k, nombre], i) => ({ k, nombre, color: COLORES[i % COLORES.length] }));
  }, [mesas, sinMesa]);
  const colorDe = (grupo) => colores.find((c) => c.k === claveGrupo(grupo))?.color ?? "#8a7a5c";

  const ancho = Math.max(MIN_W, ...Object.values(posiciones).map((p) => p.x + 320));
  const alto = Math.max(MIN_H, ...Object.values(posiciones).map((p) => p.y + 320));
  const elegida = mesas.find((m) => m.id_mesa === seleccion) ?? null;

  const movida = (id, x, y) => {
    setOv((p) => ({ ...p, [id]: { x, y } }));
    onPosicion(id, x, y);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", lg: "row" }, mb: 3 }}>
      <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: "14px", border: "1px solid rgba(204,107,142,0.18)", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", p: 1, borderBottom: "1px solid rgba(204,107,142,0.15)", bgcolor: "#fdf8f5" }}>
          <OpenWithIcon sx={{ fontSize: 18, color: "#a0455e", ml: 0.5 }} />
          <Typography sx={{ fontSize: "0.75rem", color: "#7a4030", fontWeight: 700 }}>Arrastra las mesas para ordenarlas. Toca una para ver quién está sentado.</Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))}><ZoomOutIcon fontSize="small" /></IconButton>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, minWidth: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</Typography>
          <IconButton size="small" onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))}><ZoomInIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ height: { xs: 460, md: "66vh" }, overflow: "auto", bgcolor: "#faf6f2" }}>
          <Box sx={{ width: ancho * zoom, height: alto * zoom, position: "relative" }}>
            <Box
              onPointerDown={(e) => { if (e.target === e.currentTarget) setSeleccion(null); }}
              sx={{
                position: "absolute", left: 0, top: 0, width: ancho, height: alto, transform: `scale(${zoom})`, transformOrigin: "top left",
                backgroundImage: "radial-gradient(circle, #d9cabd 1px, transparent 1.4px)", backgroundSize: `${SNAP}px ${SNAP}px`,
              }}
            >
              {mesas.map((m) => (
                <Mesa
                  key={m.id_mesa} mesa={m} pos={posiciones[m.id_mesa]} seleccionada={seleccion === m.id_mesa} colorDe={colorDe} zoom={zoom}
                  onSeleccionar={setSeleccion} onMovida={movida} onSoltarPersona={(id, idMesa) => onMover(id, idMesa)}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {colores.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", p: 1, borderTop: "1px solid rgba(204,107,142,0.15)", bgcolor: "#fdf8f5" }}>
            {colores.map((c) => (
              <Chip key={c.k} size="small" label={c.nombre} sx={{ fontWeight: 700, color: "#fff", bgcolor: c.color }} />
            ))}
          </Box>
        )}
      </Paper>

      <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {elegida && (
          <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid rgba(204,107,142,0.18)", p: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 800, color: "#2c1a0e" }}>{elegida.nombre}</Typography>
              <Box>
                <Tooltip title="Editar"><IconButton size="small" onClick={() => onEditar(elegida)} sx={{ color: "#a0455e" }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                <Tooltip title="Eliminar"><IconButton size="small" onClick={() => onBorrar(elegida)} sx={{ color: "#ef4444" }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                <IconButton size="small" onClick={() => setSeleccion(null)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            </Box>
            <Typography sx={{ fontSize: "0.72rem", color: "#8a7a5c", mb: 0.5 }}>{elegida.ocupados} / {elegida.capacidad} lugares</Typography>
            <LinearProgress
              variant="determinate" value={Math.min(100, Math.round((elegida.ocupados / elegida.capacidad) * 100))}
              sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: "rgba(204,107,142,0.12)", "& .MuiLinearProgress-bar": { bgcolor: elegida.ocupados >= elegida.capacidad ? "#f59e0b" : "#22c55e" } }}
            />
            {elegida.personas.length === 0
              ? <Typography sx={{ fontSize: "0.78rem", color: "#b8a090", py: 1 }}>Vacía. Arrastra aquí a alguien de «Sin mesa».</Typography>
              : elegida.personas.map((p) => <React.Fragment key={p.id_invitado}>{renderPersona(p, elegida.id_mesa)}</React.Fragment>)}
          </Paper>
        )}

        <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid rgba(204,107,142,0.18)", p: 1.5, maxHeight: { lg: "52vh" }, overflow: "auto" }}>
          <Typography sx={{ fontWeight: 800, color: "#7a4030", fontSize: "0.8rem", mb: 0.5 }}>SIN MESA ({sinMesa.length})</Typography>
          {sinMesa.length === 0
            ? <Typography sx={{ fontSize: "0.78rem", color: "#b8a090" }}>Todos tienen mesa.</Typography>
            : (
              <>
                <Typography sx={{ fontSize: "0.68rem", color: "#b8a090", mb: 0.5 }}>Arrastra a una mesa del plano, o usa el selector.</Typography>
                {sinMesa.map((p) => (
                  <Box
                    key={p.id_invitado} draggable
                    onDragStart={(e) => { e.dataTransfer.setData("text/invitado", String(p.id_invitado)); e.dataTransfer.effectAllowed = "move"; }}
                    sx={{ cursor: "grab", borderLeft: `4px solid ${colorDe(p.grupo)}`, pl: 0.8 }}
                  >
                    {renderPersona(p, null)}
                  </Box>
                ))}
              </>
            )}
        </Paper>
      </Box>
    </Box>
  );
}
