import React, { useEffect, useState, useRef } from "react";
import { useIntl, injectIntl } from "react-intl";
import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";

import {
  Card,
  Box,
  Checkbox,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Alert,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import styled from "@mui/material/styles/styled";
import useTheme from "@mui/material/styles/useTheme";
import LoadingButton from "@mui/lab/LoadingButton";
import MenuItem from "@mui/material/MenuItem";
import { appLogoUrl } from "app/utils/appLogoUrl";

// Icons
import EmailOutlinedIcon       from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon        from "@mui/icons-material/LockOutlined";
import VisibilityIcon          from "@mui/icons-material/Visibility";
import VisibilityOffIcon       from "@mui/icons-material/VisibilityOff";
import LoginIcon               from "@mui/icons-material/Login";
import MicrosoftIcon           from "@mui/icons-material/Microsoft";
import CircularProgress        from "@mui/material/CircularProgress";
import GoogleIcon              from "@mui/icons-material/Google";
import * as authProveedorApi   from "../../../api/authProveedor.api";
import * as authUsuarioConfigApi from "../../../api/authUsuarioConfig.api";
import PersonOutlineIcon       from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon       from "@mui/icons-material/BadgeOutlined";
import SecurityIcon            from "@mui/icons-material/Security";
import RocketLaunchIcon        from "@mui/icons-material/RocketLaunch";
import TrendingUpIcon          from "@mui/icons-material/TrendingUp";
import DevicesIcon             from "@mui/icons-material/Devices";
import VerifiedIcon            from "@mui/icons-material/Verified";
import HttpsOutlinedIcon       from "@mui/icons-material/HttpsOutlined";

import useAuth from "app/hooks/useAuth";
import { Paragraph } from "app/components/Typography";
import QuickResumeLogin from "./QuickResumeLogin";
import { getStoredRefreshToken } from "app/utils/authStorage";
import { clearLastSessionUser, getLastSessionUser } from "app/utils/authLastSession";
import { clear2faChallenge } from "app/utils/authChallengeStorage";

import { obtener_lista as obtener_perfiles } from "../../../api/perfiles.api";
import { obtener_lista as obtener_roles }    from "../../../api/roles.api";
import { WithLoandingPanel }                 from "../../../utils/withLoandingPanel";
import { handleInfoMessages, toastInfo }     from "../../../components/notify-messages";

/* ── Espacio: estrellas nítidas + naves + meteoros + destellos ───── */
const GalaxyLayer = () => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      /* Re-posicionar estrellas al cambiar tamaño */
      stars.forEach((s) => {
        s.x = Math.random() * canvas.width;
        s.y = Math.random() * canvas.height;
      });
    };

    const rng  = (a, b) => a + Math.random() * (b - a);
    const PI2  = Math.PI * 2;

    /* ── ESTRELLAS — alfa mínima 0.55 para que sean nítidas ── */
    const STAR_PAL = [
      [255, 255, 255],
      [190, 215, 255],
      [255, 215, 160],
      [210, 175, 255],
      [150, 240, 255],
    ];
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * (window.innerWidth  || 1400),
      y: Math.random() * (window.innerHeight || 900),
      r:  rng(0.5, 1.6),
      baseAlpha:    rng(0.70, 1.0),
      twinkleSpd:   rng(0.6, 2.8),
      twinklePhase: rng(0, PI2),
      col: STAR_PAL[Math.floor(Math.random() * STAR_PAL.length)],
    }));

    /* ── NAVES pequeñas ── */
    const SHIP_COLS = [
      "249,115,22",    // naranja
      "99,102,241",    // índigo
      "14,165,233",    // celeste
      "255,220,80",    // dorado
    ];
    const ships = Array.from({ length: 7 }, (_, i) => {
      const spd  = rng(0.25, 0.55);
      const ang  = rng(0, PI2);
      const col  = SHIP_COLS[i % SHIP_COLS.length];
      return {
        x: rng(0.05, 0.95) * (window.innerWidth  || 1400),
        y: rng(0.05, 0.95) * (window.innerHeight || 900),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: rng(5, 11),
        angle: ang,
        col,
        gph: rng(0, PI2),   /* fase motor */
      };
    });

    const drawShip = (s, t) => {
      const { x, y, size: sz, angle, col, gph } = s;
      const eng = 0.55 + 0.45 * Math.sin(t * 4 + gph);   // pulso motor
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      /* halo motor */
      const halo = ctx.createRadialGradient(-sz * 0.9, 0, 0, -sz * 0.9, 0, sz * 2.2);
      halo.addColorStop(0, `rgba(${col},${(eng * 0.85).toFixed(2)})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(-sz * 0.9, 0, sz * 2.2, 0, PI2);
      ctx.fill();

      /* fuselaje */
      ctx.fillStyle = "rgba(215,230,255,0.95)";
      ctx.beginPath();
      ctx.moveTo( sz * 1.3,  0);
      ctx.lineTo(-sz * 0.7,  sz * 0.38);
      ctx.lineTo(-sz * 1.0,  0);
      ctx.lineTo(-sz * 0.7, -sz * 0.38);
      ctx.closePath();
      ctx.fill();

      /* alas superior e inferior */
      ctx.fillStyle = "rgba(160,195,255,0.82)";
      ctx.beginPath();
      ctx.moveTo(sz * 0.1, 0);
      ctx.lineTo(-sz * 0.5,  sz * 1.0);
      ctx.lineTo(-sz * 0.75, sz * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sz * 0.1, 0);
      ctx.lineTo(-sz * 0.5, -sz * 1.0);
      ctx.lineTo(-sz * 0.75,-sz * 0.55);
      ctx.closePath();
      ctx.fill();

      /* cabina coloreada */
      ctx.fillStyle = `rgba(${col},0.95)`;
      ctx.beginPath();
      ctx.arc(sz * 0.45, 0, sz * 0.28, 0, PI2);
      ctx.fill();

      /* llamarada motor */
      ctx.fillStyle = `rgba(${col},${(eng * 0.72).toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(-sz * 1.0,  sz * 0.18);
      ctx.lineTo(-sz * (1.0 + eng * 1.4), 0);
      ctx.lineTo(-sz * 1.0, -sz * 0.18);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    /* ── METEOROS ── */
    const meteors  = [];
    let lastMeteor = 0;
    let nextMeteor = rng(1.5, 4);

    /* ── DESTELLOS ── */
    const bursts  = [];
    let lastBurst = 0;
    let nextBurst = rng(2, 5);
    const BURST_COLS = [
      "249,115,22", "255,255,255", "99,102,241",
      "14,165,233", "255,215,80",
    ];

    const spawnBurst = (W, H) => {
      bursts.push({
        x: rng(0.08, 0.92) * W,
        y: rng(0.08, 0.88) * H,
        maxR:  rng(45, 110),
        alpha: rng(0.70, 1.00),
        life:  1.0,
        rays:  Math.floor(rng(7, 14)),
        rotO:  rng(0, PI2),
        col:   BURST_COLS[Math.floor(Math.random() * BURST_COLS.length)],
      });
    };

    const drawBurst = (b) => {
      const prog  = 1 - b.life;
      const rad   = b.maxR * prog;
      const alpha = b.life * b.alpha;
      /* círculo central */
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
      g.addColorStop(0,   `rgba(${b.col},${Math.min(1, alpha).toFixed(2)})`);
      g.addColorStop(0.35,`rgba(${b.col},${(alpha * 0.55).toFixed(2)})`);
      g.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rad, 0, PI2);
      ctx.fill();
      /* rayos */
      for (let i = 0; i < b.rays; i++) {
        const a    = (i / b.rays) * PI2 + b.rotO;
        const rLen = b.maxR * 2.0 * prog;
        ctx.strokeStyle = `rgba(${b.col},${(alpha * 0.6).toFixed(2)})`;
        ctx.lineWidth   = Math.max(0.4, 1.6 * b.life);
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(a) * rad * 0.45, b.y + Math.sin(a) * rad * 0.45);
        ctx.lineTo(b.x + Math.cos(a) * rLen,        b.y + Math.sin(a) * rLen);
        ctx.stroke();
      }
    };

    const t0 = Date.now();

    const draw = () => {
      const t = (Date.now() - t0) / 1000;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* ── ESTRELLAS ── */
      stars.forEach((s) => {
        const tw  = 0.45 + 0.55 * Math.sin(t * s.twinkleSpd + s.twinklePhase);
        const al  = Math.max(0.40, s.baseAlpha * tw);
        const [r, g, b] = s.col;

          /* núcleo nítido — sin halo borroso */
        ctx.fillStyle = `rgba(${r},${g},${b},${al.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, PI2);
        ctx.fill();

        /* cruceta sutil solo en las más brillantes */
        if (s.r > 1.2 && tw > 0.78) {
          const len   = s.r * 5;
          const spkAl = (tw - 0.78) * 4 * al * 0.5;
          ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.7, spkAl).toFixed(2)})`;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
          ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
          ctx.stroke();
        }
      });

      /* ── METEOROS ── */
      if (t - lastMeteor > nextMeteor) {
        lastMeteor  = t;
        nextMeteor  = rng(1.5, 5);
        const count = Math.random() > 0.65 ? 2 : 1;
        for (let m = 0; m < count; m++) {
          const ang = rng(18, 38) * Math.PI / 180;
          meteors.push({
            x:   rng(0.05, 0.80) * W,
            y:   rng(0.02, 0.42) * H,
            vx:  Math.cos(ang) * rng(11, 20),
            vy:  Math.sin(ang) * rng(11, 20),
            len: rng(130, 300),
            w:   rng(1.6, 3.2),
            life: 1.0,
            col: Math.random() > 0.45 ? "255,255,255" : "180,215,255",
          });
        }
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x    += m.vx;
        m.y    += m.vy;
        m.life -= 0.017;
        if (m.life <= 0 || m.x > W + 80 || m.y > H + 80) {
          meteors.splice(i, 1); continue;
        }
        const trail = ctx.createLinearGradient(
          m.x - m.vx / Math.hypot(m.vx, m.vy) * m.len,
          m.y - m.vy / Math.hypot(m.vx, m.vy) * m.len,
          m.x, m.y
        );
        trail.addColorStop(0,   "rgba(0,0,0,0)");
        trail.addColorStop(0.55,`rgba(${m.col},${(m.life * 0.55).toFixed(2)})`);
        trail.addColorStop(1,   `rgba(${m.col},${Math.min(1, m.life * 1.3).toFixed(2)})`);
        ctx.strokeStyle = trail;
        ctx.lineWidth   = m.w * m.life;
        ctx.lineCap     = "round";
        ctx.beginPath();
        const nx = m.vx / Math.hypot(m.vx, m.vy);
        const ny = m.vy / Math.hypot(m.vx, m.vy);
        ctx.moveTo(m.x - nx * m.len, m.y - ny * m.len);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        /* cabeza brillante */
        const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 10 * m.life);
        head.addColorStop(0, `rgba(${m.col},${Math.min(1, m.life * 1.6).toFixed(2)})`);
        head.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 10 * m.life, 0, PI2);
        ctx.fill();
      }

      /* ── DESTELLOS ── */
      if (t - lastBurst > nextBurst) {
        lastBurst = t;
        nextBurst = rng(2, 6);
        spawnBurst(W, H);
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].life -= 0.011;
        if (bursts[i].life <= 0) { bursts.splice(i, 1); continue; }
        drawBurst(bursts[i]);
      }

      /* ── NAVES ── */
      ships.forEach((ship) => {
        ship.x += ship.vx;
        ship.y += ship.vy;
        ship.gph += 0.09;
        if (ship.x < -60) ship.x = W + 60;
        if (ship.x > W + 60) ship.x = -60;
        if (ship.y < -60) ship.y = H + 60;
        if (ship.y > H + 60) ship.y = -60;
        drawShip(ship, t);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        zIndex: 1, pointerEvents: "none",
      }}
    />
  );
};

const StyledRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "linear-gradient(145deg, #060d1f 0%, #0d1730 40%, #080e20 100%)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.065) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
    pointerEvents: "none",
    zIndex: 0,
  },
}));

/* ── Blobs aurora — movimiento autónomo ────────────────────────── */
const BLOBS_CFG = [
  { color: "rgba(99,102,241,0.22)",  size: 680, bx: 12, by: 10, spd: 0.55, phase: 0,   ampX: 55, ampY: 40 },
  { color: "rgba(249,115,22,0.17)",  size: 560, bx: 85, by: 78, spd: 0.38, phase: 1.8, ampX: 60, ampY: 50 },
  { color: "rgba(14,165,233,0.15)",  size: 470, bx: 62, by: 18, spd: 0.65, phase: 3.4, ampX: 45, ampY: 55 },
  { color: "rgba(168,85,247,0.13)",  size: 380, bx: 30, by: 72, spd: 0.48, phase: 5.1, ampX: 50, ampY: 40 },
  { color: "rgba(249,115,22,0.09)",  size: 300, bx: 75, by: 40, spd: 0.80, phase: 2.2, ampX: 35, ampY: 45 },
];

const LoginBackground = () => {
  const refsArr = useRef([]);
  const raf     = useRef(null);
  const t0      = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const t = (Date.now() - t0.current) / 1000;

      refsArr.current.forEach((el, i) => {
        if (!el) return;
        const c  = BLOBS_CFG[i];
        const fx = Math.sin(t * c.spd + c.phase) * c.ampX;
        const fy = Math.cos(t * c.spd * 0.72 + c.phase) * c.ampY;
        el.style.transform = `translate(${fx}px, ${fy}px)`;
      });
      raf.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      {BLOBS_CFG.map((b, i) => (
        <Box
          key={i}
          ref={(el) => { refsArr.current[i] = el; }}
          sx={{
            position: "absolute",
            width: b.size, height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
            left: `${b.bx}%`, top: `${b.by}%`,
            filter: "blur(72px)",
            willChange: "transform",
          }}
        />
      ))}
      {/* Vignette perimetral */}
      <Box sx={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(4,7,18,0.65) 100%)",
        pointerEvents: "none",
      }} />
    </Box>
  );
};

/* Main card */
const StyledCard = styled(Card)(() => ({
  maxWidth: 980,
  width: "100%",
  margin: "1.5rem",
  display: "flex",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px rgba(99,102,241,0.10)",
  position: "relative",
  zIndex: 1,
  "@keyframes cardIn": {
    from: { opacity: 0, transform: "translateY(40px) scale(0.97)" },
    to:   { opacity: 1, transform: "translateY(0) scale(1)" },
  },
  animation: "cardIn 0.75s cubic-bezier(0.16,1,0.3,1) forwards",
}));

/* ── LEFT — brand panel ────────────────────────────────────────── */
const BrandPanel = styled(Box)(() => ({
  background: "linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0d1a38 75%, #1a0f05 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "3rem 2.5rem",
  position: "relative",
  overflow: "hidden",
  height: "100%",
  minHeight: 520,

  /* Patrón de puntos sobre el panel oscuro */
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(circle, rgba(249,115,22,0.10) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
    pointerEvents: "none",
  },
  /* Brillo naranja esquina inferior */
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-60px", right: "-60px",
    width: 220, height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%)",
    pointerEvents: "none",
  },
}));

/* Logo container — fondo blanco como solicitó el usuario */
const LogoRing = styled(Box)(() => ({
  width: 120,
  height: 120,
  borderRadius: "26px",
  background: "#ffffff",
  border: "2.5px solid rgba(249,115,22,0.50)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1.6rem",
  boxShadow: "0 8px 40px rgba(249,115,22,0.28), 0 2px 12px rgba(0,0,0,0.25)",
  position: "relative",
  zIndex: 1,
  "& img": { width: "72%", height: "auto", objectFit: "contain" },
}));

/* Orange accent divider */
const OrangeBar = styled(Box)(() => ({
  height: 3,
  width: "60px",
  background: "linear-gradient(90deg, #f97316, #fb923c)",
  borderRadius: "4px",
  margin: "1.2rem auto",
  "@keyframes barIn": {
    from: { transform: "scaleX(0)", transformOrigin: "left" },
    to:   { transform: "scaleX(1)", transformOrigin: "left" },
  },
  animation: "barIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both",
}));

/* Feature item — texto blanco para panel oscuro */
const FeatureItem = ({ icon: Icon, text, delay }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.5,
    mb: 1.4, position: "relative", zIndex: 1,
    "@keyframes fadeRight": {
      from: { opacity: 0, transform: "translateX(-20px)" },
      to:   { opacity: 1, transform: "translateX(0)" },
    },
    animation: "fadeRight 0.6s ease both",
    animationDelay: delay,
  }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: "9px",
      bgcolor: "rgba(249,115,22,0.15)",
      border: "1px solid rgba(249,115,22,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon sx={{ color: "#fb923c", fontSize: 17 }} />
    </Box>
    <Typography sx={{ color: "rgba(255,255,255,0.80)", fontSize: "0.82rem", fontWeight: 500 }}>
      {text}
    </Typography>
  </Box>
);

/* ── RIGHT — form panel ────────────────────────────────────────── */
const FormPanel = styled(Box)(() => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "3rem 2.8rem",
  backgroundColor: "#ffffff",
  position: "relative",
}));

/* Orange focus TextField */
const NeoField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    transition: "all 0.25s ease",
    "&:hover": { backgroundColor: "#f1f5f9" },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(249,115,22,0.18)",
    },
    "& fieldset":              { borderColor: "#e2e8f0", borderWidth: "1.5px" },
    "&:hover fieldset":        { borderColor: "#f97316" },
    "&.Mui-focused fieldset":  { borderColor: "#f97316" },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    "&.Mui-focused": { color: "#f97316" },
  },
}));

/* Orange CTA button with shimmer */
const OrangeButton = styled(LoadingButton)(() => ({
  borderRadius: "14px",
  padding: "13px 24px",
  fontSize: "1rem",
  fontWeight: 700,
  textTransform: "none",
  background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #f97316 100%)",
  backgroundSize: "200% auto",
  boxShadow: "0 6px 24px rgba(249,115,22,0.45)",
  transition: "all 0.35s ease",
  "@keyframes shimmerBtn": {
    from: { backgroundPosition: "200% center" },
    to:   { backgroundPosition: "-200% center" },
  },
  "&:hover": {
    animation: "shimmerBtn 1.5s linear infinite",
    boxShadow: "0 10px 32px rgba(249,115,22,0.60)",
    transform: "translateY(-2px)",
  },
  "&:active": { transform: "translateY(0)" },
  "&.Mui-disabled": { background: "#e0e6ed", boxShadow: "none" },
}));

/* Method selector card */
const MethodCard = styled(Box)(({ selected }) => ({
  padding: "12px 16px",
  borderRadius: "12px",
  border: `2px solid ${selected ? "#f97316" : "#e2e8f0"}`,
  backgroundColor: selected ? "rgba(249,115,22,0.06)" : "#fafbfc",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  transition: "all 0.2s ease",
  marginBottom: "10px",
  "&:hover": {
    borderColor: "#f97316",
    backgroundColor: "rgba(249,115,22,0.04)",
  },
}));

/* Slide-in wrapper for form elements */
const SlideIn = styled(Box)(({ delay = "0s" }) => ({
  "@keyframes fadeUp": {
    from: { opacity: 0, transform: "translateY(18px)" },
    to:   { opacity: 1, transform: "translateY(0)" },
  },
  animation: "fadeUp 0.5s ease both",
  animationDelay: delay,
}));

/* ─────────────────────────────────────────────────────────────────
   VALIDATION & INITIAL VALUES
───────────────────────────────────────────────────────────────── */
const initialValues = { email: "", password: "", remember: true };

const validationSchema = Yup.object().shape({
  password: Yup.string().min(6, "Mínimo 6 caracteres").required("Requerida"),
});

/** Desarrollo: ocultar campo correo y/o forzar solo botón Google (ver .env). */
const LOGIN_OCULTAR_EMAIL =
  import.meta.env.VITE_LOGIN_OCULTAR_EMAIL === "true" ||
  import.meta.env.VITE_LOGIN_OCULTAR_EMAIL === "1";
const LOGIN_SOLO_GOOGLE =
  import.meta.env.VITE_LOGIN_SOLO_GOOGLE === "true" ||
  import.meta.env.VITE_LOGIN_SOLO_GOOGLE === "1";
const LOGIN_EMAIL_FIJO = (import.meta.env.VITE_LOGIN_EMAIL_FIJO || "").trim().toLowerCase();

/** Marca que el usuario pidió cambiar de cuenta (no forzar 2FA de sesión anterior). */
const AUTH_ALTERNATE_ACCOUNT_KEY = "authAlternateAccount";

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
const JwtLogin = (props) => {
  const { setLoading } = props;
  const intl           = useIntl();
  const theme          = useTheme();
  const navigate       = useNavigate();

  const [listarDatosPerfiles, setListarDatosPerfiles] = useState([]);
  const [listarDatosRoles,    setListarDatosRoles]    = useState([]);
  const [idPerfils,   setIdPerfils]   = useState(0);
  const [idEmail,     setEmail]       = useState(0);
  const [idPassword,  setPassword]    = useState(0);
  const [countInfo,   setCountInfo]   = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [metodosAuth, setMetodosAuth] = useState([]);
  const [metodosGlobales, setMetodosGlobales] = useState([]);
  const [loginMode,   setLoginMode]   = useState("local");
  const [oauthLoading, setOauthLoading] = useState(null);
  const [loginEmail, setLoginEmail] = useState(LOGIN_EMAIL_FIJO || "");
  const [emailParaMetodos, setEmailParaMetodos] = useState("");
  const [requiere2faUsuario, setRequiere2faUsuario] = useState(false);
  const [cargandoMetodosEmail, setCargandoMetodosEmail] = useState(false);
  const [formToShow,  setFormToShow]  = useState("login");
  const [alternateAccountMode, setAlternateAccountMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isProcessing = useRef(false);

  const { login, user, perfil, logout, validar_perfil, resumeSession, switchAccount, isAuthenticated, isInitialized: authInitialized } = useAuth();
  const [autoResuming, setAutoResuming] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    authProveedorApi.metodosLogin()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setMetodosGlobales(arr);
        setMetodosAuth(arr);
        const pred = arr.find((m) => m.is_predeterminado);
        if (pred?.codigo) setLoginMode(pred.codigo);
      })
      .catch((e) => {
        if (e?.userMessage && LOGIN_SOLO_GOOGLE) {
          console.warn('[login]', e.userMessage);
        }
        const fallback = LOGIN_SOLO_GOOGLE
          ? [{ codigo: "google", nombre: "Google", is_habilitado: true, is_predeterminado: true }]
          : [{ codigo: "local", nombre: "Local", is_habilitado: true, is_predeterminado: true }];
        setMetodosGlobales(fallback);
        setMetodosAuth(fallback);
        if (LOGIN_SOLO_GOOGLE) setLoginMode("google");
      });
  }, []);

  const aplicarMetodosUsuario = (result) => {
    const metodos = Array.isArray(result?.metodos) ? result.metodos : [];
    setMetodosAuth(metodos.length ? metodos : metodosGlobales);
    setRequiere2faUsuario(!!result?.requiere_2fa);

    if (LOGIN_SOLO_GOOGLE) {
      if (metodos.some((m) => m.codigo === "google" && m.is_habilitado)) {
        setLoginMode("google");
      }
      return;
    }

    const predCodigo = result?.config?.metodo_predeterminado;
    const pred = predCodigo
      ? metodos.find((m) => m.codigo === predCodigo)
      : metodos.find((m) => m.is_predeterminado) || metodos[0];
    if (pred?.codigo) setLoginMode(pred.codigo);
    else if (metodos.length === 1) setLoginMode(metodos[0].codigo);
  };

  const cargarMetodosPorEmail = async (email, force = false) => {
    const trimmed = (email || "").trim().toLowerCase();
    if (!trimmed || (!force && trimmed === emailParaMetodos)) {
      return null;
    }
    setEmailParaMetodos(trimmed);
    setCargandoMetodosEmail(true);
    try {
      const result = await authUsuarioConfigApi.metodosPorEmail(trimmed);
      aplicarMetodosUsuario(result);
      return result;
    } catch {
      setMetodosAuth(metodosGlobales);
      setRequiere2faUsuario(false);
      return null;
    } finally {
      setCargandoMetodosEmail(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_ALTERNATE_ACCOUNT_KEY) === "1") {
      setAlternateAccountMode(true);
      return;
    }
    if (LOGIN_OCULTAR_EMAIL && LOGIN_EMAIL_FIJO) {
      cargarMetodosPorEmail(LOGIN_EMAIL_FIJO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar con email fijo .env
  }, []);

  /** Si hay sesión guardada, entrar sin abrir Google (como Gmail). */
  useEffect(() => {
    if (!authInitialized || !getStoredRefreshToken() || isAuthenticated || user) return;
    if (sessionStorage.getItem(AUTH_ALTERNATE_ACCOUNT_KEY) === "1") return;

    let cancelled = false;
    const safetyTimer = setTimeout(() => {
      if (!cancelled) setAutoResuming(false);
    }, 15000);

    (async () => {
      setAutoResuming(true);
      try {
        await resumeSession();
        if (!cancelled) setIsInitialized(true);
      } catch {
        /* sin refresh válido: el usuario pulsa Continuar */
      } finally {
        if (!cancelled) setAutoResuming(false);
        clearTimeout(safetyTimer);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [resumeSession, isAuthenticated, authInitialized, user]);

  const handleOAuthLogin = async (proveedor, { skipMetodoCheck = false, alternateAccount = false } = {}) => {
    if (!skipMetodoCheck && !metodoHabilitado(proveedor)) {
      const emailHint = (LOGIN_EMAIL_FIJO || loginEmail || emailParaMetodos || "").trim();
      toastInfo(
        emailHint
          ? `La cuenta ${emailHint} no tiene permitido iniciar sesión con ${proveedor}. Actívelo en Usuarios → Configuración de acceso → Guardar.`
          : `Este método no está habilitado. Ingrese su correo primero o configúrelo en el panel de usuarios.`
      );
      return;
    }
    if (alternateAccount) {
      clear2faChallenge();
      sessionStorage.removeItem(AUTH_ALTERNATE_ACCOUNT_KEY);
    }
    setOauthLoading(proveedor);
    try {
      // Otra cuenta: sin login_hint para que Google muestre el selector de cuentas
      const hint = alternateAccount
        ? null
        : (
            LOGIN_EMAIL_FIJO ||
            loginEmail ||
            emailParaMetodos ||
            getLastSessionUser()?.email ||
            ""
          ).trim() || null;
      const { authorization_url } = await authProveedorApi.oauthRedirect(proveedor, hint);
      if (authorization_url) {
        window.location.assign(authorization_url);
        return;
      }
      toastInfo("No se recibió URL de Google. Revise la configuración OAuth del sistema.");
    } catch (e) {
      toastInfo(e?.userMessage || e?.response?.data?.message || "No se pudo iniciar sesión.");
    } finally {
      setOauthLoading(null);
    }
  };

  const metodoHabilitado = (codigo) => !!metodosAuth.find((x) => x.codigo === codigo)?.is_habilitado;

  /** Modo solo Google: siempre mostrar botón (correo .env opcional; no depender de metodos-login). */
  const showSoloGoogleButton = LOGIN_SOLO_GOOGLE;

  useEffect(() => {
    if (!isInitialized && user) { setIsInitialized(true); handleUserChange(); }
  }, [user]);

  useEffect(() => {
    if (isInitialized) handleUserChange();
  }, [user, perfil]);

  const enPaginaSignin = () => /\/session\/signin/.test(window.location.pathname || "");

  const handleUserChange = async () => {
    if (isProcessing.current) return;
    if (!user) {
      setFormToShow("login");
      setLoading(false);
      return;
    }
    const sinPerfilValido =
      perfil === false ||
      typeof user?.count === "undefined" ||
      !user.count ||
      user.count === 0;

    if (sinPerfilValido) {
      if (enPaginaSignin()) {
        toastInfo(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.FALTA.PERFIL_ASIGNADO" }));
        setFormToShow("login");
        setLoading(false);
        return;
      }
      toastInfo(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.FALTA.PERFIL_ASIGNADO" }));
      isProcessing.current = true;
      await logout();
      isProcessing.current = false;
      return;
    }
    if (user.count > 1) {
      isProcessing.current = true;
      try { await listarPerfiles(); setFormToShow("profile"); } finally { isProcessing.current = false; setLoading(false); }
      return;
    }
    if (user.count === 1) {
      setLoading(false);
      navigate("/dashboard/default");
    }
  };

  const handleQuickResume = async () => {
    if (!getStoredRefreshToken()) return false;
    isProcessing.current = true;
    try {
      setLoading(true);
      await resumeSession();
      setIsInitialized(true);
      return true;
    } catch (e) {
      toastInfo(e?.response?.data?.message || "Su sesión expiró. Inicie sesión de nuevo con Google.");
      return false;
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  /** Clic en tarjeta de cuenta: reanudar sesión o abrir Google/contraseña. */
  const handleContinueAs = async (lastUser) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    const email = (lastUser?.email || LOGIN_EMAIL_FIJO || loginEmail || "").trim().toLowerCase();
    if (!email) {
      toastInfo("No hay correo asociado a esta cuenta.");
      isProcessing.current = false;
      return;
    }

    try {
      setLoading(true);
      if (getStoredRefreshToken()) {
        const ok = await handleQuickResume();
        if (ok) return;
      }

      setLoginEmail(email);
      const result = await cargarMetodosPorEmail(email, true);
      const metodos = Array.isArray(result?.metodos) ? result.metodos : metodosAuth;
      const googleOk = metodos.some((m) => m.codigo === "google" && m.is_habilitado);
      const localOk = metodos.some((m) => m.codigo === "local" && m.is_habilitado);
      const msOk = metodos.some((m) => m.codigo === "microsoft" && m.is_habilitado);

      const preferGoogle =
        LOGIN_SOLO_GOOGLE || lastUser?.login_method === "google" || (!localOk && googleOk);

      if (preferGoogle && googleOk) {
        toastInfo("Su sesión expiró. Reconectando con Google…");
        await handleOAuthLogin("google", { skipMetodoCheck: true });
        return;
      }
      if (lastUser?.login_method === "microsoft" && msOk && !LOGIN_SOLO_GOOGLE) {
        toastInfo(`Conectando con Microsoft (${email})…`);
        await handleOAuthLogin("microsoft", { skipMetodoCheck: true });
        return;
      }
      if (localOk && !LOGIN_SOLO_GOOGLE) {
        setLoginMode("local");
        toastInfo("Ingrese su contraseña para continuar.");
        return;
      }
      if (googleOk) {
        toastInfo(`Conectando con Google (${email})…`);
        await handleOAuthLogin("google", { skipMetodoCheck: true });
        return;
      }

      toastInfo(
        `La cuenta ${email} no tiene métodos de acceso habilitados. Configure Google en Usuarios → Configuración de acceso.`
      );
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  const handleSwitchAccount = () => {
    clear2faChallenge();
    switchAccount();
    clearLastSessionUser();
    sessionStorage.setItem(AUTH_ALTERNATE_ACCOUNT_KEY, "1");
    setAlternateAccountMode(true);
    setEmailParaMetodos("");
    setLoginEmail("");
    setRequiere2faUsuario(false);
    setMetodosAuth(metodosGlobales);
    navigate("/session/signin", { replace: true });
    toastInfo("Seleccione otra cuenta de Google para continuar.");
  };

  const handleFormSubmit = async (values) => {
    isProcessing.current = true;
    try {
      const email = (loginEmail || values.email || "").trim();
      if (!email) {
        toastInfo("Ingrese su correo electrónico.");
        return;
      }
      setLoading(true); setEmail(email); setPassword(values.password);
      const result = await login(email, values.password, values.remember);
      if (result?.requires2faSetup) {
        navigate("/session/two-factor-setup", { replace: true });
        return;
      }
      if (result?.requires2fa) {
        navigate("/session/two-factor", { replace: true });
        return;
      }
      setIsInitialized(true);
    } catch (e) {
      setFormToShow("login");
    } finally {
      setLoading(false); isProcessing.current = false;
    }
  };

  async function listarPerfiles() {
    setLoading(true);
    try { const list = await obtener_perfiles({ id_usuario: user.id }); setListarDatosPerfiles(list); }
    finally { setLoading(false); }
  }

  async function listarRoles(id_perfil) {
    setLoading(true);
    try { const list = await obtener_roles({ id_perfil }); setListarDatosRoles(list); }
    finally { setLoading(false); }
  }

  const onChangePerfil = (e) => { setIdPerfils(e.target.value); listarRoles(e.target.value); };

  const onChangeRoles = async (e) => {
    isProcessing.current = true;
    try {
      setLoading(true); await validar_perfil(idPerfils, e.target.value); navigate("/dashboard/default");
    } catch (e) { /* noop */ } finally { setLoading(false); isProcessing.current = false; }
  };

  /* ── JSX ── */
  if (isAuthenticated && user?.count === 1) {
    return <Navigate to="/dashboard/default" replace />;
  }

  return (
    <StyledRoot>
      <LoginBackground />
      <GalaxyLayer />
      <StyledCard>
        <Grid container sx={{ minHeight: "100%", width: "100%" }}>

          {/* ── LEFT brand panel (visible solo en login) ── */}
          {formToShow === "login" && (
            <Grid size={{ md: 5, xs: 12 }} sx={{ display: { xs: "none", md: "block" } }}>
              <BrandPanel>
                {/* Logo */}
                <LogoRing sx={{ position: "relative", zIndex: 1 }}>
                  <img src={appLogoUrl()} alt="Logo" />
                </LogoRing>

                {/* Brand name */}
                <Typography variant="h5" fontWeight={900} textAlign="center"
                  sx={{
                    color: "#ffffff", letterSpacing: "-0.5px", lineHeight: 1.2,
                    position: "relative", zIndex: 1,
                    "@keyframes fadeDown": {
                      from: { opacity: 0, transform: "translateY(-12px)" },
                      to:   { opacity: 1, transform: "translateY(0)" },
                    },
                    animation: "fadeDown 0.6s ease 0.2s both",
                  }}>
                  Amour Spa
                </Typography>

                <Typography sx={{
                  color: "rgba(255,255,255,0.50)", fontSize: "0.72rem", fontWeight: 600,
                  letterSpacing: "0.12em", textTransform: "uppercase", mt: 0.6, mb: 0,
                  position: "relative", zIndex: 1,
                }}>
                  Panel de Administración
                </Typography>

                <OrangeBar />

                {/* Features */}
                <Box sx={{ mt: 0.5, width: "100%" }}>
                  <FeatureItem icon={DevicesIcon}     text="Masajes & rituales de bienestar"  delay="0.5s" />
                  <FeatureItem icon={TrendingUpIcon}  text="Reservas por WhatsApp"            delay="0.65s" />
                  <FeatureItem icon={RocketLaunchIcon} text="Experiencia de relajación"       delay="0.80s" />
                </Box>

                {/* Version chip */}
                <Chip
                  label={`V. ${import.meta.env.VITE_APP_VERSION ?? "1.0"}`}
                  size="small"
                  sx={{
                    mt: 3, bgcolor: "rgba(249,115,22,0.18)", color: "#fb923c",
                    fontWeight: 700, fontSize: "0.65rem",
                    border: "1px solid rgba(249,115,22,0.40)",
                    position: "relative", zIndex: 1,
                  }}
                />
              </BrandPanel>
            </Grid>
          )}

          {/* ── RIGHT form panel ── */}
          <Grid
            size={formToShow === "profile" ? { md: 12, xs: 12 } : { md: 7, xs: 12 }}
            sx={formToShow === "profile" ? { display: "flex", justifyContent: "center", alignItems: "center" } : undefined}
          >
            <FormPanel>

              {/* Mobile logo */}
              {formToShow === "login" && (
                <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
                  <img src={appLogoUrl()} alt="Logo" style={{ width: 72, height: "auto" }} />
                </Box>
              )}

              {/* ── LOGIN FORM ── */}
              {formToShow === "login" && (
                <>
                  {/* Header */}
                  <SlideIn delay="0s" sx={{ mb: 0.5 }}>
                    <Typography variant="h4" fontWeight={900} sx={{ color: "#0d1b3e", letterSpacing: "-0.5px" }}>
                      Iniciar Sesión
                    </Typography>
                    {/* Orange underline */}
                    <Box sx={{
                      mt: 0.7, mb: 0.4,
                      height: "3px", width: "52px", borderRadius: "4px",
                      background: "linear-gradient(90deg, #f97316, #fb923c)",
                      "@keyframes lineIn": { from: { width: 0 }, to: { width: "52px" } },
                      animation: "lineIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both",
                    }} />
                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                      {alternateAccountMode
                        ? "Elija otra cuenta de Google para ingresar al panel"
                        : LOGIN_OCULTAR_EMAIL
                          ? LOGIN_SOLO_GOOGLE
                            ? "Inicie sesión con su cuenta Google"
                            : "Métodos de acceso configurados para su cuenta"
                          : "Ingrese su correo para ver los métodos habilitados para su cuenta"}
                    </Typography>
                  </SlideIn>

                  <SlideIn delay="0.04s">
                    {autoResuming && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <CircularProgress size={20} sx={{ color: "#f97316" }} />
                        <Typography variant="body2" color="text.secondary">
                          Restaurando su sesión…
                        </Typography>
                      </Box>
                    )}
                    {!alternateAccountMode && (
                      <QuickResumeLogin
                        onContinue={handleContinueAs}
                        onSwitchAccount={handleSwitchAccount}
                        loading={oauthLoading === "google"}
                      />
                    )}
                  </SlideIn>

                  {!LOGIN_OCULTAR_EMAIL && (
                    <SlideIn delay="0.08s" sx={{ mt: 2 }}>
                      <NeoField
                        fullWidth
                        size="medium"
                        type="email"
                        label="Correo electrónico"
                        variant="outlined"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (!e.target.value.trim()) {
                            setEmailParaMetodos("");
                            setMetodosAuth(metodosGlobales);
                            setRequiere2faUsuario(false);
                          }
                        }}
                        onBlur={(e) => cargarMetodosPorEmail(e.target.value)}
                        sx={{ mb: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </SlideIn>
                  )}

                  {requiere2faUsuario && !(LOGIN_SOLO_GOOGLE && LOGIN_OCULTAR_EMAIL) && (
                    <SlideIn delay="0.08s">
                      <Alert severity="info" sx={{ mt: 1, mb: 0.5 }}>
                        Su cuenta requiere verificación en dos pasos (código QR) al iniciar sesión.
                      </Alert>
                    </SlideIn>
                  )}

                  {!LOGIN_OCULTAR_EMAIL && !emailParaMetodos && (
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 1 }}>
                      Escriba su correo y salga del campo para ver sus métodos de acceso.
                    </Typography>
                  )}

                  {emailParaMetodos && metodosAuth.length === 0 && !cargandoMetodosEmail && (
                    <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
                      No hay métodos de acceso disponibles para este usuario. Revise la configuración del usuario
                      y que el método esté habilitado en Configuración → Acceso Google (sistema).
                    </Alert>
                  )}

                  {/* Solo Google: una sola opción (tarjeta Continuar arriba); sin contraseña ni selector extra */}
                  {!LOGIN_SOLO_GOOGLE && (
                  <SlideIn
                    delay="0.1s"
                    sx={{
                      mt: 1.5,
                      mb: 0.5,
                      display: LOGIN_OCULTAR_EMAIL || emailParaMetodos ? "block" : "none",
                    }}
                  >
                    {cargandoMetodosEmail && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="text.secondary">Cargando métodos…</Typography>
                      </Box>
                    )}
                    {metodoHabilitado("local") && !LOGIN_SOLO_GOOGLE && (
                      <MethodCard selected={loginMode === "local"} onClick={() => setLoginMode("local")}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: "10px",
                          bgcolor: loginMode === "local" ? "rgba(249,115,22,0.12)" : "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <LockOutlinedIcon sx={{ color: loginMode === "local" ? "#f97316" : "#64748b", fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}
                            sx={{ color: loginMode === "local" ? "#f97316" : "#0d1b3e", lineHeight: 1.2 }}>
                            Autenticación local
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            Correo y contraseña (JWT)
                          </Typography>
                        </Box>
                      </MethodCard>
                    )}
                    {metodoHabilitado("microsoft") && !LOGIN_SOLO_GOOGLE && (
                      <MethodCard selected={loginMode === "microsoft"} onClick={() => handleOAuthLogin("microsoft")}
                        sx={{ opacity: oauthLoading === "microsoft" ? 0.7 : 1, cursor: oauthLoading ? "wait" : "pointer" }}>
                        <MicrosoftIcon sx={{ color: "#0078d4", fontSize: 22 }} />
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={700}>Microsoft</Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>Cuenta corporativa</Typography>
                        </Box>
                        {oauthLoading === "microsoft" && <CircularProgress size={18} />}
                      </MethodCard>
                    )}
                    {metodoHabilitado("google") && (
                      <MethodCard selected={loginMode === "google"} onClick={() => handleOAuthLogin("google")}
                        sx={{ opacity: oauthLoading === "google" ? 0.7 : 1, cursor: oauthLoading ? "wait" : "pointer" }}>
                        <GoogleIcon sx={{ color: "#ea4335", fontSize: 22 }} />
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={700}>Google</Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>Cuenta Google (OAuth 2.0)</Typography>
                        </Box>
                        {oauthLoading === "google" && <CircularProgress size={18} />}
                      </MethodCard>
                    )}
                  </SlideIn>
                  )}

                  {showSoloGoogleButton && (
                    <SlideIn delay="0.12s" sx={{ mt: 1 }}>
                      {!metodoHabilitado("google") && !cargandoMetodosEmail && (
                        <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2 }}>
                          Google no aparece habilitado en el servidor. Puede intentar igual; si falla,
                          active Google en Configuración → Acceso Google.
                        </Alert>
                      )}
                      <OrangeButton
                        fullWidth
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        loading={oauthLoading === "google"}
                        onClick={() =>
                          handleOAuthLogin("google", {
                            skipMetodoCheck: true,
                            alternateAccount: alternateAccountMode,
                          })
                        }
                      >
                        {alternateAccountMode ? "Elegir cuenta de Google" : "Continuar con Google"}
                      </OrangeButton>
                      {!alternateAccountMode ? (
                        <Button
                          fullWidth
                          variant="text"
                          sx={{
                            mt: 1.5,
                            textTransform: "none",
                            color: "#64748b",
                            fontWeight: 600,
                            "&:hover": { color: "#f97316", bgcolor: "rgba(249,115,22,0.06)" },
                          }}
                          onClick={handleSwitchAccount}
                        >
                          Acceder con otra cuenta
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="text"
                          sx={{
                            mt: 1.5,
                            textTransform: "none",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                          onClick={() => {
                            sessionStorage.removeItem(AUTH_ALTERNATE_ACCOUNT_KEY);
                            setAlternateAccountMode(false);
                            setRequiere2faUsuario(false);
                          }}
                        >
                          Volver
                        </Button>
                      )}
                    </SlideIn>
                  )}

                  {/* Local form (oculto en modo solo Google) */}
                  {!LOGIN_SOLO_GOOGLE && loginMode === "local" && metodoHabilitado("local") && (
                    <Formik onSubmit={handleFormSubmit} initialValues={initialValues} validationSchema={validationSchema}>
                      {({ values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                          <SlideIn delay="0.18s">
                            <NeoField
                              fullWidth size="medium" name="password"
                              type={showPassword ? "text" : "password"}
                              label="Contraseña" variant="outlined"
                              onBlur={handleBlur} value={values.password} onChange={handleChange}
                              helperText={touched.password && errors.password}
                              error={Boolean(errors.password && touched.password)}
                              sx={{ mb: 1.5 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                      {showPassword
                                        ? <VisibilityOffIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                                        : <VisibilityIcon    sx={{ color: "#94a3b8", fontSize: 20 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </SlideIn>

                          <SlideIn delay="0.30s">
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                              <Checkbox
                                size="small" name="remember" onChange={handleChange} checked={values.remember}
                                sx={{ padding: 0, mr: 1, color: "#cbd5e1", "&.Mui-checked": { color: "#f97316" } }}
                              />
                              <Typography variant="body2" sx={{ color: "#64748b" }}>Recordarme</Typography>
                            </Box>
                          </SlideIn>

                          <SlideIn delay="0.36s">
                            <OrangeButton
                              fullWidth type="submit" variant="contained"
                              loading={isSubmitting} startIcon={<LoginIcon />}
                            >
                              Ingresar
                            </OrangeButton>
                          </SlideIn>
                        </form>
                      )}
                    </Formik>
                  )}

                  {/* SSL badge */}
                  <SlideIn delay="0.44s">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8, mt: 2.5 }}>
                      <HttpsOutlinedIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                        Conexión protegida con cifrado SSL
                      </Typography>
                    </Box>
                  </SlideIn>
                </>
              )}

              {/* ── PROFILE SELECTOR ── */}
              {formToShow === "profile" && (
                <Box sx={{ maxWidth: 420, mx: "auto", width: "100%" }}>
                  <SlideIn delay="0s">
                    <Typography variant="h4" fontWeight={900} sx={{ color: "#0d1b3e", mb: 0.5 }}>
                      Seleccionar Perfil
                    </Typography>
                    <Box sx={{
                      height: 3, width: 52, borderRadius: 4, mb: 1,
                      background: "linear-gradient(90deg, #f97316, #fb923c)",
                    }} />
                    <Typography variant="body2" sx={{ color: "#64748b", mb: 2.5 }}>
                      Elige el perfil y rol para ingresar
                    </Typography>
                  </SlideIn>

                  <SlideIn delay="0.1s">
                    <Box sx={{
                      p: 2, borderRadius: "16px",
                      background: "linear-gradient(135deg, #f8fafc, #fff)",
                      border: "1.5px solid #e2e8f0", mb: 2.5,
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                        <Avatar sx={{ bgcolor: "#0d1b3e", width: 48, height: 48 }}>
                          <PersonOutlineIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>{user?.name || "Usuario"}</Typography>
                          <Typography variant="body2" sx={{ color: "#64748b" }}>Múltiples perfiles disponibles</Typography>
                        </Box>
                      </Box>

                      <Formik initialValues={initialValues} validationSchema={validationSchema}>
                        {() => (
                          <form>
                            <NeoField
                              fullWidth size="medium" name="perfil" variant="outlined"
                              onChange={onChangePerfil} select label="Seleccionar Perfil"
                              value={idPerfils} sx={{ mb: 2.5 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BadgeOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                              }}
                            >
                              {listarDatosPerfiles.map((opt) => (
                                <MenuItem key={opt.id_perfil} value={opt.id_perfil}>{opt.nombre}</MenuItem>
                              ))}
                            </NeoField>

                            <NeoField
                              fullWidth size="medium" name="roles" variant="outlined"
                              onChange={onChangeRoles} select label="Seleccionar Rol"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SecurityIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                              }}
                            >
                              {listarDatosRoles.map((opt) => (
                                <MenuItem key={opt.id_roles} value={opt.id_roles}>{opt.nombre}</MenuItem>
                              ))}
                            </NeoField>
                          </form>
                        )}
                      </Formik>
                    </Box>
                  </SlideIn>

                  <SlideIn delay="0.2s">
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        Selecciona un rol para continuar automáticamente
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#f97316" }}>
                          Versión {import.meta.env.VITE_APP_VERSION ?? "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </SlideIn>
                </Box>
              )}

            </FormPanel>
          </Grid>
        </Grid>
      </StyledCard>
    </StyledRoot>
  );
};

export default injectIntl(WithLoandingPanel(JwtLogin, { initialLoading: false }));
