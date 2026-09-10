import React, { useState, useCallback } from "react";
import { Backdrop, CircularProgress, Box } from "@mui/material";
import useAuth from "app/hooks/useAuth";

export const WithLoandingPanel = (WrappedComponent, options = {}) => {
  function LoadingPanel(props) {
    const { logout, user } = useAuth();
    const [loadingState, setLoadingState] = useState(options.initialLoading ?? true);
    const [loadingMessage, setLoadingMessage] = useState(options.initialMessage || "Cargando...");

    const setLoading = useCallback((isLoading, message) => {
      setLoadingState(Boolean(isLoading));
      if (message) setLoadingMessage(message);
    }, []);

    // loadingState se pasa como prop para que el componente pueda manejarlo internamente
    const passProps = { ...props, setLoading, setLoadingMessage, useAuth, loadingState };

    if (!user) {
      return <WrappedComponent {...passProps} />;
    }

    // hideBackdrop: el componente maneja su propio loading (ej: dentro de un Dialog)
    if (options.hideBackdrop) {
      return <WrappedComponent {...passProps} />;
    }

    return (
      <Box sx={{ position: 'relative', minHeight: '300px' }}>
        <Backdrop
          open={loadingState}
          sx={{
            zIndex: 9999,
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'absolute',
            ...options.backdropStyle
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress color="inherit" />
            <Box sx={{ mt: 2 }}>{loadingMessage}</Box>
          </Box>
        </Backdrop>

        <Box sx={{ opacity: loadingState ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          <WrappedComponent {...passProps} />
        </Box>
      </Box>
    );
  }

  // Corregido el nombre de "Loanding" a "Loading"
  LoadingPanel.displayName = `WithLoandingPanel(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return LoadingPanel;
};

export default WithLoandingPanel;