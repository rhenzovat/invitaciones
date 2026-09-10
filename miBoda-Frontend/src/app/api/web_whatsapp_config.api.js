import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const obtenerWhatsappConfig = () =>
  from(apiClient.get('/web_whatsapp_config/obtener')).pipe(map((r) => r.data?.result ?? r.data));

export const actualizarWhatsappConfig = (data) =>
  from(apiClient.post('/web_whatsapp_config/actualizar', data)).pipe(map((r) => r.data?.result ?? r.data));
