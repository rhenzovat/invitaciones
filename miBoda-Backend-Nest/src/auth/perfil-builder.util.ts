import { buildMenusPermitidos, buildUrlMenuMap } from "../menu/menu-data";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  Activo: string;
  es_administrador_principal: boolean;
}

/**
 * Arma el objeto "perfil" que espera JWTAuthContext.jsx, con acceso total ya
 * resuelto para el unico usuario admin de la invitacion. No se replica el
 * motor generico de roles/menu_objetos del monolito Laravel (sirve a otros
 * ~40 modulos ajenos a esta app) - en su lugar se devuelven los IDs fijos
 * de menu de la invitacion, y se activan los dos "bypass" que ya existen en
 * el frontend (MatxVerticalNav.jsx compara id_usuario === "1" en string;
 * useAccesosObjetos.jsx acepta ademas es_administrador_principal===true).
 */
export function buildPerfil(user: AdminUser) {
  const menusPermitidos = buildMenusPermitidos();
  const urlMenuMap = buildUrlMenuMap();
  const menuObjetos = menusPermitidos.map((id) => `|${id}_1,2,3,4,5|`).join("-");

  return {
    id_usuario: "1",
    nombre_usuario: user.name,
    email: user.email,
    nombre_perfil: "Administrador",
    id_perfil: 1,
    id_roles: 1,
    menu_objetos: menuObjetos,
    menus_permitidos: menusPermitidos,
    modulos_permitidos: [100, 101],
    url_menu_map: urlMenuMap,
  };
}

/** El `user` que se devuelve en la respuesta de login/refresh/validar_conexion. */
export function buildUserPayload(user: AdminUser, count: number) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    Activo: user.Activo,
    es_administrador_principal: true,
    count,
  };
}
