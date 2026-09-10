import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Stack, Button, TextField,
  Switch, Chip, Divider, InputAdornment, Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import KeyIcon from "@mui/icons-material/Key";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import LockIcon from "@mui/icons-material/Lock";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { metadatosPublicUrl } from "../../utils/metadatosPublicUrls";

const DESC_MAX = 2000;

/* ─── Character-count helper ─── */
function CharCount({ value, max }) {
  const n   = value?.length ?? 0;
  const pct = n / max;
  const color = pct >= 1 ? "#dc2626" : pct >= 0.85 ? "#f59e0b" : "#94a3b8";
  return (
    <Typography sx={{ fontSize: "0.68rem", color, fontWeight: 600 }}>
      {n} / {max}
    </Typography>
  );
}

/* ─── Field label ─── */
function FieldLabel({ children, required }) {
  return (
    <Typography sx={{
      fontSize: "0.72rem", fontWeight: 700, color: "#374151",
      textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.75,
    }}>
      {children}{required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
    </Typography>
  );
}

/* ══════════════════════════════════════════════════════════════ */
const MetadatosPaginaEditPage = ({ accessButton, dataRowEditNew, ...props }) => {
  const esNuevo = Boolean(dataRowEditNew?.esNuevoRegistro);

  const [slug,        setSlug]        = useState(dataRowEditNew?.nombre_pagina     ?? "");
  const [titulo,      setTitulo]      = useState(dataRowEditNew?.titulo_pagina     ?? "");
  const [descripcion, setDescripcion] = useState(dataRowEditNew?.descripcion_pagina ?? "");
  const [activo,      setActivo]      = useState((dataRowEditNew?.activo ?? "S") === "S");
  const [errors,      setErrors]      = useState({});

  useEffect(() => {
    setSlug(dataRowEditNew?.nombre_pagina       ?? "");
    setTitulo(dataRowEditNew?.titulo_pagina     ?? "");
    setDescripcion(dataRowEditNew?.descripcion_pagina ?? "");
    setActivo((dataRowEditNew?.activo ?? "S") === "S");
    setErrors({});
  }, [dataRowEditNew?.id, dataRowEditNew?.esNuevoRegistro]);

  const validate = () => {
    const e = {};
    if (esNuevo && !slug.trim())
      e.slug = "La clave es obligatoria.";
    if (esNuevo && slug.trim() && !/^[a-z0-9_]+$/i.test(slug.trim()))
      e.slug = "Solo letras, números y guión bajo (ej: web_mi_seccion).";
    if (!titulo.trim())
      e.titulo = "El título es obligatorio.";
    if (!descripcion.trim())
      e.descripcion = "La descripción es obligatoria.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...dataRowEditNew,
      nombre_pagina:      slug.trim().toLowerCase(),
      titulo_pagina:      titulo.trim(),
      descripcion_pagina: descripcion.trim(),
      activo:             activo ? "S" : "N",
    };
    if (esNuevo) props.crearMetadatos(payload);
    else         props.actualizarMetadatos(payload);
  };

  const puedeGrabar = (esNuevo && accessButton?.crear) || (!esNuevo && accessButton?.editar);
  const publicUrl = metadatosPublicUrl(esNuevo ? slug.trim().toLowerCase() : dataRowEditNew?.nombre_pagina);

  return (
    <Box sx={{ px: 3.5, py: 3, minHeight: "100vh", bgcolor: "#f1f5f9" }}>

      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: 3,
        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #0f766e 100%)",
        boxShadow: "0 4px 20px rgba(15,118,110,0.28)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TravelExploreIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                  {esNuevo ? "Nueva página (metadatos)" : "Editar metadatos"}
                </Typography>
                {!esNuevo && dataRowEditNew?.nombre_pagina && (
                  <Chip
                    label={dataRowEditNew.nombre_pagina}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.18)",
                      color: "#fff", fontWeight: 700,
                      fontSize: "0.7rem",
                      border: "1px solid rgba(255,255,255,0.3)",
                      fontFamily: "monospace",
                    }}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                {esNuevo
                  ? "Configura el título y descripción SEO para la nueva página"
                  : "Modifica el título y descripción SEO de esta página"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            {puedeGrabar && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  bgcolor: "rgba(255,255,255,0.18)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                }}
              >
                Guardar
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={props.cancelarEdicion}
              sx={{
                color: "rgba(255,255,255,0.7)",
                borderColor: "rgba(255,255,255,0.25)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.5)" },
              }}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Main card ── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ─ Form ─ */}
        <Paper sx={{
          flex: "1 1 460px", borderRadius: 3, overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        }}>
          {/* Card header */}
          <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.80rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Datos de la página
            </Typography>
          </Box>

          {/* Form body */}
          <Box sx={{ px: 3, py: 3 }}>
            <Stack spacing={3}>

              {/* Slug / Clave */}
              <Box>
                <FieldLabel required={esNuevo}>Clave / Slug</FieldLabel>
                {esNuevo ? (
                  <TextField
                    fullWidth size="small"
                    placeholder="ej: web_contacto, web_nosotros"
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setErrors((x) => ({ ...x, slug: "" })); }}
                    error={Boolean(errors.slug)}
                    helperText={errors.slug || "Solo letras, números y guión bajo. No se puede cambiar después."}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2, fontSize: "0.88rem", fontFamily: "monospace",
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0f766e" },
                      },
                    }}
                  />
                ) : (
                  <Tooltip title="La clave no se puede modificar después de crear la página" placement="top-start">
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: 1,
                      px: 1.5, py: 1,
                      bgcolor: "#f1f5f9", borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}>
                      <LockIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Typography sx={{ fontSize: "0.88rem", fontFamily: "monospace", color: "#475569", fontWeight: 700 }}>
                        {dataRowEditNew?.nombre_pagina || "—"}
                      </Typography>
                      <Chip label="Solo lectura" size="small" sx={{ fontSize: "0.62rem", height: 18, color: "#94a3b8" }} />
                    </Box>
                  </Tooltip>
                )}
                {publicUrl && (
                  <Typography sx={{ fontSize: "0.72rem", color: "#0f766e", fontWeight: 600, mt: 0.75, fontFamily: "monospace" }}>
                    URL pública: {publicUrl}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Título SEO */}
              <Box>
                <FieldLabel required>Título SEO</FieldLabel>
                <TextField
                  fullWidth size="small"
                  placeholder="Ej: Inicio | Mi Empresa — Servicios de impresión"
                  value={titulo}
                  onChange={(e) => { setTitulo(e.target.value); setErrors((x) => ({ ...x, titulo: "" })); }}
                  error={Boolean(errors.titulo)}
                  helperText={errors.titulo || "Aparece en la pestaña del navegador y en los resultados de Google."}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2, fontSize: "0.92rem",
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0f766e" },
                    },
                  }}
                />
              </Box>

              {/* Descripción SEO */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <FieldLabel required>Descripción SEO</FieldLabel>
                  <CharCount value={descripcion} max={DESC_MAX} />
                </Stack>
                <TextField
                  fullWidth multiline rows={4}
                  placeholder="Describe brevemente de qué trata esta página (aparece bajo el título en Google)…"
                  value={descripcion}
                  onChange={(e) => {
                    if (e.target.value.length <= DESC_MAX)
                      setDescripcion(e.target.value);
                    setErrors((x) => ({ ...x, descripcion: "" }));
                  }}
                  error={Boolean(errors.descripcion)}
                  helperText={errors.descripcion || "Recomendado: entre 120 y 160 caracteres para mejor visibilidad en buscadores."}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.2 }}>
                        <DescriptionIcon sx={{ fontSize: 16, color: "#0f766e" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2, fontSize: "0.88rem", lineHeight: 1.6,
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0f766e" },
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Estado */}
              <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                p: 2, borderRadius: 2,
                bgcolor: activo ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${activo ? "#bbf7d0" : "#fecaca"}`,
                transition: "all 0.2s",
              }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <FiberManualRecordIcon sx={{ fontSize: 12, color: activo ? "#22c55e" : "#ef4444" }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: activo ? "#15803d" : "#dc2626" }}>
                      {activo ? "Página activa" : "Página inactiva"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {activo ? "Los metadatos están en uso en el sitio web." : "No se aplicarán en el sitio web."}
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#22c55e" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#22c55e" },
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* Card footer */}
          <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" size="small" onClick={props.cancelarEdicion}
              startIcon={<CloseIcon />}
              sx={{ borderRadius: 2, color: "#64748b", borderColor: "#e2e8f0" }}>
              Cancelar
            </Button>
            {puedeGrabar && (
              <Button variant="contained" size="small" onClick={handleSave}
                startIcon={<SaveIcon />}
                sx={{ borderRadius: 2, bgcolor: "#0f766e", fontWeight: 700, "&:hover": { bgcolor: "#0d6b63" } }}>
                {esNuevo ? "Crear página" : "Guardar cambios"}
              </Button>
            )}
          </Box>
        </Paper>

        {/* ─ Side info card ─ */}
        <Paper sx={{
          flex: "0 0 300px", borderRadius: 3, overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        }}>
          {/* Google preview */}
          <Box sx={{ px: 2.5, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Vista previa en Google
            </Typography>
          </Box>
          <Box sx={{ p: 2.5 }}>
            {/* Browser-like preview */}
            <Box sx={{
              borderRadius: 2, border: "1px solid #e2e8f0",
              overflow: "hidden", bgcolor: "#fff",
            }}>
              {/* Chrome bar */}
              <Box sx={{ bgcolor: "#f1f3f4", px: 1.5, py: 0.75, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 0.75 }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <Box key={c} sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: c }} />
                ))}
                <Box sx={{ flex: 1, ml: 1, bgcolor: "#fff", borderRadius: 1, px: 1, py: 0.3, border: "1px solid #e2e8f0" }}>
                  <Typography sx={{ fontSize: "0.62rem", color: "#5f6368" }}>
                    misitioweb.com/{slug || "pagina"}
                  </Typography>
                </Box>
              </Box>
              {/* Result */}
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#1a0dab", fontWeight: 500, lineHeight: 1.3, mb: 0.4 }}>
                  {titulo || <span style={{ color: "#94a3b8" }}>Título de la página…</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#006621", mb: 0.4 }}>
                  misitioweb.com › {slug || "pagina"}
                </Typography>
                <Typography sx={{
                  fontSize: "0.68rem", color: "#545454", lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {descripcion || <span style={{ color: "#94a3b8" }}>Descripción del contenido de la página…</span>}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Tip cards */}
              {[
                { label: "Slug", value: slug || "—", note: "Identificador único. No modificable.", icon: "🔑" },
                { label: "Título", value: titulo ? `${titulo.length} car.` : "—", note: "Óptimo: 50–60 caracteres.", icon: "📋" },
                { label: "Descripción", value: descripcion ? `${descripcion.length} car.` : "—", note: "Óptimo: 120–160 caracteres.", icon: "📝" },
              ].map(({ label, value, note, icon }) => (
                <Box key={label} sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.25,
                  p: 1.25, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0",
                }}>
                  <Typography sx={{ fontSize: "0.85rem", flexShrink: 0 }}>{icon}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography sx={{ fontSize: "0.70rem", fontWeight: 700, color: "#374151" }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#0f766e", fontWeight: 700 }}>{value}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", mt: 0.2 }}>{note}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* SEO tip */}
            <Box sx={{
              mt: 2, display: "flex", gap: 1, p: 1.5,
              bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe",
            }}>
              <InfoOutlinedIcon sx={{ fontSize: 15, color: "#2563eb", flexShrink: 0, mt: 0.1 }} />
              <Typography sx={{ fontSize: "0.68rem", color: "#1e40af", lineHeight: 1.55 }}>
                Un buen título y descripción mejoran el posicionamiento en Google y la tasa de clics (CTR).
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MetadatosPaginaEditPage;
