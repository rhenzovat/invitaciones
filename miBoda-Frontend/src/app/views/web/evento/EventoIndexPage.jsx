import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MailIcon from "@mui/icons-material/MailOutline";
import GroupsIcon from "@mui/icons-material/Groups";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MovieIcon from "@mui/icons-material/Movie";
import BlockIcon from "@mui/icons-material/Block";
import VideocamIcon from "@mui/icons-material/Videocam";
import CollectionsIcon from "@mui/icons-material/Collections";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

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
  boxShadow: "0 6px 28px rgba(44,26,14,0.3)",
}));

const Grid = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: "16px",
}));

const ModuleCard = styled(Paper)(() => ({
  borderRadius: "16px",
  padding: "20px",
  textDecoration: "none",
  border: "1px solid rgba(204,107,142,0.15)",
  boxShadow: "0 4px 18px rgba(44,26,14,0.06)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  transition: "transform 0.15s, box-shadow 0.15s",
  cursor: "pointer",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 28px rgba(44,26,14,0.15)" },
}));

const modulos = [
  { title: "Hero", desc: "Nombres, fecha y subtítulo de la portada", icon: <MailIcon />, to: "/evento-hero/index" },
  { title: "Cuenta Regresiva", desc: "Fecha de la boda y mensaje del contador", icon: <ScheduleIcon />, to: "/evento-countdown/index" },
  { title: "Pie de Página", desc: "Texto de despedida al final de la invitación", icon: <MailIcon />, to: "/evento-general/index" },
  { title: "Sobre Animado", desc: "Monograma, versículo y las 2 fotos del sobre", icon: <MailIcon />, to: "/evento-sobre/index" },
  { title: "Familia", desc: "Versículo, padres, padrinos y testigos", icon: <GroupsIcon />, to: "/evento-familia/index" },
  { title: "Ubicaciones", desc: "Ceremonia civil y recepción", icon: <PlaceIcon />, to: "/evento-ubicaciones/index" },
  { title: "Itinerario", desc: "Horarios del día", icon: <ScheduleIcon />, to: "/evento-itinerario/index" },
  { title: "Vestimenta", desc: "Tipo de vestimenta, colores e ilustraciones", icon: <CheckroomIcon />, to: "/evento-vestimenta/index" },
  { title: "RSVP", desc: "Fecha límite y contacto para confirmar asistencia", icon: <HowToRegIcon />, to: "/evento-rsvp/index" },
  { title: "Mesa de Regalos", desc: "Transferencias, Yape/Plin y regalos físicos", icon: <CardGiftcardIcon />, to: "/evento-regalos/index" },
  { title: "Momento 1", desc: "Foto y versículo (después de Ubicaciones)", icon: <PhotoCameraIcon />, to: "/evento-momento1/index" },
  { title: "Momento 2", desc: "Foto y versículo (después de Mesa de Regalos)", icon: <PhotoCameraIcon />, to: "/evento-momento2/index" },
  { title: "Momento 3", desc: "Foto (después de Nuestra Historia)", icon: <PhotoCameraIcon />, to: "/evento-momento3/index" },
  { title: "Nuestra Historia", desc: "Línea de tiempo de la pareja", icon: <AutoStoriesIcon />, to: "/evento-historia/index" },
  { title: "Restricciones", desc: "Aviso de 'Solo Adultos' y otras restricciones", icon: <BlockIcon />, to: "/evento-restricciones/index" },
  { title: "Video", desc: "Video de la pareja y texto de introducción", icon: <VideocamIcon />, to: "/evento-video/index" },
  { title: "Galería", desc: "Texto y botones de la galería de fotos", icon: <CollectionsIcon />, to: "/evento-galeria/index" },
  { title: "Sugerencias de Canción", desc: "Texto de la sección y lista de canciones sugeridas", icon: <MusicNoteIcon />, to: "/cancion-sugerencias/index" },
  { title: "Foto, Música y Estacionamiento", desc: "Foto de pareja, música de fondo y avisos", icon: <MovieIcon />, to: "/evento-multimedia/index" },
];

export default function EventoIndexPage() {
  return (
    <PageWrap>
      <HeaderCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 46, height: 46, borderRadius: "12px", background: "linear-gradient(135deg,#cc6b8e,#a0455e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(204,107,142,0.4)" }}>
            <FavoriteIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#fdf8f5", lineHeight: 1.1 }}>Editar Invitación</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", mt: 0.3 }}>
              Elige una sección para editarla — cada una se puede trabajar por separado
            </Typography>
          </Box>
        </Box>
      </HeaderCard>

      <Grid>
        {modulos.map((m) => (
          <ModuleCard key={m.to} component={Link} to={m.to} elevation={0}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "rgba(204,107,142,0.12)", color: "#a0455e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.icon}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#2c1a0e" }}>{m.title}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#94836f", lineHeight: 1.4 }}>{m.desc}</Typography>
          </ModuleCard>
        ))}
      </Grid>
    </PageWrap>
  );
}
