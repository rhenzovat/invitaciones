/** Select/ComboBox dentro de CmsPanelRoot (z-index 1600): el menú debe ir por encima. */
export const CMS_SELECT_MENU_PROPS = {
  disableScrollLock: true,
  sx: { zIndex: 2000 },
  PaperProps: {
    sx: {
      zIndex: 2000,
      bgcolor: "#1e293b",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      maxHeight: 280,
      "& .MuiMenuItem-root": { color: "#f1f5f9", fontSize: "0.85rem", py: 0.9 },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(249,115,22,0.22)" },
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(249,115,22,0.35)" },
      "& .MuiMenuItem-root.Mui-selected:hover": { bgcolor: "rgba(249,115,22,0.42)" },
    },
  },
};

/** Para TextField select (MUI v6): MenuProps va dentro de SelectProps. */
export const CMS_TEXTFIELD_SELECT_PROPS = {
  MenuProps: CMS_SELECT_MENU_PROPS,
};
