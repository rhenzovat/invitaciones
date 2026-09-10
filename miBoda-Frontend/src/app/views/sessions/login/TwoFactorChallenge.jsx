import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SecurityIcon from "@mui/icons-material/Security";
import useAuth from "app/hooks/useAuth";
import { getStored2faChallenge, clear2faChallenge } from "app/utils/authChallengeStorage";

const AUTH_ALTERNATE_ACCOUNT_KEY = "authAlternateAccount";

const TwoFactorChallenge = () => {
  const navigate = useNavigate();
  const { verify2fa, logout } = useAuth();
  const challenge = getStored2faChallenge();

  /** Si el usuario pidió "otra cuenta", no mostrar 2FA de la sesión anterior. */
  useEffect(() => {
    if (sessionStorage.getItem(AUTH_ALTERNATE_ACCOUNT_KEY) === "1") {
      clear2faChallenge();
      navigate("/session/signin", { replace: true });
    }
  }, [navigate]);
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  if (!challenge?.token) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Card sx={{ p: 4, maxWidth: 420, width: "100%" }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            No hay una verificación pendiente. Inicie sesión de nuevo.
          </Alert>
          <Button variant="contained" fullWidth onClick={() => logout()}>
            Ir al inicio de sesión
          </Button>
        </Card>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verify2fa(code.replace(/\s/g, ""), trustDevice);
      navigate("/dashboard/default", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(AUTH_ALTERNATE_ACCOUNT_KEY);
    logout();
  };

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
      <Card sx={{ p: 4, maxWidth: 420, width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Verificación en dos pasos</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {useRecovery
            ? "Ingrese uno de sus códigos de recuperación (formato XXXX-XXXX)."
            : "Abra Google Authenticator (o similar) e ingrese el código de 6 dígitos."}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={useRecovery ? "Código de recuperación" : "Código TOTP"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            inputProps={{
              maxLength: useRecovery ? 12 : 6,
              inputMode: useRecovery ? "text" : "numeric",
              autoComplete: "one-time-code",
            }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            sx={{ mb: 1, alignItems: "flex-start" }}
            control={
              <Checkbox
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                sx={{ pt: 0.5 }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                No volver a pedir el código en este equipo por 30 días
              </Typography>
            }
          />
          <LoadingButton type="submit" variant="contained" fullWidth loading={loading} sx={{ mb: 1 }}>
            Verificar
          </LoadingButton>
        </form>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => {
              setUseRecovery((v) => !v);
              setCode("");
              setError(null);
            }}
          >
            {useRecovery ? "Usar código de la app" : "Usar código de recuperación"}
          </Link>
        </Box>

        <Button fullWidth sx={{ mt: 2 }} onClick={handleCancel}>
          Cancelar
        </Button>
      </Card>
    </Box>
  );
};

export default TwoFactorChallenge;
