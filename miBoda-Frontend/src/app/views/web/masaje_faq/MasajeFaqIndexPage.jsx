import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, IconButton, Tooltip, CircularProgress, Button,
  TextField, Divider, Stack, Dialog, DialogTitle, DialogActions,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon          from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon           from "@mui/icons-material/Add";
import SaveIcon          from "@mui/icons-material/Save";
import CloseIcon         from "@mui/icons-material/Close";
import SpaIcon           from "@mui/icons-material/Spa";
import ExpandMoreIcon    from "@mui/icons-material/ExpandMore";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FormatBoldIcon    from "@mui/icons-material/FormatBold";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

import { listar, crear, actualizar, eliminar } from "../../../api/web_masaje_faq.api";
import { toastSuccess, handleErrorMessages }   from "../../../components/notify-messages";

/* ── Paleta Royal Masajes ───────────────────────────────────────── */
const RM = {
  brown:   "#2c1a0e",
  midBrown:"#4a2a15",
  pink:    "#cc6b8e",
  deepPink:"#a0455e",
  gold:    "#b8860b",
  cream:   "#fdf8f5",
};

/* ── Styled ─────────────────────────────────────────────────────── */
const PageBox = styled(Box)({ padding: 16, minHeight: "100vh", backgroundColor: "#f0f4f8" });

const HeaderBar = styled(Box)({
  padding: "8px 14px",
  marginBottom: 16,
  borderRadius: 10,
  background: `linear-gradient(135deg,${RM.brown},${RM.midBrown})`,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 3px 12px rgba(44,26,14,0.35)",
});

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(204,107,142,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: RM.pink },
  "& .MuiInputLabel-root.Mui-focused": { color: RM.pink },
}));

/* ── Íconos disponibles ─────────────────────────────────────────── */
const ICONS = [
  "fas fa-question-circle","fas fa-om","fas fa-heart","fas fa-feather-alt",
  "fas fa-hands","fas fa-wind","fas fa-star","fas fa-user-check",
  "fas fa-spa","fas fa-seedling","fas fa-map-marker-alt","fas fa-lotus",
  "fas fa-infinity","fas fa-yin-yang","fas fa-fire","fas fa-leaf",
];

/* ═══════════════════════════════════════════════════════════════════
   MasajeFaqIndexPage
═══════════════════════════════════════════════════════════════════ */
export default function MasajeFaqIndexPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // null | { ...faq }
  const [isNew,   setIsNew]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [expanded, setExpanded]   = useState(false); // accordion key

  /* form state */
  const [form, setForm] = useState({ titulo: "", contenido: "", icono: "fas fa-spa", orden: 0, Activo: "S" });

  /* ── load ── */
  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await listar();
      setItems(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  }

  /* ── open edit panel ── */
  function openEdit(item) {
    setIsNew(false);
    setForm({
      titulo:    item.titulo    || "",
      contenido: item.contenido || "",
      icono:     item.icono     || "fas fa-spa",
      orden:     item.orden     || 0,
      Activo:    item.Activo    || "S",
    });
    setEditing(item);
  }

  function openNew() {
    setIsNew(true);
    const maxOrden = items.length ? Math.max(...items.map(i => i.orden || 0)) + 1 : 1;
    setForm({ titulo: "", contenido: "", icono: "fas fa-spa", orden: maxOrden, Activo: "S" });
    setEditing({ id: null });
  }

  function closeEdit() { setEditing(null); }

  /* ── save ── */
  async function handleSave() {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        await crear(form);
        toastSuccess("Sección creada correctamente");
      } else {
        await actualizar(editing.id, form);
        toastSuccess("Sección actualizada");
      }
      closeEdit();
      await fetchData();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  }

  /* ── delete ── */
  async function handleDelete() {
    if (!delTarget) return;
    try {
      await eliminar(delTarget.id);
      toastSuccess("Sección eliminada");
      setDelTarget(null);
      await fetchData();
    } catch (e) { handleErrorMessages(e); }
  }

  /* ── toggle activo ── */
  async function toggleActivo(item) {
    try {
      await actualizar(item.id, { Activo: item.Activo === "S" ? "N" : "S" });
      await fetchData();
    } catch (e) { handleErrorMessages(e); }
  }

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <PageBox>

      {/* ══ Header ══ */}
      <HeaderBar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: "8px",
            background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SpaIcon sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              Masaje Tántrico — Secciones FAQ
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Administra el contenido informativo de la página de masajes
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={openNew}
          startIcon={<AddIcon />}
          size="small"
          sx={{
            background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
            color: "#fff", borderRadius: "20px", textTransform: "none",
            fontWeight: 600, px: 2,
            "&:hover": { opacity: 0.9 },
          }}
        >
          Nueva sección
        </Button>
      </HeaderBar>

      {/* ══ Main content ══ */}
      <Box sx={{ display: "flex", gap: 2 }}>

        {/* ── Lista de FAQs ── */}
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: RM.pink }} />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{
              textAlign: "center", py: 8,
              background: "#fff", borderRadius: 3,
              border: `1px dashed ${RM.pink}`,
            }}>
              <SpaIcon sx={{ fontSize: 48, color: RM.pink, opacity: 0.4, mb: 2 }} />
              <Typography color="text.secondary">No hay secciones. Crea la primera.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {items.map((item) => (
                <FaqCard
                  key={item.id}
                  item={item}
                  expanded={expanded === item.id}
                  onToggle={() => setExpanded(expanded === item.id ? false : item.id)}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setDelTarget(item)}
                  onToggleActivo={() => toggleActivo(item)}
                />
              ))}
            </Box>
          )}

          {/* Info tip */}
          <Box sx={{
            mt: 3, p: 2, borderRadius: 2,
            background: "rgba(204,107,142,0.07)",
            border: `1px solid rgba(204,107,142,0.2)`,
          }}>
            <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
              💡 <strong>Tip:</strong> El contenido acepta HTML básico: &lt;p&gt;, &lt;ul&gt;&lt;li&gt;,
              &lt;strong&gt;, &lt;em&gt;. Usa ✦ como viñeta decorativa en los ítems de lista.
            </Typography>
          </Box>
        </Box>

        {/* ── Panel lateral de edición ── */}
        {editing && (
          <EditPanel
            form={form}
            setForm={setForm}
            isNew={isNew}
            saving={saving}
            onSave={handleSave}
            onClose={closeEdit}
          />
        )}
      </Box>

      {/* ── Confirmar eliminar ── */}
      <Dialog open={!!delTarget} onClose={() => setDelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'PT Serif',serif", color: RM.brown }}>
          ¿Eliminar sección?
        </DialogTitle>
        <Box sx={{ px: 3, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Se eliminará permanentemente: <strong>"{delTarget?.titulo}"</strong>
          </Typography>
        </Box>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDelTarget(null)} sx={{ color: "#888" }}>Cancelar</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{ background: "#e53935", "&:hover": { background: "#c62828" } }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

    </PageBox>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FaqCard — tarjeta con acordeón para ver contenido
══════════════════════════════════════════════════════════════════ */
function FaqCard({ item, expanded, onToggle, onEdit, onDelete, onToggleActivo }) {
  const isInactive = item.Activo !== "S";
  return (
    <Box sx={{
      background: "#fff",
      borderRadius: 2,
      border: `1.5px solid ${isInactive ? "#f0e0e8" : "#f0e0e8"}`,
      overflow: "hidden",
      opacity: isInactive ? 0.55 : 1,
      transition: "box-shadow .2s, border-color .2s",
      "&:hover": {
        borderColor: RM.pink,
        boxShadow: "0 4px 16px rgba(204,107,142,0.12)",
      },
    }}>
      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        p: "12px 16px", cursor: "pointer",
      }} onClick={onToggle}>
        <DragIndicatorIcon sx={{ color: "#ccc", fontSize: 18 }} />

        {/* Icono */}
        <Box sx={{
          flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
          background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={item.icono || "fas fa-spa"} style={{ fontSize: 14, color: "#fff" }} />
        </Box>

        {/* Número + título */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{
              background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
              color: "#fff", borderRadius: "10px", px: 0.8, py: 0.2,
              fontSize: 10, fontWeight: 700, lineHeight: 1.4,
            }}>
              #{item.orden}
            </Typography>
            <Typography sx={{
              fontFamily: "'PT Serif',serif", fontWeight: 700,
              color: RM.brown, fontSize: "0.95rem", lineHeight: 1.3,
            }}>
              {item.titulo}
            </Typography>
          </Box>
        </Box>

        {/* Acciones */}
        <Stack direction="row" spacing={0.5} onClick={e => e.stopPropagation()}>
          <Tooltip title={item.Activo === "S" ? "Desactivar" : "Activar"}>
            <Box
              onClick={onToggleActivo}
              sx={{
                width: 28, height: 16, borderRadius: "8px", cursor: "pointer",
                background: item.Activo === "S"
                  ? `linear-gradient(135deg,${RM.pink},${RM.deepPink})`
                  : "#ddd",
                position: "relative", transition: "background .2s",
              }}
            >
              <Box sx={{
                position: "absolute", top: 2,
                left: item.Activo === "S" ? 14 : 2,
                width: 12, height: 12, borderRadius: "50%",
                background: "#fff", transition: "left .2s",
              }} />
            </Box>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={onEdit}
              sx={{ color: RM.pink, "&:hover": { bgcolor: "rgba(204,107,142,0.1)" } }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={onDelete}
              sx={{ color: "#e53935", "&:hover": { bgcolor: "rgba(229,57,53,0.08)" } }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <ExpandMoreIcon sx={{
          fontSize: 18, color: "#aaa",
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform .25s",
        }} />
      </Box>

      {/* Contenido expandido */}
      {expanded && (
        <Box sx={{
          borderTop: "1px solid #fce8ef", px: 3, py: 2,
          background: "rgba(253,248,245,0.5)",
        }}>
          <Typography variant="caption" sx={{ color: "#aaa", display: "block", mb: 1 }}>
            Contenido HTML:
          </Typography>
          <Box
            sx={{ color: "#555", fontSize: "0.88rem", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: item.contenido }}
          />
        </Box>
      )}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════
   EditPanel — panel lateral de edición
══════════════════════════════════════════════════════════════════ */
function EditPanel({ form, setForm, isNew, saving, onSave, onClose }) {
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  /* Simple HTML helpers */
  const insertHtml = (tag) => {
    const ta = document.getElementById("faq-contenido-input");
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = form.contenido.substring(start, end);
    let inserted = "";
    if (tag === "p")  inserted = `<p>${sel || "Párrafo"}</p>`;
    if (tag === "ul") inserted = `<ul>\n  <li>✦ ${sel || "Item 1"}</li>\n  <li>✦ Item 2</li>\n</ul>`;
    if (tag === "b")  inserted = `<strong>${sel || "texto"}</strong>`;
    if (tag === "em") inserted = `<em>${sel || "cita o énfasis"}</em>`;
    const next = form.contenido.substring(0, start) + inserted + form.contenido.substring(end);
    setForm(f => ({ ...f, contenido: next }));
  };

  return (
    <Box sx={{
      width: 400, flexShrink: 0,
      background: `linear-gradient(180deg,${RM.brown},${RM.midBrown})`,
      borderRadius: 3, p: 0, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(44,26,14,0.35)",
      alignSelf: "flex-start",
      position: "sticky", top: 16,
    }}>

      {/* Panel header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        p: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 1.5,
            background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SpaIcon sx={{ fontSize: 15, color: "#fff" }} />
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
            {isNew ? "Nueva sección" : "Editar sección"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "rgba(255,255,255,0.5)" }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Panel body */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Título */}
        <DarkField
          label="Título / Pregunta"
          value={form.titulo}
          onChange={set("titulo")}
          fullWidth size="small"
          placeholder="¿Qué es el masaje tántrico?"
          multiline minRows={2}
        />

        {/* Icono selector */}
        <Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", mb: 0.8, display: "block" }}>
            Ícono (FontAwesome class)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1 }}>
            {ICONS.map(icon => (
              <Tooltip key={icon} title={icon}>
                <Box
                  onClick={() => setForm(f => ({ ...f, icono: icon }))}
                  sx={{
                    width: 32, height: 32, borderRadius: 1, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: form.icono === icon
                      ? `linear-gradient(135deg,${RM.pink},${RM.deepPink})`
                      : "rgba(255,255,255,0.08)",
                    border: form.icono === icon ? "none" : "1px solid rgba(255,255,255,0.12)",
                    transition: "background .2s",
                    "&:hover": { background: "rgba(204,107,142,0.3)" },
                  }}
                >
                  <i className={icon} style={{ fontSize: 14, color: "#fff" }} />
                </Box>
              </Tooltip>
            ))}
          </Box>
          <DarkField
            label="Clase del ícono"
            value={form.icono}
            onChange={set("icono")}
            fullWidth size="small"
          />
        </Box>

        {/* Orden */}
        <DarkField
          label="Orden"
          type="number"
          value={form.orden}
          onChange={set("orden")}
          size="small"
          inputProps={{ min: 0, max: 99 }}
          sx={{ width: 120 }}
        />

        {/* Contenido HTML */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>Contenido HTML</Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {[
                { tag: "p",  icon: <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>P</Typography>, tip: "Párrafo" },
                { tag: "ul", icon: <FormatListBulletedIcon sx={{ fontSize: 14, color: "#fff" }} />, tip: "Lista" },
                { tag: "b",  icon: <FormatBoldIcon sx={{ fontSize: 14, color: "#fff" }} />, tip: "Negrita" },
                { tag: "em", icon: <Typography sx={{ fontSize: 11, fontStyle: "italic", color: "#fff" }}>I</Typography>, tip: "Cita / Cursiva" },
              ].map(({ tag, icon, tip }) => (
                <Tooltip key={tag} title={tip}>
                  <Box
                    onClick={() => insertHtml(tag)}
                    sx={{
                      width: 24, height: 24, borderRadius: 1, cursor: "pointer",
                      background: "rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      "&:hover": { background: "rgba(204,107,142,0.4)" },
                    }}
                  >
                    {icon}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
          <DarkField
            id="faq-contenido-input"
            value={form.contenido}
            onChange={set("contenido")}
            fullWidth multiline minRows={8} size="small"
            placeholder={"<p>Descripción del tema...</p>\n<ul>\n  <li>✦ Beneficio 1</li>\n</ul>"}
            inputProps={{ style: { fontFamily: "monospace", fontSize: 12 } }}
          />
        </Box>

        {/* Preview rápido */}
        {form.contenido && (
          <Box>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.6 }}>
              Vista previa:
            </Typography>
            <Box sx={{
              background: "rgba(255,255,255,0.06)", borderRadius: 1.5,
              p: 1.5, maxHeight: 160, overflowY: "auto",
              "& p": { color: "#e2e8f0", fontSize: "0.82rem", mb: 0.6, lineHeight: 1.6 },
              "& ul": { color: "#e2e8f0", fontSize: "0.82rem", pl: 2, mb: 0.6 },
              "& li": { mb: 0.3 },
              "& strong": { color: "#fff" },
              "& em": { color: RM.pink, fontStyle: "italic", borderLeft: `2px solid ${RM.pink}`, pl: 1, display: "block" },
            }}
              dangerouslySetInnerHTML={{ __html: form.contenido }}
            />
          </Box>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Guardar */}
        <Button
          fullWidth
          onClick={onSave}
          disabled={saving || !form.titulo.trim()}
          startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveIcon />}
          sx={{
            background: `linear-gradient(135deg,${RM.pink},${RM.deepPink})`,
            color: "#fff", borderRadius: "20px", py: 1.2,
            fontWeight: 700, textTransform: "none", fontSize: "0.95rem",
            "&:hover": { opacity: 0.9 },
            "&:disabled": { opacity: 0.5, color: "#fff" },
          }}
        >
          {saving ? "Guardando..." : isNew ? "Crear sección" : "Guardar cambios"}
        </Button>
      </Box>
    </Box>
  );
}
