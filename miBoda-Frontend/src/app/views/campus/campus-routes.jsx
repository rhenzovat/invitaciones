import { lazy } from "react";
import Loadable from "../../components/Loadable";

const CampusDashboard  = Loadable(lazy(() => import("./CampusDashboard")));
const ProyectoDetalle  = Loadable(lazy(() => import("./ProyectoDetalle")));
const CampusAdminPanel = Loadable(lazy(() => import("./CampusAdminPanel")));
const ProyectoAgenda   = Loadable(lazy(() => import("./ProyectoAgenda")));
const NotificacionAdminPage = Loadable(lazy(() => import("./NotificacionAdminPage")));

const campusRoutes = [
  { path: "/campus/dashboard",          element: <CampusDashboard /> },
  { path: "/campus/proyecto/:id",       element: <ProyectoDetalle /> },
  { path: "/campus/proyecto/:id/agenda",element: <ProyectoAgenda /> },
  { path: "/campus/admin",              element: <CampusAdminPanel /> },
  { path: "/campus/notificaciones",     element: <NotificacionAdminPage /> },
];

export default campusRoutes;
