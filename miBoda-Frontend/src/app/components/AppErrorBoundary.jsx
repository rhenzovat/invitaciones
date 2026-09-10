import { Component } from "react";

/**
 * Evita pantalla en blanco: sin este boundary, si un import() dinamico
 * (React.lazy) falla -por ejemplo un chunk con hash viejo que ya no existe
 * en el servidor tras un nuevo deploy- React desmonta TODA la app porque
 * useRoutes() no soporta errorElement como los data routers.
 */
const RELOAD_FLAG = "app_chunk_reload_once";

const isChunkLoadError = (error) =>
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i.test(
    error?.message || ""
  );

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      // Version nueva desplegada: recargar una vez trae el index.html
      // y los chunks actuales. Si vuelve a fallar tras esto, se muestra
      // el mensaje de error en vez de reintentar en bucle.
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      if (isChunkLoadError(this.state.error) && sessionStorage.getItem(RELOAD_FLAG) === "1") {
        return null; // recarga en curso
      }
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: 24,
            textAlign: "center",
            fontFamily: "sans-serif",
            gap: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Ocurrio un problema al cargar la pagina</h2>
          <p style={{ margin: 0, color: "#64748b" }}>
            Intenta recargar. Si el problema persiste, contacta a soporte tecnico.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#f97316",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
