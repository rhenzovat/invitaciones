import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Clave en location.state que envía el sidebar al rehacer clic en el mismo ítem. */
export const SIDEBAR_RESET_STATE_KEY = "__sidebarReset";

/**
 * Cuando el usuario pulsa de nuevo el mismo enlace del sidebar (misma URL que la actual),
 * React Router no remonta la ruta. Se envía state con esta clave y este hook ejecuta onReset
 * (volver al listado / estado inicial del módulo) y limpia el state.
 */
export function useSidebarModuleReset(onReset) {
  const location = useLocation();
  const navigate = useNavigate();
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    const ts = location.state?.[SIDEBAR_RESET_STATE_KEY];
    if (ts == null) return;
    onResetRef.current();
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);
}
