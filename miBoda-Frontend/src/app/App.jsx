import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfigProvider, theme as antTheme } from "antd";
import esES from "antd/locale/es_ES";
import "antd/dist/reset.css";
// ROOT THEME PROVIDER
import { MatxTheme } from "./components";
// ALL CONTEXTS
import SettingsProvider from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/JWTAuthContext";
// ROUTES
import routes from "./routes";
//IDIOMA
import { IntlProvider } from "react-intl";
import messages from "./i18n/messages/es.json";
let locale = "es";
//PARA LAS NOTIFICACIONES
import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
//jorge
import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import "./utils/custom_v1.scss";
import useAppFavicon from "app/hooks/useAppFavicon";
import AppErrorBoundary from "./components/AppErrorBoundary";

export default function App() {
  useAppFavicon();
  const content = useRoutes(routes);

  // Si llegamos a renderizar bien, limpiar la bandera de recarga-por-chunk
  // para que un futuro deploy pueda volver a disparar el auto-reload.
  useEffect(() => {
    sessionStorage.removeItem("app_chunk_reload_once");
  }, []);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ConfigProvider
        locale={esES}
        theme={{
          algorithm: antTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#22c55e",
            borderRadius: 6,
          },
        }}
      >
        <SettingsProvider>
          <ToastContainer />
          <AuthProvider>
            <MatxTheme>
              <CssBaseline />
              <AppErrorBoundary>{content}</AppErrorBoundary>
            </MatxTheme>
          </AuthProvider>
        </SettingsProvider>
      </ConfigProvider>
    </IntlProvider>
  );
}
