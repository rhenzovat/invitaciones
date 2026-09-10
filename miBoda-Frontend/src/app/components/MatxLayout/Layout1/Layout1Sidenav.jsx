import { memo } from "react";
import { styled } from "@mui/material/styles";

import useSettings from "app/hooks/useSettings";
import Brand from "app/components/Brand";
import Sidenav from "app/components/Sidenav";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { sidenavCompactWidth, sideNavWidth } from "app/utils/constant";

// STYLED COMPONENTS (fuera del render para evitar recrear clases CSS en cada render)
const SidebarNavRoot = styled("div", {
  shouldForwardProp: (prop) => !["width", "isCompact"].includes(prop)
})(({ width, isCompact }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: width,
  boxShadow: themeShadows[8],
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top",
  backgroundSize: "cover",
  zIndex: isCompact ? 111 : 9,
  overflow: "hidden",
  color: "#ffffff",
  transition: "all 250ms ease-in-out",
  background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
  /* hover-expand eliminado: en modo compact el sidebar NO se abre al pasar el mouse.
     Cada ítem muestra su nombre en un Tooltip al lado derecho. */
}));

const NavListBox = styled("div")({
  height: "100%",
  display: "flex",
  flexDirection: "column"
});

const SidenavScrollArea = styled("div")({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const Layout1Sidenav = () => {
  const { settings } = useSettings();
  const { mode } = settings.layout1Settings.leftSidebar;

  const getSidenavWidth = () => {
    if (mode === "compact") return sidenavCompactWidth;
    return sideNavWidth;
  };

  return (
    <SidebarNavRoot width={getSidenavWidth()} isCompact={mode === "compact"}>
      <NavListBox>
        <Brand />
        <SidenavScrollArea>
          <Sidenav />
        </SidenavScrollArea>
      </NavListBox>
    </SidebarNavRoot>
  );
};

export default memo(Layout1Sidenav);
