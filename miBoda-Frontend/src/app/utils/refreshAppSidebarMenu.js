/**
 * Helper global para refrescar el menú lateral (Sidenav) sin recargar la página.
 *
 * Úsalo después de:
 * - Activar / desactivar módulo o menú
 * - Crear, editar o eliminar entradas del menú
 * - Reordenar sidebar o convertir «Sin módulo»
 * - Guardar permisos de menú en Roles (mismo rol de sesión)
 *
 * @example
 * import { refreshAppSidebarMenu } from 'app/utils/refreshAppSidebarMenu';
 *
 * await actualizarModulo({ id_modulo: 5, Activo: 'S', id_roles: perfil.id_roles });
 * await refreshAppSidebarMenu();
 */

import {
  reloadSidebarMenu,
  subscribeSidebarReload,
  clearSidebarCache,
} from 'app/store/sidebarCache';

export { subscribeSidebarReload, clearSidebarCache };

/**
 * Invalida la caché del sidebar y dispara la recarga en Sidenav (y favoritos).
 * @returns {Promise<void>} Se resuelve cuando termina la petición del menú lateral.
 */
export function refreshAppSidebarMenu() {
  return reloadSidebarMenu();
}
