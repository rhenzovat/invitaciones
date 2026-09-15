/**
 * Arbol de sidebar fijo para el panel de la invitacion (reemplaza el motor
 * generico de sistema_menu/sistema_modulo del monolito Laravel, que sirve a
 * decenas de negocios ajenos a esta app). El shape coincide exactamente con
 * el que espera MatxVerticalNav.jsx (name, path, id_menu, icon, children).
 */
export interface SidebarLeaf {
  name: string;
  path: string;
  id_menu: number;
  icon: string;
}

export interface SidebarGroup {
  name: string;
  icon: string;
  id_menu: number;
  children: SidebarLeaf[];
}

export const EVENTO_MENU_ITEMS: SidebarLeaf[] = [
  { name: "Resumen", path: "/dashboard/default", id_menu: 1, icon: "dashboard" },
  { name: "Evento", path: "/evento/index", id_menu: 2, icon: "event" },
  { name: "General", path: "/evento-general/index", id_menu: 3, icon: "tune" },
  { name: "Hero", path: "/evento-hero/index", id_menu: 4, icon: "wallpaper" },
  { name: "Sobre", path: "/evento-sobre/index", id_menu: 5, icon: "mail" },
  { name: "Familia", path: "/evento-familia/index", id_menu: 6, icon: "family_restroom" },
  { name: "Ubicaciones", path: "/evento-ubicaciones/index", id_menu: 7, icon: "place" },
  { name: "Itinerario", path: "/evento-itinerario/index", id_menu: 8, icon: "schedule" },
  { name: "Vestimenta", path: "/evento-vestimenta/index", id_menu: 9, icon: "checkroom" },
  { name: "RSVP", path: "/evento-rsvp/index", id_menu: 10, icon: "how_to_reg" },
  { name: "Regalos", path: "/evento-regalos/index", id_menu: 11, icon: "card_giftcard" },
  { name: "Momento 1", path: "/evento-momento1/index", id_menu: 12, icon: "photo" },
  { name: "Momento 2", path: "/evento-momento2/index", id_menu: 13, icon: "photo" },
  { name: "Momento 3", path: "/evento-momento3/index", id_menu: 14, icon: "photo" },
  { name: "Cuenta regresiva", path: "/evento-countdown/index", id_menu: 15, icon: "hourglass_bottom" },
  { name: "Nuestra Historia", path: "/evento-historia/index", id_menu: 16, icon: "favorite" },
  { name: "Multimedia", path: "/evento-multimedia/index", id_menu: 17, icon: "perm_media" },
  { name: "Restricciones", path: "/evento-restricciones/index", id_menu: 18, icon: "block" },
  { name: "Video", path: "/evento-video/index", id_menu: 19, icon: "videocam" },
  { name: "Galeria", path: "/evento-galeria/index", id_menu: 20, icon: "photo_library" },
];

export const BANDEJAS_MENU_ITEMS: SidebarLeaf[] = [
  // "Confirmaciones (RSVP)" se saco del menu: fecha/acompanante/estado ahora
  // se ven directo en "Lista de invitados" para no manejar dos pantallas.
  // El endpoint /web_rsvp_respuestas sigue activo (por si se necesita luego).
  { name: "Sugerencias de cancion", path: "/cancion-sugerencias/index", id_menu: 22, icon: "music_note" },
  { name: "Fotos de invitados", path: "/galeria-fotos/index", id_menu: 23, icon: "photo_camera" },
  { name: "Lista de invitados", path: "/invitados/index", id_menu: 24, icon: "groups" },
];

export function buildSidebarTree(): Array<SidebarGroup | SidebarLeaf> {
  return [
    { name: "Resumen", path: "/dashboard/default", id_menu: 1, icon: "dashboard" },
    {
      name: "Invitacion",
      icon: "favorite",
      id_menu: 100,
      children: EVENTO_MENU_ITEMS.filter((i) => i.id_menu !== 1),
    },
    {
      name: "Bandejas",
      icon: "inbox",
      id_menu: 101,
      children: BANDEJAS_MENU_ITEMS,
    },
  ];
}

export function buildUrlMenuMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of [...EVENTO_MENU_ITEMS, ...BANDEJAS_MENU_ITEMS]) {
    map[item.path] = item.id_menu;
  }
  return map;
}

export function buildMenusPermitidos(): number[] {
  return [...EVENTO_MENU_ITEMS, ...BANDEJAS_MENU_ITEMS].map((i) => i.id_menu);
}
