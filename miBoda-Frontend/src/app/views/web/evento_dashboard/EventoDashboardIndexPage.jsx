import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, IconButton, Tooltip, LinearProgress, TextField, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { QRCodeSVG } from "qrcode.react";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import DownloadIcon from "@mui/icons-material/Download";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SearchIcon from "@mui/icons-material/Search";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SettingsIcon from "@mui/icons-material/Settings";
import ListAltIcon from "@mui/icons-material/ListAlt";
import HistoryIcon from "@mui/icons-material/History";

import { listar as listarRsvp } from "../../../api/web_rsvp_respuestas.api";
import { listar as listarCanciones } from "../../../api/web_cancion_sugerencias.api";
import { listar as listarFotos } from "../../../api/web_galeria_fotos.api";
import { listar as listarInvitados } from "../../../api/web_invitados.api";
import useEventoData from "../evento/useEventoData";

// ─── Paleta y tipografía pedidas para este dashboard ─────────────────────────
const COLORS = {
  bg: "#FDFBF7",
  terracota: "#C86D51",
  dorado: "#8C6D3B",
  verde: "#6B7A59",
};

function useGoogleFonts() {
  useEffect(() => {
    if (document.getElementById("dashboard-fonts")) return;
    const link = document.createElement("link");
    link.id = "dashboard-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const PageWrap = styled(Box)(() => ({
  padding: "28px",
  minHeight: "100vh",
  background: COLORS.bg,
  fontFamily: "'Inter', sans-serif",
}));

const Title = styled(Typography)(() => ({
  fontFamily: "'Playfair Display', serif",
  fontWeight: 700,
  fontSize: "2rem",
  textAlign: "center",
  color: COLORS.dorado,
}));

const Subtitle = styled(Typography)(() => ({
  textAlign: "center",
  color: COLORS.terracota,
  fontSize: "0.85rem",
  marginTop: 4,
  marginBottom: 28,
}));

const Card = styled(Paper)(() => ({
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid rgba(140,109,59,0.12)",
  boxShadow: "0 4px 18px rgba(140,109,59,0.06)",
  height: "100%",
}));

const Grid = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "18px",
  marginBottom: "18px",
}));

const KpiCard = styled(Card)(({ accent }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  borderTop: `3px solid ${accent}`,
}));

const kpiIconBox = (color) => ({
  width: 36, height: 36, borderRadius: "10px",
  bgcolor: `${color}1a`, color,
  display: "flex", alignItems: "center", justifyContent: "center",
});

const CardTitle = styled(Typography)(() => ({
  fontFamily: "'Playfair Display', serif",
  fontWeight: 700,
  fontSize: "1.05rem",
  color: COLORS.dorado,
  marginBottom: 14,
}));

const KpiLabel = styled(Typography)(() => ({
  fontSize: "0.72rem", color: "#8a7a5c", fontWeight: 600, textTransform: "uppercase",
}));

const KpiNumber = styled(Typography)(() => ({
  fontFamily: "'Playfair Display', serif", fontSize: "1.9rem", fontWeight: 700, color: "#3a2f1c",
}));

const EmptyHint = styled(Typography)(() => ({
  color: "#a89a7d", fontSize: "0.85rem", textAlign: "center", padding: "32px 0",
}));

const FooterBar = styled(Box)(() => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "4px",
}));

const footerBtnSx = {
  textTransform: "none",
  fontSize: "0.78rem",
  fontWeight: 700,
  borderRadius: "10px",
  color: COLORS.dorado,
  borderColor: "rgba(140,109,59,0.35)",
};

export default function EventoDashboardIndexPage() {
  useGoogleFonts();
  const { data: evento } = useEventoData();

  const [rsvp, setRsvp] = useState([]);
  const [canciones, setCanciones] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [capacidadMaxima, setCapacidadMaxima] = useState(100);
  const [pasesTotales, setPasesTotales] = useState(0);
  const [busquedaCancion, setBusquedaCancion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, c, f, inv] = await Promise.all([listarRsvp(), listarCanciones(), listarFotos(), listarInvitados()]);
        setRsvp(r ?? []);
        setCanciones(c ?? []);
        setFotos(f ?? []);
        setInvitados(inv?.invitados ?? []);
        setCapacidadMaxima(inv?.capacidad_maxima ?? 100);
        setPasesTotales(inv?.pases_totales ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalInvitados = invitados.length;
  const confirmados = rsvp.filter((r) => r.asistira === "S").length;
  const noAsisten = rsvp.filter((r) => r.asistira === "N").length;
  const sinResponder = Math.max(totalInvitados - rsvp.length, 0);
  const conAcompanante = rsvp.filter((r) => (r.acompanante || "").trim() !== "").length;
  const pctConfirmados = totalInvitados ? Math.round((confirmados / totalInvitados) * 100) : 0;
  const pctAforo = capacidadMaxima ? Math.min(Math.round((pasesTotales / capacidadMaxima) * 100), 100) : 0;

  const fmtFecha = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const confirmacionesRecientes = useMemo(
    () => [...rsvp].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [rsvp]
  );

  const cancionesFiltradas = useMemo(() => {
    const q = busquedaCancion.trim().toLowerCase();
    if (!q) return canciones;
    return canciones.filter((c) =>
      `${c.nombre_cancion} ${c.genero} ${c.nombre_invitado}`.toLowerCase().includes(q)
    );
  }, [canciones, busquedaCancion]);

  const rsvpPorDia = useMemo(() => {
    const dias = [];
    const hoy = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      dias.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }), cantidad: 0 });
    }
    const porFecha = Object.fromEntries(dias.map((d) => [d.key, d]));
    rsvp.forEach((r) => {
      const key = (r.created_at || "").slice(0, 10);
      if (porFecha[key]) porFecha[key].cantidad += 1;
    });
    return dias;
  }, [rsvp]);

  const publicUrl = (import.meta.env.VITE_AUTHJWT_DOMAIN || window.location.origin).replace(/\/$/, "") + "/";

  const exportarCSV = () => {
    const headers = ["Nombre", "Acompañante", "Asistencia", "Fecha de respuesta"];
    const filas = rsvp.map((r) => [r.nombre, r.acompanante || "", r.asistira === "S" ? "Confirmado" : "No asiste", fmtFecha(r.created_at)]);
    const csv = [headers, ...filas]
      .map((fila) => fila.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp_${evento?.novio || "invitados"}_${evento?.novia || ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrap>
      <Title>Dashboard de Invitaciones{evento ? ` — ${evento.novio} & ${evento.novia}` : ""}</Title>
      <Subtitle>Te invitamos a Nuestra Boda{evento?.fecha_boda_texto ? ` · ${evento.fecha_boda_texto}` : ""}</Subtitle>

      {loading && <LinearProgress sx={{ mb: 3, "& .MuiLinearProgress-bar": { bgcolor: COLORS.terracota } }} />}

      {/* KPIs */}
      <Grid>
        <KpiCard accent={COLORS.dorado}>
          <Box sx={kpiIconBox(COLORS.dorado)}><GroupsIcon fontSize="small" /></Box>
          <KpiLabel>Total Invitados</KpiLabel>
          <KpiNumber>{pasesTotales}</KpiNumber>
          <LinearProgress
            variant="determinate" value={pctAforo}
            sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(140,109,59,0.12)", "& .MuiLinearProgress-bar": { bgcolor: COLORS.dorado } }}
          />
          <Typography sx={{ fontSize: "0.68rem", color: "#a89a7d" }}>{pasesTotales} de {capacidadMaxima} cupos ({pctAforo}%)</Typography>
        </KpiCard>

        <KpiCard accent={COLORS.verde}>
          <Box sx={kpiIconBox(COLORS.verde)}><CheckCircleIcon fontSize="small" /></Box>
          <KpiLabel>Confirmados</KpiLabel>
          <KpiNumber>{confirmados}</KpiNumber>
          <Box sx={{ height: 60, mt: -1 }}>
            <BarChart
              dataset={[
                { name: "Confirmados", valor: confirmados, color: COLORS.verde },
                { name: "Pendientes", valor: sinResponder + noAsisten, color: "#d8cdb8" },
              ]}
              xAxis={[{ scaleType: "band", dataKey: "name", disableTicks: true }]}
              yAxis={[{ disableTicks: true }]}
              series={[{ dataKey: "valor", color: COLORS.verde }]}
              height={60}
              margin={{ top: 4, bottom: 18, left: 0, right: 0 }}
              slotProps={{ legend: { hidden: true } }}
              sx={{ "& .MuiChartsAxis-tickLabel": { fontSize: 9 }, "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: "transparent" } }}
            />
          </Box>
        </KpiCard>

        <KpiCard accent={COLORS.terracota}>
          <Box sx={kpiIconBox(COLORS.terracota)}><PersonAddAltIcon fontSize="small" /></Box>
          <KpiLabel>Con Acompañante</KpiLabel>
          <KpiNumber>{conAcompanante}</KpiNumber>
          <Typography sx={{ fontSize: "0.68rem", color: "#a89a7d" }}>de {confirmados} confirmaciones</Typography>
        </KpiCard>

        <Card>
          <CardTitle sx={{ fontSize: "0.92rem", mb: 1 }}>Confirmaciones Recientes</CardTitle>
          {confirmacionesRecientes.length === 0 ? (
            <EmptyHint sx={{ py: 2 }}>Aún no hay confirmaciones</EmptyHint>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
              {confirmacionesRecientes.map((r) => (
                <Box key={r.id_rsvp_respuesta} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#3a2f1c", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.asistira === "S" ? "✓" : "✕"} {r.nombre}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#a89a7d", flexShrink: 0 }}>{fmtFecha(r.created_at)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Grid>

      <Grid sx={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {/* DONA DE ASISTENCIA */}
        <Card>
          <CardTitle>Asistencia Global</CardTitle>
          {totalInvitados === 0 ? (
            <EmptyHint>Aún no hay invitados en la lista</EmptyHint>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <PieChart
                series={[{
                  data: [
                    { id: 0, value: confirmados, label: `Sí asisto (${confirmados})`, color: COLORS.verde },
                    { id: 1, value: noAsisten, label: `No asisto (${noAsisten})`, color: COLORS.terracota },
                    { id: 2, value: sinResponder, label: `Sin responder (${sinResponder})`, color: "#d8cdb8" },
                  ],
                  innerRadius: 55, outerRadius: 90, paddingAngle: 2, cornerRadius: 4,
                  arcLabel: () => "",
                }]}
                width={260} height={220}
                slotProps={{ legend: { direction: "row", position: { vertical: "bottom", horizontal: "middle" }, labelStyle: { fontSize: 10, fontFamily: "Inter" } } }}
              />
              <Typography sx={{ mt: -13, fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: COLORS.dorado, pointerEvents: "none" }}>
                {pctConfirmados}%
              </Typography>
            </Box>
          )}
        </Card>

        {/* PETICIONES MUSICALES */}
        <Card>
          <CardTitle>🎵 Peticiones Musicales</CardTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, border: "1px solid rgba(140,109,59,0.18)", borderRadius: "10px", px: 1.2, py: 0.5 }}>
            <SearchIcon sx={{ fontSize: 16, color: "#a89a7d" }} />
            <TextField
              variant="standard" placeholder="Buscar canción o artista..." fullWidth
              value={busquedaCancion} onChange={(e) => setBusquedaCancion(e.target.value)}
              InputProps={{ disableUnderline: true, sx: { fontSize: "0.8rem" } }}
            />
          </Box>
          {cancionesFiltradas.length === 0 ? (
            <EmptyHint sx={{ py: 3 }}>{canciones.length === 0 ? "Aún no hay sugerencias" : "Sin resultados"}</EmptyHint>
          ) : (
            <Box sx={{ maxHeight: 190, overflowY: "auto" }}>
              {cancionesFiltradas.map((c) => (
                <Box key={c.id_sugerencia} sx={{ display: "flex", alignItems: "center", gap: 1.2, py: 1, borderBottom: "1px solid rgba(140,109,59,0.08)" }}>
                  <MusicNoteIcon sx={{ fontSize: 16, color: COLORS.terracota, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#3a2f1c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.nombre_cancion} {c.genero && `— ${c.genero}`}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "#a89a7d" }}>Pedida por {c.nombre_invitado || "anónimo"}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          <Typography sx={{ mt: 1.5, fontSize: "0.68rem", color: "#a89a7d", textAlign: "right" }}>{canciones.length} canciones</Typography>
        </Card>

        {/* RESUMEN DE LA AGENDA */}
        <Card>
          <CardTitle><EventNoteIcon sx={{ fontSize: 17, mr: 0.8, verticalAlign: "text-bottom" }} />Resumen de la Agenda</CardTitle>
          {(!evento?.itinerario || evento.itinerario.length === 0) ? (
            <EmptyHint>Aún no hay itinerario cargado</EmptyHint>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
              {evento.itinerario.map((it, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.terracota, minWidth: 72 }}>{it.hora}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#3a2f1c" }}>{it.titulo}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Card>

        {/* INFORMACIÓN ADICIONAL */}
        <Card>
          <CardTitle><CheckroomIcon sx={{ fontSize: 17, mr: 0.8, verticalAlign: "text-bottom" }} />Información Adicional</CardTitle>
          <Typography sx={{ fontSize: "0.72rem", color: "#8a7a5c", fontWeight: 700, textTransform: "uppercase", mb: 0.4 }}>Código de vestimenta</Typography>
          <Typography sx={{ fontSize: "0.95rem", fontFamily: "'Playfair Display', serif", color: COLORS.dorado, mb: 0.6 }}>{evento?.vestimenta_tipo || "—"}</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#5c4f3a" }}>{evento?.vestimenta_restriccion || "—"}</Typography>
        </Card>
      </Grid>

      <Grid sx={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {/* GALERÍA */}
        <Card>
          <CardTitle>📷 Galería de Fotos</CardTitle>
          {fotos.length === 0 ? (
            <EmptyHint>Aún no hay fotos</EmptyHint>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, maxHeight: 240, overflowY: "auto" }}>
              {fotos.map((f) => (
                <Box key={f.id_foto} sx={{ position: "relative", aspectRatio: "1", borderRadius: "8px", overflow: "hidden" }}>
                  <Box component="img" src={f.url_imagen_thumb_publica || f.url_imagen_publica} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <Tooltip title="Descargar foto">
                    <IconButton
                      component="a" href={f.url_imagen_publica} download target="_blank" rel="noopener"
                      size="small"
                      sx={{ position: "absolute", bottom: 4, right: 4, width: 24, height: 24, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", "&:hover": { bgcolor: COLORS.terracota } }}
                    >
                      <DownloadIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}
          <Typography sx={{ mt: 1.5, fontSize: "0.68rem", color: "#a89a7d", textAlign: "right" }}>{fotos.length} fotos</Typography>
        </Card>

        {/* RSVP EN EL TIEMPO */}
        <Card>
          <CardTitle><HistoryIcon sx={{ fontSize: 17, mr: 0.8, verticalAlign: "text-bottom" }} />RSVP en los Últimos 14 Días</CardTitle>
          {rsvp.length === 0 ? (
            <EmptyHint>Aún no hay respuestas</EmptyHint>
          ) : (
            <BarChart
              dataset={rsvpPorDia}
              xAxis={[{ scaleType: "band", dataKey: "label", tickLabelStyle: { fontSize: 9 } }]}
              yAxis={[{ tickMinStep: 1 }]}
              series={[{ dataKey: "cantidad", color: COLORS.dorado, label: "Respuestas" }]}
              height={220}
              margin={{ top: 10, bottom: 30, left: 30, right: 10 }}
              slotProps={{ legend: { hidden: true } }}
            />
          )}
        </Card>

        {/* QR */}
        <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <CardTitle><QrCode2Icon sx={{ fontSize: 17, mr: 0.8, verticalAlign: "text-bottom" }} />Código QR de la Invitación</CardTitle>
          <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: "12px", border: "1px solid rgba(140,109,59,0.15)" }}>
            <QRCodeSVG value={publicUrl} size={140} fgColor={COLORS.dorado} />
          </Box>
          <Typography sx={{ fontSize: "0.72rem", color: "#a89a7d", mt: 1.5 }}>Escanea para abrir la invitación y confirmar asistencia</Typography>
        </Card>
      </Grid>

      <FooterBar>
        <Button component={Link} to="/evento/index" variant="outlined" size="small" startIcon={<SettingsIcon />} sx={footerBtnSx}>
          Ajustes de la Invitación
        </Button>
        <Button component={Link} to="/invitados/index" variant="outlined" size="small" startIcon={<ListAltIcon />} sx={footerBtnSx}>
          Lista de Invitados
        </Button>
        <Button onClick={exportarCSV} variant="outlined" size="small" startIcon={<DownloadIcon />} sx={footerBtnSx}>
          Exportar Datos
        </Button>
      </FooterBar>
    </PageWrap>
  );
}
