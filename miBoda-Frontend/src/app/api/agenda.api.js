import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL = '/campus/agenda';

// ─── Fases ────────────────────────────────────────────────────────────────────
export const fasesListar    = (p) => from(apiClient.get(`${URL}/fases/listar`,      { params: p })).pipe(map(r => r.data.result)).toPromise();
export const fasesCrear     = (d) => from(apiClient.post(`${URL}/fases/crear`,      d)).pipe(map(r => r.data.result)).toPromise();
export const fasesActualizar= (d) => from(apiClient.put(`${URL}/fases/actualizar`,  d)).pipe(map(r => r.data.result)).toPromise();
export const fasesEliminar  = (p) => from(apiClient.delete(`${URL}/fases/eliminar`, { params: p })).pipe(map(r => r.data.result)).toPromise();

// ─── Tareas ───────────────────────────────────────────────────────────────────
export const tareasListar    = (p) => from(apiClient.get(`${URL}/tareas/listar`,      { params: p })).pipe(map(r => r.data.result)).toPromise();
export const tareasCrear     = (d) => from(apiClient.post(`${URL}/tareas/crear`,      d)).pipe(map(r => r.data.result)).toPromise();
export const tareasActualizar= (d) => from(apiClient.put(`${URL}/tareas/actualizar`,  d)).pipe(map(r => r.data.result)).toPromise();
export const tareasMover     = (d) => from(apiClient.put(`${URL}/tareas/mover`,       d)).pipe(map(r => r.data.result)).toPromise();
export const tareasEliminar  = (p) => from(apiClient.delete(`${URL}/tareas/eliminar`, { params: p })).pipe(map(r => r.data.result)).toPromise();

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const agendaProgreso  = (p) => from(apiClient.get(`${URL}/progreso`,   { params: p })).pipe(map(r => r.data.result)).toPromise();
export const agendaHistorial = (p) => from(apiClient.get(`${URL}/historial`,  { params: p })).pipe(map(r => r.data.result)).toPromise();
