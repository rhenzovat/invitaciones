import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  Typography, FormControlLabel, Checkbox, Box, Stack, Chip,
  CircularProgress, Divider,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldIcon from "@mui/icons-material/Shield";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const CopiarPermisosRolDialog = ({
  open,
  onClose,
  rolOrigen,
  rolesLista = [],
  guardarAntes = false,
  onConfirm,
  loading = false,
}) => {
  const [rolDestinoId,          setRolDestinoId]          = useState("");
  const [incluirSidebar,        setIncluirSidebar]        = useState(false);
  const [guardarCambiosActuales, setGuardarCambiosActuales] = useState(guardarAntes);

  const rolesDestino = useMemo(
    () => (rolesLista || []).filter((r) => Number(r.id_roles) !== Number(rolOrigen?.id_roles)),
    [rolesLista, rolOrigen?.id_roles]
  );

  useEffect(() => {
    if (!open) return;
    setRolDestinoId("");
    setIncluirSidebar(false);
    setGuardarCambiosActuales(guardarAntes);
  }, [open, guardarAntes, rolOrigen?.id_roles]);

  const handleConfirm = () => {
    if (!rolDestinoId || !rolOrigen?.id_roles) return;
    onConfirm?.({
      id_roles_origen:        Number(rolOrigen.id_roles),
      id_roles_destino:       Number(rolDestinoId),
      incluir_sidebar_orden:  incluirSidebar,
      guardar_cambios_actuales: guardarCambiosActuales,
    });
  };

  const destinoNombre = rolesDestino.find((r) => Number(r.id_roles) === Number(rolDestinoId))?.nombre;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 3, py: 2.5,
        background: "linear-gradient(135deg, #0f172a 0%, #4c1d95 60%, #7c3aed 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ContentCopyIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>
              Replicar permisos
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>
              Copia los accesos de un rol a otro
            </Typography>
          </Box>
        </Stack>
        <Button
          size="small" onClick={onClose} disabled={loading}
          sx={{ color: "rgba(255,255,255,0.6)", minWidth: 0, p: 0.75, borderRadius: 1.5,
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" } }}>
          <CloseIcon fontSize="small" />
        </Button>
      </Box>

      <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
        {/* Info banner */}
        <Box sx={{
          display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.75,
          bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe", mb: 3,
        }}>
          <InfoOutlinedIcon sx={{ color: "#2563eb", fontSize: 18, flexShrink: 0, mt: 0.1 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "#1e40af", lineHeight: 1.55 }}>
            Los menús, objetos y módulos del <strong>rol origen</strong> serán copiados al <strong>rol destino</strong>.
            Los permisos actuales del destino quedarán reemplazados.
          </Typography>
        </Box>

        {/* Origen → Destino visual */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          {/* Origen */}
          <Box sx={{
            flex: 1, p: 2, borderRadius: 2.5,
            bgcolor: "#f0fdf4", border: "1.5px solid #86efac",
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <ShieldIcon sx={{ fontSize: 16, color: "#16a34a" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Rol origen
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#14532d" }}>
              {rolOrigen?.nombre ?? "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.70rem", color: "#6EE7B7", mt: 0.25 }}>
              #{rolOrigen?.id_roles}
            </Typography>
          </Box>

          {/* Flecha */}
          <Box sx={{
            width: 36, height: 36, borderRadius: "50%",
            bgcolor: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
          }}>
            <ArrowForwardIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>

          {/* Destino */}
          <Box sx={{
            flex: 1, p: 2, borderRadius: 2.5,
            bgcolor: rolDestinoId ? "#ede9fe" : "#f8fafc",
            border: `1.5px solid ${rolDestinoId ? "#c4b5fd" : "#e2e8f0"}`,
            transition: "all 0.2s",
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <ShieldIcon sx={{ fontSize: 16, color: rolDestinoId ? "#7c3aed" : "#94a3b8" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: rolDestinoId ? "#7c3aed" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Rol destino
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: rolDestinoId ? "#4c1d95" : "#94a3b8" }}>
              {destinoNombre ?? "Sin seleccionar"}
            </Typography>
            {rolDestinoId && (
              <Typography sx={{ fontSize: "0.70rem", color: "#a78bfa", mt: 0.25 }}>
                #{rolDestinoId}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Selector de destino */}
        <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
          <InputLabel>Seleccionar rol destino</InputLabel>
          <Select
            label="Seleccionar rol destino"
            value={rolDestinoId}
            onChange={(e) => setRolDestinoId(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {rolesDestino.map((r) => (
              <MenuItem key={r.id_roles} value={r.id_roles}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShieldIcon sx={{ fontSize: 16, color: "#7c3aed" }} />
                  <span>{r.nombre}</span>
                  <Chip label={`#${r.id_roles}`} size="small" sx={{ fontSize: "0.65rem", height: 18 }} />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ mb: 2 }} />

        {/* Opciones */}
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.25 }}>
          Opciones adicionales
        </Typography>

        {guardarAntes && (
          <FormControlLabel
            control={
              <Checkbox
                checked={guardarCambiosActuales}
                onChange={(e) => setGuardarCambiosActuales(e.target.checked)}
                sx={{ "& .MuiSvgIcon-root": { fontSize: 18 }, color: "#7c3aed", "&.Mui-checked": { color: "#7c3aed" } }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.82rem", color: "#374151" }}>
                Guardar la selección actual del árbol antes de copiar
              </Typography>
            }
            sx={{ display: "flex", mb: 0.5 }}
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={incluirSidebar}
              onChange={(e) => setIncluirSidebar(e.target.checked)}
              sx={{ "& .MuiSvgIcon-root": { fontSize: 18 }, color: "#7c3aed", "&.Mui-checked": { color: "#7c3aed" } }}
            />
          }
          label={
            <Typography sx={{ fontSize: "0.82rem", color: "#374151" }}>
              Incluir también orden y etiquetas del sidebar
            </Typography>
          }
          sx={{ display: "flex" }}
        />
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: "#64748b", borderRadius: 2, "&:hover": { bgcolor: "#f1f5f9" } }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || !rolDestinoId}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <ContentCopyIcon />}
          sx={{
            bgcolor: "#7c3aed", fontWeight: 700, borderRadius: 2,
            boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
            "&:hover": { bgcolor: "#6d28d9" },
            "&.Mui-disabled": { bgcolor: "#c4b5fd", color: "#fff" },
          }}
        >
          {loading ? "Copiando…" : "Copiar permisos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopiarPermisosRolDialog;
