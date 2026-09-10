import React, { useEffect, useRef, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { obtenerDeliveryConfig, actualizarDeliveryConfig } from '../../api/delivery_config.api';
import { handleErrorMessages, toastSuccess } from '../../components/notify-messages';

// ──────────────────────────────────────────────────────────────────────────────
// Constantes de colores del mapa Canvas
// ──────────────────────────────────────────────────────────────────────────────
const COLOR_RADIO    = 'rgba(37, 99, 235, 0.15)';
const COLOR_RADIO_BG = 'rgba(37, 99, 235, 0.35)';
const COLOR_STORE    = '#dc2626';
const COLOR_DIST_ESP = '#16a34a';
const COLOR_DIST_OTR = '#f59e0b';

// Distritos de Lima con coordenadas aproximadas (para el mapa Canvas)
const DISTRITOS_LIMA = [
  { nombre: 'Chorrillos',          lat: -12.1663, lng: -77.0218, color: COLOR_DIST_ESP },
  { nombre: 'Barranco',            lat: -12.1528, lng: -77.0200, color: COLOR_DIST_ESP },
  { nombre: 'Santiago de Surco',   lat: -12.1470, lng: -76.9920, color: COLOR_DIST_ESP },
  { nombre: 'Miraflores',          lat: -12.1191, lng: -77.0282, color: COLOR_DIST_OTR },
  { nombre: 'San Isidro',          lat: -12.0975, lng: -77.0365, color: COLOR_DIST_OTR },
  { nombre: 'La Molina',           lat: -12.0764, lng: -76.9460, color: COLOR_DIST_OTR },
  { nombre: 'San Borja',           lat: -12.1020, lng: -76.9983, color: COLOR_DIST_OTR },
  { nombre: 'Surquillo',           lat: -12.1115, lng: -77.0018, color: COLOR_DIST_OTR },
  { nombre: 'Lince',               lat: -12.0860, lng: -77.0266, color: COLOR_DIST_OTR },
  { nombre: 'Jesús María',         lat: -12.0733, lng: -77.0440, color: COLOR_DIST_OTR },
  { nombre: 'Pueblo Libre',        lat: -12.0756, lng: -77.0644, color: COLOR_DIST_OTR },
  { nombre: 'Magdalena del Mar',   lat: -12.0900, lng: -77.0700, color: COLOR_DIST_OTR },
  { nombre: 'San Miguel',          lat: -12.0760, lng: -77.0840, color: COLOR_DIST_OTR },
  { nombre: 'Callao',              lat: -12.0566, lng: -77.1180, color: COLOR_DIST_OTR },
  { nombre: 'San Juan de Miraflores', lat: -12.1581, lng: -76.9727, color: COLOR_DIST_OTR },
  { nombre: 'Villa María del Triunfo', lat: -12.1750, lng: -76.9481, color: COLOR_DIST_OTR },
  { nombre: 'Villa El Salvador',   lat: -12.2127, lng: -76.9423, color: COLOR_DIST_OTR },
  { nombre: 'San Juan de Lurigancho', lat: -11.9887, lng: -77.0020, color: COLOR_DIST_OTR },
  { nombre: 'Ate',                 lat: -12.0270, lng: -76.9200, color: COLOR_DIST_OTR },
  { nombre: 'Lima Cercado',        lat: -12.0464, lng: -77.0428, color: COLOR_DIST_OTR },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers de proyección lat/lng → píxeles en el canvas
// ──────────────────────────────────────────────────────────────────────────────
const LAT_MIN = -12.26, LAT_MAX = -11.95;
const LNG_MIN = -77.15, LNG_MAX = -76.88;

function latLngToPx(lat, lng, W, H) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return { x, y };
}

// 1 grado lat ≈ 111 km → radio en píxeles
function radioEnPx(radioMetros, H) {
  const gradosPorPx = (LAT_MAX - LAT_MIN) / H;
  const metrosPorGrado = 111000;
  return radioMetros / (gradosPorPx * metrosPorGrado);
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────
const DeliveryConfigModal = ({ open, onClose, setLoading }) => {
  const canvasRef = useRef(null);

  const [form, setForm] = useState({
    tienda_latitud:             -12.1770190,
    tienda_longitud:            -77.0100450,
    tienda_direccion:           'Jirón Juno Mz. C Lte. 7E, La Campiña, Chorrillos',
    radio_metros_gratis:        500,
    costo_distritos_especiales: 10,
    costo_otros_distritos:      10,
    monto_minimo_compra:        100,
    costo_envio_baja_compra:    5,
    distritos_especiales:       ['Chorrillos', 'Barranco', 'Santiago de Surco'],
  });

  const [nuevoDistrito, setNuevoDistrito] = useState('');
  const [guardando, setGuardando]         = useState(false);

  // ── Cargar configuración al abrir ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const res = await obtenerDeliveryConfig();
        if (res?.data) {
          setForm({
            tienda_latitud:             res.data.tienda_latitud,
            tienda_longitud:            res.data.tienda_longitud,
            tienda_direccion:           res.data.tienda_direccion,
            radio_metros_gratis:        res.data.radio_metros_gratis,
            costo_distritos_especiales: res.data.costo_distritos_especiales,
            costo_otros_distritos:      res.data.costo_otros_distritos,
            monto_minimo_compra:        res.data.monto_minimo_compra,
            costo_envio_baja_compra:    res.data.costo_envio_baja_compra ?? 5,
            distritos_especiales:       res.data.distritos_especiales ?? [],
          });
        }
      } catch (e) {
        handleErrorMessages('Error al cargar configuración de delivery', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // ── Dibujar canvas ────────────────────────────────────────────────────────
  const dibujarMapa = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Fondo mapa
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, W, H);

    // Grid de referencia
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * H / 10); ctx.lineTo(W, i * H / 10); ctx.stroke();
    }

    // Distritos en el mapa
    DISTRITOS_LIMA.forEach(d => {
      const esespecial = form.distritos_especiales
        .map(x => x.toLowerCase())
        .includes(d.nombre.toLowerCase());

      const { x, y } = latLngToPx(d.lat, d.lng, W, H);

      // Área del distrito (círculo grande semitransparente)
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fillStyle = esespecial
        ? 'rgba(22,163,74,0.12)'
        : 'rgba(245,158,11,0.10)';
      ctx.fill();
      ctx.strokeStyle = esespecial ? '#16a34a' : '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Etiqueta
      ctx.fillStyle = esespecial ? '#15803d' : '#92400e';
      ctx.font      = `bold ${esespecial ? 11 : 9}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(d.nombre, x, y + 4);
    });

    // Radio de envío gratis
    const tiendaPx = latLngToPx(
      Number(form.tienda_latitud),
      Number(form.tienda_longitud),
      W, H
    );
    const rPx = radioEnPx(Number(form.radio_metros_gratis), H);

    // Relleno del radio
    ctx.beginPath();
    ctx.arc(tiendaPx.x, tiendaPx.y, rPx, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_RADIO;
    ctx.fill();

    // Borde punteado del radio
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = COLOR_RADIO_BG;
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Etiqueta del radio
    ctx.fillStyle = '#1d4ed8';
    ctx.font      = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Radio ${form.radio_metros_gratis} m`, tiendaPx.x, tiendaPx.y - rPx - 6);

    // Pin de la tienda
    ctx.beginPath();
    ctx.arc(tiendaPx.x, tiendaPx.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_STORE;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texto "Tienda"
    ctx.fillStyle = '#991b1b';
    ctx.font      = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏪 Tienda', tiendaPx.x, tiendaPx.y + 22);

    // Leyenda
    const leyenda = [
      { color: '#dc2626', texto: 'Tienda' },
      { color: '#1d4ed8', texto: `Radio gratis (${form.radio_metros_gratis} m)` },
      { color: '#16a34a', texto: 'Distritos especiales' },
      { color: '#f59e0b', texto: 'Otros distritos' },
    ];
    leyenda.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(10, 10 + i * 18, 12, 12);
      ctx.fillStyle = '#374151';
      ctx.font      = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.texto, 28, 21 + i * 18);
    });
  }, [form]);

  useEffect(() => {
    if (open) {
      // requestAnimationFrame para esperar que el canvas esté montado
      requestAnimationFrame(dibujarMapa);
    }
  }, [open, dibujarMapa]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const agregarDistrito = () => {
    const d = nuevoDistrito.trim();
    if (!d) return;
    if (form.distritos_especiales.map(x => x.toLowerCase()).includes(d.toLowerCase())) return;
    setForm(prev => ({
      ...prev,
      distritos_especiales: [...prev.distritos_especiales, d],
    }));
    setNuevoDistrito('');
  };

  const eliminarDistrito = (nombre) => {
    setForm(prev => ({
      ...prev,
      distritos_especiales: prev.distritos_especiales.filter(d => d !== nombre),
    }));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await actualizarDeliveryConfig({
        ...form,
        tienda_latitud:             Number(form.tienda_latitud),
        tienda_longitud:            Number(form.tienda_longitud),
        radio_metros_gratis:        Number(form.radio_metros_gratis),
        costo_distritos_especiales: Number(form.costo_distritos_especiales),
        costo_otros_distritos:      Number(form.costo_otros_distritos),
        monto_minimo_compra:        Number(form.monto_minimo_compra),
        costo_envio_baja_compra:    Number(form.costo_envio_baja_compra),
      });
      toastSuccess('Configuración de delivery guardada correctamente.');
      onClose();
    } catch (e) {
      handleErrorMessages('Error al guardar configuración', e);
    } finally {
      setGuardando(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ style: { borderRadius: 12 } }}>

      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        color: '#fff', display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <LocalShippingIcon />
        <span>Configuración de Delivery</span>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, background: '#f8fafc' }}>
        <Grid container spacing={3}>

          {/* ── MAPA CANVAS ─────────────────────────────────────────────── */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RadioButtonCheckedIcon color="primary" /> Mapa de cobertura
            </Typography>
            <canvas
              ref={canvasRef}
              width={560}
              height={400}
              style={{
                width: '100%', height: 'auto',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                background: '#f0f4f8',
                cursor: 'default',
              }}
            />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              Verde = distritos especiales · Amarillo = otros distritos · Círculo azul = radio gratis
            </Typography>
          </Grid>

          {/* ── FORMULARIO ──────────────────────────────────────────────── */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="error" /> Ubicación de la tienda
            </Typography>

            <TextField
              fullWidth size="small" name="tienda_direccion"
              label="Dirección de la tienda"
              value={form.tienda_direccion}
              onChange={handleChange}
              sx={{ mb: 1.5 }}
            />

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth size="small" name="tienda_latitud"
                  label="Latitud" type="number"
                  inputProps={{ step: '0.0000001' }}
                  value={form.tienda_latitud}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth size="small" name="tienda_longitud"
                  label="Longitud" type="number"
                  inputProps={{ step: '0.0000001' }}
                  value={form.tienda_longitud}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Radio */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Radio de envío GRATIS (metros)
            </Typography>
            <TextField
              fullWidth size="small" name="radio_metros_gratis"
              label="Radio en metros" type="number"
              inputProps={{ min: 1, max: 50000 }}
              value={form.radio_metros_gratis}
              onChange={handleChange}
              helperText="Dentro de este radio el delivery es GRATIS"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 1 }} />

            {/* Costos */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Costos de delivery (S/)
            </Typography>
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth size="small" name="costo_distritos_especiales"
                  label="Distritos especiales" type="number"
                  inputProps={{ min: 0, step: '0.50' }}
                  value={form.costo_distritos_especiales}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth size="small" name="costo_otros_distritos"
                  label="Otros distritos" type="number"
                  inputProps={{ min: 0, step: '0.50' }}
                  value={form.costo_otros_distritos}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Compra mínima */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Compra mínima para desbloquear compra (S/)
            </Typography>
            <TextField
              fullWidth size="small" name="monto_minimo_compra"
              label="Monto mínimo S/" type="number"
              inputProps={{ min: 0, step: '1' }}
              value={form.monto_minimo_compra}
              onChange={handleChange}
              helperText="Si el subtotal es menor a este monto se aplica el costo de baja compra"
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth size="small" name="costo_envio_baja_compra"
              label="Costo delivery compra baja (S/)" type="number"
              inputProps={{ min: 0, step: '0.50' }}
              value={form.costo_envio_baja_compra}
              onChange={handleChange}
              helperText={`Cuando el subtotal < S/ ${Number(form.monto_minimo_compra).toFixed(2)} el delivery cuesta este monto (Caso 2)`}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 1 }} />

            {/* Distritos especiales */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Distritos con delivery especial
            </Typography>
            <div style={{ display: 'flex', gap: 8, mb: 8, marginBottom: 8 }}>
              <TextField
                size="small"
                label="Nombre del distrito"
                value={nuevoDistrito}
                onChange={e => setNuevoDistrito(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && agregarDistrito()}
                sx={{ flex: 1 }}
              />
              <Tooltip title="Agregar distrito">
                <IconButton color="primary" onClick={agregarDistrito}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {form.distritos_especiales.map(d => (
                <Chip
                  key={d}
                  label={d}
                  color="success"
                  size="small"
                  onDelete={() => eliminarDistrito(d)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </div>
          </Grid>

          {/* ── RESUMEN REGLAS ───────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
              Resumen de reglas aplicadas
            </Typography>
            <Grid container spacing={1}>
              {[
                {
                  bg: '#fef9c3', border: '#f59e0b', color: '#92400e',
                  icon: '💸',
                  titulo: `Caso 2 — Compra < S/ ${Number(form.monto_minimo_compra).toFixed(2)}`,
                  desc: `Delivery S/ ${Number(form.costo_envio_baja_compra).toFixed(2)} (compra baja — no bloquea)`,
                },
                {
                  bg: '#dcfce7', border: '#16a34a', color: '#15803d',
                  icon: '📍',
                  titulo: `Caso 3 — Dentro del radio (${form.radio_metros_gratis} m)`,
                  desc: 'Delivery GRATIS (requiere ubicación del cliente)',
                },
                {
                  bg: '#dbeafe', border: '#2563eb', color: '#1d4ed8',
                  icon: '🏘️',
                  titulo: 'Caso 1 — Distritos especiales',
                  desc: `${form.distritos_especiales.join(', ')} → S/ ${Number(form.costo_distritos_especiales).toFixed(2)}`,
                },
                {
                  bg: '#f3e8ff', border: '#a855f7', color: '#6b21a8',
                  icon: '🗺️',
                  titulo: 'Caso 4 — Otros distritos',
                  desc: `S/ ${Number(form.costo_otros_distritos).toFixed(2)} delivery`,
                },
              ].map((r, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <div style={{
                    background: r.bg, border: `1.5px solid ${r.border}`,
                    borderRadius: 8, padding: '10px 12px',
                  }}>
                    <Typography variant="caption" fontWeight={700} color={r.color}
                      display="block" mb={0.3}>
                      {r.icon} {r.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.desc}
                    </Typography>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, background: '#f1f5f9' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={guardar}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={guardando}
        >
          {guardando ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryConfigModal;
