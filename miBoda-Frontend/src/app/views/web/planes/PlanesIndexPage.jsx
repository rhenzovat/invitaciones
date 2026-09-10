import React, { useEffect, useRef, useState } from "react";
import { injectIntl, useIntl } from "react-intl";
import {
  Box, Typography, Button, IconButton, TextField,
  Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  Tooltip,
} from "@mui/material";
import EditIcon          from "@mui/icons-material/Edit";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import AddIcon           from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon          from "@mui/icons-material/Star";
import PriceCheckIcon    from "@mui/icons-material/PriceCheck";
import CheckIcon         from "@mui/icons-material/Check";
import WhatsAppIcon      from "@mui/icons-material/WhatsApp";

import { listar, crear, actualizar, eliminar } from "../../../api/web_planes.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import { authJWTConfig } from "app/authJWTConfig";

const Domain = `${(authJWTConfig.domain || "").replace(/\/$/, "")}/`;

/* ══ PALETA ══ */
const C = {
  gold:      "#d9a56b",
  goldLt:    "#f5d39d",
  wine:      "#2a0f16",
  wineAlt:   "#33141a",
  cardBorder:"rgba(217,165,107,.28)",
  text:      "#f5e6e2",
  textMuted: "#d3b3ae",
  edit:      "#f97316",
  dark:      "#2c1a0e",
  cream:     "#fdf8f5",
  pink:      "#cc6b8e",
};

/* ── helpers ── */
const parseCaract = (c) => {
  if (Array.isArray(c)) return c;
  if (typeof c === "string") { try { return JSON.parse(c); } catch { return []; } }
  return [];
};

/* ══════════════════════════════════════════════════════════
   EDIT ZONE con lápiz naranja
══════════════════════════════════════════════════════════ */
function EZ({ id, active, onEdit, children, sx = {}, hint = "Editar" }) {
  const isA = active === id;
  return (
    <Box sx={{
      position: "relative",
      outline: isA ? `2px solid ${C.edit}` : "2px solid transparent",
      outlineOffset: 3, borderRadius: "8px",
      transition: "outline .15s",
      "&:hover .ez-p": { opacity: 1 },
      ...sx,
    }}>
      {children}
      <Tooltip title={hint} placement="top">
        <Box className="ez-p"
          onClick={e => { e.stopPropagation(); onEdit(id); }}
          sx={{
            position: "absolute", top: -11, right: -11,
            width: 28, height: 28, borderRadius: "50%",
            bgcolor: isA ? "#ea580c" : C.edit, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 20,
            opacity: isA ? 1 : 0, transition: "opacity .15s",
            boxShadow: "0 2px 10px rgba(249,115,22,.5)",
            "&:hover": { transform: "scale(1.15)", bgcolor: "#ea580c" },
          }}>
          <EditIcon sx={{ fontSize: 13 }} />
        </Box>
      </Tooltip>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS — replica fiel de la sección "Planes" del sitio
══════════════════════════════════════════════════════════ */
function CanvasPreview({ planes, sectionTitle, sectionTag, active, onEdit, onAddPlan }) {
  return (
    <Box sx={{ fontFamily: "'Open Sans', sans-serif", userSelect: "none" }}>

      {/* ── Fondo con imagen + overlay oscuro ─────────────────────── */}
      <Box sx={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, rgba(44,26,14,.88) 0%, rgba(74,42,21,.82) 100%),
                     url('${Domain}temp02/img/inicio/slider_3.jpg') center/cover no-repeat`,
        py: "56px", px: "20px", textAlign: "center",
      }}>
        {/* Decoración dorada */}
        <Box sx={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 2, height: 40, background: `linear-gradient(to bottom, ${C.gold}, transparent)`,
        }} />

        {/* ── Cabecera de sección ── */}
        <EZ id="seccion_header" active={active} onEdit={onEdit} hint="Editar título de sección"
          sx={{ display: "inline-block", mb: 3 }}>
          <Box>
            <Typography sx={{
              fontSize: "11px", fontWeight: 800, letterSpacing: "4px",
              textTransform: "uppercase", color: C.goldLt, mb: 1,
            }}>
              {sectionTag || "NUESTROS PLANES"}
            </Typography>
            <Typography sx={{
              fontFamily: "'PT Serif', Georgia, serif",
              fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700,
              color: "#fff", lineHeight: 1.15,
            }}>
              {sectionTitle || (
                <>Elige tu Experiencia<br />
                  <em style={{ color: C.pink }}>Royal</em>
                </>
              )}
            </Typography>
          </Box>
        </EZ>

        {/* ── Grid de tarjetas ─────────────────────────────────────── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(planes.length + 1, 4)}, 1fr)`,
          gap: "16px", maxWidth: 1140, mx: "auto", mt: 4,
        }}>
          {planes.map((plan, i) => (
            <EZ key={plan.id_plan || i} id={`plan_${plan.id_plan || i}`}
              active={active} onEdit={onEdit} hint={`Editar: ${plan.nombre}`}
              sx={{ position: "relative" }}>
              <PlanCard plan={plan} isActive={active === `plan_${plan.id_plan || i}`} />
            </EZ>
          ))}

          {/* + Agregar plan */}
          <Box onClick={onAddPlan} sx={{
            border: "2px dashed rgba(255,255,255,.25)", borderRadius: "16px",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: 220, cursor: "pointer",
            transition: ".2s", color: "rgba(255,255,255,.4)",
            "&:hover": { borderColor: C.edit, color: C.edit, bgcolor: "rgba(249,115,22,.06)" },
          }}>
            <AddIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>Nuevo plan</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ════════════════════════════════════════════════════════
   CANVAS TARIFAS — replica la sección pública "Rituales que cuidan"
═══════════════════════════════════════════════════════ */
function TarifaCanvas({ planes, active, onEdit }) {
  const SERIF = "'Playfair Display', 'PT Serif', Georgia, serif";
  const mid   = Math.ceil(planes.length / 2);
  const col1  = planes.slice(0, mid);
  const col2  = planes.slice(mid);

  const TarifaRow = ({ plan, i }) => {
    const zoneId = `plan_${plan.id_plan || plan._localId || i}`;
    const isA    = active === zoneId;
    return (
      <EZ id={zoneId} active={active} onEdit={onEdit} hint={`Editar: ${plan.nombre}`}>
        <Box sx={{
          py: 2.5, borderBottom: `1px solid ${C.cardBorder}`,
          transition: ".2s",
          bgcolor: isA ? "rgba(217,165,107,0.07)" : "transparent",
          cursor: "pointer",
          borderRadius: isA ? "6px" : 0,
          px: isA ? 1 : 0,
        }}>
          {/* Nombre + precio */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.6 }}>
            <Typography sx={{
              fontFamily: SERIF, fontSize: "1rem", fontWeight: 700,
              color: C.gold, flex: 1, pr: 1,
            }}>
              {plan.nombre}
            </Typography>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography sx={{ fontSize: "0.65rem", color: C.textMuted, letterSpacing: "0.05em" }}>S/</Typography>
              <Typography sx={{
                fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 700,
                color: C.text, lineHeight: 1,
              }}>
                {(plan.precio_nota || "Consultar").replace(/^(desde\s*|s\/\s*)/i, "")}
              </Typography>
            </Box>
          </Box>
          {/* Línea dorada */}
          <Box sx={{
            height: "1px", mb: 0.8,
            background: `linear-gradient(90deg, ${C.gold}, transparent)`,
          }} />
          {/* Descripción */}
          <Typography sx={{ color: C.textMuted, fontSize: "0.8rem", lineHeight: 1.55 }}>
            {plan.descripcion || ""}
          </Typography>
        </Box>
      </EZ>
    );
  };

  return (
    <Box sx={{
      background: `linear-gradient(160deg, ${C.wine} 0%, ${C.wineAlt} 100%)`,
      px: { xs: 3, md: 6 }, py: 6,
    }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography sx={{
          fontFamily: SERIF, fontStyle: "italic", fontSize: "1rem",
          color: C.gold, mb: 0.6,
        }}>
          Tarifas · Inversión En Calma
        </Typography>
        <Typography sx={{
          fontFamily: SERIF, fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
          fontWeight: 700, color: C.text, textTransform: "uppercase", lineHeight: 1.15,
        }}>
          Rituales que cuidan cuerpo
          <br />y piel
        </Typography>
        <Box sx={{
          width: 60, height: 2, mx: "auto", mt: 2,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        }} />
      </Box>

      {/* Grid 2 columnas */}
      {planes.length === 0 ? (
        <Typography sx={{ color: C.textMuted, textAlign: "center", fontStyle: "italic" }}>
          Aún no hay planes/rituales — agrega uno con "Nuevo plan"
        </Typography>
      ) : (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 0, md: "0 60px" },
          maxWidth: 900, mx: "auto",
        }}>
          <Box>{col1.map((p, i) => <TarifaRow key={p.id_plan || i} plan={p} i={i} />)}</Box>
          <Box>{col2.map((p, i) => <TarifaRow key={p.id_plan || i} plan={p} i={mid + i} />)}</Box>
        </Box>
      )}
    </Box>
  );
}


/* ── Tarjeta de plan (réplica del front) ── */
function PlanCard({ plan, isActive }) {
  const car = parseCaract(plan.caracteristicas);
  return (
    <Box sx={{
      borderRadius: "16px", overflow: "hidden", textAlign: "left",
      border: plan.es_destacado ? `2px solid ${C.gold}` : "1px solid rgba(255,255,255,.12)",
      boxShadow: isActive ? `0 0 0 3px ${C.edit}` : "0 8px 32px rgba(0,0,0,.25)",
      background: "#fff", transition: ".25s",
    }}>
      {/* Destacado badge */}
      {plan.es_destacado && (
        <Box sx={{
          bgcolor: C.gold, color: "#fff", textAlign: "center",
          fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px",
          py: "4px", textTransform: "uppercase",
        }}>
          ⭐ MÁS POPULAR
        </Box>
      )}

      {/* Header oscuro */}
      <Box sx={{
        background: "linear-gradient(135deg, #1e0e05 0%, #3a1a08 100%)",
        p: "14px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <Box>
          <Typography sx={{ fontSize: "9px", color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: 1 }}>
            Desde
          </Typography>
          <Typography sx={{ fontFamily: "'PT Serif', serif", fontSize: "1.1rem", color: C.goldLt, fontWeight: 700, lineHeight: 1.1 }}>
            {plan.precio_nota || "S/ Consultar"}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "'PT Serif', serif", fontSize: ".78rem", fontWeight: 700, color: "#fff", textAlign: "right", maxWidth: "55%", lineHeight: 1.3 }}>
          {plan.nombre}
        </Typography>
      </Box>

      {/* Features */}
      <Box sx={{ p: "14px 16px", background: C.cream }}>
        {car.slice(0, 5).map((item, i) => (
          <Box key={i} sx={{ display: "flex", gap: "8px", mb: "6px", alignItems: "flex-start" }}>
            <CheckIcon sx={{ color: C.gold, fontSize: 12, mt: "2px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "11px", color: "#555", lineHeight: 1.45 }}>
              {typeof item === "string" ? item : (item?.texto || "")}
            </Typography>
          </Box>
        ))}
        {car.length > 5 && (
          <Typography sx={{ fontSize: "10px", color: C.gold, fontWeight: 700, mt: "4px" }}>
            +{car.length - 5} más incluidos…
          </Typography>
        )}

        {/* Botón WA */}
        <Box sx={{
          mt: "12px",
          background: `linear-gradient(135deg, #25d366, #128c5e)`,
          borderRadius: "50px", py: "8px", px: "14px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <WhatsAppIcon sx={{ fontSize: 13, color: "#fff" }} />
          <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#fff", letterSpacing: ".5px" }}>
            Reservar
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   CAMPO SIMPLE
══════════════════════════════════════════════════════════ */
const FF = ({ label, value, onChange, multiline = false, rows = 2, placeholder = "" }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#475569",
      textTransform: "uppercase", letterSpacing: .5, mb: .5 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" value={value || ""}
      multiline={multiline} rows={multiline ? rows : undefined}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      sx={{
        "& .MuiInputBase-root": { fontSize: ".82rem", bgcolor: "#f8fafc" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.edit },
      }} />
  </Box>
);

/* ══════════════════════════════════════════════════════════
   PANEL EDITOR DERECHO
══════════════════════════════════════════════════════════ */
function EditPanel({ zone, planes, sectionTitle, sectionTag, onChangeSec, onChangePlan, onSaveSec, onSavePlan, onDeletePlan, saving, onClose }) {
  const isSeccion = zone === "seccion_header";
  const planIdx   = isSeccion ? -1 : planes.findIndex((p, i) => `plan_${p.id_plan || p._localId || i}` === zone);
  const plan      = planIdx >= 0 ? planes[planIdx] : null;
  const car       = plan ? parseCaract(plan.caracteristicas) : [];

  const updateCaract = (idx, val) => {
    const next = car.map((c, i) => i === idx ? val : c);
    onChangePlan(planIdx, "caracteristicas", next);
  };
  const addCaract    = () => onChangePlan(planIdx, "caracteristicas", [...car, ""]);
  const removeCaract = (idx) => onChangePlan(planIdx, "caracteristicas", car.filter((_, i) => i !== idx));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 1, bgcolor: "#fafbfc",
        position: "sticky", top: 0, zIndex: 10 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#fff7ed",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EditIcon sx={{ fontSize: 14, color: C.edit }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: ".85rem", flex: 1, color: "#0f172a", lineHeight: 1.2 }}>
          {isSeccion ? "🏷️ Cabecera de sección" : `💎 ${plan?.nombre || "Plan"}`}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>

        {/* ── Sección header ── */}
        {isSeccion && (
          <>
            <FF label="Etiqueta superior (ej: NUESTROS PLANES)" value={sectionTag}
              onChange={v => onChangeSec("tag", v)} placeholder="NUESTROS PLANES" />
            <FF label="Título (línea 1)" value={sectionTitle}
              onChange={v => onChangeSec("title", v)} placeholder="Elige tu Experiencia Royal" />
            <Box sx={{ p: 1.5, bgcolor: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd", mt: 1 }}>
              <Typography sx={{ fontSize: ".75rem", color: "#0369a1" }}>
                💡 El título puede incluir HTML — ej: <code>{"Elige tu Experiencia <em>Royal</em>"}</code>
              </Typography>
            </Box>
          </>
        )}

        {/* ── Plan editor ── */}
        {plan && (
          <>
            <FF label="Nombre del plan" value={plan.nombre}
              onChange={v => onChangePlan(planIdx, "nombre", v)} placeholder="Masaje Relajante" />
            <FF label="Precio (ej: S/ 200 o Consultar)" value={plan.precio_nota}
              onChange={v => onChangePlan(planIdx, "precio_nota", v)} placeholder="Desde S/ consultar" />
            <FF label="Descripción" value={plan.descripcion}
              onChange={v => onChangePlan(planIdx, "descripcion", v)} multiline rows={4} />
            <FF label="Orden (número)" value={String(plan.orden ?? "")}
              onChange={v => onChangePlan(planIdx, "orden", v)} placeholder="1" />
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f1f5f9", display: "flex", gap: 1 }}>
        {!isSeccion && plan && (
          <IconButton size="small" onClick={() => onDeletePlan(plan)}
            sx={{ color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", px: 1.5 }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
        <Button variant="contained" fullWidth startIcon={<SaveIcon sx={{ fontSize: 15 }} />}
          onClick={isSeccion ? onSaveSec : () => onSavePlan(planIdx)}
          disabled={saving}
          sx={{ textTransform: "none", fontWeight: 800, fontSize: ".85rem",
            bgcolor: C.gold, borderRadius: "10px", py: 1,
            boxShadow: `0 4px 16px rgba(184,134,11,.35)`,
            "&:hover": { bgcolor: "#8b6508" } }}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
const EMPTY_PLAN = {
  nombre: "Nuevo Plan", descripcion: "", precio: 0,
  precio_nota: "Desde S/ consultar",
  caracteristicas: ["Característica 1"],
  url_whatsapp: "https://wa.me/51982311335",
  es_destacado: 0, icono: "✦", orden: 99,
};

const PlanesIndexPage = (props) => {
  const { setLoading } = props;
  const intl = useIntl();

  const [planes,      setPlanes]      = useState([]);
  const [planesDraft, setPlanesDraft] = useState(null);
  const [secTag,      setSecTag]      = useState("NUESTROS PLANES");
  const [secTitle,    setSecTitle]    = useState("Elige tu Experiencia Royal");
  const [secDraft,    setSecDraft]    = useState(null);
  const [activeZone,  setActiveZone]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [delTarget,   setDelTarget]   = useState(null);
  const [viewMode,    setViewMode]    = useState("tarifas"); // "planes" | "tarifas"
  const panelRef = useRef(null);

  const displayPlanes = planesDraft ?? planes;
  const displayTag    = secDraft?.tag   ?? secTag;
  const displayTitle  = secDraft?.title ?? secTitle;
  const hasDraft      = planesDraft !== null || secDraft !== null;

  /* ── Carga ── */
  const load = async () => {
    setLoading(true);
    try {
      const data = await listar();
      setPlanes(data || []);
      setPlanesDraft(null);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  /* ── Editar zona ── */
  const handleEdit = (zone) => {
    setActiveZone(p => p === zone ? null : zone);
    setTimeout(() => { panelRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, 60);
  };

  /* ── Cambios sección ── */
  const handleChangeSec = (key, val) =>
    setSecDraft(p => ({ ...(p || { tag: secTag, title: secTitle }), [key]: val }));

  /* ── Cambios plan ── */
  const handleChangePlan = (idx, field, val) => {
    const base = planesDraft ? [...planesDraft] : [...planes];
    base[idx] = { ...base[idx], [field]: val };
    setPlanesDraft(base);
  };

  /* ── Agregar plan ── */
  const handleAddPlan = () => {
    const base = planesDraft ? [...planesDraft] : [...planes];
    // Calcular el siguiente orden
    const validOrders = base.map(p => parseInt(p.orden)).filter(o => !isNaN(o) && o < 99);
    const nextOrden = validOrders.length > 0 ? Math.max(...validOrders) + 1 : base.length + 1;

    const newPlan = { ...EMPTY_PLAN, orden: nextOrden, _new: true, _localId: Date.now() };
    setPlanesDraft([...base, newPlan]);
    setActiveZone(`plan_${newPlan._localId}`);
  };

  /* ── Guardar sección ── */
  const handleSaveSec = () => {
    if (secDraft?.tag)   setSecTag(secDraft.tag);
    if (secDraft?.title) setSecTitle(secDraft.title);
    setSecDraft(null);
    setActiveZone(null);
    toastSuccess("Cabecera actualizada ✓  (Los textos de sección son locales — el título se gestiona desde el seeder/DB)");
  };

  /* ── Guardar plan ── */
  const handleSavePlan = async (idx) => {
    const plan = displayPlanes[idx];
    if (!plan) return;
    setSaving(true);
    try {
      const payload = {
        ...plan,
        precio:          parseFloat(plan.precio) || 0,
        es_destacado:    plan.es_destacado ? 1 : 0,
        orden:           parseInt(plan.orden)    || 99,
        caracteristicas: JSON.stringify(parseCaract(plan.caracteristicas)),
      };
      if (plan._new) {
        const saved = await crear(payload);
        toastSuccess(`Plan "${plan.nombre}" creado ✓`);
        // Reemplazar _new por el guardado
        const base = [...displayPlanes];
        base[idx] = saved || plan;
        setPlanesDraft(null);
      } else {
        await actualizar(payload);
        toastSuccess(`Plan "${plan.nombre}" actualizado ✓`);
        setPlanesDraft(null);
      }
      setActiveZone(null);
      load();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Eliminar plan ── */
  const confirmDelete = (plan) => setDelTarget(plan);
  const handleDelete  = async () => {
    if (!delTarget) return;
    setSaving(true);
    try {
      if (!delTarget._new) await eliminar({ id_plan: delTarget.id_plan });
      setPlanesDraft(null);
      setActiveZone(null);
      setDelTarget(null);
      toastSuccess("Plan eliminado ✓");
      load();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setSaving(false);
    }
  };

  /* ═══════════════════════════════════════════════════════ */
  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#ffffff" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2,
        background: `linear-gradient(135deg, ${C.wine} 0%, ${C.wineAlt} 100%)`,
        borderRadius: "12px", px: 2.5, py: 1.2 }}>
        <PriceCheckIcon sx={{ color: C.gold, fontSize: 20 }} />
        <Box flex={1}>
          <Typography sx={{ fontWeight: 800, fontSize: ".9rem", color: "#f1f5f9", lineHeight: 1 }}>
            Editor de Planes & Tarifas — Canvas
          </Typography>
          <Typography sx={{ fontSize: ".65rem", color: C.textMuted }}>
            Haz clic en ✏️ sobre cualquier item para editarlo
          </Typography>
        </Box>
        <Chip label={`${displayPlanes.length} items`} size="small"
          sx={{ bgcolor: "rgba(217,165,107,.2)", color: C.gold, fontSize: ".65rem", height: 22 }} />

        {/* Toggle vista */}
        <Box sx={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.cardBorder}` }}>
          {[{ key: "planes", label: "🏆 Planes" }, { key: "tarifas", label: "🍿 Tarifas" }].map(({ key, label }) => (
            <Box key={key} onClick={() => setViewMode(key)} sx={{
              px: 1.5, py: 0.5, cursor: "pointer", fontSize: ".72rem", fontWeight: 700,
              bgcolor: viewMode === key ? C.gold : "transparent",
              color: viewMode === key ? C.wine : C.textMuted,
              transition: ".2s",
              "&:hover": { bgcolor: viewMode !== key ? "rgba(217,165,107,.15)" : undefined },
            }}>{label}</Box>
          ))}
        </Box>

        {hasDraft && (
          <Button size="small" variant="outlined"
            onClick={() => { setPlanesDraft(null); setSecDraft(null); }}
            sx={{ textTransform: "none", fontSize: ".75rem", color: "#94a3b8",
              borderColor: "rgba(255,255,255,.3)", borderRadius: "8px" }}>
            Descartar
          </Button>
        )}
        <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={handleAddPlan}
          sx={{ bgcolor: C.edit, textTransform: "none", fontSize: ".78rem",
            borderRadius: "8px", "&:hover": { bgcolor: "#ea580c" } }}>
          Nuevo plan
        </Button>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

        {/* Canvas */}
        <Box sx={{ flex: 1 }} onClick={() => activeZone && setActiveZone(null)}>
          <Box sx={{ borderRadius: "12px", overflow: "hidden",
            border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
            {planes.length > 0 || planesDraft ? (
              viewMode === "planes" ? (
                <CanvasPreview
                  planes={displayPlanes}
                  sectionTitle={displayTitle}
                  sectionTag={displayTag}
                  active={activeZone}
                  onEdit={handleEdit}
                  onAddPlan={handleAddPlan}
                />
              ) : (
                <TarifaCanvas
                  planes={displayPlanes}
                  active={activeZone}
                  onEdit={handleEdit}
                />
              )
            ) : (
              <Box sx={{ p: 6, textAlign: "center", bgcolor: C.wine }}>
                <CircularProgress size={28} sx={{ color: C.gold }} />
              </Box>
            )}
          </Box>

          {/* Leyenda chips */}
          <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            {viewMode === "planes" && (
              <Box onClick={() => handleEdit("seccion_header")}
                sx={{ display: "flex", alignItems: "center", gap: .6, cursor: "pointer",
                  px: 1.2, py: .5, borderRadius: "8px",
                  bgcolor: activeZone === "seccion_header" ? "#fff7ed" : "#fff",
                  border: `1px solid ${activeZone === "seccion_header" ? C.edit : "#e2e8f0"}`,
                  "&:hover": { borderColor: C.edit } }}>
                <Typography sx={{ fontSize: ".72rem",
                  fontWeight: activeZone === "seccion_header" ? 700 : 400,
                  color: activeZone === "seccion_header" ? C.edit : "#64748b" }}>
                  🏷️ Cabecera
                </Typography>
              </Box>
            )}
            {displayPlanes.map((plan, i) => {
              const zone = `plan_${plan.id_plan || plan._localId || i}`;
              return (
                <Box key={zone} onClick={() => handleEdit(zone)}
                  sx={{ display: "flex", alignItems: "center", gap: .6, cursor: "pointer",
                    px: 1.2, py: .5, borderRadius: "8px",
                    bgcolor: activeZone === zone ? "#fff7ed" : "#fff",
                    border: `1px solid ${activeZone === zone ? C.edit : "#e2e8f0"}`,
                    "&:hover": { borderColor: C.edit } }}>
                  <Typography sx={{ fontSize: ".72rem",
                    fontWeight: activeZone === zone ? 700 : 400,
                    color: activeZone === zone ? C.edit : "#64748b" }}>
                    {plan.es_destacado ? "⭐" : "💰"} {plan.nombre}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Panel editor */}
        {activeZone && (
          <Box ref={panelRef} sx={{
            width: 370, flexShrink: 0,
            bgcolor: "#fff", borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,.08)",
            maxHeight: "82vh", overflowY: "auto",
            position: "sticky", top: 16,
          }}>
            <EditPanel
              zone={activeZone}
              planes={displayPlanes}
              sectionTitle={displayTitle}
              sectionTag={displayTag}
              onChangeSec={handleChangeSec}
              onChangePlan={handleChangePlan}
              onSaveSec={handleSaveSec}
              onSavePlan={handleSavePlan}
              onDeletePlan={confirmDelete}
              saving={saving}
              onClose={() => setActiveZone(null)}
            />
          </Box>
        )}
      </Box>

      {/* ── Confirm delete ── */}
      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar plan?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Se eliminará permanentemente: <strong>{delTarget?.nombre}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default injectIntl(WithLoandingPanel(PlanesIndexPage));
