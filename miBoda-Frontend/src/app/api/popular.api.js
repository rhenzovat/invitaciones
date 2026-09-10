import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from ,catchError, throwError} from 'rxjs';
import { map } from 'rxjs/operators';

const BASE_URL = "";

// Categorías Populares
export function listarCategoriasPopulares() {
  return from(apiClient.get(`${BASE_URL}/categoria-popular/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crearCategoriaPopular(params) {
  return from(apiFormDataClient.post(`${BASE_URL}/categoria-popular/crear`, params))
    .pipe(
      map(result => result.data),
      // CAPTURAR EL ERROR Y LANZARLO PARA QUE LLEGUE AL CATCH
      catchError(error => {
        console.error('Error en crearCategoriaPopular:', error);
        // Lanzar el error completo para que llegue al catch en PopularIndexPage
        return throwError(() => error);
      })
    )
    .toPromise();
}

export function actualizar_categoria_popular(id, params) {
  return from(apiFormDataClient.post(`${BASE_URL}/categoria-popular/actualizar/${id}`, params, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    }
  })).pipe(
    map(result => result.data)
  ).toPromise();
}

export function eliminar_categoria_popular(id) {
  return from(apiClient.delete(`${BASE_URL}/categoria-popular/eliminar/${id}`)).pipe(
    map(result => result.data)
  ).toPromise();
}

// Banners Populares
export function listarBannersPopulares() {
  return from(apiClient.get(`${BASE_URL}/banner-popular/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crearBannerPopular(params) {
  return from(apiFormDataClient.post(`${BASE_URL}/banner-popular/crear`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function actualizar_banner_popular(id, params) {
  return from(apiFormDataClient.post(`${BASE_URL}/banner-popular/actualizar/${id}`, params, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    }
  })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar_banner_popular(id) {
  return from(apiClient.delete(`${BASE_URL}/banner-popular/eliminar/${id}`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}