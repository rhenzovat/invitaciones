import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Button, IconButton, TextField,
  CircularProgress, Dialog, DialogTitle, DialogActions,
  Stack, Tooltip, Paper, Divider,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import PinIcon from "@mui/icons-material/Pin";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import { listar, crear, actualizar, eliminar } from "../../../api/web_contadores.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

/* ═══════════════ CONSTANTES ═══════════════ */
const RED    = "#e63946";
const ACCENT = "#f97316";

/* ═══════════════ STYLED ═══════════════ */
const PageBox = styled(Box)(() => ({ padding: 20, minHeight: "100vh", backgroundColor: "#f0f4f8" }));

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root":           { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input":          { color: "#f1f5f9" },
  "& .MuiInputLabel-root":          { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.55)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ACCENT },
  "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
}));

const SectionTag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: ACCENT, marginBottom: 6, marginTop: 2,
}));

/* Pulso sutil en el número */
const pulse = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.75; }
  100% { opacity: 1; }
`;

/* ════════════════════════════════════════════════
   COMPONENTE: Tarjeta contador (preview web)
════════════════════════════════════════════════ */
function CounterCard({ item, isActive, onEdit, onDelete }) {
  return (
    <Box sx={{
      position: "relative",
      border: "1px solid rgba(255,255,255,0.22)",
      borderRadius: 2,
      px: 2, py: 3,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center",
      minHeight: 200,
      bgcolor: isActive ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)",
      outline: isActive ? "2px solid rgba(249,115,22,0.5)" : "none",
      outlineOffset: -2,
      transition: "all 0.2s",
      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
      "&:hover .card-actions": { opacity: 1 },
    }}>
      {/* Ícono flaticon */}
      <Box sx={{ mb: 1.5, fontSize: 48, color: "#fff", lineHeight: 1, minHeight: 52, display: "flex", alignItems: "center" }}>
        {item.icono_clase ? (
          <i className={item.icono_clase} style={{ color: "#fff", fontSize: 48 }} />
        ) : (
          <Box sx={{
            width: 48, height: 48, border: "2px dashed rgba(255,255,255,0.25)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.60rem", fontWeight: 700 }}>
              ICONO
            </Typography>
          </Box>
        )}
      </Box>

      {/* Número */}
      <Typography sx={{
        color: RED, fontWeight: 900,
        fontSize: { xs: "2.4rem", md: "3rem" },
        lineHeight: 1, mb: 0.75,
        fontFamily: "'Nunito', 'Roboto', sans-serif",
        animation: isActive ? `${pulse} 1.5s ease-in-out infinite` : "none",
      }}>
        {item.valor}{item.sufijo || ""}
      </Typography>

      {/* Etiqueta */}
      <Typography sx={{
        color: "rgba(255,255,255,0.85)",
        fontSize: "0.88rem", fontWeight: 500,
        textTransform: "capitalize",
        letterSpacing: "0.03em",
      }}>
        {item.etiqueta}
      </Typography>

      {/* Botones de acción (visible on hover) */}
      <Stack
        className="card-actions"
        direction="row"
        spacing={0.75}
        sx={{
          position: "absolute", bottom: 10, right: 10,
          opacity: 0, transition: "opacity 0.2s",
        }}
      >
        <Tooltip title="Editar" placement="top">
          <IconButton size="small" onClick={onEdit}
            sx={{ bgcolor: ACCENT, color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#ea6c0a" } }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar" placement="top">
          <IconButton size="small" onClick={onDelete}
            sx={{ bgcolor: "rgba(239,68,68,0.85)", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#dc2626" } }}>
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

/* ════════════════════════════════════════════════
   PÁGINA PRINCIPAL
════════════════════════════════════════════════ */
export default function ContadoresIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);

  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [edit,      setEdit]      = useState(null);
  const [isNew,     setIsNew]     = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  /* ── Carga ── */
  const load = async () => {
    setLoading(true);
    try { setItems((await listar()) ?? []); }
    catch (e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  /* ── Panel ── */
  const openEdit = (item) => { setEdit({ ...item }); setIsNew(false); setPanelOpen(true); };
  const openNew  = ()     => { setEdit({ valor: "", sufijo: "+", etiqueta: "", icono_clase: "" }); setIsNew(true); setPanelOpen(true); };
  const closePanel = ()   => { setPanelOpen(false); };

  /* ── Guardar ── */
  const save = async () => {
    setSaving(true);
    try {
      if (isNew) await crear(edit);
      else       await actualizar(edit);
      toastSuccess("Guardado");
      closePanel();
      load();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <>
      {/* ══ Panel lateral ══ */}
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        {/* Header */}
        <Box sx={{
          px: 2, py: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1,
          borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(0,0,0,0.25)",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3, fontSize: "0.82rem" }}>
              {isNew ? "Nuevo contador" : "Editar contador"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
              Banda estadísticas — Inicio
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel}
            sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: ACCENT } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>

          {/* Preview miniatura del contador */}
          <Box sx={{
            mb: 2, p: 2, borderRadius: 2,
            background: "linear-gradient(135deg,#0d1b3e,#162b5a)",
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}>
            <Box sx={{ mb: 1, fontSize: 36, lineHeight: 1 }}>
              {edit?.icono_clase
                ? <i className={edit.icono_clase} style={{ color: "#fff", fontSize: 36 }} />
                : <Box sx={{ width: 36, height: 36, border: "2px dashed rgba(255,255,255,0.2)", borderRadius: "50%", mx: "auto" }} />
              }
            </Box>
            <Typography sx={{ color: RED, fontWeight: 900, fontSize: "2rem", lineHeight: 1 }}>
              {edit?.valor || "0"}{edit?.sufijo || ""}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.80rem", mt: 0.5 }}>
              {edit?.etiqueta || "Etiqueta"}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

          <SectionTag>Datos del contador</SectionTag>
          <DarkField fullWidth size="small" label="Valor (número)" sx={{ mb: 1.5 }}
            value={edit?.valor ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, valor: e.target.value }))} />

          <DarkField fullWidth size="small" label='Sufijo (ej. "+", "K")' sx={{ mb: 1.5 }}
            value={edit?.sufijo ?? "+"}
            onChange={(e) => setEdit((x) => ({ ...x, sufijo: e.target.value }))} />

          <DarkField fullWidth size="small" label="Etiqueta" sx={{ mb: 1.5 }}
            value={edit?.etiqueta ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, etiqueta: e.target.value }))} />

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />
          <SectionTag>Ícono Flaticon</SectionTag>
          <DarkField fullWidth size="small" label='Clase CSS (ej. flaticon-professor)' sx={{ mb: 1 }}
            value={edit?.icono_clase ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, icono_clase: e.target.value }))} />
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.66rem", display: "block", mb: 1.5, lineHeight: 1.5 }}>
            Escribe la clase del ícono y verás el preview en tiempo real arriba.
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{
          px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
        }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
              onClick={save} disabled={saving}
              sx={{ bgcolor: ACCENT, fontWeight: 700, "&:hover": { bgcolor: "#ea6c0a" } }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button variant="outlined" onClick={closePanel}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
        </Box>
      </CmsPanelRoot>

      {/* ══ Contenido principal ══ */}
      <PageBox>
        {/* Header de página */}
        <Paper sx={{ p: 2, mb: 3, background: "linear-gradient(135deg,#065f46,#10b981)" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PinIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
              Contadores — Banda estadísticas
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.78)" }}>
            Vista pública: banda horizontal con fondo oscuro en /inicio
          </Typography>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
        ) : (
          <>
            {/* ══ PREVIEW VISUAL ══ */}
            <Paper sx={{
              borderRadius: 3, overflow: "hidden", mb: 3,
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              border: "1px solid #e2e8f0",
            }}>
              {/* Barra de browser */}
              <Box sx={{
                px: 2.5, py: 1, bgcolor: "#1e293b",
                display: "flex", alignItems: "center", gap: 1,
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444" }} />
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f59e0b" }} />
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22c55e" }} />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", ml: 1, fontSize: "0.62rem" }}>
                  Preview — /inicio (banda de estadísticas)
                </Typography>
              </Box>

              {/* Banda oscura */}
              <Box sx={{
                background: "linear-gradient(135deg, #0d1b3e 0%, #0f2653 40%, #162b5a 100%)",
                position: "relative",
                px: { xs: 2, md: 4 },
                py: 4,
                /* Patrón de puntos sutil */
                "&::before": {
                  content: '""',
                  position: "absolute", inset: 0,
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                  pointerEvents: "none",
                },
              }}>
                <Grid container spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
                  {items.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id_contador}>
                      <CounterCard
                        item={item}
                        isActive={panelOpen && edit?.id_contador === item.id_contador}
                        onEdit={() => openEdit(item)}
                        onDelete={() => setDelTarget(item)}
                      />
                    </Grid>
                  ))}

                  {/* Tarjeta agregar */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      onClick={openNew}
                      sx={{
                        border: "2px dashed rgba(249,115,22,0.45)",
                        borderRadius: 2,
                        minHeight: 200,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 1,
                        cursor: "pointer", transition: "all 0.2s",
                        "&:hover": {
                          borderColor: ACCENT,
                          bgcolor: "rgba(249,115,22,0.06)",
                        },
                      }}
                    >
                      <Box sx={{
                        width: 44, height: 44, borderRadius: "50%",
                        bgcolor: "rgba(249,115,22,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <AddIcon sx={{ color: ACCENT, fontSize: 24 }} />
                      </Box>
                      <Typography sx={{ color: "rgba(249,115,22,0.85)", fontWeight: 600, fontSize: "0.82rem" }}>
                        Agregar contador
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Nota */}
            <Box sx={{
              px: 2.5, py: 1.5, bgcolor: "#fffbeb", borderRadius: 2,
              border: "1px solid #fde68a", display: "flex", alignItems: "flex-start", gap: 1.5,
            }}>
              <Typography sx={{ fontSize: "1rem" }}>💡</Typography>
              <Typography sx={{ fontSize: "0.74rem", color: "#78350f", lineHeight: 1.6 }}>
                <strong>Hover</strong> sobre cada tarjeta para ver los botones de editar y eliminar. &nbsp;
                El <strong>panel lateral</strong> muestra un preview en tiempo real del número e ícono mientras editas.
              </Typography>
            </Box>
          </>
        )}
      </PageBox>

      {/* Diálogo eliminar */}
      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}>
        <DialogTitle>¿Eliminar contador?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={async () => {
            await eliminar({ id_contador: delTarget.id_contador });
            setDelTarget(null);
            load();
          }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
