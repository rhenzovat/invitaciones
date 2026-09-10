import React, { useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  PRODUCTO_IMAGEN_RECOMENDACION,
  formatTamanoArchivo,
  evaluarMedidaVsRecomendacion,
} from "../../utils/productoImagenValidacion";

/**
 * Modal informativo: recomendaciones de imagen de producto. Al aceptar, se usa el archivo elegido.
 */
export default function ProductoImagenRecomendacionModal({
  open,
  file,
  analysis,
  previewUrl,
  onCancel,
  onConfirm,
  titulo = "Recomendación de imagen",
}) {
  const r = PRODUCTO_IMAGEN_RECOMENDACION;

  const nombre = file?.name ?? "";
  const tam = file ? formatTamanoArchivo(file.size) : "";

  const evaluacion = useMemo(() => evaluarMedidaVsRecomendacion(analysis), [analysis]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <ImageOutlinedIcon color="primary" />
        {titulo}
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        {previewUrl && (
          <Box
            sx={{
              mb: 2,
              textAlign: "center",
              bgcolor: "#f5f7fa",
              borderRadius: 1,
              p: 1,
              maxHeight: 220,
              overflow: "hidden",
            }}
          >
            <img
              src={previewUrl}
              alt="Vista previa"
              style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
            />
          </Box>
        )}

        {evaluacion.tipo !== "ok" && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
              {evaluacion.tipo === "error"
                ? "Esta imagen no cumple las medidas recomendadas"
                : "No es el tamaño ideal recomendado"}
            </Typography>
            {evaluacion.mensajes.map((linea, i) => (
              <Typography key={i} variant="body2" component="div" sx={{ mb: i < evaluacion.mensajes.length - 1 ? 0.75 : 0 }}>
                {linea}
              </Typography>
            ))}
            <Typography variant="body2" sx={{ mt: 1.25, opacity: 0.95, fontWeight: 600 }}>
              Puede continuar igualmente: use «Entendido, usar esta imagen» si desea subirla.
            </Typography>
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Puedes usar esta imagen tal como está. Lo siguiente es solo una <strong>recomendación</strong> para que se vea
          mejor en la tienda:
        </Typography>

        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2, "& li": { mb: 0.75 } }}>
          <Typography component="li" variant="body2">
            <strong>Relación:</strong> cuadrada (1:1), misma anchura y altura.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Tamaño:</strong> ideal {r.recomendadoPx}×{r.recomendadoPx} px; también válido desde unos{" "}
            {r.minEjemploPx}×{r.minEjemploPx} px hasta ~{r.maxLadoSugerido} px por lado.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Formatos:</strong> {r.formatosTexto}.
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Peso:</strong> por debajo de {r.pesoSugeridoMb} MB ayuda a que la web cargue más rápido (máximo de
            subida: {Math.round(r.maxBytesUpload / (1024 * 1024))} MB).
          </Typography>
        </Box>

        {file && (
          <Box
            sx={{
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <Typography variant="caption" color="success.dark" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
              Archivo seleccionado
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, wordBreak: "break-all" }}>
              {nombre} · {tam}
            </Typography>
            {analysis?.ok && !analysis.esSvg && analysis.width != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Dimensiones: {analysis.width} × {analysis.height} px
                {analysis.esCuadrada === true && " · Relación 1:1."}
                {analysis.esCuadrada === false && " · Proporción distinta a 1:1."}
              </Typography>
            )}
            {analysis?.ok && analysis.esSvg && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Imagen vectorial (SVG).
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Entendido, usar esta imagen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
