import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  Box, Typography, Paper, Stack, Button, TextField,
  Switch, FormControlLabel, Chip, Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ShieldIcon from "@mui/icons-material/Shield";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { listarEstadoSimple } from "../../utils/utils";

/* ═══════════ STYLED ═══════════ */
const PageWrap = styled(Box)(() => ({
  padding: "24px 28px",
  minHeight: "100vh",
  backgroundColor: "#f1f5f9",
}));

/* ═══════════ MAIN ═══════════ */
const RolesEditPage = (props) => {
  const { accessButton, dataRowEditNew } = props;
  const intl = useIntl();
  const isNew = dataRowEditNew?.esNuevoRegistro;

  const [nombre,  setNombre]  = useState(dataRowEditNew?.nombre  ?? "");
  const [activo,  setActivo]  = useState((dataRowEditNew?.Activo ?? "S") === "S");
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    setNombre(dataRowEditNew?.nombre  ?? "");
    setActivo((dataRowEditNew?.Activo ?? "S") === "S");
    setErrors({});
  }, [dataRowEditNew?.id_roles]);

  const validate = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = "El nombre es obligatorio.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...dataRowEditNew,
      nombre: nombre.trim(),
      Activo: activo ? "S" : "N",
    };
    if (isNew) props.agregarRegistro(payload);
    else       props.actualizarUsuario(payload);
  };

  return (
    <PageWrap>
      {/* ── Header ── */}
      <Paper sx={{
        p: 2.5, mb: 3, borderRadius: 3,
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
        boxShadow: "0 4px 20px rgba(29,78,216,0.25)",
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
                {isNew ? "Nuevo Rol" : "Editar Rol"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
                {isNew ? "Define un nuevo perfil de acceso" : `Modificando: ${dataRowEditNew?.nombre ?? ""}`}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            {accessButton.crear && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
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

      {/* ── Form card ── */}
      <Paper sx={{
        borderRadius: 3, p: 0, overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        maxWidth: 680,
      }}>
        {/* Card header */}
        <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Datos del Rol
          </Typography>
        </Box>

        {/* Form body */}
        <Box sx={{ px: 3, py: 3 }}>
          <Stack spacing={3}>
            {/* Nombre */}
            <Box>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nombre del Rol *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Ej: Administrador, Editor, Visor…"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setErrors((x) => ({ ...x, nombre: "" })); }}
                error={Boolean(errors.nombre)}
                helperText={errors.nombre}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: "0.92rem",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1d4ed8" },
                  },
                }}
              />
            </Box>

            <Divider />

            {/* Estado */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              p: 2, bgcolor: activo ? "#f0fdf4" : "#fef2f2",
              borderRadius: 2,
              border: `1px solid ${activo ? "#bbf7d0" : "#fecaca"}`,
              transition: "all 0.2s",
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <FiberManualRecordIcon sx={{ fontSize: 12, color: activo ? "#22c55e" : "#ef4444" }} />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: activo ? "#15803d" : "#dc2626" }}>
                    {activo ? "Rol activo" : "Rol inactivo"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {activo ? "Los usuarios con este rol pueden acceder al sistema." : "Los usuarios con este rol no tendrán acceso."}
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
          {accessButton.crear && (
            <Button variant="contained" size="small" onClick={handleSave}
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 2, bgcolor: "#1d4ed8", fontWeight: 700, "&:hover": { bgcolor: "#1e40af" } }}>
              {isNew ? "Crear rol" : "Guardar cambios"}
            </Button>
          )}
        </Box>
      </Paper>
    </PageWrap>
  );
};

export default RolesEditPage;
