import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Stack,
  InputAdornment,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import { configuracion, actualizarConfiguracion } from "../../../api/web_slider.api";
import { handleErrorMessages, handleSuccessMessages } from "../../../components/notify-messages";

const SliderAutoplaySettings = () => {
  const [cfg, setCfg] = useState({ autoplay: "S", interval_ms: 5000, pause_on_hover: "S" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    configuracion()
      .then((row) => {
        if (row) {
          setCfg({
            autoplay: row.autoplay ?? "S",
            interval_ms: row.interval_ms ?? 5000,
            pause_on_hover: row.pause_on_hover ?? "S",
          });
        }
      })
      .catch(() => handleErrorMessages("No se pudo cargar la configuración del slider."));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await actualizarConfiguracion(cfg);
      if (result) {
        setCfg({
          autoplay: result.autoplay ?? cfg.autoplay,
          interval_ms: result.interval_ms ?? cfg.interval_ms,
          pause_on_hover: result.pause_on_hover ?? cfg.pause_on_hover,
        });
      }
      handleSuccessMessages("Configuración del slider guardada.");
    } catch {
      handleErrorMessages("Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const seconds = Math.round((cfg.interval_ms || 5000) / 1000);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        background: "#fff",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <PlayCircleOutlineIcon sx={{ color: "#2a5298" }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Autoplay del slider (inicio)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Controla si el carrusel del home avanza solo y cada cuántos segundos
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        flexWrap="wrap"
      >
        <FormControlLabel
          control={
            <Switch
              checked={cfg.autoplay === "S"}
              onChange={(e) =>
                setCfg((c) => ({ ...c, autoplay: e.target.checked ? "S" : "N" }))
              }
              color="primary"
            />
          }
          label="Reproducción automática"
        />
        <FormControlLabel
          control={
            <Switch
              checked={cfg.pause_on_hover === "S"}
              onChange={(e) =>
                setCfg((c) => ({
                  ...c,
                  pause_on_hover: e.target.checked ? "S" : "N",
                }))
              }
              color="primary"
              disabled={cfg.autoplay !== "S"}
            />
          }
          label="Pausar al pasar el mouse"
        />
        <TextField
          type="number"
          size="small"
          label="Intervalo"
          value={seconds}
          disabled={cfg.autoplay !== "S"}
          onChange={(e) => {
            const sec = Math.max(2, Math.min(30, parseInt(e.target.value, 10) || 5));
            setCfg((c) => ({ ...c, interval_ms: sec * 1000 }));
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">seg</InputAdornment>,
          }}
          inputProps={{ min: 2, max: 30, step: 1 }}
          sx={{ width: { xs: "100%", sm: 140 } }}
        />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ ml: { sm: "auto" } }}
        >
          Guardar
        </Button>
      </Stack>
    </Paper>
  );
};

export default SliderAutoplaySettings;
