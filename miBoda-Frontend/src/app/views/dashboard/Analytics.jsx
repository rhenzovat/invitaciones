import { memo } from "react";
import { Box, Typography, Chip, Tooltip, Avatar } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import MiscellaneousServicesIcon  from "@mui/icons-material/MiscellaneousServices";
import QuizOutlinedIcon           from "@mui/icons-material/QuizOutlined";
import FormatQuoteIcon            from "@mui/icons-material/FormatQuote";
import WorkspacePremiumIcon       from "@mui/icons-material/WorkspacePremium";
import GroupsOutlinedIcon         from "@mui/icons-material/GroupsOutlined";
import HelpOutlineIcon            from "@mui/icons-material/HelpOutline";
import VerifiedUserOutlinedIcon   from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon           from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon            from "@mui/icons-material/AutoAwesome";
import RocketLaunchOutlinedIcon   from "@mui/icons-material/RocketLaunchOutlined";
import WavingHandOutlinedIcon     from "@mui/icons-material/WavingHandOutlined";
import CheckCircleOutlinedIcon    from "@mui/icons-material/CheckCircleOutlined";
import EditNoteOutlinedIcon       from "@mui/icons-material/EditNoteOutlined";
import PublicOutlinedIcon         from "@mui/icons-material/PublicOutlined";

import useAuth from "app/hooks/useAuth";

/* ── Keyframes ───────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const floatDot = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
`;
const glowPulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ── Styled ──────────────────────────────────────────────────────── */
const Page = styled(Box)({
  minHeight: "75vh",
  backgroundColor: "#f8fafc",
  animation: `${fadeUp} 0.4s ease-out`,
  paddingBottom: "2.5rem",
});

/* Hero con imagen de fondo + overlay claro */
const Hero = styled(Box)({
  position: "relative",
  overflow: "hidden",
  minHeight: 280,
  display: "flex",
  alignItems: "center",
  backgroundImage: `url("https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&auto=format&fit=crop")`,
  backgroundSize: "cover",
  backgroundPosition: "center 30%",
});

const HeroOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(105deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.90) 40%, rgba(255,247,237,0.80) 70%, rgba(254,215,170,0.55) 100%)",
});

const HeroContent = styled(Box)({
  position: "relative",
  zIndex: 2,
  padding: "2.5rem 2.5rem 3rem",
  width: "100%",
  maxWidth: 700,
});

const OrangeBadge = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
  border: "1.5px solid #fed7aa",
  borderRadius: 40,
  padding: "5px 14px",
  marginBottom: 18,
  animation: `${slideIn} 0.5s 0.1s ease-out both`,
});

const HeroTitle = styled(Typography)({
  fontWeight: 900,
  lineHeight: 1.18,
  color: "#0f172a",
  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
  animation: `${slideIn} 0.5s 0.2s ease-out both`,
  "& span": {
    background: "linear-gradient(90deg, #f97316, #ea580c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
});

const HeroSub = styled(Typography)({
  color: "#475569",
  fontSize: "0.92rem",
  lineHeight: 1.75,
  maxWidth: 500,
  marginTop: 12,
  animation: `${slideIn} 0.5s 0.35s ease-out both`,
});

const StatPill = styled(Box)(({ accent }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  background: "#fff",
  border: `1.5px solid ${accent}30`,
  borderRadius: 40,
  padding: "7px 16px",
  boxShadow: `0 2px 10px ${accent}18`,
  animation: `${fadeUp} 0.5s ease-out both`,
}));

/* Decorador flotante en hero (esquina derecha) */
const HeroDecor = styled(Box)({
  position: "absolute",
  right: 40,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  "@media (max-width: 768px)": { display: "none" },
});

const FloatingCard = styled(Box)(({ delay }) => ({
  background: "#fff",
  borderRadius: 14,
  padding: "10px 16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
  border: "1px solid #f1f5f9",
  display: "flex",
  alignItems: "center",
  gap: 10,
  animation: `${floatDot} ${delay === "0s" ? "3s" : "3.6s"} ${delay} ease-in-out infinite`,
  minWidth: 190,
}));

/* Sección de accesos */
const SectionLabel = styled(Typography)({
  fontSize: "0.70rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#94a3b8",
  marginBottom: 14,
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const QuickCard = styled(Box)(({ accent }) => ({
  backgroundColor: "#fff",
  borderRadius: 14,
  border: "1.5px solid #f1f5f9",
  padding: "16px 18px",
  display: "flex",
  alignItems: "center",
  gap: 13,
  cursor: "pointer",
  transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  "&:hover": {
    borderColor: accent,
    boxShadow: `0 8px 24px ${accent}22`,
    transform: "translateY(-2px)",
    backgroundColor: `${accent}05`,
    "& .qa-arrow": { opacity: 1, transform: "translateX(0)" },
  },
  "& .qa-arrow": {
    marginLeft: "auto",
    opacity: 0,
    transform: "translateX(-6px)",
    transition: "all 0.22s",
    flexShrink: 0,
  },
}));

const TipCard = styled(Box)(({ accent }) => ({
  backgroundColor: "#fff",
  borderRadius: 16,
  border: `1.5px solid ${accent}25`,
  padding: "18px 20px",
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  animation: `${fadeUp} 0.5s ease-out both`,
  background: `linear-gradient(135deg, #fff 60%, ${accent}07 100%)`,
}));

/* ── CMS Links ───────────────────────────────────────────────────── */
const CMS_LINKS = [
  { label: "Servicios",            sub: "Tarjetas de servicios",       Icon: MiscellaneousServicesIcon, accent: "#1d4ed8", path: "/web/servicios/index" },
  { label: "Metodología",          sub: "Pasos de trabajo",            Icon: HelpOutlineIcon,           accent: "#f97316", path: "/web/metodologia/index" },
  { label: "Planes",               sub: "Precios y características",   Icon: WorkspacePremiumIcon,      accent: "#7c3aed", path: "/web/planes/index" },
  { label: "¿Por qué Elegirnos?",  sub: "Beneficios y estadísticas",  Icon: VerifiedUserOutlinedIcon,  accent: "#059669", path: "/web/porque_elejirnos/index" },
  { label: "Testimonios",          sub: "Reseñas de clientes",        Icon: FormatQuoteIcon,           accent: "#e11d48", path: "/web/testimonios/index" },
  { label: "Nuestro Equipo",       sub: "Integrantes del equipo",     Icon: GroupsOutlinedIcon,        accent: "#0284c7", path: "/web/nuestro_equipo/index" },
  { label: "Preguntas Frecuentes", sub: "FAQ de la landing",          Icon: QuizOutlinedIcon,          accent: "#d97706", path: "/web/preguntas_frecuentes/index" },
  { label: "Metadatos de Página",  sub: "SEO y descripción",          Icon: AutoAwesomeIcon,           accent: "#64748b", path: "/web/metadatos/index" },
];

const TIPS = [
  { icon: EditNoteOutlinedIcon, accent: "#f97316", title: "Edita sección por sección", desc: "Haz clic en el ícono de lápiz de cada bloque para editar solo ese contenido sin afectar el resto." },
  { icon: PublicOutlinedIcon,   accent: "#059669", title: "Los cambios se ven en tiempo real", desc: "Cada actualización se publica de inmediato en tu landing page. Verifica siempre desde el sitio público." },
  { icon: RocketLaunchOutlinedIcon, accent: "#7c3aed", title: "Optimiza para SEO", desc: "Mantén los metadatos actualizados: título, descripción y palabras clave mejoran tu posicionamiento en Google." },
];

/* ── Analytics ───────────────────────────────────────────────────── */
function Analytics() {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
  const initials = (user?.name || "A").charAt(0).toUpperCase();

  return (
    <Page>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <Hero>
        <HeroOverlay />

        <HeroContent>
          <OrangeBadge>
            <WavingHandOutlinedIcon sx={{ fontSize: 15, color: "#f97316" }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#ea580c", letterSpacing: "0.06em" }}>
              Panel de Administración
            </Typography>
          </OrangeBadge>

          <HeroTitle>
            {saludo},<br />
            <span>{user?.name || "Administrador"}</span>
          </HeroTitle>

          <HeroSub>
            Gestiona el contenido de tu landing page desde un solo lugar.
            Actualiza secciones, imágenes y textos en tiempo real.
          </HeroSub>

          <Box sx={{ display: "flex", gap: 1.5, mt: 2.5, flexWrap: "wrap" }}>
            <StatPill accent="#f97316">
              <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: "#f97316" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                {CMS_LINKS.length} módulos activos
              </Typography>
            </StatPill>
            <StatPill accent="#059669">
              <PublicOutlinedIcon sx={{ fontSize: 15, color: "#059669" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                Landing Page en línea
              </Typography>
            </StatPill>
          </Box>
        </HeroContent>

        {/* Tarjetas flotantes decorativas */}
        <HeroDecor>
          <FloatingCard delay="0s">
            <Box sx={{
              width: 36, height: 36, borderRadius: "50%",
              bgcolor: "#fff7ed", border: "2px solid #fed7aa",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#f97316", fontSize: "0.85rem", fontWeight: 800 }}>
                {initials}
              </Avatar>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.70rem", fontWeight: 700, color: "#0f172a" }}>
                {user?.name || "Administrador"}
              </Typography>
              <Typography sx={{ fontSize: "0.62rem", color: "#94a3b8" }}>Sesión activa</Typography>
            </Box>
            <Box sx={{ ml: "auto", width: 8, height: 8, borderRadius: "50%", bgcolor: "#22c55e", animation: `${glowPulse} 2s ease-in-out infinite` }} />
          </FloatingCard>

          <FloatingCard delay="0.4s">
            <Box sx={{
              width: 36, height: 36, borderRadius: 10,
              bgcolor: "#f0fdf4", border: "1.5px solid #86efac",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <RocketLaunchOutlinedIcon sx={{ fontSize: 18, color: "#22c55e" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.70rem", fontWeight: 700, color: "#0f172a" }}>
                Sitio publicado
              </Typography>
              <Typography sx={{ fontSize: "0.62rem", color: "#94a3b8" }}>Todo en línea</Typography>
            </Box>
          </FloatingCard>

          <FloatingCard delay="0.8s">
            <Box sx={{
              width: 36, height: 36, borderRadius: 10,
              bgcolor: "#fff7ed", border: "1.5px solid #fed7aa",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <EditNoteOutlinedIcon sx={{ fontSize: 18, color: "#f97316" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.70rem", fontWeight: 700, color: "#0f172a" }}>
                Edición disponible
              </Typography>
              <Typography sx={{ fontSize: "0.62rem", color: "#94a3b8" }}>Contenido editable</Typography>
            </Box>
          </FloatingCard>
        </HeroDecor>
      </Hero>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 3 }}>

        {/* ── TIPS ─────────────────────────────────────────────── */}
        <SectionLabel>
          <AutoAwesomeIcon sx={{ fontSize: 13 }} />
          Consejos de uso
        </SectionLabel>
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {TIPS.map(({ icon: Icon, accent, title, desc }) => (
            <Grid size={{ xs: 12, md: 4 }} key={title}>
              <TipCard accent={accent}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  bgcolor: `${accent}14`, border: `1.5px solid ${accent}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon sx={{ fontSize: 20, color: accent }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.83rem", color: "#0f172a", mb: 0.4 }}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.6 }}>
                    {desc}
                  </Typography>
                </Box>
              </TipCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Page>
  );
}

export default memo(Analytics);
