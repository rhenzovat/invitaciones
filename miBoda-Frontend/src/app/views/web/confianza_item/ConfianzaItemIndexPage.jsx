import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Button, IconButton, TextField,
  CircularProgress, Dialog, DialogTitle, DialogActions, Stack, Divider, Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import { listar, crear, actualizar, eliminar } from "../../../api/web_confianza_item.api";
import { obtener as obtenerSeccion, actualizar as actualizarSeccion } from "../../../api/web_porque_elejirnos.api";
import { toastSuccess, handleErrorMessages } from "../../../components/notify-messages";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CmsStorageImage from "app/components/cms/CmsStorageImage";
import useCmsPanelLayout from "app/hooks/useCmsPanelLayout";
import { useCmsPanelPush } from "app/contexts/CmsContentPushContext";

/* ═══════════════ CONSTANTES ═══════════════ */
const ACCENT       = "#f97316";
const ACCENT_HOVER = "#ea580c";
const NAVY         = "#0d1b3e";
const NAVY_LIGHT   = "#132040";

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

/* ─── Upload zona del panel ─── */
function PanelImgUpload({ storagePath, previewSrc, onFile, open }) {
  const ref = useRef(null);
  useEffect(() => { if (!open && ref.current) ref.current.value = ""; }, [open]);
  const hasImage = Boolean(previewSrc || storagePath);
  return (
    <Box sx={{ mb: 1.5 }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <Box onClick={() => ref.current?.click()} sx={{
        width: "100%", aspectRatio: "4/3", borderRadius: 2,
        border: "2px dashed rgba(249,115,22,0.45)",
        bgcolor: "rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative", overflow: "hidden",
        "&:hover": { borderColor: ACCENT },
        "&:hover .cam-ov": { opacity: hasImage ? 1 : 0 },
      }}>
        {hasImage ? (
          <>
            <CmsStorageImage storagePath={storagePath} previewSrc={previewSrc} alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <Box className="cam-ov" sx={{
              position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.52)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.22s",
            }}>
              <PhotoCameraIcon sx={{ color: "#fff", fontSize: 26 }} />
              <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.62rem", mt: 0.4 }}>
                Cambiar imagen
              </Typography>
            </Box>
          </>
        ) : (
          <Stack alignItems="center" spacing={0.5}>
            <PhotoCameraIcon sx={{ color: ACCENT, fontSize: 32 }} />
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>Subir imagen</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

/* ─── Upload zona inline (para imagen de fondo, light) ─── */
function LightImgUpload({ storagePath, previewSrc, onFile }) {
  const ref = useRef(null);
  const hasImage = Boolean(previewSrc || storagePath);
  return (
    <Box onClick={() => ref.current?.click()} sx={{
      position: "absolute", inset: 0, cursor: "pointer",
      "&:hover .cam-ov-light": { opacity: 1 },
    }}>
      <input type="file" ref={ref} accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {hasImage ? (
        <>
          <CmsStorageImage storagePath={storagePath} previewSrc={previewSrc} alt=""
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <Box className="cam-ov-light" sx={{
            position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.45)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.22s",
          }}>
            <PhotoCameraIcon sx={{ color: "#fff", fontSize: 32 }} />
            <Typography variant="caption" sx={{ color: "#fff", mt: 0.5 }}>Cambiar imagen</Typography>
          </Box>
        </>
      ) : (
        <Box sx={{
          width: "100%", height: "100%", bgcolor: "rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <PhotoCameraIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 40 }} />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
            Subir imagen lateral
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* ════════════════════════════════════════════════
   PÁGINA PRINCIPAL
════════════════════════════════════════════════ */
const EMPTY_SECCION = { titulo: "", descripcion: "", url_imagen_fondo: "" };

export default function ConfianzaItemIndexPage() {
  const { panelLeft } = useCmsPanelLayout();
  const [panelOpen, setPanelOpen] = useState(false);
  useCmsPanelPush(panelOpen);

  /* Bloque principal */
  const [seccion,        setSeccion]        = useState(null);
  const [seccionSaving,  setSeccionSaving]  = useState(false);
  const [seccionFile,    setSeccionFile]    = useState(null);
  const [seccionPreview, setSeccionPreview] = useState(null);
  const [editingMain,    setEditingMain]    = useState(false);

  /* Ítems */
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [edit,      setEdit]      = useState(null);
  const [isNew,     setIsNew]     = useState(false);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [saving,    setSaving]    = useState(false);

  /* ── Carga ── */
  const loadSeccion = async () => {
    try { setSeccion((await obtenerSeccion()) ?? null); } catch (e) { handleErrorMessages(e); }
  };
  const loadItems = async () => {
    try { setItems((await listar()) ?? []); } catch (e) { handleErrorMessages(e); }
  };
  const load = async () => {
    setLoading(true);
    await Promise.all([loadSeccion(), loadItems()]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const seccionData = seccion ?? EMPTY_SECCION;
  const setSeccionField = (f, v) => setSeccion((p) => ({ ...(p ?? EMPTY_SECCION), [f]: v ?? "" }));

  /* ── Guardar bloque principal ── */
  const saveSeccion = async () => {
    setSeccionSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo",      seccionData.titulo ?? "");
      fd.append("descripcion", seccionData.descripcion ?? "");
      if (seccionFile) fd.append("url_imagen_fondo", seccionFile);
      await actualizarSeccion(fd);
      toastSuccess("Bloque principal guardado");
      setSeccionFile(null);
      setSeccionPreview(null);
      setEditingMain(false);
      await loadSeccion();
    } catch (e) { handleErrorMessages(e); } finally { setSeccionSaving(false); }
  };

  /* ── Panel ítems ── */
  const openPanel = (item, newItem) => {
    setEdit(item);
    setIsNew(newItem);
    setFile(null);
    setPreview(null);
    setPanelOpen(true);
  };
  const closePanel = () => { setPanelOpen(false); setFile(null); setPreview(null); };
  const handleFile = (f) => { setFile(f); setPreview(URL.createObjectURL(f)); };

  const saveItem = async () => {
    if (!edit?.titulo?.trim()) { handleErrorMessages("El título es obligatorio."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo",      edit.titulo);
      fd.append("descripcion", edit.descripcion  || "");
      fd.append("url_enlace",  edit.url_enlace   || "");
      if (file) fd.append("image", file);
      if (!isNew) { fd.append("id", edit.id); await actualizar(fd); }
      else        { await crear(fd); }
      toastSuccess("Ítem guardado");
      closePanel();
      loadItems();
    } catch (e) { handleErrorMessages(e); } finally { setSaving(false); }
  };

  /* ── Preview de imagen de fondo para el bloque ── */
  const fondoPath    = seccionData.url_imagen_fondo;
  const fondoPreview = seccionPreview;

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      {/* ══════ Panel lateral ══════ */}
      <CmsPanelRoot open={panelOpen} panelLeft={panelLeft}>
        {/* Header */}
        <Box sx={{
          px: 2, py: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1,
          borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(0,0,0,0.25)",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3, fontSize: "0.82rem" }}>
              {isNew ? "Nuevo ítem" : "Editar ítem"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
              Lista lateral — sección Confianza
            </Typography>
          </Box>
          <IconButton size="small" onClick={closePanel}
            sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: ACCENT } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          <SectionTag>Miniatura del ítem</SectionTag>
          <PanelImgUpload storagePath={edit?.url_imagen} previewSrc={preview} onFile={handleFile} open={panelOpen} />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />
          <SectionTag>Datos</SectionTag>
          <DarkField fullWidth size="small" label="Título *" sx={{ mb: 1.5 }}
            value={edit?.titulo ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, titulo: e.target.value }))} />
          <DarkField fullWidth size="small" label="Descripción" multiline rows={3} sx={{ mb: 1.5 }}
            value={edit?.descripcion ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, descripcion: e.target.value }))} />
          <DarkField fullWidth size="small" label="Enlace (opcional)"
            value={edit?.url_enlace ?? ""}
            onChange={(e) => setEdit((x) => ({ ...x, url_enlace: e.target.value }))} />
        </Box>

        {/* Footer */}
        <Box sx={{
          px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
          bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0,
        }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
              onClick={saveItem} disabled={saving}
              sx={{ bgcolor: ACCENT, fontWeight: 700, "&:hover": { bgcolor: ACCENT_HOVER } }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button variant="outlined" onClick={closePanel}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
        </Box>
      </CmsPanelRoot>

      {/* ══════ Contenido principal ══════ */}
      <PageBox>
        {/* Header de página */}
        <Paper sx={{ p: 2, mb: 3, background: "linear-gradient(135deg,#0f172a,#0d3b7c)" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PrecisionManufacturingIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
              Confianza — sección Inicio
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
            Bloque oscuro con imagen lateral, título y lista de ítems con miniatura.
          </Typography>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
        ) : (
          <>
            {/* ══════ PREVIEW VISUAL DE LA SECCIÓN WEB ══════ */}
            <Paper sx={{
              borderRadius: 3, overflow: "hidden", mb: 3,
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              border: "1px solid #e2e8f0",
            }}>
              {/* Etiqueta */}
              <Box sx={{ px: 2.5, py: 1, bgcolor: "#1e293b", display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444" }} />
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f59e0b" }} />
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22c55e" }} />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", ml: 1, fontSize: "0.62rem" }}>
                  Preview — /inicio (sección Confianza)
                </Typography>
              </Box>

              {/* Bloque visual */}
              <Box sx={{ display: "flex", minHeight: 460, bgcolor: NAVY }}>

                {/* ── Columna izquierda: imagen de fondo ── */}
                <Box sx={{ width: "46%", position: "relative", flexShrink: 0 }}>
                  <LightImgUpload
                    storagePath={fondoPath}
                    previewSrc={fondoPreview}
                    onFile={(f) => { setSeccionFile(f); setSeccionPreview(URL.createObjectURL(f)); }}
                  />
                  {/* Badge de cámara */}
                  <Box sx={{
                    position: "absolute", bottom: 10, left: 10,
                    bgcolor: "rgba(0,0,0,0.6)", borderRadius: 1.5,
                    px: 1.2, py: 0.4, display: "flex", alignItems: "center", gap: 0.5,
                    pointerEvents: "none",
                  }}>
                    <PhotoCameraIcon sx={{ color: "#fff", fontSize: 13 }} />
                    <Typography sx={{ color: "#fff", fontSize: "0.60rem", fontWeight: 600 }}>
                      Clic para cambiar imagen
                    </Typography>
                  </Box>
                </Box>

                {/* ── Columna derecha: contenido ── */}
                <Box sx={{ flex: 1, bgcolor: NAVY_LIGHT, px: { xs: 3, md: 5 }, py: 4, position: "relative" }}>

                  {/* Botón editar bloque principal */}
                  <Tooltip title="Editar título y descripción" placement="left">
                    <IconButton
                      size="small"
                      onClick={() => setEditingMain((v) => !v)}
                      sx={{
                        position: "absolute", top: 12, right: 12,
                        bgcolor: editingMain ? ACCENT : "rgba(255,255,255,0.1)",
                        color: "#fff", width: 32, height: 32,
                        "&:hover": { bgcolor: ACCENT },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Título de la sección */}
                  {editingMain ? (
                    /* Modo edición del bloque principal */
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth size="small" label="Título"
                        value={seccionData.titulo ?? ""}
                        onChange={(e) => setSeccionField("titulo", e.target.value)}
                        sx={{
                          mb: 1.5,
                          "& .MuiInputBase-root": { bgcolor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: 1.5 },
                          "& .MuiInputBase-input": { color: "#f1f5f9" },
                          "& .MuiInputLabel-root": { color: "#94a3b8" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                        }}
                      />
                      <TextField
                        fullWidth size="small" label="Descripción" multiline rows={2}
                        value={seccionData.descripcion ?? ""}
                        onChange={(e) => setSeccionField("descripcion", e.target.value)}
                        sx={{
                          mb: 1.5,
                          "& .MuiInputBase-root": { bgcolor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: 1.5 },
                          "& .MuiInputBase-input": { color: "#f1f5f9" },
                          "& .MuiInputLabel-root": { color: "#94a3b8" },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
                        }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained"
                          startIcon={seccionSaving ? <CircularProgress size={12} color="inherit" /> : <SaveIcon />}
                          onClick={saveSeccion} disabled={seccionSaving}
                          sx={{ bgcolor: ACCENT, fontWeight: 700, "&:hover": { bgcolor: ACCENT_HOVER }, fontSize: "0.72rem" }}>
                          {seccionSaving ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button size="small" onClick={() => {
                          setEditingMain(false);
                          setSeccionFile(null);
                          setSeccionPreview(null);
                          loadSeccion();
                        }}
                          sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>
                          Cancelar
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    /* Modo visualización */
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{
                        color: "#fff", fontWeight: 900, fontSize: "2rem",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        lineHeight: 1.1, mb: 0.5,
                      }}>
                        {seccionData.titulo || "CONFIANZA"}
                      </Typography>
                      {/* Línea roja decorativa */}
                      <Box sx={{ width: 44, height: 3, bgcolor: "#e63946", borderRadius: 2, mb: 1.5 }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                        {seccionData.descripcion || "Texto de descripción…"}
                      </Typography>
                    </Box>
                  )}

                  {/* ── Lista de ítems ── */}
                  <Stack spacing={1.5}>
                    {items.map((it) => {
                      const isActive = panelOpen && edit?.id === it.id;
                      return (
                        <Box key={it.id} sx={{
                          display: "flex", alignItems: "center", gap: 2,
                          p: 1, borderRadius: 2,
                          bgcolor: isActive ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.06)"}`,
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                          position: "relative",
                        }}>
                          {/* Miniatura */}
                          <Box sx={{
                            width: 72, height: 72, flexShrink: 0,
                            borderRadius: 1.5, overflow: "hidden",
                            bgcolor: "rgba(255,255,255,0.08)",
                          }}>
                            <CmsStorageImage
                              storagePath={it.url_imagen}
                              previewSrc={isActive ? preview : null}
                              alt={it.titulo}
                              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                          </Box>

                          {/* Texto */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{
                              color: "#fff", fontWeight: 700,
                              fontSize: "0.90rem", lineHeight: 1.3,
                              mb: 0.25,
                            }} noWrap>
                              {it.titulo}
                            </Typography>
                            <Typography sx={{
                              color: "rgba(255,255,255,0.55)",
                              fontSize: "0.75rem", lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}>
                              {it.descripcion}
                            </Typography>
                          </Box>

                          {/* Acciones */}
                          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                            <Tooltip title="Editar ítem">
                              <IconButton size="small" onClick={() => openPanel({ ...it }, false)}
                                sx={{ bgcolor: ACCENT, color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: ACCENT_HOVER } }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" onClick={() => setDelTarget(it)}
                                sx={{ bgcolor: "rgba(239,68,68,0.85)", color: "#fff", width: 28, height: 28, "&:hover": { bgcolor: "#dc2626" } }}>
                                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      );
                    })}

                    {/* Botón agregar nuevo ítem */}
                    <Box onClick={() => openPanel({ titulo: "", descripcion: "", url_enlace: "" }, true)}
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                        p: 1.5, borderRadius: 2, cursor: "pointer",
                        border: `2px dashed rgba(249,115,22,0.4)`,
                        color: "rgba(249,115,22,0.8)",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "rgba(249,115,22,0.08)", borderColor: ACCENT, color: ACCENT },
                      }}>
                      <AddIcon sx={{ fontSize: 18 }} />
                      <Typography sx={{ fontSize: "0.80rem", fontWeight: 600 }}>
                        Agregar nuevo ítem
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Paper>

            {/* Nota informativa */}
            <Box sx={{
              px: 2.5, py: 1.5, bgcolor: "#fffbeb", borderRadius: 2,
              border: "1px solid #fde68a", display: "flex", alignItems: "flex-start", gap: 1.5,
            }}>
              <Typography sx={{ fontSize: "1rem" }}>💡</Typography>
              <Box>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400e", mb: 0.25 }}>
                  Cómo editar
                </Typography>
                <Typography sx={{ fontSize: "0.74rem", color: "#78350f", lineHeight: 1.5 }}>
                  <strong>Imagen lateral:</strong> haz clic directo sobre la foto para cambiarla. &nbsp;
                  <strong>Título y descripción:</strong> usa el ícono ✏️ en la esquina superior derecha del panel oscuro. &nbsp;
                  <strong>Ítems:</strong> usa el botón naranja ✏️ de cada ítem.
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </PageBox>

      {/* ── Diálogo eliminar ── */}
      <Dialog open={Boolean(delTarget)} onClose={() => setDelTarget(null)}>
        <DialogTitle>¿Eliminar ítem?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)}>Cancelar</Button>
          <Button color="error" onClick={async () => {
            await eliminar({ id: delTarget.id });
            setDelTarget(null);
            loadItems();
          }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
