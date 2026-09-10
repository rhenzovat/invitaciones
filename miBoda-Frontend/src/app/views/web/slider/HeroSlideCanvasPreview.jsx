import React, { useEffect, useRef, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const PreviewWrap = styled(Box)(() => ({
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: "#1a0e07",
  border: "1px solid rgba(204,107,142,0.25)",
}));

// Aspecto 16:6 — similar al hero real
const ASPECT = 160 / 320;

// ─── Zonas de edición ────────────────────────────────────────────────────────
const ZONES = [
  {
    id:     "contenido",
    hit:    { top: "0%",  left: "0%", width: "100%", height: "72%" },
    pencil: { top: "6%",  left: "50%", transform: "translateX(-50%)" },
    label:  "✏ Editar imagen, título y subtítulo",
    color:  "#cc6b8e",
  },
  {
    id:     "boton",
    hit:    { top: "72%", left: "0%", width: "100%", height: "28%" },
    pencil: { bottom: "8%", left: "50%", transform: "translateX(-50%)" },
    label:  "✏ Editar botón y enlace",
    color:  "#b8860b",
  },
];

// ─── Strip HTML tags for canvas rendering ────────────────────────────────────
const stripHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};

// ─── Word-wrap util ───────────────────────────────────────────────────────────
const wrapText = (ctx, text, maxWidth, maxLines = 3) => {
  if (!text) return [];
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
};

// ─── Dibujar slide en canvas — estilo Royal Masajes ──────────────────────────
const drawSlide = (ctx, W, H, imageUrl, slide, token) => {
  const s = W / 320;

  const paint = () => {
    if (!token.valid) return;

    // Overlay oscuro con degradado elegante
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(20,10,5,0.45)");
    grad.addColorStop(0.5, "rgba(20,10,5,0.50)");
    grad.addColorStop(1, "rgba(20,10,5,0.65)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Tag superior centrado ─────────────────────────────────────────────
    const tag = stripHtml(slide.subtitulo);
    if (tag) {
      ctx.save();
      ctx.font = `600 ${7.5 * s}px system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.letterSpacing = `${1.5 * s}px`;
      ctx.textAlign = "center";
      // pin icon
      ctx.fillStyle = "#cc6b8e";
      ctx.font = `600 ${8 * s}px system-ui, sans-serif`;
      ctx.fillText("📍", W / 2 - (ctx.measureText(tag).width / 2) - 10 * s, H * 0.22);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = `600 ${7 * s}px 'Inter', system-ui, sans-serif`;
      const tagLines = wrapText(ctx, tag.toUpperCase(), W * 0.75, 1);
      tagLines.forEach((ln) => ctx.fillText(ln, W / 2, H * 0.22));
      ctx.restore();
    }

    // ── Título principal (grande, centrado, bold) ─────────────────────────
    const titulo = stripHtml(slide.titulo);
    if (titulo) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 ${15 * s}px Georgia, serif`;
      const lines = wrapText(ctx, titulo, W * 0.82, 3);
      const lineH = 17 * s;
      const totalH = lines.length * lineH;
      let ty = H * 0.36 - totalH / 2 + lineH;
      if (!tag) ty = H * 0.42;
      lines.forEach((ln) => {
        ctx.fillText(ln, W / 2, ty);
        ty += lineH;
      });
      ctx.restore();
    }

    // ── Botón estilo WhatsApp outline ────────────────────────────────────
    const btnTxt = stripHtml(slide.texto_boton);
    if (btnTxt) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = `700 ${7.5 * s}px system-ui, sans-serif`;
      const btnLabel = btnTxt.toUpperCase();
      const btnW = Math.min(ctx.measureText(btnLabel).width + 22 * s, W * 0.55);
      const btnH = 16 * s;
      const btnX = W / 2 - btnW / 2;
      const btnY = H * 0.70;
      const r = btnH / 2;
      // Fondo blanco semi-transparente con borde
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(btnX + r, btnY);
      ctx.lineTo(btnX + btnW - r, btnY);
      ctx.arcTo(btnX + btnW, btnY, btnX + btnW, btnY + btnH, r);
      ctx.lineTo(btnX + btnW, btnY + r);
      ctx.arcTo(btnX + btnW, btnY + btnH, btnX + btnW - r, btnY + btnH, r);
      ctx.lineTo(btnX + r, btnY + btnH);
      ctx.arcTo(btnX, btnY + btnH, btnX, btnY + r, r);
      ctx.lineTo(btnX, btnY + r);
      ctx.arcTo(btnX, btnY, btnX + r, btnY, r);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(btnLabel, W / 2, btnY + btnH * 0.67);
      ctx.restore();
    }

    // ── Watermark ────────────────────────────────────────────────────────
    ctx.save();
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = `400 ${5.5 * s}px system-ui`;
    ctx.fillText("Vista previa — Royal Masajes", W - 6 * s, H - 5 * s);
    ctx.restore();
  };

  // Fondo base
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#2c1a0e";
  ctx.fillRect(0, 0, W, H);

  if (!imageUrl) {
    // Sin imagen: patrón de fondo decorativo
    ctx.save();
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#1a0a05");
    grd.addColorStop(1, "#3a1a0a");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    paint();
    return;
  }

  const img = new Image();
  img.onload = () => {
    if (!token.valid) return;
    // Dibujar imagen cubriendo el canvas (cover)
    const ratio = Math.max(W / img.width, H / img.height);
    const sw = img.width  * ratio;
    const sh = img.height * ratio;
    const sx = (W - sw) / 2;
    const sy = (H - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
    paint();
  };
  img.onerror = () => paint();
  img.src = imageUrl;
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
const HeroSlideCanvasPreview = ({ imageUrl, slide, onZoneClick, cmsActive }) => {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const tokenRef     = useRef({ valid: false });
  const rafRef       = useRef(null);

  const render = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr  = window.devicePixelRatio || 1;
    const cssW = container.clientWidth;
    if (!cssW) return;
    const cssH = Math.round(cssW * ASPECT);

    tokenRef.current.valid = false;
    const token = { valid: true };
    tokenRef.current = token;

    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSlide(ctx, cssW, cssH, imageUrl, slide || {}, token);
  }, [imageUrl, slide]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    render();
    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(render);
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      tokenRef.current.valid = false;
    };
  }, [render]);

  return (
    <PreviewWrap>
      {/* Header del canvas */}
      <Box sx={{
        px: 1.5, py: 0.8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(135deg,rgba(44,26,14,0.95),rgba(74,42,21,0.95))",
        borderBottom: "1px solid rgba(204,107,142,0.2)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: "50%",
            background: "linear-gradient(135deg,#cc6b8e,#a0455e)",
          }} />
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#cc6b8e",
            letterSpacing: 1.5, textTransform: "uppercase" }}>
            Preview Hero Slider
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <WhatsAppIcon sx={{ fontSize: 10, color: "#25d366" }} />
          <Typography sx={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)" }}>
            Royal Masajes
          </Typography>
        </Box>
      </Box>

      {/* Canvas con zonas de edición */}
      <Box ref={containerRef} sx={{ width: "100%", lineHeight: 0, position: "relative" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {/* Zonas clickeables con lápiz */}
        {onZoneClick && ZONES.map((z) => (
          <Box
            key={z.id}
            title={z.label}
            onClick={() => onZoneClick(z.id)}
            sx={{
              position: "absolute",
              ...z.hit,
              cursor: "pointer",
              border: `2px solid ${cmsActive === z.id ? z.color : "transparent"}`,
              boxSizing: "border-box",
              transition: "border-color 0.2s, background-color 0.2s",
              bgcolor: cmsActive === z.id ? `${z.color}10` : "transparent",
              "&:hover": {
                borderColor: `${z.color}aa`,
                bgcolor: `${z.color}10`,
              },
              "&:hover .pencil-fab": { opacity: 1, transform: "translateX(-50%) scale(1)" },
              zIndex: 3,
            }}
          >
            {/* Lápiz flotante */}
            <Box
              className="pencil-fab"
              sx={{
                position: "absolute",
                ...z.pencil,
                opacity: cmsActive === z.id ? 1 : 0,
                transform: `${z.pencil.transform || ""} scale(${cmsActive === z.id ? 1 : 0.7})`,
                transition: "opacity 0.2s, transform 0.2s",
                width: 28, height: 28,
                background: `linear-gradient(135deg,${z.color},${z.color}cc)`,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 3px 12px rgba(0,0,0,0.5)`,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <EditIcon sx={{ fontSize: 13, color: "#fff" }} />
            </Box>

            {/* Label flotante en hover */}
            <Box sx={{
              position: "absolute",
              bottom: z.id === "contenido" ? "auto" : "auto",
              top: z.id === "contenido" ? "50%" : "auto",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: `${z.color}ee`,
              color: "#fff",
              fontSize: "0.58rem",
              fontWeight: 700,
              px: 1.2, py: 0.4,
              borderRadius: "20px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity 0.2s",
              ".MuiBox-root:hover > &": { opacity: 1 },
              letterSpacing: 0.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}>
              {z.label}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer del canvas */}
      {onZoneClick && (
        <Box sx={{
          px: 1.5, py: 0.7,
          background: "linear-gradient(135deg,rgba(44,26,14,0.9),rgba(74,42,21,0.9))",
          borderTop: "1px solid rgba(204,107,142,0.15)",
          display: "flex", gap: 1.5, alignItems: "center",
        }}>
          {ZONES.map((z) => (
            <Box key={z.id} onClick={() => onZoneClick(z.id)} sx={{
              display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer",
              px: 1, py: 0.3, borderRadius: "20px",
              bgcolor: cmsActive === z.id ? `${z.color}25` : "transparent",
              border: `1px solid ${cmsActive === z.id ? z.color : "rgba(255,255,255,0.1)"}`,
              transition: "all 0.15s",
              "&:hover": { borderColor: z.color, bgcolor: `${z.color}20` },
            }}>
              <EditIcon sx={{ fontSize: 9, color: z.color }} />
              <Typography sx={{
                fontSize: "0.58rem", color: cmsActive === z.id ? z.color : "rgba(255,255,255,0.5)",
                fontWeight: cmsActive === z.id ? 700 : 400,
              }}>
                {z.id === "contenido" ? "Imagen & Texto" : "Botón & Enlace"}
              </Typography>
            </Box>
          ))}
          <Typography sx={{ ml: "auto", fontSize: "0.55rem", color: "rgba(255,255,255,0.25)" }}>
            Haz clic en el canvas ↑
          </Typography>
        </Box>
      )}
    </PreviewWrap>
  );
};

export default HeroSlideCanvasPreview;
