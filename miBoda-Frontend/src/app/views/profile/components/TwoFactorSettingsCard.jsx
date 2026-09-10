import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SecurityIcon from "@mui/icons-material/Security";
import * as auth2faApi from "../../../api/auth2fa.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";

const TwoFactorSettingsCard = () => {
  const [status, setStatus] = useState({
    enabled: false,
    pending_setup: false,
    mandatory: false,
    can_disable: true,
    can_self_configure: true,
  });
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [error, setError] = useState(null);

  const loadStatus = async () => {
    try {
      const s = await auth2faApi.status2fa();
      setStatus(s);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo cargar el estado de 2FA.");
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    setRecoveryCodes(null);
    try {
      const data = await auth2faApi.setup2fa();
      setSetup(data);
      setStatus((s) => ({ ...s, pending_setup: true }));
    } catch (e) {
      handleErrorMessages("2FA", e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (confirmCode.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await auth2faApi.confirm2fa(confirmCode);
      setRecoveryCodes(res.result?.recovery_codes || []);
      setSetup(null);
      setConfirmCode("");
      toastSuccess("Verificación en dos pasos activada.");
      await loadStatus();
    } catch (e) {
      setError(e?.response?.data?.message || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth2faApi.disable2fa(disableCode);
      setDisableCode("");
      setSetup(null);
      toastSuccess("2FA desactivado.");
      await loadStatus();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo desactivar.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecovery = async () => {
    if (confirmCode.length !== 6) {
      setError("Ingrese su código TOTP actual (6 dígitos).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await auth2faApi.regenerateRecovery2fa(confirmCode);
      setRecoveryCodes(res.result?.recovery_codes || []);
      setConfirmCode("");
      toastSuccess("Códigos de recuperación regenerados.");
    } catch (e) {
      setError(e?.response?.data?.message || "Error al regenerar códigos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Verificación en dos pasos (2FA)</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {status.can_self_configure === false && !status.mandatory && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Su administrador no permite configurar 2FA desde el perfil. Solicite activación si la necesita.
          </Alert>
        )}

        {status.mandatory && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Su cuenta exige tener 2FA activo. Debe configurarlo al iniciar sesión; no puede desactivarlo desde aquí.
          </Alert>
        )}

        {status.enabled ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              2FA activo desde {status.habilitado_at ? new Date(status.habilitado_at).toLocaleString() : "—"}.
            </Alert>
            {status.can_disable !== false && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Para desactivar, ingrese un código de la app o un código de recuperación.
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Código TOTP o recuperación"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <LoadingButton variant="outlined" color="error" loading={loading} onClick={handleDisable}>
                  Desactivar 2FA
                </LoadingButton>
              </>
            )}
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Regenerar códigos de recuperación
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Código TOTP actual"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              sx={{ mb: 1 }}
            />
            <Button variant="text" onClick={handleRegenerateRecovery} disabled={loading}>
              Generar nuevos códigos
            </Button>
          </>
        ) : setup || status.pending_setup ? (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Escanee el código QR con Google Authenticator, Microsoft Authenticator u otra app compatible.
            </Typography>
            {setup?.qr_code && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <img src={setup.qr_code} alt="QR 2FA" style={{ maxWidth: 220 }} />
              </Box>
            )}
            {setup?.secret && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Clave manual: <strong>{setup.secret}</strong>
              </Alert>
            )}
            <TextField
              fullWidth
              size="small"
              label="Código de 6 dígitos"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              sx={{ mb: 2 }}
            />
            <LoadingButton variant="contained" loading={loading} onClick={handleConfirm}>
              Confirmar y activar
            </LoadingButton>
          </>
        ) : status.can_self_configure === false ? null : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Proteja su cuenta con un segundo factor. Tras activarlo, cada inicio de sesión (local u OAuth)
              pedirá un código de su app autenticadora.
            </Typography>
            <LoadingButton variant="contained" loading={loading} onClick={handleStartSetup}>
              Configurar 2FA
            </LoadingButton>
          </>
        )}

        {recoveryCodes?.length > 0 && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Guarde estos códigos de recuperación (solo se muestran una vez):
            </Typography>
            <List dense>
              {recoveryCodes.map((c) => (
                <ListItem key={c} disablePadding>
                  <ListItemText primary={c} primaryTypographyProps={{ fontFamily: "monospace" }} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSettingsCard;
