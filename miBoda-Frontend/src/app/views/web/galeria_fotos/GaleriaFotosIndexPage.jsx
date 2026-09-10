import React, { useState, useEffect } from "react";
import { Box, Typography, Chip, IconButton, Skeleton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import InboxIcon from "@mui/icons-material/Inbox";

import { listar, eliminar } from "../../../api/web_galeria_fotos.api";
import { handleErrorMessages, handleSuccessMessages, confirmAction } from "../../../components/notify-messages";

const PageWrap = styled(Box)(() => ({
  padding: "24px",
  minHeight: "100vh",
  background: "#f7f3f0",
}));

const HeaderCard = styled(Box)(() => ({
  background: "linear-gradient(135deg, #2c1a0e 0%, #4a2a15 100%)",
  borderRadius: "16px",
  padding: "20px 28px",
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  boxShadow: "0 6px 28px rgba(44,26,14,0.3)",
}));

const Grid = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "16px",
}));

const PhotoCard = styled(Box)(() => ({
  position: "relative",
  borderRadius: "14px",
  overflow: "hidden",
  aspectRatio: "1",
  boxShadow: "0 4px 18px rgba(44,26,14,0.12)",
  border: "1px solid rgba(204,107,142,0.15)",
  "& img": { width: "100%", height: "100%", objectFit: "cover", display: "block" },
}));

const DeleteOverlay = styled(IconButton)(() => ({
  position: "absolute",
  top: 8,
  right: 8,
  width: 32,
  height: 32,
  background: "rgba(0,0,0,0.55)",
  color: "#fff",
  "&:hover": { background: "rgba(239,68,68,0.85)" },
}));

export default function GaleriaFotosIndexPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try { setRows((await listar()) ?? []); }
    catch (e) { handleErrorMessages("Error", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (row) => {
    const res = await confirmAction("¿Eliminar esta foto de la galería?", "Sí, eliminar", "Cancelar");
    if (!res.isConfirmed) return;
    try {
      await eliminar(row.id_foto);
      handleSuccessMessages("Listo", "Foto eliminada.");
      cargar();
    } catch (e) { handleErrorMessages("Error", e); }
  };

  return (
    <PageWrap>
      <HeaderCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg,#cc6b8e,#a0455e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(204,107,142,0.4)" }}>
            <PhotoLibraryIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>
              Galería de Fotos
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.3 }}>
              Fotos subidas por los invitados desde la invitación
            </Typography>
          </Box>
        </Box>
        <Chip label={`${rows.length} foto${rows.length !== 1 ? "s" : ""}`} size="small"
          sx={{ bgcolor: "rgba(204,107,142,0.25)", color: "#f5c6d8", fontWeight: 700, fontSize: "0.72rem", border: "1px solid rgba(204,107,142,0.35)" }} />
      </HeaderCard>

      {loading ? (
        <Grid>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" sx={{ aspectRatio: "1", borderRadius: "14px" }} />
          ))}
        </Grid>
      ) : rows.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <InboxIcon sx={{ fontSize: 52, color: "#e8d5c0", mb: 1.5 }} />
          <Typography sx={{ color: "#b8a090", fontWeight: 600, fontSize: "0.9rem" }}>Todavía no hay fotos</Typography>
          <Typography sx={{ color: "#c4a98a", fontSize: "0.78rem", mt: 0.5 }}>Las fotos subidas por los invitados aparecerán aquí</Typography>
        </Box>
      ) : (
        <Grid>
          {rows.map((r) => (
            <PhotoCard key={r.id_foto}>
              <img src={r.url_imagen_thumb_publica || r.url_imagen_publica} alt="Foto de la galería" loading="lazy" />
              <Tooltip title="Eliminar">
                <DeleteOverlay size="small" onClick={() => handleEliminar(r)}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </DeleteOverlay>
              </Tooltip>
            </PhotoCard>
          ))}
        </Grid>
      )}
    </PageWrap>
  );
}
