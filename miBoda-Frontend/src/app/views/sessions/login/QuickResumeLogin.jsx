import React, { useState } from "react";
import { Box, Typography, Avatar, Button, CircularProgress } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { getStoredRefreshToken } from "app/utils/authStorage";
import { getLastSessionUser } from "app/utils/authLastSession";

function QuickResumeLogin({ onContinue, onSwitchAccount, loading: externalLoading = false }) {
  const lastUser = getLastSessionUser();
  const hasRefresh = !!getStoredRefreshToken();
  const [loading, setLoading] = useState(false);

  if (!lastUser?.id) {
    if (!onSwitchAccount) return null;
    return (
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Button
          size="small"
          sx={{ textTransform: "none", fontWeight: 600, color: "#64748b" }}
          onClick={() => onSwitchAccount()}
        >
          Acceder con otra cuenta
        </Button>
      </Box>
    );
  }

  const busy = loading || externalLoading;
  const initials = (lastUser.name || lastUser.email || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleClick = async () => {
    if (!onContinue || busy) return;
    setLoading(true);
    try {
      await onContinue(lastUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 2,
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        bgcolor: "#f8fafc",
        cursor: busy ? "wait" : "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": busy
          ? {}
          : {
              borderColor: "#f97316",
              boxShadow: "0 8px 24px rgba(249,115,22,0.12)",
            },
      }}
      onClick={busy ? undefined : handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !busy) handleClick();
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          src={lastUser.avatar || undefined}
          sx={{
            width: 56,
            height: 56,
            bgcolor: "#f97316",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {hasRefresh ? "Continuar como" : "Última cuenta"}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: "#0d1b3e" }}>
            {lastUser.name || lastUser.email}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {lastUser.email}
          </Typography>
        </Box>
        {busy ? (
          <CircularProgress size={28} sx={{ color: "#f97316" }} />
        ) : (
          <LoadingButton
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            sx={{
              bgcolor: "#f97316",
              "&:hover": { bgcolor: "#ea580c" },
              whiteSpace: "nowrap",
            }}
          >
            {hasRefresh ? "Entrar" : "Continuar"}
          </LoadingButton>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
        {hasRefresh
          ? "Entrará directo al panel sin volver a validar en Google."
          : "Pulse Continuar para iniciar sesión (solo abrirá Google si la sesión expiró)."}
      </Typography>
      {onSwitchAccount && (
        <Button
          size="small"
          sx={{ mt: 1, textTransform: "none" }}
          onClick={(e) => {
            e.stopPropagation();
            onSwitchAccount(lastUser);
          }}
        >
          Usar otra cuenta
        </Button>
      )}
    </Box>
  );
}

export default QuickResumeLogin;
