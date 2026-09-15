import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, IconButton, Skeleton, Tooltip, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import InboxIcon from "@mui/icons-material/Inbox";

import { listar, eliminar } from "../../../api/web_cancion_sugerencias.api";
import { handleErrorMessages, handleSuccessMessages, confirmAction } from "../../../components/notify-messages";
import useInjectPublicCss, { publicAsset } from "../evento/useInjectPublicCss";
import useEventoData from "../evento/useEventoData";
import { CanvasPhone, EditZone, EzPencil, EditPanel } from "../evento/EventoCanvasChrome";
import { darkTf, GenerosEditor, IconPickerField, iconosUsadosPorOtrasSecciones } from "../evento/EventoEditors";

const ICONO_DEFAULT = "assets/img/decor/icon-invitacion/guitarra.png";

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

const TableWrap = styled(Paper)(() => ({
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(204,107,142,0.15)",
  boxShadow: "0 4px 24px rgba(44,26,14,0.08)",
}));

const GRID_COLS = "160px 1fr 1fr 1fr 64px";

const THead = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: GRID_COLS,
  background: "linear-gradient(135deg, #fdf8f5, #f5eae4)",
  borderBottom: "2px solid rgba(204,107,142,0.2)",
  padding: "0 12px",
}));

const THeadCell = styled(Typography)(() => ({
  padding: "14px 12px",
  fontSize: "0.67rem",
  fontWeight: 800,
  color: "#7a4030",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
}));

const TRow = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: GRID_COLS,
  padding: "0 12px",
  borderBottom: "1px solid rgba(204,107,142,0.1)",
  backgroundColor: "#fff",
  "&:hover": { backgroundColor: "rgba(204,107,142,0.05)" },
  "&:last-child": { borderBottom: "none" },
}));

const TCell = styled(Box)(() => ({
  padding: "14px 12px",
  display: "flex",
  alignItems: "center",
  minWidth: 0,
}));

const fmtFecha = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <Box key={i} sx={{ display: "grid", gridTemplateColumns: GRID_COLS, px: 1.5, py: 1.2, borderBottom: "1px solid rgba(204,107,142,0.1)" }}>
      {[130, 160, 160, 160, 32].map((w, j) => (
        <Box key={j} sx={{ px: 1, display: "flex", alignItems: "center" }}>
          <Skeleton variant="rounded" width={w} height={20} sx={{ borderRadius: "6px" }} />
        </Box>
      ))}
    </Box>
  ));

export default function CancionSugerenciasIndexPage() {
  useInjectPublicCss();
  const { data, saving, guardarCampos } = useEventoData();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [generos, setGeneros] = useState([]);

  const cargar = async () => {
    setLoading(true);
    try { setRows((await listar()) ?? []); }
    catch (e) { handleErrorMessages("Error", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (row) => {
    const res = await confirmAction(`¿Eliminar la sugerencia "${row.nombre_cancion}"?`, "Sí, eliminar", "Cancelar");
    if (!res.isConfirmed) return;
    try {
      await eliminar(row.id_sugerencia);
      handleSuccessMessages("Listo", "Sugerencia eliminada.");
      cargar();
    } catch (e) { handleErrorMessages("Error", e); }
  };

  const abrirTexto = () => {
    setForm({
      cancion_texto: data?.cancion_texto,
      cancion_label_nombre: data?.cancion_label_nombre,
      cancion_label_genero: data?.cancion_label_genero,
      cancion_label_de: data?.cancion_label_de,
      cancion_boton: data?.cancion_boton,
      icono_cancion: data?.icono_cancion,
    });
    setGeneros(data?.cancion_generos || []);
    setOpen(true);
  };
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const guardarTexto = async () => { if (await guardarCampos({ ...form, cancion_generos: generos })) setOpen(false); };

  return (
    <PageWrap>
      {data && (
        <CanvasPhone sx={{ mb: 3 }}>
          <EditZone className="section has-flowers">
            <EzPencil onClick={abrirTexto} tip="Editar texto" />
            <p className="divider"><img className="divider-icon" src={publicAsset(data.icono_cancion || ICONO_DEFAULT)} alt="" /></p>
            <h2 className="script-title">Sugiere una Canción</h2>
            <p className="section-sub">{data.cancion_texto}</p>
          </EditZone>
        </CanvasPhone>
      )}

      {open && (
        <EditPanel open title="Editar 'Sugiere una Canción'" onClose={() => setOpen(false)} onSave={guardarTexto} saving={saving}>
          <IconPickerField label="Ícono de la sección" value={form.icono_cancion} onChange={(path) => set("icono_cancion", path)} excluir={iconosUsadosPorOtrasSecciones(data, "icono_cancion")} />
          <TextField {...darkTf} label="Texto (subtítulo)" multiline minRows={2} value={form.cancion_texto || ""} onChange={(e) => set("cancion_texto", e.target.value)} />

          <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", fontWeight: 700, textTransform: "uppercase", mt: 2, mb: 1 }}>
            Campos del formulario
          </Typography>
          <TextField {...darkTf} label="Etiqueta: Nombre de la canción" value={form.cancion_label_nombre || ""} onChange={(e) => set("cancion_label_nombre", e.target.value)} />
          <TextField {...darkTf} label="Etiqueta: Género" value={form.cancion_label_genero || ""} onChange={(e) => set("cancion_label_genero", e.target.value)} />
          <TextField {...darkTf} label="Etiqueta: Tu nombre" value={form.cancion_label_de || ""} onChange={(e) => set("cancion_label_de", e.target.value)} />
          <TextField {...darkTf} label="Texto del botón" value={form.cancion_boton || ""} onChange={(e) => set("cancion_boton", e.target.value)} />

          <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", fontWeight: 700, textTransform: "uppercase", mt: 2, mb: 1 }}>
            Géneros musicales (opciones del combo)
          </Typography>
          <GenerosEditor items={generos} onChange={setGeneros} />
        </EditPanel>
      )}

      <HeaderCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg,#cc6b8e,#a0455e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(204,107,142,0.4)" }}>
            <MusicNoteIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fdf8f5", lineHeight: 1.1 }}>
              Sugerencias de Canción
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", mt: 0.3 }}>
              Canciones sugeridas por los invitados
            </Typography>
          </Box>
        </Box>
        <Chip label={`${rows.length} sugerencia${rows.length !== 1 ? "s" : ""}`} size="small"
          sx={{ bgcolor: "rgba(204,107,142,0.25)", color: "#f5c6d8", fontWeight: 700, fontSize: "0.72rem", border: "1px solid rgba(204,107,142,0.35)" }} />
      </HeaderCard>

      <TableWrap elevation={0}>
        <THead>
          <THeadCell>📅 Fecha</THeadCell>
          <THeadCell>🎵 Canción</THeadCell>
          <THeadCell>🎼 Género</THeadCell>
          <THeadCell>👤 Sugerida por</THeadCell>
          <THeadCell></THeadCell>
        </THead>

        {loading ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <InboxIcon sx={{ fontSize: 52, color: "#e8d5c0", mb: 1.5 }} />
            <Typography sx={{ color: "#b8a090", fontWeight: 600, fontSize: "0.9rem" }}>Todavía no hay sugerencias</Typography>
            <Typography sx={{ color: "#c4a98a", fontSize: "0.78rem", mt: 0.5 }}>Las canciones sugeridas por los invitados aparecerán aquí</Typography>
          </Box>
        ) : (
          rows.map((r) => (
            <TRow key={r.id_sugerencia}>
              <TCell><Typography sx={{ fontSize: "0.78rem", color: "#4a3a30" }}>{fmtFecha(r.created_at)}</Typography></TCell>
              <TCell><Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#2c1a0e" }}>{r.nombre_cancion}</Typography></TCell>
              <TCell>
                {r.genero ? (
                  <Chip size="small" label={r.genero} sx={{ bgcolor: "rgba(204,107,142,0.12)", color: "#a0455e", fontWeight: 700, fontSize: "0.7rem" }} />
                ) : (
                  <Typography sx={{ fontSize: "0.8rem", color: "#4a3a30" }}>—</Typography>
                )}
              </TCell>
              <TCell><Typography sx={{ fontSize: "0.8rem", color: "#4a3a30" }}>{r.nombre_invitado || "—"}</Typography></TCell>
              <TCell sx={{ justifyContent: "center" }}>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => handleEliminar(r)}
                    sx={{ width: 32, height: 32, bgcolor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", "&:hover": { bgcolor: "rgba(239,68,68,0.15)" } }}>
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </TCell>
            </TRow>
          ))
        )}
      </TableWrap>

      {!loading && rows.length > 0 && (
        <Typography sx={{ mt: 1.5, fontSize: "0.68rem", color: "#b8a090", textAlign: "right" }}>
          Mostrando {rows.length} sugerencia{rows.length !== 1 ? "s" : ""}
        </Typography>
      )}
    </PageWrap>
  );
}
