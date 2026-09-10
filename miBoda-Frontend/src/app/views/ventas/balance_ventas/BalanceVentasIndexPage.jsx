import React, { useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { Box, Card, CardContent, Typography, Tabs, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";
import ReporteMensual from "./ReporteMensual";
import ReporteTrimestral from "./ReporteTrimestral";
import ReporteAnual from "./ReporteAnual";

const PageWrapper = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
  padding: "24px",
});

const StyledCard = styled(Card)({
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
});

const BalanceVentasIndexPage = (props) => {
  const { accessButton } = UseAccesosObjetos();
  const { setLoading } = props;
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <PageWrapper>
      <StyledCard>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Balance de Ventas
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 3,
            }}
          >
            <Tab label="Mensual" />
            <Tab label="Trimestral" />
            <Tab label="Anual" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {tabValue === 0 && (
              <ReporteMensual setLoading={setLoading} accessButton={accessButton} />
            )}
            {tabValue === 1 && (
              <ReporteTrimestral setLoading={setLoading} accessButton={accessButton} />
            )}
            {tabValue === 2 && (
              <ReporteAnual setLoading={setLoading} accessButton={accessButton} />
            )}
          </Box>
        </CardContent>
      </StyledCard>
    </PageWrapper>
  );
};

export default injectIntl(WithLoandingPanel(BalanceVentasIndexPage));
