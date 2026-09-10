import { createContext, useState } from "react";
import merge from "lodash/merge";
// CUSTOM COMPONENT
import { MatxLayoutSettings } from "app/components/MatxLayout/settings";

const SIDEBAR_MODE_KEY = "prestomart_sidebar_mode";

function getInitialSettings(settings) {
  const base = settings || MatxLayoutSettings;
  try {
    const savedMode = localStorage.getItem(SIDEBAR_MODE_KEY);
    if (savedMode && savedMode !== "close") {
      return merge({}, base, { layout1Settings: { leftSidebar: { mode: savedMode } } });
    }
    if (savedMode === "close") {
      try { localStorage.removeItem(SIDEBAR_MODE_KEY); } catch (_) {}
    }
  } catch (_) {}
  return base;
}

export const SettingsContext = createContext({
  settings: MatxLayoutSettings,
  updateSettings: () => {}
});

export default function SettingsProvider({ settings, children }) {
  const [currentSettings, setCurrentSettings] = useState(() => getInitialSettings(settings));

  const handleUpdateSettings = (update = {}) => {
    const merged = merge({}, currentSettings, update);
    setCurrentSettings(merged);

    // Persistir solo modos elegidos por el usuario (no el cierre temporal del CMS)
    const newMode = merged.layout1Settings?.leftSidebar?.mode;
    if (newMode && newMode !== "mobile" && newMode !== "close") {
      try { localStorage.setItem(SIDEBAR_MODE_KEY, newMode); } catch (_) {}
    }
  };

  return (
    <SettingsContext.Provider
      value={{ settings: currentSettings, updateSettings: handleUpdateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
