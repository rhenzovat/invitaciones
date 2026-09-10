import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getObjetosCache, setObjetosCache } from '../store/objetosCache';
import { listar as listarObjetos } from '../api/objetos.api';
import useAuth from '../hooks/useAuth';

/**
 * Convierte nombre de BD en clave de objeto.
 * Ejemplos: "EDITAR" → "editar"  |  "AGREGAR MATERIAL" → "agregar_material"
 */
function nombreToKey(nombre) {
  return nombre.toLowerCase().replace(/ /g, '_');
}

/**
 * Construye el objeto de permisos dinámicamente desde sistema_objetos (BD).
 * @param {number[]} arrayPermisos - IDs de objetos que el usuario tiene en este menú
 * @param {Array<{id_objetos: number, nombre: string}>} objetos - catálogo desde BD
 */
function buildPermissions(arrayPermisos, objetos) {
  const result = {};
  const permisosNorm = arrayPermisos.map(id => Number(id)).filter(n => !Number.isNaN(n));
  objetos.forEach(obj => {
    const objId = Number(obj.id_objetos);
    result[nombreToKey(obj.nombre)] = !Number.isNaN(objId) && permisosNorm.some(id => id === objId);
  });
  return result;
}

/**
 * Construye objeto con TODOS los permisos en true (para admin o acceso total).
 */
function buildAllTrue(objetos) {
  const result = {};
  objetos.forEach(obj => {
    result[nombreToKey(obj.nombre)] = true;
  });
  return result;
}

/**
 * Encuentra el id_menu que corresponde al pathname actual
 * usando el mapa url→id_menu incluido en el perfil desde el login.
 */
function resolveMenuId(urlMenuMap, pathname) {
  if (!urlMenuMap || typeof urlMenuMap !== 'object') return 0;
  for (const [url, id_menu] of Object.entries(urlMenuMap)) {
    const normalized = url.startsWith('/') ? url : `/${url}`;
    if (pathname === normalized || pathname.endsWith(normalized)) {
      return id_menu;
    }
  }
  return 0;
}

/**
 * Hook de permisos de botones — totalmente dinámico desde BD.
 *
 * - No requiere parámetros: obtiene perfil e id_menu automáticamente.
 * - id_menu se detecta usando perfil.url_menu_map (sin depender del sidebar cache).
 * - Los permisos (editar, crear, eliminar...) vienen de sistema_objetos en BD.
 * - Admin (id_usuario == 1) siempre recibe todos los permisos en true.
 */
const useAccesosObjetos = () => {
  const { perfil, user } = useAuth();
  const { pathname } = useLocation();

  // sistema_objetos en state: carga desde BD una sola vez por sesión
  const [objetos, setObjetos] = useState(() => getObjetosCache() || []);

  useEffect(() => {
    if (objetos.length === 0) {
      listarObjetos()
        .then(data => {
          setObjetosCache(data);
          setObjetos(data);
        })
        .catch(() => {});
    }
  }, []);

  // Sin objetos cargados aún → esperar
  if (objetos.length === 0) return { accessButton: [] };

  // Admin legacy (id=1) o administrador principal: todos los botones
  if (
    String(perfil?.id_usuario) === '1' ||
    user?.es_administrador_principal === true ||
    user?.es_administrador_principal === 1 ||
    user?.es_administrador_principal === '1'
  ) {
    return { accessButton: buildAllTrue(objetos) };
  }

  // Detectar id_menu por URL usando el mapa del perfil (viene del login, sin timing)
  const resolvedMenuId = resolveMenuId(perfil.url_menu_map, pathname);
  if (!resolvedMenuId) return { accessButton: [] };

  // Extraer los IDs de objetos que el perfil tiene para este menú
  const menuObjetosStr = perfil?.menu_objetos ?? '';
  const listMenus = menuObjetosStr ? menuObjetosStr.split('-') : [];
  let array = null;
  const mergePermisos = (menuId, target) => {
    listMenus.forEach(element => {
      const idx = element.indexOf('_');
      if (idx === -1) return;
      const mid = parseInt(element.slice(1, idx), 10);
      if (mid !== menuId && String(mid) !== String(menuId)) return;
      const elementSinBarras = element.replace(/[.*+?^${}()|[\]\\]/g, '');
      const listObjetos = (elementSinBarras.split('_')[1] || '').trim();
      const ids = listObjetos
        ? listObjetos.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))
        : [];
      target.push(...ids);
    });
  };

  const idsMerged = [];
  mergePermisos(resolvedMenuId, idsMerged);
  if (idsMerged.length > 0 || listMenus.some(el => el.includes(`|${resolvedMenuId}_`))) {
    array = [...new Set(idsMerged)];
  }

  // Menú permitido sin objetos (ej. enlace nuevo sin acciones configuradas)
  if (array == null && Array.isArray(perfil?.menus_permitidos)) {
    const allowed = perfil.menus_permitidos.map(Number);
    if (allowed.includes(Number(resolvedMenuId))) {
      array = [];
    }
  }

  return {
    accessButton: array != null ? buildPermissions(array, objetos) : []
  };
};

export default useAccesosObjetos;
