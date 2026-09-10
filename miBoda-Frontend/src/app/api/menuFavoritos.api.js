import { apiClient } from "../contexts/JWTAuthContext";
import { from } from "rxjs";
import { map } from "rxjs/operators";

const URL = "/menu/favoritos";

function roleParams(id_roles) {
  return id_roles != null ? { id_roles: Number(id_roles) } : {};
}

export function listarFavoritos(id_roles) {
  return from(apiClient.get(`${URL}/listar`, { params: roleParams(id_roles) })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function toggleFavorito(params) {
  return from(apiClient.post(`${URL}/toggle`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function registrarVisitaFavorito(params) {
  return from(apiClient.post(`${URL}/registrar_visita`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}
