import { useEffect, useState } from "react";
import {
  Box, Typography, IconButton, Divider, Stack,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, ListItemIcon, ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon  from "@mui/icons-material/Close";
import SaveIcon   from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CmsPanelRoot from "app/components/cms/CmsPanelRoot";
import CotizacionCmsIconField from "./components/CotizacionCmsIconField";
import { CotizacionIcon } from "./components/CotizacionIcon";
import { listarTipos } from "../../api/cotizacion.api";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": { backgroundColor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: 6 },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,74,153,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#004A99" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
}));

const Tag = styled(Typography)(() => ({
  fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em",
  textTransform: "uppercase", color: "#60a5fa", marginBottom: 5, marginTop: 2,
}));

const Sep = () => <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }} />;

export default function CotizacionModuloCmsPanel({
  open, panelLeft = 0, isNew, datos, tipos: tiposProp = [], onChange, onSave, onClose, onDelete,
}) {
  // Carga los tipos una sola vez al montar el componente
  const [tiposLocales, setTiposLocales] = useState([]);

  useEffect(() => {
    let cancelled = false;
    listarTipos()
      .then((t) => { if (!cancelled) setTiposLocales(t || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []); // solo al montar

  const tipos = tiposLocales.filter((t) => t.Activo !== "N");

  const F = (label, key, multi = false, rows = 2, ph = "", type = "text") => (
    <DarkField key={key} size="small" fullWidth type={type} label={label}
      value={datos?.[key] ?? ""} multiline={multi} rows={multi ? rows : undefined}
      placeholder={ph} onChange={(e) => onChange(key, e.target.value)} sx={{ mb: 1.5 }} />
  );

  return (
    <CmsPanelRoot open={open} panelLeft={panelLeft}>
      {/* Cabecera */}
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(0,0,0,0.25)",
        position: "sticky", top: 0, zIndex: 1, gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#f1f5f9", lineHeight: 1.3 }}>
            {isNew ? "Nuevo Módulo" : "Editar Módulo"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.60rem", display: "block" }}>
            {isNew ? "Completa los campos y guarda" : datos?.nombre || ""}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#60a5fa" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Campos */}
      <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
        <Tag>Identificación</Tag>
        <CotizacionCmsIconField
          Field={DarkField}
          label="Ícono (clase Bootstrap, ej. bi-cart3)"
          fieldKey="icono"
          value={datos?.icono}
          onChange={onChange}
          placeholder="bi-cart3"
        />
        {F("Slug (opcional)", "slug", false, 1, "favicon — se genera del nombre si está vacío")}
        {F("Nombre del módulo", "nombre", false, 1, "Chat en vivo")}
        {F("Descripción", "descripcion", true, 3, "Módulo de chat en tiempo real...")}

        <Sep />
        <Tag>Precio y categoría</Tag>
        {F("Precio (S/.)", "precio", false, 1, "80", "number")}

        {/* ── Categoría: select con tipos de proyecto ── */}
        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
          <InputLabel sx={{ color: "#94a3b8", "&.Mui-focused": { color: "#60a5fa" } }}>
            Categoría (tipo de proyecto)
          </InputLabel>
          <Select
            value={datos?.categoria ?? ""}
            label="Categoría (tipo de proyecto)"
            onChange={(e) => onChange("categoria", e.target.value)}
            displayEmpty
            renderValue={(val) => {
              if (!val) return <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Sin categoría</span>;
              const t = tipos.find((t) => t.titulo === val);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {t?.icon && <CotizacionIcon icon={t.icon} fontSize="0.9rem" color="#60a5fa" />}
                  <span style={{ color: "#f1f5f9", fontSize: "0.85rem" }}>{val}</span>
                </Box>
              );
            }}
            sx={{
              bgcolor: "rgba(255,255,255,0.07)", color: "#f1f5f9", borderRadius: "6px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,74,153,0.6)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#004A99" },
              "& .MuiSvgIcon-root": { color: "#94a3b8" },
            }}
            MenuProps={{
              // z-index mayor que el panel (1600) para que el dropdown no quede detrás
              sx: { zIndex: 1700 },
              PaperProps: {
                sx: {
                  bgcolor: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  maxHeight: 280,
                  "& .MuiMenuItem-root": { color: "#f1f5f9", fontSize: "0.85rem", py: 0.9 },
                  "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,74,153,0.28)" },
                  "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(0,74,153,0.40)" },
                },
              },
            }}
          >
            {/* Opción: sin categoría */}
            <MenuItem value="">
              <ListItemText primaryTypographyProps={{ sx: { color: "#64748b", fontSize: "0.82rem" } }}>
                Sin categoría
              </ListItemText>
            </MenuItem>

            {/* Tipos de proyecto */}
            {tipos.map((t) => (
              <MenuItem key={t.id_tipo ?? t.slug} value={t.titulo}>
                {(t.icon || t.icono) && (
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CotizacionIcon icon={t.icon || t.icono} fontSize="0.95rem" color="#60a5fa" />
                  </ListItemIcon>
                )}
                <ListItemText primaryTypographyProps={{ sx: { fontSize: "0.85rem" } }}>
                  {t.titulo}
                </ListItemText>
              </MenuItem>
            ))}

            {/* Estado vacío */}
            {tipos.length === 0 && (
              <MenuItem disabled>
                <ListItemText primaryTypographyProps={{ sx: { color: "#64748b", fontSize: "0.80rem" } }}>
                  No hay tipos disponibles
                </ListItemText>
              </MenuItem>
            )}
          </Select>
        </FormControl>

      </Box>

      {/* Botones fijos */}
      <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)",
        bgcolor: "rgba(0,0,0,0.25)", position: "sticky", bottom: 0 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}
              sx={{ bgcolor: "#004A99", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#003580" } }}>
              {isNew ? "Crear módulo" : "Guardar cambios"}
            </Button>
            <Button variant="outlined" onClick={onClose}
              sx={{ borderColor: "rgba(255,255,255,0.20)", color: "#94a3b8", minWidth: 44 }}>
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          {!isNew && (
            <Button fullWidth variant="outlined" startIcon={<DeleteIcon />} onClick={onDelete}
              sx={{ borderColor: "rgba(239,68,68,0.5)", color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
              Eliminar módulo
            </Button>
          )}
        </Stack>
      </Box>
    </CmsPanelRoot>
  );
}
