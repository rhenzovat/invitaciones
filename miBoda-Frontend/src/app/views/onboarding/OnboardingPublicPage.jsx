import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Grid, Typography, TextField, Button, CircularProgress,
  Divider, Chip, LinearProgress, IconButton,
} from "@mui/material";
import {
  CheckCircle, Schedule, AccountBalance, QrCode2,
  Upload, Assignment, Business, ContactPhone, Language, Close,
  Person, Email, Phone, LocationOn, Palette, Public,
} from "@mui/icons-material";
import {
  onboardingPublicoObtener,
  onboardingPublicoGuardar,
  onboardingPublicoSubirImagen,
  onboardingPublicoSubirPagoImagen,
  onboardingPublicoEliminarImagen,
  onboardingPublicoEliminarPagoImagen,
  formatMontoSol,
} from "../../api/onboarding.api";
import { Modal, Result, Tooltip as AntTooltip, Image as AntImage } from "antd";
import "antd/dist/reset.css";

const QR_DEFAULT = `${import.meta.env.VITE_AUTHJWT_DOMAIN}${import.meta.env.VITE_QR_YAPE_URL}`;

const PREVIEW_IMAGEN = {
  mask: (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 20 }}>🔍</span>
      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Ver imagen</span>
    </div>
  ),
  zIndex: 2000,
};

const normalizarComprobante = (item) => {
  if (typeof item === "string") {
    const name = item.split("/").pop()?.split("?")[0] || "";
    return { url: item, filename: decodeURIComponent(name) };
  }
  return { url: item.url, filename: item.filename };
};

const API_BASE = (import.meta.env.VITE_AUTHJWT_DOMAIN || "").replace(/\/$/, "");

/** URL pública del comprobante (cuota o pago único). */
const urlMediaPago = (token, filename) => {
  if (!token || !filename) return null;
  return `${API_BASE}/api/public/onboarding/${token}/media/pago/${encodeURIComponent(filename)}`;
};

/** URL pública del logo con cache-bust si el API no incluye versión. */
const urlLogoConVersion = (url) => {
  if (!url) return null;
  if (/[?&]v=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
};

/** Une cuotas del API con la galería pagos_imagenes por filename / número de cuota. */
const mergeCuotasConPagos = (cuotas, pagos, token) => {
  const mapPagos = {};
  (pagos || []).forEach((item) => {
    const { url, filename } = normalizarComprobante(item);
    if (filename) mapPagos[filename] = url || urlMediaPago(token, filename);
  });

  return (cuotas || []).map((c) => {
    let url = c.url || (c.filename ? mapPagos[c.filename] || urlMediaPago(token, c.filename) : null);
    if (!url && c.numero) {
      const hit = Object.entries(mapPagos).find(([fn]) => {
        const m = fn.match(/^cuota-(\d+)-/i);
        return m && Number(m[1]) === Number(c.numero);
      });
      if (hit) url = hit[1];
    }
    const filename = c.filename || Object.keys(mapPagos).find((fn) => {
      const m = fn.match(/^cuota-(\d+)-/i);
      return m && Number(m[1]) === Number(c.numero);
    }) || null;
    return { ...c, filename: filename || c.filename, url };
  });
};

// ── Paleta clara y alegre ─────────────────────────────────────────────────────
const D = {
  bg:       "#eef4ff",
  surface:  "#ffffff",
  card:     "#f5f8ff",
  card2:    "#edf2ff",
  border:   "#c7d8f5",
  border2:  "#a8c4ef",
  text:     "#1a2f5e",
  muted:    "#5c7ab0",
  dimmed:   "#94afd4",
  accent:   "#2563eb",
  accentG:  "rgba(37,99,235,0.10)",
  teal:     "#059669",
  tealG:    "rgba(5,150,105,0.10)",
  warning:  "#d97706",
  danger:   "#dc2626",
  w08:      "rgba(37,99,235,0.05)",
  w15:      "rgba(37,99,235,0.09)",
  w25:      "rgba(37,99,235,0.16)",
};

// ── TextField dark navy ───────────────────────────────────────────────────────
const fsx = {
  "& .MuiInputBase-root": { bgcolor: D.card, color: D.text, borderRadius: "7px", fontSize: "0.8rem" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: D.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: D.border2 },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: D.accent, borderWidth: "1.5px" },
  "& .MuiInputLabel-root": { color: D.muted, fontSize: "0.77rem" },
  "& .MuiInputLabel-root.Mui-focused": { color: D.accent },
  "& .MuiInputBase-input::placeholder": { color: D.dimmed, opacity: 1 },
};

// ── Progreso circular ─────────────────────────────────────────────────────────
function ProgresoCircular({ valor, size = 120 }) {
  const cx = size / 2, r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - valor / 100);
  const color = valor < 40 ? D.danger : valor < 80 ? D.warning : D.teal;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={D.w15} strokeWidth="8" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        <text x={cx} y={cx - 3} textAnchor="middle" dominantBaseline="middle"
          fill={color} style={{ fontSize: size * 0.2, fontWeight: 800, fontFamily: "inherit" }}>
          {valor}%
        </text>
        <text x={cx} y={cx + size * 0.14} textAnchor="middle" dominantBaseline="middle"
          fill={D.muted} style={{ fontSize: size * 0.076, fontFamily: "inherit" }}>
          completado
        </text>
      </svg>
    </Box>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
const InfoRow = ({ label, val }) =>
  val ? (
    <Box display="flex" justifyContent="space-between" gap={1} mb={0.35}>
      <Typography sx={{ fontSize: "0.69rem", color: D.muted, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.69rem", fontWeight: 700, color: D.text, textAlign: "right", wordBreak: "break-all" }}>{val}</Typography>
    </Box>
  ) : null;

// ── PayBlock — bloque de pago (una fila por tarjeta) ───────────────────────────
const PayBlock = ({ label, children, color }) => (
  <Box p={1.2} sx={{ bgcolor: D.w08, borderRadius: "8px",
    border: `1px solid ${color ? `${color}33` : D.border}` }}>
    <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: color || D.muted,
      mb: 0.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

// ── SeccionPago — tarjetas en filas completas ─────────────────────────────────
function SeccionPago({ data }) {
  const blocks = [];
  if (data.empresa_titular || data.empresa_dni)
    blocks.push({ label: "Titular", color: D.accent, node: <>
      <InfoRow label="Nombre" val={data.empresa_titular} />
      <InfoRow label="DNI"    val={data.empresa_dni} />
      <InfoRow label="RUC"    val={data.empresa_ruc} />
    </> });
  if (data.empresa_yape)
    blocks.push({ label: "Yape", color: "#a855f7", node: <InfoRow label="Número" val={data.empresa_yape} /> });
  if (data.empresa_cuenta || data.empresa_cci)
    blocks.push({ label: data.empresa_banco || "BBVA", color: "#3b82f6", node: <>
      <InfoRow label="Cuenta" val={data.empresa_cuenta} />
      <InfoRow label="CCI"    val={data.empresa_cci} />
    </> });
  if (data.empresa_bcp_cuenta || data.empresa_bcp_cci)
    blocks.push({ label: "BCP", color: D.teal, node: <>
      <InfoRow label="Cuenta" val={data.empresa_bcp_cuenta} />
      <InfoRow label="CCI"    val={data.empresa_bcp_cci} />
    </> });

  return (
    <Box>
      <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: D.accent, mb: 1,
        display: "flex", alignItems: "center", gap: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>
        <AccountBalance sx={{ fontSize: 12 }} /> Datos de pago
      </Typography>

      {data.empresa_descripcion && (
        <Typography sx={{ fontSize: "0.67rem", color: D.muted, mb: 1, whiteSpace: "pre-line" }}>
          {data.empresa_descripcion}
        </Typography>
      )}

      <Grid container spacing={1}>
        {blocks.map((b, i) => (
          <Grid item xs={12} key={i}>
            <PayBlock label={b.label} color={b.color}>{b.node}</PayBlock>
          </Grid>
        ))}
      </Grid>

      {(data.num_cuotas || 1) > 1 && data.cuotas?.length > 0 && (
        <Box mt={1}>
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: D.muted, mb: 0.5,
            textTransform: "uppercase", letterSpacing: 1 }}>
            Plan de {data.num_cuotas} cuotas
          </Typography>
          <Grid container spacing={0.5}>
            {data.cuotas.map(c => (
              <Grid item xs={12} key={c.numero}>
                <Box display="flex" justifyContent="space-between" alignItems="center"
                  px={1} py={0.5} sx={{ bgcolor: D.w08, borderRadius: "6px", border: `1px solid ${D.border}` }}>
                  <Typography sx={{ fontSize: "0.69rem", color: D.text }}>
                    Cuota {c.numero} — <strong>S/ {formatMontoSol(c.monto)}</strong>
                  </Typography>
                  <Chip size="small" label={
                    c.estado === "confirmado" ? "✓" : c.estado === "subido" ? "…" : "—"
                  } sx={{
                    height: 18, fontSize: "0.6rem", minWidth: 28,
                    bgcolor: c.estado === "confirmado" ? "rgba(6,214,160,0.2)"
                      : c.estado === "subido" ? "rgba(245,158,11,0.2)" : D.w08,
                    color: c.estado === "confirmado" ? D.teal
                      : c.estado === "subido" ? D.warning : D.muted,
                  }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

const estadoCuotaTxt = { pendiente: "Pendiente", subido: "En revisión", confirmado: "Confirmada" };

// ── SecLabel ──────────────────────────────────────────────────────────────────
const SecLabel = ({ icon: Icon, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
    {Icon && <Icon sx={{ fontSize: 13, color: D.accent }} />}
    <Typography sx={{ fontSize: "0.63rem", fontWeight: 800, color: D.muted,
      textTransform: "uppercase", letterSpacing: "1.5px", whiteSpace: "nowrap" }}>
      {children}
    </Typography>
    <Box sx={{ flex: 1, height: "1px", bgcolor: D.border }} />
  </Box>
);

// ── Canvas Live Preview ───────────────────────────────────────────────────────
function CanvasPreview({ form, imgPreview, progreso }) {
  const nombre = [form.form_nombres, form.form_apellidos].filter(Boolean).join(" ");
  const empresa = form.form_empresa || form.form_marca || "—";

  const fields = [
    { icon: <Email sx={{ fontSize: 11 }} />, val: form.form_email },
    { icon: <Phone sx={{ fontSize: 11 }} />, val: form.form_telefono || form.form_whatsapp },
    { icon: <LocationOn sx={{ fontSize: 11 }} />, val: form.form_direccion },
    { icon: <Public sx={{ fontSize: 11 }} />, val: form.form_dominio },
    { icon: <Palette sx={{ fontSize: 11 }} />, val: form.form_colores },
  ].filter(f => f.val);

  const color = progreso < 40 ? D.danger : progreso < 80 ? D.warning : D.teal;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: D.muted,
        textTransform: "uppercase", letterSpacing: "1.5px", display: "flex", alignItems: "center", gap: 0.5 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: D.teal,
          boxShadow: `0 0 6px ${D.teal}`, animation: "pulse 2s infinite" }} />
        Vista previa en vivo
      </Typography>

      {/* Card empresa */}
      <Box sx={{ bgcolor: D.card, borderRadius: "10px", border: `1px solid ${D.border}`,
        overflow: "hidden", transition: "all 0.3s ease" }}>
        {/* Header degradado */}
        <Box sx={{ background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
          p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          {imgPreview ? (
            <Box sx={{ width: 40, height: 40, borderRadius: "8px", overflow: "hidden",
              border: `2px solid ${D.accent}44`, flexShrink: 0, bgcolor: "#fff" }}>
              <img src={imgPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
          ) : (
            <Box sx={{ width: 40, height: 40, borderRadius: "8px", bgcolor: D.accentG,
              border: `2px dashed ${D.border2}`, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0 }}>
              <Business sx={{ fontSize: 18, color: D.dimmed }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff",
              lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {empresa}
            </Typography>
            {form.form_rubro && (
              <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.55)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {form.form_rubro}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ p: 1.2 }}>
          {nombre && (
            <Box display="flex" alignItems="center" gap={0.7} mb={0.8}>
              <Person sx={{ fontSize: 11, color: D.accent }} />
              <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: D.text }}>{nombre}</Typography>
            </Box>
          )}
          {fields.map((f, i) => (
            <Box key={i} display="flex" alignItems="flex-start" gap={0.7} mb={0.4}>
              <Box sx={{ color: D.muted, mt: "1px", flexShrink: 0 }}>{f.icon}</Box>
              <Typography sx={{ fontSize: "0.67rem", color: D.muted, lineHeight: 1.4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%" }}>
                {f.val}
              </Typography>
            </Box>
          ))}
          {fields.length === 0 && !nombre && (
            <Typography sx={{ fontSize: "0.67rem", color: D.dimmed, textAlign: "center", py: 1 }}>
              Completa el formulario para ver la vista previa
            </Typography>
          )}
          {form.form_ruc && (
            <Box sx={{ mt: 0.8, pt: 0.8, borderTop: `1px solid ${D.border}`, display: "flex", gap: 2 }}>
              <Typography sx={{ fontSize: "0.62rem", color: D.muted }}>RUC: <strong style={{ color: D.text }}>{form.form_ruc}</strong></Typography>
              {form.form_marca && <Typography sx={{ fontSize: "0.62rem", color: D.muted }}>Marca: <strong style={{ color: D.text }}>{form.form_marca}</strong></Typography>}
            </Box>
          )}
        </Box>
      </Box>

      {/* Progreso mini */}
      <Box sx={{ bgcolor: D.card, borderRadius: "10px", border: `1px solid ${D.border}`, p: 1.5 }}>
        <Box display="flex" justifyContent="space-between" mb={0.8}>
          <Typography sx={{ fontSize: "0.63rem", color: D.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            Progreso
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color }}>
            {progreso}%
          </Typography>
        </Box>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: D.w15, overflow: "hidden" }}>
          <Box sx={{ height: "100%", width: `${progreso}%`, borderRadius: 3,
            bgcolor: color, transition: "width 0.6s ease",
            boxShadow: `0 0 8px ${color}80` }} />
        </Box>

        {/* Campos faltantes */}
        <Box mt={1}>
          {[
            { label: "Empresa", done: !!form.form_empresa },
            { label: "Contacto", done: !!form.form_nombres && !!form.form_email },
            { label: "Teléfono", done: !!form.form_telefono },
            { label: "Descripción", done: !!form.form_desc_proyecto },
          ].map(({ label, done }) => (
            <Box key={label} display="flex" alignItems="center" gap={0.7} mb={0.35}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%",
                bgcolor: done ? D.teal : D.dimmed, flexShrink: 0,
                boxShadow: done ? `0 0 5px ${D.teal}` : "none",
                transition: "all 0.3s" }} />
              <Typography sx={{ fontSize: "0.63rem", color: done ? D.teal : D.muted,
                transition: "color 0.3s", textDecoration: done ? "line-through" : "none" }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Proyecto desc preview */}
      {form.form_desc_proyecto && (
        <Box sx={{ bgcolor: D.card, borderRadius: "10px", border: `1px solid ${D.border}`, p: 1.2 }}>
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: D.accent, mb: 0.5,
            textTransform: "uppercase", letterSpacing: 1 }}>
            Proyecto
          </Typography>
          <Typography sx={{ fontSize: "0.67rem", color: D.muted, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {form.form_desc_proyecto}
          </Typography>
        </Box>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </Box>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
const OnboardingPublicPage = () => {
  const { token } = useParams();

  const [data, setData]             = useState(null);
  const [estado, setEstado]         = useState("cargando");
  const [errorMsg, setErrorMsg]     = useState("");
  const [form, setForm]             = useState({});
  const [saving, setSaving]         = useState(false);
  const [modalGuardado, setModalGuardado] = useState(false);
  const [progresoGuardado, setProgresoGuardado] = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [pagos, setPagos]           = useState([]);
  const [cuotas, setCuotas]         = useState([]);
  const [uploadingPago, setUploadingPago] = useState({});
  const [eliminandoPago, setEliminandoPago] = useState({});
  const [eliminandoLogo, setEliminandoLogo] = useState(false);
  const [modalPagoOk, setModalPagoOk] = useState(false);
  const [confirmEliminarPago, setConfirmEliminarPago] = useState(null);
  const [modalEliminarPagoOk, setModalEliminarPagoOk] = useState(false);
  const [confirmEliminarLogo, setConfirmEliminarLogo] = useState(false);
  const [modalEliminarLogoOk, setModalEliminarLogoOk] = useState(false);
  const pagoRefs = useRef({});
  const fileRef  = useRef();

  const cargar = useCallback(async () => {
    setEstado("cargando");
    try {
      const res = await onboardingPublicoObtener(token);
      if (!res.success) { setEstado(res.estado || "error"); setErrorMsg(res.message); return; }
      const r = res.result;
      setForm({
        form_nombres:       r.form_nombres       || "",
        form_apellidos:     r.form_apellidos     || "",
        form_empresa:       r.form_empresa       || "",
        form_ruc:           r.form_ruc           || "",
        form_dni:           r.form_dni           || "",
        form_marca:         r.form_marca         || "",
        form_rubro:         r.form_rubro         || "",
        form_desc_proyecto: r.form_desc_proyecto || "",
        form_whatsapp:      r.form_whatsapp      || "",
        form_telefono:      r.form_telefono      || "",
        form_email:         r.form_email         || "",
        form_direccion:     r.form_direccion     || "",
        form_dominio:       r.form_dominio       || "",
        form_colores:       r.form_colores       || "",
      });
      setImgPreview(r.form_imagen_url ? urlLogoConVersion(r.form_imagen_url) : null);
      if (r.pagos_imagenes)  setPagos(r.pagos_imagenes);
      const cuotasMerged = mergeCuotasConPagos(r.cuotas || [], r.pagos_imagenes, token);
      setCuotas(cuotasMerged);
      setData({ ...r, cuotas: cuotasMerged });
      setEstado("activo");
    } catch (err) {
      const s = err?.response?.status;
      if (s === 410)      { setEstado("expirado"); setErrorMsg("Este enlace ha expirado."); }
      else if (s === 403) { setEstado("inactivo"); setErrorMsg("Este enlace ha sido desactivado."); }
      else                { setEstado("error");    setErrorMsg("No se pudo cargar el formulario."); }
    }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const res = await onboardingPublicoGuardar(token, form);
      if (res.success) {
        const p = res.result.progreso;
        setData(prev => ({ ...prev, progreso: p, form_completado: res.result.form_completado }));
        setProgresoGuardado(p);
        setModalGuardado(true);
      }
    } catch {}
    finally { setSaving(false); }
  };

  const handleImagen = async (file) => {
    if (!file) return;
    const prevUrl = imgPreview && !String(imgPreview).startsWith("blob:") ? imgPreview : null;
    const previewLocal = URL.createObjectURL(file);
    setImgPreview(previewLocal);
    setUploading(true);
    try {
      const res = await onboardingPublicoSubirImagen(token, file);
      if (res.success) {
        URL.revokeObjectURL(previewLocal);
        const url = urlLogoConVersion(res.result.form_imagen_url);
        setImgPreview(url);
        setData(p => ({ ...p, progreso: res.result.progreso, form_imagen_url: url }));
      } else {
        URL.revokeObjectURL(previewLocal);
        setImgPreview(prevUrl);
        Modal.error({
          title: "Error al subir logo",
          content: res.message || "No se pudo guardar el logo.",
          zIndex: 2000,
        });
      }
    } catch (err) {
      URL.revokeObjectURL(previewLocal);
      setImgPreview(prevUrl);
      Modal.error({
        title: "Error al subir logo",
        content: err?.response?.data?.message || "No se pudo guardar el logo. Inténtalo de nuevo.",
        zIndex: 2000,
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const aplicarResultadoPago = (result) => {
    const pagosNuevos = result.pagos ?? result.pagos_imagenes;
    if (pagosNuevos) setPagos(pagosNuevos);

    setCuotas((prevCuotas) => {
      const base = (result.cuotas?.length ? result.cuotas : prevCuotas) || [];
      const merged = mergeCuotasConPagos(base, pagosNuevos || pagos, token);
      setData((p) => ({
        ...p,
        progreso: result.progreso ?? p?.progreso,
        cuotas: merged,
        pagos_imagenes: pagosNuevos || p?.pagos_imagenes,
      }));
      return merged;
    });
  };

  const handlePagoImagen = async (file, numeroCuota = 1) => {
    if (!file) return;
    const key = String(numeroCuota);
    setUploadingPago(p => ({ ...p, [key]: true }));
    try {
      const res = await onboardingPublicoSubirPagoImagen(token, file, numeroCuota);
      if (res.success) { aplicarResultadoPago(res.result); setModalPagoOk(true); }
    } catch {}
    finally {
      setUploadingPago(p => ({ ...p, [key]: false }));
      const ref = pagoRefs.current[key];
      if (ref) ref.value = "";
    }
  };

  const solicitarEliminarComprobante = (filename) => {
    if (!filename) return;
    setConfirmEliminarPago({ filename });
  };

  const cancelarEliminarComprobante = () => setConfirmEliminarPago(null);

  const confirmarEliminarComprobante = async () => {
    const filename = confirmEliminarPago?.filename;
    if (!filename) return;
    setConfirmEliminarPago(null);
    setEliminandoPago(p => ({ ...p, [filename]: true }));
    try {
      const res = await onboardingPublicoEliminarPagoImagen(token, filename);
      if (res.success) {
        aplicarResultadoPago(res.result);
        setModalEliminarPagoOk(true);
      }
    } catch {}
    finally { setEliminandoPago(p => ({ ...p, [filename]: false })); }
  };

  const solicitarEliminarLogo = () => setConfirmEliminarLogo(true);

  const cancelarEliminarLogo = () => setConfirmEliminarLogo(false);

  const confirmarEliminarLogo = async () => {
    setConfirmEliminarLogo(false);
    setEliminandoLogo(true);
    try {
      const res = await onboardingPublicoEliminarImagen(token);
      if (res.success) {
        setImgPreview(null);
        setData(p => ({
          ...p,
          progreso: res.result.progreso ?? p?.progreso,
          form_imagen_url: null,
        }));
        if (fileRef.current) fileRef.current.value = "";
        setModalEliminarLogoOk(true);
      }
    } catch {}
    finally { setEliminandoLogo(false); }
  };

  const c = (campo) => (e) => setForm(p => ({ ...p, [campo]: e.target.value }));

  // ── Estados carga/error ───────────────────────────────────────────────────
  if (estado === "cargando") return (
    <Box sx={{ minHeight: "100vh", bgcolor: D.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box textAlign="center">
        <CircularProgress size={42} sx={{ color: D.accent }} />
        <Typography sx={{ mt: 2, color: D.muted, fontSize: "0.8rem" }}>Cargando formulario...</Typography>
      </Box>
    </Box>
  );

  if (estado !== "activo") {
    const msgs = {
      expirado: { icon: "⏰", titulo: "Enlace expirado",       color: D.warning },
      inactivo: { icon: "🔒", titulo: "Enlace desactivado",    color: D.muted },
      error:    { icon: "⚠️", titulo: "Enlace no disponible", color: D.danger },
    };
    const m = msgs[estado] || msgs.error;
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: D.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ p: 5, maxWidth: 400, textAlign: "center", bgcolor: D.surface,
          borderRadius: "16px", border: `1px solid ${D.border}` }}>
          <Typography fontSize={52}>{m.icon}</Typography>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: m.color, mt: 1 }}>{m.titulo}</Typography>
          <Typography sx={{ color: D.muted, mt: 1, fontSize: "0.8rem" }}>{errorMsg}</Typography>
        </Box>
      </Box>
    );
  }

  // ── Pago confirmado ───────────────────────────────────────────────────────
  if (data?.pago_confirmado) return (
    <Box sx={{ minHeight: "100vh", bgcolor: D.bg, display: "flex", alignItems: "center",
      justifyContent: "center", py: 6, px: 2 }}>
      <Box sx={{ p: { xs: 3, sm: 5 }, maxWidth: 480, width: "100%", textAlign: "center",
        bgcolor: D.surface, borderRadius: "20px", border: `1px solid rgba(6,214,160,0.3)` }}>
        <Typography fontSize={60} lineHeight={1.2}>🎉</Typography>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: D.teal, mt: 1 }}>¡Proceso completo!</Typography>
        <Typography sx={{ color: D.muted, mt: 1, fontSize: "0.8rem", lineHeight: 1.7 }}>
          Recibimos tu información y tu pago fue confirmado.<br/>
          Nos contactaremos muy pronto para iniciar tu proyecto.
        </Typography>
        <Box sx={{ mt: 3, p: 2, bgcolor: D.w08, borderRadius: "10px", textAlign: "left" }}>
          {["Formulario con datos personales y de empresa",
            "Logo o archivo de referencia subido",
            "Comprobante de pago enviado y verificado"].map((txt, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1} mb={0.5}>
              <CheckCircle sx={{ fontSize: 13, color: D.teal }} />
              <Typography sx={{ fontSize: "0.73rem", color: D.muted }}>{txt}</Typography>
            </Box>
          ))}
        </Box>
        <Button fullWidth variant="outlined"
          onClick={() => window.open(`/onboarding/reporte/${token}`, "_blank")}
          sx={{ mt: 3, borderRadius: "10px", fontWeight: 700, fontSize: "0.78rem",
            borderColor: D.teal, color: D.teal,
            "&:hover": { bgcolor: D.tealG, borderColor: D.teal } }}>
          Ver / Descargar mi reporte PDF
        </Button>
      </Box>
    </Box>
  );

  const pendientes = [];
  if (!data.form_completado) pendientes.push("Completa todos los campos del formulario");
  if (!imgPreview)           pendientes.push("Sube el logo de tu empresa");
  if (!data.pago_confirmado) pendientes.push("Confirma tu pago enviando la captura");
  const esCompleto = progresoGuardado >= 100;

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: D.bg, display: "flex", flexDirection: "column" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", borderBottom: "1px solid #1d4ed8",
        px: { xs: 2, md: 3 }, py: 1, display: "flex",
        alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Accent bar */}
          <Box sx={{ width: 3, height: 28, borderRadius: 2,
            background: `linear-gradient(180deg, ${D.accent}, ${D.teal})` }} />
          <Box>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {data.empresa_nombre || "royalsensorymassage"}
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>
              Completa tus datos para iniciar el proyecto
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            icon={<Schedule sx={{ fontSize: "11px !important", color: "#fff !important" }} />}
            label={`Vence en ${data.dias_restantes} día(s)`} size="small"
            sx={{ bgcolor: "#f97316", color: "#fff",
              border: "none", fontSize: "0.65rem", height: 22,
              fontWeight: 700, boxShadow: "0 2px 8px rgba(249,115,22,0.45)" }} />
          {data.form_completado && (
            <AntTooltip title="Ya completaste el formulario. Solo falta confirmar el pago." color="#1a2540">
              <Chip
                icon={<CheckCircle sx={{ fontSize: "11px !important", color: "#fff !important" }} />}
                label="Datos enviados — falta pago" size="small" sx={{ cursor: "help",
                  bgcolor: "#16a34a", color: "#fff", border: "none",
                  fontSize: "0.65rem", height: 22,
                  fontWeight: 700, boxShadow: "0 2px 8px rgba(22,163,74,0.45)" }} />
            </AntTooltip>
          )}
        </Box>
      </Box>

      {/* ── Body 4 paneles ─────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Panel 1: Progreso + Datos de pago ────────────────────────── */}
        <Box sx={{
          width: 210, flexShrink: 0, bgcolor: "#fff",
          borderRight: `1px solid ${D.border}`, overflowY: "auto", p: 1.8,
          display: { xs: "none", lg: "flex" }, flexDirection: "column", gap: 1.5,
        }}>
          {/* Progreso circular */}
          <Box display="flex" justifyContent="center" pt={0.5}>
            <ProgresoCircular valor={data.progreso} size={110} />
          </Box>
          {/* Indicadores */}
          <Box sx={{ p: 1.2, bgcolor: D.card, borderRadius: "9px", border: `1px solid ${D.border}` }}>
            {[
              { label: "Formulario", done: data.form_completado,              pct: "80%" },
              { label: "Logo",       done: !!imgPreview,                      pct: "10%" },
              { label: "Comprobante",done: data.pago_confirmado || pagos.length > 0, pct: "10%" },
            ].map(({ label, done, pct }) => (
              <Box key={label} display="flex" alignItems="center" gap={0.8} mb={0.5}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%",
                  bgcolor: done ? D.teal : D.dimmed, flexShrink: 0,
                  boxShadow: done ? `0 0 5px ${D.teal}` : "none" }} />
                <Typography sx={{ fontSize: "0.65rem", color: done ? D.teal : D.muted }}>
                  {label} <span style={{ color: D.dimmed }}>({pct})</span>
                </Typography>
              </Box>
            ))}
          </Box>
          <Divider sx={{ borderColor: D.border }} />
          <SeccionPago data={data} />
        </Box>

        {/* ── Panel 2: Monto + Cuotas/Comprobantes + QR ─────────────────── */}
        <Box sx={{
          width: 230, flexShrink: 0, bgcolor: D.card,
          borderRight: `1px solid ${D.border}`, overflowY: "auto", p: 1.8,
          display: { xs: "none", lg: "flex" }, flexDirection: "column", gap: 1.2,
        }}>
          {/* Monto total */}
          {data.empresa_monto && (
            <Box sx={{ p: 1.5, bgcolor: D.tealG, borderRadius: "10px",
              border: `1.5px solid ${D.teal}22`, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.62rem", color: D.muted, fontWeight: 600 }}>
                {(data.num_cuotas || 1) > 1 ? "Monto total" : "Monto a pagar"}
              </Typography>
              <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: D.teal, lineHeight: 1.2 }}>
                S/ {parseFloat(data.empresa_monto).toFixed(2)}
              </Typography>
            </Box>
          )}

          {/* Cuotas o comprobante único */}
          {(data.num_cuotas || 1) > 1 && (cuotas.length > 0 || data.cuotas?.length > 0) ? (
            <Box>
              <Typography sx={{ fontSize: "0.63rem", fontWeight: 800, color: D.muted,
                textTransform: "uppercase", letterSpacing: 1, mb: 0.8 }}>
                Plan de {data.num_cuotas} cuotas
              </Typography>
              <AntImage.PreviewGroup preview={PREVIEW_IMAGEN}>
              <Box display="flex" flexDirection="column" gap={0.8}>
                {(cuotas.length ? cuotas : data.cuotas || []).map((c) => {
                  const key = String(c.numero);
                  const bloqueado = c.estado === "confirmado" || data.pago_confirmado;
                  const imgUrl = c.url || urlMediaPago(token, c.filename);
                  const tieneComp = !!(imgUrl || c.filename || c.estado === "subido" || c.estado === "confirmado");
                  const colorBorder = c.estado === "confirmado" ? D.teal
                    : c.estado === "subido" ? D.warning : D.border;
                  return (
                    <Box key={c.numero} sx={{ bgcolor: "#fff", borderRadius: "9px",
                      border: `1.5px solid ${colorBorder}`, overflow: "hidden" }}>
                      {/* Cuota header */}
                      <Box sx={{ px: 1.2, py: 0.8, display: "flex",
                        justifyContent: "space-between", alignItems: "center",
                        bgcolor: tieneComp ? `${colorBorder}18` : D.bg }}>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: D.text }}>
                          Cuota {c.numero} — S/ {formatMontoSol(c.monto)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", fontWeight: 600,
                          color: c.estado === "confirmado" ? D.teal
                            : c.estado === "subido" ? D.warning : D.dimmed }}>
                          {estadoCuotaTxt[c.estado] || c.estado}
                        </Typography>
                      </Box>
                      {/* Miniatura */}
                      {tieneComp && imgUrl && (
                        <Box sx={{ px: 1.2, pt: 0.6, pb: 0.4 }}>
                          <Box sx={{ position: "relative", width: 80, height: 60,
                            borderRadius: "6px", overflow: "hidden",
                            border: `1px solid ${D.border}`, bgcolor: D.card,
                            "&:hover .del-cuota": { opacity: 1 } }}>
                            <AntImage
                              src={imgUrl}
                              alt={`Comprobante cuota ${c.numero}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              preview={PREVIEW_IMAGEN}
                            />
                            {!bloqueado && c.filename && (
                              <IconButton className="del-cuota" size="small"
                                disabled={eliminandoPago[c.filename]}
                                onClick={e => { e.stopPropagation(); solicitarEliminarComprobante(c.filename); }}
                                sx={{ position: "absolute", top: 1, right: 1, opacity: 0,
                                  bgcolor: "rgba(220,38,38,0.9)", color: "#fff", width: 18, height: 18, p: 0,
                                  "&:hover": { bgcolor: D.danger } }}>
                                {eliminandoPago[c.filename]
                                  ? <CircularProgress size={9} color="inherit" />
                                  : <Close sx={{ fontSize: 11 }} />}
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      )}
                      {/* Botón subir */}
                      {!bloqueado && (
                        <Box sx={{ px: 1.2, pb: 1 }}>
                          <Button fullWidth component="label" size="small"
                            startIcon={uploadingPago[key] ? <CircularProgress size={10} sx={{ color: D.accent }} /> : <Upload sx={{ fontSize: 12 }} />}
                            disabled={uploadingPago[key]}
                            sx={{ bgcolor: D.w08, color: D.accent, border: `1px solid ${D.border}`,
                              borderRadius: "6px", textTransform: "none", fontSize: "0.66rem",
                              "&:hover": { bgcolor: D.accentG } }}>
                            {uploadingPago[key] ? "Subiendo..." : tieneComp ? "Cambiar" : "Subir comprobante"}
                            <input ref={el => { pagoRefs.current[key] = el; }} hidden type="file" accept="image/*"
                              onChange={e => e.target.files[0] && handlePagoImagen(e.target.files[0], c.numero)} />
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
              </AntImage.PreviewGroup>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontSize: "0.63rem", fontWeight: 800, color: D.muted,
                textTransform: "uppercase", letterSpacing: 1, mb: 0.8 }}>
                Comprobantes de pago
              </Typography>
              {pagos.length > 0 ? (
                <AntImage.PreviewGroup preview={PREVIEW_IMAGEN}>
                  <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={0.5} mb={0.8}>
                    {pagos.map((item, i) => {
                      const { url, filename } = normalizarComprobante(item);
                      return (
                        <Box key={filename || i} sx={{ borderRadius: "6px", overflow: "hidden",
                          border: `1px solid ${D.border}`, aspectRatio: "1", position: "relative",
                          "&:hover": { borderColor: D.accent }, "&:hover .del-btn": { opacity: 1 } }}>
                          <AntImage src={url} alt={`Pago ${i + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            preview={PREVIEW_IMAGEN} />
                          <IconButton className="del-btn" size="small" disabled={eliminandoPago[filename]}
                              onClick={e => { e.stopPropagation(); solicitarEliminarComprobante(filename); }}
                            sx={{ position: "absolute", top: 2, right: 2, opacity: 0,
                              bgcolor: "rgba(220,38,38,0.9)", color: "#fff", width: 18, height: 18, p: 0,
                              "&:hover": { bgcolor: D.danger } }}>
                            {eliminandoPago[filename] ? <CircularProgress size={9} color="inherit" /> : <Close sx={{ fontSize: 11 }} />}
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                </AntImage.PreviewGroup>
              ) : (
                <Box sx={{ p: 1.2, bgcolor: "#fff", borderRadius: "7px", textAlign: "center",
                  border: `1px dashed ${D.border}`, mb: 0.8 }}>
                  <Typography sx={{ fontSize: "0.63rem", color: D.dimmed }}>Sin comprobantes aún</Typography>
                </Box>
              )}
              {!data.pago_confirmado && (
                <Button fullWidth component="label" size="small"
                  startIcon={uploadingPago["1"] ? <CircularProgress size={10} sx={{ color: D.accent }} /> : <Upload sx={{ fontSize: 12 }} />}
                  disabled={uploadingPago["1"]}
                  sx={{ bgcolor: "#fff", color: D.accent, border: `1px solid ${D.border}`,
                    borderRadius: "7px", textTransform: "none", fontSize: "0.68rem",
                    "&:hover": { bgcolor: D.accentG } }}>
                  {uploadingPago["1"] ? "Subiendo..." : "Subir comprobante"}
                  <input ref={el => { pagoRefs.current["1"] = el; }} hidden type="file" accept="image/*"
                    onChange={e => e.target.files[0] && handlePagoImagen(e.target.files[0], 1)} />
                </Button>
              )}
            </Box>
          )}

          <Divider sx={{ borderColor: D.border }} />

          {/* QR */}
          <Box textAlign="center">
            <Typography sx={{ fontSize: "0.62rem", color: D.muted, mb: 0.8,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
              <QrCode2 sx={{ fontSize: 12 }} /> Escanea para pagar con Yape
            </Typography>
            <img src={data.empresa_qr_url || QR_DEFAULT} alt="QR"
              style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 10,
                border: `1px solid ${D.border}`, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }} />
          </Box>
        </Box>

        {/* ── Panel 3: Formulario central (3 columnas) ─────────────────── */}
        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 2.5 } }}>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>

            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Assignment sx={{ fontSize: 15, color: D.accent }} />
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: D.text }}>
                Datos necesarios para iniciar su proyecto
              </Typography>
            </Box>

            {/* ── EMPRESA 3 col ──────────────────────────────────────────── */}
            <Box sx={{ bgcolor: D.surface, borderRadius: "11px", border: `1px solid ${D.border}`, p: 2, mb: 1.5 }}>
              <SecLabel icon={Business}>Datos de la empresa</SecLabel>
              <Grid container spacing={1.2}>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Razón Social de la Empresa"
                    value={form.form_empresa} onChange={c("form_empresa")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="RUC"
                    value={form.form_ruc} onChange={c("form_ruc")} inputProps={{ maxLength: 11 }} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Nombre de la Marca"
                    value={form.form_marca} onChange={c("form_marca")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Rubro de la Empresa"
                    placeholder="Ej: Tecnología, Salud..."
                    value={form.form_rubro} onChange={c("form_rubro")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="DNI del representante"
                    value={form.form_dni} onChange={c("form_dni")} inputProps={{ maxLength: 8 }} sx={fsx} />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth size="small" label="Concepto o descripción del proyecto"
                    multiline rows={2} placeholder="Describe brevemente qué necesitas..."
                    value={form.form_desc_proyecto} onChange={c("form_desc_proyecto")} sx={fsx} />
                </Grid>
              </Grid>
            </Box>

            {/* ── CONTACTO 3 col ─────────────────────────────────────────── */}
            <Box sx={{ bgcolor: D.surface, borderRadius: "11px", border: `1px solid ${D.border}`, p: 2, mb: 1.5 }}>
              <SecLabel icon={ContactPhone}>Datos de contacto</SecLabel>
              <Grid container spacing={1.2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Nombre *"
                    value={form.form_nombres} onChange={c("form_nombres")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Apellido *"
                    value={form.form_apellidos} onChange={c("form_apellidos")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Correo electrónico *" type="email"
                    value={form.form_email} onChange={c("form_email")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Número de contacto *"
                    value={form.form_telefono} onChange={c("form_telefono")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="WhatsApp Business"
                    placeholder="Ej: 51 987 654 321"
                    value={form.form_whatsapp} onChange={c("form_whatsapp")} sx={fsx} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField fullWidth size="small" label="Dirección"
                    value={form.form_direccion} onChange={c("form_direccion")} sx={fsx} />
                </Grid>
              </Grid>
            </Box>

            {/* ── WEB + LOGO en fila ────────────────────────────────────── */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: D.surface, borderRadius: "11px", border: `1px solid ${D.border}`, p: 2, height: "100%" }}>
                  <SecLabel icon={Language}>Web y diseño</SecLabel>
                  <Grid container spacing={1.2}>
                    <Grid item xs={12}>
                      <TextField fullWidth size="small" label="Dominio (si ya tiene uno)"
                        placeholder="Ej: miempresa.com"
                        value={form.form_dominio} onChange={c("form_dominio")} sx={fsx} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth size="small" label="Colores de la empresa"
                        placeholder="Ej: #1A73E8, azul marino..."
                        value={form.form_colores} onChange={c("form_colores")} sx={fsx} />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: D.surface, borderRadius: "11px", border: `1px solid ${D.border}`, p: 2, height: "100%" }}>
                  <SecLabel icon={Upload}>Logo de la empresa</SecLabel>
                  <Typography sx={{ fontSize: "0.67rem", color: D.muted, mb: 1.2 }}>
                    PNG, JPG, SVG, PDF, AI — máx. 8 MB
                  </Typography>
                  {imgPreview && (
                    <Box mb={1.2} display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
                        <AntImage
                          src={imgPreview}
                          alt="Logo de la empresa"
                          style={{
                            maxHeight: 56, maxWidth: 120, borderRadius: 6,
                            border: `1px solid ${D.border}`, background: "#fff", padding: 3,
                            objectFit: "contain", display: "block", cursor: "zoom-in",
                          }}
                          preview={PREVIEW_IMAGEN}
                        />
                        <IconButton size="small" disabled={eliminandoLogo} onClick={solicitarEliminarLogo}
                          sx={{ position: "absolute", top: -6, right: -6, bgcolor: D.danger,
                            color: "#fff", width: 20, height: 20, border: `2px solid ${D.surface}`,
                            "&:hover": { bgcolor: "#dc2626" } }}>
                          {eliminandoLogo ? <CircularProgress size={10} color="inherit" /> : <Close sx={{ fontSize: 12 }} />}
                        </IconButton>
                      </Box>
                      <Typography sx={{ fontSize: "0.65rem", color: D.teal }}>
                        Logo guardado ✓
                      </Typography>
                    </Box>
                  )}
                  <Button component="label" size="small"
                    startIcon={uploading ? <CircularProgress size={12} sx={{ color: D.text }} /> : <Upload sx={{ fontSize: 13 }} />}
                    disabled={uploading}
                    sx={{ bgcolor: D.w08, color: D.text, border: `1px solid ${D.border}`,
                      borderRadius: "7px", textTransform: "none", fontSize: "0.72rem", px: 2,
                      "&:hover": { bgcolor: D.w15 } }}>
                    {uploading ? "Subiendo..." : imgPreview ? "Cambiar logo" : "Seleccionar logo"}
                    <input ref={fileRef} hidden type="file" accept="image/*,.svg,.pdf"
                      onChange={e => e.target.files[0] && handleImagen(e.target.files[0])} />
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* ── Guardar ──────────────────────────────────────────────── */}
            <Button variant="contained" fullWidth size="large" onClick={handleGuardar}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <CheckCircle sx={{ fontSize: 18 }} />}
              sx={{ py: 1.2, fontWeight: 800, borderRadius: "10px", fontSize: "0.88rem",
                background: `linear-gradient(135deg, ${D.accent} 0%, #2563eb 100%)`,
                textTransform: "none",
                boxShadow: `0 4px 20px rgba(77,158,246,0.35)`,
                "&:hover": { background: `linear-gradient(135deg, #3a8ef0 0%, #1d4ed8 100%)`,
                  boxShadow: `0 6px 26px rgba(77,158,246,0.5)` },
                "&.Mui-disabled": { bgcolor: D.dimmed, color: D.muted } }}>
              {saving ? "Guardando..." : "Guardar todos los datos"}
            </Button>

          </Box>
        </Box>

        {/* ── Canvas live preview (derecha) ────────────────────────────── */}
        <Box sx={{
          width: 230, flexShrink: 0, bgcolor: D.surface,
          borderLeft: `1px solid ${D.border}`, overflowY: "auto", p: 2,
          display: { xs: "none", xl: "flex" }, flexDirection: "column",
        }}>
          <CanvasPreview form={form} imgPreview={imgPreview} progreso={data.progreso} />
        </Box>

      </Box>

      {/* ── Modales ──────────────────────────────────────────────────────────── */}
      <Modal open={modalGuardado} onCancel={() => setModalGuardado(false)}
        footer={null} centered width={400}>
        {esCompleto ? (
          <Result status="success" title="¡Felicitaciones!"
            subTitle="Completaste todo. Nos pondremos en contacto muy pronto."
            extra={[<button key="ok" onClick={() => setModalGuardado(false)}
              style={{ background: "#22c55e", color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              ¡Gracias!
            </button>]} />
        ) : (
          <Result status="info" title="¡Guardado exitoso!" subTitle="Tus datos fueron guardados correctamente."
            extra={[<Box key="p" textAlign="left" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>
                Aún te falta completar:
              </Typography>
              <Box sx={{ bgcolor: "#fff8e1", borderRadius: 2, p: 1.5 }}>
                {pendientes.map((p, i) => (
                  <Box key={i} display="flex" gap={1} mb={i < pendientes.length - 1 ? 0.7 : 0}>
                    <span style={{ fontSize: 12 }}>⚠️</span>
                    <Typography variant="body2" color="text.secondary" fontSize="0.76rem">{p}</Typography>
                  </Box>
                ))}
              </Box>
              <LinearProgress variant="determinate" value={progresoGuardado}
                sx={{ mt: 1.5, height: 7, borderRadius: 4 }} />
              <Typography variant="caption" color="text.secondary">{progresoGuardado}% completado</Typography>
              <Box textAlign="center" mt={2}>
                <button onClick={() => setModalGuardado(false)}
                  style={{ background: "#3b82f6", color: "#fff", border: "none",
                    borderRadius: 8, padding: "8px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Continuar
                </button>
              </Box>
            </Box>]} />
        )}
      </Modal>

      <Modal open={modalPagoOk} onCancel={() => setModalPagoOk(false)}
        footer={null} centered width={360}>
        <Result status="success" title="¡Comprobante recibido!"
          subTitle="Tu captura fue guardada. Puedes subir más si necesitas."
          extra={[<button key="ok" onClick={() => setModalPagoOk(false)}
            style={{ background: "#22c55e", color: "#fff", border: "none",
              borderRadius: 8, padding: "8px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Entendido
          </button>]} />
      </Modal>

      <Modal
        open={!!confirmEliminarPago}
        onCancel={cancelarEliminarComprobante}
        footer={null}
        centered
        width={380}
        zIndex={1500}
      >
        <Result
          status="warning"
          title="¿Eliminar comprobante?"
          subTitle="Esta acción quitará la imagen del comprobante de pago. Podrás subir otra después si lo necesitas."
          extra={[
            <Box key="actions" display="flex" gap={1} justifyContent="center" flexWrap="wrap">
              <button
                type="button"
                onClick={cancelarEliminarComprobante}
                style={{
                  background: "#fff", color: "#475569", border: "1px solid #cbd5e1",
                  borderRadius: 8, padding: "8px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                No, cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarComprobante}
                disabled={!!eliminandoPago[confirmEliminarPago?.filename]}
                style={{
                  background: "#dc2626", color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  opacity: eliminandoPago[confirmEliminarPago?.filename] ? 0.7 : 1,
                }}
              >
                {eliminandoPago[confirmEliminarPago?.filename] ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </Box>,
          ]}
        />
      </Modal>

      <Modal
        open={modalEliminarPagoOk}
        onCancel={() => setModalEliminarPagoOk(false)}
        footer={null}
        centered
        width={360}
        zIndex={1500}
      >
        <Result
          status="success"
          title="Comprobante eliminado"
          subTitle="La imagen se eliminó correctamente."
          extra={[
            <button
              key="ok"
              type="button"
              onClick={() => setModalEliminarPagoOk(false)}
              style={{
                background: "#22c55e", color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Entendido
            </button>,
          ]}
        />
      </Modal>

      <Modal
        open={confirmEliminarLogo}
        onCancel={cancelarEliminarLogo}
        footer={null}
        centered
        width={380}
        zIndex={1500}
      >
        <Result
          status="warning"
          title="¿Eliminar logo?"
          subTitle="Se quitará el logo de la empresa. Podrás subir otro archivo después si lo necesitas."
          extra={[
            <Box key="actions" display="flex" gap={1} justifyContent="center" flexWrap="wrap">
              <button
                type="button"
                onClick={cancelarEliminarLogo}
                style={{
                  background: "#fff", color: "#475569", border: "1px solid #cbd5e1",
                  borderRadius: 8, padding: "8px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                No, cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarLogo}
                disabled={eliminandoLogo}
                style={{
                  background: "#dc2626", color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  opacity: eliminandoLogo ? 0.7 : 1,
                }}
              >
                {eliminandoLogo ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </Box>,
          ]}
        />
      </Modal>

      <Modal
        open={modalEliminarLogoOk}
        onCancel={() => setModalEliminarLogoOk(false)}
        footer={null}
        centered
        width={360}
        zIndex={1500}
      >
        <Result
          status="success"
          title="Logo eliminado"
          subTitle="El archivo se eliminó correctamente."
          extra={[
            <button
              key="ok"
              type="button"
              onClick={() => setModalEliminarLogoOk(false)}
              style={{
                background: "#22c55e", color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Entendido
            </button>,
          ]}
        />
      </Modal>
    </Box>
  );
};

export default OnboardingPublicPage;
