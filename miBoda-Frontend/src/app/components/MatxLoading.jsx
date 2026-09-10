import { keyframes } from "@emotion/react";
import styled from "@mui/material/styles/styled";
import { appLogoUrl } from "app/utils/appLogoUrl";

/* ÔöÇÔöÇ Keyframes ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const revealMask = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
`;

const fillBar = keyframes`
  0%   { width: 0%; }
  20%  { width: 18%; }
  45%  { width: 42%; }
  70%  { width: 68%; }
  90%  { width: 88%; }
  100% { width: 95%; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0px 0px rgba(249,115,22,0); }
  50%       { box-shadow: 0 0 40px 10px rgba(249,115,22,0.25); }
`;

const spinArc = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scaleY(1);   opacity: 0.35; }
  40%            { transform: scaleY(1.7); opacity: 1; }
`;

const scanLine = keyframes`
  0%   { top: 0%; opacity: 0; }
  10%  { opacity: 0.6; }
  90%  { opacity: 0.6; }
  100% { top: 100%; opacity: 0; }
`;

const shimmerMove = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ÔöÇÔöÇ Root ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const Root = styled("div")({
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(155deg, #060c1e 0%, #0a1128 55%, #0d1a38 100%)",
  overflow: "hidden",

  /* Cuadr├¡cula de fondo */
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
  },

  /* Gradiente naranja esquina inferior-derecha */
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "50%",
    height: "60%",
    background: "radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
});

/* ÔöÇÔöÇ Logo wrapper ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const LogoWrap = styled("div")({
  position: "relative",
  width: 110,
  height: 110,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: `${fadeIn} 0.6s ease-out both`,
  marginBottom: 32,
});

/* Arco giratorio exterior */
const ArcOuter = styled("div")({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: "2.5px solid transparent",
  borderTopColor: "#f97316",
  borderRightColor: "rgba(249,115,22,0.3)",
  animation: `${spinArc} 1.4s linear infinite`,
});

/* Arco interior */
const ArcInner = styled("div")({
  position: "absolute",
  inset: 12,
  borderRadius: "50%",
  border: "2px solid transparent",
  borderTopColor: "rgba(249,115,22,0.5)",
  borderLeftColor: "rgba(255,255,255,0.25)",
  animation: `${spinArc} 2.2s linear reverse infinite`,
});

/* C├¡rculo central con logo */
const LogoCircle = styled("div")({
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "linear-gradient(145deg, #1a2a5c 0%, #0f172a 100%)",
  border: "1.5px solid rgba(249,115,22,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: `${glowPulse} 2.4s ease-in-out infinite`,
  zIndex: 1,
  overflow: "hidden",
  position: "relative",
});

/* L├¡nea de scan sobre el logo */
const ScanLine = styled("div")({
  position: "absolute",
  left: 0,
  width: "100%",
  height: "2px",
  background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.7), transparent)",
  animation: `${scanLine} 2s ease-in-out infinite`,
});

/* ÔöÇÔöÇ Texto principal ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const BrandName = styled("div")({
  fontSize: "clamp(22px, 4vw, 30px)",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  lineHeight: 1,
  background: "linear-gradient(90deg, #ffffff 0%, #f97316 50%, #ffffff 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: `${shimmerMove} 3s linear infinite, ${fadeIn} 0.7s 0.2s ease-out both`,
  fontFamily: "'Segoe UI', system-ui, sans-serif",
});

/* ÔöÇÔöÇ Tagline ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const Tagline = styled("div")({
  fontSize: "11px",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  animation: `${fadeIn} 0.7s 0.5s ease-out both`,
  marginTop: 6,
  marginBottom: 32,
});

/* ÔöÇÔöÇ Barra de progreso ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const BarTrack = styled("div")({
  width: 220,
  height: 3,
  backgroundColor: "rgba(255,255,255,0.07)",
  borderRadius: 4,
  overflow: "hidden",
  animation: `${fadeIn} 0.7s 0.7s ease-out both`,
});

const BarFill = styled("div")({
  height: "100%",
  background: "linear-gradient(90deg, #f97316, #fb923c, #fdba74)",
  borderRadius: 4,
  animation: `${fillBar} 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
});

/* ÔöÇÔöÇ Puntos indicadores ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const DotsRow = styled("div")({
  display: "flex",
  gap: 6,
  marginTop: 18,
  animation: `${fadeIn} 0.7s 0.9s ease-out both`,
});

const Dot = styled("div")(({ delay = "0s" }) => ({
  width: 4,
  height: 14,
  borderRadius: 2,
  backgroundColor: "#f97316",
  animation: `${dotBounce} 1.1s ${delay} ease-in-out infinite`,
}));

/* ÔöÇÔöÇ Etiqueta de estado ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
const StatusLabel = styled("div")({
  fontSize: "10px",
  letterSpacing: "0.2em",
  color: "rgba(249,115,22,0.7)",
  textTransform: "uppercase",
  marginTop: 14,
  animation: `${fadeIn} 0.7s 1.1s ease-out both`,
});

const ImpactoLogo = () => (
  <img
    src={appLogoUrl()}
    alt={import.meta.env.VITE_APP_NAME}
    style={{ width: 58, height: 58, objectFit: "contain" }}
  />
);

/* ÔöÇÔöÇ Componente principal ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */
export default function Loading() {
  return (
    <Root>
      <LogoWrap>
        <ArcOuter />
        <ArcInner />
        <LogoCircle>
          <ScanLine />
          <ImpactoLogo />
        </LogoCircle>
      </LogoWrap>

      <BrandName>{import.meta.env.VITE_APP_NAME}</BrandName>
      <Tagline>Invitación de Boda</Tagline>

      <BarTrack>
        <BarFill />
      </BarTrack>

      <DotsRow>
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.30s" />
        <Dot delay="0.45s" />
        <Dot delay="0.60s" />
      </DotsRow>

      <StatusLabel>Iniciando sistemaÔÇª</StatusLabel>
    </Root>
  );
}
