import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton, Tooltip, Chip, Typography,
  Box, Grid, Divider, CircularProgress, LinearProgress,
  Alert, Tabs, Tab, Badge, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import {
  Close, ContentCopy, WhatsApp, Link as LinkIcon,
  Add, Delete, Refresh, CheckCircle, Cancel,
  AccessTime, Visibility, CloudUpload, Edit as EditIcon, Save, PictureAsPdf,
} from "@mui/icons-material";
import {
  onboardingListar, onboardingCrear, onboardingActualizar,
  onboardingEliminar, onboardingSubirQR, onboardingSubirPagoImagen, onboardingEliminarPagoImagen,
  fetchOnboardingPdf, dividirCuotas, formatMontoSol,
} from "../../api/onboarding.api";
import { toastSuccess, handleErrorMessages } from "../../components/notify-messages";
import { Modal as AntModal, Image as AntImage, Result } from "antd";
import "antd/dist/reset.css";

const QR_DEFAULT = `${import.meta.env.VITE_AUTHJWT_DOMAIN}${import.meta.env.VITE_QR_YAPE_URL}`;

// ── Helpers ─────────────────────────────────────────────────────────────────

const estadoColor = { activo: "success", inactivo: "warning", expirado: "error" };
const estadoLabel = { activo: "Activo", inactivo: "Inactivo", expirado: "Expirado" };

/** API devuelve { url, filename }; compatibilidad con URLs en string */
const normalizarComprobante = (item) => {
  if (typeof item === "string") {
    const name = item.split("/").pop()?.split("?")[0] || "";
    return { url: item, filename: decodeURIComponent(name) };
  }
  return { url: item.url, filename: item.filename };
};

/** Datos bancarios del titular pre-cargados por defecto */
const defaultEmpresa = {
  dias_vigencia:      7,
  empresa_nombre:     "royalsensorymassage",
  empresa_titular:    "Jorge Jhovani Valverde León",
  empresa_dni:        "42774713",
  // Yape
  empresa_yape:       "970 048 451",
  // BBVA
  empresa_banco:      "BBVA",
  empresa_cuenta:     "0011-0814-0269706304",
  empresa_cci:        "01181400026970630414",
  // BCP
  empresa_bcp_cuenta: "19128227720047",
  empresa_bcp_cci:    "00219112822772004756",
  empresa_ruc:        "",
  empresa_monto:      "",
  num_cuotas:         1,
  empresa_descripcion:"",
};

const estadoCuotaLabel = { pendiente: "Pendiente", subido: "Subida", confirmado: "Confirmada" };
const estadoCuotaColor = { pendiente: "default", subido: "warning", confirmado: "success" };

// ── Componente progreso circular ─────────────────────────────────────────────

function ProgresoCircular({ valor, size = 80 }) {
  const color = valor < 40 ? "#f44336" : valor < 80 ? "#ff9800" : "#4caf50";
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate" value={valor} size={size}
        sx={{ color, "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }}
      />
      <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="caption" fontWeight={700} fontSize={size * 0.18}>
          {valor}%
        </Typography>
      </Box>
    </Box>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────

const OnboardingModal = ({ open, onClose, cliente }) => {
  const [links, setLinks]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [tab, setTab]                 = useState(0);   // 0=Lista, 1=Nuevo
  const [form, setForm]               = useState({ ...defaultEmpresa });
  const [saving, setSaving]           = useState(false);
  const [qrUploading, setQrUploading] = useState({});
  const [editando, setEditando]       = useState({});
  const [savingEdit, setSavingEdit]   = useState({});
  const [reporteUrl, setReporteUrl]         = useState(null); // blob URL del PDF
  const [reporteLoading, setReporteLoading] = useState(false);
  const [reporteToken, setReporteToken]     = useState(null); // token activo

  const cargar = useCallback(async () => {
    if (!cliente) return;
    setLoading(true);
    try {
      const res = await onboardingListar({ id_cliente: cliente.id_cliente });
      setLinks(res || []);
    } catch (e) { handleErrorMessages(e); }
    finally { setLoading(false); }
  }, [cliente]);

  useEffect(() => { if (open) { cargar(); setTab(0); setForm({ ...defaultEmpresa }); } }, [open, cargar]);

  const f = (campo) => (e) => setForm(p => ({ ...p, [campo]: e.target.value }));

  // ── Crear ──
  const handleCrear = async () => {
    setSaving(true);
    try {
      await onboardingCrear({ id_cliente: cliente.id_cliente, ...form });
      toastSuccess("Enlace creado correctamente.");
      setTab(0);
      setForm({ ...defaultEmpresa });
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setSaving(false); }
  };

  // ── Cambiar estado (activar / inactivar) ──
  const toggleEstado = async (link) => {
    const nuevoEstado = link.estado === "activo" ? "inactivo" : "activo";
    try {
      await onboardingActualizar({ id_onboarding: link.id_onboarding, estado: nuevoEstado });
      toastSuccess(`Enlace ${nuevoEstado === "activo" ? "activado" : "desactivado"}.`);
      cargar();
    } catch (e) { handleErrorMessages(e); }
  };

  // ── Eliminar ──
  const handleEliminar = async (link) => {
    if (!window.confirm("¿Eliminar este enlace de onboarding?")) return;
    try {
      await onboardingEliminar(link.id_onboarding);
      toastSuccess("Enlace eliminado.");
      cargar();
    } catch (e) { handleErrorMessages(e); }
  };

  // ── Edición inline ──
  const abrirEdicion = (link) => {
    // Prioridad: valor guardado en el enlace → valor por defecto (datos bancarios precargados)
    const v = (campo) => link[campo] || defaultEmpresa[campo] || "";
    setEditando(p => ({
      ...p,
      [link.id_onboarding]: {
        dias_vigencia:       link.dias_vigencia || defaultEmpresa.dias_vigencia,
        empresa_nombre:      v("empresa_nombre"),
        empresa_monto:       link.empresa_monto || "",
        num_cuotas:          link.num_cuotas || 1,
        empresa_titular:     v("empresa_titular"),
        empresa_dni:         v("empresa_dni"),
        empresa_ruc:         v("empresa_ruc"),
        empresa_yape:        v("empresa_yape"),
        empresa_banco:       v("empresa_banco"),
        empresa_cuenta:      v("empresa_cuenta"),
        empresa_cci:         v("empresa_cci"),
        empresa_bcp_cuenta:  v("empresa_bcp_cuenta"),
        empresa_bcp_cci:     v("empresa_bcp_cci"),
        empresa_descripcion: v("empresa_descripcion"),
      }
    }));
  };

  const cerrarEdicion = (id) => {
    setEditando(p => { const n = { ...p }; delete n[id]; return n; });
  };

  const handleEditChange = (id, campo, valor) => {
    setEditando(p => ({ ...p, [id]: { ...p[id], [campo]: valor } }));
  };

  const guardarEdicion = async (link) => {
    const id = link.id_onboarding;
    setSavingEdit(p => ({ ...p, [id]: true }));
    try {
      const payload = { ...editando[id] };
      if (payload.dias_vigencia != null && payload.dias_vigencia !== '') {
        payload.dias_vigencia = Math.max(1, parseInt(payload.dias_vigencia, 10) || 1);
      }
      if (payload.num_cuotas != null && payload.num_cuotas !== '') {
        payload.num_cuotas = Math.max(1, Math.min(4, parseInt(payload.num_cuotas, 10) || 1));
      }
      await onboardingActualizar({ id_onboarding: id, ...payload });
      toastSuccess("Enlace actualizado correctamente.");
      cerrarEdicion(id);
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setSavingEdit(p => ({ ...p, [id]: false })); }
  };

  // ── Confirmar pago ──
  const [confirmandoPago, setConfirmandoPago] = useState({});
  const [linkParaConfirmar, setLinkParaConfirmar] = useState(null);

  const [linkParaRevertir, setLinkParaRevertir]     = useState(null);
  const [reviertendoPago, setRevirtiendoPago]       = useState({});
  const [eliminandoPago, setEliminandoPago]         = useState({});
  const [pagoUploading, setPagoUploading]           = useState({});
  const [cuotaUploadSel, setCuotaUploadSel]         = useState({});
  const [comprobanteParaEliminar, setComprobanteParaEliminar] = useState(null);
  const [modalEliminarComprobanteOk, setModalEliminarComprobanteOk] = useState(false);

  const handleConfirmarPago = (link) => {
    setLinkParaConfirmar(link);
  };

  const ejecutarReversion = async () => {
    if (!linkParaRevertir) return;
    const link = linkParaRevertir;
    setLinkParaRevertir(null);
    setRevirtiendoPago(p => ({ ...p, [link.id_onboarding]: true }));
    try {
      await onboardingActualizar({ id_onboarding: link.id_onboarding, pago_confirmado: false });
      toastSuccess("Confirmación revertida. El cliente puede volver a editar sus datos.");
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setRevirtiendoPago(p => ({ ...p, [link.id_onboarding]: false })); }
  };

  const ejecutarConfirmacion = async () => {
    if (!linkParaConfirmar) return;
    const link = linkParaConfirmar;
    setLinkParaConfirmar(null);
    setConfirmandoPago(p => ({ ...p, [link.id_onboarding]: true }));
    try {
      await onboardingActualizar({ id_onboarding: link.id_onboarding, pago_confirmado: true });
      toastSuccess("Pago confirmado. El cliente verá su proceso como completado.");
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setConfirmandoPago(p => ({ ...p, [link.id_onboarding]: false })); }
  };

  // ── Subir QR ──
  const handleQR = async (link, file) => {
    setQrUploading(p => ({ ...p, [link.id_onboarding]: true }));
    try {
      await onboardingSubirQR(link.id_onboarding, file);
      toastSuccess("QR subido correctamente.");
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setQrUploading(p => ({ ...p, [link.id_onboarding]: false })); }
  };

  const solicitarEliminarComprobante = (link, filename) => {
    setComprobanteParaEliminar({ link, filename });
  };

  const ejecutarEliminarComprobante = async () => {
    if (!comprobanteParaEliminar) return;
    const { link, filename } = comprobanteParaEliminar;
    const key = `${link.id_onboarding}-${filename}`;
    setEliminandoPago(p => ({ ...p, [key]: true }));
    try {
      await onboardingEliminarPagoImagen({ id_onboarding: link.id_onboarding, filename });
      setComprobanteParaEliminar(null);
      setModalEliminarComprobanteOk(true);
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setEliminandoPago(p => ({ ...p, [key]: false })); }
  };

  const subirComprobante = async (link, file) => {
    if (!file) return;
    const id = link.id_onboarding;
    const nCuotas = link.num_cuotas || 1;
    const numeroCuota = nCuotas > 1
      ? Number(cuotaUploadSel[id] || link.cuotas?.find(c => c.estado === "pendiente")?.numero || 1)
      : 1;

    setPagoUploading(p => ({ ...p, [id]: true }));
    try {
      await onboardingSubirPagoImagen(id, file, numeroCuota);
      toastSuccess(nCuotas > 1 ? `Comprobante de cuota ${numeroCuota} subido.` : "Comprobante subido.");
      cargar();
    } catch (e) { handleErrorMessages(e); }
    finally { setPagoUploading(p => ({ ...p, [id]: false })); }
  };

  const copiarURL = (url) =>
    navigator.clipboard.writeText(url).then(() => toastSuccess("URL copiada al portapapeles."));

  // ── Abrir reporte PDF (blob real) ──
  const abrirReportePdf = async (token) => {
    setReporteLoading(true);
    setReporteToken(token);
    try {
      const blob = await fetchOnboardingPdf(token, true);
      const url  = window.URL.createObjectURL(blob);
      setReporteUrl(url);
    } catch (e) {
      handleErrorMessages(e);
      setReporteToken(null);
    } finally {
      setReporteLoading(false);
    }
  };

  const cerrarReporte = () => {
    if (reporteUrl) window.URL.revokeObjectURL(reporteUrl);
    setReporteUrl(null);
    setReporteToken(null);
  };

  const compartirWA = (link) => {
    const nombre = link.empresa_nombre ? `*${link.empresa_nombre}*` : 'tu proyecto';
    const montoTotal = link.empresa_monto
      ? '💰 *Monto total: S/ ' + parseFloat(link.empresa_monto).toFixed(2) + '*\n'
      : '';
    const nCuotas = link.num_cuotas || 1;
    let planCuotas = '';
    if (nCuotas > 1 && link.empresa_monto) {
      const partes = (link.cuotas?.length ? link.cuotas : dividirCuotas(link.empresa_monto, nCuotas).map((m, i) => ({ numero: i + 1, monto: m })))
        .map(c => '   • Cuota ' + c.numero + '/' + nCuotas + ': S/ ' + formatMontoSol(c.monto))
        .join('\n');
      planCuotas = '📅 *Plan en ' + nCuotas + ' cuotas:*\n' + partes + '\n\n';
    }
    const monto = montoTotal + planCuotas;
    // Regla clave: el enlace debe ir SOLO en su propia linea para ser clickeable en WhatsApp
    const texto = [
      '😄 *Hola! Espero que estes muy bien!*',
      '',
      '🚀 Te envio el enlace de onboarding para ' + nombre + '.',
      'Por favor sigue estos pasos:',
      '✅ 1. Completa el formulario con tus datos',
      '🖼 2. Sube el logo de tu empresa',
      nCuotas > 1
        ? '📸 3. Sube el comprobante de cada cuota (' + nCuotas + ' en total)'
        : '📸 3. Envia la captura del deposito o transferencia',
      '',
      monto + '⏳ *Valido por ' + (link.dias_vigencia || link.dias_restantes || 1) + ' dia(s)* — no dejes pasar el tiempo!',
      '',
      '👇 *Haz clic en el enlace para comenzar:*',
      link.url_publica,
      '',
      '💬 Cualquier duda escribeme, estoy aqui para ayudarte! 😊✨',
      '🌟 *royalsensorymassage — Desarrollo Web Profesional*',
    ].join('\n');
    window.open('https://web.whatsapp.com/send?text=' + encodeURIComponent(texto), '_blank');
  };

  const nombreCliente = cliente
    ? `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || cliente.empresa || "Cliente"
    : "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      {/* Título */}
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <LinkIcon color="primary" />
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>Onboarding de cliente</Typography>
          <Typography variant="caption" color="text.secondary">{nombreCliente}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <Divider />

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Tab label={<Badge badgeContent={links.length} color="primary">Lista de enlaces</Badge>} />
        <Tab label="+ Nuevo enlace" />
      </Tabs>

      <DialogContent sx={{ pt: 2, minHeight: 420 }}>

        {/* ── TAB 0: Lista ── */}
        {tab === 0 && (
          <>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {!loading && links.length === 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                No hay enlaces. Crea uno nuevo en la pestaña "+ Nuevo enlace".
              </Alert>
            )}

            {links.map(link => (
              <Box key={link.id_onboarding} sx={{
                border: "1px solid #e0e0e0", borderRadius: 2, p: 2, mb: 2,
                bgcolor: link.estado === "activo" ? "#f8fff8" : "#fafafa",
              }}>
                <Grid container spacing={1} alignItems="center">
                  {/* Estado + progreso */}
                  <Grid item xs={12} sm={2} sx={{ textAlign: "center" }}>
                    <ProgresoCircular valor={link.progreso} />
                    <Box mt={0.5}>
                      <Chip size="small" label={estadoLabel[link.estado]} color={estadoColor[link.estado]} />
                    </Box>
                  </Grid>

                  {/* Info */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {link.empresa_nombre || "Enlace de onboarding"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                      {link.url_publica}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                      <Chip icon={<AccessTime fontSize="small" />}
                        label={link.estado === "expirado" ? "Expirado" : `${link.dias_restantes}d restantes`}
                        size="small" variant="outlined"
                      />
                      <Chip icon={<Visibility fontSize="small" />}
                        label={`${link.vistas} visita(s)`}
                        size="small" variant="outlined"
                      />
                      {link.form_completado && (
                        <Chip icon={<CheckCircle fontSize="small" />} label="Form. OK" size="small" color="success" variant="outlined" />
                      )}
                      {(link.num_cuotas || 1) > 1 && (
                        <Chip size="small" variant="outlined" color="info"
                          label={`Cuotas ${link.cuotas_completadas ?? 0}/${link.num_cuotas}`} />
                      )}
                      {link.pago_confirmado && (
                        <Chip icon={<CheckCircle fontSize="small" />} label="Pago OK" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                  </Grid>

                  {/* Acciones */}
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent={{ sm: "flex-end" }}>
                      <Tooltip title="Copiar URL">
                        <IconButton size="small" onClick={() => copiarURL(link.url_publica)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Enviar por WhatsApp">
                        <IconButton size="small" color="success" onClick={() => compartirWA(link)}>
                          <WhatsApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={link.estado === "activo" ? "Desactivar enlace" : "Reactivar enlace"}>
                        <IconButton size="small"
                          color={link.estado === "activo" ? "warning" : "success"}
                          onClick={() => toggleEstado(link)}
                        >
                          {link.estado === "activo" ? <Cancel fontSize="small" /> : <Refresh fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver reporte PDF del cliente">
                        <IconButton size="small" color="secondary"
                          disabled={reporteLoading}
                          onClick={() => abrirReportePdf(link.token)}>
                          {reporteLoading && reporteToken === link.token
                            ? <CircularProgress size={16} />
                            : <PictureAsPdf fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={editando[link.id_onboarding] ? "Cerrar edición" : "Editar datos del enlace"}>
                        <IconButton size="small" color="info"
                          onClick={() => editando[link.id_onboarding] ? cerrarEdicion(link.id_onboarding) : abrirEdicion(link)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Subir QR de pago (Yape/BBVA/BCP)">
                        <IconButton size="small" color="info" component="label" disabled={qrUploading[link.id_onboarding]}>
                          {qrUploading[link.id_onboarding] ? <CircularProgress size={16} /> : <CloudUpload fontSize="small" />}
                          <input hidden type="file" accept="image/*"
                            onChange={e => e.target.files[0] && handleQR(link, e.target.files[0])}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar enlace">
                        <IconButton size="small" color="error" onClick={() => handleEliminar(link)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box mt={1}>
                      <LinearProgress variant="determinate" value={link.progreso}
                        sx={{ height: 6, borderRadius: 3,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: link.progreso < 40 ? "#f44336" : link.progreso < 80 ? "#ff9800" : "#4caf50"
                          }
                        }}
                      />
                    </Box>

                    <Box mt={1} textAlign="right">
                      <img
                        src={link.empresa_qr_url || QR_DEFAULT}
                        alt="QR Yape"
                        style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* ── Formulario de edición inline ── */}
                {editando[link.id_onboarding] && (() => {
                  const ef = editando[link.id_onboarding];
                  const ec = (campo) => (e) => handleEditChange(link.id_onboarding, campo, e.target.value);
                  return (
                    <Box mt={1.5} pt={1.5} borderTop="1px dashed #1976d2"
                      sx={{ bgcolor: "#f0f7ff", borderRadius: 2, p: 2 }}>
                      <Typography variant="caption" fontWeight={700} color="primary"
                        sx={{ textTransform: "uppercase", letterSpacing: 0.8, display: "block", mb: 1.5 }}>
                        ✏️ Editar datos del enlace
                      </Typography>
                      <Grid container spacing={1.5}>

                        {/* Vigencia + nombre + monto */}
                        <Grid item xs={6} sm={2}>
                          <TextField fullWidth size="small" type="number" label="Días vigencia"
                            value={ef.dias_vigencia} onChange={ec("dias_vigencia")} inputProps={{ min: 1 }} />
                        </Grid>
                        <Grid item xs={6} sm={5}>
                          <TextField fullWidth size="small" label="Nombre del proyecto"
                            value={ef.empresa_nombre} onChange={ec("empresa_nombre")} />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField fullWidth size="small" label="Monto a pagar (S/)" type="number"
                            value={ef.empresa_monto} onChange={ec("empresa_monto")} />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Cuotas</InputLabel>
                            <Select label="Cuotas" value={ef.num_cuotas || 1}
                              onChange={e => handleEditChange(link.id_onboarding, "num_cuotas", e.target.value)}>
                              {[1, 2, 3, 4].map(n => (
                                <MenuItem key={n} value={n}>{n} {n === 1 ? "pago" : "cuotas"}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {(ef.num_cuotas || 1) > 1 && ef.empresa_monto && (
                          <Grid item xs={12}>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              {dividirCuotas(ef.empresa_monto, ef.num_cuotas).map((m, i) => (
                                <span key={i}>
                                  {i > 0 && " · "}
                                  Cuota {i + 1}: S/ {formatMontoSol(m)}
                                </span>
                              ))}
                            </Alert>
                          </Grid>
                        )}

                        {/* Titular */}
                        <Grid item xs={12}><Divider sx={{ fontSize: 11, color: "#888" }}>Titular</Divider></Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="Nombre del titular"
                            value={ef.empresa_titular} onChange={ec("empresa_titular")} />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField fullWidth size="small" label="DNI"
                            value={ef.empresa_dni} onChange={ec("empresa_dni")} />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <TextField fullWidth size="small" label="RUC"
                            value={ef.empresa_ruc} onChange={ec("empresa_ruc")} />
                        </Grid>

                        {/* Yape */}
                        <Grid item xs={12}><Divider sx={{ fontSize: 11, color: "#888" }}>🟣 Yape</Divider></Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth size="small" label="Número Yape"
                            value={ef.empresa_yape} onChange={ec("empresa_yape")} />
                        </Grid>

                        {/* BBVA */}
                        <Grid item xs={12}><Divider sx={{ fontSize: 11, color: "#888" }}>🏦 BBVA</Divider></Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="Cuenta en Soles"
                            value={ef.empresa_cuenta} onChange={ec("empresa_cuenta")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="CCI BBVA"
                            value={ef.empresa_cci} onChange={ec("empresa_cci")} />
                        </Grid>

                        {/* BCP */}
                        <Grid item xs={12}><Divider sx={{ fontSize: 11, color: "#888" }}>🏦 BCP</Divider></Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="Cuenta Ahorro BCP"
                            value={ef.empresa_bcp_cuenta} onChange={ec("empresa_bcp_cuenta")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth size="small" label="CCI BCP"
                            value={ef.empresa_bcp_cci} onChange={ec("empresa_bcp_cci")} />
                        </Grid>

                        {/* Nota */}
                        <Grid item xs={12}>
                          <TextField fullWidth size="small" label="Nota adicional" multiline rows={2}
                            value={ef.empresa_descripcion} onChange={ec("empresa_descripcion")} />
                        </Grid>

                        {/* Acciones */}
                        <Grid item xs={12}>
                          <Box display="flex" gap={1} justifyContent="flex-end">
                            <Button size="small" color="inherit"
                              onClick={() => cerrarEdicion(link.id_onboarding)}>
                              Cancelar
                            </Button>
                            <Button size="small" variant="contained" color="primary"
                              startIcon={savingEdit[link.id_onboarding] ? <CircularProgress size={14} color="inherit" /> : <Save fontSize="small" />}
                              disabled={savingEdit[link.id_onboarding]}
                              onClick={() => guardarEdicion(link)}
                            >
                              {savingEdit[link.id_onboarding] ? "Guardando..." : "Guardar cambios"}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })()}

                {/* Plan de cuotas */}
                {(link.num_cuotas || 1) > 1 && link.cuotas?.length > 0 && (
                  <Box mt={1.5} pt={1.5} borderTop="1px dashed #e0e0e0">
                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.8, display: "block", mb: 1 }}>
                      📅 Plan de cuotas
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {link.cuotas.map(c => (
                        <Box key={c.numero} display="flex" alignItems="center" justifyContent="space-between"
                          sx={{ bgcolor: "#fafafa", borderRadius: 1, px: 1, py: 0.5 }}>
                          <Typography variant="caption">
                            Cuota {c.numero}: <strong>S/ {formatMontoSol(c.monto)}</strong>
                          </Typography>
                          <Chip size="small" label={estadoCuotaLabel[c.estado] || c.estado}
                            color={estadoCuotaColor[c.estado] || "default"} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* ── Comprobantes de pago (galería + subida admin) ── */}
                <Box mt={1.5} pt={1.5} borderTop="1px dashed #e0e0e0">
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} flexWrap="wrap" gap={1}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                        📋 Comprobantes ({link.pagos_imagenes?.length || 0})
                      </Typography>
                      {/* Botón confirmar pago */}
                      {!link.pago_confirmado ? (
                        <Button
                          size="small" variant="contained" color="success"
                          startIcon={confirmandoPago[link.id_onboarding] ? <CircularProgress size={14} color="inherit" /> : <CheckCircle fontSize="small" />}
                          disabled={confirmandoPago[link.id_onboarding]}
                          onClick={() => handleConfirmarPago(link)}
                          sx={{ fontSize: 11, py: 0.4, fontWeight: 700, borderRadius: 2 }}
                        >
                          {confirmandoPago[link.id_onboarding] ? "Confirmando..." : "Confirmar pago ✅"}
                        </Button>
                      ) : (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Chip icon={<CheckCircle fontSize="small" />} label="Pago confirmado ✅"
                            color="success" size="small" />
                          <Tooltip title="Revertir confirmación (permite al cliente editar de nuevo)">
                            <Button
                              size="small" variant="outlined" color="warning"
                              disabled={reviertendoPago[link.id_onboarding]}
                              onClick={() => setLinkParaRevertir(link)}
                              sx={{ fontSize: 10, py: 0.3, minWidth: 0, px: 1, borderRadius: 2 }}
                            >
                              {reviertendoPago[link.id_onboarding] ? <CircularProgress size={12} /> : "↩ Revertir"}
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>

                    {!link.pago_confirmado && (
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
                        {(link.num_cuotas || 1) > 1 && link.cuotas?.length > 0 && (
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel sx={{ fontSize: 12 }}>Cuota</InputLabel>
                            <Select
                              label="Cuota"
                              value={cuotaUploadSel[link.id_onboarding] ?? link.cuotas.find(c => c.estado === "pendiente")?.numero ?? 1}
                              onChange={(e) => setCuotaUploadSel(p => ({ ...p, [link.id_onboarding]: e.target.value }))}
                              sx={{ fontSize: 12 }}
                            >
                              {link.cuotas.map((c) => (
                                <MenuItem key={c.numero} value={c.numero}>
                                  Cuota {c.numero} — S/ {formatMontoSol(c.monto)}
                                  {c.estado === "subido" ? " (reemplazar)" : ""}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        <Button
                          component="label"
                          size="small"
                          variant="outlined"
                          color="primary"
                          disabled={pagoUploading[link.id_onboarding]}
                          startIcon={
                            pagoUploading[link.id_onboarding]
                              ? <CircularProgress size={14} />
                              : <CloudUpload fontSize="small" />
                          }
                          sx={{ fontSize: 11, fontWeight: 600, borderRadius: 2 }}
                        >
                          {pagoUploading[link.id_onboarding] ? "Subiendo..." : "Subir comprobante"}
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) subirComprobante(link, f);
                              e.target.value = "";
                            }}
                          />
                        </Button>
                      </Box>
                    )}

                    {/* Galería thumbnails con preview Ant Design */}
                    {link.pagos_imagenes?.length > 0 ? (
                      <AntImage.PreviewGroup preview={{ zIndex: 1400 }}>
                        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(72px, 1fr))" gap={1}>
                          {link.pagos_imagenes.map((item, i) => {
                            const { url, filename } = normalizarComprobante(item);
                            const numCuota = link.cuotas?.find(c => c.filename === filename)?.numero
                              || (filename?.match(/^cuota-(\d+)-/i)?.[1]) || (i + 1);
                            const delKey = `${link.id_onboarding}-${filename}`;
                            const borrando = eliminandoPago[delKey];
                            return (
                            <Box key={filename || i} sx={{
                              borderRadius: 1.5, overflow: "hidden",
                              border: "1px solid #e0e0e0", aspectRatio: "1",
                              cursor: "pointer", position: "relative",
                              "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.22)", borderColor: "#1677ff" },
                              "&:hover .btn-del-pago": { opacity: 1 },
                            }}>
                              <AntImage
                                src={url}
                                alt={`Comprobante ${i + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                preview={{
                                  mask: (
                                    <div style={{ display: "flex", flexDirection: "column",
                                      alignItems: "center", justifyContent: "center",
                                      fontSize: 11, color: "#fff", gap: 2 }}>
                                      <span style={{ fontSize: 18 }}>🔍</span>
                                      Ver
                                    </div>
                                  ),
                                }}
                              />
                              <Tooltip title="Eliminar comprobante">
                                <IconButton
                                  className="btn-del-pago"
                                  size="small"
                                  disabled={borrando}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    solicitarEliminarComprobante(link, filename);
                                  }}
                                  sx={{
                                    position: "absolute", top: 2, right: 2,
                                    opacity: 0.85, bgcolor: "rgba(211,47,47,0.92)",
                                    color: "#fff", width: 22, height: 22,
                                    "&:hover": { bgcolor: "#c62828" },
                                  }}
                                >
                                  {borrando ? <CircularProgress size={12} color="inherit" /> : <Delete sx={{ fontSize: 14 }} />}
                                </IconButton>
                              </Tooltip>
                              <Box sx={{ position: "absolute", bottom: 2, right: 4,
                                fontSize: 9, fontWeight: 700, color: "#fff",
                                textShadow: "0 1px 3px rgba(0,0,0,0.8)", lineHeight: 1 }}>
                                C{numCuota}
                              </Box>
                            </Box>
                            );
                          })}
                        </Box>
                      </AntImage.PreviewGroup>
                    ) : (
                      !link.pago_confirmado && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                          Sin comprobantes. Use el botón para subir una imagen (JPG, PNG, etc.).
                        </Typography>
                      )
                    )}
                </Box>

                {/* Aviso si hay comprobantes pendientes de revisión */}
                {link.tiene_comprobantes && !link.pago_confirmado && (
                  <Alert severity="warning" sx={{ mt: 1, py: 0.3, fontSize: 11 }}>
                    El cliente subió comprobantes. Revísalos y confirma el pago.
                  </Alert>
                )}
              </Box>
            ))}
          </>
        )}

        {/* ── TAB 1: Nuevo enlace ── */}
        {tab === 1 && (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<AccessTime />}>
                Los datos bancarios ya están pre-cargados con tus cuentas. Ajusta solo lo necesario y define los días de vigencia.
              </Alert>
            </Grid>

            {/* Vigencia + nombre */}
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" type="number" label="Días de vigencia"
                value={form.dias_vigencia} inputProps={{ min: 5, max: 365 }}
                onChange={f("dias_vigencia")}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField fullWidth size="small" label="Nombre del proyecto / empresa cliente"
                value={form.empresa_nombre} onChange={f("empresa_nombre")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" label="Monto a pagar (S/)" type="number"
                value={form.empresa_monto} onChange={f("empresa_monto")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Nº de cuotas</InputLabel>
                <Select label="Nº de cuotas" value={form.num_cuotas || 1}
                  onChange={e => setForm(p => ({ ...p, num_cuotas: e.target.value }))}>
                  {[2, 3, 4].map(n => (
                    <MenuItem key={n} value={n}>{n} cuotas</MenuItem>
                  ))}
                  <MenuItem value={1}>1 pago (total)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(form.num_cuotas || 1) > 1 && form.empresa_monto && (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ py: 0.5 }}>
                  El cliente verá {form.num_cuotas} cuotas de:{" "}
                  {dividirCuotas(form.empresa_monto, form.num_cuotas).map((m, i) => (
                    <strong key={i}>
                      {i > 0 && " · "}
                      S/ {formatMontoSol(m)}
                    </strong>
                  ))}
                </Alert>
              </Grid>
            )}

            {/* Titular */}
            <Grid item xs={12}><Divider>Datos del titular</Divider></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Nombre del titular"
                value={form.empresa_titular} onChange={f("empresa_titular")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" label="DNI del titular"
                value={form.empresa_dni} onChange={f("empresa_dni")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" label="RUC (opcional)"
                value={form.empresa_ruc} onChange={f("empresa_ruc")}
              />
            </Grid>

            {/* Yape */}
            <Grid item xs={12}><Divider>🟣 Yape</Divider></Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Número Yape"
                value={form.empresa_yape} onChange={f("empresa_yape")}
              />
            </Grid>

            {/* BBVA */}
            <Grid item xs={12}><Divider>🏦 BBVA</Divider></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Cuenta en Soles (BBVA)"
                value={form.empresa_cuenta} onChange={f("empresa_cuenta")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CCI BBVA"
                value={form.empresa_cci} onChange={f("empresa_cci")}
              />
            </Grid>

            {/* BCP */}
            <Grid item xs={12}><Divider>🏦 BCP</Divider></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Cuenta de Ahorro BCP"
                value={form.empresa_bcp_cuenta} onChange={f("empresa_bcp_cuenta")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="CCI BCP"
                value={form.empresa_bcp_cci} onChange={f("empresa_bcp_cci")}
              />
            </Grid>

            {/* Nota adicional */}
            <Grid item xs={12}><Divider>Nota adicional</Divider></Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Instrucciones adicionales (opcional)" multiline rows={2}
                placeholder="Ej: Por favor enviar captura del depósito o transferencia una vez realizado."
                value={form.empresa_descripcion} onChange={f("empresa_descripcion")}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                📎 El QR de pago (Yape/BBVA/BCP) se sube después de crear el enlace, desde la lista.
              </Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {/* ── Dialog: Reporte PDF blob (visor nativo del navegador) ── */}
      <Dialog
        open={!!reporteUrl}
        onClose={cerrarReporte}
        fullWidth maxWidth="lg"
        sx={{ zIndex: 1500 }}
        PaperProps={{ sx: { height: '92vh', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Cabecera azul */}
        <Box sx={{ bgcolor: '#1565c0', color: '#fff', px: 2.5, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <PictureAsPdf />
          <Typography variant="subtitle1" fontWeight={700} flex={1}>
            Reporte de Onboarding — {nombreCliente}
          </Typography>
          <IconButton size="small" sx={{ color: '#fff' }} onClick={cerrarReporte}>
            <Close />
          </IconButton>
        </Box>

        {/* iframe con blob URL — el navegador muestra el visor PDF nativo */}
        <Box flex={1} sx={{ overflow: 'hidden', minHeight: 0, bgcolor: '#525659' }}>
          {reporteUrl && (
            <iframe
              src={reporteUrl}
              title="Reporte PDF"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: '1px solid #e0e0e0', px: 2, py: 1,
          display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Button onClick={cerrarReporte} color="inherit">Cerrar</Button>
          <Box flex={1} />
          <Button variant="contained" color="error" startIcon={<PictureAsPdf />}
            component="a"
            href={reporteUrl}
            download={`reporte-onboarding-${reporteToken}.pdf`}
          >
            Descargar PDF
          </Button>
        </Box>
      </Dialog>

      {/* ── Modal: Confirmar eliminar comprobante ── */}
      <AntModal
        open={!!comprobanteParaEliminar}
        onCancel={() => !eliminandoPago[`${comprobanteParaEliminar?.link?.id_onboarding}-${comprobanteParaEliminar?.filename}`] && setComprobanteParaEliminar(null)}
        onOk={ejecutarEliminarComprobante}
        okText="Sí, eliminar"
        cancelText="No, cancelar"
        okButtonProps={{
          danger: true,
          loading: comprobanteParaEliminar
            ? !!eliminandoPago[`${comprobanteParaEliminar.link.id_onboarding}-${comprobanteParaEliminar.filename}`]
            : false,
        }}
        cancelButtonProps={{
          disabled: comprobanteParaEliminar
            ? !!eliminandoPago[`${comprobanteParaEliminar.link.id_onboarding}-${comprobanteParaEliminar.filename}`]
            : false,
        }}
        zIndex={1400}
        centered
        title={<span style={{ fontSize: 16, fontWeight: 700 }}>¿Eliminar comprobante?</span>}
      >
        <p style={{ margin: 0, color: "#555", fontSize: 14, lineHeight: 1.6 }}>
          Se quitará esta imagen del comprobante de pago.
          {comprobanteParaEliminar?.link?.num_cuotas > 1 && (
            <> Podrás subir otro comprobante para la cuota correspondiente.</>
          )}
        </p>
      </AntModal>

      <AntModal
        open={modalEliminarComprobanteOk}
        onCancel={() => setModalEliminarComprobanteOk(false)}
        footer={null}
        centered
        width={360}
        zIndex={1400}
      >
        <Result
          status="success"
          title="Comprobante eliminado"
          subTitle="La imagen se eliminó correctamente."
          extra={[
            <Button
              key="ok"
              variant="contained"
              color="success"
              onClick={() => setModalEliminarComprobanteOk(false)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Entendido
            </Button>,
          ]}
        />
      </AntModal>

      {/* ── Modal Ant Design: Confirmar pago ── */}
      <AntModal
        open={!!linkParaConfirmar}
        onCancel={() => setLinkParaConfirmar(null)}
        onOk={ejecutarConfirmacion}
        okText="Sí, confirmar pago ✅"
        cancelText="Cancelar"
        okButtonProps={{ style: { background: "#52c41a", borderColor: "#52c41a", fontWeight: 700 } }}
        zIndex={1400}
        centered
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            💰 Confirmar pago recibido
          </span>
        }
      >
        <div style={{ padding: "8px 0" }}>
          <p style={{ marginBottom: 12, color: "#555" }}>
            Estás a punto de confirmar el pago de:<br />
            <strong style={{ fontSize: 15 }}>{linkParaConfirmar?.empresa_nombre || "este cliente"}</strong>
          </p>
          <div style={{
            background: "#f6ffed", border: "1px solid #b7eb8f",
            borderRadius: 8, padding: "10px 14px", marginBottom: 8,
          }}>
            <p style={{ margin: 0, color: "#389e0d", fontWeight: 600, fontSize: 13 }}>
              ✅ Al confirmar:
            </p>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: "#555", fontSize: 13 }}>
              <li>El progreso del cliente llegará al <strong>100%</strong></li>
              <li>El cliente verá la pantalla <strong>"¡Tu proceso está completo!"</strong></li>
              <li>No podrá editar más el formulario</li>
            </ul>
          </div>
          <p style={{ margin: 0, color: "#888", fontSize: 12 }}>
            ¿Revisaste los comprobantes de pago? Esta acción no se puede deshacer.
          </p>
        </div>
      </AntModal>

      {/* ── Modal Ant Design: Revertir confirmación de pago ── */}
      <AntModal
        open={!!linkParaRevertir}
        onCancel={() => setLinkParaRevertir(null)}
        onOk={ejecutarReversion}
        okText="Sí, revertir confirmación"
        cancelText="Cancelar"
        okButtonProps={{ style: { background: "#fa8c16", borderColor: "#fa8c16", fontWeight: 700 } }}
        zIndex={1400}
        centered
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            ↩ Revertir confirmación de pago
          </span>
        }
      >
        <div style={{ padding: "8px 0" }}>
          <p style={{ marginBottom: 12, color: "#555" }}>
            Vas a revertir la confirmación de pago de:<br />
            <strong style={{ fontSize: 15 }}>{linkParaRevertir?.empresa_nombre || "este cliente"}</strong>
          </p>
          <div style={{
            background: "#fff7e6", border: "1px solid #ffd591",
            borderRadius: 8, padding: "10px 14px", marginBottom: 8,
          }}>
            <p style={{ margin: 0, color: "#d46b08", fontWeight: 600, fontSize: 13 }}>
              ⚠️ Al revertir:
            </p>
            <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: "#555", fontSize: 13 }}>
              <li>El cliente podrá <strong>editar nuevamente</strong> sus datos y el formulario</li>
              <li>El progreso volverá a <strong>menos del 100%</strong></li>
              <li>El cliente <strong>dejará de ver</strong> la pantalla de "proceso completo"</li>
              <li>Podrá subir nuevos comprobantes de pago</li>
            </ul>
          </div>
          <p style={{ margin: 0, color: "#888", fontSize: 12 }}>
            Usa esto cuando el cliente cometió un error y necesita corregir sus datos o el comprobante.
          </p>
        </div>
      </AntModal>

      <Divider />
      <DialogActions sx={{ px: 2, py: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose} color="inherit">Cerrar</Button>
        <Box flex={1} />
        {/* Botones de reporte — uno por enlace activo */}
        {tab === 0 && links.length > 0 && links.map(link => (
          <Tooltip key={link.id_onboarding} title={`Ver reporte PDF de "${link.empresa_nombre || "enlace"}"`}>
            <Button
              size="small" variant="outlined" color="secondary"
              startIcon={reporteLoading && reporteToken === link.token
                ? <CircularProgress size={14} color="inherit" />
                : <PictureAsPdf fontSize="small" />}
              disabled={reporteLoading}
              onClick={() => abrirReportePdf(link.token)}
              sx={{ fontSize: 12, borderRadius: 2 }}
            >
              📄 Reporte PDF
              {links.length > 1 && (
                <Chip label={link.empresa_nombre?.slice(0, 10) || "enlace"}
                  size="small" sx={{ ml: 0.5, fontSize: 9, height: 16 }} />
              )}
            </Button>
          </Tooltip>
        ))}
        {tab === 0 && (
          <Button variant="outlined" startIcon={<Refresh />} onClick={cargar} disabled={loading}>
            Actualizar
          </Button>
        )}
        {tab === 1 && (
          <Button variant="contained" startIcon={<Add />}
            onClick={handleCrear} disabled={saving || !form.dias_vigencia}
          >
            {saving ? "Creando..." : "Crear enlace"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingModal;
