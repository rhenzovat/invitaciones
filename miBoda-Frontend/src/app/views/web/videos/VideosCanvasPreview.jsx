import React, { useEffect, useRef, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { cmsPublicImageUrlCandidates } from "app/utils/utils";

const PreviewWrap = styled(Box)(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  backgroundColor: "#f8fafc",
  position: "relative",
}));

const drawVideosGrid = (ctx, W, H, pagina, items, token) => {
  const s = W / 900;
  const pad = 24 * s;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#0f172a";
  ctx.font = `700 ${22 * s}px system-ui, sans-serif`;
  const titulo = pagina?.seccion_titulo || "Creando Espirales";
  ctx.fillText(titulo, W / 2, pad + 20 * s);

  ctx.strokeStyle = "#e63946";
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 24 * s, pad + 28 * s);
  ctx.lineTo(W / 2 + 24 * s, pad + 28 * s);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = `400 ${11 * s}px system-ui, sans-serif`;
  const sub = pagina?.seccion_descripcion || "";
  if (sub) {
    const words = sub.split(" ");
    let line = "";
    let y = pad + 44 * s;
    const maxW = W - pad * 2;
    words.forEach((w) => {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, W / 2, y);
        line = w;
        y += 14 * s;
      } else {
        line = test;
      }
    });
    if (line) ctx.fillText(line, W / 2, y);
  }

  const gridY = pad + 80 * s;
  const colW = (W - pad * 2 - 16 * s * 2) / 3;
  const cardH = H - gridY - pad;
  const display = (items || []).slice(0, 3);

  display.forEach((item, i) => {
    const x = pad + i * (colW + 16 * s);
    const y = gridY;

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 12 * s;
    ctx.beginPath();
    const r = 10 * s;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + colW - r, y);
    ctx.quadraticCurveTo(x + colW, y, x + colW, y + r);
    ctx.lineTo(x + colW, y + cardH - r);
    ctx.quadraticCurveTo(x + colW, y + cardH, x + colW - r, y + cardH);
    ctx.lineTo(x + r, y + cardH);
    ctx.quadraticCurveTo(x, y + cardH, x, y + cardH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    const thumbH = cardH * 0.55;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x + 8 * s, y + 8 * s, colW - 16 * s, thumbH);

    if (item?.url_imagen_portada) {
      const src = cmsPublicImageUrlCandidates(item.url_imagen_portada)[0];
      if (src && token.valid) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!token.valid) return;
          ctx.drawImage(img, x + 8 * s, y + 8 * s, colW - 16 * s, thumbH);
        };
        img.src = src;
      }
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = `700 ${28 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("▶", x + colW / 2, y + 8 * s + thumbH / 2 + 8 * s);
      ctx.textAlign = "left";
    }

    if (item?.tag) {
      ctx.fillStyle = "#e63946";
      const tagY = y + thumbH + 18 * s;
      ctx.beginPath();
      ctx.roundRect(x + 14 * s, tagY - 10 * s, ctx.measureText(item.tag).width + 16 * s, 14 * s, 7 * s);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${7 * s}px system-ui`;
      ctx.fillText(item.tag.toUpperCase(), x + 22 * s, tagY);
    }

    ctx.fillStyle = "#002147";
    ctx.font = `700 ${10 * s}px system-ui`;
    const title = (item?.titulo || "Video").slice(0, 28);
    ctx.fillText(title, x + 14 * s, y + thumbH + 36 * s);

    ctx.fillStyle = "#666";
    ctx.font = `400 ${8 * s}px system-ui`;
    const desc = (item?.descripcion || "").slice(0, 60);
    ctx.fillText(desc + (desc.length >= 60 ? "…" : ""), x + 14 * s, y + thumbH + 50 * s);

    const tipo = item?.tipo_video === "youtube" ? "YouTube" : "Archivo";
    ctx.fillStyle = "#94a3b8";
    ctx.font = `400 ${7 * s}px system-ui`;
    ctx.fillText(tipo, x + 14 * s, y + cardH - 12 * s);
  });

  if (display.length === 0) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = `400 ${12 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("Agrega videos para ver la galería", W / 2, gridY + cardH / 2);
    ctx.textAlign = "left";
  }
};

const VideosCanvasPreview = ({ pagina, items }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tokenRef = useRef({ valid: false });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.clientWidth;
    if (!cssW) return;
    const cssH = Math.round(cssW * 0.52);

    tokenRef.current.valid = false;
    const token = { valid: true };
    tokenRef.current = token;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawVideosGrid(ctx, cssW, cssH, pagina, items, token);
  }, [pagina, items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    render();
    const ro = new ResizeObserver(() => requestAnimationFrame(render));
    ro.observe(container);
    return () => {
      ro.disconnect();
      tokenRef.current.valid = false;
    };
  }, [render]);

  return (
    <PreviewWrap>
      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "#fff" }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Vista previa — Galería 3 columnas (como en el sitio)
        </Typography>
      </Box>
      <Box ref={containerRef} sx={{ width: "100%", lineHeight: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </Box>
    </PreviewWrap>
  );
};

export default VideosCanvasPreview;
