import { apiClient } from '../../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL = '/campus/excalidraw';

export const excalidrawCargar = (params) =>
  from(apiClient.get(`${URL}/cargar`, { params }))
    .pipe(map((r) => r.data.result))
    .toPromise();

export const excalidrawGuardar = (data) =>
  from(apiClient.post(`${URL}/guardar`, data))
    .pipe(map((r) => r.data.result))
    .toPromise();
