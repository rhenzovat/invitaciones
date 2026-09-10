export const CMS_PANEL_WIDTH = 330;

/**
 * Panel CMS de edición: se superpone al menú lateral (left: 0, z-index alto en CmsPanelRoot).
 * El contenido principal se desplaza con contentShift / useCmsPanelPush.
 */
export default function useCmsPanelLayout() {
  const panelLeft = 0;
  const contentShift = (panelOpen) => (panelOpen ? CMS_PANEL_WIDTH : 0);

  return { panelLeft, panelWidth: CMS_PANEL_WIDTH, contentShift };
}
