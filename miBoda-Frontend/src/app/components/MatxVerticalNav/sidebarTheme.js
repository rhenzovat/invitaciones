/**
 * ============================================================
 *  SIDEBAR THEME - Configuración centralizada del menú lateral
 * ============================================================
 *
 *  Todas las medidas, colores y espaciados del sidebar están aquí.
 *  Para ajustar el aspecto del menú, modifica SOLO este archivo.
 *
 *  Consumido por:
 *    - MatxVerticalNav.jsx          (ítems de navegación)
 *    - MatxVerticalNavExpansionPanel.jsx (paneles expandibles)
 *    - Sidenav.jsx                  (contenedor scrollable)
 *
 * ── HISTORIAL DE CAMBIOS ────────────────────────────────────
 *  2026-02-12  v1  Ultra-compacto: ITEM_HEIGHT=34, TEXT=0.8rem,
 *                  ICON=18px, PANEL_ML=20px, SIDEBAR_PX=0.5rem.
 *  2026-02-12  v2  Relajado un poco: ITEM_HEIGHT=38, TEXT=0.835rem,
 *                  ICON=19px, PANEL_ML=22px, SIDEBAR_PX=0.65rem,
 *                  ITEM_MB=2px, PANEL_PL=8px, BULLET +1px.
 *  2026-02-12  v3  Un poco más holgado: ITEM_HEIGHT=40, TEXT=0.85rem,
 *                  ICON=20px, ICON_W=32, PANEL_ML=24px,
 *                  SIDEBAR_PX=0.75rem, ITEM_MB=3px, LABEL_FS=11px.
 * ============================================================
 */

// ── COLORES ──────────────────────────────────────────────────
export const ACCENT = "#4ade80";                         // Verde acento principal
export const ACCENT_HOVER_BG = "rgba(74, 222, 128, 0.1)";  // Fondo al hacer hover
export const ACCENT_OPEN_BG = "rgba(74, 222, 128, 0.08)";  // Fondo cuando el panel está abierto
export const ACCENT_ACTIVE_BG =                            // Gradiente del ítem activo
  "linear-gradient(90deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.05) 100%)";
export const ACCENT_HIGHLIGHT_BG = "rgba(74, 222, 128, 0.15)";
export const BADGE_BG = "rgba(74, 222, 128, 0.2)";

export const TEXT_PRIMARY = "rgba(255, 255, 255, 0.85)";
export const TEXT_ICON = "rgba(255, 255, 255, 0.7)";
export const TEXT_MUTED = "rgba(255, 255, 255, 0.5)";
export const TEXT_LABEL = "rgba(255, 255, 255, 0.4)";
export const BULLET_BG = "rgba(255, 255, 255, 0.5)";

// ── MEDIDAS DE ÍTEMS ─────────────────────────────────────────
export const ITEM_HEIGHT = 40;            // px - Altura de cada ítem del menú  (v2: 38, v1: 34)
export const ITEM_MARGIN_BOTTOM = "3px";  // Separación entre ítems             (v2: 2px, v1: 1px)
export const ITEM_BORDER_RADIUS = "5px";  // Redondeo de esquinas               (v2: 4px)
export const ITEM_PADDING_RIGHT = "12px"; // Padding derecho del botón          (v2: 10px, v1: 8px)

// ── ÍCONOS ───────────────────────────────────────────────────
export const ICON_SIZE = "20px";          // Tamaño de fuente del ícono Material (v2: 19px, v1: 18px)
export const ICON_WIDTH = 32;             // px - Ancho del contenedor del ícono (v2: 30, v1: 28)
export const ICON_PADDING_LEFT = "14px";  //                                     (v2: 12px, v1: 10px)
export const ICON_PADDING_RIGHT = "8px";

// ── BULLET (punto para ítems sin ícono) ──────────────────────
export const BULLET_SIZE_NAV = "3.5px";      // padding del bullet en MatxVerticalNav  (v2: 3px, v1: 2.5px)
export const BULLET_SIZE_PANEL = 6;          // px - width/height en ExpansionPanel    (v1: 5)
export const BULLET_MARGIN_LEFT = "16px";    // En MatxVerticalNav                     (v2: 14px, v1: 12px)
export const BULLET_MARGIN_LEFT_PANEL = "14px"; // En ExpansionPanel                   (v2: 12px, v1: 10px)
export const BULLET_MARGIN_RIGHT = "8px";    //                                        (v2: 6px)

// ── TEXTO ────────────────────────────────────────────────────
export const TEXT_FONT_SIZE = "0.85rem";     //                                  (v2: 0.835rem, v1: 0.8rem)
export const TEXT_PADDING_LEFT = "0.55rem";  //                                  (v2: 0.5rem, v1: 0.4rem)
export const TEXT_FONT_WEIGHT = 400;
export const TEXT_ACTIVE_WEIGHT = 500;

// ── LABEL (secciones / categorías) ───────────────────────────
export const LABEL_FONT_SIZE = "11px";       //                                  (v2: 10px)
export const LABEL_MARGIN_TOP = "16px";      //                                  (v2: 14px, v1: 12px)
export const LABEL_MARGIN_LEFT = "14px";     //                                  (v2: 12px, v1: 10px)
export const LABEL_MARGIN_BOTTOM = "7px";    //                                  (v2: 6px, v1: 4px)
export const LABEL_LETTER_SPACING = "1px";
export const LABEL_FONT_WEIGHT = 600;

// ── PANEL DE EXPANSIÓN (submenús) ────────────────────────────
export const PANEL_PADDING_LEFT = "10px";    // Padding izq. del contenido expandido   (v2: 8px, v1: 6px)
export const PANEL_MARGIN_LEFT = "24px";     // Margen izq. (indentación)              (v2: 22px, v1: 20px)
export const PANEL_MARGIN_TOP = "2px";       //                                        (v2: 1px, v1: 0px)
export const PANEL_MARGIN_BOTTOM = "2px";    //                                        (v2: 1px, v1: 0px)
export const PANEL_BORDER_WIDTH = "2px";     // Grosor de la línea vertical de ramificación
export const PANEL_BRANCH_COLOR = ACCENT;    // Color de la línea vertical

// ── BADGE ────────────────────────────────────────────────────
export const BADGE_PADDING = "2px 10px";
export const BADGE_BORDER_RADIUS = "12px";
export const BADGE_FONT_SIZE = "11px";
export const BADGE_FONT_WEIGHT = 600;

// ── ACTIVE ITEM (ítem seleccionado) ──────────────────────────
export const ACTIVE_BORDER_LEFT = `3px solid ${ACCENT}`;

// ── CONTENEDOR SIDEBAR (Sidenav) ─────────────────────────────
export const SIDEBAR_PADDING_X = "0.75rem"; // Padding horizontal del scrollbar (v2: 0.65rem, v1: 0.5rem)

// ── COMPACT MODE ─────────────────────────────────────────────
export const COMPACT_WIDTH = 44;            // px - Ancho en modo compacto

// ── TRANSICIONES ─────────────────────────────────────────────
export const TRANSITION_SPEED = "200ms";
export const TRANSITION_EASING = "ease-in-out";
export const PANEL_TRANSITION = "max-height 0.3s cubic-bezier(0, 0, 0.2, 1)";
export const CHEVRON_TRANSITION = "transform 0.3s cubic-bezier(0, 0, 0.2, 1) 0ms";
