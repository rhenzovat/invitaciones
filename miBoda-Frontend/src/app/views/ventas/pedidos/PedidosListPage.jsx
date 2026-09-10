import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import { listarRepartidores } from "../../../api/usuario.api";
import DataGrid, {
  Column,
  Pager,
  Paging,
  FilterRow,
  Button as ColumnButton,
  SearchPanel,
} from "devextreme-react/data-grid";

// Icons
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import TagIcon from "@mui/icons-material/Tag";

// STYLED COMPONENTS
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#f0f4f8",
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(3),
  borderRadius: "16px",
  background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  boxShadow: "0 10px 40px rgba(30, 60, 114, 0.3)",
}));

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const HeaderIconWrapper = styled(Box)({
  width: "60px",
  height: "60px",
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(10px)",
  "& svg": {
    fontSize: "32px",
    color: "#fff",
  },
});

const StatsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: "wrap",
}));

const StatCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active, color }) => ({
  padding: "20px 24px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flex: "1 1 220px",
  minWidth: "220px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: active ? `${color}10` : "#fff",
  border: active ? `2px solid ${color}` : "2px solid transparent",
  boxShadow: active
    ? `0 8px 25px ${color}30`
    : "0 4px 20px rgba(0, 0, 0, 0.06)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 30px ${color}25`,
  },
}));

const StatIconWrapper = styled(Box)(({ color }) => ({
  width: "56px",
  height: "56px",
  borderRadius: "14px",
  backgroundColor: `${color}15`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "28px",
    color: color,
  },
}));

const DataGridWrapper = styled(Box)(({ theme }) => ({
  "& .dx-datagrid": {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "none",
  },
  "& .dx-datagrid-headers": {
    backgroundColor: "#f8fafc",
    borderBottom: "2px solid #e8ecf0",
  },
  "& .dx-header-row td": {
    fontWeight: 600,
    color: "#1e3c72",
    fontSize: "13px",
    padding: "16px 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  "& .dx-data-row td": {
    padding: "14px 12px",
    fontSize: "14px",
    borderBottom: "1px solid #f0f4f8",
  },
  "& .dx-row-alt > td": {
    backgroundColor: "#fafbfc",
  },
  "& .dx-datagrid-search-panel": {
    marginRight: "16px",
    "& .dx-texteditor": {
      borderRadius: "12px",
      border: "1px solid #e0e6ed",
      "&.dx-state-focused": {
        borderColor: "#1e3c72",
        boxShadow: "0 0 0 3px rgba(30, 60, 114, 0.15)",
      },
    },
  },
  "& .dx-datagrid-pager": {
    padding: "16px",
    backgroundColor: "#fafbfc",
    borderTop: "1px solid #e8ecf0",
  },
}));

const StatusChip = styled(Chip)(({ statuscolor }) => ({
  fontWeight: 600,
  fontSize: "11px",
  height: "26px",
  backgroundColor: `${statuscolor}15`,
  color: statuscolor,
  border: `1px solid ${statuscolor}40`,
  "& .MuiChip-icon": {
    color: statuscolor,
    fontSize: "14px",
  },
}));

const getEstadoConfig = (estado) => {
  const configs = {
    1: { color: "#ff9800", label: "Pedido recibido", icon: <PendingActionsIcon /> },
    2: { color: "#2196f3", label: "Pedido confirmado / Pago confirmado", icon: <CheckCircleIcon /> },
    3: { color: "#9c27b0", label: "Preparando pedido", icon: <InventoryIcon /> },
    4: { color: "#00bcd4", label: "Pedido listo", icon: <CheckCircleIcon /> },
    5: { color: "#00bcd4", label: "En camino", icon: <LocalShippingIcon /> },
    6: { color: "#4caf50", label: "Entregado", icon: <CheckCircleIcon /> },
    7: { color: "#f44336", label: "Cancelado o rechazado", icon: <CancelIcon /> },
  };
  return configs[estado] || { color: "#757575", label: "Desconocido", icon: <PendingActionsIcon /> };
};

const PedidosListPage = ({
  toolContadores = {},
  accessButton,
  puedeAsignarPedidos = false,
  onAsignarPedido,
  ...props
}) => {
  const [filtarProEnable, setFiltarProEnable] = useState(0);
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [pedidoAsignar, setPedidoAsignar] = useState(null);
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  /** Asignación del pedido al abrir el modal (solo lectura; no cambia al clicar filas). */
  const [resumenAsignacionPedido, setResumenAsignacionPedido] = useState(null);
  /** Usuario elegido en la tabla para la próxima guardada (resalta fila). */
  const [usuarioPendienteId, setUsuarioPendienteId] = useState("");

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = (evt) => {
    props.eliminarRegistro(evt.row.data, false);
  };

  const abrirModalAsignar = async (evt) => {
    const row = evt.row.data;
    setPedidoAsignar(row);
    const uidRaw =
      row.id_usuario != null && row.id_usuario !== "" ? row.id_usuario : null;
    const uid = uidRaw != null ? Number(uidRaw) : null;

    setUsuarioPendienteId(uid != null ? String(uid) : "");

    if (uid != null) {
      const nombre =
        (row.nombre_repartidor_asignado &&
          String(row.nombre_repartidor_asignado).trim()) ||
        "";
      setResumenAsignacionPedido({
        id: uid,
        nombre: nombre || `ID ${uid}`,
      });
    } else {
      setResumenAsignacionPedido(null);
    }

    setModalAsignarOpen(true);
    setCargandoUsuarios(true);
    try {
      const u = await listarRepartidores();
      const list = Array.isArray(u) ? u : [];
      setUsuariosLista(list);
      if (uid != null) {
        const found = list.find((x) => Number(x.id) === uid);
        if (found?.name) {
          setResumenAsignacionPedido((prev) =>
            prev && prev.id === uid
              ? { id: uid, nombre: found.name }
              : prev
          );
        }
      }
    } catch {
      setUsuariosLista([]);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const cerrarModalAsignar = () => {
    setModalAsignarOpen(false);
    setPedidoAsignar(null);
    setUsuarioPendienteId("");
    setResumenAsignacionPedido(null);
  };

  const quitarSeleccionResumen = () => {
    setResumenAsignacionPedido(null);
    setUsuarioPendienteId("");
  };

  const guardarAsignacion = async () => {
    if (!pedidoAsignar || !onAsignarPedido) return;
    try {
      await onAsignarPedido({
        id_pedido: pedidoAsignar.id_pedido,
        id_usuario:
          usuarioPendienteId === "" ? null : Number(usuarioPendienteId),
      });
      cerrarModalAsignar();
    } catch {
      // El padre ya muestra el error
    }
  };

  const mostrarColumnaAcciones =
    accessButton?.editar ||
    accessButton?.eliminar ||
    (accessButton?.pedido_asignar && puedeAsignarPedidos);

  const filtrarProductos = (isEtiqueta) => {
    setFiltarProEnable(isEtiqueta);
    props.setIsEstado(isEtiqueta);
  };

  const statsData = [
    {
      id: 1,
      label: "Órdenes Pendientes",
      count: toolContadores?.total_pendientes || 0,
      icon: <PendingActionsIcon />,
      color: "#ff9800",
    },
    {
      id: 4,
      label: "En Delivery",
      count: toolContadores?.total_deliverys || 0,
      icon: <LocalShippingIcon />,
      color: "#00bcd4",
    },
    {
      id: 6,
      label: "Entregados",
      count: toolContadores?.total_entregados || 0,
      icon: <CheckCircleIcon />,
      color: "#4caf50",
    },
    {
      id: 7,
      label: "Cancelados",
      count: toolContadores?.total_cancelados || 0,
      icon: <CancelIcon />,
      color: "#f44336",
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <HeaderCard elevation={0}>
        <HeaderLeft>
          <HeaderIconWrapper>
            <AssignmentIcon />
          </HeaderIconWrapper>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              {props.titulo}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Gestión y seguimiento de pedidos del minimarket
            </Typography>
          </Box>
        </HeaderLeft>
      </HeaderCard>

      {/* Stats Cards */}
      {accessButton?.pedido_detalle && (
        <StatsContainer>
          {statsData.map((stat) => (
            <StatCard
              key={stat.id}
              active={filtarProEnable === stat.id}
              color={stat.color}
              onClick={() => filtrarProductos(stat.id)}
              elevation={0}
            >
              <StatIconWrapper color={stat.color}>{stat.icon}</StatIconWrapper>
              <Box>
                <Typography variant="h4" fontWeight={700} color={stat.color}>
                  {stat.count}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Box>
            </StatCard>
          ))}
        </StatsContainer>
      )}

      {/* DataGrid */}
      <DataGridWrapper>
        <Paper sx={{ borderRadius: "16px", overflow: "hidden" }}>
          <Box
            p={2}
            bgcolor="#fff"
            borderBottom="1px solid #e8ecf0"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ShoppingCartIcon sx={{ color: "#1e3c72" }} />
              <Typography variant="h6" fontWeight={600} color="#1e3c72">
                Lista de Pedidos
              </Typography>
            </Box>
          </Box>

          <DataGrid
            keyExpr="RowIndex"
            dataSource={props.listarPedidos}
            showBorders={false}
            focusedRowEnabled={true}
            defaultFocusedRowIndex={0}
            columnAutoWidth={true}
            rowAlternationEnabled={true}
            showColumnLines={false}
          >
            <Paging defaultPageSize={10} />
            <Pager showPageSizeSelector={true} showInfo={true}
              infoText="Página {0} de {1} ({2} registros)"
            />
            <FilterRow visible={false} />
            <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar pedido..." />

            <Column
              dataField="id_pedido"
              caption="ID"
              width={70}
              alignment="center"
              cellRender={(data) => (
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="#1e3c72"
                  sx={{
                    backgroundColor: "#e8ecf0",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    display: "inline-block",
                  }}
                >
                  #{data.value}
                </Typography>
              )}
            />

            <Column
              dataField="created_at"
              caption="Fecha"
              width={110}
              dataType="date"
              format="dd/MM/yyyy"
              alignment="center"
              cellRender={(data) => (
                <Box display="flex" alignItems="center" gap={0.5} justifyContent="center">
                  <CalendarTodayIcon sx={{ fontSize: 14, color: "#9e9e9e" }} />
                  <Typography variant="body2">{data.text}</Typography>
                </Box>
              )}
            />

            <Column
              dataField="codigo_pedido"
              caption="Código"
              width={130}
              alignment="center"
              cellRender={(data) => (
                <Chip
                  label={data.value}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "#1e3c72",
                    color: "#fff",
                  }}
                />
              )}
            />

            <Column
              dataField="cliente_nombre"
              caption="Cliente"
              width="18%"
              cellRender={(data) => (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: "#667eea", width: 32, height: 32 }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" fontWeight={500}>
                    {data.value}
                  </Typography>
                </Box>
              )}
            />

            <Column
              dataField="nombre_repartidor_asignado"
              caption="Asignado"
              width="14%"
              cellRender={(data) => (
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {data.value || "—"}
                </Typography>
              )}
            />

            <Column
              dataField="codigo_producto"
              caption="Código"
              width={130}
              alignment="center"
              cellRender={(data) => (
                <Chip
                  label={data.value}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "#1e3c72",
                    color: "#fff",
                  }}
                />
              )}
            />
            <Column
              dataField="estado_descripcion"
              caption="Estado"
              width="14%"
              cellRender={(data) => {
                const estadoNum = data.data?.estado;
                const config = getEstadoConfig(estadoNum);
                return (
                  <StatusChip
                    icon={config.icon}
                    label={data.value || config.label}
                    statuscolor={config.color}
                    size="small"
                  />
                );
              }}
            />

            <Column
              dataField="direccion_envio_ubicacion"
              caption="Dirección"
              width="22%"
              cellRender={(data) => (
                <Box display="flex" alignItems="flex-start" gap={0.5}>
                  <LocationOnIcon sx={{ fontSize: 16, color: "#4caf50", mt: 0.2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "200px",
                    }}
                  >
                    {data.value}
                  </Typography>
                </Box>
              )}
            />

            <Column
              dataField="pro_cantidad"
              caption="Items"
              width={80}
              alignment="center"
              cellRender={(data) => (
                <Chip
                  icon={<InventoryIcon sx={{ fontSize: "14px !important" }} />}
                  label={data.value}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            />

            <Column
              dataField="pro_total"
              caption="Total"
              width={100}
              alignment="right"
              cellRender={(data) => (
                <Typography variant="body2" fontWeight={700} color="#2e7d32">
                  S/ {Number(data.value || 0).toFixed(2)}
                </Typography>
              )}
            />

            {mostrarColumnaAcciones && (
              <Column
                type="buttons"
                width={accessButton?.pedido_asignar && puedeAsignarPedidos ? 130 : 100}
                fixed={true}
                fixedPosition="right"
                caption="Acciones"
              >
                <ColumnButton
                  icon="taskcomplete"
                  hint="Ver detalles"
                  onClick={editarRegistro}
                  visible={!!accessButton?.editar}
                  cssClass="dx-button-success"
                />
                <ColumnButton
                  icon="user"
                  hint="Asignar a usuario"
                  onClick={abrirModalAsignar}
                  visible={!!accessButton?.pedido_asignar && puedeAsignarPedidos}
                />
                <ColumnButton
                  icon="trash"
                  hint="Eliminar"
                  onClick={eliminarRegistro}
                  visible={!!accessButton?.eliminar}
                  cssClass="dx-button-danger"
                />
              </Column>
            )}
          </DataGrid>
        </Paper>
      </DataGridWrapper>

      <Dialog
        open={modalAsignarOpen}
        onClose={cerrarModalAsignar}
        maxWidth="md"
        fullWidth
        disableEnforceFocus
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(30, 60, 114, 0.18)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <PersonAddIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#fff" lineHeight={1.2}>
                Asignar pedido a usuario
              </Typography>
              {pedidoAsignar && (
                <Box display="flex" alignItems="center" gap={0.8} mt={0.3}>
                  <TagIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                    Pedido #{pedidoAsignar.id_pedido}
                    {pedidoAsignar.codigo_pedido ? ` · ${pedidoAsignar.codigo_pedido}` : ""}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={cerrarModalAsignar}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.8)",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            p: 3,
            backgroundColor: "#f8fafc",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* Selection status bar */}
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              px: 2,
              py: 1.5,
              mb: 2.5,
              borderRadius: "12px",
              border: resumenAsignacionPedido
                ? "1.5px solid #1e3c7240"
                : "1.5px solid #e8ecf0",
              backgroundColor: resumenAsignacionPedido ? "#1e3c720a" : "#fff",
              transition: "all 0.25s ease",
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  backgroundColor: resumenAsignacionPedido ? "#1e3c7218" : "#f0f4f8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon
                  sx={{
                    fontSize: 18,
                    color: resumenAsignacionPedido ? "#1e3c72" : "#9e9e9e",
                  }}
                />
              </Box>
              <Box>
                {resumenAsignacionPedido ? (
                  <>
                    <Typography variant="body2" fontWeight={600} color="#1e3c72">
                      {resumenAsignacionPedido.nombre} · ID {resumenAsignacionPedido.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Asignación actual del pedido. La tabla solo define el cambio al
                      guardar.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      El pedido no tiene usuario asignado
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Elija un usuario en la tabla y pulse Guardar asignación
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            <Button
              size="small"
              variant={
                resumenAsignacionPedido || usuarioPendienteId ? "outlined" : "text"
              }
              color="error"
              onClick={quitarSeleccionResumen}
              disabled={!resumenAsignacionPedido && !usuarioPendienteId}
              startIcon={<CloseIcon />}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Quitar selección
            </Button>
          </Paper>

          {/* Table */}
          {cargandoUsuarios ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={6}
              gap={2}
            >
              <CircularProgress size={40} sx={{ color: "#1e3c72" }} />
              <Typography variant="body2" color="text.secondary">
                Cargando usuarios...
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: "14px",
                overflow: "visible",
                border: "1.5px solid #e8ecf0",
                "& .dx-datagrid": { fontSize: "13px", backgroundColor: "#fff" },
                "& .dx-datagrid-headers": {
                  backgroundColor: "#f0f4f8",
                  borderBottom: "2px solid #e0e6ed",
                },
                "& .dx-header-row td": {
                  fontWeight: 700,
                  color: "#1e3c72",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "12px 14px",
                },
                "& .dx-data-row td": {
                  padding: "11px 14px",
                  borderBottom: "1px solid #f0f4f8",
                },
                "& .dx-data-row:hover td": {
                  backgroundColor: "#1e3c720d !important",
                  cursor: "pointer",
                },
                "& .dx-pedido-asignar-row-selected td": {
                  backgroundColor: "#1e3c7218 !important",
                  color: "#1e3c72",
                  fontWeight: 600,
                },
                "& .dx-datagrid-search-panel": {
                  "& .dx-texteditor": {
                    borderRadius: "10px",
                    border: "1px solid #e0e6ed",
                    "&.dx-state-focused": {
                      borderColor: "#1e3c72",
                      boxShadow: "0 0 0 3px rgba(30,60,114,0.12)",
                    },
                  },
                },
                "& .dx-datagrid-pager": {
                  backgroundColor: "#f8fafc",
                  borderTop: "1px solid #e8ecf0",
                  padding: "10px 14px",
                  minHeight: 52,
                },
              }}
            >
              <DataGrid
                  keyExpr="id"
                  dataSource={usuariosLista}
                  height={400}
                  showBorders={false}
                  columnAutoWidth={true}
                  hoverStateEnabled={true}
                  focusedRowEnabled={false}
                  showColumnLines={false}
                  rowAlternationEnabled={true}
                  keyboardNavigation={{ enabled: false }}
                  onRowPrepared={(e) => {
                    if (e.rowType !== "data" || !e.data) return;
                    e.rowElement.classList.remove("dx-pedido-asignar-row-selected");
                    const sel =
                      usuarioPendienteId &&
                      String(e.data.id) === usuarioPendienteId;
                    if (sel) {
                      e.rowElement.classList.add("dx-pedido-asignar-row-selected");
                    }
                  }}
                  onRowClick={(e) => {
                    const id = e.data?.id;
                    if (id != null) setUsuarioPendienteId(String(id));
                  }}
                >
                  <SearchPanel visible={true} highlightCaseSensitive={true} placeholder="Buscar usuario..." />
                  <Paging defaultPageSize={8} />
                  <Pager
                    showPageSizeSelector={true}
                    allowedPageSizes={[5, 8, 15, 30]}
                    showInfo={true}
                    infoText="Página {0} de {1} ({2} usuarios)"
                  />
                  <Column
                    dataField="id"
                    caption="ID"
                    width={72}
                    alignment="center"
                    cellRender={(data) => (
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          backgroundColor: "#e8ecf0",
                          borderRadius: "6px",
                          px: 1,
                          py: 0.3,
                          color: "#1e3c72",
                          display: "inline-block",
                        }}
                      >
                        {data.value}
                      </Typography>
                    )}
                  />
                  <Column
                    dataField="name"
                    caption="Nombre"
                    minWidth={140}
                    cellRender={(data) => (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ bgcolor: "#667eea", width: 28, height: 28, fontSize: 12 }}>
                          {data.value?.charAt(0)?.toUpperCase() || "?"}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {data.value}
                        </Typography>
                      </Box>
                    )}
                  />
                  <Column dataField="email" caption="Correo" minWidth={180} />
                </DataGrid>
            </Paper>
          )}
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#fff", gap: 1 }}>
          <Button
            onClick={cerrarModalAsignar}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e0e6ed",
              color: "#546e7a",
              "&:hover": { borderColor: "#b0bec5", backgroundColor: "#f5f7f9" },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={guardarAsignacion}
            disabled={cargandoUsuarios || !onAsignarPedido}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              boxShadow: "0 4px 15px rgba(30, 60, 114, 0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #16306a 0%, #1e428a 100%)",
                boxShadow: "0 6px 20px rgba(30, 60, 114, 0.45)",
              },
              "&:disabled": { opacity: 0.6 },
            }}
          >
            Guardar asignación
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PedidosListPage;
