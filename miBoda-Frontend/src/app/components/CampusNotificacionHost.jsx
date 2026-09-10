import useAuth from 'app/hooks/useAuth';
import useCampusWebPush from 'app/hooks/useCampusWebPush';
import NotificacionToastHost from 'app/views/campus/NotificacionToastHost';

/** Monta alertas campus + Web Push en todo el admin (solo administrador principal). */
export default function CampusNotificacionHost() {
  const { user } = useAuth();
  const isAdmin = user?.es_administrador_principal == 1;
  const webPushActive = useCampusWebPush(isAdmin);

  if (!isAdmin) return null;

  return <NotificacionToastHost webPushActive={webPushActive} />;
}
