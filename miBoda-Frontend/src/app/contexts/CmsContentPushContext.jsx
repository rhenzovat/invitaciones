import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CMS_PANEL_WIDTH } from "app/hooks/useCmsPanelLayout";
import useSettings from "app/hooks/useSettings";
import { sideNavWidth, sidenavCompactWidth } from "app/utils/constant";

const CmsContentPushContext = createContext(null);

function getSidenavWidthPx(settings) {
  const mode = settings?.layout1Settings?.leftSidebar?.mode ?? "full";
  const show = settings?.layout1Settings?.leftSidebar?.show !== false;
  if (!show || mode === "close") return 0;
  if (mode === "compact") return sidenavCompactWidth;
  return sideNavWidth;
}

export function CmsContentPushProvider({ children }) {
  const { settings } = useSettings();
  const [panelOpen, setPanelOpen] = useState(false);

  const setCmsPanelPush = useCallback((open) => {
    setPanelOpen(!!open);
  }, []);

  /** Empuje adicional del contenido: panel (left:0) menos margen que ya aporta el sidenav. */
  const contentOffset = useMemo(() => {
    if (!panelOpen) return 0;
    const navW = getSidenavWidthPx(settings);
    return Math.max(0, CMS_PANEL_WIDTH - navW);
  }, [panelOpen, settings]);

  const value = useMemo(
    () => ({ contentOffset, setCmsPanelPush, panelOpen }),
    [contentOffset, setCmsPanelPush, panelOpen]
  );

  return (
    <CmsContentPushContext.Provider value={value}>
      {children}
    </CmsContentPushContext.Provider>
  );
}

export function useCmsContentPush() {
  const ctx = useContext(CmsContentPushContext);
  if (!ctx) {
    return { contentOffset: 0, setCmsPanelPush: () => {}, panelOpen: false };
  }
  return ctx;
}

/** Sincroniza el desplazamiento del layout (pestañas + contenido) con el panel CMS abierto. */
export function useCmsPanelPush(panelOpen) {
  const { setCmsPanelPush } = useCmsContentPush();

  useEffect(() => {
    setCmsPanelPush(!!panelOpen);
    return () => setCmsPanelPush(false);
  }, [panelOpen, setCmsPanelPush]);
}
