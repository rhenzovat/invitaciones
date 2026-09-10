import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import Box from '@mui/material/Box';

const TIP_STYLE = {
  display: 'none',
  position: 'absolute',
  background: '#1e293b',
  color: '#f1f5f9',
  padding: '5px 10px',
  borderRadius: '7px',
  fontSize: '12px',
  fontWeight: 600,
  pointerEvents: 'none',
  zIndex: 20,
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
  lineHeight: 1.4,
  maxWidth: 280,
};

const NODE_W = 168;
const NODE_H = 72;
const PAD = 14;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Lienzo interactivo (igual al cotizador público): tarjetas blancas, arrastre y doble clic para quitar.
 */
const CotizacionCanvas = forwardRef(function CotizacionCanvas({ onChange, currency = 'S/' }, ref) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const dragRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hoverIdRef = useRef(null);
  const sizeRef = useRef({ w: 400, h: 300 });
  const onChangeRef = useRef(onChange);
  const clickLastRef = useRef({ id: null, t: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const emitChange = useCallback(() => {
    onChangeRef.current?.(
      nodesRef.current.map((n) => ({
        id: n.moduleId,
        name: n.name,
        price: n.price,
        x: n.x,
        y: n.y,
      }))
    );
  }, []);

  const hit = useCallback((x, y) => {
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const n = nodesRef.current[i];
      if (x >= n.x && x <= n.x + NODE_W && y >= n.y && y <= n.y + NODE_H) return n;
    }
    return null;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);

    const step = 24;
    ctx.strokeStyle = 'rgba(0,74,153,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (nodesRef.current.length === 0) {
      ctx.fillStyle = 'rgba(128,130,133,0.45)';
      ctx.font = '500 14px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Arrastra módulos aquí o haz clic en el catálogo →', w / 2, h / 2);
      ctx.textAlign = 'left';
      return;
    }

    nodesRef.current.forEach((n) => {
      const active = dragRef.current === n || hoverIdRef.current === n.id;
      const r = 10;

      ctx.shadowColor = 'rgba(0,74,153,0.15)';
      ctx.shadowBlur = active ? 16 : 8;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = active ? '#fff' : '#fafcff';
      ctx.strokeStyle = active ? '#F15A24' : 'rgba(0,74,153,0.2)';
      ctx.lineWidth = active ? 2 : 1;
      roundRect(ctx, n.x, n.y, NODE_W, NODE_H, r);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#181D38';
      ctx.font = '600 11px Poppins, sans-serif';
      const title = n.name.length > 22 ? `${n.name.slice(0, 20)}…` : n.name;
      ctx.fillText(title, n.x + 10, n.y + 22);

      ctx.fillStyle = '#F15A24';
      ctx.font = '700 13px Poppins, sans-serif';
      ctx.fillText(`${currency} ${Math.round(n.price)}`, n.x + 10, n.y + 48);

      ctx.fillStyle = 'rgba(128,130,133,0.5)';
      ctx.font = '10px Poppins, sans-serif';
      ctx.fillText('Arrastra · doble clic quita', n.x + 10, n.y + 62);
    });
  }, [currency]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(320, parent.clientWidth);
    const h = Math.max(280, parent.clientHeight);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.current = { w, h };
    draw();
  }, [draw]);

  const addModule = useCallback((mod) => {
    if (nodesRef.current.some((n) => n.moduleId === mod.id)) return false;
    const { w } = sizeRef.current;
    const cols = Math.max(1, Math.floor((w - PAD * 2) / (NODE_W + 12)));
    const idx = nodesRef.current.length;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    nodesRef.current.push({
      moduleId: mod.id,
      id: `n-${mod.id}-${Date.now()}`,
      name: mod.name,
      price: mod.price,
      x: PAD + col * (NODE_W + 12),
      y: PAD + row * (NODE_H + 12),
    });
    draw();
    emitChange();
    return true;
  }, [draw, emitChange]);

  const removeByModuleId = useCallback((moduleId) => {
    nodesRef.current = nodesRef.current.filter((n) => n.moduleId !== moduleId);
    draw();
    emitChange();
  }, [draw, emitChange]);

  const hasModule = useCallback((moduleId) => (
    nodesRef.current.some((n) => n.moduleId === moduleId)
  ), []);

  const toggleModule = useCallback((mod) => {
    if (hasModule(mod.id)) {
      removeByModuleId(mod.id);
      return false;
    }
    return addModule(mod);
  }, [addModule, hasModule, removeByModuleId]);

  const restoreModules = useCallback((mods) => {
    nodesRef.current = [];
    (mods || []).forEach((mod) => {
      if (!mod?.id) return;
      const { w } = sizeRef.current;
      const cols = Math.max(1, Math.floor((w - PAD * 2) / (NODE_W + 12)));
      const idx = nodesRef.current.length;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      nodesRef.current.push({
        moduleId: mod.id,
        id: `n-${mod.id}-${idx}`,
        name: mod.name,
        price: mod.price,
        x: PAD + col * (NODE_W + 12),
        y: PAD + row * (NODE_H + 12),
      });
    });
    draw();
    emitChange();
  }, [draw, emitChange]);

  useImperativeHandle(ref, () => ({
    addModule,
    removeByModuleId,
    hasModule,
    toggleModule,
    restoreModules,
    clear: () => {
      nodesRef.current = [];
      draw();
      emitChange();
    },
    getModules: () => nodesRef.current.map((n) => ({
      id: n.moduleId,
      name: n.name,
      price: n.price,
    })),
  }), [addModule, removeByModuleId, hasModule, toggleModule, restoreModules, draw, emitChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const onDown = (x, y) => {
      const n = hit(x, y);
      if (n) {
        dragRef.current = n;
        dragOffsetRef.current = { x: x - n.x, y: y - n.y };
        nodesRef.current = nodesRef.current.filter((item) => item.id !== n.id).concat(n);
      }
    };
    const hideTip = () => {
      if (tooltipRef.current) tooltipRef.current.style.display = 'none';
    };

    const onMove = (x, y) => {
      const { w, h } = sizeRef.current;
      if (dragRef.current) {
        dragRef.current.x = Math.max(PAD, Math.min(w - NODE_W - PAD, x - dragOffsetRef.current.x));
        dragRef.current.y = Math.max(PAD, Math.min(h - NODE_H - PAD, y - dragOffsetRef.current.y));
        hideTip();
        draw();
        return;
      }
      const hNode = hit(x, y);
      hoverIdRef.current = hNode ? hNode.id : null;
      canvas.style.cursor = hNode ? 'grab' : 'default';
      const tip = tooltipRef.current;
      if (tip) {
        if (hNode) {
          tip.textContent = hNode.name;
          tip.style.display = 'block';
          tip.style.left = `${x + 14}px`;
          tip.style.top = `${Math.max(4, y - 40)}px`;
        } else {
          tip.style.display = 'none';
        }
      }
      draw();
    };

    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        emitChange();
      }
      hideTip();
      draw();
    };

    const md = (e) => onDown(e.offsetX, e.offsetY);
    const mm = (e) => onMove(e.offsetX, e.offsetY);
    const onClick = (e) => {
      const n = hit(e.offsetX, e.offsetY);
      if (!n) return;
      const now = Date.now();
      if (clickLastRef.current.id === n.id && now - clickLastRef.current.t < 400) {
        nodesRef.current = nodesRef.current.filter((item) => item.id !== n.id);
        clickLastRef.current = { id: null, t: 0 };
        emitChange();
        draw();
      } else {
        clickLastRef.current = { id: n.id, t: now };
      }
    };

    canvas.addEventListener('mousedown', md);
    canvas.addEventListener('mousemove', mm);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('click', onClick);

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    return () => {
      canvas.removeEventListener('mousedown', md);
      canvas.removeEventListener('mousemove', mm);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mouseleave', onUp);
      canvas.removeEventListener('click', onClick);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [resize, draw, hit, emitChange]);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 320,
        height: '100%',
        position: 'relative',
        bgcolor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: 8,
          left: 12,
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'rgba(0,74,153,0.35)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        Lienzo interactivo
      </Box>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', minHeight: 280 }} />
      <div ref={tooltipRef} style={TIP_STYLE} />
    </Box>
  );
});

export default CotizacionCanvas;
