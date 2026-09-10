import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, TextField, Button, Paper } from "@mui/material";
import DataGrid, { Column, Paging, Pager } from "devextreme-react/data-grid";
import { styled } from "@mui/material/styles";
import {
  obtenerBalanceMensual,
  descargarReporteMensual,
} from "../../../api/balance_ventas.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import { useIntl } from "react-intl";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

const ReporteMensual = ({ setLoading, accessButton }) => {
  const intl = useIntl();
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [datos, setDatos] = useState([]);
  const [resumen, setResumen] = useState({
    total_ventas: 0,
    total_pedidos: 0,
    promedio_venta: 0,
  });

  const toNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === "") return defaultValue;
    const num = Number(value);
    return Number.isNaN(num) ? defaultValue : num;
  };

  const safeToFixed = (value, decimals = 2) => {
    const num = toNumber(value, 0);
    return num.toFixed(decimals);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const params = {
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
      };
      const response = await obtenerBalanceMensual(params);

      // Normalizamos los datos para evitar errores de tipo (string vs number)
      const datosNormalizados = (response?.datos || []).map((item, index) => {
        const normalizado = {
          ...item,
          total_ventas: toNumber(item.total_ventas, 0),
          promedio: toNumber(item.promedio, 0),
          cantidad_pedidos: toNumber(item.cantidad_pedidos, 0),
        };
        return normalizado;
      });

      setDatos(datosNormalizados);

      const resumenApi = response?.resumen || {
        total_ventas: 0,
        total_pedidos: 0,
        promedio_venta: 0,
      };

      setResumen({
        total_ventas: toNumber(resumenApi.total_ventas, 0),
        total_pedidos: toNumber(resumenApi.total_pedidos, 0),
        promedio_venta: toNumber(resumenApi.promedio_venta, 0),
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
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
      };
      const blob = await descargarReporteMensual(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance_ventas_mensual_${params.fecha_inicio}_${params.fecha_fin}.xlsx`);
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
            label="Fecha Inicio"
            type="date"
            value={fechaInicio.toISOString().split('T')[0]}
            onChange={(e) => setFechaInicio(new Date(e.target.value))}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Fecha Fin"
            type="date"
            value={fechaFin.toISOString().split('T')[0]}
            onChange={(e) => setFechaFin(new Date(e.target.value))}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
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
                Total Ventas
              </Typography>
              <Typography variant="h4" color="primary">
                S/ {safeToFixed(resumen.total_ventas, 2)}
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
                S/ {safeToFixed(resumen.promedio_venta, 2)}
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
          keyExpr="fecha"
          className={"dx-card wide-card balance-grid"}
          dataSource={datos}
          showBorders={false}
          columnAutoWidth={true}
          rowAlternationEnabled={true}
        >
          <Paging defaultPageSize={10} />
          <Pager showPageSizeSelector={true} showInfo={true} />

          <Column dataField={"fecha"} caption={"Fecha"} />
          <Column dataField={"cantidad_pedidos"} caption={"Pedidos"} alignment="right" />
          <Column
            dataField={"total_ventas"}
            caption={"Total Ventas (S/)"}
            alignment="right"
            calculateCellValue={(row) => {
              const valor = toNumber(row.total_ventas, 0);
              return `S/ ${valor.toFixed(2)}`;
            }}
          />
          <Column
            dataField={"promedio"}
            caption={"Promedio (S/)"}
            alignment="right"
            calculateCellValue={(row) => {
              const valor = toNumber(row.promedio, 0);
              return `S/ ${valor.toFixed(2)}`;
            }}
          />
        </DataGrid>
      </Paper>
    </Box>
  );
};

export default ReporteMensual;
