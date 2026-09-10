import Box from "@mui/material/Box";
import styled from "@mui/material/styles/styled";

import { Span } from "./Typography";
import { MatxLogo } from "app/components";
import useSettings from "app/hooks/useSettings";
import { Link } from "react-router-dom";
// STYLED COMPONENTS
const BrandRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 18px 20px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  marginBottom: "8px"
}));

const StyledSpan = styled(Span)(({ mode }) => ({
  fontSize: 15,
  fontWeight: 600,
  marginLeft: ".6rem",
  display: mode === "compact" ? "none" : "block",
  color: "#ffffff",
  letterSpacing: "0.5px",
  textTransform: "uppercase"
}));

const VersionBadge = styled("span")(() => ({
  fontSize: 10,
  fontWeight: 500,
  padding: "2px 6px",
  borderRadius: "4px",
  marginLeft: "8px",
  background: "rgba(74, 222, 128, 0.2)",
  color: "#4ade80",
  verticalAlign: "middle"
}));

export default function Brand({ children }) {
  const { settings } = useSettings();
  const leftSidebar = settings.layout1Settings.leftSidebar;
  const { mode } = leftSidebar;

  return (
    <BrandRoot>
      <Link to="/dashboard/default">
        <Box display="flex" alignItems="center">
          <MatxLogo />
          <StyledSpan mode={mode} className="sidenavHoverShow idRef9556151">
            {import.meta.env.VITE_APP_NAME}
            <VersionBadge>{import.meta.env.VITE_APP_VERSION}</VersionBadge>
          </StyledSpan>
        </Box>
      </Link>
      <Box className="sidenavHoverShow" sx={{ display: mode === "compact" ? "none" : "block" }}>
        {children || null}
      </Box>
    </BrandRoot>
  );
}
