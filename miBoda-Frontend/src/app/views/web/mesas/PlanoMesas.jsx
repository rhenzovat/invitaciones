import React, { useMemo, useRef, useState } from "react";
import { Box, Typography, IconButton, Tooltip, Chip, Paper, LinearProgress, Button, Menu, MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
// Las rectangulares llevan la mitad de los asientos en cada lado largo, como las del salon.
const geometria = (capacidad, forma) => {
  const asiento = 15;
  if (forma === "RECTANGULAR") {
    const mitad = Math.ceil(capacidad / 2);
    const paso = 40;
    const cuerpoW = 84;
    const cuerpoH = Math.max(110, (mitad - 1) * paso + 2 * asiento + 14);
    const lado = cuerpoW / 2 + asiento + 3;
    const w = (lado + asiento + 4) * 2, h = cuerpoH + 2 * (asiento + 4);
    return {
      rect: true, asiento, cuerpoW, cuerpoH, w, h, cx: w / 2, cy: h / 2, ancho: cuerpoW,
      posAsiento: (i) => {
        const izq = i < mitad;
        const k = izq ? i : i - mitad;
        const enLado = izq ? mitad : capacidad - mitad;
        return { x: w / 2 + (izq ? -lado : lado), y: h / 2 - ((enLado - 1) * paso) / 2 + k * paso, rot: izq ? 270 : 90 };
      },
    };
  }
  const radio = Math.round(34 + capacidad * 2.2);
  const anillo = radio + 20;
  const caja = (anillo + asiento + 4) * 2;
  return {
    rect: false, radio, anillo, asiento, w: caja, h: caja, cx: caja / 2, cy: caja / 2, ancho: radio * 1.7,
    posAsiento: (i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / capacidad;
      return { x: caja / 2 + Math.cos(ang) * anillo, y: caja / 2 + Math.sin(ang) * anillo, rot: (ang * 180) / Math.PI + 90 };
    },
  };
};

// Plano de la sala (PDF del local) dibujado por detras. Mismas coordenadas que las mesas: (punto del PDF - 221, - 305) x 2 + (140, 120).
const FONDO_PLANO = { url: `${import.meta.env.BASE_URL}assets/plano-salon.png`, x: 98, y: 20, w: 1840, h: 3650 };

/** Silla vista desde arriba: asiento y respaldo. Con rot=0 el respaldo queda arriba; se gira para que mire a la mesa. */
function Silla({ rot, relleno, borde, punteada }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ transform: `rotate(${rot}deg)`, display: "block", overflow: "visible" }}>
      <rect x="2.5" y="1.5" width="19" height="5" rx="2.5" fill={relleno} stroke={borde} strokeWidth="1.4" strokeDasharray={punteada ? "2.5 2" : undefined} />
      <rect x="3.5" y="8" width="17" height="14" rx="4.5" fill={relleno} stroke={borde} strokeWidth="1.4" strokeDasharray={punteada ? "2.5 2" : undefined} />
    </svg>
  );
}

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
  const g = geometria(mesa.capacidad, mesa.forma);
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
        position: "absolute", left: actual.x - g.cx, top: actual.y - g.cy, width: g.w, height: g.h,
        cursor: vivo ? "grabbing" : "grab", touchAction: "none", userSelect: "none",
        zIndex: vivo ? 10 : seleccionada ? 5 : 1,
      }}
    >
      {Array.from({ length: mesa.capacidad }).map((_, i) => {
        const sp = g.posAsiento(i);
        const ocupado = asientos[i];
        return (
          <Tooltip key={i} title={ocupado ? `${ocupado.nombre}${ocupado.acompanante ? " (acompañante)" : ""}${ocupado.grupo ? ` · ${ocupado.grupo}` : ""}` : "Asiento libre"} arrow>
            <Box
              sx={{
                position: "absolute", width: g.asiento * 2 + 4, height: g.asiento * 2 + 4,
                left: sp.x - g.asiento - 2, top: sp.y - g.asiento - 2,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 800,
                color: ocupado ? "#fff" : "#a89a8c", filter: ocupado ? "drop-shadow(0 1px 2px rgba(44,26,14,0.35))" : "none",
              }}
            >
              <Box sx={{ position: "absolute", inset: 0 }}>
                <Silla rot={sp.rot} relleno={ocupado ? colorDe(ocupado.grupo) : "#fff"} borde={ocupado ? "#fff" : "#a89a8c"} />
              </Box>
              <Box sx={{ position: "relative", mt: "1px" }}>{ocupado ? iniciales(ocupado.nombre) : i + 1}</Box>
            </Box>
          </Tooltip>
        );
      })}
      <Box
        sx={{
          position: "absolute", left: g.cx - (g.rect ? g.cuerpoW / 2 : g.radio), top: g.cy - (g.rect ? g.cuerpoH / 2 : g.radio),
          width: g.rect ? g.cuerpoW : g.radio * 2, height: g.rect ? g.cuerpoH : g.radio * 2,
          borderRadius: g.rect ? "8px" : "50%", bgcolor: encima ? "#fdecef" : "#fff", textAlign: "center",
          border: seleccionada ? "3px solid #a0455e" : encima ? "3px dashed #a0455e" : `2px solid ${lleno ? "#f59e0b" : "#d8c9bd"}`,
          boxShadow: vivo ? "0 10px 26px rgba(44,26,14,0.28)" : "0 2px 8px rgba(44,26,14,0.12)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 0.5,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#2c1a0e", lineHeight: 1.1, maxWidth: g.ancho, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {mesa.nombre}
        </Typography>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: lleno ? "#b45309" : "#8a7a5c" }}>
          {mesa.ocupados}/{mesa.capacidad}
        </Typography>
      </Box>
    </Box>
  );
}

const ESTILO_ESPACIO = {
  ESCENARIO: { fondo: "#f1eea0", borde: "#b8b45a", texto: "#6b6730" },
  PISTA: { fondo: "#e6f0ff", borde: "#8aa9d6", texto: "#3b5f8f" },
  BAR: { fondo: "#fdeedd", borde: "#d6a76a", texto: "#8a5a22" },
  COCINA: { fondo: "#ece8e2", borde: "#a99f92", texto: "#6b6258" },
  OTRO: { fondo: "#f0f0f0", borde: "#b5b5b5", texto: "#666" },
};
const TIPOS_ESPACIO = [
  ["ESCENARIO", "Escenario"], ["PISTA", "Pista de baile"], ["BAR", "Bar"], ["COCINA", "Cocina"], ["OTRO", "Otro espacio"],
];

/** Zona del salon dibujada en el plano (escenario, pista, bar...): se arrastra igual que una mesa, pero va por detras. */
function Espacio({ espacio, pos, seleccionado, zoom, onSeleccionar, onMovido }) {
  const e = ESTILO_ESPACIO[espacio.tipo] ?? ESTILO_ESPACIO.OTRO;
  const arrastre = useRef(null);
  const [vivo, setVivo] = useState(null);
  const actual = vivo ?? pos;

  const iniciar = (ev) => {
    if (ev.button !== undefined && ev.button !== 0) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    arrastre.current = { x0: ev.clientX, y0: ev.clientY, px: pos.x, py: pos.y, movio: false };
  };
  const mover = (ev) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = (ev.clientX - a.x0) / zoom;
    const dy = (ev.clientY - a.y0) / zoom;
    if (!a.movio && Math.hypot(dx, dy) < 4) return;
    a.movio = true;
    setVivo({ x: Math.max(0, a.px + dx), y: Math.max(0, a.py + dy) });
  };
  const terminar = (ev) => {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a) return;
    try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch { /* ya liberado */ }
    if (!a.movio) { onSeleccionar(espacio.id_espacio); return; }
    setVivo(null);
    onMovido(espacio.id_espacio, ajustar(a.px + (ev.clientX - a.x0) / zoom), ajustar(a.py + (ev.clientY - a.y0) / zoom));
  };

  return (
    <Box
      onPointerDown={iniciar} onPointerMove={mover} onPointerUp={terminar} onPointerCancel={terminar}
      sx={{
        position: "absolute", left: actual.x, top: actual.y, width: espacio.ancho, height: espacio.alto, zIndex: 0,
        bgcolor: e.fondo, border: seleccionado ? "3px solid #a0455e" : `2px solid ${e.borde}`, borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 1,
        cursor: vivo ? "grabbing" : "grab", touchAction: "none", userSelect: "none", opacity: vivo ? 0.85 : 1,
      }}
    >
      <Typography sx={{ fontWeight: 800, color: e.texto, fontSize: "1.05rem", letterSpacing: 1, textTransform: "uppercase", writingMode: espacio.alto > espacio.ancho * 1.6 ? "vertical-rl" : "horizontal-tb" }}>
        {espacio.nombre}
      </Typography>
    </Box>
  );
}

/**
 * Plano del salon: mesas redondas que se arrastran (se guardan en la base), zoom, y panel lateral para sentar gente
 * (arrastrando a una mesa o con el selector). `renderPersona` pinta una fila con el selector de mesa.
 */
export default function PlanoMesas({ mesas, sinMesa, espacios = [], renderPersona, onMover, onPosicion, onEditar, onBorrar, onEspacioMovido, onEspacioGuardar, onEspacioCrear, onEspacioEliminar }) {
  const [zoom, setZoom] = useState(0.5);
  const [verFondo, setVerFondo] = useState(true);
  const [seleccion, setSeleccion] = useState(null);
  const [ov, setOv] = useState({});
  const [ovEsp, setOvEsp] = useState({});
  const [espSel, setEspSel] = useState(null);
  const [menuEsp, setMenuEsp] = useState(null);
  const [medidas, setMedidas] = useState(null);

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

  const posEsp = (e) => ovEsp[e.id_espacio] ?? { x: e.pos_x, y: e.pos_y };
  const ancho = Math.max(MIN_W, ...(verFondo ? [FONDO_PLANO.x + FONDO_PLANO.w] : []), ...Object.values(posiciones).map((p) => p.x + 320), ...espacios.map((e) => posEsp(e).x + e.ancho + 40));
  const alto = Math.max(MIN_H, ...(verFondo ? [FONDO_PLANO.y + FONDO_PLANO.h] : []), ...Object.values(posiciones).map((p) => p.y + 320), ...espacios.map((e) => posEsp(e).y + e.alto + 40));
  const espElegido = espacios.find((e) => e.id_espacio === espSel) ?? null;
  const elegida = mesas.find((m) => m.id_mesa === seleccion) ?? null;

  const espMovido = (id, x, y) => {
    setOvEsp((p) => ({ ...p, [id]: { x, y } }));
    onEspacioMovido(id, x, y);
  };
  const elegirEspacio = (id) => { setEspSel(id); setSeleccion(null); setMedidas(null); };
  const elegirMesa = (id) => { setSeleccion(id); setEspSel(null); };

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
          <Button size="small" onClick={() => setVerFondo((v) => !v)} sx={{ textTransform: "none", fontWeight: 700, color: "#7a4030" }}>{verFondo ? "Ocultar plano del local" : "Mostrar plano del local"}</Button>
          <Button size="small" startIcon={<AddIcon />} onClick={(e) => setMenuEsp(e.currentTarget)} sx={{ textTransform: "none", fontWeight: 700, color: "#a0455e" }}>Agregar espacio</Button>
          <Menu anchorEl={menuEsp} open={!!menuEsp} onClose={() => setMenuEsp(null)}>
            {TIPOS_ESPACIO.map(([tipo, etiqueta]) => (
              <MenuItem key={tipo} onClick={() => { setMenuEsp(null); onEspacioCrear(tipo); }}>{etiqueta}</MenuItem>
            ))}
          </Menu>
          <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))}><ZoomOutIcon fontSize="small" /></IconButton>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, minWidth: 38, textAlign: "center" }}>{Math.round(zoom * 100)}%</Typography>
          <IconButton size="small" onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))}><ZoomInIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ height: { xs: 460, md: "66vh" }, overflow: "auto", bgcolor: "#faf6f2" }}>
          <Box sx={{ width: ancho * zoom, height: alto * zoom, position: "relative" }}>
            <Box
              onPointerDown={(e) => { if (e.target === e.currentTarget) { setSeleccion(null); setEspSel(null); } }}
              sx={{
                position: "absolute", left: 0, top: 0, width: ancho, height: alto, transform: `scale(${zoom})`, transformOrigin: "top left",
                backgroundImage: "radial-gradient(circle, #d9cabd 1px, transparent 1.4px)", backgroundSize: `${SNAP}px ${SNAP}px`,
              }}
            >
              {verFondo && (
                <Box component="img" src={FONDO_PLANO.url} alt="Plano del salón" draggable={false}
                  sx={{ position: "absolute", left: FONDO_PLANO.x, top: FONDO_PLANO.y, width: FONDO_PLANO.w, height: FONDO_PLANO.h, pointerEvents: "none", userSelect: "none", zIndex: 0 }} />
              )}
              {espacios.map((e) => (
                <Espacio key={e.id_espacio} espacio={e} pos={posEsp(e)} seleccionado={espSel === e.id_espacio} zoom={zoom} onSeleccionar={elegirEspacio} onMovido={espMovido} />
              ))}
              {mesas.map((m) => (
                <Mesa
                  key={m.id_mesa} mesa={m} pos={posiciones[m.id_mesa]} seleccionada={seleccion === m.id_mesa} colorDe={colorDe} zoom={zoom}
                  onSeleccionar={elegirMesa} onMovida={movida} onSoltarPersona={(id, idMesa) => onMover(id, idMesa)}
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
        {espElegido && (
          <Paper elevation={0} sx={{ borderRadius: "14px", border: "1px solid rgba(204,107,142,0.18)", p: 1.5, display: "flex", flexDirection: "column", gap: 1.2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 800, color: "#2c1a0e" }}>Espacio del salón</Typography>
              <IconButton size="small" onClick={() => setEspSel(null)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
            </Box>
            {(() => {
              const m = medidas ?? { nombre: espElegido.nombre, ancho: espElegido.ancho, alto: espElegido.alto };
              const cambiado = m.nombre !== espElegido.nombre || m.ancho !== espElegido.ancho || m.alto !== espElegido.alto;
              return (
                <>
                  <TextField size="small" label="Nombre" value={m.nombre} inputProps={{ maxLength: 60 }} onChange={(e) => setMedidas({ ...m, nombre: e.target.value })} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField size="small" type="number" label="Ancho" value={m.ancho} inputProps={{ min: 40, max: 2000, step: 20 }} onChange={(e) => setMedidas({ ...m, ancho: Number(e.target.value) })} />
                    <TextField size="small" type="number" label="Alto" value={m.alto} inputProps={{ min: 40, max: 2000, step: 20 }} onChange={(e) => setMedidas({ ...m, alto: Number(e.target.value) })} />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" variant="contained" disabled={!cambiado || !m.nombre.trim() || !(m.ancho >= 40) || !(m.alto >= 40)} onClick={() => { onEspacioGuardar(espElegido.id_espacio, { nombre: m.nombre.trim(), ancho: Math.round(m.ancho), alto: Math.round(m.alto) }); setMedidas(null); }} sx={{ textTransform: "none", fontWeight: 700 }}>Guardar</Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon sx={{ fontSize: 15 }} />} onClick={() => { onEspacioEliminar(espElegido); setEspSel(null); }} sx={{ textTransform: "none", fontWeight: 700 }}>Eliminar</Button>
                  </Box>
                  <Typography sx={{ fontSize: "0.68rem", color: "#b8a090" }}>Arrástralo en el plano para moverlo.</Typography>
                </>
              );
            })()}
          </Paper>
        )}

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
