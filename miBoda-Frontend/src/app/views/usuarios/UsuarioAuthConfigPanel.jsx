import React, { useEffect, useState } from "react";
import {
  Box, Typography, Switch, Chip, Alert, Divider,
  MenuItem, Tooltip, Collapse, LinearProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import TextField from "@mui/material/TextField";
import SecurityIcon        from "@mui/icons-material/Security";
import GoogleIcon          from "@mui/icons-material/Google";
import MicrosoftIcon       from "@mui/icons-material/Microsoft";
import LockOutlinedIcon    from "@mui/icons-material/LockOutlined";
import PhonelinkEraseIcon  from "@mui/icons-material/PhonelinkErase";
import QrCodeScannerIcon   from "@mui/icons-material/QrCodeScanner";
import PhoneAndroidIcon    from "@mui/icons-material/PhoneAndroid";
import StarRoundedIcon     from "@mui/icons-material/StarRounded";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import SaveOutlinedIcon    from "@mui/icons-material/SaveOutlined";
import * as authUsuarioConfigApi from "../../api/authUsuarioConfig.api";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";

/* ── Animaciones ─────────────────────────────────────────────────── */
const pulseDot = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.5); opacity: 0.6; }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Tema por proveedor ──────────────────────────────────────────── */
const PROVIDER_THEME = {
  local:     { color: "#f97316", light: "#fff7ed", border: "#fed7aa", shadow: "rgba(249,115,22,0.18)" },
  google:    { color: "#ea4335", light: "#fff5f5", border: "#fca5a5", shadow: "rgba(234,67,53,0.18)" },
  microsoft: { color: "#0078d4", light: "#eff6ff", border: "#93c5fd", shadow: "rgba(0,120,212,0.18)" },
};

const METODOS = [
  {
    key: "permitir_local", codigo: "local",
    label: "Autenticación local", sub: "Correo y contraseña (JWT)",
    Icon: LockOutlinedIcon,
  },
  {
    key: "permitir_google", codigo: "google",
    label: "Google", sub: "OAuth 2.0 con cuenta Gmail",
    Icon: GoogleIcon,
  },
  {
    key: "permitir_microsoft", codigo: "microsoft",
    label: "Microsoft", sub: "Cuenta corporativa Azure AD",
    Icon: MicrosoftIcon,
  },
];

const defaultConfig = () => ({
  permitir_local: true, permitir_google: true, permitir_microsoft: true,
  requiere_2fa: false, permite_2fa_voluntario: true, metodo_predeterminado: "",
});

const defaultTwoFactor = () => ({
  activo: false, pendiente_configuracion: false, tiene_registro: false,
  requiere_2fa_efectivo: false, rol_2fa_obligatorio: false, habilitado_at: null,
});

/* ── Styled ──────────────────────────────────────────────────────── */
const PanelWrap = styled(Box)({
  marginTop: 24,
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  border: "1px solid #e2e8f0",
  animation: `${slideIn} 0.4s ease-out`,
});

const PanelHeader = styled(Box)({
  padding: "16px 20px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  display: "flex",
  alignItems: "center",
  gap: 12,
});

const SectionTitle = styled(Typography)({
  fontSize: "0.70rem",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "#94a3b8",
  marginBottom: 12,
  marginTop: 4,
});

const ProviderCard = styled(Box, {
  shouldForwardProp: (p) => p !== "enabled" && p !== "providerColor" && p !== "providerLight" && p !== "providerBorder" && p !== "providerShadow",
})(({ enabled, providerColor, providerLight, providerBorder, providerShadow }) => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  borderRadius: 12,
  border: `1.5px solid ${enabled ? providerBorder : "#e2e8f0"}`,
  backgroundColor: enabled ? providerLight : "#f8fafc",
  boxShadow: enabled ? `0 4px 16px ${providerShadow}` : "none",
  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
  cursor: "default",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    borderColor: providerBorder,
    boxShadow: `0 4px 16px ${providerShadow}`,
  },
  "&::before": enabled ? {
    content: '""',
    position: "absolute",
    top: 0, left: 0,
    width: 4, height: "100%",
    backgroundColor: providerColor,
    borderRadius: "0 2px 2px 0",
  } : {},
}));

const IconCircle = styled(Box)(({ color, light }) => ({
  width: 42,
  height: 42,
  borderRadius: "50%",
  backgroundColor: light,
  border: `1.5px solid ${color}33`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const OrangeSwitch = styled(Switch)(({ providercolor }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": { color: providercolor || "#f97316" },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: providercolor || "#f97316",
  },
}));

const TwoFaCard = styled(Box)(({ variant }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  padding: "14px 16px",
  borderRadius: 12,
  border: `1.5px solid ${variant === "required" ? "#fed7aa" : "#e2e8f0"}`,
  backgroundColor: variant === "required" ? "#fff7ed" : "#f8fafc",
  transition: "all 0.25s ease",
}));

const PulseDot = styled(Box)(({ dotcolor }) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: dotcolor,
  animation: `${pulseDot} 2s ease-in-out infinite`,
  flexShrink: 0,
}));

const DeviceStatusCard = styled(Box)({
  borderRadius: 12,
  border: "1.5px dashed #cbd5e1",
  backgroundColor: "#f8fafc",
  padding: "16px 18px",
  marginTop: 8,
});

/* ── Componente ──────────────────────────────────────────────────── */
const UsuarioAuthConfigPanel = ({ idUsuario, email }) => {
  const [config,        setConfig]        = useState(defaultConfig());
  const [twoFactor,     setTwoFactor]     = useState(defaultTwoFactor());
  const [personalizado, setPersonalizado] = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [resetting2fa,  setResetting2fa]  = useState(false);
  const [confirmReset2fa, setConfirmReset2fa] = useState(false);

  const load = async () => {
    if (!idUsuario) return;
    setLoading(true);
    try {
      const res = await authUsuarioConfigApi.obtenerAuthConfig(idUsuario);
      setConfig({
        permitir_local:         !!res.permitir_local,
        permitir_google:        !!res.permitir_google,
        permitir_microsoft:     !!res.permitir_microsoft,
        requiere_2fa:           !!res.requiere_2fa,
        permite_2fa_voluntario: res.permite_2fa_voluntario !== false,
        metodo_predeterminado:  res.metodo_predeterminado || "",
      });
      setPersonalizado(!!res.personalizado);
      setTwoFactor(res.two_factor ? { ...defaultTwoFactor(), ...res.two_factor } : defaultTwoFactor());
    } catch (e) {
      handleErrorMessages("Acceso", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [idUsuario]);

  const toggle = (key) => (checked) => {
    setConfig((c) => {
      const next = { ...c, [key]: checked };
      if (key === "requiere_2fa" && checked) next.permite_2fa_voluntario = false;
      return next;
    });
  };

  const metodosActivos = METODOS.filter((m) => config[m.key]);

  const handleReset2fa = async () => {
    setResetting2fa(true);
    try {
      const res = await authUsuarioConfigApi.resetear2faUsuario(idUsuario);
      if (res?.success) {
        toastSuccess(res.message || "2FA restablecido correctamente.");
        setTwoFactor(res.result?.two_factor ? { ...defaultTwoFactor(), ...res.result.two_factor } : defaultTwoFactor());
      }
    } catch (e) {
      handleErrorMessages("2FA", e);
    } finally {
      setResetting2fa(false);
      setConfirmReset2fa(false);
    }
  };

  const estado2fa = (() => {
    if (twoFactor.activo) return { label: "Activo en dispositivo", color: "success", dot: "#22c55e" };
    if (twoFactor.pendiente_configuracion) return { label: "Pendiente de confirmar QR", color: "warning", dot: "#f59e0b" };
    if (twoFactor.requiere_2fa_efectivo || twoFactor.rol_2fa_obligatorio) return { label: "Obligatorio — sin vincular", color: "error", dot: "#ef4444" };
    return { label: "No configurado", color: "default", dot: "#94a3b8" };
  })();

  const handleSave = async () => {
    if (metodosActivos.length === 0) {
      handleErrorMessages("Acceso", new Error("Debe habilitar al menos un método de inicio de sesión."));
      return;
    }
    setSaving(true);
    try {
      const res = await authUsuarioConfigApi.guardarAuthConfig({
        id_usuario: idUsuario,
        ...config,
        metodo_predeterminado: config.metodo_predeterminado || null,
      });
      if (res?.success) {
        toastSuccess(res.message || "Configuración guardada.");
        setPersonalizado(true);
        if (res.result) {
          setConfig({
            permitir_local:         !!res.result.permitir_local,
            permitir_google:        !!res.result.permitir_google,
            permitir_microsoft:     !!res.result.permitir_microsoft,
            requiere_2fa:           !!res.result.requiere_2fa,
            permite_2fa_voluntario: res.result.permite_2fa_voluntario !== false,
            metodo_predeterminado:  res.result.metodo_predeterminado || "",
          });
        }
      }
    } catch (e) {
      handleErrorMessages("Acceso", e);
    } finally {
      setSaving(false);
    }
  };

  if (!idUsuario) {
    return (
      <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
        Guarde el usuario primero para asignar métodos de acceso y 2FA.
      </Alert>
    );
  }

  return (
    <PanelWrap>
      {/* Barra de carga */}
      {loading && <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: "#f97316" } }} />}

      {/* Header oscuro */}
      <PanelHeader>
        <Box sx={{
          width: 38, height: 38, borderRadius: "50%",
          bgcolor: "rgba(249,115,22,0.2)", border: "1.5px solid rgba(249,115,22,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <SecurityIcon sx={{ fontSize: 18, color: "#f97316" }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
            Configuración de acceso
          </Typography>
          {email && (
            <Typography sx={{ color: "#94a3b8", fontSize: "0.72rem", mt: 0.3 }}>
              Política individual para <span style={{ color: "#f97316" }}>{email}</span>
            </Typography>
          )}
        </Box>
        {personalizado ? (
          <Chip
            size="small" icon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
            label="Personalizado"
            sx={{ bgcolor: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", fontSize: "0.65rem" }}
          />
        ) : (
          <Chip
            size="small" label="Por defecto"
            sx={{ bgcolor: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.25)", fontSize: "0.65rem" }}
          />
        )}
      </PanelHeader>

      {/* Cuerpo */}
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#fff" }}>

        {!personalizado && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.80rem" }}>
            Usa configuración global del sistema. Al guardar, se personaliza solo para este usuario.
          </Alert>
        )}

        {/* ── Métodos de acceso ─────────────────────────────────── */}
        <SectionTitle>Métodos de inicio de sesión permitidos</SectionTitle>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {METODOS.map(({ key, codigo, label, sub, Icon }) => {
            const th = PROVIDER_THEME[codigo];
            const enabled = !!config[key];
            return (
              <ProviderCard
                key={key}
                enabled={enabled}
                providerColor={th.color}
                providerLight={th.light}
                providerBorder={th.border}
                providerShadow={th.shadow}
              >
                <IconCircle color={th.color} light={th.light}>
                  <Icon sx={{ fontSize: 20, color: th.color }} />
                </IconCircle>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>
                      {label}
                    </Typography>
                    {config.metodo_predeterminado === codigo && (
                      <Tooltip title="Método predeterminado">
                        <StarRoundedIcon sx={{ fontSize: 14, color: "#f59e0b" }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>{sub}</Typography>
                </Box>

                <OrangeSwitch
                  providercolor={th.color}
                  size="small"
                  checked={enabled}
                  disabled={loading}
                  onChange={(e) => toggle(key)(e.target.checked)}
                />
              </ProviderCard>
            );
          })}
        </Box>

        {/* Método predeterminado */}
        <TextField
          select fullWidth size="small"
          label="Método predeterminado en login"
          value={config.metodo_predeterminado}
          onChange={(e) => setConfig((c) => ({ ...c, metodo_predeterminado: e.target.value }))}
          disabled={loading || metodosActivos.length === 0}
          helperText="Se preselecciona al cargar el correo en la pantalla de login."
          sx={{ mb: 3 }}
        >
          <MenuItem value=""><em>Automático (primer método habilitado)</em></MenuItem>
          {metodosActivos.map((m) => (
            <MenuItem key={m.codigo} value={m.codigo}>{m.label}</MenuItem>
          ))}
        </TextField>

        <Divider sx={{ mb: 3 }} />

        {/* ── Verificación en dos pasos ────────────────────────── */}
        <SectionTitle>Verificación en dos pasos (2FA)</SectionTitle>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

          {/* Exigir 2FA */}
          <TwoFaCard variant={config.requiere_2fa ? "required" : "default"}>
            <Box sx={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              bgcolor: config.requiere_2fa ? "#fff7ed" : "#f1f5f9",
              border: `1.5px solid ${config.requiere_2fa ? "#fed7aa" : "#e2e8f0"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <QrCodeScannerIcon sx={{ fontSize: 20, color: config.requiere_2fa ? "#f97316" : "#94a3b8" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", mb: 0.3 }}>
                Exigir 2FA con código QR
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.5 }}>
                Al iniciar sesión debe escanear QR y confirmar TOTP. Obligatorio, el usuario no puede desactivarlo.
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={!!config.requiere_2fa}
              disabled={loading}
              onChange={(e) => toggle("requiere_2fa")(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#f97316" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#f97316" },
              }}
            />
          </TwoFaCard>

          {/* Voluntario */}
          <TwoFaCard>
            <Box sx={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              bgcolor: config.permite_2fa_voluntario && !config.requiere_2fa ? "#f0fdf4" : "#f1f5f9",
              border: `1.5px solid ${config.permite_2fa_voluntario && !config.requiere_2fa ? "#bbf7d0" : "#e2e8f0"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PhoneAndroidIcon sx={{
                fontSize: 20,
                color: config.permite_2fa_voluntario && !config.requiere_2fa ? "#22c55e" : "#94a3b8",
              }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: config.requiere_2fa ? "#94a3b8" : "#0f172a", mb: 0.3 }}>
                Permitir configurar 2FA desde Perfil
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.5 }}>
                El usuario puede activar 2FA por su cuenta desde Mi perfil
                {config.requiere_2fa ? " (deshabilitado porque se exige 2FA obligatorio)." : "."}
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={!!config.permite_2fa_voluntario}
              disabled={loading || config.requiere_2fa}
              onChange={(e) => toggle("permite_2fa_voluntario")(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#22c55e" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#22c55e" },
              }}
            />
          </TwoFaCard>
        </Box>

        {/* Advertencia 2FA obligatorio */}
        <Collapse in={!!config.requiere_2fa}>
          <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.80rem" }}>
            Con <strong>Exigir 2FA</strong> activo, el usuario deberá vincular la app autenticadora en el primer acceso.
          </Alert>
        </Collapse>

        {/* Estado del dispositivo */}
        <DeviceStatusCard sx={{ mt: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <PulseDot dotcolor={estado2fa.dot} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>
              Estado del dispositivo 2FA
            </Typography>
            <Chip
              size="small" label={estado2fa.label} color={estado2fa.color}
              sx={{ fontSize: "0.68rem", height: 20, ml: "auto" }}
            />
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 2, lineHeight: 1.55 }}>
            Si el usuario perdió el teléfono o cambió de equipo, restablezca el 2FA para que pueda
            escanear un nuevo código QR en el próximo inicio de sesión.
          </Typography>
          <LoadingButton
            variant="outlined"
            size="small"
            color="warning"
            startIcon={<PhonelinkEraseIcon />}
            loading={resetting2fa}
            disabled={loading || !twoFactor.tiene_registro}
            onClick={() => setConfirmReset2fa(true)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Desactivar / resetear 2FA
          </LoadingButton>
          {!twoFactor.tiene_registro && !loading && (
            <Typography sx={{ fontSize: "0.70rem", color: "#94a3b8", mt: 1 }}>
              No hay 2FA vinculado en base de datos.
            </Typography>
          )}
        </DeviceStatusCard>

        <Divider sx={{ mt: 3, mb: 2.5 }} />

        {/* Info guardar */}
        <Alert severity="success" variant="outlined" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.80rem" }}>
          Los cambios aplican en el login solo después de pulsar <strong>Guardar configuración</strong>.
        </Alert>

        {/* Botón guardar */}
        <LoadingButton
          fullWidth
          variant="contained"
          size="large"
          loading={saving}
          onClick={handleSave}
          disabled={loading}
          startIcon={<SaveOutlinedIcon />}
          sx={{
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.92rem",
            bgcolor: "#f97316",
            boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            "&:hover": { bgcolor: "#ea580c", boxShadow: "0 6px 18px rgba(249,115,22,0.45)" },
          }}
        >
          Guardar configuración de acceso
        </LoadingButton>

      </Box>

      <Confirm
        open={confirmReset2fa}
        title="Restablecer verificación en dos pasos"
        text={
          email
            ? `¿Restablecer el 2FA de ${email}? Se borrará el vínculo con el teléfono anterior y deberá configurar la app autenticadora de nuevo.`
            : "¿Restablecer el 2FA de este usuario? Deberá escanear un nuevo código QR en el próximo acceso."
        }
        confirmText="Sí, restablecer"
        cancelText="Cancelar"
        onConfirm={handleReset2fa}
        onCancel={() => setConfirmReset2fa(false)}
      />
    </PanelWrap>
  );
};

export default UsuarioAuthConfigPanel;
