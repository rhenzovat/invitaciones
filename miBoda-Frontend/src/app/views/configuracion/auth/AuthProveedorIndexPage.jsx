import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Chip, Button, TextField,
  IconButton, Collapse, Snackbar, CircularProgress,
  InputAdornment, Tooltip, Switch, Avatar,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import CheckCircleRoundedIcon     from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedIcon   from "@mui/icons-material/RadioButtonUnchecked";
import SettingsOutlinedIcon       from "@mui/icons-material/SettingsOutlined";
import VisibilityOutlinedIcon     from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon  from "@mui/icons-material/VisibilityOffOutlined";
import SaveOutlinedIcon           from "@mui/icons-material/SaveOutlined";
import KeyOutlinedIcon            from "@mui/icons-material/KeyOutlined";
import SecurityIcon               from "@mui/icons-material/Security";
import StarRoundedIcon            from "@mui/icons-material/StarRounded";
import ExpandMoreRoundedIcon      from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon      from "@mui/icons-material/ExpandLessRounded";
import InfoOutlinedIcon           from "@mui/icons-material/InfoOutlined";
import { PortletHeader } from "../../../partials/content/Portlet";
import * as authApi from "../../../api/authProveedor.api";

/* ── Temas por proveedor ─────────────────────────────────────────── */
const THEME = {
  local: {
    gradient:  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    primary:   "#1e3c72",
    light:     "#e8eef7",
    border:    "#99b4d8",
    shadow:    "rgba(30,60,114,0.18)",
  },
  microsoft: {
    gradient:  "linear-gradient(135deg, #0078d4 0%, #00a4ef 100%)",
    primary:   "#0078d4",
    light:     "#e1f0fa",
    border:    "#80c3f0",
    shadow:    "rgba(0,120,212,0.18)",
  },
  google: {
    gradient:  "linear-gradient(135deg, #ea4335 0%, #fbbc04 100%)",
    primary:   "#ea4335",
    light:     "#fef2f2",
    border:    "#f8b9b2",
    shadow:    "rgba(234,67,53,0.18)",
  },
};
const DEFAULT_THEME = THEME.local;

function esActivo(v) { return v === true || v === 1 || v === "1"; }

/* ── Logos SVG inline ─────────────────────────────────────────────── */
const MicrosoftLogo = () => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", width: 22, height: 22 }}>
    {["#f25022", "#7fba00", "#00a4ef", "#ffb900"].map((c, i) => (
      <Box key={i} sx={{ bgcolor: c, borderRadius: "1px" }} />
    ))}
  </Box>
);

const GoogleLogo = () => (
  <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e0e0e0" }}>
    <Typography sx={{ fontSize: "0.82rem", fontWeight: 900, background: "linear-gradient(135deg,#ea4335,#fbbc04)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      G
    </Typography>
  </Box>
);

const LocalLogo = () => (
  <Box sx={{ width: 22, height: 22, borderRadius: "6px", bgcolor: "#1e3c72", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <KeyOutlinedIcon sx={{ fontSize: 13, color: "#fff" }} />
  </Box>
);

function getProviderLogo(codigo) {
  if (codigo === "microsoft") return <MicrosoftLogo />;
  if (codigo === "google")    return <GoogleLogo />;
  return <LocalLogo />;
}

/* ── Animación del borde activo ──────────────────────────────────── */
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(30,60,114,0.28); }
  70% { box-shadow: 0 0 0 6px rgba(30,60,114,0); }
  100% { box-shadow: 0 0 0 0 rgba(30,60,114,0); }
`;

/* ── Styled card ─────────────────────────────────────────────────── */
const ProviderCard = styled(Paper, {
  shouldForwardProp: (p) => !["pred", "habilitado", "themeColor", "shadowColor"].includes(p),
})(({ pred, habilitado, themeColor, shadowColor }) => ({
  border: pred
    ? `2px solid ${themeColor}`
    : habilitado
      ? `1.5px solid ${themeColor}55`
      : "1.5px solid #e2e8f0",
  borderRadius: 20,
  overflow: "hidden",
  transition: "all 0.3s ease",
  animation: pred ? `${pulse} 1.8s ease-out` : "none",
  boxShadow: pred
    ? `0 8px 32px ${shadowColor}`
    : habilitado
      ? `0 4px 16px ${shadowColor}66`
      : "0 2px 8px rgba(0,0,0,0.06)",
  "&:hover": {
    boxShadow: `0 12px 40px ${shadowColor}`,
    transform: "translateY(-2px)",
  },
}));

/* ── Barra superior de acento ────────────────────────────────────── */
const AccentBar = styled(Box)(({ gradient }) => ({
  height: 5,
  background: gradient,
}));

/* ── Toggle estilizado ───────────────────────────────────────────── */
const StyledSwitch = styled(Switch)(({ themecolor }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": { color: themecolor },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: themecolor },
}));

/* ── Sección de credencial ───────────────────────────────────────── */
const CredField = styled(TextField)(() => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    fontSize: "0.82rem",
    backgroundColor: "#f8fafc",
  },
  "& .MuiInputLabel-root": { fontSize: "0.80rem" },
}));

/* ── Página ──────────────────────────────────────────────────────── */
const AuthProveedorIndexPage = () => {
  const [proveedores,  setProveedores]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busy,         setBusy]         = useState(null);
  const [expanded,     setExpanded]     = useState(null);
  const [editConfigs,  setEditConfigs]  = useState({});
  const [showSecret,   setShowSecret]   = useState({});
  const [snack,        setSnack]        = useState({ open: false, msg: "", severity: "success" });

  const notify = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authApi.listar();
      setProveedores(data);
      const ec = {};
      data.forEach((p) => {
        ec[p.codigo] = {};
        (p.configs || []).forEach((c) => { ec[p.codigo][c.clave] = c.valor || ""; });
      });
      setEditConfigs(ec);
    } catch {
      notify("Error al cargar proveedores de autenticación", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleHabilitar = async (p) => {
    setBusy(`h-${p.id_seguridad_auth_proveedor}`);
    try {
      await authApi.habilitar({ id_seguridad_auth_proveedor: p.id_seguridad_auth_proveedor });
      notify(`Proveedor ${p.nombre} actualizado. Solo un método puede estar activo.`);
      await cargar();
    } catch (e) { notify(e?.message || "Error", "error"); }
    finally { setBusy(null); }
  };

  const handlePredeterminado = async (p) => {
    setBusy(`d-${p.id_seguridad_auth_proveedor}`);
    try {
      await authApi.predeterminado({ id_seguridad_auth_proveedor: p.id_seguridad_auth_proveedor });
      notify(`${p.nombre} es ahora el método predeterminado`);
      await cargar();
    } catch (e) { notify(e?.message || "Error", "error"); }
    finally { setBusy(null); }
  };

  const handleGuardar = async (p) => {
    setBusy(`s-${p.codigo}`);
    try {
      const configs = (p.configs || []).map((c) => ({
        clave: c.clave,
        valor: editConfigs[p.codigo]?.[c.clave] ?? "",
      }));
      await authApi.actualizarConfig({ id_seguridad_auth_proveedor: p.id_seguridad_auth_proveedor, configs });
      notify("Configuración guardada correctamente");
      await cargar();
    } catch { notify("Error al guardar", "error"); }
    finally { setBusy(null); }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PortletHeader title="Proveedores de autenticación" />

      {/* Banner informativo */}
      <Box sx={{
        display: "flex", alignItems: "flex-start", gap: 1.5,
        bgcolor: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: "14px", px: 2.5, py: 1.8, mb: 4,
      }}>
        <InfoOutlinedIcon sx={{ color: "#3b82f6", mt: 0.2, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: "#1e40af", lineHeight: 1.7 }}>
          Solo puede haber <strong>un método activo</strong> a la vez (como las pasarelas de pago).
          Al activar uno, los demás se desactivan automáticamente.
          OAuth usa <strong>PKCE + state</strong>; los secretos se guardan cifrados y se listan enmascarados.
        </Typography>
      </Box>

      {/* Grid de cards — 3 columnas fijas */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 3,
      }}>
        {proveedores.map((p) => {
          const t        = THEME[p.codigo] || DEFAULT_THEME;
          const habilitado = esActivo(p.is_habilitado);
          const pred     = esActivo(p.is_predeterminado);
          const isExp    = expanded === p.codigo;
          const isBusy   = !!busy;

          return (
            <Box key={p.id_seguridad_auth_proveedor}>
              <ProviderCard
                elevation={0}
                pred={pred}
                habilitado={habilitado}
                themeColor={t.primary}
                shadowColor={t.shadow}
              >
                {/* Barra de acento superior */}
                {(pred || habilitado) && <AccentBar gradient={t.gradient} />}

                {/* Header de la card */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 2, bgcolor: pred ? t.light : "#fff" }}>

                  {/* Logo + nombre + badge */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {/* Icono proveedor */}
                      <Box sx={{
                        width: 44, height: 44, borderRadius: "12px",
                        bgcolor: pred ? "#fff" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: pred ? `0 2px 10px ${t.shadow}` : "none",
                        border: `1px solid ${pred ? t.border : "#e2e8f0"}`,
                      }}>
                        {getProviderLogo(p.codigo)}
                      </Box>

                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          {pred
                            ? <CheckCircleRoundedIcon sx={{ color: t.primary, fontSize: 17 }} />
                            : <RadioButtonUncheckedIcon sx={{ color: "#c0c8d2", fontSize: 17 }} />
                          }
                          <Typography fontWeight={800} sx={{ fontSize: "0.95rem", color: "#111827" }}>
                            {p.nombre}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "#6b7280", lineHeight: 1.4, display: "block", mt: 0.2 }}>
                          {p.descripcion}
                        </Typography>
                      </Box>
                    </Box>

                    {pred && (
                      <Chip
                        icon={<StarRoundedIcon sx={{ fontSize: "13px !important", color: "#fff !important" }} />}
                        label="DEFAULT"
                        size="small"
                        sx={{
                          bgcolor: t.primary, color: "#fff",
                          fontSize: "0.58rem", fontWeight: 800,
                          letterSpacing: "0.06em", height: 22, flexShrink: 0,
                          borderRadius: "6px",
                        }}
                      />
                    )}
                  </Box>

                  {/* Estado: habilitado / deshabilitado (un solo método activo) */}
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    bgcolor: habilitado ? `${t.primary}12` : "#f1f5f9",
                    borderRadius: "10px", px: 1.5, py: 0.8, mt: 1,
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{
                        width: 8, height: 8, borderRadius: "50%",
                        bgcolor: habilitado ? "#22c55e" : "#94a3b8",
                      }} />
                      <Typography variant="caption" fontWeight={700}
                        sx={{ color: habilitado ? "#15803d" : "#64748b", fontSize: "0.72rem" }}>
                        {habilitado ? "Login habilitado" : "Login deshabilitado"}
                      </Typography>
                    </Box>
                    <Tooltip title={habilitado ? "Deshabilitar (debe quedar otro activo)" : "Habilitar (desactiva los demás)"}>
                      <StyledSwitch
                        size="small"
                        themecolor={t.primary}
                        checked={habilitado}
                        disabled={isBusy}
                        onChange={() => handleHabilitar(p)}
                      />
                    </Tooltip>
                  </Box>
                </Box>

                {/* Acciones */}
                <Box sx={{
                  px: 2.5, py: 1.8,
                  bgcolor: "#fafbfc",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center",
                }}>
                  <Tooltip title={pred ? "Ya es el método predeterminado" : "Resaltar este método primero en el login"}>
                    <span>
                      <Button
                        size="small" variant={pred ? "contained" : "outlined"}
                        disabled={isBusy || pred}
                        onClick={() => handlePredeterminado(p)}
                        startIcon={
                          busy === `d-${p.id_seguridad_auth_proveedor}`
                            ? <CircularProgress size={12} color="inherit" />
                            : <StarRoundedIcon />
                        }
                        sx={{
                          borderRadius: "8px", textTransform: "none",
                          fontSize: "0.76rem", fontWeight: 600,
                          ...(pred
                            ? { bgcolor: t.primary, color: "#fff", "&:hover": { bgcolor: t.primary } }
                            : { borderColor: t.primary, color: t.primary, "&:hover": { bgcolor: `${t.primary}10` } }
                          ),
                        }}
                      >
                        {pred ? "Predeterminado" : "Marcar predeterminado"}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>

                {/* Sección credenciales OAuth */}
                {p.configs?.length > 0 && (
                  <>
                    <Box
                      onClick={() => setExpanded(isExp ? null : p.codigo)}
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        px: 2.5, py: 1.2, cursor: "pointer",
                        bgcolor: isExp ? `${t.primary}08` : "transparent",
                        borderTop: "1px solid #f1f5f9",
                        transition: "background 0.2s",
                        "&:hover": { bgcolor: `${t.primary}08` },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <SettingsOutlinedIcon sx={{ fontSize: 15, color: t.primary }} />
                        <Typography variant="caption" fontWeight={700}
                          sx={{ color: t.primary, fontSize: "0.74rem" }}>
                          Configurar credenciales OAuth
                        </Typography>
                      </Box>
                      {isExp
                        ? <ExpandLessRoundedIcon sx={{ fontSize: 18, color: t.primary }} />
                        : <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                      }
                    </Box>

                    <Collapse in={isExp}>
                      <Box sx={{ px: 2.5, pb: 2.5, pt: 1, bgcolor: "#fafbfc" }}>
                        {p.configs.map((c) => {
                          const key = `${p.codigo}-${c.clave}`;
                          const isSecret = c.es_secreto;
                          return (
                            <CredField
                              key={c.id_seguridad_auth_proveedor_config}
                              fullWidth size="small" margin="dense"
                              label={c.etiqueta || c.clave}
                              type={isSecret && !showSecret[key] ? "password" : "text"}
                              value={editConfigs[p.codigo]?.[c.clave] ?? ""}
                              onChange={(e) =>
                                setEditConfigs((prev) => ({
                                  ...prev,
                                  [p.codigo]: { ...prev[p.codigo], [c.clave]: e.target.value },
                                }))
                              }
                              InputProps={
                                isSecret ? {
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton size="small"
                                        onClick={() => setShowSecret((s) => ({ ...s, [key]: !s[key] }))}>
                                        {showSecret[key]
                                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                                          : <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                                        }
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                } : undefined
                              }
                            />
                          );
                        })}
                        <Button
                          variant="contained" size="small" fullWidth
                          startIcon={
                            busy === `s-${p.codigo}`
                              ? <CircularProgress size={13} color="inherit" />
                              : <SaveOutlinedIcon />
                          }
                          disabled={isBusy}
                          onClick={() => handleGuardar(p)}
                          sx={{
                            mt: 1.5, borderRadius: "10px", textTransform: "none",
                            fontWeight: 700, fontSize: "0.80rem",
                            bgcolor: t.primary, "&:hover": { filter: "brightness(0.9)", bgcolor: t.primary },
                          }}
                        >
                          {busy === `s-${p.codigo}` ? "Guardando..." : "Guardar credenciales"}
                        </Button>
                      </Box>
                    </Collapse>
                  </>
                )}
              </ProviderCard>
            </Box>
          );
        })}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        message={snack.msg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default AuthProveedorIndexPage;
