import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SecurityIcon from "@mui/icons-material/Security";
import useAuth from "app/hooks/useAuth";
import {
  getStored2faSetup,
  getStored2faRecoveryCodes,
  persist2faRecoveryCodes,
  clear2faRecoveryCodes,
} from "app/utils/authChallengeStorage";
import * as auth2faApi from "app/api/auth2fa.api";

const TwoFactorMandatorySetup = () => {
  const navigate = useNavigate();
  const { completeMandatory2fa, logout, isAuthenticated } = useAuth();
  const setup = getStored2faSetup();
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState(() => getStored2faRecoveryCodes());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const goToLogin = () => {
    logout();
  };

  const goToDashboard = () => {
    clear2faRecoveryCodes();
    navigate("/dashboard/default", { replace: true });
  };

  useEffect(() => {
    if (recoveryCodes?.length && isAuthenticated) {
      setInitLoading(false);
      return;
    }
    if (!setup?.token) {
      setInitLoading(false);
      return;
    }
    auth2faApi
      .mandatory2faInit(setup.token)
      .then((data) => {
        setQr(data.qr_code);
        setSecret(data.secret || "");
        setEmail(data.email || "");
      })
      .catch((e) => {
        setError(e?.response?.data?.message || e?.message || "No se pudo iniciar la configuración.");
      })
      .finally(() => setInitLoading(false));
  }, [setup?.token, recoveryCodes?.length, isAuthenticated]);

  if (!recoveryCodes?.length && !setup?.token) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Card sx={{ p: 4, maxWidth: 440, width: "100%" }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay sesión de configuración 2FA (expiró o ya se completó). Cierre sesión e inicie de nuevo con su
            usuario.
          </Alert>
          <Button variant="contained" fullWidth onClick={goToLogin}>
            Ir al inicio de sesión
          </Button>
        </Card>
      </Box>
    );
  }

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await auth2faApi.mandatory2faConfirm(setup.token, code);
      await completeMandatory2fa(data, setup.rememberMe);
      if (data.recovery_codes?.length) {
        persist2faRecoveryCodes(data.recovery_codes);
        setRecoveryCodes(data.recovery_codes);
      } else {
        goToDashboard();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  if (recoveryCodes?.length) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Card sx={{ p: 4, maxWidth: 440, width: "100%" }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            2FA activado. Guarde estos códigos de recuperación (solo se muestran una vez):
          </Alert>
          <List dense>
            {recoveryCodes.map((c) => (
              <ListItem key={c} disablePadding>
                <ListItemText primary={c} primaryTypographyProps={{ fontFamily: "monospace" }} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={goToDashboard}>
            Continuar al panel
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #060d1f 0%, #0d1b3e 50%, #1a1040 100%)",
        p: 2,
      }}
    >
      <Card sx={{ p: 4, maxWidth: 440, width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Configuración obligatoria 2FA</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Su rol exige verificación en dos pasos. Escanee el QR con Google Authenticator o Microsoft Authenticator
          {email ? ` (${email})` : ""}.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {initLoading ? (
          <Typography color="text.secondary">Generando código QR…</Typography>
        ) : (
          <>
            {qr && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <img src={qr} alt="QR 2FA" style={{ maxWidth: 220 }} />
              </Box>
            )}
            {secret && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Clave manual: <strong>{secret}</strong>
              </Alert>
            )}
            <form onSubmit={handleConfirm}>
              <TextField
                fullWidth
                label="Código de 6 dígitos"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ maxLength: 6, inputMode: "numeric" }}
                sx={{ mb: 2 }}
              />
              <LoadingButton type="submit" variant="contained" fullWidth loading={loading}>
                Activar y continuar
              </LoadingButton>
            </form>
          </>
        )}

        <Button fullWidth sx={{ mt: 2 }} onClick={goToLogin}>
          Cancelar e ir al inicio de sesión
        </Button>
      </Card>
    </Box>
  );
};

export default TwoFactorMandatorySetup;
