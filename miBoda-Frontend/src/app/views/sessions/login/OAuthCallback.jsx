import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import useAuth from "app/hooks/useAuth";
import { clear2faChallenge } from "app/utils/authChallengeStorage";

const OAUTH_EXCHANGE_KEY = "oauth_exchange_done";
const AUTH_ALTERNATE_ACCOUNT_KEY = "authAlternateAccount";

function destinoTrasLogin(result) {
  if (result?.requires2faSetup) return "/session/two-factor-setup";
  if (result?.requires2fa) return "/session/two-factor";
  const count = result?.profileCount ?? result?.user?.count;
  if (count > 1) return "/session/signin";
  return "/dashboard/default";
}

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuthExchange, logout } = useAuth();
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const err = searchParams.get("error");
    if (err) {
      setError(decodeURIComponent(err));
      return;
    }
    if (!code) {
      setError("No se recibió código de autenticación.");
      return;
    }

    const exchangeKey = `${OAUTH_EXCHANGE_KEY}:${code}`;
    if (sessionStorage.getItem(exchangeKey) === "ok") {
      navigate("/session/signin", { replace: true });
      return;
    }
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    (async () => {
      try {
        const result = await loginWithOAuthExchange(code);
        sessionStorage.removeItem(AUTH_ALTERNATE_ACCOUNT_KEY);
        sessionStorage.setItem(exchangeKey, "ok");
        const dest = destinoTrasLogin(result);
        const base = (import.meta.env.BASE_URL || "/admin/").replace(/\/$/, "");
        window.history.replaceState({}, "", `${base}${dest.startsWith("/") ? dest : `/${dest}`}`);
        navigate(dest, { replace: true });
      } catch (e) {
        startedRef.current = false;
        setError(e?.response?.data?.message || e?.message || "Error al completar el inicio de sesión.");
      }
    })();
  }, [searchParams, loginWithOAuthExchange, navigate]);

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Box sx={{ maxWidth: 420, width: "100%" }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              clear2faChallenge();
              logout();
            }}
          >
            Volver al inicio de sesión
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Completando inicio de sesión…</Typography>
    </Box>
  );
};

export default OAuthCallback;
