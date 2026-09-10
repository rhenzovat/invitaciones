import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CMS_PANEL_WIDTH } from "app/hooks/useCmsPanelLayout";

const StyledRoot = styled(Box, {
  shouldForwardProp: (p) => p !== "open" && p !== "panelleft" && p !== "panelwidth",
})(({ open, panelleft = 0, panelwidth = CMS_PANEL_WIDTH }) => ({
  position: "fixed",
  top: 0,
  left: open ? panelleft : -(panelwidth + 10),
  width: panelwidth,
  height: "100vh",
  backgroundColor: "#0f172a",
  color: "#f1f5f9",
  zIndex: 1600,
  display: "flex",
  flexDirection: "column",
  boxShadow: "6px 0 32px rgba(0,0,0,0.55)",
  transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  overflowY: open ? "auto" : "hidden",
  overflowX: "hidden",
}));

/** Panel lateral de edición CMS; cubre el menú del layout (left: 0). */
export default function CmsPanelRoot({ open, panelLeft = 0, panelWidth = CMS_PANEL_WIDTH, children, ...rest }) {
  return (
    <StyledRoot open={open} panelleft={panelLeft} panelwidth={panelWidth} {...rest}>
      {children}
    </StyledRoot>
  );
}
