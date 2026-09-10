import React from "react";
import {
  Box, Typography, IconButton, Stack, TextField, MenuItem, Button,
  FormControl, InputLabel, Select,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { CMS_SELECT_MENU_PROPS } from "app/components/cms/cmsSelectMenuProps";

const DarkField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.07)",
    color: "#f1f5f9",
    borderRadius: 6,
  },
  "& .MuiInputBase-input": { color: "#f1f5f9" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f97316" },
}));

const selectSx = {
  bgcolor: "rgba(255,255,255,0.07)",
  color: "#f1f5f9",
  borderRadius: "6px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.6)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f97316" },
  "& .MuiSvgIcon-root": { color: "#94a3b8" },
};

const labelSx = { color: "#94a3b8", "&.Mui-focused": { color: "#f97316" } };

const TIPOS_RED = [
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
];

const emptyRed = (orden = 1) => ({
  tipo: "whatsapp",
  url: "",
  etiqueta: "",
  orden,
});

const URL_PLACEHOLDERS = {
  whatsapp: "https://wa.me/51999999999",
  tiktok: "https://www.tiktok.com/@usuario",
  facebook: "https://www.facebook.com/tu-pagina",
  instagram: "https://www.instagram.com/tu-cuenta",
  youtube: "https://www.youtube.com/@canal",
  linkedin: "https://www.linkedin.com/company/...",
  twitter: "https://x.com/tu-cuenta",
};

const looksLikeUrl = (value) => /^https?:\/\//i.test((value || "").trim());

const FooterRedesEditor = ({ redes = [], onChange, variant = "dark" }) => {
  const list = Array.isArray(redes) ? redes : [];
  const isLight = variant === "light";

  const fieldSx = isLight ? {
    "& .MuiInputBase-root": { fontSize: "0.78rem", bgcolor: "#f8fafc" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
  } : undefined;

  const selectSxLight = {
    bgcolor: "#f8fafc",
    fontSize: "0.78rem",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc6b8e" },
  };

  const labelSxLight = { color: "#64748b", "&.Mui-focused": { color: "#cc6b8e" } };

  const TextFieldComp = isLight ? TextField : DarkField;

  const updateList = (next) => onChange(next.map((r, i) => ({ ...r, orden: i + 1 })));

  const setItem = (index, field, value) => {
    const next = [...list];
    next[index] = { ...next[index], [field]: value };
    updateList(next);
  };

  const addRed = () => updateList([...list, emptyRed(list.length + 1)]);

  const removeRed = (index) => updateList(list.filter((_, i) => i !== index));

  const move = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    updateList(next);
  };

  return (
    <Box>
      {list.length === 0 && (
        <Typography variant="caption" sx={{ color: isLight ? "#94a3b8" : "#64748b", display: "block", mb: 1 }}>
          Sin redes configuradas. Agrega Facebook, WhatsApp, TikTok, etc.
        </Typography>
      )}
      {list.map((red, index) => (
        <Box
          key={`red-${index}`}
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: 1,
            border: isLight ? "1px solid #e8d5c0" : "1px solid rgba(255,255,255,0.10)",
            bgcolor: isLight ? "#f8fafc" : "rgba(0,0,0,0.20)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: isLight ? "#cc6b8e" : "#f97316", fontWeight: 700 }}>
              Red #{index + 1}
            </Typography>
            <Stack direction="row" spacing={0.25}>
              <IconButton size="small" onClick={() => move(index, -1)} disabled={index === 0}
                sx={{ color: "#94a3b8" }}>
                <ArrowUpwardIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" onClick={() => move(index, 1)} disabled={index === list.length - 1}
                sx={{ color: "#94a3b8" }}>
                <ArrowDownwardIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" onClick={() => removeRed(index)} sx={{ color: "#f87171" }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Stack>

          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel sx={isLight ? labelSxLight : labelSx}>Tipo</InputLabel>
            <Select
              label="Tipo"
              value={red.tipo || "whatsapp"}
              onChange={(e) => setItem(index, "tipo", e.target.value)}
              MenuProps={CMS_SELECT_MENU_PROPS}
              sx={isLight ? selectSxLight : selectSx}
            >
              {TIPOS_RED.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextFieldComp
            size="small"
            fullWidth
            label="URL"
            value={red.url || ""}
            placeholder={URL_PLACEHOLDERS[red.tipo] || "https://..."}
            onChange={(e) => setItem(index, "url", e.target.value)}
            sx={{ mb: 0.5, ...fieldSx }}
          />
          {!((red.url || "").trim()) && red.tipo !== "whatsapp" && (
            <Typography variant="caption" sx={{ color: "#f59e0b", display: "block", mb: 1, fontSize: "0.65rem" }}>
              Ingresa la URL aquí (no en Etiqueta) para que el icono redirija en la web pública.
            </Typography>
          )}
          <TextFieldComp
            size="small"
            fullWidth
            label="Etiqueta (opcional)"
            value={red.etiqueta || ""}
            placeholder="Nombre visible al pasar el cursor (ej. TikTok)"
            onChange={(e) => {
              const value = e.target.value;
              if (!(red.url || "").trim() && looksLikeUrl(value)) {
                const next = [...list];
                next[index] = { ...next[index], url: value.trim(), etiqueta: "" };
                updateList(next);
                return;
              }
              setItem(index, "etiqueta", value);
            }}
            sx={fieldSx}
          />
          {!(red.url || "").trim() && looksLikeUrl(red.etiqueta) && (
            <Typography variant="caption" sx={{ color: "#f59e0b", display: "block", mt: 0.5, fontSize: "0.65rem" }}>
              Detectamos un enlace en Etiqueta; se usará como URL al guardar.
            </Typography>
          )}
        </Box>
      ))}
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addRed}
        sx={{
          color: isLight ? "#cc6b8e" : "#f97316",
          borderColor: isLight ? "rgba(204,107,142,0.5)" : "rgba(249,115,22,0.5)",
          mt: 0.5,
        }}
        variant="outlined"
      >
        Agregar red social
      </Button>
    </Box>
  );
};

export default FooterRedesEditor;
