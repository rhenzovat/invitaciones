import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, TextField, Button, Paper, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import DataGrid, { Column, Paging, Pager } from "devextreme-react/data-grid";
import { styled } from "@mui/material/styles";
import {
  obtenerBalanceTrimestral,
  descargarReporteTrimestral,
} from "../../../api/balance_ventas.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { useIntl } from "react-intl";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

const ReporteTrimestral = ({ setLoading, accessButton }) => {
  const intl = useIntl();
  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(currentYear);
  const [trimestre, setTrimestre] = useState(1);
  const [datos, setDatos] = useState([]);
  const [resumen, setResumen] = useState({
    total_ventas: 0,
    total_pedidos: 0,
    promedio_venta: 0,
  });

  const trimestres = [
    { value: 1, label: "Q1 (Ene-Mar)" },
    { value: 2, label: "Q2 (Abr-Jun)" },
    { value: 3, label: "Q3 (Jul-Sep)" },
    { value: 4, label: "Q4 (Oct-Dic)" },
  ];

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const params = {
        anio: anio,
        trimestre: trimestre,
      };
      const response = await obtenerBalanceTrimestral(params);
      setDatos(response?.datos || []);
      setResumen(response?.resumen || {
        total_ventas: 0,
        total_pedidos: 0,
        promedio_venta: 0,
      });
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = async () => {
    setLoading(true);
    try {
      const params = {
        anio: anio,
        trimestre: trimestre,
      };
      const blob = await descargarReporteTrimestral(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance_ventas_trimestral_${anio}_Q${trimestre}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toastSuccess("Reporte descargado correctamente");
    } catch (err) {
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            label="Año"
            type="number"
            value={anio}
            onChange={(e) => setAnio(parseInt(e.target.value))}
            fullWidth
            inputProps={{ min: 2020, max: currentYear + 1 }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Trimestre</InputLabel>
            <Select
              value={trimestre}
              label="Trimestre"
              onChange={(e) => setTrimestre(e.target.value)}
            >
              {trimestres.map((q) => (
                <MenuItem key={q.value} value={q.value}>
                  {q.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={cargarDatos}
            sx={{ height: "56px" }}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={descargarReporte}
            sx={{ height: "56px" }}
          >
            Descargar Reporte
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Ventas Trimestre
              </Typography>
              <Typography variant="h4" color="primary">
                S/ {Number(resumen.total_ventas ?? 0).toFixed(2)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Pedidos
              </Typography>
              <Typography variant="h4" color="secondary">
                {resumen.total_pedidos || 0}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Promedio por Venta
              </Typography>
              <Typography variant="h4" color="success.main">
                S/ {Number(resumen.promedio_venta ?? 0).toFixed(2)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Paper
        sx={{
          mt: 2,
          mx: { xs: 1, sm: 2, md: 3 },
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <DataGrid
          keyExpr="mes"
          className={"dx-card wide-card balance-grid"}
          dataSource={datos}
          showBorders={false}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />

          <Column dataField={"mes"} caption={"Mes"} />
          <Column dataField={"cantidad_pedidos"} caption={"Pedidos"} alignment="right" />
          <Column
            dataField={"total_ventas"}
            caption={"Total Ventas (S/)"}
            alignment="right"
            calculateCellValue={(row) =>
              `S/ ${Number(row.total_ventas ?? 0).toFixed(2)}`
            }
          />
          <Column
            dataField={"promedio"}
            caption={"Promedio (S/)"}
            alignment="right"
            calculateCellValue={(row) =>
              `S/ ${Number(row.promedio ?? 0).toFixed(2)}`
            }
          />
        </DataGrid>
      </Paper>
    </Box>
  );
};

export default ReporteTrimestral;
